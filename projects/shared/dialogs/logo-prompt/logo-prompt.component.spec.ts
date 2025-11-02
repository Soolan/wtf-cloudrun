import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoPromptComponent } from './logo-prompt.component';

describe('LogoPromptComponent', () => {
  let component: LogoPromptComponent;
  let fixture: ComponentFixture<LogoPromptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogoPromptComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogoPromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
