import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyRestoreComponent } from './company-restore.component';

describe('CompanyRestoreComponent', () => {
  let component: CompanyRestoreComponent;
  let fixture: ComponentFixture<CompanyRestoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyRestoreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyRestoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
