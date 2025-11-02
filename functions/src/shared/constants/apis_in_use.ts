import {NOW} from '../constants';
import {ApiInUse, ApiInUseWithId, WtfQuery} from '../interfaces';
import {AuthType} from '../enums';

export const APIS_IN_USE: WtfQuery = {
  path: 'apis',
  limit: 200,
  where: {field: 'timestamps.created_at', operator: '>', value: 0},
  orderBy: {field: 'timestamps.created_at', direction: 'desc'}
}

export const API_IN_USE: ApiInUse = {
  apiId: '',
  authType: AuthType.NONE, // Enum representing supported authentication types
  credentials: {
    apiKey: '', // For API_KEY auth
    token: '', // For BEARER auth
    username: '', // For BASIC auth
    password: '', // For BASIC auth
    clientId: '', // For OAUTH2
    clientSecret: '', // For OAUTH2
    accessToken: '', // For OAUTH2
    refreshToken: '', // Optional for OAUTH2
  },
  active: false,
  timestamps: NOW,
};

export const APIS_IN_USE_MOCK: ApiInUseWithId[] = [
  {
    id: '1',
    apiId: 'github-005',
    authType: AuthType.NONE, // Enum representing supported authentication types
    credentials: {
      apiKey: '', // For API_KEY auth
      token: '', // For BEARER auth
      username: '', // For BASIC auth
      password: '', // For BASIC auth
      clientId: '', // For OAUTH2
      clientSecret: '', // For OAUTH2
      accessToken: '', // For OAUTH2
      refreshToken: '', // Optional for OAUTH2
    },
    active: true,
    timestamps: NOW,
  },
  {
    id: '2',
    apiId: 'stripe-002',
    authType: AuthType.NONE, // Enum representing supported authentication types
    credentials: {
      apiKey: '', // For API_KEY auth
      token: '', // For BEARER auth
      username: '', // For BASIC auth
      password: '', // For BASIC auth
      clientId: '', // For OAUTH2
      clientSecret: '', // For OAUTH2
      accessToken: '', // For OAUTH2
      refreshToken: '', // Optional for OAUTH2
    },
    active: true,
    timestamps: NOW,
  },
  {
    id: '3',
    apiId: 'slack-003',
    authType: AuthType.NONE, // Enum representing supported authentication types
    credentials: {
      apiKey: '', // For API_KEY auth
      token: '', // For BEARER auth
      username: '', // For BASIC auth
      password: '', // For BASIC auth
      clientId: '', // For OAUTH2
      clientSecret: '', // For OAUTH2
      accessToken: '', // For OAUTH2
      refreshToken: '', // Optional for OAUTH2
    },
    headers: [
      {key: 'Coolest-custom-header', value: 'Yo head!'},
      {key: 'peace', value: 'bruh!!!'},
    ],
    active: false,
    timestamps: NOW,
  },
];
