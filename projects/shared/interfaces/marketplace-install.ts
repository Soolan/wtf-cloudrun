import {Entity} from '@shared/interfaces/entity';
import {InstallStatus} from '@shared/enums';

export interface MarketplaceInstall {
  installedAt: number;         // Timestamp
  installedBy: Entity;         // Who installed it
  status: InstallStatus;       // Current state
  uninstalledAt?: number;        // Optional uninstall timestamp
  relatedPaths: string[];      // The actual paths copied (very useful for uninstall)
}

export interface MarketplaceInstallWithId extends MarketplaceInstall {
  id: string;
}

export interface InstallRequest {
  itemId: string;
  path: string;   //company id path
  installedBy: Entity;
}
