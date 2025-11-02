import { Injectable } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PersonaEthnicity, PersonaOutfit} from '@shared/enums';

@Injectable({
  providedIn: 'root'
})
export class AvatarPromptFormService {
  form: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      gender: ['', [Validators.required]],
      lensPurpose: ['', [Validators.required]],
      ethnicity: [PersonaEthnicity.Indigenous, [Validators.required]],
      outfit: [PersonaOutfit.Smart, [Validators.required]],
      age: [20, [Validators.required]],
      details: '',
    });
  }
}
