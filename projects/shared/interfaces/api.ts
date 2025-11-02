import {KeyValue} from '@angular/common';
import {Entity, Timestamps} from '@shared/interfaces';
import {HttpMethod} from '@shared/enums';
import {ApiCategory} from '@shared/enums/api-category';

export interface Api {
  name: string; // Display name for the integration (e.g., "GitHub")
  intro?: string;  // Brief (one sentence) explanation on what it does.
  howTo?: string; // path to API doc. i.e. docs.wtf.pub/integrations/github
                  // which explains what it does, how it works and how to setup creds
  logo: string;
  baseUrl: string; // Base URL for the API (e.g., "https://api.github.com")
  headers?: KeyValue<string, string>[]; // Default headers
  isPrivate: boolean; // if true the api will be available to the publisher only
                    // From UX/UI point it means, this control should be available only to:
                    //  - admin
                    //  - Api publisher
  isVerified: boolean;
  tags?: ApiCategory[];
  installs: number;

  // Other optional properties
  publisher?: Entity;
  timestamps: Timestamps;
}

export interface ApiWithId extends Api {
  id: string;
}

// A sub-collection within apis collection
export interface ApiEndpoint {
  name: string; // Action name (e.g., "Create Pull Request")
  description?: string; // Optional description for the endpoint
  path: string; // Endpoint path (e.g., "/repos/:owner/:repo/pulls")
  resource: string; // As in API resource (e.g. repos)
  method: HttpMethod; // HTTP method (GET, POST, etc.)
  permissions?: string[]; // Optional: Required permissions (e.g., ["repo", "pull_requests"])
  requestBody?: any; // Expected request body (if any)
  payloadTemplate?: string; // JSON string with placeholders (e.g., "{{commit_message}}")
  queryParams?: KeyValue<string, string>[]; // Query parameters with placeholders
  testable?: boolean; // Whether this endpoint can be tested
}

export interface ApiEndpointWithId extends ApiEndpoint {
  id: string;
}
