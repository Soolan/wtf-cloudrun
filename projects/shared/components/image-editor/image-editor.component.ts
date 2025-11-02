import {AfterViewInit, Component, EventEmitter, inject, Input, Output, signal} from '@angular/core';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {ImageCroppedEvent, LoadedImage} from 'ngx-image-cropper';
import {MediaType} from '@shared/interfaces';
import {AspectRatio, MediaCategory} from '@shared/enums';

@Component({
  selector: 'lib-image-editor',
  standalone: true,
  imports: [],
  templateUrl: './image-editor.component.html',
  styleUrl: './image-editor.component.scss',
})
export class ImageEditorComponent implements AfterViewInit {
  private sanitizer = inject(DomSanitizer);

  @Input() imageChangedEvent?: any;
  @Input() imageURL?: string;
  @Input() media?: MediaType;
  @Output() cropped = new EventEmitter<Blob>();

  croppedImage = signal<SafeUrl | null>(null);
  croppedBlob = signal<Blob | null>(null);
  maintainAspectRatio = signal(true);
  aspectRatio = signal<AspectRatio | null>(null);

  ngAfterViewInit(): void {
    if (!this.media) return;

    if (this.media.type === MediaCategory.Image) {
      this.maintainAspectRatio.set(false);
    }
    if (this.media.type === MediaCategory.Banner) {
      this.aspectRatio.set(AspectRatio.Wide);
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    if (event.objectUrl) {
      this.croppedImage.set(this.sanitizer.bypassSecurityTrustUrl(event.objectUrl));
    }
    if (event.blob) {
      this.croppedBlob.set(event.blob);
      this.cropped.emit(event.blob);
    }
  }

  imageLoaded(image?: LoadedImage) {
    // Handle image loaded event if needed
  }

  cropperReady() {
    // Handle cropper ready event if needed
  }

  loadImageFailed() {
    // Handle image load failure if needed
  }
}
