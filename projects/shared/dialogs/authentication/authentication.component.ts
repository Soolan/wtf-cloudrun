import {Component, inject, signal} from '@angular/core';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogClose,
  MatDialogTitle,
  MatDialogContent, MatDialogActions
} from '@angular/material/dialog';
import {AuthService, NotificationService, ProfileService} from '@shared/services';
import {MatIcon} from '@angular/material/icon';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatError, MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatButton, MatIconButton} from '@angular/material/button';
import {NgIf, NgOptimizedImage} from '@angular/common';
import {MatSnackBar} from '@angular/material/snack-bar';
import {EmailNotification} from '@shared/interfaces';
import {ADMIN_NOTIFICATION_BUSINESS_SETUP_ISSUE, ADMIN_NOTIFICATION_TAG_SETUP_ISSUE} from '@shared/constants';
import {parseJson} from '@angular/cli/src/utilities/json-file';

@Component({
  selector: 'lib-authentication',
  standalone: true,
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss'],
  imports: [
    MatInput,
    MatIconButton,
    MatDialogClose,
    NgOptimizedImage,
    MatIcon,
    MatProgressBar,
    MatFormField,
    ReactiveFormsModule,
    MatError,
    MatButton,
    MatLabel,
    MatError,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatSuffix,
    NgIf
  ]
})
export class AuthenticationComponent {
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private notificationService = inject(NotificationService);
  public dialogRef = inject(MatDialogRef<AuthenticationComponent>);
  public data = inject(MAT_DIALOG_DATA);

  loginOptions = signal(true);
  emailOption = signal(false);
  hidePassword = signal(true);
  checkingEmail = signal(false);
  emailChecked = signal(false);
  forgotPassword = signal(false);
  passResetEmailSent = signal(false);
  creatingProfile = signal(false);
  isNewUser = signal(false);

  emailFormControl = new FormControl('', [Validators.required, Validators.email]);
  nameFormControl = new FormControl('', [Validators.required]);
  passwordFormControl = new FormControl('', [Validators.required, Validators.min(8)]);

  reset(): void {
    this.emailFormControl.reset();
    this.nameFormControl.reset();
    this.passwordFormControl.reset();
    this.loginOptions.set(true);
    this.isNewUser.set(false);
    this.emailOption.set(false);
    this.emailChecked.set(false);
    this.checkingEmail.set(false);
    this.creatingProfile.set(false);
  }

  async checkEmail(): Promise<void> {
    if (this.emailFormControl.invalid) return;

    this.checkingEmail.set(true);
    const email = this.emailFormControl.value!;
    try {
      const signInMethods = await this.authService.emailExists(email)
      console.log(email, !signInMethods.length);
      this.emailChecked.set(true);

      if (!signInMethods.length) {
        this.isNewUser.set(true);
        const name = email.split('@')[0] || 'John Doe';
        this.nameFormControl.setValue(name);
      }
    } catch (error) {
      console.error(error);
      this.reset();
    } finally {
      this.checkingEmail.set(false);
    }
  }

  async register(): Promise<void> {
    const email = this.emailFormControl.value;
    const password = this.passwordFormControl.value;
    const displayName = this.nameFormControl.value;
    if (!email || !password || !displayName) return;
    this.creatingProfile.set(true);
    try {
      const user = await this.authService.addUser(email, password);
      if (!user) return;
      const response =
        await this.profileService.setProfile(user.user, displayName);
      console.log('response from setProfileTag:', response);
      if (!response || !response.success) {
        await this.profileSetupFailed(response);
      } else {
        this.profileService.tag.set(response.tag);
        console.log(this.profileService.tag());
        await this.authService.sendEmailVerification(); // Send verification email
        await this.notificationService.addToDayOneMailingList({key: 'receivers', value: email});
        await this.router.navigate(['console']);
      }
      this.dialogRef.close();
    } catch (error) {
      console.error(error);
    } finally {
      this.creatingProfile.set(false);
    }
  }

  async profileSetupFailed(response: null | { success: boolean; message: string; tag: number }) {
    this.snackBar.open('Tag creation failed!', 'X', {duration: 3000});
    this.snackBar.open('Admin has notified about this issue!', 'X', {duration: 6000});
    const notification: EmailNotification = {...ADMIN_NOTIFICATION_TAG_SETUP_ISSUE};
    notification.message.html = notification.message.html
      .replace('[ProfileId]', this.profileService.profileId())
      .replace('[Response]', response?.toString() || 'Undefined');
    await this.notificationService.notify(notification);
  }

  async login(): Promise<void> {
    const email = this.emailFormControl.value;
    const password = this.passwordFormControl.value;
    if (!email || !password)
      return;

    try {
      const user = await this.authService.emailPassLogin(email, password);
      this.dialogRef.close(true);
    } catch (error) {
      this.forgotPassword.set(true);
      this.snackBar.open(this.authService.getErrorMessage(error), 'X', {duration: 5000});
    }
  }

  async resetPassword() {
    if (!this.emailFormControl.value || this.emailFormControl.invalid) {
      this.snackBar.open(`Email not valid. Please try again.`, 'X', {duration: 4000});
      return;
    }
    await this.authService.sendPassResetEmail(this.emailFormControl.value);
    this.snackBar.open(`Password reset email sent.`, 'X', {duration: 5000});
    this.forgotPassword.set(false);
    this.passResetEmailSent.set(true);
  }

  async googleLogin() {
    try {
      const user = await this.authService.signInWithGoogle();
      console.log(user);
      this.dialogRef.close(true);
    } catch (error) {
      console.log(error);
      this.snackBar.open(this.authService.getErrorMessage(error), 'X', {duration: 5000});
    }
  }

  get action(): string {
    return this.emailChecked() ? (
      this.passResetEmailSent() ? 'Reset link sent!' :
        this.isNewUser() ? 'Register' : 'Login'
    ) : 'Login or register';
  }
}
