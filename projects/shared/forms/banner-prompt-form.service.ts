import { Injectable } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BackgroundStyle} from '@shared/enums';

@Injectable({
  providedIn: 'root'
})
export class BannerPromptFormService {
  form: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      style: [BackgroundStyle.Minimal, [Validators.required]],
      business: ['', [Validators.required]],
      details: '',
    });
  }
}
