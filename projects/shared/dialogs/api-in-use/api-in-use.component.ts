import {Component, inject, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {ApiInUseFormService} from '@shared/forms';
import {AuthService, CrudService} from '@shared/services';
import {MatSnackBar} from '@angular/material/snack-bar';
import {
  MAT_DIALOG_DATA,
  MatDialogActions, MatDialogClose,
  MatDialogContent,
  MatDialogRef
} from '@angular/material/dialog';
import {MatAnchor, MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {MatFormField, MatLabel} from '@angular/material/select';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInput} from '@angular/material/input';
import {MatDivider} from '@angular/material/divider';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {StorageUrlPipe} from '@shared/pipes';
import {AuthCredsComponent} from '@shared/dialogs/api-in-use/auth-creds/auth-creds.component';
import {MatStep, MatStepLabel, MatStepper} from '@angular/material/stepper';
import {MatSuffix} from '@angular/material/form-field';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelDescription, MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';
import {ApiInUse} from '@shared/interfaces';

@Component({
  selector: 'app-api-in-use',
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatAnchor,
    MatIcon,
    MatSlideToggle,
    MatLabel,
    MatFormField,
    FormsModule,
    MatInput,
    ReactiveFormsModule,
    MatDivider,
    MatButton,
    MatDialogClose,
    StorageUrlPipe,
    AsyncPipe,
    AuthCredsComponent,
    NgForOf,
    NgIf,
    MatIconButton,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelTitle,
    MatExpansionPanelHeader,
    MatExpansionPanelDescription,
  ],
  templateUrl: './api-in-use.component.html',
  standalone: true,
  styleUrl: './api-in-use.component.scss'
})
export class ApiInUseComponent implements OnInit {
  @ViewChildren('panel') panel!: QueryList<MatExpansionPanel>;

  deletingHeaders! : boolean[];

  protected formService = inject(ApiInUseFormService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private crud = inject(CrudService);
  private storageUrl = inject(StorageUrlPipe);
  protected dialogRef = inject(MatDialogRef<ApiInUseComponent>);
  protected data = inject(MAT_DIALOG_DATA);

  constructor() { }

  ngOnInit() {
    this.reset();
    this.patch();
  }

  private patch() {
    this.form.patchValue(this.data.apiInUse);
    this.formService.patchHeaders(this.data.apiInUse.headers);
    this.deletingHeaders = this.form.get('headers')?.value.map(() => false) ?? [];
  }

  private reset() {
    this.form.reset();
    this.formService.resetHeaders();
  }

  addHeader() {
    this.formService.addHeader();
    this.deletingHeaders.push(false);
    // Wait for DOM update
    setTimeout(() => {
      const panelsArray = this.panel.toArray();
      panelsArray[panelsArray.length - 1]?.open();
    });
  }

  deleteHeader(index: number) {
    this.formService.deleteHeader(index)
    this.deletingHeaders.fill(false);
    this.deletingHeaders.splice(index, 1);
  }

  handleDeleteClick(event: MouseEvent, panel: MatExpansionPanel, index: number) {
    panel.expanded?
      event.stopPropagation():
      panel.open();
    this.deletingHeaders[index] = true;
  }

  async save() {
    const data = this.DTO;
    const id = this.data.apiInUse.id;
    await this.crud.update(this.data.path, id, data);
    this.snackBar.open('API updated successfully!','X', {duration: 3000});
    this.dialogRef.close({id, ...data});
  }

  get DTO(): ApiInUse {
    const data: ApiInUse = this.form.value;
    data.timestamps.updated_at = Date.now();
    this.formService.trimHeaders();
    return data;
  }

  get form(): FormGroup {
    return this.formService.form;
  }
}
