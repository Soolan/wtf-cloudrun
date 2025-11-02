import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {Injectable} from '@angular/core';
import {KeyValue} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ApiInUseFormService {
  form: UntypedFormGroup;

  constructor(private formBuilder: UntypedFormBuilder) {
    this.form = this.formBuilder.group({
      apiId: ['', Validators.required],
      authType: ['', Validators.required],
      credentials: this.formBuilder.group({
        apiKey: '', // For API_KEY auth
        token: '', // For BEARER auth
        username: '', // For BASIC auth
        password: '', // For BASIC auth
        clientId: '', // For OAUTH2
        clientSecret: '', // For OAUTH2
        accessToken: '', // For OAUTH2
        refreshToken: '', // Optional for OAUTH2
      }),
      active: false,
      headers: this.formBuilder.array([
        this.formBuilder.group({
          key: [null, Validators.required],
          value: [null, Validators.required],
        })
      ]),
      timestamps: this.formBuilder.group({
        created_at: ['', [Validators.required]],
        updated_at: ['', [Validators.required]],
        deleted_at: [''],
      }),
    });
  }


  // headers ===================================
  getHeaderFormGroup(): UntypedFormGroup {
    return this.formBuilder.group({
      key: [null, Validators.required],
      value: [null, Validators.required],
    });
  }

  get headersArray(): UntypedFormArray {
    return this.form.get(['headers']) as UntypedFormArray;
  }

  addHeader(): UntypedFormGroup {
    const headerFormGroup = this.getHeaderFormGroup();
    this.headersArray.push(headerFormGroup);
    this.form.markAsDirty();
    return headerFormGroup;
  }

  deleteHeader(index: number): void {
    this.headersArray.removeAt(index);
    this.form.markAsDirty();
  }

  patchHeaders(headers: KeyValue<string, string>[]): void {
    for (const header of headers) {
      const group = this.addHeader();
      group.patchValue(header);
    }
  }

  resetHeaders(): void {
    this.headersArray.clear();
  }

  // Trim blank or incomplete headers (missing keys, values or blank-spaced entries)
  trimHeaders(): void {
    const cleanedHeaders = this.headersArray.controls
      .map(control => control.value)
      .filter(header => {
        const key = (header.key || '').trim();
        const value = (header.value || '').trim();
        return key && value;
      });
    this.resetHeaders();
    this.patchHeaders(cleanedHeaders);
  }
}
