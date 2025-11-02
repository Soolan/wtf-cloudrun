import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { LayoutVisibilityService } from '@shared/services';
import { SafeHtmlPipe } from '@shared/pipes';
import {FormField} from '@shared/interfaces';

export interface PublicFormData {
  title: string;
  description: string;
  fields: FormField[];
}

@Component({
  selector: 'app-public-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatRadioModule,
    MatDatepickerModule,
    MatSelectModule,
    MatSlideToggleModule,
    SafeHtmlPipe
  ],
  templateUrl: './public-form.component.html',
  styleUrls: ['./public-form.component.scss']
})
export class PublicFormComponent implements OnInit, OnDestroy {
  formData: PublicFormData | null = null;
  form: FormGroup;
  isSubmitted = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private layoutVisibilityService: LayoutVisibilityService
  ) {
    this.form = this.fb.group({});
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const storedData = sessionStorage.getItem(`form-run-${id}`);
      if (storedData) {
        this.formData = JSON.parse(storedData);
        this.buildForm();
        this.layoutVisibilityService.setVisibility(false, false);
      }
    }
  }

  ngOnDestroy(): void {
    this.layoutVisibilityService.setVisibility(true, true);
  }

  private buildForm(): void {
    if (!this.formData) return;

    for (const field of this.formData.fields) {
      const validators = field.required ? [Validators.required] : [];
      if (field.type === 'email') {
        validators.push(Validators.email);
      }
      this.form.addControl(field.name, this.fb.control('', validators));
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const channel = new BroadcastChannel('form-submission');
    channel.postMessage(this.form.value);
    channel.close();
    this.isSubmitted = true;
    // The ngOnDestroy hook will handle resetting visibility
  }
}
