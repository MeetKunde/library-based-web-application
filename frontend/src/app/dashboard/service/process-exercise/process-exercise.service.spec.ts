import { TestBed } from '@angular/core/testing';

import { ProcessExerciseService } from './process-exercise.service';
import { HttpClientModule } from '@angular/common/http';

describe('ProcessExerciseService', () => {
  let service: ProcessExerciseService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ]
    });
    service = TestBed.inject(ProcessExerciseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
