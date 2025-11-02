import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./companies/companies.component').then(m => m.CompaniesComponent)
  },
  {
    path: 'subscription',
    loadComponent: () =>
      import('@shared/components/subscription/subscription.component').then(m => m.SubscriptionComponent)
  },
  {
    path: ':companyId',
    loadComponent: () =>
      import('./landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: ':companyId/onboarding-agent',
    loadComponent: () =>
      import('./onboarding-agent/onboarding-agent.component').then(m => m.OnboardingAgentComponent)
  },
  {
    path: ':companyId/team',
    loadComponent: () =>
      import('./team/team.component').then(m => m.TeamComponent)
  },
  {
    path: ':companyId/team/invite',
    loadComponent: () =>
      import('./team/invite/invite.component').then(m => m.InviteComponent)
  },
  {
    path: ':companyId/team/:memberId',
    loadComponent: () =>
      import('./team/member-edit/member-edit.component').then(m => m.MemberEditComponent)
  },
  {
    path: ':companyId/ticket',
    loadComponent: () =>
      import('@shared/components/kanban/kanban.component').then(m => m.KanbanComponent)
  },
  {
    path: ':companyId/ticket/:ticketId',
    loadComponent: () =>
      import('@shared/components/ticket/ticket.component').then(m => m.TicketComponent)
  },
  {
    path: ':companyId/playbook',
    loadComponent: () =>
      import('@shared/components/playbook/playbook.component').then(m => m.PlaybookComponent)
  },
  {
    path: ':companyId/playbook/:topicId',
    loadComponent: () =>
      import('@shared/components/topic/topic.component').then(m => m.TopicComponent)
  },
  {
    path: ':companyId/bpm',
    loadComponent: () =>
      import('@shared/components/bpm/bpm.component').then(m => m.BpmComponent)
  },
  {
    path: ':companyId/bpa',
    loadComponent: () =>
      import('@shared/components/bpa/bpa.component').then(m => m.BpaComponent)
  },
  {
    path: ':companyId/bpa/:workflowId',
    loadComponent: () =>
      import('@shared/components/bpa-editor/bpa-editor.component').then(m => m.BpaEditorComponent)
  },

  /*
  {
    path: ':companyId/integration',
    loadComponent: () =>
      import('@shared/components/apis-in-use/apis-in-use.component').then(m => m.ApisInUseComponent)
  },
  {
    path: ':companyId/integration/marketplace',
    loadComponent: () =>
      import('@shared/components/apis/apis.component').then(m => m.ApisComponent)
  },
  {
    path: ':companyId/integration/marketplace/:apiId',
    loadComponent: () =>
      import('@shared/components/apis/api/api.component').then(m => m.ApiComponent)
  },
   */
  {
    path: ':companyId/marketplace',
    loadComponent: () =>
      import('@shared/components/marketplace/marketplace.component').then(m => m.MarketplaceComponent)
  },
  {
    path: ':companyId/marketplace/:marketplaceItemId',
    loadComponent: () =>
      import('@shared/components/marketplace-item/marketplace-item.component').then(m => m.MarketplaceItemComponent)
  },
];
