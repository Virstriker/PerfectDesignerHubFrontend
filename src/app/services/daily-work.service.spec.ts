import { TestBed } from '@angular/core/testing';

import { DailyWorkService } from './daily-work.service';

describe('DailyWorkService', () => {
  let service: DailyWorkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DailyWorkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
