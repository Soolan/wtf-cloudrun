import { Injectable } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BackgroundStyle, LogoStyle} from '@shared/enums';

@Injectable({
  providedIn: 'root'
})
export class LogoPromptFormService {
  form: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      style: [LogoStyle.Minimal, [Validators.required]],
      business: ['', [Validators.required]],
      background: [BackgroundStyle.Solid, [Validators.required]],
      details: '',
    });
  }
}
