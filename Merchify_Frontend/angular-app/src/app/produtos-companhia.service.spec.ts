import { TestBed } from '@angular/core/testing';

import { ProdutosCompanhiaService } from './produtos-companhia.service';

describe('ProdutosCompanhiaService', () => {
  let service: ProdutosCompanhiaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProdutosCompanhiaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
