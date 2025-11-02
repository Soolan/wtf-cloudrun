import { TestBed } from '@angular/core/testing';

import { ProfileFinderService } from './profile-finder.service';

describe('ProfileFinderService', () => {
  let service: ProfileFinderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProfileFinderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
