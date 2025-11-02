import {Component, Input, OnChanges} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {NgForOf, NgSwitch, NgSwitchCase, NgSwitchDefault} from "@angular/common";
import {MatFormField, MatFormFieldModule} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {AuthType} from '@shared/enums';
import {MatOption} from '@angular/material/core';
import {MatSelect} from '@angular/material/select';

@Component({
  selector: 'lib-auth-creds',
  imports: [
    ReactiveFormsModule,
    NgSwitch,
    NgSwitchCase,
    MatFormFieldModule,
    MatInput,
    NgSwitchDefault,
    MatOption,
    MatSelect,
    NgForOf
  ],
  templateUrl: './auth-creds.component.html',
  standalone: true,
  styleUrl: './auth-creds.component.scss'
})
export class AuthCredsComponent  implements OnChanges {
  @Input() form!: FormGroup; // Credentials form group
  authTypes = Object.values(AuthType);

  ngOnChanges(): void {
    // Reset the form fields if the authType changes
    this.form.get('credentials')?.reset();
  }

  get authType(): string {
    return this.form.get('authType')?.value || '';
  }

  get credentialsForm(): FormGroup {
    return <FormGroup<any>>this.form.get('credentials');
  }

  protected readonly AuthType = AuthType;
}
