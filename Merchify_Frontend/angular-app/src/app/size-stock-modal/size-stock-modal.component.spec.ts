import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SizeStockModalComponent } from './size-stock-modal.component';

describe('SizeStockModalComponent', () => {
  let component: SizeStockModalComponent;
  let fixture: ComponentFixture<SizeStockModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SizeStockModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SizeStockModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
