import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailSubscriberComponent } from './email-subscriber.component';

describe('EmailSubscriberComponent', () => {
  let component: EmailSubscriberComponent;
  let fixture: ComponentFixture<EmailSubscriberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailSubscriberComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailSubscriberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
