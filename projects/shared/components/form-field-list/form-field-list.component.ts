import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {FormField} from "@shared/interfaces";

@Component({
  selector: 'lib-form-field-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSlideToggleModule,
  ],
  templateUrl: './form-field-list.component.html',
  styleUrls: ['./form-field-list.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormFieldListComponent),
      multi: true
    }
  ]
})
export class FormFieldListComponent implements ControlValueAccessor {
  @Input() disabled = false;
  form: FormGroup;

  fieldTypes: FormField['type'][] = [
    'string', 'textarea', 'number', 'boolean', 'checkbox', 'custom-html', 'date', 'dropdown', 'email', 'file', 'hidden', 'password', 'radio-group'
  ];

  onChange: (value: FormField[]) => void = () => {};
  onTouched: () => void = () => {};

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      fields: this.fb.array([])
    });

    this.fields.valueChanges.subscribe(value => {
      this.onChange(value);
      this.onTouched();
    });
  }

  get fields(): FormArray {
    return this.form.get('fields') as FormArray;
  }

  writeValue(value: FormField[] | null): void {
    if (value) {
      this.fields.clear();
      value.forEach(field => this.fields.push(this.createFieldGroup(field)));
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  createFieldGroup(field?: FormField): FormGroup {
    const optionsFGs = field?.options?.map(opt => this.createOptionGroup(opt)) || [];
    const group = this.fb.group({
      name: [field?.name || ''],
      label: [field?.label || ''],
      type: [field?.type || 'string'],
      placeholder: [field?.placeholder || ''],
      required: [field?.required || false],
      htmlContent: [field?.htmlContent || ''],
      options: this.fb.array(optionsFGs)
    });

    group.get('label')?.valueChanges.subscribe(labelValue => {
      const nameControl = group.get('name');
      if (nameControl?.pristine) {
        const nameValue = labelValue?.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        nameControl.setValue(nameValue || '', { emitEvent: false });
      }
    });

    return group;
  }

  createOptionGroup(option?: { value: string; label: string; }): FormGroup {
    return this.fb.group({
      value: [option?.value || ''],
      label: [option?.label || '']
    });
  }

  getOptions(fieldControl: any): FormArray {
    return fieldControl.get('options') as FormArray;
  }

  addField(): void {
    this.fields.push(this.createFieldGroup());
  }

  removeField(index: number): void {
    this.fields.removeAt(index);
  }

  addOption(fieldIndex: number): void {
    const options = this.fields.at(fieldIndex).get('options') as FormArray;
    options.push(this.createOptionGroup());
  }

  removeOption(fieldIndex: number, optionIndex: number): void {
    const options = this.fields.at(fieldIndex).get('options') as FormArray;
    options.removeAt(optionIndex);
  }
}
