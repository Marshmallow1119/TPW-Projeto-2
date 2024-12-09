import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminProductsTableComponent } from './admin-products-table.component';

describe('AdminProductsTableComponent', () => {
  let component: AdminProductsTableComponent;
  let fixture: ComponentFixture<AdminProductsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProductsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminProductsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
