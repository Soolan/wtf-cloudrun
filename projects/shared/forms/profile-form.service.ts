import { Injectable } from '@angular/core';
import {FormBuilder, FormGroup, UntypedFormArray, UntypedFormGroup, Validators} from '@angular/forms';
import {Social} from '@shared/interfaces';
import {BillingCycle, Plan} from '@shared/enums';

@Injectable({
  providedIn: 'root'
})
export class ProfileFormService {
  form: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      display_name: '',
      avatar: '',
      firstname: '',
      lastname: '',
      biography: '',
      tag: '',
      balances: [],
      loyalty: '',
      achievements: '',
      currentPlan: this.formBuilder.group({
        plan: Plan.Pro,
        billingCycle: BillingCycle.Monthly,
        billingDate: 0,
        autoRenew: true
      }),
      suspended: false,
      isAdmin: false,
      security: this.formBuilder.group({
        private: false,
        emailSafetyCode: '',
        pinCode: '',
        mobile: '',
        twoFA: this.formBuilder.group({
          paired: false,
          active: false
        }),
        ipTracking: []
      }),
      sendMe: this.formBuilder.group({
        email: false,
        newsletter: false,
        notification: false
      }),
      socials: formBuilder.array([
        this.formBuilder.group({
          label: [null, Validators.required],
          url: [null, Validators.required],
        })
      ]),
      timestamps: this.formBuilder.group({
        created_at: ['', [Validators.required]],
        updated_at: ['', [Validators.required]],
        deleted_at: [''],
      })
    });
  }

  // socials ===================================
  getSocialFormGroup(): UntypedFormGroup {
    return this.formBuilder.group({
      label: [null, Validators.required],
      url: [null, Validators.required],
    });
  }

  get socialsArray(): UntypedFormArray {
    return this.form.get(['socials']) as UntypedFormArray;
  }

  addSocial(): UntypedFormGroup {
    const socialFormGroup = this.getSocialFormGroup();
    this.socialsArray.push(socialFormGroup);
    this.form.markAsDirty();
    return socialFormGroup;
  }

  deleteSocial(index: number): void {
    this.socialsArray.removeAt(index);
    this.form.markAsDirty();
  }

  patchSocials(socials: Social[]): void {
    for (const social of socials) {
      const group = this.addSocial();
      group.patchValue(social);
    }
  }

  resetSocials(): void {
    this.socialsArray.clear();
  }
}
