import { TestBed } from '@angular/core/testing';

import { PaymentPageService } from './payment-page.service';

describe('PaymentPageService', () => {
  let service: PaymentPageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentPageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
