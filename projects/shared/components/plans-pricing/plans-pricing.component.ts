import {Component, effect, inject, signal} from '@angular/core';
import {Plan} from '@shared/enums';
import {AI_SUBSCRIPTIONS, AI_TOKEN_USAGE, BASE_FEATURES} from '@shared/constants';
import {AsyncPipe, UpperCasePipe} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {MatCard} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';
import {Router} from '@angular/router';
import {BreakpointObserver} from '@angular/cdk/layout';
import {distinctUntilChanged} from 'rxjs';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatTooltip} from '@angular/material/tooltip';
import {MatDialog} from '@angular/material/dialog';
import {AuthService, DialogConfigService, ProfileService} from '@shared/services';
import {MatAccordion, MatExpansionModule} from '@angular/material/expansion';

export interface TokenUsage {
  title: string;       // The key/heading for the information (e.g., 'Characters', 'Words')
  description: string; // The detailed explanation
}

@Component({
  selector: 'lib-plans-pricing',
  imports: [
    MatButton,
    MatCard,
    MatIcon,
    ReactiveFormsModule,
    MatTooltip,
    UpperCasePipe,
    MatButtonToggleGroup,
    MatButtonToggle,
    AsyncPipe,
    MatAccordion,
    MatExpansionModule
  ],
  templateUrl: './plans-pricing.component.html',
  standalone: true,
  styleUrl: './plans-pricing.component.scss'
})
export class PlansPricingComponent {
  private breakpoint = inject(BreakpointObserver);
  private dialog = inject(MatDialog);
  private dialogConfig = inject(DialogConfigService);
  private router = inject(Router);
  protected auth = inject(AuthService);
  protected profileService = inject(ProfileService);

  periodControl: FormControl = new FormControl('monthly');

  smallScreen = signal(false);

  constructor() {
    effect(() => {
      this.breakpoint.observe(['(max-width: 960px)'])
        .pipe(distinctUntilChanged())
        .subscribe(state => {
          this.smallScreen.set(state.breakpoints['(max-width: 960px)']);
        });
    });
  }

  getAmount(amount: number): number {
    return amount * (this.periodControl.value === 'monthly' ? 1 : 0.8);
  }

  pay(plan: Plan) {

  }

  protected readonly Plan = Plan;
  protected readonly AI_SUBSCRIPTIONS = AI_SUBSCRIPTIONS;
  protected readonly BASE_FEATURES = BASE_FEATURES;
  protected readonly AI_TOKEN_USAGE = AI_TOKEN_USAGE;
}
