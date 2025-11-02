import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {Button, Layout} from '@shared/interfaces';
import {PROFILE_NAV} from '@shared/constants';

@Component({
  selector: 'app-confirm',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIcon,
  ],
  templateUrl: './confirm.component.html',
  standalone: true,
  styleUrl: './confirm.component.scss'
})
export class ConfirmComponent {
  protected data = inject(MAT_DIALOG_DATA) as Layout;

  get confirm(): boolean {
    return !!this.data.actions?.findIndex((button: Button) => button.icon === "arrow_back");
  }
}
