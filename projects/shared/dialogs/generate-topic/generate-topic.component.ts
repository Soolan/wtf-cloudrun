import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {FlowStatus, SourceType} from '@shared/enums';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {Flow, FlowState, TopicGeneratorPayload} from '@shared/interfaces';
import {FlowService, FunctionsService} from '@shared/services';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {Subscription} from 'rxjs';
import {MAX_FILE_SIZE} from '@shared/constants';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatProgressSpinner} from "@angular/material/progress-spinner";

@Component({
  selector: 'lib-generate-topic',
  imports: [
    MatTabGroup,
    MatTab,
    MatIcon,
    MatLabel,
    MatFormField,
    MatInput,
    ReactiveFormsModule,
    MatButton,
    MatError,
    MatIconButton,
    MatProgressBar,
    MatProgressSpinner,
  ],
  templateUrl: './generate-topic.component.html',
  styleUrl: './generate-topic.component.scss',
  standalone: true,
})
export class GenerateTopicComponent implements OnInit, OnDestroy {
  private dialogRef = inject(MatDialogRef<GenerateTopicComponent>);
  private functions = inject(FunctionsService);
  private flowService = inject(FlowService);
  private snackbar = inject(MatSnackBar);
  protected data = inject(MAT_DIALOG_DATA);

  generating = signal<boolean>(false);
  flowMessages = signal<string[]>([]);
  flowProgress = signal<number>(0);
  flowStatus = signal<FlowStatus | null>(null);
  private flowSubscription: Subscription | undefined;

  urlFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern(/^(https?:\/\/)?([\w\d-]+\.)+[\w-]{2,4}(\/.+)*\/?$/)
  ]);
  fileFormControl = new FormControl<File | null>(null, Validators.required);
  selectedFileName = '';
  selectedFile: File | null = null;

  resourceFormControl = new FormControl(0); // Default to first tab

  ngOnInit() {
    console.log(this.data);
    this.fileFormControl.reset();
    this.urlFormControl.reset();
  }

  ngOnDestroy() {
    this.flowSubscription?.unsubscribe();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    if (this.isAudioOrVideoFile(file)) {
      this.selectedFile = null;
      this.selectedFileName = '';
      this.fileFormControl.setValue(null);
      this.fileFormControl.setErrors({ audioOrVideoNotAllowed: true });
      this.fileFormControl.markAsTouched();
      return;
    }

    if (file.size <= MAX_FILE_SIZE) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.fileFormControl.setValue(file);
      this.fileFormControl.setErrors(null);
    } else {
      this.selectedFile = null;
      this.selectedFileName = '';
      this.fileFormControl.setValue(null);
      this.fileFormControl.setErrors({fileTooLarge: true});
      this.fileFormControl.markAsTouched();
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.selectedFileName = '';
    this.fileFormControl.reset();
  }

  setTab(index: number): void {
    this.resourceFormControl.setValue(index);
    if (index === 0) this.urlFormControl.reset();
    else if (index === 1) this.removeFile();
  }

  async generate() {
    this.generating.set(true);
    const payload: any = await this.getPayload();
    if (!payload) {
      this.generating.set(false);
      return;
    }

    const flowData: Partial<Flow> = {
      function: 'genTopic',
      path: payload.path,
    };

    try {
      const flowId = await this.flowService.addFlow(flowData);
      payload.flowId = flowId;
      this.monitorFlow(flowId);
      console.log(payload)
      await this.functions.call('generateTopic', payload);
    } catch (error) {
      this.handleError(error);
    }
  }

  monitorFlow(flowId: string) {
    console.log(flowId)
    this.flowSubscription = this.flowService.monitorFlow(flowId).subscribe((flowState: FlowState) => {
      this.flowMessages.set([...flowState.messages]);
      this.flowProgress.set(flowState.progress);
      this.flowStatus.set(flowState.status);

      if (flowState.status === FlowStatus.Completed) {
        this.snackbar.open(flowState.messages[flowState.messages.length - 1], 'X', {duration: 3500});
        setTimeout(() => {
          this.dialogRef.close({success: true, docId: flowState.result?.docId});
          this.generating.set(false);
        }, 3000);

        this.flowSubscription?.unsubscribe();
      } else if (flowState.status === FlowStatus.Error) {
        this.handleError(flowState.error ?? 'An unknown flow error occurred.');
        this.flowSubscription?.unsubscribe();
      }
    });
  }

  handleError(error: any) {
    this.generating.set(false);
    const message = typeof error === 'string' ? error : error?.message ?? 'Unknown error occurred';
    this.snackbar.open(message, 'X', {duration: 7000});
  }

  async getPayload(): Promise<TopicGeneratorPayload | null> {
    const tab = this.resourceFormControl.value;

    if (tab === 1) { // URL Tab
      const url = this.urlFormControl.value;
      if (!url || this.urlFormControl.invalid) {
        this.snackbar.open('A valid URL is required. Video URLs are not supported.', 'X', {duration: 3000});
        return null;
      }
      return {
        url,
        mimeType: 'text/html',
        sourceType: SourceType.Url,
        creator: this.data.creator,
        order: this.data.order,
        parentId: this.data.parentId,
        path: this.data.path
      };
    } else if (tab === 0) { // File Tab
      const file = this.fileFormControl.value;
      if (!file) {
        this.snackbar.open('A valid file is required.', 'X', {duration: 3000});
        return null;
      }

      return {
        file: await this.readAsBase64(file),
        mimeType: file.type || 'application/octet-stream',
        sourceType: SourceType.File,
        creator: this.data.creator,
        order: this.data.order,
        parentId: this.data.parentId,
        path: this.data.path
      };
    }
    return null;
  }

  private readAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = (reader.result as string).split(',')[1];
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  cancel(): void {
    this.dialogRef.close({success: false});
  }

  isAudioOrVideoLink(): boolean {
    const url = this.urlFormControl.value;
    if (!url) return false;

    // Normalize the input
    const normalized = url.trim().toLowerCase();

    // Known video/audio hosting platforms
    const knownPlatforms = [
      'youtube.com', 'youtu.be', 'vimeo.com',
      'dailymotion.com', 'soundcloud.com',
      'spotify.com'
    ];

    try {
      const parsedUrl = new URL(normalized);

      // Check for known platforms
      if (knownPlatforms.some(domain => parsedUrl.hostname.includes(domain))) {
        return true;
      }

      // Check for common audio/video file extensions
      const audioVideoExtensions = [
        '.mp3', '.wav', '.ogg', '.m4a', // audio
        '.mp4', '.webm', '.mov', '.avi', '.mkv' // video
      ];

      if (audioVideoExtensions.some(ext => parsedUrl.pathname.endsWith(ext))) {
        return true;
      }
    } catch {
      // Invalid URL string — do nothing
    }
    return false;
  }

// Utility to detect audio/video uploads
  private isAudioOrVideoFile(file: File): boolean {
    // First try MIME type
    if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
      return true;
    }

    // Fallback: check extension
    const audioVideoExtensions = [
      '.mp3', '.wav', '.ogg', '.m4a', // audio
      '.mp4', '.webm', '.mov', '.avi', '.mkv' // video
    ];
    const lowerName = file.name.toLowerCase();
    return audioVideoExtensions.some(ext => lowerName.endsWith(ext));
  }

  get canGenerateTopic(): boolean {
    const tab = this.resourceFormControl.value;
    if (this.generating()) return false;
    if (tab === 0) return this.fileFormControl.valid;
    if (tab === 1) return this.urlFormControl.valid;
    return false;
  }

  protected readonly FlowStatus = FlowStatus;
}
