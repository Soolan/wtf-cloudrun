import { TestBed } from '@angular/core/testing';

import { LogoPromptFormService } from './logo-prompt-form.service';

describe('LogoPromptFormService', () => {
  let service: LogoPromptFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LogoPromptFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
