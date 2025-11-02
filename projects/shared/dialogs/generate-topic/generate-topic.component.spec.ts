import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateTopicComponent } from './generate-topic.component';

describe('GenerateComponent', () => {
  let component: GenerateTopicComponent;
  let fixture: ComponentFixture<GenerateTopicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerateTopicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerateTopicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
