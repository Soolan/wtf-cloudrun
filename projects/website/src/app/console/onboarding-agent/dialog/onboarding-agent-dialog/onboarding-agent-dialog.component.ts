import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { OnboardingStepperComponent } from '../../components/onboarding-stepper/onboarding-stepper.component';

@Component({
  selector: 'app-onboarding-agent-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    OnboardingStepperComponent
  ],
  templateUrl: './onboarding-agent-dialog.component.html',
  styleUrl: './onboarding-agent-dialog.component.scss'
})
export class OnboardingAgentDialogComponent {
  protected readonly dialogRef = inject(MatDialogRef<OnboardingAgentDialogComponent>);

  closeDialog(): void {
    this.dialogRef.close();
  }
}

