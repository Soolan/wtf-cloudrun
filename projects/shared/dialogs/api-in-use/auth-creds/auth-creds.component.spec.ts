import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthCredsComponent } from './auth-creds.component';

describe('AuthCredsComponent', () => {
  let component: AuthCredsComponent;
  let fixture: ComponentFixture<AuthCredsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthCredsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthCredsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
