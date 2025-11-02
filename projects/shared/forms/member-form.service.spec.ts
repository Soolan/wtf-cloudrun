import { TestBed } from '@angular/core/testing';

import { MemberFormService } from './member-form.service';

describe('MemberFormService', () => {
  let service: MemberFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MemberFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
