import { Injectable } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TopicStatus} from '@shared/enums';
import {BLANK_PERSONA} from '@shared/constants';

@Injectable({
  providedIn: 'root'
})
export class TopicFormService {
  form: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      kbId: null,
      parentId: null,
      title: ['', [Validators.required, Validators.maxLength(300)]],
      subtitle: ['', [Validators.required, Validators.maxLength(300)]],
      order: [0, [Validators.required]],
      status: [TopicStatus.Draft, Validators.required],
      tags: [],
      creator: this.formBuilder.group({
        id: '', name: '', avatar: ''
      }),
      fullText: null,
      timestamps: this.formBuilder.group({
        created_at: [0, Validators.required],
        updated_at: [0, Validators.required],
        deleted_at: [0, Validators.required]
      })
    });
  }
}

