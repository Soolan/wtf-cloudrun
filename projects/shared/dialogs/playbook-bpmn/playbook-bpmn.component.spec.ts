import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaybookBpmnComponent } from './playbook-bpmn.component';

describe('PlaybookBpmnComponent', () => {
  let component: PlaybookBpmnComponent;
  let fixture: ComponentFixture<PlaybookBpmnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaybookBpmnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaybookBpmnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
