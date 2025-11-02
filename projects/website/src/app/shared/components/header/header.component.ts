import {
  AuthService, CompanyService, CrudService, DialogConfigService,
  LayoutVisibilityService, ProfileService, TeamService
} from '@shared/services';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  HostListener,
  Inject,
  inject,
  signal,
  DOCUMENT
} from '@angular/core';
import {AsyncPipe, NgStyle} from '@angular/common';
import {MatFormField, MatLabel, MatPrefix} from '@angular/material/form-field';
import {MatOption, MatSelect, MatSelectTrigger} from '@angular/material/select';
import {MatIcon} from '@angular/material/icon';
import {NavigationEnd, Router, RouterLink} from '@angular/router';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatTooltip} from '@angular/material/tooltip';
import {CompanyWithId, Profile, SubMenu} from '@shared/interfaces';
import {COMPANY, NEW_COMPANY, PROFILE_NAV} from '@shared/constants';
import {BreakpointObserver} from '@angular/cdk/layout';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {filter, switchMap} from 'rxjs';
import {getMessaging, onMessage} from '@angular/fire/messaging';
import {BusinessSetupComponent} from '@shared/dialogs';
import {BreadcrumbsComponent} from '@shared/components/breadcrumbs/breadcrumbs.component';
import {StorageUrlPipe} from '@shared/pipes';
import {MatInput} from '@angular/material/input';
import {ReactiveFormsModule} from '@angular/forms';
import {user} from '@angular/fire/auth';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    MatFormField,
    MatSelect,
    MatOption,
    RouterLink,
    MatIconButton,
    MatIcon,
    MatTooltip,
    MatMenuTrigger,
    NgStyle,
    MatMenu,
    MatMenuItem,
    MatButton,
    BreadcrumbsComponent,
    StorageUrlPipe,
    MatSelectTrigger,
    MatFormField,
    MatIcon,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    MatPrefix
  ]
})
export class HeaderComponent {
  isConsole = signal(false);
  isWiki = signal(false);
  isWebsite = signal(false);
  smallScreen = signal(false);
  selectedCompany = signal<CompanyWithId | string | null>(null);
  message = signal<any>(null);
  back = signal<string[]>([]);
  current = signal<string>('');

  companies!: CompanyWithId[];
  config!: any;
  profileOptions: SubMenu[] = PROFILE_NAV || [];

  public layoutService = inject(LayoutVisibilityService);
  private configService = inject(DialogConfigService);
  private breakpoint = inject(BreakpointObserver);
  public companyService = inject(CompanyService);
  public profileService = inject(ProfileService);
  public teamService = inject(TeamService);
  private snackbar = inject(MatSnackBar);
  private crud = inject(CrudService);
  public auth = inject(AuthService);
  public dialog = inject(MatDialog);
  private router = inject(Router);

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
  ) {
    this.config = this.configService.getConfig();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isConsole.set(event.url.includes('console'));
      this.isWiki.set(event.url.includes('wiki'));
      this.isWebsite.set(!this.isConsole() && !this.isWiki());
      const path = event.url.split('/');
      this.back.set(path.slice(0, -1));
      this.current.set(path[path.length - 1]);
    });

    this.breakpoint.observe(['(max-width: 480px)'])
      .subscribe(state => this.smallScreen.set(state.matches));

    this.auth.authState$.pipe(
      filter(user => !!user),
      switchMap(async user => {
        await this.profileService.initProfile(user);
        if (!this.profileService.profileId()) return;
        this.companyService.updatePath();
        const hasCompanies = await this.crud.colExists(this.companyService.path());
        return hasCompanies ?
          this.initCompanies() :
          this.setupBusiness().then(() => this.initCompanies());
      })
    ).subscribe();

    effect(() => {
      if (this.layoutService.headerIsReady()) {
        const selected = this.companyService.selectedCompany();
        if (selected && typeof selected === 'object') {
          const company = this.companies.find(c => c.id === selected.id);
          this.selectedCompany.set(company ?? selected);
        }
      }
    });
  }

  listen() {
    const messaging = getMessaging();
    onMessage(messaging, (payload: any) => {
      console.log('Message received. ', payload);
      this.message.set(payload);
    });
  }

  visit(action: string, uid?: string) {
    const actions: Record<string, () => void> = {
      login: () => this.auth.login(),
      home: () => this.router.navigate(['home']).catch(console.error),
      subscription: () => this.router.navigate(['console', 'subscription']).catch(console.error),
      marketplace: () => this.router.navigate(['console', this.companyService.id(), 'marketplace']).catch(console.error),
      profile: async () => {
        if (!uid) return;
        const path = `${this.companyService.path()}/${this.companyService.id()}/team`;
        await this.teamService.initMembers(path);
        const member = this.teamService.getMemberByProfileId(uid);
        this.router.navigate([
          'console', this.companyService.id(), 'team', member?.id
        ]).catch(console.error)
      },
      logout: () => this.logout(),
      console: () => {
        this.companyService.updateCompany(null);
        this.router.navigate(['console']).catch(console.error)
      },
      back: () => this.router.navigate(this.back()).catch(console.error),
      default: () => this.snackbar.open('Coming soon!', 'X', {duration: 2000}),
    };

    actions[action.toLowerCase() || 'default']();
  }

  logout(): void {
    this.auth.logout().then(() => {
      this.profileService.profile.set({} as Profile);
      this.companyService.reset();
      this.router.navigate(['/home']).catch(console.error);
    });
  }

  private initCompanies() {
    this.companyService.initCompanies()
      .subscribe(companies => {
        this.companies = companies;
        this.layoutService.headerIsReady.set(true);
        if (!this.selectedCompany()) {
          const company = companies[0] as CompanyWithId;
          this.companyService.updateCompany(company);
          this.selectedCompany.set(company);
        }
      });
  }

  private async setupBusiness() {
    this.dialog.open(BusinessSetupComponent, {minWidth: '100vw', height: '100vh', data:{isNewProfile: true}});
  }

  currentCompany(company: CompanyWithId) {
    if (company.id === NEW_COMPANY) {
      this.dialog.open(BusinessSetupComponent, {minWidth: '100vw', height: '100vh', data:{isNewProfile: false}})
        .afterClosed()
        .subscribe(companyId => this.router.navigate(['console', companyId]).catch(console.error));
    } else {
      this.companyService.updateCompany(company as CompanyWithId);
      this.router.navigate(['console', company.id]).catch(console.error);
    }
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    const element = this.document.getElementById('invertible') as HTMLElement;
    const shouldInvert = window.scrollY > element.clientHeight * 0.1;
    element.classList.toggle('inverse', shouldInvert);
    element.classList.toggle('inverse-nav', shouldInvert);
  }

  get selected(): CompanyWithId | null {
    const company = this.selectedCompany();
    return (typeof company === 'object' && company !== null) ? company : null;
  }

  get newCompany(): CompanyWithId {
    return {id: NEW_COMPANY, ...COMPANY};
  }

  protected readonly user = user;
}
