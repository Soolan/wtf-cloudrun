import {Component, inject} from '@angular/core';
import {Invite} from '@shared/interfaces';
import {CrudService, LayoutVisibilityService} from '@shared/services';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {INVITATIONS} from '@shared/constants';
import {MatIcon} from '@angular/material/icon';
import {LoadingComponent} from '@shared/components';
import {MatButton} from '@angular/material/button';
import {AsyncPipe, NgIf, NgStyle} from '@angular/common';
import {StorageUrlPipe} from '@shared/pipes';
import {InvitationStatus} from '@shared/enums';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-check-invitation',
  imports: [
    MatIcon,
    LoadingComponent,
    MatButton,
    RouterLink,
    NgIf,
    NgStyle,
    StorageUrlPipe,
    AsyncPipe
  ],
  templateUrl: './check-invitation.component.html',
  standalone: true,
  styleUrl: './check-invitation.component.scss'
})
export class CheckInvitationComponent {
  id!: string;
  invitation!: Invite;
  expired = false;
  action = false;

  private crud = inject(CrudService);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private layoutService = inject(LayoutVisibilityService);

  constructor( ) {
    this.id = this.route.snapshot.params['inviteId'];
    this.layoutService.footerVisible.set(false);
    this.check();
  }

  check() {
    this.action = true;
    if (!this.id) {
      this.expired = true;
      return;
    }
    this.crud.getDoc(INVITATIONS.path, this.id).then(doc => {
      this.invitation = doc as Invite;
      if (this.invitation) {
        if (this.invitation.status !== InvitationStatus.Pending) return;
        const fortyEightHoursInMs = 48 * 60 * 60 * 1000;
        this.expired = Date.now() - this.invitation?.createdAt > fortyEightHoursInMs;
        this.crud.update(INVITATIONS.path, this.id, this.DTO)
          .then(_ => this.snackBar.open('Invitation accepted!', 'X', {duration: 3000}))
          .catch();
      }
    })
  }

  get DTO(): Invite {
    const data = this.invitation;
    data.acceptedAt = Date.now();
    data.status = this.expired? InvitationStatus.Expired : InvitationStatus.Accepted;
    return data;
  }

  protected readonly InvitationStatus = InvitationStatus;
}
