import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CurrentPlan} from '@shared/interfaces';

@Component({
  selector: 'lib-plan-change',
  imports: [],
  templateUrl: './plan-change.component.html',
  standalone: true,
  styleUrl: './plan-change.component.scss'
})
export class PlanChangeComponent {
  private dialogRef = inject(MatDialogRef<PlanChangeComponent>);
  protected data = inject(MAT_DIALOG_DATA) as CurrentPlan;
}
