import { TestBed } from '@angular/core/testing';

import { CompanhiasService } from './companhias.service';

describe('CompanhiasService', () => {
  let service: CompanhiasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompanhiasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
