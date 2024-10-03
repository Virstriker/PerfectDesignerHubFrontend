import { TestBed } from '@angular/core/testing';

import { MeasurementServiceService } from './measurement-service.service';

describe('MeasurementServiceService', () => {
  let service: MeasurementServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MeasurementServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
