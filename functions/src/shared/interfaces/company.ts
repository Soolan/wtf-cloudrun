import {Social} from '../interfaces/social';
import {Timestamps} from '../interfaces/timestamps';
import {DnsVerificationStatus, Product} from '../enums';

export interface Company {
  name: string;
  logo: string;
  description?: string;
  website?: string;
  email?: string;
  banner: string;
  tags?: string[];
  socials?: Social[];
  domains?: CustomDomain[];
  timestamps: Timestamps;
}

export interface CompanyWithId extends Company {
  id: string;
}

export interface CustomDomain {
  wtfProduct: Product;
  timer: number;
  domain: string;         // i.e. academy.soolan.com
  forwardTo: string;      // i.e. learn.wtf.pub.  (pay attention to the dot at the end)
  status: DnsVerificationStatus;
  record: DnsRecord;
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
