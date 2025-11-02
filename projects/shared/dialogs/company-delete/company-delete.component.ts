import {Component, inject, signal} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
import {CompanyService, CrudService, FunctionsService, ProfileService} from '@shared/services';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatAnchor, MatButton, MatIconButton} from '@angular/material/button';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatProgressBar} from '@angular/material/progress-bar';
import {NgIf} from '@angular/common';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'lib-company-delete',
  imports: [
    MatButton,
    MatCheckbox,
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatIcon,
    MatIconButton,
    MatProgressBar,
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './company-delete.component.html',
  standalone: true,
  styleUrl: './company-delete.component.scss'
})
export class CompanyDeleteComponent {
  private crud = inject(CrudService);
  private snackBar = inject(MatSnackBar);
  private formBuilder = inject(FormBuilder);
  private functions = inject(FunctionsService);
  private profileService = inject(ProfileService);
  private companyService = inject(CompanyService);
  protected data = inject(MAT_DIALOG_DATA) as { companyId: string };
  private dialogRef = inject(MatDialogRef<CompanyDeleteComponent>);


  working = signal<boolean>(false);
  message = signal<string>('');
  success = signal<boolean>(true);

  successOutcome = 'The backup will be emailed to you soon. You may close this dialog.';
  failureOutcome = 'The admin is informed about this problem and support will reach out soon to resolve the issue.';

  readonly form = this.formBuilder.group({
    confirm: false,
    backupFirst: false,
  });

  async backup() {
    this.working.set(true);
    this.message.set('Backup in progress...');
    const request = {
      profileId: this.profileService.profileId(),
      companyId: this.data.companyId,
    };
    const response = await this.functions.call('backupCompanyData', request);
    this.message.set(response.message);
    this.success.set(response.success);
    this.working.set(false);
  }

  async proceed() {
    if (this.form.get('backupFirst')?.value) {
      await this.backup();
      if (!this.success()) return;
    }
    this.crud.delete(this.companyService.path(), this.data.companyId);
    this.dialogRef.close();
  }
}
