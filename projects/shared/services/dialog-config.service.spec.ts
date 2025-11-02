import { TestBed } from '@angular/core/testing';

import { DialogConfigService } from './dialog-config.service';

describe('DialogConfigService', () => {
  let service: DialogConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DialogConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
