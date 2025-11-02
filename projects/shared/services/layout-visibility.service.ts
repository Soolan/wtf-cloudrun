import {computed, effect, Injectable, signal} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutVisibilityService {
  headerVisible = signal(true);
  footerVisible = signal(true);
  headerIsReady = signal(false); // Added isReady equivalent for the header
  fieldVisible = signal(true);
  sidenavVisible = signal(true);
  // wikiVisible = signal(false);
  crumbs = signal<{ label: string; url: string }[]>([]);

  readonly breadcrumbs = computed(() => this.crumbs());

  constructor(private router: Router) {
    effect(() => {
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(() => this.buildBreadcrumbs());
    });
  }

  setVisibility(header: boolean, footer: boolean): void {
    this.headerVisible.set(header);
    this.footerVisible.set(footer);
  }

  private buildBreadcrumbs() {
    const segments = this.router.url.split('/').filter(Boolean);
    const consoleIndex = segments.indexOf('console');

    if (consoleIndex !== -1 && segments.length > 2) {
      const companyId = segments[1];
      const afterCompany = segments.slice(2);
      const crumbs = afterCompany.map((segment, i) => ({
        label: decodeURIComponent(segment),
        url: '/console/' + companyId + '/' + afterCompany.slice(0, i + 1).join('/')
      }));
      this.crumbs.set(crumbs);
    } else {
      this.crumbs.set([]);
    }
  }
}
