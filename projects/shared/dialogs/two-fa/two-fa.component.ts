import {AfterViewInit, Component, ElementRef, inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import QRCode from 'qrcode';
import {NgIf} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatDivider} from '@angular/material/divider';
import {FunctionsService} from '@shared/services';
import {TwoFa} from '@shared/enums';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'lib-two-fa',
  templateUrl: './two-fa.component.html',
  styleUrls: ['./two-fa.component.scss'],
  standalone: true,
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    NgIf,
    MatIcon,
    MatProgressSpinner,
    MatDivider,
    MatButtonModule,
  ]
})

export class TwoFAComponent implements OnInit, AfterViewInit {
  @ViewChild('box0') box0!: ElementRef<HTMLInputElement>;
  @ViewChild('box1') box1!: ElementRef<HTMLInputElement>;
  @ViewChild('box2') box2!: ElementRef<HTMLInputElement>;
  @ViewChild('box3') box3!: ElementRef<HTMLInputElement>;
  @ViewChild('box4') box4!: ElementRef<HTMLInputElement>;
  @ViewChild('box5') box5!: ElementRef<HTMLInputElement>;
  private boxes!: ElementRef<HTMLInputElement>[];

  private dialogRef = inject(MatDialogRef<TwoFAComponent>);
  protected data = inject(MAT_DIALOG_DATA) as { paired: boolean };
  protected functions = inject(FunctionsService);
  protected snackBar = inject(MatSnackBar);

  digits = ['', '', '', '', '', ''];
  authCode = new FormControl('', [Validators.required]);
  showError = false;
  wrongCode = false;
  checking = false;
  dataUrl!: string;

  async ngOnInit() {
    console.log(this.data)
    if (!this.data.paired) {
      const response = await this.functions.call('google2FA', {action: TwoFa.Set});
      if (!this.isValid(response)) return;
      this.dataUrl = await QRCode.toDataURL(response.uri);
    }
  }

  ngAfterViewInit(): void {
    this.boxes = [this.box0, this.box1, this.box2, this.box3, this.box4, this.box5];
    setTimeout(() => this.boxes[0]?.nativeElement.focus(), 0);
  }

  async onInput(event: Event, index: number): Promise<void> {
    const input = event.target as HTMLInputElement;
    const val = input.value.trim();
    if (!/^\d$/.test(val)) {
      input.value = '';
      return;
    }

    this.digits[index] = val;
    (index < 5) ?
      this.boxes[index + 1]?.nativeElement.focus() :
      await this.triggerVerify();
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace') {
      this.showError = false;
      this.digits[index] = '';
      const input = this.boxes[index]?.nativeElement;
      input.value = '';
      if (index > 0) {
        setTimeout(() => {
          const prev = this.boxes[index - 1]?.nativeElement;
          prev?.focus();
          prev?.select();
        });
      }
    }
  }

  async triggerVerify(): Promise<void> {
    const code = this.digits.join('');
    this.authCode.setValue(code);
    this.showError = true;

    if (code.length === 6) {
      this.checking = true;
      this.wrongCode = false;
      await this.verify();
    }
  }

  async verify(): Promise<void> {
    try {
      const response = await this.functions.call('google2FA', {
        action: TwoFa.Verify,
        code: this.authCode.value
      });
      this.snackBar.open(response.message, 'X', {duration: 2500});
      if (response.success) {
        this.dialogRef.close({success: true});
      } else {
        this.wrongCode = true;
        this.authCode.setErrors({incorrect: true});
      }
    } catch (error) {
      this.snackBar.open('Verification failed.', 'X', {duration: 2000});
    } finally {
      this.checking = false;
    }
  }

  getErrorMessage(): string {
    this.checking = false;
    if (this.authCode.hasError('required')) return 'You must fill the numbers.';
    if (this.authCode.hasError('incorrect')) return 'Wrong Code! Try again.';
    return '';
  }

  isValid(response: { success: boolean; message: string }): boolean {
    if (!response) {
      this.snackBar.open('No response from cloud!', 'X', {duration: 2000});
      return false;
    }
    if (!response.success) {
      this.snackBar.open('Barcode generation failed!', 'X', {duration: 2000});
      return false;
    }
    return true;
  }
}
