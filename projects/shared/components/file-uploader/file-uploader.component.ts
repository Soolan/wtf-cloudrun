import {Component, EventEmitter, inject, Input, OnInit, Output, ViewChild} from '@angular/core';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AsyncPipe, NgForOf, NgIf, UpperCasePipe} from '@angular/common';
import {MatButton, MatIconButton, MatMiniFabButton} from '@angular/material/button';
import {FullMetadata, StorageReference} from '@angular/fire/storage';
import {Crop, MediaType, Uploader} from '@shared/interfaces';
import {MatIcon} from '@angular/material/icon';
import {DropzoneDirective} from '@shared/directives';
import {MatTooltip} from '@angular/material/tooltip';
import {CARD_FLIP} from '@shared/animations';
import {ALL_IMAGE_TYPES, MEDIA_TYPES} from '@shared/constants';
import {UploadTaskComponent} from './upload-task/upload-task.component';
import {StorageUrlPipe} from '@shared/pipes';
import {DialogConfigService, StorageService} from '@shared/services';
import {MediaCategory} from '@shared/enums';
import {
  CropImageComponent,
  LogoPromptComponent, AvatarPromptComponent, BannerPromptComponent, EditImageComponent
} from '@shared/dialogs';
import {CdkOverlayOrigin} from '@angular/cdk/overlay';

@Component({
  selector: 'lib-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.scss'],
  animations: [CARD_FLIP],
  standalone: true,
  imports: [
    AsyncPipe,
    DropzoneDirective,
    MatButton,
    MatIcon,
    MatIconButton,
    MatMiniFabButton,
    NgForOf,
    NgIf,
    StorageUrlPipe,
    UploadTaskComponent,
    UpperCasePipe,
    MatTooltip,
    CdkOverlayOrigin,
  ],
})
export class FileUploaderComponent implements OnInit {
  private configService = inject(DialogConfigService);
  private storageService = inject(StorageService);
  private snackbar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  @ViewChild('fileInput') fileInput: any;
  @Input() currentFile!: string;
  @Input() path!: string;
  @Input() canGenerate = false;
  @Input() media!: MediaType;
  @Input() minHeight!: number;
  @Input() crop?: Crop;
  @Output() uploaderEvents = new EventEmitter<Uploader>();

  dialogConfig: MatDialogConfig = {};
  isHovering = false;
  files: File[] = [];
  flipState: 'front' | 'back' = 'front';
  fileRef!: StorageReference;
  height!: number;
  cameWithMediaType = false;
  metaData!: FullMetadata;
  imageUrl!: string;

  async ngOnInit() {
    this.cameWithMediaType = !!this.media;
    this.height = this.minHeight || 15;
    this.dialogConfig = {...this.configService.getConfig(), height: '95%'};

    if (this.currentFile) {
      this.flipState = 'back';
      this.fileRef = this.storageService.getRef(this.currentFile);
      this.metaData = await this.storageService.getMeta(this.fileRef);
      this.imageUrl = await this.storageService.getLink(this.fileRef);
    }
  }

  async handleEvent($event: Uploader | undefined) {
    if ($event) {
      if (!$event.filePath) {
        this.reset();
      } else {
        this.currentFile = $event.filePath;
        this.fileRef = this.storageService.getRef(this.currentFile);
        this.metaData = await this.storageService.getMeta(this.fileRef);
      }
      this.uploaderEvents.emit($event);
    } else {
      this.flipState = 'front';
    }
  }

  toggleHover(event: boolean): void {
    this.isHovering = event;
  }

  onDrop(files: FileList): void {
    Array.from(files).forEach(file => this.files.push(file));
    this.flip();
  }

  browse(): void {
    this.fileInput.nativeElement.click();
  }

  onChangeFileInput(event: any): void {
    const file = this.fileInput.nativeElement.files[0];
    if (!file || !this.validate(file)) return;

    const type = file.type.split('/')[0];
    this.path += `/${file.name}`;
    this.setMedia(type);
    this.handleInputFile(event, file);
  }

  private handleInputFile(event: any, file: File) {
    const editable = ALL_IMAGE_TYPES.includes(this.media.type);
    if (editable) {
      // this.dialogConfig.data = {
      //   imageChangedEvent: event.base64 ? { target: { result: event.base64 } } : event,
      //   media: this.media
      // };
      // this.dialog.open(EditImageComponent, this.dialogConfig)
      //   .afterClosed()
      //   .subscribe(result => {
      //     this.files.push(result?.cropped ?? file);
      //     this.flip();
      //   });
      this.openCropper(event);
    } else {
      this.files.push(file);
      this.flip();
    }
  }

  setMedia(type: string): void {
    if (this.media) return;
    this.media = MEDIA_TYPES.find(media => media.type.toLowerCase() === type) || MEDIA_TYPES[0];
  }

  validate(file: File): boolean {
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const mediaType = MEDIA_TYPES.find(type => type.formats.includes(fileExtension));

    if (!mediaType) {
      this.snackbar.open('File format is not supported.', 'X', {duration: 4000});
      return false;
    }

    if (mediaType.maxSize && file.size > mediaType.maxSize) {
      this.snackbar.open(`File size exceeds max limit (${mediaType.maxSize/1024}MB) for ${mediaType.type}s.`, 'X', {
        duration: 4500
      });
      return false;
    }

    return true;
  }

  openCropper(event?: any): void {
    this.dialogConfig.data = {
      imageURL: this.imageUrl,
      media: this.media,
      imageChangedEvent: event
    };
    this.dialog.open(CropImageComponent, this.dialogConfig)
      .afterClosed()
      .subscribe(result => {
        if (result?.cropped) {
          this.files.push(result.cropped);
          this.flip();
        }
      });
  }

  flip(): void {
    this.flipState = this.flipState === 'front' ? 'back' : 'front';
  }

  delete(): void {
    // Remove the original file first
    const originalFile = this.currentFile.replace(/-resized\.webp$/, "-original.webp");
    const originalFileRef = this.storageService.getRef(originalFile);
    this.storageService.delete(originalFileRef);
    this.storageService.delete(this.fileRef);
    this.reset();
    this.uploaderEvents.emit({downloadURL: '', filePath: ''});
  }

  reset(): void {
    if (!this.crop) this.fileInput.nativeElement.value = null;
    if (!this.cameWithMediaType) this.media = {} as MediaType;
    // this.path = '';
    this.files = [];
    this.currentFile = '';
    this.metaData = {} as FullMetadata;
    this.flipState = 'front';
  }

  preview(): void {
    // ToDo: Implement the preview for audio, video, application and text categories
  }

  async edit() {
    const url = await this.getOriginalUrl();
    this.dialogConfig.data = {
      imageURL: url,
      media: this.media,
    };
    this.dialog.open(CropImageComponent, this.dialogConfig)
      .afterClosed()
      .subscribe(async result => {
        if (result?.cropped) {
          this.storageService.delete(this.fileRef);

          const resizedFile =
            await this.storageService.resize(result.cropped, this.media.maxWidth, this.media.maxHeight);

          const renamedFile = new File([resizedFile], this.currentFile.split('/').pop()!, {type: 'image/webp'});

          this.files = [renamedFile];

          this.currentFile = '';
        }
      });
  }

  async getOriginalUrl(): Promise<string> {
    if (!this.currentFile.includes("-resized.webp")) return this.imageUrl;
    const currentFile = this.currentFile.replace("-resized.webp", "-original.webp")
    const fileRef = this.storageService.getRef(currentFile);
    return await this.storageService.getLink(fileRef);
  }

  generate(regenerate = false): void {
    let prompt = '';
    if (regenerate) prompt = this.metaData.customMetadata ? this.metaData.customMetadata['prompt'] : '';
    this.dialogConfig.data = {prompt, filePath: this.filePath};

    switch (this.media.type) {
      case MediaCategory.Avatar:
        this.dialog.open(AvatarPromptComponent, this.dialogConfig).afterClosed().subscribe(result => {
          if (!result.success) return;
          this.currentFile = result.avatarPath;  // set the currentFile to path
          this.uploaderEvents.emit({
            downloadURL: result.avatarUrl,
            filePath: result.avatarPath,
          });
          this.flip();
        });
        break;

      case MediaCategory.Logo:
        this.dialog.open(LogoPromptComponent, this.dialogConfig).afterClosed().subscribe(result => {
          console.log(result);
          if (!result.success) return;
          this.currentFile = result.logoPath;  // set the currentFile to path
          this.uploaderEvents.emit({
            downloadURL: result.logoUrl,
            filePath: result.logoPath,
          });
          this.flip();
        });
        break;

      case MediaCategory.Banner:
        this.dialog.open(BannerPromptComponent, this.dialogConfig).afterClosed().subscribe(result => {
          console.log(result);
          if (!result.success) return;
          this.currentFile = result.bannerPath;  // set the currentFile to path
          this.uploaderEvents.emit({
            downloadURL: result.bannerUrl,
            filePath: result.bannerPath,
          });
          this.flip();
        });
        break;

      case MediaCategory.Image:
        this.dialogConfig.data = {
          filePath: this.filePath,
          generate: true,
          media: this.media,
        };
        this.dialog.open(EditImageComponent, this.dialogConfig)
          .afterClosed()
          .subscribe(result => {
            if (result) {
              this.currentFile = result.resized ?? this.filePath;  // set the currentFile to resized or original image
              this.flip();
            }
          });
        break;
    //
    //   case MediaCategory.Text:
    //     // ToDo: implement prompt dialog for plain text generation
    //     // It needs only prompt
    //     break;
    //
    //   case MediaCategory.Application:
    //     // ToDo: implement prompt dialog for application generation (docs, pdf, json, etc)
    //     break;
    //
    //   default:
    //     break;
    }
  }

  get filePath(): string {
    const timestamp = Math.floor(Date.now() / 1000); // now in seconds
    return `${this.path}/${this.media.type.toLowerCase()}-${timestamp}-original.webp`;
  }

  get details(): string {
    const {formats, minSize, maxSize, aspectRatio} = this.media;
    const minSizeText = minSize ? `Min size: ${(minSize / (1024 * 1024)).toFixed(2)} MB\n` : '';
    const maxSizeText = `Max size: ${(maxSize / (1024 * 1024)).toFixed(1)} MB\n`;
    return `Formats: ${formats}\n${minSizeText}${maxSizeText}Aspect ratio: ${aspectRatio}`;
  }


  get fileName(): string {
    const name = this.currentFile.split('/').pop();
    return name && name.length < 21 ? name : name?.slice(0, 17) + '...';
  }

  protected readonly MediaCategory = MediaCategory;
  protected readonly ALL_IMAGE_TYPES = ALL_IMAGE_TYPES;
}

