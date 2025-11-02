import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {Injectable} from '@angular/core';
import {KeyValue} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ApiFormService {
  form: UntypedFormGroup;

  constructor(private formBuilder: UntypedFormBuilder) {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      intro: '',
      howTo: '',
      settings: '',
      billing: '',
      logo: ['', Validators.required],
      baseUrl: ['', Validators.required],
      headers: this.formBuilder.array([
        this.formBuilder.group({
          key: [null, Validators.required],
          value: [null, Validators.required],
        })
      ]),
      private: [true, Validators.required],
      verified: [false, Validators.required],
      installs: [0, Validators.required],
      tags: [],
      creator: this.formBuilder.group({id: '', name: '', avatar: ''}),
      timestamps: this.formBuilder.group({
        created_at: ['', [Validators.required]],
        updated_at: ['', [Validators.required]],
        deleted_at: [''],
      }),
    });
  }

  // headers ===================================
  getHeadersFormGroup(): UntypedFormGroup {
    return this.formBuilder.group({
      key: [null, Validators.required],
      value: [null, Validators.required],
    });
  }

  get headersArray(): UntypedFormArray {
    return this.form.get(['headers']) as UntypedFormArray;
  }

  addHeader(): UntypedFormGroup {
    const headersFormGroup = this.getHeadersFormGroup();
    this.headersArray.push(headersFormGroup);
    this.form.markAsDirty();
    return headersFormGroup;
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
}
