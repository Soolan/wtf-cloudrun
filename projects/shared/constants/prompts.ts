import {BackgroundStyle, LogoStyle, PersonaEthnicity, PersonaOutfit} from '@shared/enums';
import {AvatarPrompt, BannerPrompt, LogoPrompt} from '@shared/interfaces';
import {environment} from '../../website/src/environments/environment';

export const AVATAR_PROMPT: AvatarPrompt = {
  gender: "woman",
  lensPurpose: "35mm portrait",
  ethnicity: PersonaEthnicity.African,
  age: 30,
  outfit: PersonaOutfit.Cocktail,
  details: ""
};

// A minimalist logo for a health care company on a solid color background. Include the text Journey.
export const LOGO_PROMPT: LogoPrompt = {
  style: LogoStyle.Modern,
  business: "Wellness",
  background: BackgroundStyle.Solid,
  details: "" // Include the text Hope
};

// A minimal banner for a health care company. Include the text Journey.
export const BANNER_PROMPT: BannerPrompt = {
  style: BackgroundStyle.Abstract,
  business: "Wellness",
  details: "",
};

export const GEMINI_15_FLASH = 'gemini-1.5-flash';
export const GEMINI_15_TEXT = 'gemini-1.5-text';
export const IMAGEN_3 = 'imagen-3.0-generate-topic-001';
export const IMAGEN_3_FAST = 'imagen-3.0-fast-generate-topic-001';
export const IMAGEN_3_FAST_ENDPOINT =
  `https://us-central1-aiplatform.googleapis.com/v1/projects/${environment.firebase.projectId}/locations/us-central1/publishers/google/models/${IMAGEN_3_FAST}:predict`;

// src/app/constants/token-data.ts
import { KeyValue } from '@angular/common'; // Import KeyValue

export const AI_TOKEN_USAGE: KeyValue<string, string>[] = [
  {
    key: 'Characters',
    value: '1 token is roughly equivalent to 4 characters. (Basic plan: 25k tokens = ~100k characters).'
  },
  {
    key: 'Words',
    value: '1 token is roughly equivalent to 3/4 of a word in English. (Basic plan: 25k tokens = ~20,000 words).'
  },
  {
    key: 'Images',
    value: 'Small images (e.g., up to 384x384 pixels) might count as a fixed number of tokens (e.g., 258 tokens for ' +
      'Gemini 2.5 or 100 small images in Basic plan). Larger images can be tiled, with each tile counting as tokens.'
  },
  {
    key: 'Video',
    value: 'Video is converted to tokens at a fixed rate (e.g., 263 tokens per second).'
  },
  {
    key: 'Audio',
    value: 'Audio is also converted to tokens at a fixed rate (e.g., 32 tokens per second).'
  }
];
