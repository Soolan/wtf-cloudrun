import {Component, effect, inject, signal} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatButton} from '@angular/material/button';
import {API_IN_USE, API_MOCKS, APIS_IN_USE, APIS_IN_USE_MOCK} from '@shared/constants';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {StorageUrlPipe} from '@shared/pipes';
import {MatIcon} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {CompanyService, CrudService, LayoutVisibilityService} from '@shared/services';
import {LoadingComponent} from '@shared/components';
import {MatDivider} from '@angular/material/divider';
import {ApiInUse, ApiInUseWithId} from '@shared/interfaces';

@Component({
  selector: 'lib-apis',
  imports: [
    MatCardModule,
    MatButton,
    NgForOf,
    AsyncPipe,
    StorageUrlPipe,
    MatIcon,
    NgIf,
    RouterLink,
    LoadingComponent,
    MatDivider,
  ],
  templateUrl: './apis.component.html',
  standalone: true,
  styleUrl: './apis.component.scss'
})
export class ApisComponent {
  readonly uninstallingIndex = signal<number | null>(null);
  readonly installingIndex = signal<number | null>(null);
  readonly installedIndex = signal<number | null>(null);

  apis = API_MOCKS;
  apisInUse!: ApiInUseWithId[];
  path!: string;

  private dialog = inject(MatDialog);
  private crud = inject(CrudService);
  private companyService = inject(CompanyService);
  public layoutService = inject(LayoutVisibilityService);

  constructor() {
    effect(async () => {
      if (this.layoutService.headerIsReady()) {
        const q = {...APIS_IN_USE};
        this.path = `${this.companyService.path()}/${this.companyService.id()}/${APIS_IN_USE.path}`;
        q.path = this.path;
        this.apisInUse = await this.crud.getDocs(q, true, true) as ApiInUseWithId[];
      }
    });
  }

  async install(id: string, index: number) {
    this.installingIndex.set(index);
    const data: ApiInUse = {...API_IN_USE};
    data.apiId = id;
    const docRef = await this.crud.add(this.path, data);
    setTimeout(() => this.installingIndex.set(null), 3000);
    this.installedIndex.set(index);
    this.apisInUse.push({id: docRef?.id || '', ...data});
  }

  uninstall(id: string, index: number) {
    this.uninstallingIndex.set(index);
    const inUseId = this.apisInUse.find(inUse => inUse.apiId === id)?.id;
    if (!inUseId) {
      this.uninstallingIndex.set(null);
      return;
    }
    this.crud.delete(this.path, inUseId);
    const api = this.apisInUse.find(inUse => inUse.apiId === id);
    if (!api) return;
    setTimeout(() => {
      this.uninstallingIndex.set(null);
      this.apisInUse.splice(this.apisInUse.indexOf(api), 1);
    }, 3000)
  }

  hasInstalled(id: string) {
    return !!this.apisInUse.find(inUse => inUse.apiId === id);
  }
}
