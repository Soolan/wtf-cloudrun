import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { NgIf, DecimalPipe } from '@angular/common';
import { StorageReference, UploadTask, UploadTaskSnapshot } from '@angular/fire/storage';
import {StorageService} from '@shared/services';

interface Uploader {
  downloadURL: string;
  filePath: string;
}

@Component({
  selector: 'lib-upload-task',
  templateUrl: './upload-task.component.html',
  styleUrls: ['./upload-task.component.scss'],
  standalone: true,
  imports: [
    DecimalPipe,
    NgIf
  ]
})
export class UploadTaskComponent implements OnInit, OnChanges {
  @Input() file?: File;
  @Input() currentFile: string = '';
  @Input() path: string = '';
  @Output() uploaderEvent = new EventEmitter<Uploader>();

  task?: UploadTask;
  ref?: StorageReference;
  percentage: number = 0;
  snapshot?: UploadTaskSnapshot;
  downloadURL?: string;

  constructor(private storage: StorageService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentFile']?.currentValue) {
      this.initUpload();
    }
  }

  ngOnInit(): void {
    this.initUpload();
  }

  private initUpload(): void {
    if (this.currentFile) {
      this.ref = this.storage.getRef(this.currentFile);
      this.emitUploaderEvent();
    } else if (this.file && this.path) {
      this.ref = this.storage.getRef(`${this.path}/${this.file.name}`);
      this.task = this.storage.upload(this.ref, this.file);
      this.startUpload();
    }
  }

  private startUpload(): void {
    if (!this.task) return;

    this.task.on(
      'state_changed',
      (snapshot) => {
        this.snapshot = snapshot;
        this.percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      },
      (error) => this.handleUploadError(error),
      () => this.emitUploaderEvent()
    );
  }

  private emitUploaderEvent(): void {
    if (!this.ref) return;

    this.storage.getLink(this.ref).then((url) => {
      this.downloadURL = url;
      this.uploaderEvent.emit({ downloadURL: url, filePath: this.ref!.fullPath });
    });
  }

  private handleUploadError(error: any): void {
    console.error('Upload error:', error);
    const messages: Record<string, string> = {
      'storage/unauthorized': 'You don’t have permission to access this file.',
      'storage/canceled': 'Upload was canceled.',
      'storage/unknown': 'An unknown error occurred. Please try again.',
    };
    alert(messages[error.code] || 'An error occurred during the upload.');
  }

  isActive(snapshot?: UploadTaskSnapshot): boolean {
    return snapshot?.state === 'running' && snapshot.bytesTransferred < snapshot.totalBytes;
  }
}
