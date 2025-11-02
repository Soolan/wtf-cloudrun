import {provideRouter, Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'overview',
    pathMatch: 'full',
  },
  {
    path: 'overview',
    loadComponent: () =>
      import('./overview/overview.component').then(m => m.OverviewComponent)
  },
  {
    path: 'company',
    loadComponent: () =>
      import('./company/company.component').then(m => m.CompanyComponent)
  },
  {
    path: 'team',
    loadComponent: () =>
      import('./team/team.component').then(m => m.TeamComponent)
  },
  {
    path: 'tickets',
    loadComponent: () =>
      import('./tickets/tickets.component').then(m => m.TicketsComponent)
  },
  {
    path: 'playbook',
    loadComponent: () =>
      import('./playbook/playbook.component').then(m => m.PlaybookComponent)
  },
  {
    path: 'marketplace',
    loadComponent: () =>
      import('./marketplace/marketplace.component').then(m => m.MarketplaceComponent)
  },
  {
    path: 'subscription',
    loadComponent: () =>
      import('./subscription/subscription.component').then(m => m.SubscriptionComponent)
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./admin/admin.component').then(m => m.AdminComponent)
  },
];
