import {Component, inject} from '@angular/core';
import { AuthAction } from '@shared/enums';
import {AuthService, LayoutVisibilityService} from '@shared/services';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {NgSwitch, NgSwitchCase, NgSwitchDefault} from '@angular/common';
import {RecoverEmailComponent} from '@shared/components/auth-action/recover-email/recover-email.component';
import {ResetPasswordComponent} from '@shared/components/auth-action/reset-password/reset-password.component';
import {VerifyEmailComponent} from '@shared/components/auth-action/verify-email/verify-email.component';

@Component({
  selector: 'lib-auth-action',
  imports: [
    NgSwitchCase,
    RecoverEmailComponent,
    ResetPasswordComponent,
    RouterLink,
    VerifyEmailComponent,
    NgSwitch,
    NgSwitchDefault
  ],
  templateUrl: './auth-action.component.html',
  standalone: true,
  styleUrl: './auth-action.component.scss'
})
export class AuthActionComponent {
  mode!: string;
  oobCode!: string;
  user!: any;

  private layoutService = inject(LayoutVisibilityService);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);

  constructor( ) {
    this.mode = this.route.snapshot.queryParamMap.get('mode') || '';
    this.oobCode = this.route.snapshot.queryParamMap.get('oobCode') || '';
    this.auth.authState$.subscribe(user => this.user = user);
    this.layoutService.headerVisible.set(false);
    this.layoutService.footerVisible.set(false);
  }

  reset(): void {
    this.layoutService.headerVisible.set(true);
    this.layoutService.footerVisible.set(true);
  }

  protected readonly AuthAction = AuthAction;
}
