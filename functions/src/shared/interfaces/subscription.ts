import {Plan} from '../enums';
import {Balance} from '../interfaces';

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
