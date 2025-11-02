import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanChangeComponent } from './plan-change.component';

describe('PlanChangeComponent', () => {
  let component: PlanChangeComponent;
  let fixture: ComponentFixture<PlanChangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanChangeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
