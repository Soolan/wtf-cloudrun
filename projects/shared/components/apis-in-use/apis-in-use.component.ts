import {Component, effect, inject} from '@angular/core';
import {Api, ApiInUseWithId} from '@shared/interfaces';
import {MatDialog} from '@angular/material/dialog';
import {CompanyService, CrudService, LayoutVisibilityService} from '@shared/services';
import {APIS, APIS_IN_USE} from '@shared/constants';
import {MatAnchor, MatButton, MatIconButton, MatMiniFabButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatTooltip} from '@angular/material/tooltip';
import {AsyncPipe, NgForOf, NgIf, TitleCasePipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import {ApiInUseComponent} from '@shared/dialogs';
import {StorageUrlPipe} from '@shared/pipes';
import {LoadingComponent} from '@shared/components/loading/loading.component';
import {take} from 'rxjs';

@Component({
  selector: 'lib-apis-in-use',
  imports: [
    MatAnchor,
    MatIcon,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatMiniFabButton,
    MatTooltip,
    NgForOf,
    RouterLink,
    MatMenuTrigger,
    TitleCasePipe,
    NgIf,
    MatButton,
    StorageUrlPipe,
    AsyncPipe,
    LoadingComponent
  ],
  templateUrl: './apis-in-use.component.html',
  standalone: true,
  styleUrl: './apis-in-use.component.scss'
})
export class ApisInUseComponent {
  apisInUse!: ApiInUseWithId[];
  apis: Api[] = [];
  isAdmin = false;
  path!: string;
  toggling = false;
  confirmations: boolean[] = []; // Array to track confirmation states
  loading = true;

  private dialog = inject(MatDialog);
  private crud = inject(CrudService);
  private companyService = inject(CompanyService);
  public layoutService = inject(LayoutVisibilityService);

  constructor() {
    effect(async () => {
      if (this.layoutService.headerIsReady()) {
        await this.initApisInuse();
        await this.initApis();
        console.log(this.apisInUse, this.apis);
        this.loading = false;
      }
    });
  }

  private async initApisInuse() {
    const q = {...APIS_IN_USE};
    this.path = `${this.companyService.path()}/${this.companyService.id()}/${APIS_IN_USE.path}`;
    q.path = this.path;
    this.apisInUse = await this.crud.getDocs(q, true, false) as ApiInUseWithId[];
    if (this.apisInUse)
      this.confirmations = new Array(this.apisInUse.length).fill(false);
  }

  private async initApis() {
    const ids = this.apisInUse
      .map(doc => doc.apiId)
      .filter(id => !!id?.trim()); // removes undefined, null, blank and white-spaced ids

    for (const id of ids) {
      const api = await this.crud.getDoc(APIS.path, id, true);
      if (api) this.apis.push(api);
    }
  }

  async openDialog(api: Api, index: number): Promise<void> {
    this.dialog.open(ApiInUseComponent, {
      data: {
        api,
        path: this.path,
        apiInUse: this.apisInUse[index],
        isAdmin: this.isAdmin,
      },
      minWidth: '100vw',
      minHeight: '100vh',
    }).afterClosed()
      .pipe(take(1))
      .subscribe((response: ApiInUseWithId | undefined) => {
        if (!response) return;
        const index = this.apisInUse.findIndex(a => a.id === response.id);
        if (index === -1) return;
        this.apisInUse[index] = response;
        console.log(this.apisInUse);
      });
  }

  delete(index: number): void {
    this.crud.delete(this.path, this.apisInUse[index].id);
    this.confirmations[index] = false;
  }

  getStatus(index: number): string {
    return this.apisInUse[index].active ? 'live' : 'disabled';
  }

  getClass(index: number): string {
    return this.apisInUse[index].active ? 'live pulse' : 'disabled';
  }

  async toggle(index: number): Promise<void> {
    this.toggling = true;
    const id = this.apisInUse[index].id;
    this.apisInUse[index].active = !this.apisInUse[index].active;
    await this.crud.update(this.path, id, {active: this.apisInUse[index].active});
    setTimeout(() => this.toggling = false, 2000);
  }
}
