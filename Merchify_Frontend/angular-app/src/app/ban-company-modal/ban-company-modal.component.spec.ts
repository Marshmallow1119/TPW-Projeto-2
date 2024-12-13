import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BanCompanyModalComponent } from './ban-company-modal.component';

describe('BanCompanyModalComponent', () => {
  let component: BanCompanyModalComponent;
  let fixture: ComponentFixture<BanCompanyModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BanCompanyModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BanCompanyModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
