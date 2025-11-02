import {Component, effect, inject, signal} from '@angular/core';
import {CompanyWithId} from '@shared/interfaces';
import {ProgressType} from '@shared/enums';
import {Router} from '@angular/router';
import {CompanyService, LayoutVisibilityService} from '@shared/services';
import {LoadingComponent} from '@shared/components';
import {AsyncPipe} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';
import {StorageUrlPipe} from '@shared/pipes';
import {map, Observable, of, take} from 'rxjs';
import {MatMenuModule, MatMenuTrigger} from '@angular/material/menu';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {CompanyBackupComponent, CompanyDeleteComponent, CompanyRestoreComponent} from '@shared/dialogs';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss'],
  standalone: true,
  imports: [
    LoadingComponent,
    AsyncPipe,
    LoadingComponent,
    MatButtonModule,
    MatMenuModule,
    MatCardModule,
    MatIcon,
    StorageUrlPipe,
    MatMenuTrigger,
  ]
})
export class CompaniesComponent {
  private router = inject(Router);
  private companyService = inject(CompanyService);
  private layoutService = inject(LayoutVisibilityService);
  private storageUrl = inject(StorageUrlPipe);
  private dialog = inject(MatDialog);

  companies: CompanyWithId[] | null = [];
  dialogConfig: MatDialogConfig = {};
  private fetched = signal(false); // Prevent multiple fetches

  constructor() {
    effect(() => {
    // computed(() => {
      if (this.layoutService.headerIsReady() && !this.fetched()) {
        console.log('Fetching companies...');
        this.fetched.set(true); // Ensure it only runs once
        this.companyService.initCompanies().pipe(
          take(5) // Emit only once, takes up to 5 values and unsubscribe immediately
        ).subscribe(companies => {
          this.companies = companies;
          this.companyService.updateCompany(companies[0]);
        });
      }
    });
  }

  visit(company: CompanyWithId) {
    this.companyService.updateCompany(company);
    this.router.navigate(['console', company.id]).then();
  }

  getBackground(url?: string, isLogo = false): Observable<string> {
    const deg = isLogo? '45deg':'-45deg';
    return url?
      this.storageUrl.transform(url).pipe(map((bannerUrl) => `url(${bannerUrl})`)):
      of(`repeating-linear-gradient(${deg}, #e0e0e0, #e0e0e0 10px, #f5f5f5 10px, #f5f5f5 20px)`);
  }

  confirmBackup(id: string): void{
    this.dialogConfig.data = {companyId: id}
    this.dialog.open(CompanyBackupComponent, this.dialogConfig);
  }

  confirmRestore(id: string): void{
    this.dialogConfig.data = {companyId: id}
    this.dialog.open(CompanyRestoreComponent, this.dialogConfig);
  }


  confirmDelete(id: string): void{
    this.dialogConfig.data = {companyId: id}
    this.dialog.open(CompanyDeleteComponent, this.dialogConfig);
  }

  protected readonly ProgressType = ProgressType;
}
