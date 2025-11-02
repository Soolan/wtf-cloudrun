import {Component, effect, inject, OnInit} from '@angular/core';
import { MatTabsModule} from '@angular/material/tabs';
import {PlansPricingComponent, TransactionsComponent} from '@shared/components';
import {CompanyService, DialogConfigService, LayoutVisibilityService, ProfileService} from '@shared/services';
import {PAYMENT_MOCKS, PAYMENT_OPTIONS, PROFILES} from '@shared/constants';
import { MatDialogConfig} from '@angular/material/dialog';
import {TRANSACTIONS} from '@shared/constants';
import {CurrentPlan, PaymentOption, Transaction} from '@shared/interfaces';
import {NgIf} from '@angular/common';
import {PaymentOptionsComponent} from '@shared/components/payment-options/payment-options.component';
import {CurrentPlanComponent} from '@shared/components/current-plan/current-plan.component';

@Component({
  selector: 'lib-subscription',
  imports: [
    PlansPricingComponent,
    MatTabsModule,
    NgIf,
    PaymentOptionsComponent,
    TransactionsComponent,
    CurrentPlanComponent
  ],
  templateUrl: './subscription.component.html',
  standalone: true,
  styleUrl: './subscription.component.scss'
})
export class SubscriptionComponent implements OnInit{
  protected profileService = inject(ProfileService);
  private companyService = inject(CompanyService);
  private configService = inject(DialogConfigService);
  public layoutService = inject(LayoutVisibilityService);

  currentPlan!: CurrentPlan | null;
  updatingCurrentPlan = false;
  dialogConfig: MatDialogConfig = {};
  paymentOptions!: PaymentOption[];
  transactions!: Transaction[];

  constructor() {
    effect(async () => {
      if (this.layoutService.headerIsReady()) {
        const txPath = `${this.companyService.path()}/${this.companyService.id()}/${TRANSACTIONS.path}`;
        this.dialogConfig = {...this.configService.getConfig()};
        this.currentPlan = this.profileService.currentPlan();
        const paymentOptionsPath = `${PROFILES.path}/${this.profileService.profileId()}/${PAYMENT_OPTIONS.path}`;
        const q = {...PAYMENT_OPTIONS, path: paymentOptionsPath};
        this.paymentOptions = PAYMENT_MOCKS; // await this.crud.getDocs(q, true, true) as PaymentOption[];
      }
    });
  }

  ngOnInit() {
    // ToDo: Activate 1 month pro plan for first timers
    //  Also complete the bounty tickets
  }

  update($event: CurrentPlan | null): void {
    this.updatingCurrentPlan = true;
    console.log($event);
  }
}
