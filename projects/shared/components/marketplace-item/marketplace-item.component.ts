import {Component, effect, inject, signal} from '@angular/core';
import {Entity, InstallRequest, MarketplaceItemWithId} from '@shared/interfaces';
import {MARKETPLACE_INSTALLS, MARKETPLACE_ITEMS, MOCK_MARKETPLACE_ITEMS} from '@shared/constants/marketplace';
import {StorageUrlPipe} from '@shared/pipes';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import {MatTabGroup, MatTabsModule} from '@angular/material/tabs';
import {MatDivider} from '@angular/material/divider';
import {LoadingComponent} from '@shared/components';
import {MarketplaceService} from '@shared/services/marketplace.service';
import {CompanyService, CrudService, LayoutVisibilityService, ProfileService} from '@shared/services';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'lib-marketplace-item',
  imports: [
    StorageUrlPipe,
    AsyncPipe,
    MatIcon,
    NgIf,
    MatButton,
    NgForOf,
    MatTabsModule,
    MatDivider,
    LoadingComponent
  ],
  templateUrl: './marketplace-item.component.html',
  standalone: true,
  styleUrl: './marketplace-item.component.scss'
})
export class MarketplaceItemComponent {
  marketplaceService = inject(MarketplaceService);
  companyService = inject(CompanyService);
  profileService = inject(ProfileService);
  crudService = inject(CrudService);
  route = inject(ActivatedRoute);
  public layoutService = inject(LayoutVisibilityService);

  uninstalling = signal<boolean>(false);
  installing = signal<boolean>(false);

  item!: MarketplaceItemWithId;
  request!: InstallRequest;
  path!: string;
  who!: Entity;

  constructor() {
    effect(async () => {
      if (this.layoutService.headerIsReady()) {
        this.path = `${this.companyService.path()}/${this.companyService.id()}`;
        this.who = this.profileService.entity() || {} as Entity;
      }
    });
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('marketplaceItemId');
    if (!id) return;
    this.item = this.marketplaceService.item() ?? await this.crudService.getDoc(MARKETPLACE_ITEMS.path, id);
    this.request = {itemId: this.item.id, path: this.path, installedBy: this.who};
  }

  async install() {
    this.installing.set(true);
    await this.marketplaceService.installItem(this.request);
    this.installing.set(false);
  }

  async uninstall() {
    this.uninstalling.set(true);
    const installsPath = `${this.path}/${MARKETPLACE_INSTALLS.path}/${this.item.id}`;
    await this.marketplaceService.uninstallItem(installsPath);
    this.uninstalling.set(false);
  }
}
