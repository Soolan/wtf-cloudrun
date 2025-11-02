import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketStageComponent } from './ticket-stage.component';

describe('TicketStageComponent', () => {
  let component: TicketStageComponent;
  let fixture: ComponentFixture<TicketStageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketStageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketStageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
