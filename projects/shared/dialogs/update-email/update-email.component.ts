import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '@shared/services';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {NgIf} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'lib-update-email',
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatIconModule,
    NgIf
  ],
  templateUrl: './update-email.component.html',
  standalone: true,
  styleUrl: './update-email.component.scss'
})
export class UpdateEmailComponent {
  private dialogRef = inject(MatDialogRef<UpdateEmailComponent>);
  protected data = inject(MAT_DIALOG_DATA) as { email: string };
  private authService = inject(AuthService);

  newEmail = new FormControl('', [Validators.required, Validators.email]);

  async update() {
    if (this.newEmail.invalid || !this.newEmail.value) return;
    try {
      await this.authService.updateEmail(this.newEmail.value);
      this.close();
    } catch (err) {
      console.error(err);
      this.newEmail.setErrors({ updateFailed: true });
    }
  }

  close() {
    this.dialogRef.close();
  }
}
