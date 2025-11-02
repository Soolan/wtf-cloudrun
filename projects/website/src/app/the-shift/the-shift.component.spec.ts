import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TheShiftComponent } from './the-shift.component';

describe('TheShiftComponent', () => {
  let component: TheShiftComponent;
  let fixture: ComponentFixture<TheShiftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TheShiftComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TheShiftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
