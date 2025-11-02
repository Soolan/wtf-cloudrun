import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketplaceItemComponent } from './marketplace-item.component';

describe('MarketplaceItemComponent', () => {
  let component: MarketplaceItemComponent;
  let fixture: ComponentFixture<MarketplaceItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketplaceItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketplaceItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
