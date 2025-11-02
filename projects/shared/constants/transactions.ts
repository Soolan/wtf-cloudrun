import {Transaction, WtfQuery} from '@shared/interfaces';
import {Currency, TxStatus, TxType} from '@shared/enums';
import {PRO_AI_MONTHLY_CREDIT, PRO_GB_CREDIT} from '@shared/constants/subscriptions';

export const TRANSACTIONS: WtfQuery = {
  path: 'transactions',
  limit: 100,
  where: {field: 'timestamp', operator: '!=', value: null},
  orderBy: {field: 'timestamp', direction: 'desc'}
};

export const TRIAL_AI_TX: Transaction = {
  type: TxType.Deposit,
  // from and to are tag numbers within WTF ecosystem
  // 0: Cold Wallet   1: Warm Wallet   2: Hot Wallet
  // 10: Burner Wallet
  // 11: Staking 1month
  // 12: Staking 3months
  // 13: Staking 6months
  // 14: Presale's Wallet
  // 20: AI tokens - Do we really need this? To me, it seems we can simply add the AI currency to, say, hot wallet
  // 1000: Faucet Wallet
  // 1xxx: User WTF Account Tag Number
  from: 2,  // Hot Wallet
  to: undefined,    // they are registering just now and we don't know their tags yet
  balance: PRO_AI_MONTHLY_CREDIT,
  timestamp: Date.now(),
  memo: 'Free AI credits for Pro trial period.',
  status: TxStatus.Completed
}

export const TRIAL_GB_TX: Transaction = {
  type: TxType.Deposit,
  // from and to are tag numbers within WTF ecosystem
  // 0: Cold Wallet   1: Warm Wallet   2: Hot Wallet
  // 10: Burner Wallet
  // 11: Staking 1month
  // 12: Staking 3months
  // 13: Staking 6months
  // 14: Presale's Wallet
  // 20: AI tokens - Do we really need this? To me, it seems we can simply add the AI currency to, say, hot wallet
  // 1000: Faucet Wallet
  // 1xxx: User WTF Account Tag Number
  from: 2,  // Hot Wallet
  to: undefined,    // they are registering just now and we don't know their tags yet
  balance: {currency: Currency.GB, amount: PRO_GB_CREDIT},
  timestamp: Date.now(),
  memo: 'Free disk space for Pro trial period.',
  status: TxStatus.Completed
}

export const STATS_COLLECTION: string = 'stats';
export const HOT_WALLET_DOC: string = 'hot_wallet';
export const LAST_TAG: string = 'last-tag';

export const WALLET_TYPE_LABELS: Record<number, string> = {
  0: 'Cold Wallet',
  1: 'Warm Wallet',
  2: 'Hot Wallet',
  10: 'Burner Wallet',
  11: 'Staking 1month',
  12: 'Staking 3months',
  13: 'Staking 6months',
  14: "Presale's Wallet",
  1000: 'Faucet Wallet',
};
