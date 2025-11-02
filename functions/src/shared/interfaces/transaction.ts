import {Currency, TxStatus, TxType} from '../enums';

export interface Transaction {
  type: TxType;
  // from and to are tag numbers within WTF ecosystem
  // 0: Cold Wallet   1: Warm Wallet   2: Hot Wallet
  // 10: Burner Wallet
  // 11: Staking 1month
  // 12: Staking 3months
  // 13: Staking 6months
  // 14: Presale's Wallet
  // 1000: Faucet Wallet
  // 1xxx: User WTF Account Tag Number
  from?: number;  // For Ai token consumption scenario: 1xxx -> 20
  to?: number;    // When user subscribes to or renews a plan: 20 -> 1xxx (after fromAddress [VISA-XXXX] -> toAddress [our payment gateway])
  balance: Balance;
  timestamp: number;
  memo?: string;
  // fromAddress and toAddress can be xrpl addresses, credit/debit cards, bank accounts, wire transfers... i.e.
  // [xrpl address] xx...xx: wallet address
  // [cards] MSTR-XXXX: User MasterCard   VISA-XXXX: User Visa   AMEX-XXXX: User American Express
  fromAddress?: string;
  toAddress?: string;
  hash?: string;
  status?: TxStatus;
}
//    SCENARIO                                            from/to
// user crypto wallet <-> another user crypto wallet      Another User's Tag number (green/orange)
// user crypto wallet <-> hot wallet                      "Write The Future" (green/orange)
// user crypto wallet <- Faucet wallet                    "FAUCET" (green)
// user crypto wallet <-> external crypto wallet          public address (green/orange)
// user cash wallet <-> hot wallet                        "Write The Future" (green/orange)
// user cash wallet <-> Credit/Debit Card, bank account   Credit/Debit Card, bank account (green/orange)

export interface Balance {
  currency: Currency;
  amount: number;
}

export interface TransactionWithId extends Transaction {
  id: string;
}
/* Transaction Scenarios
  1.Deposit from an external crypto wallet to user's crypto wallet
    Requirement: Deposits should be made to Cold Wallet, and they have to mention the destination Tag number

    Process:
    Upon the successful transaction, The cloud run listener will process the transaction
    and update the balances while recording transactions.

    Balances:
    - stats/cold-wallet balance will be increased by the tx balance (i.e. currency and amount)
    - stats/hot-wallet balance will be decreased by the tx balance (i.e. currency and amount)
    - profile/userId balance associated with tx Tag will be increased (i.e. currency and amount)

    New Transactions will be added with the following tx details.
    - stats/cold-wallet/transactions/txId
    - stats/hot-wallet/transactions/txId
    - profile/userId/transactions/txId
          type: Deposit
          from: null
          to: user tag (i.e. 1123)
          balance: 1280 wtf
          timestamp: date
          memo?: whatever they want to say
          fromAddress?: rxxxxxxxx;
          toAddress?: rKtHLZA5oJkuFLHkqyo1KE6LS5pxjNHGmU //cold wallet
          hash?: hash
          status?: confirmed

     Important: It is the component's job to interpret the tx details and
     display a meaningful and human-readable tx details for each party.

  2.Withdrawal from user's crypto wallet to an external crypto wallet
    Requirement: Withdrawals should be made from Hot Wallet and toAddress is mandatory

    Process:
    Upon the successful transaction, the following balances will be updated and new transactions will be added.

    Balances:
    - profile/userId balance associated with tx Tag will be decreased (i.e. currency and amount)
    - stats/hot-wallet balance will be increased by the tx balance (i.e. currency and amount)
    - stats/hot-wallet balance will be decreased by the tx balance (i.e. currency and amount)

    New Transactions will be added with the following tx details. (What changes is just the balances)
    All fields for these three tx are the same.
    - profile/userId/transactions/txId
    - stats/hot-wallet/transactions/txId
    - stats/hot-wallet/transactions/txId
          type: Withdrawal
          from: xxxx //user tag. i.e. 1230
          to: xxxxxxxxxx // external user tag. i.e. 53299911
          balance: 1280 wtf
          timestamp: date
          memo?: whatever they want to say
          fromAddress?: r983A2spoWAkRLUcnMU6NYv5mdpEgU1Kca // hot wallet
          toAddress?: rxxxxxxxxxxxxxxxxx //external address
          hash?: hash
          status?: confirmed

     Important: It is the component's job to interpret the tx details and
     display a meaningful and human-readable tx details for each party.

  3.Deposit from an external cash wallet (credit card, wire transfer) to user's cash wallet:
    Same as Crypto

  4.Withdrawal from user's cash wallet (credit card, wire transfer) to an external cash wallet
    Same as Crypto
*/
