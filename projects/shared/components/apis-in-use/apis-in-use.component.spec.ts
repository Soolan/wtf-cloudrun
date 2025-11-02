import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApisInUseComponent } from './apis-in-use.component';

describe('ApisInUseComponent', () => {
  let component: ApisInUseComponent;
  let fixture: ComponentFixture<ApisInUseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApisInUseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApisInUseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
