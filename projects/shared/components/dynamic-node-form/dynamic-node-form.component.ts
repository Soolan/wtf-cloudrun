import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TextFieldModule } from '@angular/cdk/text-field';
import { FormFieldListComponent } from '../form-field-list/form-field-list.component';
import { FormUrlsComponent } from '../form-urls/form-urls.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {ParametersSchema} from '@shared/interfaces';

@Component({
  selector: 'lib-dynamic-node-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    TextFieldModule,
    FormFieldListComponent,
    FormUrlsComponent
  ],
  templateUrl: './dynamic-node-form.component.html',
  styleUrls: ['./dynamic-node-form.component.scss']
})
export class DynamicNodeFormComponent implements OnInit, OnDestroy {
  @Input() parametersSchema: ParametersSchema | null = null;
  @Input() parameters: { [key: string]: any } | null = null;
  @Input() nodeId: string | null = null;
  @Output() parametersChange = new EventEmitter<{ [key: string]: any }>();
  form: FormGroup | null = null;

  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildForm(): void {
    if (!this.parametersSchema) {
      this.form = null;
      return;
    }

    const formControls: { [key: string]: FormControl } = {};
    for (const field of this.parametersSchema.fields) {
      const initialValue = this.parameters?.[field.name] ?? field.defaultValue;
      formControls[field.name] = this.fb.control(initialValue);
    }

    this.form = this.fb.group(formControls);

    this.form.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.parametersChange.emit(value);
    });
  }
}
