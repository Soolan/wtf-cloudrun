import {Api, ApiWithId, WtfQuery} from '../interfaces';
import {ApiCategory} from '../enums/api-category';

export const APIS: WtfQuery = {
  path: 'apis',
  limit: 1000,
  where: {field: 'timestamps.created_at', operator: '>', value: 0},
  orderBy: {field: 'timestamps.created_at', direction: 'desc'}
}

export const API: Api = {
  name: 'API name',
  logo: 'logos.png',
  baseUrl: 'https://api.example.com',
  howTo: 'Some description for the api',
  settings: 'Explain the configurable parameters here',
  billing: 'Billing policy, subscriptions, and rate limit by the API provider',
  private: true,
  verified: false,
  installs: 0,
  tags: [ApiCategory.AI],
  headers: [
    {key: 'Content-Type', value: 'application/json'},
  ],
  publisher: {
    id: 'user-001',
    name: 'John Smith',
    avatar: 'https://example.com/avatars/john.png',
  },
  timestamps: {
    created_at: Date.now(),
    updated_at: Date.now(),
    deleted_at: 0,
  },
};

export const API_MOCKS: ApiWithId[] = [
  {
    id: 'github-001',
    name: 'GitHub',
    logo: 'logos/github.png',
    baseUrl: 'https://api.github.com',
    intro: 'It integrates github to your company your soul your entire being in the universe and beyond.',
    howTo: 'Integration with GitHub for repository management. How you dune!?',
    settings: 'Explain the configurable parameters here',
    billing: 'Billing policy, subscriptions, and rate limit by the API provider',
    private: true,
    verified: true,
    installs: 0,
    tags: [ApiCategory.Development, ApiCategory.AI, ApiCategory.Messaging],
    headers: [
      {key: 'Authorization', value: 'Bearer {token}'},
      {key: 'Content-Type', value: 'application/json'},
    ],
    publisher: {
      id: 'user-001',
      name: 'GitHub',
      avatar: 'https://example.com/avatars/admin.png',
    },
    timestamps: {
      created_at: 1702204800000, // Example timestamp for creation
      updated_at: 1702291200000, // Example timestamp for last update
      deleted_at: 0, // Use 0 for no deletion
    },
  },
  {
    id: 'stripe-002',
    name: 'Stripe',
    logo: '',
    baseUrl: 'https://api.stripe.com',
    intro: 'It integrates Stripe and strip you away from your concerns and worries. soul your entire being in the universe and beyond.',
    howTo: 'Integration with Stripe for payment processing. I think I need another drink.',
    settings: 'Explain the configurable parameters here',
    billing: 'Billing policy, subscriptions, and rate limit by the API provider',
    private: true,
    verified: true,
    installs: 0,
    tags: [ApiCategory.AI],
    headers: [
      {key: 'Authorization', value: 'Bearer {apiKey}'},
      {key: 'Stripe-Version', value: '2022-11-15'},
    ],
    publisher: {
      id: 'user-002',
      name: 'Stripe',
      avatar: 'https://example.com/avatars/finance.png',
    },
    timestamps: {
      created_at: 1702118400000,
      updated_at: 1702204800000,
      deleted_at: 0,
    },
  },
  {
    id: 'slack-003',
    name: 'Slack',
    logo: 'logos/slack.png',
    baseUrl: 'https://slack.com/api',
    intro: 'I will let you know when I found out. K?',
    howTo: 'Integration with Slack for team communication. Tequila!!!',
    settings: 'Explain the configurable parameters here',
    billing: 'Billing policy, subscriptions, and rate limit by the API provider',
    private: true,
    verified: true,
    installs: 0,
    tags: [ApiCategory.Finance, ApiCategory.Database, ApiCategory.DevOps],
    headers: [
      {key: 'Authorization', value: 'Bearer {token}'},
      {key: 'Content-Type', value: 'application/json'},
    ],
    publisher: {
      id: 'user-003',
      name: 'Slack',
      avatar: 'https://example.com/avatars/team-lead.png',
    },
    timestamps: {
      created_at: 1702032000000,
      updated_at: 1702118400000,
      deleted_at: 0,
    },
  },
];
