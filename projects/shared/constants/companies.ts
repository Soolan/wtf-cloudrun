import {Company, Crop, HostCompany} from '@shared/interfaces';
import {WtfQuery} from '@shared/interfaces/wtf-query';

export const COMPANIES: WtfQuery = {
  path: 'companies',
  limit: 500,
  where: {field: 'timestamps.created_at', operator: '>', value: 0},
  orderBy: {field: 'timestamps.created_at', direction: 'desc'}
};

export const COMPANY: Company = {
  name: 'New Company',
  logo: '',
  description: 'Add company description.',
  banner: '',
  website: '',
  email: '',
  tags: [],
  socials: [],
  domains: [],
  timestamps: {
    created_at: Date.now(),
    updated_at: Date.now(),
    deleted_at: 0
  }
};

export const NEW_COMPANY = 'new-company';

export const DNS_TXT_VERIFICATION = 'verify';

export const HOST_COMPANIES: HostCompany[] = [
  {url: 'academy.soolan.com', id: 'W4Z4r7qthHyZKs3Qu29U'}
]

export const LOGO_CROP: Crop = {
  maintainAspectRatio: true,
  aspectRatio: '1:1',
}

export const BANNER_CROP: Crop = {
  maintainAspectRatio: true,
  aspectRatio: '12:3',
}
