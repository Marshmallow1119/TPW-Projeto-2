import { TestBed } from '@angular/core/testing';

import { ProdutosArtistaService } from './produtos-artista.service';

describe('ProdutosArtistaService', () => {
  let service: ProdutosArtistaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProdutosArtistaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
