import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolutionGraphComponent } from './solution-graph.component';

describe('SolutionGraphComponent', () => {
  let component: SolutionGraphComponent;
  let fixture: ComponentFixture<SolutionGraphComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SolutionGraphComponent]
    });
    fixture = TestBed.createComponent(SolutionGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
