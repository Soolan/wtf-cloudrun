import {Component, ElementRef, inject, signal, ViewChild} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatSnackBar} from '@angular/material/snack-bar';
import {CommonModule} from '@angular/common';
import {FunctionsService, ProfileService, StorageService} from '@shared/services';
import {MatTooltip} from '@angular/material/tooltip';
import {PROFILES} from '@shared/constants';

interface BackupMetadata {
  timestamp: string;
  originalCompanyId: string;

  [key: string]: any;
}

@Component({
  selector: 'lib-company-restore',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltip,
  ],
  templateUrl: './company-restore.component.html',
  styleUrl: './company-restore.component.scss',
})
export class CompanyRestoreComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private dialogRef = inject(MatDialogRef<CompanyRestoreComponent>);
  protected data = inject(MAT_DIALOG_DATA) as { companyId: string };
  private profileService = inject(ProfileService);
  private functions = inject(FunctionsService);
  private storage = inject(StorageService);
  private snackBar = inject(MatSnackBar);

  readonly loading = signal(false);
  readonly backups = signal<BackupMetadata[]>([]);

  async ngOnInit(): Promise<void> {
    await this.loadBackups();
  }

  async loadBackups(): Promise<void> {
    this.loading.set(true);
    const profileId = this.profileService.profileId();
    const basePath = `profiles/${profileId}/backups`;
    const baseRef = this.storage.getRef(basePath);
    const result = await this.storage.listAll(baseRef);
    const backupFolders = result.prefixes; // These are folder refs for timestamps
    const matched: BackupMetadata[] = [];

    for (const folder of backupFolders) {
      try {
        const metadataRef = this.storage.getRef(`${folder.fullPath}/backup_metadata.json`);
        const url = await this.storage.getLink(metadataRef);
        const metadata = await fetch(url).then(res => res.json());

        if (metadata.originalCompanyId === this.data.companyId) {
          matched.push(metadata);
        }
      } catch (err) {
        console.warn(`Failed to load metadata for ${folder.fullPath}`, err);
      }
    }

    this.backups.set(matched.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
    this.loading.set(false);
  }

  async restoreBackup(backup: BackupMetadata): Promise<void> {
    const companyId = this.data.companyId;
    const profileId = this.profileService.profileId();
    const backupPath = `${PROFILES.path}/${profileId}/backups/${backup.timestamp}`;
    const request = {companyId, profileId, backupPath};
    const response = await this.functions.call('restoreCompanyData', request);
    this.handleResponse(response);
  }

  async deleteBackup(backup: BackupMetadata): Promise<void> {
    const confirmed = confirm(`Are you sure you want to delete backup: ${backup.timestamp}?`);
    if (!confirmed) return;

    const profileId = this.profileService.profileId();
    const fullPath = `profiles/${profileId}/backups/${backup.timestamp}`;

    // Firebase Storage has no recursive delete via SDK — recommend using Firebase Function for this in production.
    this.snackBar.open('Delete via Firebase Function not implemented here.', 'X', {duration: 3000});

    // Alternatively, call a function:
    // await this.functions.call('deleteBackupFolder', { profileId, timestamp: backup.timestamp });

    await this.loadBackups();
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  async restoreFromFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const content = await file.text();
    let parsed;

    try {
      parsed = JSON.parse(content);
    } catch {
      this.snackBar.open('Invalid backup file.', 'X', {duration: 2500});
      return;
    }

    const request = {
      companyId: this.data.companyId,
      profileId: this.profileService.profileId(),
      backupPath: parsed
    };

    const response = await this.functions.call('restoreCompanyData', request);
    this.handleResponse(response);
  }

  handleResponse(response: { success: boolean; message: string }): void {
    if (!response.success) {
      this.snackBar.open(response.message, 'X', {duration: 2500});
      return;
    }

    this.snackBar.open('Restore completed.', 'X', {duration: 2500});
    this.dialogRef.close({success: true});
  }
}
