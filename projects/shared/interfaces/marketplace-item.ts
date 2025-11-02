import {Entity, Timestamps} from '@shared/interfaces';
import {MarketplaceItemType} from '@shared/enums';

export interface MarketplaceItem {
  type: MarketplaceItemType;
  name: string;
  subtitle?: string;
  intro?: string;
  tags?: string[];
  logo?: string;
  publisher?: Entity;
  verified?: boolean;
  installs?: number;
  private?: boolean;
  howTo?: string;
  settings?: string;
  refId?: string;
  timestamps?: Timestamps;
}

export interface MarketplaceItemWithId extends MarketplaceItem {
  id: string;
}

export interface MarketplaceFilter {
  search?: string;
  types?: MarketplaceItemType[];
  installedOnly?: boolean;
}
