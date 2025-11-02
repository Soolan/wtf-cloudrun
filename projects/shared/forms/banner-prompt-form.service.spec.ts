import { TestBed } from '@angular/core/testing';

import { BannerPromptFormService } from './banner-prompt-form.service';

describe('BannerPromptFormService', () => {
  let service: BannerPromptFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BannerPromptFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
