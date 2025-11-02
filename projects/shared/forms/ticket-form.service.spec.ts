import { TestBed } from '@angular/core/testing';

import { TicketFormService } from './ticket-form.service';

describe('TicketFormService', () => {
  let service: TicketFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TicketFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
