import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyBackupComponent } from './company-backup.component';

describe('CompanyBackupComponent', () => {
  let component: CompanyBackupComponent;
  let fixture: ComponentFixture<CompanyBackupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyBackupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyBackupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
