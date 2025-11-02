import { TestBed } from '@angular/core/testing';

import { SeoSocialShareService } from './seo-social-share.service';

describe('SeoSocialShareService', () => {
  let service: SeoSocialShareService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeoSocialShareService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
