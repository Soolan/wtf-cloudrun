import {Component, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import {DoughnutChartComponent} from '@shared/components/doughnut-chart/doughnut-chart.component';
import {DatePipe, NgIf, TitleCasePipe} from '@angular/common';
import {CurrentPlan} from '@shared/interfaces';
import {MatDivider} from '@angular/material/divider';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {BillingCycle, Currency, Plan} from '@shared/enums';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {PLAN_QUOTA} from '@shared/constants';
import {ProfileService} from '@shared/services';

@Component({
  selector: 'lib-current-plan',
  imports: [
    DoughnutChartComponent,
    NgIf,
    TitleCasePipe,
    DatePipe,
    MatDivider,
    ReactiveFormsModule,
    MatButtonToggleGroup,
    MatButtonToggle,
    MatSlideToggle,
    FormsModule
  ],
  templateUrl: './current-plan.component.html',
  standalone: true,
  styleUrl: './current-plan.component.scss'
})
export class CurrentPlanComponent implements OnInit{
  @Input() currentPlan!: CurrentPlan | null;
  @Input() updating  = false;
  @Output() currentPlanChanged = new EventEmitter<CurrentPlan | null>();

  private profileService = inject(ProfileService);

  ngOnInit() {
  }

  updateRenew() {
    if (this.currentPlan)
      this.currentPlan.autoRenew = !this.currentPlan.autoRenew;
    this.currentPlanChanged.emit(this.currentPlan);
  }

  explainCycles(): void {
    if(this.currentPlan?.billingCycle == BillingCycle.Annually) {
      // Upgrade:
      //    - Current month continues (i.e. till end of March 2025).
      //    - 12 months billing amount is charged, dated beginning of the next month (April 1st, 2025).
      //    - Next billing cycle will be the same date next year (April 1st, 2026).
    } else {
      // Downgrade
      //    - Current month continues (i.e. till end of March 2025).
      //    - 1 month billing amount will be charged for the next month (April 1st, 2025).
      //    - User is refunded with the remaining credits till the end of previous billing cycle.
      //    - Next billing cycle: beginning of 2 months from now (May 1st, 2025)
    }
  }

  updateCycle(): void {
    this.currentPlanChanged.emit(this.currentPlan);
  }

  getQuota(currency: Currency): number {
    const plan = this.profileService.currentPlan()?.plan || Plan.Free;
    return PLAN_QUOTA[plan]?.[currency] ?? 0
  }

  getUsage(currency: Currency): number {
    const balances = this.profileService.balances();
    const used = balances.find(b => b.currency === currency)?.amount || 0;
    const usage = this.getQuota(currency) - used;
    const decimals = usage.toString().split('.')[1]?.length || 0;
    if (decimals > 4) {
      return parseFloat(usage.toFixed(4));
    }

    return usage;
  }

  protected readonly BillingCycle = BillingCycle;
  protected readonly Currency = Currency;
}
