import {Component, inject, signal} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {CompanyService, FunctionsService, ProfileService} from '@shared/services';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSnackBar} from '@angular/material/snack-bar';
import {FormArray, FormBuilder, FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatProgressBar} from '@angular/material/progress-bar';

interface Collection {
  name: string;
  selected: boolean;
  subCollections?: Collection[];
}

@Component({
  selector: 'lib-company-backup',
  imports: [
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatProgressBar
  ],

  templateUrl: './company-backup.component.html',
  standalone: true,
  styleUrl: './company-backup.component.scss'
})
export class CompanyBackupComponent {
  private snackBar = inject(MatSnackBar);
  private formBuilder = inject(FormBuilder);
  private functions = inject(FunctionsService);
  private profileService = inject(ProfileService);
  private companyService = inject(CompanyService);
  protected data = inject(MAT_DIALOG_DATA) as { companyId: string };
  private dialogRef = inject(MatDialogRef<CompanyBackupComponent>);

  readonly backup = signal<Collection>({
    name: 'Company',
    selected: false,
    subCollections: [
      {name: 'Team', selected: false},
      {name: 'Playbook', selected: false},
      {name: 'Tickets', selected: false},
    ],
  });

  readonly form = this.formBuilder.group({
    parent: [false],
    children: this.formBuilder.array([
      this.formBuilder.control(false), // Team
      this.formBuilder.control(false), // Playbook
      this.formBuilder.control(false), // Tickets
    ])
  });

  readonly labels = ['Team', 'Playbook', 'Tickets'];
  readonly children = this.form.controls.children as FormArray;

  isIndeterminate = signal(false);
  working = signal<boolean>(false);
  message = signal<string>('');
  success = signal<boolean>(false);
  download = signal<string>('');
  successOutcome = 'The backup file stored in your account and can be accessed via Restore dialog.';
  failureOutcome = 'The admin is informed about this problem and support will reach out soon to resolve this issue.';
  noSelection = true;

  constructor() {
    this.children.valueChanges.subscribe(() => this.isIndeterminate());
    this.children.valueChanges.subscribe(values => {
      const selected = values.filter(Boolean).length;
      const total = values.length;
      const isIndeterminate = selected > 0 && selected < total;
      this.noSelection = selected === 0;
      this.isIndeterminate.set(isIndeterminate);

      // Optionally update parent.checked if all or none selected
      const parent = this.form.controls.parent;
      if (selected === total) {
        parent.setValue(true, {emitEvent: false});
      } else if (selected === 0) {
        parent.setValue(false, {emitEvent: false});
      } else {
        // Leave parent.checked alone; indeterminate handles it visually
      }
    });

  }

  async proceed() {
    this.working.set(true);
    this.message.set('Backup in progress...');
    const request = {
      profileId: this.profileService.profileId(),
      companyId: this.data.companyId,
      collections: this.labels.filter((_, i) => this.children.at(i).value)
    };

    try {
      const response = await this.functions.call('backupCompanyData', request);
      if (response) {
        console.log(response);
        const { success, downloadUrl, message } = response;
        this.message.set(message);
        this.success.set(success);
        this.download.set(downloadUrl);
      } else {
        this.message.set('Backup failed.');
      }
    } catch (error: any) {
      // handle callable function errors here
      this.message.set(error?.details?.message || error?.message || 'Backup failed');
      this.success.set(false);
    } finally {
      this.working.set(false);
    }
  }

  getChildControl(index: number): FormControl<boolean> {
    return this.children.at(index) as FormControl<boolean>;
  }

  toggle(checked: boolean): void {
    this.form.controls.parent.setValue(checked);
    this.children.controls.forEach(ctrl => ctrl.setValue(checked));
  }

  protected readonly FormControl = FormControl;
}
