import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import {MatIconButton} from '@angular/material/button';

@Component({
  selector: 'lib-form-urls',
  standalone: true,
  imports: [CommonModule, MatIconModule, ClipboardModule, MatTooltipModule, MatIconButton],
  templateUrl: './form-urls.component.html',
  styleUrls: ['./form-urls.component.scss']
})
export class FormUrlsComponent {
  @Input() nodeId: string | null = null;
  productionUrl = '';

  constructor(private snackBar: MatSnackBar) {}

  ngOnChanges(): void {
    if (this.nodeId) {
      const baseUrl = window.location.origin;
      this.productionUrl = `${baseUrl}/form/${this.nodeId}`;
    }
  }

  onCopy(): void {
    this.snackBar.open('URL copied to clipboard!', 'Close', {
      duration: 2000,
    });
  }
}
