import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Dependency, EquationDependency, SolutionSchemeJson } from '../shared/SolutionSchemeJson';
import { DashboardTrafficService } from '../service/dashboard-traffic/dashboard-traffic.service';
import { Colors, NetworkSimulation } from './Config';
import { DependencyImportanceEnum } from '../shared/enums/DependencyImportanceEnum';
import { DependencyCategoryEnum } from '../shared/enums/DependencyCategoryEnum';
import { DependencyTypeEnum } from '../shared/enums/DependencyTypeEnum';
import { DependencyReasonEnum } from '../shared/enums/DependencyReasonEnum';

declare const d3: any;

interface NodeStructure {
  id: number,
  title: string,
  reasons: string[]
}

interface LinkStructure {
  id: number,
  source: number,
  target: number,
}

@Component({
  selector: 'app-solution-graph',
  templateUrl: './solution-graph.component.html',
  styleUrls: ['./solution-graph.component.css']
})
export class SolutionGraphComponent implements AfterViewInit{
  @ViewChild('graphContainer', { static: true }) element!: ElementRef;
  
  private host: any;
  private htmlElement: any;
  private svg: any = null;

  private static solution: SolutionSchemeJson | null;
  private static dependencyFeatures: [DependencyCategoryEnum[], DependencyTypeEnum[], DependencyReasonEnum[], DependencyImportanceEnum[]];
  private static initialized: boolean = false;

  constructor(private _dashboardTraffic: DashboardTrafficService) {
    if(!SolutionGraphComponent.initialized) {
      SolutionGraphComponent.solution = null;
      SolutionGraphComponent.dependencyFeatures = [this.getAllEnumCategories(), this.getAllEnumTypes(), this.getAllEnumReasons(), this.getAllEnumImportances()];
      SolutionGraphComponent.initialized = true;
    }
  }

  ngAfterViewInit(): void {
    this.htmlElement = this.element.nativeElement;
    this.host = d3.select(this.htmlElement);

    this._dashboardTraffic.solutionSubscriber$.subscribe(data => {
      SolutionGraphComponent.solution = data as SolutionSchemeJson | null;

      this.updateView();
    });

    this._dashboardTraffic.dependenciesFilterSubscriber$.subscribe(data => {
      SolutionGraphComponent.dependencyFeatures = data as [DependencyCategoryEnum[], DependencyTypeEnum[], DependencyReasonEnum[], DependencyImportanceEnum[]];

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
    if(SolutionGraphComponent.solution === null) {
      this.createSolutionGraph([], []);
    }
    else {
      this.createSolutionGraph(...this.preprocessSolution(SolutionGraphComponent.solution));
    }
  }

  private arraysIntersection<ArrayType>(arr1: ArrayType[], arr2: ArrayType[]): ArrayType[] {
    var result: ArrayType[] = [];
    for(const el1 of arr1) {
      for(const el2 of arr2) {
        if(el1 == el2) { result.push(el1); }
      }
    }

    return result;
  }

  private dependencyName(dependecy: Dependency): string {
    switch(dependecy.type) {
      case DependencyTypeEnum.SEGMENT_LENGTH:
         const segmentLength = dependecy as EquationDependency;
         return segmentLength.object1.value + " = " + segmentLength.object2.value;
      case DependencyTypeEnum.ANGLE_MEASURE:
        const angleMeasure = dependecy as EquationDependency;
        return angleMeasure.object1.value + " = " + angleMeasure.object2.value;
      case DependencyTypeEnum.EQUATION:
        const equation = dependecy as EquationDependency;
        return equation.object1.value + " = " + equation.object2.value;
      default:
        return "Default";
      //case DependencyTypeEnum.POLYGON_TYPE:
      //case DependencyTypeEnum.POLYGON_PERIMETER:
      //case DependencyTypeEnum.POLYGON_AREA:
      //case DependencyTypeEnum.EQUAL_SEGMENTS:
      //case DependencyTypeEnum.EQUAL_ANGLES:
      //case DependencyTypeEnum.PERPENDICULAR_LINES:
      //case DependencyTypeEnum.PARALLEL_LINES:
      //case DependencyTypeEnum.TANGENT_LINE_TO_CIRCLE:
      //case DependencyTypeEnum.TANGENT_CIRCLE_TO_CIRCLE:
      //case DependencyTypeEnum.BISECTOR_LINE:
      //case DependencyTypeEnum.MID_PERPENDICULAR_LINE:
      //case DependencyTypeEnum.INSCRIBED_CIRCLE:
      //case DependencyTypeEnum.CIRCUMSCRIBED_CIRCLE:
      //case DependencyTypeEnum.ESCRIBED_CIRCLE:
      //case DependencyTypeEnum.MEDIAN:
      //case DependencyTypeEnum.ALTITUDE:
      //case DependencyTypeEnum.MID_SEGMENT:
      //case DependencyTypeEnum.SIMILAR_TRIANGLES:
      //case DependencyTypeEnum.CONGRUENT_TRIANGLES:
    }
  }

  private preprocessSolution(solution: SolutionSchemeJson): [NodeStructure[], LinkStructure[]] {
    if(solution.dependencies === null) { return [[], []]; }

    var dependentDependenciesSet = new Set<number>();
    for(const dependency of solution.dependencies) {
      dependency.dependentDependencies.forEach((dd: number[]) => dd.forEach((id: number) => dependentDependenciesSet.add(id)));
    }

    var filteredDependencies: Dependency[] = [];
    for(const dependency of solution.dependencies) {
      const category: DependencyCategoryEnum = dependency.category;
      const type: DependencyTypeEnum = dependency.type;
      const reasons: DependencyReasonEnum[] = dependency.reasons;
      const importances: DependencyImportanceEnum[] = dependency.importances;

      if(dependentDependenciesSet.has(dependency.id)) {
        filteredDependencies.push(dependency)
      }
      else if(SolutionGraphComponent.dependencyFeatures[0].includes(category) && SolutionGraphComponent.dependencyFeatures[1].includes(type) &&
        this.arraysIntersection<DependencyReasonEnum>(SolutionGraphComponent.dependencyFeatures[2], reasons).length > 0 &&
        this.arraysIntersection<DependencyImportanceEnum>(SolutionGraphComponent.dependencyFeatures[3], importances).length > 0) {
          filteredDependencies.push(dependency);
      }
    }
    
    var nodes: NodeStructure[] = [];
    var links: LinkStructure[] = [];

    for(const dependecy of filteredDependencies) {
      nodes.push({
        id: dependecy.id, 
        title: this.dependencyName(dependecy), 
        reasons: ["Reason 1", "Reason 2", "Reason 3"],
      });
    }

    links.push({
      id: 0,
      source: 0,
      target: 1,
    });

    links.push({
      id: 1,
      source: 2,
      target: 3,
    });

    links.push({
      id: 2,
      source: 0,
      target: 3,
    });

    return [nodes, links];
  }

  private createSolutionGraph(nodes: NodeStructure[], links: LinkStructure[]) {
    const width = this.element.nativeElement.offsetWidth;
    const height = this.element.nativeElement.offsetHeight;

    const nodeRadius = Math.min(width, height) * NetworkSimulation.NODE_RADIUS_MULTIPLIER;
    const nodesDistance = Math.min(width, height) * NetworkSimulation.NODES_DISTANCE_MULTIPLIER;

    if(this.svg === null) {
      var svgContainer = this.host.append("svg")
        .attr("width", width)
        .attr("height", height);

      this.svg = svgContainer.append("g")
        .attr("width", width)
        .attr("height", height)
        
      svgContainer.call(d3.zoom().on('zoom', (e: any) => { this.svg.attr('transform', e.transform); }));
    }
    else {
      this.svg.selectAll("*").remove();
    }
   
    const simulation = d3
      .forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d['id']).distance(nodesDistance))
      .force('charge', d3.forceManyBody().strength(NetworkSimulation.CHARGE_STRENGTH))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = this.svg.selectAll("link")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", Colors.PRIMARY)
      .attr("stroke-width", NetworkSimulation.LINK_WIDTH + "px");

    const nodeGroups = this.svg.selectAll("g")
      .data(nodes, (d: any) => d.id);

    const nodeGroup = nodeGroups.enter()
      .append("g")
      .attr("transform", (d: any) => `translate(${d.x}, ${d.y})`)
      .call(
        d3.drag()
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
      )
      .on("mouseover", (event: any) => d3.select(event.currentTarget).select("circle").style("fill", Colors.SECONDARY))
      .on("mouseout", (event: any) => d3.select(event.currentTarget).select("circle").style("fill", Colors.TERTIARY));

    nodeGroup.append("circle")
      .attr("r", nodeRadius)
      .style("fill", Colors.TERTIARY);

    nodeGroup.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("dy", "0.3em")
      .style("text-anchor", "middle")
      .text((d: any) => d.title); 

    simulation.on("tick", function(e: any) {     
      nodeGroup
          .attr("transform", (d: any) => `translate(${d.x},${d.y})`);

      link
        .attr("x1", function(d: any) { return d.source.x; })
        .attr("y1", function(d: any) { return d.source.y; })
        .attr("x2", function(d: any) { return d.target.x; })
        .attr("y2", function(d: any) { return d.target.y; });
      });
  }
}