import {Component, effect, inject, signal} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormField, MatPrefix, MatSuffix} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';
import {AsyncPipe, DatePipe, NgIf, NgStyle} from '@angular/common';
import {MatSnackBar} from '@angular/material/snack-bar';
import {debounceTime, distinctUntilChanged} from 'rxjs';
import {EmailNotification, Entity, Invite, Member, PublicProfile} from '@shared/interfaces';
import {EMAIL_NOTIFICATIONS, NOW, TEAM_INVITATION} from '@shared/constants';
import {ProfileFinderService} from '@shared/services/profile-finder.service';
import {RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {StorageUrlPipe} from '@shared/pipes';
import {LoadingComponent} from '@shared/components';
import {InvitationStatus, MemberRank, ProgressType} from '@shared/enums';
import {CompanyService, CrudService, LayoutVisibilityService, ProfileService} from '@shared/services';
import {INVITATIONS, INVITE_URL} from '@shared/constants/invitations';

@Component({
  selector: 'app-invite',
  imports: [
    FormsModule,
    MatFormField,
    MatIcon,
    MatInput,
    MatPrefix,
    MatSuffix,
    NgIf,
    ReactiveFormsModule,
    DatePipe,
    RouterLink,
    MatButton,
    AsyncPipe,
    StorageUrlPipe,
    NgStyle,
    LoadingComponent
  ],
  templateUrl: './invite.component.html',
  standalone: true,
  styleUrl: './invite.component.scss'
})
export class InviteComponent {
  private snackbar = inject(MatSnackBar);
  private layoutService = inject(LayoutVisibilityService);
  private crud = inject(CrudService);
  private profileService = inject(ProfileService);
  private companyService = inject(CompanyService);
  private finder = inject(ProfileFinderService);

  private readonly emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,4}$/;
  emailControl = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(this.emailRegex)]
  });

  uid!: string | null;
  profile!: PublicProfile | null;
  invitationUrl!: string;
  path!: string;

  clicked = signal(false);
  found = signal(false);
  sent = signal(false);
  sending = signal(false);

  constructor() {
    effect(async () => {
      if (this.layoutService.headerIsReady()) {
        this.path = `${this.companyService.path()}/${this.companyService.id()}/team`;
        this.emailControl.valueChanges.pipe(
          debounceTime(700),
          distinctUntilChanged()
        ).subscribe(() => this.clicked.set(false));
      }
    });
  }

  reset(): void {
    this.emailControl.setValue('');
    this.clicked.set(false);
    this.found.set(false);
    this.sent.set(false);
    this.sending.set(false);
    this.profile = null;
  }

  async checkEmail(): Promise<void> {
    this.clicked.set(true);
    this.emailControl.updateValueAndValidity();

    if (this.emailControl.invalid) {
      this.snackbar.open('Invalid email!', 'X', {duration: 3000});
      this.reset();
      return;
    }

    try {
      // this.profile = {
      //   displayName: 'Yaw',
      //   firstName: 'Jose',
      //   lastName: 'Zapata',
      //   avatar: 'image/Li Wei.jpg',
      //   joinedAt: Date.now()
      // }
      this.uid = await this.finder.getUid(this.emailControl.value);
      if (this.uid) {
        this.snackbar.open('This user is registered!', 'X', {duration: 3000});
        this.profile = await this.finder.getUser(this.uid);
        this.found.set(!!this.profile);
      }
      this.clicked.set(false);
      this.sending.set(true);
      await this.invite();
      this.sent.set(true);
    } catch (error) {
      this.snackbar.open('Failed to check email.', 'X', {duration: 3000});
    }
  }

  async invite(): Promise<void> {
    this.sending.set(true);
    try {
      const invite = await this.crud.add(INVITATIONS.path, this.inviteDTO);
      if (!invite) return;
      this.invitationUrl = `${INVITE_URL}/${invite.id}`;
      await this.crud.add(EMAIL_NOTIFICATIONS.path, this.notificationDTO);
      await this.crud.add(this.path, this.memberDTO);
      this.snackbar.open('Invitation sent!', 'X', {duration: 3000});
    } catch (error) {
      this.snackbar.open(`Error: ${(error as Error).message || error}`, 'X', {duration: 7000});
    } finally {
      this.sending.set(false);
    }
  }

  get notificationDTO(): EmailNotification {
    const notification = TEAM_INVITATION;
    const displayName = this.profile?.displayName || this.profile?.firstName || this.emailControl.value.split("@")[0];
    notification.message.html = notification.message.html
      .replace("[DisplayName]", displayName)
      .replace("[Admin]", this.profileService.displayName() || "admin")
      .replace("[Company]", this.companyService.company()?.name || "a company")
      .replace("[InvitationUrl]", this.invitationUrl);
    return notification;
  }

  get inviteDTO(): Invite {
    return {
      companyName: this.companyService.company()?.name || '',
      companyLogo: this.companyService.company()?.logo || '',
      teamPath: this.path,
      email: this.emailControl.value,
      invitedBy: this.profileService.displayName(),
      status: InvitationStatus.Pending,
      createdAt: Date.now(),
      hasProfile: !!this.profile,
      acceptedAt: 0,
      autoRegister: true
    };
  }

  get memberDTO(): Member {
    const persona: Entity = {
      role: this.uid || '',
      name: this.profile?.displayName || '',
      avatar: this.profile?.avatar || '',
    };
    return {
      persona,
      role: 'TBD',
      bio: '',
      order: 0,
      contact: [this.emailControl.value],
      rank: MemberRank.Department,
      department: 'TBD',
      members: [],
      timestamps: NOW,
      active: false,
      invited: true,
    };
  }

  protected readonly ProgressType = ProgressType;
}
