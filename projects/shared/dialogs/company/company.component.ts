import {Component, Inject, signal, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef} from '@angular/material/dialog';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgIf} from '@angular/common';
import { FileUploaderComponent } from '@shared/components';
import { MatDivider } from '@angular/material/divider';
import { AuthService } from '@shared/services/auth.service';
import { CrudService } from '@shared/services/crud.service';
import { COMPANY, PROFILES, COMPANIES } from '@shared/constants';
import { firstValueFrom } from 'rxjs';
import {MatFormField, MatHint, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import {Company} from '@shared/interfaces';
import {MatSnackBar} from '@angular/material/snack-bar';
import {CompanyFormService} from '@shared/forms';

@Component({
  selector: 'lib-company',
  imports: [
    ReactiveFormsModule,
  ],
  templateUrl: './company.component.html',
  standalone: true,
  styleUrl: './company.component.scss'
})
export class CompanyComponent {
  private dialogRef = inject(MatDialogRef<CompanyComponent>);
  private formService = inject(CompanyFormService);
  private auth = inject(AuthService);
  private crud = inject(CrudService);
  private snackbar = inject(MatSnackBar);

  path = signal<string>('');
  loading = signal<boolean>(true);
  logo = signal<string>('');
  banner = signal<string>('');

  constructor(@Inject(MAT_DIALOG_DATA) public data: Company | null) {
    this.initialize().then();
  }

  async initialize() {
    this.form.reset();
    this.formService.form.patchValue(COMPANY);

    try {
      const user = await firstValueFrom(this.auth.user$);
      if (!user) throw new Error('User/Profile not found!');
      this.path.set(`${PROFILES.path}/${user.uid}/${COMPANIES.path}`);
      this.loading.set(false);
    } catch (error: any) {
      this.snackbar.open(error.message, 'X', {duration: 3000});
      this.dialogRef.close(null);
    }
  }

  add(): void {
    const data = this.getDTO();
    this.crud.add(this.path(), data)
      .then(docRef => {
        if (!docRef) return;
        this.snackbar.open('Company added successfully.', 'X', { duration: 3000 });
        this.dialogRef.close({ id: docRef.id, ...data });
      })
      .catch(error => {
        this.snackbar.open('Failed to add company.', 'X', { duration: 3000 });
        this.dialogRef.close(null);
      });
  }

  getDTO(): Company {
    const data: Company = this.form.value as Company;
    data.timestamps.updated_at = Date.now();
    return data;
  }

  updateImage($event: { filePath: string }, field: 'logo' | 'banner'): void {
    this.form.patchValue({ [field]: $event.filePath });
    field === 'logo' ? this.logo.set($event.filePath) : this.banner.set($event.filePath);
  }

  get form(): FormGroup {
    return this.formService.form;
  }
}
