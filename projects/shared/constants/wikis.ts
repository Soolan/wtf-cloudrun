import {WikiCard} from '@shared/interfaces/wiki';

export const WIKI_COMPANY_CARD: WikiCard = {
  route: 'company',
  title: 'Company Settings',
  subtitle: 'All the necessary configurations and branding for a company.',
  icon: 'home',
  image: 'company-card.webp',
  alt: 'All the necessary configurations and branding for a company.',
  content: [
    'Decide the industry/business',
    'Generate or upload logo and banner for companies.',
    'Setup name, descriptions',
    'Backup/restore the company data'
  ]
}

export const WIKI_TEAM_CARD: WikiCard = {
  route: 'team',
  title: 'Organizational Chart',
  subtitle: 'Team setup (C-suite and departments) for your business.',
  icon: 'groups_2',
  image: 'team-card.webp',
  alt: 'Setup C-suite and their departments and teams for your business.',
  content: [
    'Define all the AI employees in your company',
    'Generate or upload avatars.',
    'Decide their race, gender, age, ...',
    'Define their position within your company'
  ]
}

export const WIKI_TASKS_CARD: WikiCard = {
  route: 'tickets',
  title: 'Ticket Management',
  subtitle: 'A kanban board to create, discuss, assign and deliver tasks.',
  icon: 'confirmation_number',
  image: 'tasks-card.webp',
  alt: 'A kanban board to create, discuss, assign and deliver tasks.',
  content: [
    'Create tasks and assign them to C-Suite or employees.',
    'Witness the clarification flow over tasks.',
    'Observe the escalation and proposal events for tasks.',
    'Moderate, approve or reject the delivered tasks.'
  ]
}

export const WIKI_PLAYBOOK_CARD: WikiCard = {
  route: 'playbook',
  title: 'The Playbook ',
  subtitle: 'A detailed knowledge base for business processes.',
  icon: 'import_contacts',
  image: 'playbook-card.webp',
  alt: 'An AI and human friendly knowledge base that defines business processes.',
  content: [
    'A robust documentation for company policies and operations.',
    'BPMN 2 generator for clear processes.',
    'Vectorized knowledge base generator, suitable for RAG.',
    'Maintainer to organize topics under the right departments.'
  ]
}

export const WIKI_Marketplace_CARD: WikiCard = {
  route: 'marketplace',
  title: 'The Marketplace',
  subtitle: 'Selling or renting agents, teams, templates and APIs.',
  icon: 'storefront',
  image: 'marketplace-card.webp',
  alt: 'All in one shop for selling or renting agents, teams, templates and APIs.',
  content: [
    'Install/uninstall business components.',
    'Rent out your battle tested agents, teams, templates and APIs.',
    'Bring your own APIs and offer them publicly or privately.',
    'Rate and review marketplace items based on your experience.'
  ]
}

export const WIKI_SUBSCRIPTION_CARD: WikiCard = {
  route: 'subscription',
  title: 'Subscription Settings',
  subtitle: 'Necessary configurations for subscriptions and payments.',
  icon: 'credit_card',
  image: 'subscription-card.webp',
  alt: 'All the necessary configurations for subscriptions and payments.',
  content: [
    'Compare and pick from free, basic and pro subscriptions.',
    'Decide monthly or annual (%20 discount) payment cycles.',
    'Setup the payment methods.',
    'View/download usage reports.'
  ]
}

export const WIKI_ADMIN_CARD: WikiCard = {
  route: 'admin',
  title: 'Admin Settings',
  subtitle: 'Admin configurations: security, notifications and emails.',
  icon: 'person_4',
  image: 'admin-card.webp',
  alt: 'Admin configurations: security, in-app notifications and email settings.',
  content: [
    'Update credentials: email and password.',
    'Manage email security code.',
    'Setup and activate two factor authentication.',
    'Manage notifications and email subscriptions.',
  ]
}

export const WIKI_CARDS: WikiCard[] = [
  WIKI_COMPANY_CARD,
  WIKI_TEAM_CARD,
  WIKI_TASKS_CARD,
  WIKI_PLAYBOOK_CARD,
  WIKI_Marketplace_CARD,
  WIKI_SUBSCRIPTION_CARD,
  WIKI_ADMIN_CARD,
]
