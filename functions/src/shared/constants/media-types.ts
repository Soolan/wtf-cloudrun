import {MediaType} from '../interfaces';
import {AspectRatio, MediaCategory} from '../enums';

export const MEDIA_TYPES: MediaType[] = [
  {
    type: MediaCategory.Image,
    formats: 'jpg, jpeg, png, gif, webp, svg',
    maxSize: 5 * 1024 * 1024
  },
  {
    type: MediaCategory.Video,
    formats: 'mp4, webm, qt, avi, mov, mkv, 3gp, m4v',
    maxSize: 30 * 1024 * 1024
  },
  {
    type: MediaCategory.Audio,
    formats: 'mp3, wav, mid, opus',
    maxSize: 10 * 1024 * 1024
  },
  {
    type: MediaCategory.Text,
    formats: 'txt, md, csv',
    maxSize: 2 * 1024 * 1024
  },
  {
    type: MediaCategory.Application,
    formats: 'bpmn, pdf, doc, docx, xls, xlsx, ppt, pptx, odt, epub, json',
    maxSize: 20 * 1024 * 1024
  },
  {type: MediaCategory.Archive, formats: '', maxSize: 0},
  {type: MediaCategory.Font, formats: '', maxSize: 0},
  {type: MediaCategory.Other, formats: '', maxSize: 0},
];

/*======================== Max file sizes ========================
  Text:  1024 * 1024              1 MB
  Image: 2 * 1024 * 1024          2 MB
  Audio: 10 * 1024 * 1024        10 MB
  Application: 20 * 1024 * 1024  20 MB
  Video: 50 * 1024 * 1024        30 MB
* ======================== Max file sizes ======================== */

export const MAX_FILE_SIZE = 716800; // 700KB

export const AVATAR_MEDIA: MediaType = {
  type: MediaCategory.Avatar,
  formats: 'jpg png gif webp svg',
  maxSize: 0.5 * 1024 * 1024,
  aspectRatio: AspectRatio.Square,
  maxWidth: 360,
  maxHeight: 360
}

export const OTHER_MEDIA: MediaType = {
  type: MediaCategory.Other,
  formats: 'all formats',
  maxSize: 0.5 * 1024 * 1024,
}

export const LOGO_MEDIA: MediaType = {
  type: MediaCategory.Logo,
  formats: 'jpg png gif webp svg',
  maxSize: 0.5 * 1024 * 1024,
  aspectRatio: AspectRatio.Square,
  maxWidth: 300,
  maxHeight: 300
}

export const BANNER_MEDIA: MediaType = {
  type: MediaCategory.Banner,
  formats: 'jpg png gif webp svg',
  maxSize: 2 * 1024 * 1024,
  aspectRatio: AspectRatio.Wide,
  maxWidth: 1408,
  maxHeight: 300
}
export const IMAGE_MEDIA: MediaType = {
  type: MediaCategory.Image,
  formats: 'jpg png gif webp svg',
  maxSize: 2 * 1024 * 1024,
  aspectRatio: AspectRatio.Portrait
}

export const ALL_IMAGE_TYPES = [
  MediaCategory.Image, MediaCategory.Logo, MediaCategory.Banner, MediaCategory.Avatar
];
