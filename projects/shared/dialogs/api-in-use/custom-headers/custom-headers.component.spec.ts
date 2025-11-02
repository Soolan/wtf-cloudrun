import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomHeadersComponent } from './custom-headers.component';

describe('CustomHeadersComponent', () => {
  let component: CustomHeadersComponent;
  let fixture: ComponentFixture<CustomHeadersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomHeadersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomHeadersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
