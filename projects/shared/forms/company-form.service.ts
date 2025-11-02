import { Injectable } from '@angular/core';
import {CustomDomain, Entity, Social} from '@shared/interfaces';
import {FormBuilder, FormGroup, UntypedFormArray, UntypedFormGroup, Validators} from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class CompanyFormService {
  form: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]],
      logo: '',
      description: '',
      website: '',
      email: '',
      banner: '',
      tags: [],
      socials: this.formBuilder.array([
        this.formBuilder.group({
          label: [null, Validators.required],
          url: [null, Validators.required],
        })
      ]),
      team: this.formBuilder.array([
        this.formBuilder.group({
          id: [null, Validators.required],
          name: [null, Validators.required],
          avatar: [null, Validators.required],
        })
      ]),
      domains: this.formBuilder.array([
        this.formBuilder.group({
          wtfProduct: [null, Validators.required],
          timer: [null, Validators.required],
          domain: [null, Validators.required],
          forwardTo: [null, Validators.required],
          status: [null, Validators.required],
          record: this.formBuilder.group({
            name: [null, Validators.required],
            type: [null, Validators.required],
            data: [null, Validators.required],
          })
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

  // teams ===================================
  getTeamFormGroup(): UntypedFormGroup {
    return this.formBuilder.group({
      id: [null, Validators.required],
      name: [null, Validators.required],
      avatar: [null, Validators.required],
    })
  }

  get teamArray(): UntypedFormArray {
    return this.form.get(['team']) as UntypedFormArray;
  }

  addMember(): UntypedFormGroup {
    const teamFormGroup = this.getTeamFormGroup();
    this.teamArray.push(teamFormGroup);
    this.form.markAsDirty();
    return teamFormGroup;
  }

  deleteMember(index: number): void {
    this.teamArray.removeAt(index);
    this.form.markAsDirty();
  }

  patchTeam(team: Entity[]): void {
    for (const member of team) {
      const group = this.addMember();
      group.patchValue(member);
    }
  }

  resetTeam(): void {
    this.teamArray.clear();
  }

  // domains ===================================
  getDomainFormGroup(): UntypedFormGroup {
    return this.formBuilder.group({
      wtfProduct: [null, Validators.required],
      domain: [null, Validators.required],
      timer: [null, Validators.required],
      forwardTo: [null, Validators.required],
      status: [null, Validators.required],
      record: this.formBuilder.group({
        name: [null, Validators.required],
        type: [null, Validators.required],
        data: [null, Validators.required],
      })
    })
  }

  get domainsArray(): UntypedFormArray {
    return this.form.get(['domains']) as UntypedFormArray;
  }

  addDomain(): UntypedFormGroup {
    const domainFormGroup = this.getDomainFormGroup();
    this.domainsArray.push(domainFormGroup);
    this.form.markAsDirty();
    return domainFormGroup;
  }

  deleteDomain(index: number): void {
    this.domainsArray.removeAt(index);
    this.form.markAsDirty();
  }

  patchDomains(domains: CustomDomain[]): void {
    for (const domain of domains) {
      const group = this.addDomain();
      group.patchValue(domain);
    }
  }

  resetDomains(): void {
    this.domainsArray.clear();
  }
}

