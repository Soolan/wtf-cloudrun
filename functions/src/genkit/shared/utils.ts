import {getFirestore} from "firebase-admin/firestore";
import {Balance, Transaction} from "../../shared/interfaces";
import {Currency, TxStatus, TxType} from "../../shared/enums";
import {getTagByUid} from "../../utils/getTagByUid";
import {COMPANIES, TRANSACTIONS} from '../../shared/constants';

export function getUsage(usage: any) {
  const promptTokens = usage?.inputTokens || 0;
  const completionTokens = usage?.outputTokens || 0;
  // totalTokens is the sum of prompt and completion tokens. No need to add them manually.
  const totalTokens = usage?.totalTokens || promptTokens + completionTokens;
  console.log(usage, promptTokens, completionTokens, totalTokens);
  return totalTokens;
}

export async function saveTx(path: string, balance: Balance, memo: string = ''): Promise<void> {
  const txPath = path.split(COMPANIES.path)[0] + TRANSACTIONS.path;  // i.e. profiles/{profileId}/transactions
  const profileId = path.split("/")[1];
  const tag = await getTagByUid(profileId) || 0;
  const db = getFirestore();
  const tx = getDTO(balance, tag, memo);
  await db.collection(txPath).add(tx);
}

function getDTO(balance: Balance, tag: number, memo: string): Transaction {
  return {
    type: balance.currency === Currency.AI? TxType.AiUsage: TxType.GBUsage,
    from: tag,
    to: 2,
    balance: {
      currency: balance.currency,
      amount: -balance.amount,
    },
    timestamp: Date.now(),
    status: TxStatus.Completed,
    memo,
  }
}
