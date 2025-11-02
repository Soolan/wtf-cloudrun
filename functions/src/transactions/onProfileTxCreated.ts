import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { getFirestore } from "firebase-admin/firestore";
import {Transaction, TransactionWithId} from "../shared/interfaces";
import {Currency} from "../shared/enums";
import {logger} from "firebase-functions";
import {db} from '../shared/firebase';

// The flow:
//   1. It all starts with a new tx created under profileId. (Doc should be added by the client - Angular)
//   2. Balances for both user and the hot wallet gets updated automatically (By triggering the firestore create)
//   3. A mirrored tx with the same txId is created under: stats/hot-wallet/transactions/{same-id}
export const onProfileTxCreated = onDocumentCreated(
  "profiles/{profileId}/transactions/{txId}",
  async (event) => {
    const tx = event.data?.data() as Transaction;
    const profileId = event.params.profileId;

    if (!tx || !tx.balance?.currency) {
      console.warn("Invalid transaction data");
      return;
    }

    try {
      await applyAtomicBalanceUpdate(`profiles/${profileId}`, tx);

      // If it's an AI or WTF token, also update the "hot wallet"
      const isToken = [Currency.AI, Currency.WTF].includes(tx.balance.currency);
      if (isToken) {
        const reverseTx: Transaction = {
          ...tx,
          balance: { ...tx.balance, amount: -tx.balance.amount }, // reverse amount
        };
        await applyAtomicBalanceUpdate("stats/hot-wallet", reverseTx);
      }
      logger.info(`Balance: ${tx.balance.amount} ${tx.balance.currency}, Profile: ${profileId}`);

      const txWithId: TransactionWithId = {id: event.params.txId, ...tx};
      logger.info(`Mirror tx created on hot wallet. TxId: ${event.params.txId}`);

      await setHotWalletTx(txWithId);
    } catch (err) {
      logger.error(`[TX] Failed for profile ${profileId}:`, err);
    }
  }
);

async function applyAtomicBalanceUpdate(docPath: string, tx: Transaction): Promise<void> {
  const ref = db.doc(docPath);

  await db.runTransaction(async (firestoreTx) => {
    const snap = await firestoreTx.get(ref);
    if (!snap.exists) throw new Error(`Doc ${docPath} not found`);

    const data = snap.data();
    const balances = Array.isArray(data?.balances) ? [...data.balances] : [];
    const i = balances.findIndex(b => b.currency === tx.balance.currency);
    if (i === -1) throw new Error(`Balance for ${tx.balance.currency} not found`);

    const newAmount = balances[i].amount + tx.balance.amount;
    if (newAmount < 0) throw new Error(`Insufficient ${tx.balance.currency} balance at ${docPath}`);

    balances[i].amount = newAmount;
    firestoreTx.update(ref, { balances });
  });
}

async function setHotWalletTx(tx: TransactionWithId): Promise<void> {
  const db = getFirestore();
  await db.doc(`stats/hot-wallet/transactions/${tx.id}`).set({
    ...tx,
    balance: {
      currency: tx.balance.currency,
      amount: -tx.balance.amount, // mirrored
    }
  });
}
