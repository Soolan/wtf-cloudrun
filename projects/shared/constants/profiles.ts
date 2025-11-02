import {Crop, Profile, WtfQuery} from '@shared/interfaces';
import {BillingCycle, Currency, Loyalty, Plan} from '@shared/enums';
import {DAY} from '@shared/constants/tickets';

export const PROFILES: WtfQuery = {
  path: 'profiles',
  limit: 1000,
  orderBy: {field: 'timestamps.created_at', direction: 'desc'},
  where: {field: 'timestamps.created_at', operator: '!=', value: null}
};

export const PROFILE: Profile = {
  display_name: '',
  avatar: '',
  firstname: '',
  lastname: '',
  biography: '',
  tag: 0,
  balances: [
    {currency: Currency.AI, amount: 0},
    {currency: Currency.GB, amount: 0},
  ],
  loyalty: Loyalty.Bronze,
  achievements: [],
  security: {
    private: false,
    emailSafetyCode: Math.random().toString(36).slice(6),
    pinCode: '',
    mobile: '',
    twoFA: {paired: false, active: false},
    ipTracking: []
  },
  sendMe: {
    email: true,
    newsletter: true,
    notification: true
  },
  currentPlan: {
    plan: Plan.Pro,
    billingCycle: BillingCycle.Monthly,
    billingDate: Date.now() + (30 * DAY), // 30 days later
    autoRenew: false
  },
  suspended: false,
  isAdmin: false,
  timestamps: {
    created_at: Date.now(),
    updated_at: Date.now(),
    deleted_at: 0
  },
};

export const AVATAR_CROP: Crop = {
  maintainAspectRatio: true,
  aspectRatio: '1:1',
  format: 'jpg'
}
