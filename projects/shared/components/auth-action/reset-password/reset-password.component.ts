import {Component, inject, Inject, Input, OnInit, DOCUMENT} from '@angular/core';
import {
  AbstractControlOptions, FormBuilder, FormGroup, ReactiveFormsModule,
  UntypedFormGroup, Validators
} from '@angular/forms';
import {Layout} from '@shared/interfaces';
import {NgForOf, NgIf} from '@angular/common';
import {AuthService, LayoutVisibilityService} from '@shared/services';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {CONTACT_SUPPORT, PASSWORD_CHANGED, RESEND_PASSWORD_LINK} from '@shared/layouts';
import {AuthenticationComponent} from '@shared/dialogs';
import {DIALOG_DELAY_100} from '@shared/constants';
import {MatError, MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'lib-reset-password',
  templateUrl: './reset-password.component.html',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    MatIcon,
    MatButton,
    NgForOf,
    MatSuffix
  ],
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  @Input() oobCode!: string;
  form: UntypedFormGroup;
  result!: Layout;
  error!: string;
  hide = true;

  private layoutService = inject(LayoutVisibilityService);
  private auth = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);

  constructor(
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.form = this.formBuilder.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      newPasswordConfirm: ['', [Validators.required, Validators.minLength(8)]]
    }, <AbstractControlOptions>{
      validators: this.passwordsMatchValidator
    });
  }

  ngOnInit(): void {
    this.form.reset();
  }

  resetPassword() {
    if (this.form.valid && this.oobCode) {
      this.auth.confirmPassReset(this.oobCode, this.form.get('newPassword')?.value)
        .then(() => {
          this.result = PASSWORD_CHANGED;
        })
        .catch((error) => {
          this.result = RESEND_PASSWORD_LINK;
        });
    } else if (this.form.hasError('passwordsNotMatch')) {
      this.error = ', Passwords Do Not Match!';
      this.snackBar.open(`Error${this.error}`, 'X', {duration: 6000});
    } else {
      this.result = CONTACT_SUPPORT;
      this.snackBar.open('Unknown Error!', 'X', {duration: 6000});
    }
  }

  // Custom validator to check if passwords match
  passwordsMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')!.value;
    const newPasswordConfirm = group.get('newPasswordConfirm')!.value;
    return newPassword === newPasswordConfirm ? null : {passwordsNotMatch: true};
  }

  action(label: string): void {
    switch (label) {
      case 'Login':
        this.router.navigate(['/']).then(_ => {
          this.layoutService.setVisibility(true, true);
          this.dialog.open(AuthenticationComponent, {
            width: '400px',
            enterAnimationDuration: DIALOG_DELAY_100,
            exitAnimationDuration: DIALOG_DELAY_100,
            data: {
              link: false,
            },
          });
        }).catch();
        break;
      case 'Support':
        this.snackBar.open('Contact us via: drink@wtf.pub', 'X', {duration: 6000});
        this.auth.logout().then(_ => this.router.navigate(['contact']).then()).catch()
        break;
    }
  }
}
