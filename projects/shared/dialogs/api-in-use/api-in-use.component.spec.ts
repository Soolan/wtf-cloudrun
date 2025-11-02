import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiInUseComponent } from './api-in-use.component';

describe('ApiInUseComponent', () => {
  let component: ApiInUseComponent;
  let fixture: ComponentFixture<ApiInUseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApiInUseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApiInUseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
