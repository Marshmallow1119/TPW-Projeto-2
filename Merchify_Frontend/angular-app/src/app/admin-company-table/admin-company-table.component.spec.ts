import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCompanyTableComponent } from './admin-company-table.component';

describe('AdminCompanyTableComponent', () => {
  let component: AdminCompanyTableComponent;
  let fixture: ComponentFixture<AdminCompanyTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCompanyTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCompanyTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
