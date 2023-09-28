import { TestBed } from '@angular/core/testing';

import { DashboardTrafficService } from './dashboard-traffic.service';

describe('DashboardTrafficService', () => {
  let service: DashboardTrafficService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardTrafficService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
