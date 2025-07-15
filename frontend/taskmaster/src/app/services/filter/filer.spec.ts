import { TestBed } from '@angular/core/testing';

import { Filer } from '../filer';

describe('Filer', () => {
  let service: Filer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Filer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
