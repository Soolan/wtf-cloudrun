import {Component, Inject, inject, signal} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialogClose } from '@angular/material/dialog';
import {ImageEditorComponent} from '@shared/components';

@Component({
  selector: 'lib-edit-image',
  standalone: true,
  imports: [],
  templateUrl: './edit-image.component.html',
  styleUrl: './edit-image.component.scss',
})
export class EditImageComponent {
  private dialogRef = inject(MatDialogRef<EditImageComponent>);
  private data = inject(MAT_DIALOG_DATA) as { image?: string };

  croppedImage = signal<Blob | null>(null);

  cropped(event: Blob) {
    this.croppedImage.set(event);
  }

  save() {
    this.dialogRef.close({ cropped: this.croppedImage() });
  }
}

