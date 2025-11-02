import {Directive, EventEmitter, Output, HostListener} from '@angular/core';

@Directive({
  selector: '[libDropzone]',
  standalone: true
})
export class DropzoneDirective {
  @Output() dropped = new EventEmitter<FileList>();
  @Output() hovered = new EventEmitter<boolean>();

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'copy'; // Explicitly show "copy" effect
    this.hovered.emit(true);
  }

  @HostListener('dragleave')
  onDragLeave(): void {
    this.hovered.emit(false);
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.dropped.emit(files);
    }
    this.hovered.emit(false);
  }
}
