import {BackgroundStyle, LogoStyle, PersonaEthnicity, PersonaOutfit} from '../enums';

export interface AvatarPrompt {
  gender: string;
  lensPurpose: string;
  ethnicity: PersonaEthnicity;
  age: number;
  outfit: PersonaOutfit;
  details?: string;
}

export interface LogoPrompt {
  style: LogoStyle;
  business: string;  // i.e. healthcare company
  background: BackgroundStyle;
  details?: string;  // i.e. Include the text Journey.
}

export interface BannerPrompt {
  style: BackgroundStyle;
  business: string;  // i.e. healthcare company
  details?: string;  // i.e. Include the slogan 'Because we can! on the right side of the banner'
}
