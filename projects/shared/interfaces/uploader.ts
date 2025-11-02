import {StorageReference} from '@angular/fire/storage';
import {AspectRatio, MediaCategory, SourceType} from '@shared/enums';
import {Entity} from '@shared/interfaces/entity';

export interface Uploader {
  downloadURL: string;
  filePath: string;
}

export interface References {
  fileRef: StorageReference;
  thumbRef: StorageReference;
}

export interface MediaType {
  type: MediaCategory;
  formats: string;
  minSize?: number;
  maxSize: number;
  aspectRatio?: AspectRatio; // "1:1" - 1024x1024 pixels (square)
                        // "9:16" - 768x1408 pixels          "16:9" - 1408x768 pixels
                        // "3:4" - 896x1280 pixel            "4:3" - 1280x896 pixels
  maxWidth?: number,
  maxHeight?: number,
}

export interface FileValidationRules extends MediaType {
  maxPages?: number;      // PDFs, DOCX
  maxDuration?: number;   // video, audio
  maxWords?: number;      // text
}

export interface Resource {
  name: string;
  url: string;
}

export interface TopicGeneratorPayload {
  url?: string;
  file?: string;
  transcript?: string;
  mimeType: string;
  sourceType: SourceType; //url, file, transcript
  creator: Entity;
  order: number;
  parentId: string;
  path: string;
}

export interface ResourceAnalysis {
  metadata: {
    type?: MediaCategory,
    pages?: number,
    duration?: string, // e.g. "5m 22s"
    wordCount?: number,
  },
  fitForSingleTopic: boolean,
  fitForMultipleTopics: boolean,
  estimatedTopicCount?: number,
  readyToGenerate: boolean
}
