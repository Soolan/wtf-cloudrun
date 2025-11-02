import {inject, Injectable, signal} from '@angular/core';
import {InstallRequest, MarketplaceInstallWithId, MarketplaceItemWithId} from '@shared/interfaces';
import {
  MARKETPLACE_INSTALLS,
  MARKETPLACE_ITEMS,
  MOCK_MARKETPLACE_INSTALLS,
  MOCK_MARKETPLACE_ITEMS
} from '@shared/constants/marketplace';
import {CompanyService, CrudService, FunctionsService} from '@shared/services';
import {MatSnackBar} from '@angular/material/snack-bar';
import {response} from 'express';

@Injectable({providedIn: 'root'})
export class MarketplaceService {
  private readonly crud = inject(CrudService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly companyService = inject(CompanyService);
  private readonly functionsService = inject(FunctionsService);

  items = signal<MarketplaceItemWithId[]>([]);
  installedItems = signal<MarketplaceInstallWithId[]>([]);
  loading = signal<boolean>(false);
  item = signal<MarketplaceItemWithId | null>(null);

  async init(): Promise<void> {
    this.loading.set(true);
    try {
      await this.initInstalledItems();
      await this.initMarketplace();
    } finally {
      this.loading.set(false);
    }
  }

  private async initMarketplace() {
    const items = await this.crud.getDocs(MARKETPLACE_ITEMS, true, true) as MarketplaceItemWithId[];
    this.items.set(items);
  }

  private async initInstalledItems() {
    const path = `${this.companyService.path()}/${this.companyService.id()}/${MARKETPLACE_INSTALLS.path}`;
    const q = {...MARKETPLACE_INSTALLS, path};
    const installedItems = await this.crud.getDocs(q, true, true) as MarketplaceInstallWithId[];
    this.installedItems.set(installedItems);
  }

  async initMock(): Promise<void> {
    this.loading.set(true);
    try {
      this.items.set(MOCK_MARKETPLACE_ITEMS);
      this.installedItems.set(MOCK_MARKETPLACE_INSTALLS);
    } finally {
      this.loading.set(false);
    }
  }

  isInstalled(itemId: string): boolean {
    return this.installedItems().some(item => item.id === itemId);
  }

  async installItem(request: InstallRequest) {
    this.functionsService.call('marketplaceInstall', {request}).then(response => {
      console.log(response);
      if (response.success) this.snackBar.open('Item installed successfully.', 'X', {duration: 3000});
    }).catch(error => {
      this.snackBar.open('Error installing item', error), 'X', {duration: 5000};
    });
    await this.initInstalledItems();
  }

  async uninstallItem(path: string): Promise<void> {
    await this.functionsService.call('marketplaceUninstall', {path}).then(response => {
      console.log(response);
      if (response.success) this.snackBar.open('Item uninstalled successfully.', 'X', {duration: 3000});
    }).catch(error => {
      this.snackBar.open('Error uninstalling item', error), 'X', {duration: 5000};
    });
    await this.initInstalledItems();
  }
}
