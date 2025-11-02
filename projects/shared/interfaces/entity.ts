import {EntityType} from '@shared/enums';

export interface Entity {
  name: string;
  role?: string;
  avatar?: string;
  type?: EntityType;
}
