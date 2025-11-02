import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingAgentComponent } from './onboarding-agent.component';

describe('OnboardingAgentComponent', () => {
  let component: OnboardingAgentComponent;
  let fixture: ComponentFixture<OnboardingAgentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingAgentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnboardingAgentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
