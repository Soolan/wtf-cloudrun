import {Component, Input} from '@angular/core';
import {MatIconButton} from '@angular/material/button';
import {CdkCopyToClipboard} from '@angular/cdk/clipboard';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'lib-copy-button',
  imports: [
    MatIconButton,
    CdkCopyToClipboard,
    MatIcon
  ],
  templateUrl: './copy-button.component.html',
  standalone: true,
  styleUrl: './copy-button.component.scss'
})
export class CopyButtonComponent {
  @Input() clipboardText!: string;
  copied = false;

  copy() {
    setTimeout(() => {
      this.copied = false;
    }, 2000);
  }
}
