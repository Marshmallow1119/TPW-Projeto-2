import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyCompanyProductsComponent } from './my-company-products.component';

describe('MyCompanyProductsComponent', () => {
  let component: MyCompanyProductsComponent;
  let fixture: ComponentFixture<MyCompanyProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyCompanyProductsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyCompanyProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
