import {Plan} from '@shared/enums';
import {Balance} from '@shared/interfaces';

export interface Subscription {
  type: Plan;
  fee: Balance[];
  features?: PlanFeature[];
}

export interface PlanFeature {
  name: string;
  description: string;
  quantity: string;
}

export interface YearMonth {
  year: number;
  month: number;
}
