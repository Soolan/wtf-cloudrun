import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingAgentDialogComponent } from './onboarding-agent-dialog.component';

describe('OnboardingAgentDialogComponent', () => {
  let component: OnboardingAgentDialogComponent;
  let fixture: ComponentFixture<OnboardingAgentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingAgentDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnboardingAgentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
