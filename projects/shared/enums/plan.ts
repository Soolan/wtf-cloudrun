export enum Plan {
  Free = 'free',
  Basic = 'basic',
  Pro = 'pro',
}

export enum BillingCycle {
  Monthly = 'monthly',
  Annually = 'annually',
}

export enum PlanChangeReason {
  UPGRADE = 'upgrade',
  DOWNGRADE = 'downgrade',
  EXPIRED = 'expired',
  TRIAL_STARTED = 'trial started',
  TRIAL_ENDED = 'trial ended',
  ADMIN_ADJUSTMENT = 'admin adjustment',
  BILLING_FAILURE = 'billing failure',
  OTHER = 'other'
}
