import {Balance, Social, Timestamps} from '@shared/interfaces';
import {Loyalty, Theme, ProcessNodeStatus, BillingCycle, Plan, AuthType, PlanChangeReason} from '@shared/enums';

export interface Profile {
  display_name: string;
  firstname: string;
  lastname: string;
  avatar: string;
  biography?: string;
  tag: number;

  // Ownership and plan
  currentPlan: CurrentPlan;
  planHistory?: PlanChange[];
  billingId?: string;
  defaultCompanyId?: string;

  // Preferences
  language?: string;
  theme?: Theme;
  socials?: Social[];

  // Rewards / gamification
  balances?: Balance[];
  loyalty?: Loyalty;
  achievements?: number[];

  // Security
  security: Security;
  suspended: boolean;
  verified?: boolean;

  // System meta
  lastLogin?: number;
  sendMe: SendMe;
  isAdmin: boolean;
  timestamps: Timestamps;
}

export interface ProfileWithId extends Profile {
  id: string;
}

export interface PlanChange {
  from: Plan;           // Previous plan tier
  to: Plan;             // New plan tier
  reason: PlanChangeReason; // Upgrade, downgrade, or system action
  timestamp: number;             // Unix timestamp (ms)
  performedBy: string;      // profileId or 'system'
  notes?: string;           // Optional comment or description
}

export interface CurrentPlan {
  plan: Plan;
  billingCycle: BillingCycle;
  billingDate: number;
  autoRenew: boolean;
}
  // To simplify the calculations, we want to set the billing date at the beginning of each month.

  // Billing cycles:
  // If it billed once annually, next billing date will be same date next year,
  // If it billed monthly, next billing date will be the 1st day of each month.
  // For monthly billing, if they join any day other than 1st in each month,
  // we will charge them using the following formula:
  // ((days in the current month - day of the month) / month) * monthly fee
  // For example, assuming they subscribed to pro monthly plan in 8th of March:
  // ((31 - 8)/31) * 1000 = 23/31 * 1000 = $742

  // A cloud function updates the next billing date, when one of these events happen:
  // receiving a new subscription/cancellation/upgrade/downgrade.

  // The first month of new subscriptions is calculated as follows:
  //  - Monthly Basic/Pro:
  //    ((days in the current month - day of the month) / month) * ($100 or $1,000, Basic or Pro monthly fee)
  //  - Annual Basic/Pro:
  //    ((days in the current month - day of the month) / month) * ($1,000 or $10,000, Basic or Pro annual fee)
  //  The rest of the term proceeds based on the next billing date

  // Cancellation (Switch back to free plan):
  //   Monthly billing:
  //     1. They use till the end of current month
  //     2. Starting from the next month they will be on free plan.
  //     3. Next billing date set to 0

  //   Annual billing:
  //     1. They will be charged and use till the end of current month.
  //     2. The remaining credit will be calculated and ready to be refunded to their bank account.
  //     3. Starting from the next month they will be on free plan.
  //     4. Next billing date set to 0

  // Upgrades/Downgrades
  //   Current plan will be updated, next billing cycle will be updated, and they will be charged/refunded accordingly.
  //   Scenario 1. Same plan, upgraded billing cycle
  //   i.e. Plan: Monthly Basic - Upgraded to: Annual Basic
  //    - Current month continues (i.e. till end of March 2025).
  //    - 12 months billing amount is charged, dated beginning of the next month (April 1st, 2025).
  //    - Next billing cycle will be the same date next year (April 1st, 2026).

  //   Scenario 2. Same plan, downgraded billing cycle
  //   i.e. Plan: Annual Basic - Downgraded to: Monthly Basic
  //    - Current month continues (i.e. till end of March 2025).
  //    - 1 month billing amount will be charged for the next month (April 1st, 2025).
  //    - User is refunded with the remaining credits till the end of previous billing cycle.
  //    - Next billing cycle: beginning of 2 months from now (May 1st, 2025)

  //   Scenarios 3 and 4. Similar to Scenarios 1 and 2 but with Pro plan.
  //    - Exactly the same as Scenarios 1 and 2

  //   Scenario 5. Upgraded plan, same billing cycle (monthly)
  //   i.e. Plan: Monthly Basic - Upgraded to: Monthly Pro
  //    - Plan upgrades
  //    - Remaining days billing amount is charged using the formula:
//        ((days in the current month - day of the month) / month) * ($1000, Pro monthly fee)
//        - MINUS
//        ((day of the month) / month) * ($100, Basic monthly fee)
  //    - Next billing date stays the same

  //   Scenario 6. Upgraded plan, same billing cycle (annually)
  //   i.e. Plan: Annual Basic - Upgraded to: Annual Pro
  //    - Plan upgrades
  //    - Remaining days billing amount is charged using the formula:
  //        ((days in the current month - day of the month) / month) * ($1000, Pro monthly fee)
  //    - Next billing date is set to same date next year (Apr 1st, 2026)
  //    - 12 months charged ($10,000) for the next term with starting date set to the beginning of next month (Apr 1st, 2025)

  //   Scenario 7. Downgraded plan, same billing cycle (monthly)
  //   plan: Monthly Pro - Downgraded to: Monthly Basic
  //    - Plan downgrades
  //    - Remaining days billing amount is charged using the formula:
  //        ((days in the current month - day of the month) / month) * monthly fee
  //    - Next billing date stays the same
  //    - User is refunded with the remaining credits till the end of previous billing cycle.

  //   Scenario 8. Downgraded plan, same billing cycle (annually)
  //   i.e. Plan: Annual Pro - Downgraded to: Annual Basic
  //    - Plan downgrades
  //    - Remaining days billing amount is charged using the formula:
  //        ((days in the current month - day of the month) / month) * ($1000, Pro monthly fee)
  //    - Next billing date is set to same date next year (Apr 1st, 2026)
  //    - 12 months charged ($1,000) for the next term with starting date set to the beginning of next month (Apr 1st, 2025)

  //   Scenario 9. Upgraded plan, upgraded billing cycle
  //   i.e. Plan: Monthly Basic - Upgraded to: Annual Pro
  //    - Plan upgrades
  //    - Remaining days billing amount is charged using the formula:
  //        ((days in the current month - day of the month) / month) * ($1000, Pro monthly fee)
  //    - 12 months charged ($10,000) for the next term with starting date set to the beginning of next month (Apr 1st, 2025)
  //    - Next billing date is set to same date next year (Apr 1st, 2026)

  //   Scenario 10. Downgraded plan, downgraded billing cycle
  //   i.e. Plan: Annual Pro - Downgraded to: Monthly Basic
  //    - Plan downgrades
  //    - Remaining days billing amount is charged using the formula:
  //        ((days in the current month - day of the month) / month) * monthly fee
  //    - User is refunded with the remaining credits till the end of previous billing cycle.
  //    - Next billing date will be the beginning of the next month (April 1st, 2025)

  //   In their console, separate logic will be applied on the features and usages



// when user who has a company logs in, he can access his personal profile or company profile
//    - add companies: Creator[]; field to the profile or create the company model

// as such he needs the profile id for the company
// in the company profile page, the company name will be displayed
//    - user can edit the company profile
//        if (user.profileId === company.members[0].id && user.companies.includes(company.profileId)
//    - user can view/remove himself from the company profile
//        if (user.companies.includes(company.profileId)
// the PERSONAL tab will be replaced with COMPANY tab where you can edit the name descriptions and domain settings
// the ACHIEVEMENTS tab will be replaced MEMBERS tab where you can view/add/remove all the members of the company
// On the profiles collection, the companies won't have artworks, achievements or transactions sub collections
// they won't have courses or notifications either
// all transactions and notifications related to a course created under a company will be directed to the admin
// and (if a member of a company was the creator of the course) he will receive a cc as well

export interface SendMe {
  email: boolean;
  newsletter: boolean;
  notification: boolean;
}

export interface Security {
  private: boolean;
  emailSafetyCode: string;
  pinCode: string;
  mobile: string;
  twoFA: TwoFA;
  ipTracking: IpTracking[];
}

export interface TwoFA {
  paired: boolean;
  active: boolean;
}

export interface IpTracking {
  when: number;
  ip: string;
}

export interface Course {
  name: string;
  info: Info;
  finalExam: FinalExam;
  paid?: string;
}

export interface Lesson {
  paid?: string;// for paid final-exam
  try?: number; // for paid final-exam
  name: string;
  current_slide: number;
  info: Info;
}

export interface Info {
  status: ProcessNodeStatus;
  score: number;
  updated_at: number;
}

export interface FinalExam {
  grade: number;
  certId: string;
  nftAddress: string;
  timestamp: number;
}

export interface Artwork {
  name: string;
  prompt?: string;
  url: number;
  views: number;
  likes: number;
  timestamps: Timestamps;
  zineId?: string;
  rank?: number;
}

export interface Purchase {
  txId: string;
  itemId: string;
  timestamp: number;
}

export interface PublicProfile {
  firstName: string;
  lastName: string;
  displayName: string;
  avatar: string;
  joinedAt: number;
}
