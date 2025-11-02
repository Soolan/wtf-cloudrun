import {Component, inject, signal} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialogClose} from '@angular/material/dialog';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {ImageCropperComponent, ImageCroppedEvent, LoadedImage} from 'ngx-image-cropper';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MediaType} from '@shared/interfaces';
import {ProgressType} from '@shared/enums';

@Component({
  selector: 'lib-image-cropper',
  templateUrl: './crop-image.component.html',
  styleUrl: './crop-image.component.scss',
  standalone: true,
  imports: [
    ImageCropperComponent,
    MatIcon,
    MatButton,
    MatDialogClose,
  ],
})
export class CropImageComponent {
  private dialogRef = inject(MatDialogRef<CropImageComponent>);
  protected data = inject(MAT_DIALOG_DATA) as {
    imageURL: string,
    media: MediaType,
    imageChangedEvent: any,
  };
  private sanitizer = inject(DomSanitizer);

  croppedImage = signal<SafeUrl | null>(null);
  croppedBlob = signal<Blob | null>(null);

  maintainAspectRatio = true;

  imageCropped(event: ImageCroppedEvent) {
    if (event.objectUrl) {
      this.croppedImage.set(this.sanitizer.bypassSecurityTrustUrl(event.objectUrl));
    }
    if (event.blob) {
      this.croppedBlob.set(event.blob);
    }
  }

  get aspectRatio(): number {
    const w: number = this.data?.media?.maxWidth || 0;
    const h: number = this.data?.media?.maxHeight || 0;
    if (!this.data.media || h === 0 || w === 0) return 1; // default fallback || avoid division by zero
    return w / h;
  }

  send() {
    this.dialogRef.close({cropped: this.croppedBlob()});
  }

  imageLoaded(image?: LoadedImage) {
  }

  cropperReady() {
    // Handle cropper ready event if needed
  }

  loadImageFailed() {
  }

  protected readonly ProgressType = ProgressType;
}
