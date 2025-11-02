import {AuthType} from '../enums';
import {Timestamps} from './timestamps';
import {KeyValue} from './api';

export interface ApiInUse {
  apiId: string;
  authType: AuthType; // Enum representing supported authentication types
  credentials?: ApiCredentials; // Credentials based on the selected authType
  headers?: KeyValue<string, string>[]; // Custom headers
  active: boolean;
  timestamps: Timestamps;
}

export interface ApiCredentials {
  apiKey?: string; // For API_KEY auth
  token?: string; // For BEARER auth
  username?: string; // For BASIC auth
  password?: string; // For BASIC auth
  clientId?: string; // For OAUTH2
  clientSecret?: string; // For OAUTH2
  accessToken?: string; // For OAUTH2
  refreshToken?: string; // Optional for OAUTH2
}

export interface ApiInUseWithId extends ApiInUse {
  id: string;
}
