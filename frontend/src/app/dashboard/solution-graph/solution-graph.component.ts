import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SolutionSchemeJson } from '../shared/SolutionSchemeJson';
import { DashboardTrafficService } from '../service/dashboard-traffic/dashboard-traffic.service';
import { Colors, Sizes } from './Config';
import { DependencyImportanceEnum } from '../shared/enums/DependencyImportanceEnum';
import { DependencyCategoryEnum } from '../shared/enums/DependencyCategoryEnum';
import { DependencyTypeEnum } from '../shared/enums/DependencyTypeEnum';
import { DependencyReasonEnum } from '../shared/enums/DependencyReasonEnum';

declare const d3: any;

@Component({
  selector: 'app-solution-graph',
  templateUrl: './solution-graph.component.html',
  styleUrls: ['./solution-graph.component.css']
})
export class SolutionGraphComponent implements AfterViewInit{
  @ViewChild('graphContainer', { static: true }) element!: ElementRef;
  
  private host: any;
  private htmlElement: any;
  private svg: any;

  private solution: SolutionSchemeJson | null;
  private dependencyFeatures: [DependencyCategoryEnum[], DependencyTypeEnum[], DependencyReasonEnum[], DependencyImportanceEnum[]];

  constructor(private _dashboardTraffic: DashboardTrafficService) {
    this.solution = null;
    this.dependencyFeatures = [this.getAllEnumCategories(), this.getAllEnumTypes(), this.getAllEnumReasons(), this.getAllEnumImportances()];
  }

  ngAfterViewInit(): void {
    this.htmlElement = this.element.nativeElement;
    this.host = d3.select(this.htmlElement);

    this._dashboardTraffic.solutionSubscriber$.subscribe(data => {
      this.solution = data as SolutionSchemeJson | null;

      this.updateView();
    });

    this._dashboardTraffic.dependenciesFilterSubscriber$.subscribe(data => {
      this.dependencyFeatures = data as [DependencyCategoryEnum[], DependencyTypeEnum[], DependencyReasonEnum[], DependencyImportanceEnum[]];

      this.updateView();
    })
  }

  private getAllEnumCategories(): DependencyCategoryEnum[] {
    return Object.keys(DependencyCategoryEnum).map(key => DependencyCategoryEnum[key as keyof typeof DependencyCategoryEnum]).filter(value => typeof value === 'number') as DependencyCategoryEnum[];
  }

  private getAllEnumTypes(): DependencyTypeEnum[] {
    return Object.keys(DependencyTypeEnum).map(key => DependencyTypeEnum[key as keyof typeof DependencyTypeEnum]).filter(value => typeof value === 'number') as DependencyTypeEnum[];
  }

  private getAllEnumReasons(): DependencyReasonEnum[] {
    return Object.keys(DependencyReasonEnum).map(key => DependencyReasonEnum[key as keyof typeof DependencyReasonEnum]).filter(value => typeof value === 'number') as DependencyReasonEnum[];
  }

  private getAllEnumImportances(): DependencyImportanceEnum[] {
    return Object.keys(DependencyImportanceEnum).map(key => DependencyImportanceEnum[key as keyof typeof DependencyImportanceEnum]).filter(value => typeof value === 'number') as DependencyImportanceEnum[];
  }

  private updateView(): void {
    if(this.solution === null) {
      this.createSolutionGraph([], []);
    }
    else {
      this.createSolutionGraph(...this.preprocessSolution(this.solution));
    }
  }

  private preprocessSolution(solution: SolutionSchemeJson): [any[], any[]] {
    var allDependencies: any[] = [];
    for(const group of solution["dependencies"]) {
      const dependencies = group["dependencies"];
      for(const dependency of dependencies) {
        const category: DependencyCategoryEnum = dependency["category"];
        const type: DependencyTypeEnum = dependency["type"];
        const reason: DependencyReasonEnum = dependency["reason"];
        const importance: DependencyImportanceEnum = dependency["importance"];

        if(this.dependencyFeatures[0].includes(category) && this.dependencyFeatures[1].includes(type) &&
           this.dependencyFeatures[2].includes(reason) && this.dependencyFeatures[3].includes(importance)) {
          
          allDependencies.push(dependency);
        }
      }
    }

    console.log(allDependencies)

    var nodes: any[] = [];
    var links: any[] = [];

    

    return [nodes, links];
  }

  private createSolutionGraph(nodes: any[], links: any[]) {



    const width = this.element.nativeElement.offsetWidth;
    const height = this.element.nativeElement.offsetHeight;

    const nodeRadius = Math.min(width, height) * Sizes.NODE_RADIUS_MULTIPLIER;

    this.svg = this.host.append("svg")
      .attr("viewBox", "0 0 " + width + " " + height)
      .append("g")
    
    
    
    const simulation = d3
      .forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d['id']).distance(100))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = this.svg
      .selectAll('.link')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'link');

    const node = this.svg
      .selectAll('.node')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .style("fill", function (d: any) { return Colors.PRIMARY; })
      .attr('r', 20)
      .on('click', (event: any, d: any) => {
        // Toggle highlight on click
        d3.select(event.target).classed('highlighted', (d: any) => !d3.select(event.target).classed('highlighted'));
        link.classed('highlighted', (l: any) => l.source === d || l.target === d);
      })
      .call(
        d3
          .drag()
          .on('start', (event: any, d: any) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event: any, d: any) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event: any, d: any) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );
    
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);
    });
  }

  private generateNode(radius: number): void {

  }
}