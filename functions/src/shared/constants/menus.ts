import {SubMenu} from '../interfaces/sub-menu';

export const CONSOLE_NAV: SubMenu[] = [
  {
    name: 'Team',
    icon: 'groups_2',
    route: ['team'],
  },
  {
    name: 'Tickets',
    icon: 'confirmation_number',
    route: ['tickets'],
  },
  {
    name: 'Playbook',
    icon: 'import_contacts',
    route: ['playbook'],
  },
  {
    name: 'Marketplace',
    icon: 'storefront',
    route: ['marketplace'],
  },
  {
    name: 'Subscription',
    icon: 'credit_card',
    route: ['subscription'],
  },
];

export const PROFILE_NAV: SubMenu[] = [
  {name: 'Profile', icon:'account_circle', route: ['profile'] },
  // {label: 'Wallet', icon:'account_balance_wallet' },
  {name: 'Console', icon:'space_dashboard', route: ['console'] },
  {name: 'Logout', icon: 'logout', route: ['home']},
];

