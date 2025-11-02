import {Balance, PlanFeature, Subscription} from '../interfaces';
import {Currency, Plan} from '../enums';

// Omit construct a type with the properties of T except for those in type K.
export const BASE_FEATURES: Omit<PlanFeature, 'quantity'>[] = [
  {name: 'Companies', description: 'Companies per account.'},
  {name: 'Members', description: 'Team members per company.'},
  {name: 'API Integration', description: 'API integrations per company.'},
  {name: 'Storage', description: 'Max storage for all contents per account.'},
  {name: 'Tickets', description: 'Max active tickets per month per account.'},
  {name: 'BPMN V2', description: 'Max BPMN charts per company.'},
  {name: 'Import/export', description: 'Import/export tasks to other Kanban apps (Jira, Trello, ...)'},
  {name: 'Monthly Credits', description: 'Free credits per month per account (Unused credits expire).'},
  {name: 'Extra Credits', description: 'Extra credit fee per month.'}
];

export const PLAN_QUANTITIES: Record<Plan, Record<string, string>> = {
  [Plan.Free]: {
    'Companies': '1',
    'Members': '3',
    'API Integration': '3',
    'Storage': '500 MB',
    'Tickets': '10',
    'BPMN V2': '-',
    'Import/export': '-',
    'Monthly Credits': '5,000',
    'Extra Credits': '$0.1/cred',
  },
  [Plan.Basic]: {
    'Companies': '2',
    'Members': '15',
    'API Integration': '10',
    'Storage': '2 GB',
    'Tickets': '60',
    'BPMN V2': '10',
    'Import/export': 'Yes',
    'Monthly Credits': '25,000',
    'Extra Credits': '$0.05/cred',
  },
  [Plan.Pro]: {
    'Companies': '3',
    'Members': '50',
    'API Integration': '30',
    'Storage': '1 TB',
    'Tickets': 'Unlimited',
    'BPMN V2': 'Unlimited',
    'Import/export': 'Yes',
    'Monthly Credits': '200,000',
    'Extra Credits': '$0.01/cred',
  }
};

export const FREE_MONTHLY_CREDIT: Balance = {currency: Currency.AI, amount: 5000};
export const BASIC_MONTHLY_CREDIT: Balance = {currency: Currency.AI, amount: 25000};
export const PRO_MONTHLY_CREDIT: Balance = {currency: Currency.AI, amount: 200000};

export const PLAN_FEES: Record<Plan, { currency: Currency; amount: number }[]> = {
  [Plan.Free]: [
    {currency: Currency.XRP, amount: 0},
    {currency: Currency.WTF, amount: 0},
    {currency: Currency.USD, amount: 0},
    {currency: Currency.IDR, amount: 0},
  ],
  [Plan.Basic]: [
    {currency: Currency.XRP, amount: 50},
    {currency: Currency.WTF, amount: 1000},
    {currency: Currency.USD, amount: 100},
    {currency: Currency.IDR, amount: 1600000},
  ],
  [Plan.Pro]: [
    {currency: Currency.XRP, amount: 500},
    {currency: Currency.WTF, amount: 10000},
    {currency: Currency.USD, amount: 1000},
    {currency: Currency.IDR, amount: 16000000},
  ],
};

export const AI_SUBSCRIPTIONS: Subscription[] =
  (Object.values(Plan) as Plan[]).map((plan): Subscription => ({
    type: plan,
    fee: PLAN_FEES[plan],
    features: BASE_FEATURES.map(f => ({
      ...f,
      quantity: PLAN_QUANTITIES[plan][f.name] ?? '-'
    }))
  }));

export const UPGRADE_GRACE_PERIOD_HOURS = 24;

// 12 scenarios for upgrades and downgrades: 4 * (4-1) = 12
export const MONTHLY_BASIC_TO_ANNUALLY_BASIC: string[] = [
  'Current plan stays active until the end of this month [END_OF_THIS_MONTH].',
  'Annual payment of [BASIC_ANNUAL_FEE] is charged dated on [START_OF_NEXT_MONTH].',
  'Next renewal will be one year later on [NEXT_BILLING_DATE].',
];

export const MONTHLY_PRO_TO_ANNUALLY_PRO: string[] = [
  'Current plan stays active until the end of this month [END_OF_THIS_MONTH].',
  'Annual payment of [PRO_ANNUAL_FEE] is charged dated on [START_OF_NEXT_MONTH].',
  'Next renewal will be one year later on [NEXT_BILLING_DATE].',
];

export const ANNUALLY_BASIC_TO_MONTHLY_BASIC: string[] = [
  'Current plan stays active until the end of this month [END_OF_THIS_MONTH].',
  'Monthly payment of [BASIC_MONTHLY_FEE] is charged dated on [START_OF_NEXT_MONTH].',
  'Next renewal will be in two months from now on [NEXT_BILLING_DATE].',
  'A total amount of [REFUNDABLE] will be refunded to your nominated bank account upon your approval.'
];

export const ANNUALLY_PRO_TO_MONTHLY_PRO: string[] = [
  'Current plan stays active until the end of this month [END_OF_THIS_MONTH].',
  'Monthly payment of [PRO_MONTHLY_FEE] is charged dated on [START_OF_NEXT_MONTH].',
  'Next renewal will be in two months from now on [NEXT_BILLING_DATE].',
  'A total amount of [REFUNDABLE] will be refunded to your nominated bank account upon your approval.'
];

export const MONTHLY_BASIC_TO_MONTHLY_PRO: string[] = [
  'Your plan is upgraded to Pro, effective immediately.',
  'For remaining days of this month, you will be charged [REMAINING_DAYS_FEE].',
  'Next billing date stays the same [NEXT_BILLING_DATE].'
];

export const ANNUALLY_BASIC_TO_ANNUALLY_PRO: string[] = [
  'Your plan upgrades to Pro, effective immediately.',
  'For remaining days of this month, you will be charged [REMAINING_DAYS_FEE].',
  'Annual payment of [PRO_ANNUAL_FEE] is charged dated on [START_OF_NEXT_MONTH].',
  'Next renewal will be one year later on [NEXT_BILLING_DATE].',
];

export const MONTHLY_PRO_TO_MONTHLY_BASIC: string[] = [
  'Your plan downgrades to Basic, effective immediately.',
  'For remaining days of this month, you will be charged [REMAINING_DAYS_FEE].',
  'Next billing date stays the same [NEXT_BILLING_DATE].',
  'A total amount of [REFUNDABLE] will be refunded to your nominated bank account upon your approval.'
];

export const ANNUALLY_PRO_TO_ANNUALLY_BASIC: string[] = [
  'Your plan downgrades to Basic, effective immediately.',
  'For remaining days of this month, you will be charged [REMAINING_DAYS_FEE].',
  'Next billing date stays the same [NEXT_BILLING_DATE].',
  'A total amount of [REFUNDABLE] will be refunded to your nominated bank account upon your approval.'
];

export const MONTHLY_BASIC_TO_ANNUALLY_PRO: string[] = [
  'Your plan upgrades to Pro, effective immediately.',
  'For remaining days of this month, you will be charged [REMAINING_DAYS_FEE].',
  'Annual payment of [PRO_ANNUAL_FEE] is charged dated on [START_OF_NEXT_MONTH].',
  'Next renewal will be one year later on [NEXT_BILLING_DATE].',
];

export const ANNUALLY_PRO_TO_MONTHLY_BASIC: string[] = [
  'Your plan downgrades to Basic, effective immediately.',
  'For remaining days of this month, you will be charged [REMAINING_DAYS_FEE].',
  'Monthly payment of [BASIC_MONTHLY_FEE] is charged dated on [START_OF_NEXT_MONTH].',
  'Next renewal will be in two months from now on [NEXT_BILLING_DATE].',
  'A total amount of [REFUNDABLE] will be refunded to your nominated bank account upon your approval.'
];

export const MONTHLY_PRO_TO_ANNUALLY_BASIC: string[] = [
  'Your plan downgrades to Basic, effective immediately.',
  'For remaining days of this month, you will be charged [REMAINING_DAYS_FEE].',
  'Annual payment of [BASIC_ANNUAL_FEE] is charged dated on [START_OF_NEXT_MONTH].',
  'Next renewal will be one year later on [NEXT_BILLING_DATE].',
  'A total amount of [REFUNDABLE] will be refunded to your nominated bank account upon your approval.'
];

export const ANNUALLY_BASIC_TO_MONTHLY_PRO: string[] = [
  'Your plan upgrades to Pro, effective immediately.',
  'For remaining days of this month, you will be charged [REMAINING_DAYS_FEE].',
  'Monthly payment of [PRO_MONTHLY_FEE] is charged dated on [START_OF_NEXT_MONTH].',
  'Next renewal will be in two months from now on [NEXT_BILLING_DATE].',
  'A total amount of [REFUNDABLE] will be refunded to your nominated bank account upon your approval.'
];
