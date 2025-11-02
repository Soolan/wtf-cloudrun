import {Entity, Timestamps} from '../interfaces';
import {HttpMethod, ApiCategory} from '../enums';

export interface KeyValue<K = string, V = any> {
  key: K;
  value: V;
}

export interface Api {
  name: string; // Display name for the integration (e.g., "GitHub")
  intro?: string;  // Brief (one sentence) explanation on what it does.
  howTo?: string; // Optional contents for the "Getting started" tab
  settings?: string; // Optional contents for the "Configurable parameters" tab
  billing?: string; // Optional contents for the "Billing" tab
  logo: string;
  baseUrl: string; // Base URL for the API (e.g., "https://api.github.com")
  headers?: KeyValue<string, string>[]; // Default headers
  private: boolean; // if true the api will be available to the publisher only
                    // From UX/UI point it means, this control should be available only to:
                    //  - admin
                    //  - Api publisher
  verified: boolean;
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
