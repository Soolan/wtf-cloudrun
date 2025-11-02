import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaybookMaintainerComponent } from './playbook-maintainer.component';

describe('PlaybookMaintainerComponent', () => {
  let component: PlaybookMaintainerComponent;
  let fixture: ComponentFixture<PlaybookMaintainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaybookMaintainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaybookMaintainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
