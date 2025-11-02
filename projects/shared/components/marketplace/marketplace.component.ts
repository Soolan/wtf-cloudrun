import {Component, computed, effect, inject, signal} from '@angular/core';
import {MarketplaceService} from '@shared/services/marketplace.service';
import {MarketplaceItemType} from '@shared/enums';
import {MatCheckbox} from '@angular/material/checkbox';
import {AsyncPipe, NgForOf, NgIf, TitleCasePipe} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {MatInput} from '@angular/material/input';
import {MatCardModule} from '@angular/material/card';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatDivider} from '@angular/material/divider';
import {API_IN_USE, API_MOCKS, PLAYBOOK_TOPICS} from '@shared/constants';
import {StorageUrlPipe} from '@shared/pipes';
import {MatIcon} from '@angular/material/icon';
import {LoadingComponent} from '@shared/components';
import {RouterLink} from '@angular/router';
import {ApiInUse, Entity, InstallRequest} from '@shared/interfaces';
import {
  CompanyService,
  DialogConfigService,
  LayoutVisibilityService,
  PlaybookService,
  ProfileService
} from '@shared/services';
import {MARKETPLACE_INSTALLS} from '@shared/constants/marketplace';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'lib-marketplace',
  imports: [
    MatCheckbox,
    NgForOf,
    MatButton,
    NgIf,
    MatFormField,
    MatLabel,
    MatInput,
    MatCardModule,
    TitleCasePipe,
    MatDivider,
    AsyncPipe,
    StorageUrlPipe,
    MatIcon,
    LoadingComponent,
    RouterLink,
    MatTooltip,
  ],
  templateUrl: './marketplace.component.html',
  standalone: true,
  styleUrl: './marketplace.component.scss'
})
export class MarketplaceComponent {
  readonly marketplaceService = inject(MarketplaceService);
  private companyService = inject(CompanyService);
  private profileService = inject(ProfileService);
  public layoutService = inject(LayoutVisibilityService);

  search = signal('');
  installedOnly = signal(false);
  selectedTypes = signal<MarketplaceItemType[]>([]);
  readonly uninstallingIndex = signal<number | null>(null);
  readonly installingIndex = signal<number | null>(null);
  readonly installedIndex = signal<number | null>(null);

  path!: string;
  who!: Entity;

  filteredItems = computed(() => {
    const searchValue = this.search().toLowerCase();
    const installedOnly = this.installedOnly();
    const types = this.selectedTypes();
    const items = this.marketplaceService.items();

    return items.filter(item => {
      if (searchValue && !item.name.toLowerCase().includes(searchValue)) return false;
      if (installedOnly && !this.marketplaceService.isInstalled(item.id)) return false;
      if (types.length > 0 && !types.includes(item.type)) return false;
      return true;
    });
  });

  constructor() {
    effect(async () => {
      if (this.layoutService.headerIsReady()) {
        this.path = `${this.companyService.path()}/${this.companyService.id()}`;
        this.who = this.profileService.entity() || {} as Entity;
      }
    });
  }

  async ngOnInit() {
    // await this.marketplaceService.init();
    await this.marketplaceService.initMock();
  }

  toggleType(type: MarketplaceItemType) {
    const current = new Set(this.selectedTypes());
    if (current.has(type)) {
      current.delete(type);
    } else {
      current.add(type);
    }
    this.selectedTypes.set([...current]);
  }

  toggleInstalledOnly(value: boolean) {
    this.installedOnly.set(value);
    if (value) {
      this.selectedTypes.set([]); // clear other filters
    }
  }

  async install(id: string, index: number) {
    this.installingIndex.set(index);
    const installRequest: InstallRequest = {itemId: id, path: this.path, installedBy: this.who};
    await this.marketplaceService.installItem(installRequest);
    this.installedIndex.set(index);
    this.installingIndex.set(null);
  }

  async uninstall(id: string, index: number) {
    this.uninstallingIndex.set(index);
    const installsPath = `${this.path}/${MARKETPLACE_INSTALLS.path}/${id}`;
    await this.marketplaceService.uninstallItem(installsPath);
    this.uninstallingIndex.set(null);
    this.installedIndex.set(null);
  }

  getIcon(type: MarketplaceItemType): string {
    switch (type) {
      case MarketplaceItemType.Agent: return 'groups_2';
      case MarketplaceItemType.Team: return 'groups_2';
      case MarketplaceItemType.Playbook: return 'import_contacts';
      case MarketplaceItemType.Api: return 'api';
      case MarketplaceItemType.Company: return 'store';
      default: return 'help';
    }
  }

  protected readonly MarketplaceItemType = MarketplaceItemType;
  protected readonly Object = Object;
  readonly itemTypes: MarketplaceItemType[] = Object.values(MarketplaceItemType) as MarketplaceItemType[];

  protected readonly apis = API_MOCKS;
}
