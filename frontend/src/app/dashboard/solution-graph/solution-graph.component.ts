import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { AnglesDependency, CirclePolygonDependency, CirclesDependency, Dependency, EquationDependency, LineAngleDependency, LineCircleDependency, LinePointsPairDependency, LinesDependency, PointsPairsDependency, PolygonExpressionDependency, PolygonPointsPairDependency, PolygonTypeDependency, PolygonsDependency, SolutionSchemeJson } from '../shared/SolutionSchemeJson';
import { DashboardTrafficService } from '../service/dashboard-traffic/dashboard-traffic.service';
import { Colors, NetworkSimulation } from './Config';
import { DependencyImportanceEnum } from '../shared/enums/DependencyImportanceEnum';
import { DependencyCategoryEnum } from '../shared/enums/DependencyCategoryEnum';
import { DependencyTypeEnum } from '../shared/enums/DependencyTypeEnum';
import { DependencyReasonEnum } from '../shared/enums/DependencyReasonEnum';
import { PolygonTypeEnum } from '../shared/enums/PolygonTypeEnum';
import { AngleTypeEnum } from '../shared/enums/AngleTypeEnum';

declare const d3: any;

interface NodeStructure {
  id: string,
  title: string,
}

interface LinkStructure {
  id: string,
  source: string,
  target: string,
  label: string
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

  private getPointName(pointId: string): string {
    return SolutionGraphComponent.solution!.points.filter((point) => point.id === pointId)[0].name;
  }

  private getSegmentName(end1Id: string, end2Id: string): string {
    return this.getPointName(end1Id) + this.getPointName(end2Id);
  }

  private getAngleName(point1Id: string, vertexId: string, point2Id: string, angleType: AngleTypeEnum): string {
    switch(angleType) {
      case AngleTypeEnum.UNKNOWN: return this.getPointName(point1Id) + this.getPointName(vertexId) + this.getPointName(point2Id);
      case AngleTypeEnum.CONVEX: return ">" + this.getPointName(point1Id) + this.getPointName(vertexId) + this.getPointName(point2Id);
      case AngleTypeEnum.CONCAVE: return "<" + this.getPointName(point1Id) + this.getPointName(vertexId) + this.getPointName(point2Id);
    }
  }

  private getLineName(lineId: string): string {
    const pointOnLine = SolutionGraphComponent.solution!.lines.filter((line) => line.id === lineId)[0].pointsOn;
    return "line" + this.getPointName(pointOnLine[0]) + this.getPointName(pointOnLine[pointOnLine.length - 1]);
  }

  private getCircleName(circleId: string): string {
    const circleCenter = SolutionGraphComponent.solution!.cicles.filter((circle) => circle.id === circleId)[0].centerId;
    const pointsOnCircle = SolutionGraphComponent.solution!.cicles.filter((circle) => circle.id === circleId)[0].pointsOn;
    return "O(" + this.getPointName(circleCenter) + "," + this.getPointName(pointsOnCircle[0]) + ")";
  }

  private getPolygonName(polygonVerticesIds: string[]): string {
    var name = "";
    for(const vertexId of polygonVerticesIds) { name = name + this.getPointName(vertexId); }
    return name;
  } 

  private getPolygonTypeName(polygonType: PolygonTypeEnum): string {
    switch(polygonType) {
      case PolygonTypeEnum.UNKNOWN: return "unknown";
      case PolygonTypeEnum.ISOSCELES_ACUTE_TRIANGLE: return "isosceles acute triangle";
      case PolygonTypeEnum.EQUILATERAL_TRIANGLE: return "equilateral triangle";
      case PolygonTypeEnum.SCALENE_RIGHT_TRIANGLE: return "scalene right triangles";
      case PolygonTypeEnum.ISOSCELES_RIGHT_TRIANGLE: return "isosceles right triangle";
      case PolygonTypeEnum.OBTUSE_ISOSCELES_TRIANGLE: return "obtuse isosceles triangle";
      case PolygonTypeEnum.SQUARE: return "square";
      case PolygonTypeEnum.RECTANGLE: return "rectangle";
      case PolygonTypeEnum.REGULAR_POLYGON: return "regular polygon";
      case PolygonTypeEnum.PARALLELOGRAM: return "parallelogram";
      case PolygonTypeEnum.KITE: return "kite";
      case PolygonTypeEnum.RHOMBUS: return "rhombus";
      case PolygonTypeEnum.SCALENE_TRAPEZOID: return "scalene trapezoid";
      case PolygonTypeEnum.ISOSCELES_TRAPEZOID: return "isosceles trapezoid";
      case PolygonTypeEnum.RIGHT_TRAPEZOID: return "right trapezoid";
    }
  }

  private getDependencyName(dependecy: Dependency): string {
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
      case DependencyTypeEnum.POLYGON_TYPE:
        const polygonType = dependecy as PolygonTypeDependency;
        return this.getPolygonName(polygonType.object1.verticesIds) + " is " + this.getPolygonTypeName(polygonType.object2);  
      case DependencyTypeEnum.POLYGON_PERIMETER:
        const polygonPerimeter = dependecy as PolygonExpressionDependency;
        return "P(" + this.getPolygonName(polygonPerimeter.object1.verticesIds) + ")" + polygonPerimeter.object2;
      case DependencyTypeEnum.POLYGON_AREA:
        const polygonArea = dependecy as PolygonExpressionDependency;
        return "P(" + this.getPolygonName(polygonArea.object1.verticesIds) + ")" + polygonArea.object2;
      case DependencyTypeEnum.EQUAL_SEGMENTS:
        const equalSegments = dependecy as PointsPairsDependency;
        return "|" + this.getSegmentName(equalSegments.object1.end1Id, equalSegments.object2.end2Id) + "| = " +
          this.getSegmentName(equalSegments.object2.end1Id, equalSegments.object2.end2Id);
      case DependencyTypeEnum.EQUAL_ANGLES:
        const equalAngles = dependecy as AnglesDependency;
        return "|" + this.getAngleName(equalAngles.object1.point1Id, equalAngles.object1.vertexId, equalAngles.object1.point2Id, equalAngles.object1.type) +
          "| = |" + this.getAngleName(equalAngles.object2.point1Id, equalAngles.object2.vertexId, equalAngles.object2.point2Id, equalAngles.object2.type) + "|";
      case DependencyTypeEnum.PERPENDICULAR_LINES:
        const perpendicularLines = dependecy as LinesDependency;
        return this.getLineName(perpendicularLines.object1.id) + " and " + this.getLineName(perpendicularLines.object2.id) + " are perpendicular";
      case DependencyTypeEnum.PARALLEL_LINES:
        const parallelLines = dependecy as LinesDependency;
        return this.getLineName(parallelLines.object1.id) + " and " + this.getLineName(parallelLines.object2.id) + " are parallel";
      case DependencyTypeEnum.TANGENT_LINE_TO_CIRCLE:
        const tangentLineToCircle = dependecy as LineCircleDependency;
        return this.getLineName(tangentLineToCircle.object1.id) + " is tangent to " + this.getCircleName(tangentLineToCircle.object2.id); 
      case DependencyTypeEnum.TANGENT_CIRCLE_TO_CIRCLE:
        const tangentCircles = dependecy as CirclesDependency;
        return this.getCircleName(tangentCircles.object1.id) + " and " + this.getCircleName(tangentCircles.object2.id) + " are tangent";
      case DependencyTypeEnum.BISECTOR_LINE:
        const bisectorLine = dependecy as LineAngleDependency;
        return this.getLineName(bisectorLine.object1.id) + " is bisector of " + this.getAngleName(bisectorLine.object2.point1Id, bisectorLine.object2.vertexId, bisectorLine.object2.point2Id, bisectorLine.object2.type);
      case DependencyTypeEnum.MID_PERPENDICULAR_LINE:
        const midPerpendicular = dependecy as LinePointsPairDependency;
        return this.getLineName(midPerpendicular.object1.id) + " is perpendicular of " + this.getSegmentName(midPerpendicular.object2.end1Id, midPerpendicular.object2.end2Id);
      case DependencyTypeEnum.INSCRIBED_CIRCLE:
        const inscribedCircle = dependecy as CirclePolygonDependency;
        return this.getCircleName(inscribedCircle.object1.id) + " is inscribed in " + this.getPolygonName(inscribedCircle.object2.verticesIds);
      case DependencyTypeEnum.CIRCUMSCRIBED_CIRCLE:
        const circumscribedCircle = dependecy as CirclePolygonDependency;
        return this.getCircleName(circumscribedCircle.object1.id) + " is circumscribed on " + this.getPolygonName(circumscribedCircle.object2.verticesIds);
      case DependencyTypeEnum.ESCRIBED_CIRCLE:
        const escribedCircle = dependecy as CirclePolygonDependency;
        return this.getCircleName(escribedCircle.object1.id) + " is escribed to " + this.getPolygonName(escribedCircle.object2.verticesIds);
      case DependencyTypeEnum.MEDIAN:
        const median = dependecy as PolygonPointsPairDependency;
        return this.getSegmentName(median.object2.end1Id, median.object2.end2Id) + " is median in " + this.getPolygonName(median.object1.verticesIds);
      case DependencyTypeEnum.ALTITUDE:
        const altitude = dependecy as PolygonPointsPairDependency;
        return this.getSegmentName(altitude.object2.end1Id, altitude.object2.end2Id) + " is altitude in " + this.getPolygonName(altitude.object1.verticesIds);
      case DependencyTypeEnum.MID_SEGMENT:
        const midSegment = dependecy as PolygonPointsPairDependency;
        return this.getSegmentName(midSegment.object2.end1Id, midSegment.object2.end2Id) + " is mid-segment in " + this.getPolygonName(midSegment.object1.verticesIds);
      case DependencyTypeEnum.SIMILAR_TRIANGLES:
        const similarTriangles = dependecy as PolygonsDependency;
        return this.getPolygonName(similarTriangles.object1.verticesIds) + " is similar to " + this.getPolygonName(similarTriangles.object2.verticesIds);
      case DependencyTypeEnum.CONGRUENT_TRIANGLES:
        const congruentTriangles = dependecy as PolygonsDependency;
        return this.getPolygonName(congruentTriangles.object1.verticesIds) + " is congruent to " + this.getPolygonName(congruentTriangles.object2.verticesIds);
    }
  }

  private getReasonName(reason: DependencyReasonEnum): string {
    switch(reason) {
      case DependencyReasonEnum.NONE: return "";
      case DependencyReasonEnum.USER_DEFINED: return "user defined";
      case DependencyReasonEnum.DIVIDED_SEGMENT: return "divided segment property";
      case DependencyReasonEnum.MID_PERPENDICULAR: return "mid perpendicular property";
      case DependencyReasonEnum.TANGENT_TO_CIRCLE: return "tangent line to circle property";
      case DependencyReasonEnum.TANGENT_TO_LINE: return "tangent circle to line propery";
      case DependencyReasonEnum.ALTITUDE: return "altitude property";
      case DependencyReasonEnum.MEDIAN: return "median property";
      case DependencyReasonEnum.MID_SEGMENT: return "mid segment property";
      case DependencyReasonEnum.BISECTOR: return "bisector property";
      case DependencyReasonEnum.INSCRIBED_CIRCLE: return "inscribed circle property";
      case DependencyReasonEnum.CIRCUMSCRIBED_CIRCLE: return "circumscribed circle property";
      case DependencyReasonEnum.ESCRIBED_CIRCLE: return "escribed circle property";
      case DependencyReasonEnum.SQUARE: return "square property";
      case DependencyReasonEnum.SQUARE_DIAGONAL: return "square diagonal property";
      case DependencyReasonEnum.RECTANGLE: return "rectangle property";
      case DependencyReasonEnum.RECTANGLE_DIAGONAL: return "rectangle diagonal property";
      case DependencyReasonEnum.REGULAR_POLYGON: return "regular polygon property";
      case DependencyReasonEnum.PARALLELOGRAM: return "parallelogram property";
      case DependencyReasonEnum.PARALLELOGRAM_DIAGONAL: return "parallelogram diagnonal property";
      case DependencyReasonEnum.KITE: return "kite property";
      case DependencyReasonEnum.KITE_DIAGONAL: return "kite diagonal property";
      case DependencyReasonEnum.RHOMBUS: return "rhombus property";
      case DependencyReasonEnum.RHOMBUS_DIAGONAL: return "rhombus diagonal property";
      case DependencyReasonEnum.ISOSCELES_ACUTE_TRIANGLE: return "isosceles acute triangle property";
      case DependencyReasonEnum.EQUILATERAL_TRIANGLE: return "equilateral triangle property";
      case DependencyReasonEnum.SCALENE_RIGHT_TRIANGLE: return "scalene right triangle property";
      case DependencyReasonEnum.ISOSCELES_RIGHT_TRIANGLE: return "isosceles right triangle property";
      case DependencyReasonEnum.OBTUSE_ISOSCELES_TRIANGLE: return "obtuse isosceles triangle property";
      case DependencyReasonEnum.SCALENE_TRAPEZOID: return "scalene trapezoid property";
      case DependencyReasonEnum.ISOSCELES_TRAPEZOID: return "isosceles trapezoid property";
      case DependencyReasonEnum.ISOSCELES_TRAPEZOID_DIAGONAL: return "isosceles trapezoid diagonal property";
      case DependencyReasonEnum.RIGHT_TRAPEZOID: return "right trapezoid property";
      case DependencyReasonEnum.POINTS_ARE_THE_SAME: return "points are the same";
      case DependencyReasonEnum.ARMS_ARE_THE_SAME: return "arms are the same";
      case DependencyReasonEnum.VERTICAL_ANGLES: return "vertical angles property";
      case DependencyReasonEnum.SUPPLEMENTARY_ANGLES: return "supplementary angles property";
      case DependencyReasonEnum.ALTERNATE_ANGLES: return "alternate angles property";
      case DependencyReasonEnum.CORRESPONDING_ANGLES: return "corresponsing angles property";
      case DependencyReasonEnum.PERPENDICULAR_LINES: return "perpendicular lines";
      case DependencyReasonEnum.PARALLEL_LINES: return "parallel lines";
      case DependencyReasonEnum.PARALLELISM_TRANSITIVITY: return "parallelism transitivity";
      case DependencyReasonEnum.PERPENDICULARITY_COMPOSITION: return "perpendicularity composition";
      case DependencyReasonEnum.PERPENDICULARITY_AND_PARALLELISM_COMPOSITION: return "perpendicularity and parallelism composition";
      case DependencyReasonEnum.RIGHT_ANGLE: return "right angle property";
      case DependencyReasonEnum.SUM_OF_ANGLES_IN_TRIANGLE: return "sum of angles in triangle";
      case DependencyReasonEnum.SIMILAR_TRIANGLES: return "similar triangles property";
      case DependencyReasonEnum.SIDE_SIDE_SIDE: return "SSS";
      case DependencyReasonEnum.ANGLE_ANGLE_ANGLE: return "AAA";
      case DependencyReasonEnum.CONGRUENT_TRIANGLES: return "congruent triangles";
      case DependencyReasonEnum.SIDE_ANGLE_SIDE: return "SAS";
      case DependencyReasonEnum.ANGLE_SIDE_ANGLE: return "ASA";
      case DependencyReasonEnum.FUNDAMENTAL_THEORY_OF_GEOMETRY: return "fundamental theory of geometry";
      case DependencyReasonEnum.LINE_TANGENT_TO_CIRCLE: return "line tangent to circle";
      case DependencyReasonEnum.EQUATION_EXTRACTION: return "algebraic calculations";
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
        id: `node${dependecy.id}`, 
        title: this.getDependencyName(dependecy), 
      });

      for(let index = 0; index < dependecy.dependentDependencies.length; index++) {
        const dependentDependencyArr = dependecy.dependentDependencies[index];
        const reason = dependecy.reasons[index];

        for(const dependentDependencyIndex of dependentDependencyArr) {
          links.push({
            id: `link${dependecy.id}@${dependentDependencyIndex}`,
            source: `node${dependecy.id}`,
            target: `node${dependentDependencyIndex}`,
            label: this.getReasonName(reason)
          })
        }
      }
    }

    return [nodes, links];
  }

  private createSolutionGraph(nodes: NodeStructure[], links: LinkStructure[]) {
    const width = this.element.nativeElement.offsetWidth;
    const height = this.element.nativeElement.offsetHeight;

    const nodeLabelFontSize = Math.min(width, height) * NetworkSimulation.NODE_LABEL_FONT_SIZE_MULTIPLIER;
    const linkLabelFontSize = Math.min(width, height) * NetworkSimulation.LINK_LABEL_FONT_SIZE_MULTIPLIER;
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

    const linkLine = this.svg.selectAll(".link-line")
      .data(links)
      .enter()
      .append("line")
      .attr('class', 'link-line')
      .attr('id', (d:any) => d.id)
      .attr("stroke", Colors.TERTIARY)
      .attr("stroke-width", NetworkSimulation.LINK_WIDTH + "px")

    const linkLabel = this.svg.selectAll(".link-label")
      .data(links)
      .enter()
      .append("text")
      .attr('class', 'link-label')
      .attr("dy", ".3em")
      .attr("x", function(d: any) { return (d.source.x + d.target.x)/2; })
      .attr("y", function(d: any) { return (d.source.y + d.target.y)/2; })
      .text(function(d: any) { return d.label; })
      .attr("text-anchor", "middle")
      .style("font-size", linkLabelFontSize + "px")
      .style("fill", Colors.PRIMARY);

    const nodeLabel = this.svg.selectAll(".node-label")
      .data(nodes)
      .enter()
      .append("text")
      .attr('class', 'node-label')
      .attr("dy", "0.3em")
      .attr("x", (d: any) => d.x)
      .attr("y", (d: any) => d.y)
      .text((d: any) => d.title)
      .attr("text-anchor", "middle")
      .style("font-size", nodeLabelFontSize + "px")
      .style("fill", Colors.PRIMARY)
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
      .on("mouseover", (event: any) => d3.select(event.currentTarget).style("fill", Colors.SECONDARY))
      .on("mouseout", (event: any) => d3.select(event.currentTarget).style("fill", Colors.PRIMARY));

    simulation.on("tick", function(e: any) {     
      nodeLabel
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);

      linkLine
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      linkLabel
      .attr("x", function(d: any) { return (d.source.x + d.target.x)/2; })
      .attr("y", function(d: any) { return (d.source.y + d.target.y)/2; });
    });
  }
}