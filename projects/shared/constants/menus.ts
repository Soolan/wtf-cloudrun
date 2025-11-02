import {SubMenu} from '@shared/interfaces/sub-menu';

export const CONSOLE_NAV: SubMenu[] = [
  {
    name: 'Team',
    icon: 'groups_2',
    route: ['team'],
  },
  {
    name: 'Ticket',
    icon: 'confirmation_number',
    route: ['ticket'],
  },
  {
    name: 'Playbook',
    icon: 'import_contacts',
    route: ['playbook'],
  },
  {
    name: 'Process',
    icon: 'account_tree',
    route: ['bpm'],
  },
  {
    name: 'Workflow',
    icon: 'route',
    route: ['bpa'],
  },
];

export const WIKI_NAV: SubMenu[] = [
  {
    name: 'Overview',
    icon: 'summarize',
    route: ['overview'],
  },
  {
    name: 'Company',
    icon: 'home',
    route: ['company'],
  },
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
  {
    name: 'Admin',
    icon: 'person_4',  // person_raised_hand
    route: ['admin'],
  }
];


export const PROFILE_NAV: SubMenu[] = [
  {name: 'Profile', icon:'account_circle', route: ['profile'] },
  {name: 'Marketplace', icon: 'storefront', route: ['marketplace']},
  {name: 'Subscription', icon: 'credit_card', route: ['subscription']},
  // {label: 'Wallet', icon:'account_balance_wallet' },
  // {name: 'Console', icon:'space_dashboard', route: ['console'] },
  {name: 'Logout', icon: 'logout', route: ['home']},
];

