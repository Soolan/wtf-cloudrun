import {Component, inject} from '@angular/core';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {AuthService} from '@shared/services';
import {
  AbstractControlOptions,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {NgIf} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'lib-change-password',
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    NgIf,
    MatIconModule
  ],
  templateUrl: './change-password.component.html',
  standalone: true,
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent {
  private dialogRef = inject(MatDialogRef<ChangePasswordComponent>);
  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);

  form: UntypedFormGroup;
  hide = true;

  constructor() {
    this.form = this.formBuilder.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      newPasswordConfirm: ['', [Validators.required, Validators.minLength(8)]]
    }, <AbstractControlOptions>{
      validators: this.passwordsMatchValidator
    });
  }

  async update() {
    if (this.form.invalid) return;
    try {
      const password = this.form.get('newPassword')?.value;
      await this.authService.updatePassword(password!);
      this.close();
    } catch (err) {
      console.error(err);
      this.form.get('newPassword')?.setErrors({ updateFailed: true });
    }
  }

  // Custom validator to check if passwords match
  passwordsMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')!.value;
    const newPasswordConfirm = group.get('newPasswordConfirm')!.value;
    return newPassword === newPasswordConfirm ? null : {passwordsNotMatch: true};
  }

  close() {
    this.dialogRef.close();
  }
}
