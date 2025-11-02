import {Injectable, inject, signal, computed} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Company, CompanyWithId } from '@shared/interfaces';
import { COMPANIES, COMPANY, PROFILES } from '@shared/constants';
import { CrudService } from '@shared/services/crud.service';
import { AuthService } from '@shared/services/auth.service';
import {DocumentData, DocumentReference} from '@angular/fire/firestore';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private readonly crud = inject(CrudService);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  company = signal<CompanyWithId | null>(null);
  id = signal<string>('');
  path = signal<string>('');

  /** Computed signal for reactive updates */
  selectedCompany = computed(() => this.company());

  /** Update company data */
  updateCompany(snapshot: CompanyWithId | null ): void {
    this.company.set(snapshot);
    if (!snapshot) return;
    this.setId(snapshot.id);
    this.updatePath();
  }

  /** Update company ID */
  private setId(companyId: string): void {
    this.id.set(companyId);
  }

  /** Update company path */
  updatePath(): void {
    this.path.set(''); // Clear old path before setting new one
    const profileId = this.authService.auth.currentUser?.uid;
    const path = profileId ? `${PROFILES.path}/${profileId}/${COMPANIES.path}` : '';
    this.path.set(path);
  }

  /** Get companies list */
  initCompanies(): Observable<CompanyWithId[]> {
    this.updatePath();
    const q = { ...COMPANIES, path: this.path() };
    return this.crud.getStream(q, true) as Observable<CompanyWithId[]>;
  }

  /** Create a default company */
  async addCompany(): Promise<DocumentReference<DocumentData, DocumentData> | null> {
    const data: Company = { ...COMPANY };
    return await this.crud.add(this.path(), data);
  }

  /** Reset everything on logout */
  reset(): void {
    this.company.set(null);
    this.id.set('');
    this.path.set('');
  }
}
