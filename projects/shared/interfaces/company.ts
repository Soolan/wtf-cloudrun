import {Social, Timestamps} from '@shared/interfaces';
import {AuthType, CompanyStatus, DnsVerificationStatus, Product} from '@shared/enums';

export interface Company {
  name: string;
  logo: string;
  description?: string;
  website?: string;
  email?: string;
  banner: string;
  bannerAlt?: string;
  tags?: string[];
  socials?: Social[];
  colorPalette?: string[];  // hex codes for 'primary', 'accent', 'warn'. ['#a387f4', '#b3829c', '#eeffaa']
  domains?: CustomDomain[];
  status?: CompanyStatus;
  timestamps: Timestamps;

  // Integrations
  mcpConnections?: MCPConnection[];
  defaultMCPNamespace?: string;
}
export interface CompanyWithId extends Company {
  id: string;
}

export interface MCPConnection {
  name: string; // e.g., 'n8n Automation Server'
  endpoint: string;
  authType: AuthType;
  description?: string;
  scopes?: string[];
  credentials?: Credentials; // Optional credential payload
}

export interface Credentials {
  apiKey?: string; // For API_KEY auth
  token?: string; // For BEARER auth
  username?: string; // For BASIC auth
  password?: string; // For BASIC auth
  clientId?: string; // For OAUTH2
  clientSecret?: string; // For OAUTH2
  accessToken?: string; // For OAUTH2
  refreshToken?: string; // Optional for OAUTH2
}

export interface CustomDomain {
  wtfProduct: Product;
  timer: number;
  domain: string;         // i.e. academy.soolan.com
  forwardTo: string;      // i.e. wtf.pub/console/{companyId}  (pay attention to the dot at the end)
  status: DnsVerificationStatus;
  record: DnsRecord;
  verifiedAt?: number;    // timestamp when DNS was verified
}

export interface DnsRecord {
  name: string; // HOSTNAME i.e. verify-wtflearn.soolan.com
  type: string; // TXT, A, CNAME
  data: string; // unique alpha numeric string
}

export interface HostCompany {
  url: string;
  id: string;
}
