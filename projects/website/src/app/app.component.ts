import {AfterViewChecked, Component, computed, inject, OnInit, signal, ViewChild} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, RouterModule, RouterOutlet} from '@angular/router';
import {MatSidenav, MatSidenavModule} from '@angular/material/sidenav';
import {filter, map, Observable, shareReplay, startWith, switchMap} from 'rxjs';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {SlugifyPipe} from '@shared/pipes';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {AuthService, CompanyService, LayoutVisibilityService, ProfileService} from '@shared/services';
import {Product} from '@shared/enums/product';
import {CONSOLE_NAV, WIKI_NAV} from '@shared/constants';
import {HeaderComponent} from './shared/components/header/header.component';
import {FooterComponent} from './shared/components/footer/footer.component';
import {Profile, SubMenu} from '@shared/interfaces';
import {toSignal} from '@angular/core/rxjs-interop';
import {LayoutTemplate} from '@shared/enums';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, CommonModule, MatSidenavModule,
    MatButtonModule, RouterModule, MatIcon, HeaderComponent, FooterComponent, SlugifyPipe
  ],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.scss'
})

export class AppComponent implements AfterViewChecked, OnInit {
  @ViewChild('consoleDrawer') consoleSidenav!: MatSidenav; // Access the console sidenav
  @ViewChild('wikiDrawer') wikiSidenav!: MatSidenav; // Access the wiki sidenav

  private slugifyPipe = inject(SlugifyPipe);
  public layoutService = inject(LayoutVisibilityService);
  private breakpointObserver = inject(BreakpointObserver);
  protected companyService = inject(CompanyService);
  protected auth = inject(AuthService);
  protected profileService = inject(ProfileService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  isHandset$!: Observable<boolean>;
  isConsole$!: Observable<boolean>;
  isWiki$!: Observable<boolean>;

  // Responsive signal
  readonly isHandset = toSignal(
    this.breakpointObserver.observe([Breakpoints.Small, Breakpoints.XSmall]).pipe(
      map(result => result.matches),
      shareReplay()
    ),
    {initialValue: false}
  );

  readonly shouldOpenSidebar = computed(() => !this.isHandset());

  // Unified layout signal: 'console' | 'wiki' | 'default'
  readonly layout = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        const url = this.router.url;
        if (url.startsWith('/console')) return LayoutTemplate.Console;
        if (url.startsWith('/wiki')) return LayoutTemplate.Wiki;
        return LayoutTemplate.Default;
      }),
      startWith(this.router.url)
    ),
    {initialValue: 'default'}
  );

  // Active item (for visual highlighting)
  activeItem = signal<string | null>(null);
  isWorkflowPage = signal(false);

  ngOnInit(): void {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      switchMap(() => {
        let activeRoute = this.route;
        while (activeRoute.firstChild) {
          activeRoute = activeRoute.firstChild;
        }
        return activeRoute.paramMap;
      })
    ).subscribe(async params => {
      const isWorkflow = params.has('workflowId');
      this.isWorkflowPage.set(isWorkflow);
      if (isWorkflow) {
        if (this.consoleSidenav) {
          await this.consoleSidenav.close();
        }
      }
    });
  }

  ngAfterViewChecked() {
    if (this.consoleSidenav && this.layoutService.fieldVisible() !== this.consoleSidenav.opened) {
      this.layoutService.fieldVisible.set(this.consoleSidenav.opened);
    }
    if (this.wikiSidenav && this.layoutService.fieldVisible() !== this.wikiSidenav.opened) {
      this.layoutService.fieldVisible.set(this.wikiSidenav.opened);
    }
  }

  visit(item: SubMenu): void {
    const slug = item.route[0];
    this.activeItem.set(slug);

    switch (slug) {
      case 'logout':
        this.logout();
        break;

      case 'subscription':
        this.router.navigate(['console', slug]).then();
        break;

      default:
        this.router.navigate(['console', this.companyService.id(), slug]).then();
        break;
    }
  }

  logout(): void {
    this.auth.logout().then(() => {
      this.profileService.profile.set({} as Profile);
      this.companyService.reset();
      this.router.navigate(['../home']).catch(console.error);
    });
  }

  async toggleSidenav(): Promise<void> {
    if (this.consoleSidenav) {
      const visibility = !this.consoleSidenav.opened;
      this.layoutService.fieldVisible.set(visibility);
      this.layoutService.sidenavVisible.set(visibility);
      await this.consoleSidenav.toggle();
    }

    if (this.wikiSidenav) {
      const visibility = !this.wikiSidenav.opened;
      this.layoutService.fieldVisible.set(visibility);
      this.layoutService.sidenavVisible.set(visibility);
      await this.wikiSidenav.toggle();
    }
  }

  // Determines if the item is active based on the route
  isActive(item: any): boolean {
    return this.router.url.includes(item.route);
  }

  getFontSet(item: SubMenu): string {
    const allIcons = new Set([
      ...CONSOLE_NAV.map(item => item.icon),
      ...WIKI_NAV.map(item => item.icon)
    ]);

    return allIcons.has(item.icon) && this.isActive(item)
      ? 'material-icons'
      : 'material-icons-outlined';
  }

  protected readonly Product = Product;
  protected readonly CONSOLE_NAV = CONSOLE_NAV;
  protected readonly WIKI_NAV = WIKI_NAV;
  protected readonly LayoutTemplate = LayoutTemplate;
  NAV = CONSOLE_NAV;
}
