import { TestBed } from '@angular/core/testing';

import { CompanyFormService } from './company-form.service';

describe('CompanyFormService', () => {
  let service: CompanyFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompanyFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
