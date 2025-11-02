import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { BpaNode } from '@shared/interfaces/bpa';

@Component({
  selector: 'lib-bpa-node-picker',
  standalone: true,
  imports: [CommonModule, MatListModule, MatDialogModule],
  templateUrl: './bpa-node-picker.component.html',
  styleUrls: ['./bpa-node-picker.component.scss']
})
export class BpaNodePickerComponent {
  constructor(
    public dialogRef: MatDialogRef<BpaNodePickerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { availableNodes: BpaNode[] }
  ) {}

  onNodeSelected(node: BpaNode): void {
    this.dialogRef.close(node);
  }
}
