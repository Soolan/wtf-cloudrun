import { Injectable } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Injectable({
  providedIn: 'root'
})
export class MemberFormService {
  form: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      persona: this.formBuilder.group({
        id: ['', [Validators.required]],
        name: ['', [Validators.required]],
        avatar: [''],
      }),
      role: ['', [Validators.required]],
      bio: '',
      order: ['', [Validators.required]],
      contact: [],
      type: ['', [Validators.required]],
      department: ['', [Validators.required]],
      members: [],
      active: true,
      invited: false,
      timestamps: this.formBuilder.group({
        created_at: ['', [Validators.required]],
        updated_at: ['', [Validators.required]],
        deleted_at: [''],
      })
    });
  }
}
