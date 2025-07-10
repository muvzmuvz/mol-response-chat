import { TestBed } from '@angular/core/testing';

import { Operator } from './operator';

describe('Operator', () => {
  let service: Operator;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Operator);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
