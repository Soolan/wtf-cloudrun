import { TestBed } from '@angular/core/testing';

import { AvatarPromptFormService } from './avatar-prompt-form.service';

describe('AvatarPromptFormService', () => {
  let service: AvatarPromptFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AvatarPromptFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
