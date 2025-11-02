import {Component, inject, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Layout} from '@shared/interfaces';
import {CHECKING, CONTACT_SUPPORT, EMAIL_VERIFIED, RESEND, RESENT} from '@shared/layouts';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AuthService, LayoutVisibilityService} from '@shared/services';
import {Router} from '@angular/router';
import {NgForOf, NgIf} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import {MatDivider} from '@angular/material/divider';
import {AuthenticationComponent} from '@shared/dialogs';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'lib-verify-email',
  imports: [
    NgIf,
    NgForOf,
    MatIcon,
    MatButton,
    MatDivider
  ],
  templateUrl: './verify-email.component.html',
  standalone: true,
  styleUrl: './verify-email.component.scss'
})
export class VerifyEmailComponent implements OnChanges {
  @Input() oobCode!: string;
  verified = false;
  checking = true;
  error: Layout = RESEND;
  success: Layout = EMAIL_VERIFIED;
  wait: Layout = CHECKING;
  resendCount = 0;

  private auth = inject(AuthService);
  private layoutService = inject(LayoutVisibilityService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['oobCode'].currentValue) {
      this.auth.applyCode(this.oobCode)
        .then(() => {
          this.checking = false;
          this.verified = true;
        })
        .catch(error => {
          this.checking = false;
          this.error = RESEND;
        });
    }
  }

  async action(label: string): Promise<void> {
    switch (label) {
      case 'Home':
        await this.auth.logout();
        this.router.navigate(['/']).then(_ => this.layoutService.setVisibility(true, true));
        break;
      case 'Login':
        await this.auth.logout();
        this.router.navigate(['/']).then(_ => {
          this.layoutService.setVisibility(true, true);
          this.dialog.open(AuthenticationComponent, {
            width: '460px',
            data: {link: false},
          });
        }).catch();
        break;
      case 'Resend':
        this.resend();
        break;
      case 'Support':
        this.snackBar.open('Contact us via: drink@wtf.pub', 'X', {duration: 6000});
        await this.auth.logout();
        this.router.navigate(['contact']).then().catch();
        break;
    }
  }

  resend(): void {
    if (this.resendCount < 2) {
      this.resendCount++;
      this.auth.sendEmailVerification()
        .then(_ => this.error = RESENT)
        .catch(error => this.snackBar.open(error.message, 'X', {duration: 6000}));
    } else {
      this.error = CONTACT_SUPPORT;
    }
  }
}

