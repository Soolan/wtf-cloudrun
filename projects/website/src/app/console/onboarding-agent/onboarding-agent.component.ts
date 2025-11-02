import {Component, inject, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {OnboardingAgentDialogComponent} from './dialog/onboarding-agent-dialog/onboarding-agent-dialog.component';

@Component({
  selector: 'app-onboarding-agent',
  standalone: true,
  imports: [],
  template: '',
})
export class OnboardingAgentComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.dialog.open(OnboardingAgentDialogComponent, {
      minWidth: '100vw',
      height: '100vh',
      disableClose: true,
      panelClass: 'onboarding-agent-dialog'
    }).afterClosed().subscribe(() => {
      // Navigate back to the parent route (the company dashboard)
      this.router.navigate(['../'], {relativeTo: this.route});
    });
  }
}
