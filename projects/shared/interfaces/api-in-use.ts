import {AuthType} from '@shared/enums';
import {Timestamps} from '@shared/interfaces/timestamps';
import {KeyValue} from '@angular/common';
import {Credentials} from '@shared/interfaces/company';

export interface ApiInUse {
  apiId: string;
  authType: AuthType; // Enum representing supported authentication types
  credentials?: Credentials; // Credentials based on the selected authType
  headers?: KeyValue<string, string>[]; // Custom headers
  active: boolean;
  timestamps: Timestamps;
}

export interface ApiInUseWithId extends ApiInUse {
  id: string;
}
