import {Routes} from '@angular/router';
import {SeoType} from '@shared/enums';
import {LandingComponent} from './landing/landing.component';
import {AUTH_GUARD, INIT_GUARD} from '@shared/guards';
import {SeoResolverService} from '@shared/resolvers';
import {AuthActionComponent, CheckInvitationComponent} from '@shared/components';
import {TheShiftComponent} from './the-shift/the-shift.component';
import { InvestorsComponent } from './investors/investors.component';
import { PublicFormComponent } from './pages/public-form/public-form.component';

export const routes: Routes = [
  {
    path: 'form/:id',
    component: PublicFormComponent
  },
  {
    path: '',
    component: LandingComponent,
    canActivate: [INIT_GUARD], // Redirects to /console if logged in
    resolve: {seo: SeoResolverService},
    data: {seoType: SeoType.DEFAULT},
  },
  {
    path: 'home',
    component: LandingComponent,
    resolve: {seo: SeoResolverService},
    data: {seoType: SeoType.DEFAULT},
  },
  {
    path: 'console',
    canActivate: [AUTH_GUARD], // Keep your guard
    loadChildren: () => import('./console/routes')
      .then(m => m.routes),
  },
  {
    path: 'wiki',
    loadChildren: () => import('./wiki/routes')
      .then(m => m.routes),
  },
  {
    path: 'auth/action',
    component: AuthActionComponent
  },
  {
    path: 'invite/:inviteId',
    component: CheckInvitationComponent
  },
  {
    path: 'about',
    component: TheShiftComponent
  },
  {
    path: 'investors',
    component: InvestorsComponent
  },
    {
    path: 'releases',
    loadComponent: () =>
      import('@shared/components').then(m => m.ReleasesComponent)
  }
];
