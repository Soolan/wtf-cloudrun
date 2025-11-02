import {Component, inject, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Layout} from '@shared/interfaces';
import {
  CHECKING,
  EMAIL_RECOVERED,
  EMAIL_RECOVERY_EXPIRED,
} from '@shared/layouts';
import {AuthService, LayoutVisibilityService} from '@shared/services';
import {Router} from '@angular/router';
import {AuthenticationComponent} from '@shared/dialogs';
import {MatDialog} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatDivider} from '@angular/material/divider';
import {MatIcon} from '@angular/material/icon';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'lib-recover-email',
  imports: [
    MatButton,
    MatDivider,
    MatIcon,
    NgForOf,
    NgIf
  ],
  templateUrl: './recover-email.component.html',
  standalone: true,
  styleUrl: './recover-email.component.scss'
})
export class RecoverEmailComponent implements OnChanges {
  @Input() oobCode!: string;
  recovered = false;
  checking = true;
  error: Layout = EMAIL_RECOVERY_EXPIRED;
  success: Layout = EMAIL_RECOVERED;
  wait: Layout = CHECKING;

  private auth = inject(AuthService);
  private layoutService = inject(LayoutVisibilityService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['oobCode'].currentValue) {
      this.recovered = await this.auth.applyCode(this.oobCode);
      this.checking = false;
    }
  }

  async action(label: string): Promise<void> {
    switch (label) {
      case 'Home':
        await this.auth.logout().then().catch();
        this.router.navigate(['/']).then(_ => this.layoutService.setVisibility(true, true));
        break;
      case 'Login':
        await this.auth.logout().then().catch();
        this.router.navigate(['/']).then(_ => {
          this.layoutService.setVisibility(true, true);
          this.dialog.open(AuthenticationComponent, {
            width: '400px',
            data: {
              link: false,
            },
          });
        }).catch();
        break;
    }
  }
}
