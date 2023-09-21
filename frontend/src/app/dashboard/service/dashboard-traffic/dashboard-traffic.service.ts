import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { SolutionSchemeJson } from '../../shared/SolutionSchemeJson';
import { DependencyImportanceEnum } from '../../shared/enums/DependencyImportanceEnum';
import { DependencyReasonEnum } from '../../shared/enums/DependencyReasonEnum';
import { DependencyTypeEnum } from '../../shared/enums/DependencyTypeEnum';
import { DependencyCategoryEnum } from '../../shared/enums/DependencyCategoryEnum';

@Injectable({
  providedIn: 'root'
})
export class DashboardTrafficService {
  private solutionObserver = new Subject();
  private dependenciesFilterObserver = new Subject();
  private markOutShapesObserver = new Subject();

  public solutionSubscriber$ = this.solutionObserver.asObservable();
  public dependenciesFilterSubscriber$ = this.dependenciesFilterObserver.asObservable();
  public markOutShapesSubscriber$ = this.markOutShapesObserver.asObservable();

  constructor() { }

  createSolutionGraph(solution: SolutionSchemeJson | null) {
    this.solutionObserver.next(solution);
  }

  filterDependencies(dependencyFeatures: [DependencyCategoryEnum[], DependencyTypeEnum[], DependencyReasonEnum[], DependencyImportanceEnum[]]) {
    this.dependenciesFilterObserver.next(dependencyFeatures);
  }

  markOut(shapes: any[]) {
    this.markOutShapesObserver.next(shapes);
  }
}
