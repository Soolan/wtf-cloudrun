import {MarketplaceInstallWithId, MarketplaceItemWithId, WtfQuery} from '../interfaces';
import {InstallStatus, MarketplaceItemType} from '../enums';
import {NOW} from '../constants/timestamps';

export const MARKETPLACE_ITEMS: WtfQuery = {
  path: 'marketplace_items',
  limit: 1000,
  where: {field: 'timestamps.created_at', operator: '!=', value: 0},
  orderBy: {field: 'timestamps.created_at', direction: 'desc'}
};

export const MARKETPLACE_INSTALLS: WtfQuery = {
  path: 'marketplace_installs',
  limit: 100,
  where: {field: 'status', operator: '==', value: InstallStatus.Installed},
  orderBy: {field: 'installedAt', direction: 'desc'}
};

export const MOCK_MARKETPLACE_ITEMS: MarketplaceItemWithId[] = [
  {
    id: 'item-001',
    type: MarketplaceItemType.Team,
    name: 'Dev Team Package',
    subtitle: 'Full-stack developer team',
    intro: 'A preconfigured team of developers. They are trained to do stack and cloud. They are well trained',
    tags: ['developers', 'team', 'fullstack'],
    logo: 'https://via.placeholder.com/150',
    publisher: {avatar: '',  id: 'author-001', name: 'John Doe' },
    verified: true,
    installs: 120,
    private: false,
    howTo: 'Simply click install to add the team.',
    settings: '{"roles":["frontend","backend","devops"]}',
    refId: undefined,
    timestamps: NOW
  },
  {
    id: 'item-002',
    type: MarketplaceItemType.Api,
    name: 'AI API Integration',
    subtitle: 'Powerful AI APIs',
    intro: 'Integrate AI into your business easily.',
    tags: ['ai', 'api', 'integration'],
    logo: 'https://via.placeholder.com/150',
    publisher: {avatar: '',  id: 'author-002', name: 'Jane Smith' },
    verified: true,
    installs: 45,
    private: false,
    howTo: 'Use API keys provided after installation.',
    settings: '{"apiKey":""}',
    refId: undefined,
    timestamps: NOW
  },
  {
    id: 'item-003',
    type: MarketplaceItemType.Playbook,
    name: 'Sales Playbook',
    subtitle: 'Sales process',
    intro: 'Step-by-step sales process.',
    tags: ['sales', 'playbook', 'b2b'],
    logo: 'https://via.placeholder.com/150',
    publisher: {avatar: '',  id: 'author-003', name: 'Acme Inc' },
    verified: false,
    installs: 12,
    private: false,
    howTo: 'Review steps inside playbook section.',
    settings: '{}',
    refId: undefined,
    timestamps: NOW
  },
  {
    id: 'item-004',
    type: MarketplaceItemType.Agent,
    name: 'AI Sales Agent',
    subtitle: 'AI powered sales assistant',
    intro: 'Pre-trained AI Sales Assistant.',
    tags: ['ai', 'agent', 'sales'],
    logo: 'https://via.placeholder.com/150',
    publisher: {avatar: '', id: 'author-004', name: 'AI Experts' },
    verified: true,
    installs: 33,
    private: false,
    howTo: 'Assign tasks to agent inside dashboard.',
    settings: '{}',
    refId: undefined,
    timestamps: NOW
  },
  {
    id: 'item-005',
    type: MarketplaceItemType.Company,
    name: 'Company Booster',
    subtitle: 'Startup kit',
    intro: 'Complete company setup package.',
    tags: ['company', 'booster', 'startup'],
    logo: 'https://via.placeholder.com/150',
    publisher: {avatar: '',  id: 'author-005', name: 'Biz Solutions' },
    verified: false,
    installs: 8,
    private: false,
    howTo: 'Walk through setup wizard after install.',
    settings: '{}',
    refId: undefined,
    timestamps: NOW
  }
];

export const MOCK_MARKETPLACE_INSTALLS: MarketplaceInstallWithId[] = [
  {
    id: 'item-001',
    installedAt: Date.now() - 100000,
    installedBy: { id: 'user-123', name: 'Current User', avatar: ''},
    status: InstallStatus.Installed,
    relatedPaths: ['team/abc123']
  },
  {
    id: 'item-004',
    installedAt: Date.now() - 50000,
    installedBy: { id: 'user-123', name: 'Current User', avatar: '' },
    status: InstallStatus.Installed,
    relatedPaths: ['agents/xyz456']
  }
];
