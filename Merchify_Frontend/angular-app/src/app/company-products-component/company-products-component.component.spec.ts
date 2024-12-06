import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyProductsComponentComponent } from './company-products-component.component';

describe('CompanyProductsComponentComponent', () => {
  let component: CompanyProductsComponentComponent;
  let fixture: ComponentFixture<CompanyProductsComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyProductsComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyProductsComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
