import { TestBed } from '@angular/core/testing';

import { ExerciseDatabaseService } from './exercise-database.service';

describe('ExerciseDatabaseService', () => {
  let service: ExerciseDatabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExerciseDatabaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
