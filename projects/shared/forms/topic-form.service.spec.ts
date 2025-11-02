import { TestBed } from '@angular/core/testing';

import { TopicFormService } from './topic-form.service';

describe('TopicFormService', () => {
  let service: TopicFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TopicFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
