import { TestBed } from '@angular/core/testing';

import { DailyOrderServiceService } from './daily-order-service.service';

describe('DailyOrderServiceService', () => {
  let service: DailyOrderServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DailyOrderServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
