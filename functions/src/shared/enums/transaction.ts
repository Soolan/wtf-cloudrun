export enum TxType {
  Payment = 'payment',    // Pay for anything inside the WTF ecosystem (i.e. from tag to tag)
  Deposit = 'deposit',    // Topup an account in WTF ecosystem from outside wallet
  Withdraw = 'withdraw',
  Refund = 'refund',
  Swap = 'swap',
  Stake = 'stake',
  Unstake = 'unstake',
  AMMDeposit = 'amm-deposit',
  AMMWithdraw = 'amm-withdraw',
  AiUsage = 'ai-usage',
  GBUsage = 'gb-usage',
  Reward = 'reward',
}

export enum WalletType {
  Cold = 'cold',
  Warm = 'warm',
  Hot = 'hot',
  Faucet = 'faucet',
  User = 'user',
  Burner = 'burner',
  Stake1 = 'stake1',
  Stake3 = 'stake3',
  Stake6 = 'stake6',
  Stake12  = 'stake12',
  Stake24 = 'stake24',
  Presale = 'presale',
  Growth = 'growth',
  Community = 'community',
  CexListing = 'cexListing',
  AmmPools = 'amm-pools',
  Reserved = 'reserved',
}

export enum TxStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  UnderReview = 'underReview',
  Rejected  = 'rejected',
  Completed  = 'completed',
}
