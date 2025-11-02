import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {Resource} from '@shared/interfaces';
import {MatButton, MatIconButton, MatMiniFabButton} from '@angular/material/button';
import {MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';
import {NgForOf, NgIf} from '@angular/common';
import {FormsModule, ReactiveFormsModule, UntypedFormArray, UntypedFormGroup} from '@angular/forms';
import {MatRadioButton, MatRadioGroup} from '@angular/material/radio';
import {LOGO_MEDIA, OTHER_MEDIA} from '@shared/constants';
import {TicketFormService} from '@shared/forms';
import {UrlNamePipe} from '@shared/pipes/url-name.pipe';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'lib-attachments',
  imports: [
    MatButton,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    FormsModule,
    MatRadioGroup,
    MatRadioButton,
    MatSuffix,
    MatTooltip
  ],
  templateUrl: './attachments.component.html',
  standalone: true,
  styleUrl: './attachments.component.scss'
})
export class AttachmentsComponent {
  @Input() formService!: TicketFormService;
  private urlNamePipe = inject(UrlNamePipe);

  addButton = true;
  newAttachment!: Resource;
  confirmDeleteIndex: number | null = null;  // Index of the attachment being deleted
  source!: string;

  // Method to toggle the url input field for adding attachments
  toggle(): void {
    this.addButton = false;
    this.newAttachment = {name: '', url: ''};  // Reset the input fields
  }

  reset(): void {
    this.addButton = true;
    this.newAttachment = {name: '', url: ''};  // Reset the input fields
  }

  add(): void {
    if (!this.newAttachment.url?.trim()) return;
    const group = this.formService.addAttachment();
    group.patchValue({
      url: this.newAttachment.url,
      name: this.urlNamePipe.transform(this.newAttachment.url),
    });
    this.reset();
  }

  delete(index: number): void {
    this.formService.deleteAttachment(index);
    this.confirmDeleteIndex = null;
  }

  // Method to show the confirmation message
  confirm(index: number): void {
    this.confirmDeleteIndex = index;
  }

  // Method to cancel the deletion and revert to the delete button
  cancel(): void {
    this.reset();
    this.confirmDeleteIndex = null;
  }

  update(file: any) {}

  get path():string {
    return "profiles";
  }

  get attachments(): UntypedFormGroup[] {
    return this.formService.attachmentArray.controls as UntypedFormGroup[];
  }

  getName(name: string): string {
    return name.length > 13 ? name.slice(0,10)+ '...' : name;
  }
  protected readonly OTHER_MEDIA = OTHER_MEDIA;
  protected readonly LOGO_MEDIA = LOGO_MEDIA;
  protected readonly UntypedFormGroup = UntypedFormGroup;
}
