import {inject, Injectable} from '@angular/core';
import {CrudService} from '@shared/services';
import {Currency, Plan} from '@shared/enums';
import {PLAN_QUOTA, UPGRADE_GRACE_PERIOD_HOURS} from '@shared/constants';
import {Balance, YearMonth} from '@shared/interfaces';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private crudService = inject(CrudService);

  constructor() { }

  addSubscription(path: string, plan: Plan) {
    // return this.crudService.add(`${path}/${TICKETS.path}`, WELCOME_TICKET);
  }

  daysInMonth(date: Date): number {
    const { year, month } = this.getYearAndMonth(date);
    // Feb 2024: month+1 goes to the next month (April). 0 gets the last day of previous month (29).
    return new Date(year, month + 1, 0).getUTCDate();
  }

  isGracePeriod(date: Date): boolean {
    const { year, month } = this.getYearAndMonth(date);
    const endOfMonth = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0)); // 1st of next month at 00:00 UTC
    const now = new Date();
    const hoursToNextCycle = (endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursToNextCycle < UPGRADE_GRACE_PERIOD_HOURS;
  }

  getYearAndMonth(date: Date): YearMonth {
    return {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() // 0-indexed (0=Jan, 1=Feb, etc.)
    };
  }

  getUsage(balances: Balance[], plan: Plan, currency: Currency): number {
    const used = balances.find(b => b.currency === currency)?.amount || 0;
    const quota = PLAN_QUOTA[plan]?.[currency] ?? 0;
    return quota - used;
  }

}
