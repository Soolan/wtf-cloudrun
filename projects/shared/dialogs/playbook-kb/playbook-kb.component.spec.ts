import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaybookKbComponent } from './playbook-kb.component';

describe('PlaybookKbComponent', () => {
  let component: PlaybookKbComponent;
  let fixture: ComponentFixture<PlaybookKbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaybookKbComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaybookKbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
