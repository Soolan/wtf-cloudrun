import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerPromptComponent } from './banner-prompt.component';

describe('BannerPromptComponent', () => {
  let component: BannerPromptComponent;
  let fixture: ComponentFixture<BannerPromptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BannerPromptComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BannerPromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
