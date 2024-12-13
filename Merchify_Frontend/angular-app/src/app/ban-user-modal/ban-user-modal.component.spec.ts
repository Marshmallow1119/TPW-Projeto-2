import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BanUserModalComponent } from './ban-user-modal.component';

describe('BanUserModalComponent', () => {
  let component: BanUserModalComponent;
  let fixture: ComponentFixture<BanUserModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BanUserModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BanUserModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
