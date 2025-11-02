import {Timestamp} from '@angular/fire/firestore';
import {Product} from '@shared/enums';

export interface Release {
  version: string;
  date: Timestamp;
  features: string[];
  improvements: string[];
  fixes: string[];
  operations: string[];
  product: Product;
}

export interface ReleaseWithId extends Release {
  id: string;
}

export interface Quarter {
  quarter: string;
  items: string[];
}

export interface Sprint {
  no: number;
  date: number;
}
