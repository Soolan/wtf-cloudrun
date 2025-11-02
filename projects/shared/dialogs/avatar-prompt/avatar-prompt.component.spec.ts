import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvatarPromptComponent } from './avatar-prompt.component';

describe('AvatarPromptComponent', () => {
  let component: AvatarPromptComponent;
  let fixture: ComponentFixture<AvatarPromptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarPromptComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvatarPromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
