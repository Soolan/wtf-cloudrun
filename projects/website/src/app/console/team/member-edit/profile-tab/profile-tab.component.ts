import {Component, inject, Input, OnInit} from '@angular/core';
import {PROFILES} from '@shared/constants';
import {AuthService, CrudService, ProfileService} from '@shared/services';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Profile} from '@shared/interfaces';
import {TwoFAComponent} from '@shared/dialogs';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ProfileFormService} from '@shared/forms';
import {User} from '@angular/fire/auth';
import {LoadingComponent} from '@shared/components';
import {MatButtonModule} from '@angular/material/button';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {NgIf} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatDivider} from '@angular/material/divider';
import {UpdateEmailComponent} from '@shared/dialogs/update-email/update-email.component';
import {ChangePasswordComponent} from '@shared/dialogs/change-password/change-password.component';

@Component({
  selector: 'app-profile-tab',
  imports: [
    FormsModule,
    LoadingComponent,
    MatButtonModule,
    MatIconModule,
    MatSlideToggle,
    MatFormFieldModule,
    MatTooltipModule,
    NgIf,
    ReactiveFormsModule,
    MatDivider
  ],
  templateUrl: './profile-tab.component.html',
  standalone: true,
  styleUrl: './profile-tab.component.scss'
})
export class ProfileTabComponent implements OnInit {
  @Input() user!: User | null;
  profile!: Profile;
  email!: string;
  verified = false;
  saving = {
    email: false,
    password: false,
    twoFA: false,
    code: false,
    emails: false,
    newsletters: false,
    notifications: false,
  }

  private formService = inject(ProfileFormService);
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private snackbar = inject(MatSnackBar);
  private crud = inject(CrudService);
  private dialog = inject(MatDialog);

  async ngOnInit() {
    this.form.reset();
    if (!this.user) return;
    const id = this.user.uid;
    this.email = this.user.email || '';
    this.verified = this.user.emailVerified;
    this.profile = await this.crud.getDoc(PROFILES.path, id);
    this.form.patchValue(this.profile);
    this.profileService.profileWithId.set({id, ...this.profile});
    this.profileService.profileId.set(id);
  }

  update(field: string) {
    // @ts-ignore
    this.saving[field] = true;
    setTimeout(async () => {
      await this.crud.update(PROFILES.path, this.profileService.profileId(), this.DTO)
      // @ts-ignore
      this.saving[field] = false;
    }, 1300);
  }

  updateCreds(field: string): void {
    const isPaired = this.form.get(['security', 'twoFA', 'paired'])?.value;
    const isActive = isPaired && this.form.get(['security', 'twoFA', 'active'])?.value;
    if (isActive) {
      this.verify2FA().afterClosed().subscribe({
        next: async response => {
          if (!response.success) return;
          if (this.email && field === 'email') {
            this.dialog.open(UpdateEmailComponent, {data: {email: this.email}, width: '400px'});
          } else if (field === 'password') {
            this.dialog.open(ChangePasswordComponent, {width: '400px'});
          }
        }
      })
    } else if (!isPaired) {
      this.snackbar.open('Let\'s Setup 2FA first!', 'X', {duration: 2500});
      this.set2FA();
    } else {
      this.snackbar.open('Please Activate 2FA first!', 'X', {duration: 2000})
    }
  }

  async codeGenerator(): Promise<void> {
    this.saving.code = true;
    this.update('code');
    this.form.get(['security', 'emailSafetyCode'])?.setValue(Math.random().toString(36).slice(6));
  }

  set2FA(): void {
    this.dialog.open(TwoFAComponent, {
      data: {paired: this.profile.security.twoFA.paired},
      width: '400px'
    }).afterClosed().subscribe({
      next: async response => {
        if (response.success && !this.profile.security.twoFA.paired)
          await this.toggle2FA(true);
      }
    });
  }

  verify2FA(): MatDialogRef<TwoFAComponent> {
    return this.dialog.open(TwoFAComponent, {
      data: {paired: this.profile.security.twoFA.paired},
      width: '400px'
    });
  }

  async toggle2FA(active: boolean): Promise<void> {
    this.form.get(['security', 'twoFA', 'paired'])?.setValue(active);
    this.form.get(['security', 'twoFA', 'active'])?.setValue(active);
    this.update('TwoFA');
    const message = active ? '2FA Added Successfully!' : '2FA Removed Successfully!'
    this.snackbar.open(message, 'X', {duration: 4000})
  }

  get DTO(): Profile {
    const data = this.form.value as Profile;
    data.timestamps.updated_at = Date.now();
    return data;
  }

  get form(): FormGroup {
    return this.formService.form;
  }
}
