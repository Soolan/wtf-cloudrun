import { Injectable } from '@angular/core';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {Resource} from '@shared/interfaces';

@Injectable({
  providedIn: 'root'
})
export class TicketFormService {
  form: UntypedFormGroup;

  constructor(private formBuilder: UntypedFormBuilder) {
    this.form = this.formBuilder.group({
      title: [null, Validators.required],
      serial: [null, Validators.required],
      deadline: [null],
      description: [null],
      product: [null, Validators.required],
      stage: [null, Validators.required],
      release_entry: [null],
      timestamps: this.formBuilder.group({
        created_at: ['', [Validators.required]],
        updated_at: ['', [Validators.required]],
        deleted_at: [''],
      }),
      dependencies: [], // (ticket ids) tickets that must be completed before this one
      creator: this.formBuilder.group({
        id: null,
        name: null,
        avatar: null
      }),
      process: null,
      assignedTo: this.formBuilder.group({
        id: null,
        name: null,
        avatar: null
      }),
      attachments: this.formBuilder.array([
        this.formBuilder.group({
          name: [null, Validators.required],
          url: [null, Validators.required],
        })
      ]),
      priority: null,
    });
  }

  // attachments ===================================
  getAttachmentFormGroup(): UntypedFormGroup {
    return this.formBuilder.group({
      name: [null, Validators.required],
      url: [null, Validators.required],
    })
  }

  get attachmentArray(): UntypedFormArray {
    return this.form.get(['attachments']) as UntypedFormArray;
  }

  addAttachment(): UntypedFormGroup {
    const attachmentFormGroup = this.getAttachmentFormGroup();
    this.attachmentArray.push(attachmentFormGroup);
    this.form.markAsDirty();
    return attachmentFormGroup;
  }

  deleteAttachment(index: number): void {
    this.attachmentArray.removeAt(index);
    this.form.markAsDirty();
  }

  patchAttachment(attachments: Resource[]): void {
    for (const a of attachments) {
      const group = this.addAttachment();
      group.patchValue(a);
    }
  }

  resetAttachment(): void {
    this.attachmentArray.clear();
  }
}
