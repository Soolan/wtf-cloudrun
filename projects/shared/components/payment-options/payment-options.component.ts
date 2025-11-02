import {Component, inject, Input} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatIcon} from '@angular/material/icon';
import {PaymentOption} from '@shared/interfaces';
import {PaymentMethodType} from '@shared/enums';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {CrudService, DialogConfigService, LayoutVisibilityService, ProfileService} from '@shared/services';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'lib-payment-options',
  imports: [
    NgForOf,
    MatIconButton,
    MatMenuTrigger,
    MatIcon,
    MatMenu,
    MatMenuItem,
    NgIf,
    MatButton,
  ],
  templateUrl: './payment-options.component.html',
  standalone: true,
  styleUrl: './payment-options.component.scss'
})
export class PaymentOptionsComponent {
  @Input() paymentOptions!: PaymentOption[];
  dialogConfig!: MatDialogConfig;
  path!: string;

  private dialog = inject(MatDialog);
  private crud = inject(CrudService);
  private snackbar = inject(MatSnackBar);
  private profileService = inject(ProfileService);
  private configService = inject(DialogConfigService);
  public layoutService = inject(LayoutVisibilityService);

  constructor() {
    this.dialogConfig = {...this.configService.getConfig()};
  }

  setDefault(paymentOption: PaymentOption) {
  }

  edit(paymentOption: PaymentOption) {
  }

  delete(paymentOption: PaymentOption) {
  }

  add() {
  }

  protected readonly PaymentMethodType = PaymentMethodType;
}
