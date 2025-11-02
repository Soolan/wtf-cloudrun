import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvesstorsComponent } from './invesstors.component';

describe('InvesstorsComponent', () => {
  let component: InvesstorsComponent;
  let fixture: ComponentFixture<InvesstorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvesstorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvesstorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
