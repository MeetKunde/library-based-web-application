import { BoardSchemeJson, CircleJson, LineJson, PointJson } from "./BoardSchemeJson";
import { PolygonType } from "./PolygonType";

type PointType = {obj: any, isActive: boolean, inactiveReason: string};
type LineType = {obj: any, pointsOn: Set<string>};
type CircleType = {obj: any, center: string, pointsOn: Set<string>};
type LineCircleType = {obj: any, pointsOn: Set<string>};

export class BoardScheme {
    private points: string[];           // id
    private gliders: string[];          // id
    private intersections: string[];    // id
    private segments: string[];         // id
    private rays: string[];             // id
    private lines: string[];            // id
    private circles: string[];          // id
    private shapes: { [key: string]: PointType | LineType | CircleType };           // id: object descriptor

    private perpendicularLines: [string, string][];                                 // [line 1 id, line 2 id]
    private parallelLines: [string, string][];                                      // [line 1 id, line 2 id]
    private equalSegments: [string, string, string, string][];                      // [segment 1 end 1 id, segment 1 end 2 id, segment 2 end 1 id, segment 2 end 2 id]
    private equalAngles: [string, string, string, string, string, string,][];       // [angle 1 end 1 id, angle 1 vertex id, angle 1 end 2 id, angle 2 end 1 id, angle 2 vertex id, angle 2 end 2 id]
    private midPerpendiculars: [string, string, string][];                          // [segment end 1 id, segment end 2 id, line id]
    private bisectors: [string, string, string, string][];                          // [angle end 1 id, angle vertex id, angle end 2 id, line id]
    private tangentLines: [string, string][];                                       // [circle id, line id]
    private tangentCircles: [string, string][];                                     // [circle 1 id, circle 2 id]
    private circumscribedCircles: [string, string[]][];                             // [circle id, array of polygon vertices ids]
    private inscribedCircles: [string, string[]][];                                 // [circle id, array of polygon vertices ids]
    private escribedCircles: [string, string, string, string][];                    // [circle id, triangle vertex 1 id, triangle vertex 2 id, triangle vertex 3 id]
    private polygonTypes: [string[], PolygonType][];                                // [array of polygon vertices ids, polygon type enum]
    private medians: [string, string, string, string, string][];                    // [triangle top vertex id, triangle base end 1 id, triangle base end 2 id, median end 1 id, median end 2 id]
    private altitudes: [string, string, string, string, string][];                  // [triangle top vertex id, triangle base end 1 id, triangle base end 2 id, altitude end 1 id, altitude end 2 id]
    private midSegments: [string, string, string, string, string, string][];        // [side 1 end 1 id, side1 end 2 id, side 2 end 1 id, side 2 end 2 id, midSegment end 1 id, midSegment end 2 id]
    
    private segmentLengths: [string, string, string][];                             // [segment end 1 id, segment end 2 id, string of formula]
    private angleMeasures: [string, string, string, boolean, string][];             // [angle end 1 id, angle vertex id, angle end 2 id, angle is convex, string of formula]
    private formulas: string[];                                                     // string of formula

    constructor() {
        this.points = [];
        this.gliders = [];
        this.intersections = [];
        this.segments = [];
        this.rays = [];
        this.lines = [];
        this.circles = [];
        this.shapes = {};

        this.perpendicularLines = [];
        this.parallelLines = [];
        this.equalSegments = [];
        this.equalAngles = [];
        this.midPerpendiculars = [];
        this.bisectors = [];
        this.tangentLines = [];
        this.tangentCircles = [];
        this.circumscribedCircles = [];
        this.inscribedCircles = [];
        this.escribedCircles = [];
        this.polygonTypes = [];
        this.medians = [];
        this.altitudes = [];
        this.midSegments = [];
        
        this.segmentLengths = [];
        this.angleMeasures = [];
        this.formulas = [];
    }

    addPoint(pointObject: any): void {
        this.points.push(pointObject.id);
        this.shapes[pointObject.id] = { obj: pointObject, isActive: true, inactiveReason: '' };
    }

    addGlider(gliderObject: any, baseShapeObject: any): void {
        this.gliders.push(gliderObject.id);
        this.shapes[gliderObject.id] = { obj: gliderObject, isActive: true, inactiveReason: '' };
        (this.shapes[baseShapeObject.id] as LineCircleType).pointsOn.add(gliderObject.id);
    }

    addIntersection(intersectionObject: any, baseShape1Object: any, baseShape2Object: any): void {
        this.intersections.push(intersectionObject.id);
        this.shapes[intersectionObject.id] = { obj: intersectionObject, isActive: false, inactiveReason: '' };
        (this.shapes[baseShape1Object.id] as LineCircleType).pointsOn.add(intersectionObject.id);
        (this.shapes[baseShape2Object.id] as LineCircleType).pointsOn.add(intersectionObject.id);
    }

    setIntersectionState(intersection: any, isActive: boolean, inactiveReasons: any[]): void {
        const combinedIsActive = isActive && (this.shapes[intersection.id] as PointType).obj.isReal;
        (this.shapes[intersection.id] as PointType).isActive = combinedIsActive;
        if(combinedIsActive) { (this.shapes[intersection.id] as PointType).inactiveReason = ''; }
        else { (this.shapes[intersection.id] as PointType).inactiveReason = this.chooseInactiveReason(inactiveReasons); }
    }

    chooseInactiveReason(inactiveReasons: any[]): string {
        if(inactiveReasons.length == 0) { return ''; }

        for(const point of inactiveReasons) {
            if(this.gliders.includes(point.id)) { return point.id; }
        }

        return inactiveReasons[0].id;
    }

    addSegment(segmentObject: any): void {
        this.segments.push(segmentObject.id);
        this.shapes[segmentObject.id] = { obj: segmentObject, pointsOn: new Set() };
        (this.shapes[segmentObject.id] as LineType).pointsOn.add(segmentObject.inherits[0].id);
        (this.shapes[segmentObject.id] as LineType).pointsOn.add(segmentObject.inherits[1].id);
    }

    addRay(rayObject: any): void {
        this.rays.push(rayObject.id);
        this.shapes[rayObject.id] = { obj: rayObject, pointsOn: new Set() };
        (this.shapes[rayObject.id] as LineType).pointsOn.add(rayObject.inherits[0].id);
        (this.shapes[rayObject.id] as LineType).pointsOn.add(rayObject.inherits[1].id);
    }

    addLine(lineObject: any): void {
        this.lines.push(lineObject.id);
        this.shapes[lineObject.id] = { obj: lineObject, pointsOn: new Set() };
        (this.shapes[lineObject.id] as LineType).pointsOn.add(lineObject.inherits[0].id);
        (this.shapes[lineObject.id] as LineType).pointsOn.add(lineObject.inherits[1].id);
    }

    addLineBasedOnOnePoint(lineObject: any, basePointObject: any): void {
        this.lines.push(lineObject.id);
        this.shapes[lineObject.id] = { obj: lineObject, pointsOn: new Set() };
        (this.shapes[lineObject.id] as LineType).pointsOn.add(basePointObject.id);
    }

    addCircle(circleObject: any): void {
        this.circles.push(circleObject.id);
        this.shapes[circleObject.id] = { obj: circleObject, center: circleObject.inherits[0].id, pointsOn: new Set() };
        (this.shapes[circleObject.id] as CircleType).pointsOn.add(circleObject.inherits[1].id);
    }

    addPerpendicularity(lineObject: any, baseLineObject: any, basePointObject: any): void {
        this.perpendicularLines.push([lineObject.id, baseLineObject.id]);
    }

    addParallelism(lineObject: any, baseLineObject: any, basePointObject: any): void {
        this.parallelLines.push([lineObject.id, baseLineObject.id]);
    }

    addEqualSegments(segment1End1Object: any, segment1End2Object: any, segment2End1Object: any, segment2End2Object: any): void {
        this.equalSegments.push([segment1End1Object.id, segment1End2Object.id, segment2End1Object.id, segment2End2Object.id]);
    }

    addEqualAngles(angle1End1Object: any, angle1VertexObject: any, angle1End2Object: any, angle2End1Object: any, angle2VertexObject: any, angle2End2Object: any): void {
        this.equalAngles.push([angle1End1Object.id, angle1VertexObject.id, angle1End2Object.id, angle2End1Object.id, angle2VertexObject.id, angle2End2Object.id]);
    }

    addMidPerpendicular(segmentEnd1Object: any, segmentEnd2Object: any, lineObject: any): void {
        this.midPerpendiculars.push([segmentEnd1Object.id, segmentEnd2Object.id, lineObject.id]);
    }

    addBisector(angleEnd1Object: any, angleVertexObject:any, angleEnd2Object: any, lineObject: any): void {
        this.bisectors.push([angleEnd1Object.id, angleVertexObject.id, angleEnd2Object.id, lineObject.id]);
    }

    addTangentLine(circleObject: any, lineObject: any): void {
        this.tangentLines.push([circleObject.id, lineObject.id]);
    }

    addTangentCircle(circle1Object: any, circle2Object: any): void {
        this.tangentCircles.push([circle1Object.id, circle2Object.id]);
    }

    addCircumscribedCircle(circleObject: any, polygonVerticesObjects: any[]): void {
        this.circumscribedCircles.push([circleObject.id, polygonVerticesObjects.map((vertex) => vertex.id)]);
    }

    addInscribedCircle(circleObject: any, polygonVerticesObjects: any[]): void {
        this.inscribedCircles.push([circleObject.id, polygonVerticesObjects.map((vertex) => vertex.id)]);
    }

    addEscribedCircle(circleObject: any, polygonVerticesObjects: any[]): void {
        this.escribedCircles.push([circleObject.id, polygonVerticesObjects[0].id, polygonVerticesObjects[1].id, polygonVerticesObjects[2].id])
    }

    addPolygonType(polygonVerticesObjects: any[], polygonType: PolygonType): void {
        this.polygonTypes.push([polygonVerticesObjects.map((vertex) => vertex.id), polygonType]);
    }

    addMedian(topVertexObject: any, baseVertex1Object: any, baseVertex2Object: any, medianEnd1Object: any, medianEnd2Object: any): void {
        this.medians.push([topVertexObject.id, baseVertex1Object.id, baseVertex2Object.id, medianEnd1Object.id, medianEnd2Object.id]);
    }

    addAltitude(topVertexObject: any, baseVertex1Object: any, baseVertex2Object: any, altitudeEnd1Object: any, altitudeEnd2Object: any): void {
        this.altitudes.push([topVertexObject.id, baseVertex1Object.id, baseVertex2Object.id, altitudeEnd1Object.id, altitudeEnd2Object.id]);
    }

    addMidSegment(side1End1Object: any, side1End2Object: any, side2End1Object: any, side2End2Object: any, segmentEnd1Object: any, segmentEnd2Object: any): void {
        this.midSegments.push([side1End1Object.id, side1End2Object.id, side2End1Object.id, side2End2Object.id, segmentEnd1Object.id, segmentEnd2Object.id]);
    }

    setSegmentLength(segmentEnd1Object: any, segmentEnd2Object: any, formula: string): void {
        this.segmentLengths.push([segmentEnd1Object.id, segmentEnd2Object.id, formula]);
    }

    setAngleMeasure(angleEnd1Object: any, angleVertexObject: any, angleEnd2Object: any, angleIsConvex: boolean, formula: string): void {
        this.angleMeasures.push([angleEnd1Object.id, angleVertexObject.id, angleEnd2Object.id, angleIsConvex, formula]);
    }

    addFormula(formula: string): void {
        this.formulas.push(formula);
    }

    addPointToShape(shape: any, point: any): void {
        (this.shapes[shape.id] as LineCircleType).pointsOn.add(point.id);
    }

    getSegementByPoints(point1Id: string, point2Id: string): [boolean, string] {
        for(const lineId of this.segments) {
            const line = this.shapes[lineId] as LineType;
            if(line.pointsOn.has(point1Id) && line.pointsOn.has(point2Id)) {
                return [true, lineId];
            }
        }

        return [false, ''];
    }

    getRayByPoints(point1Id: string, point2Id: string): [boolean, string] {
        for(const lineId of this.rays) {
            const line = this.shapes[lineId] as LineType;
            if(line.pointsOn.has(point1Id) && line.pointsOn.has(point2Id)) {
                return [true, lineId];
            }
        }

        return [false, ''];
    }

    getLineByPoints(point1Id: string, point2Id: string): [boolean, string] {
        for(const lineId of this.lines) {
            const line = this.shapes[lineId] as LineType;
            if(line.pointsOn.has(point1Id) && line.pointsOn.has(point2Id)) {
                return [true, lineId];
            }
        }

        return [false, ''];
    }

    getSegementOrRayOrLineByPoints(point1Id: string, point2Id: string): [boolean, string] {
        for(const lineId of [...this.segments, ...this.rays, ...this.lines]) {
            const line = this.shapes[lineId] as LineType;
            if(line.pointsOn.has(point1Id) && line.pointsOn.has(point2Id)) {
                return [true, lineId];
            }
        }

        return [false, ''];
    }

    getCirlceByPoints(centerId: string, pointOnId: string): [boolean, string] {
        for(const circleId of [...this.circles]) {
            const circle = this.shapes[circleId] as CircleType;
            if(circle.center == centerId && circle.pointsOn.has(pointOnId)) {
                return [true, circleId];
            }
        }

        return [false, ''];
    }

    pointLiesOnShapes(shapeId: string, pointId: string): boolean {
        return (this.shapes[shapeId] as LineCircleType).pointsOn.has(pointId);
    }

    get(): BoardSchemeJson {
        var pointsList: PointJson[] = [];
        for(const pointId of [...this.points, ...this.gliders, ...this.intersections]) {
            const point = this.shapes[pointId] as PointType;
            if(point.isActive) {
                pointsList.push({ 
                    id: point.obj.id,
                    // (x, y)
                    x: point.obj.coords.usrCoords[1], 
                    y: point.obj.coords.usrCoords[2] ,
                    name: point.obj.name
                });
            }
        }
        
        var linesList: LineJson[] = [];
        for(const lineId of [...this.segments, ...this.rays, ...this.lines]) {
            const line = this.shapes[lineId] as LineType;
            var pointsOnLine: Set<string> = new Set();
            for(const pointId of line.pointsOn) {
                if((this.shapes[pointId] as PointType).isActive) { pointsOnLine.add(pointId); }
                else { pointsOnLine.add((this.shapes[pointId] as PointType).inactiveReason); }
            }
            pointsOnLine.delete('');
            linesList.push({
                id: line.obj.id,
                // Ax + By + C = 0
                A: line.obj.stdform[1],
                B: line.obj.stdform[2], 
                C: line.obj.stdform[0],
                pointsOn: [...pointsOnLine]
            }); 
        }

        var circlesList: CircleJson[] = [];
        for(const circleId of [...this.circles]) {
            const circle = this.shapes[circleId] as CircleType;
            var pointsOnCircle: Set<string> = new Set();
            for(const pointId of circle.pointsOn) {
                if((this.shapes[pointId] as PointType).isActive) { pointsOnCircle.add(pointId); }
                else { pointsOnCircle.add((this.shapes[pointId] as PointType).inactiveReason); }
            }
            pointsOnCircle.delete('');
            circlesList.push({
                id: circle.obj.id,
                // (x - cx)^2 + (y - cy)^2 = r^2
                cx: circle.obj.center.coords.usrCoords[1],
                cy: circle.obj.center.coords.usrCoords[2],
                r: circle.obj.radius,
                centerId: circle.obj.center.id,
                pointsOn: [...pointsOnCircle]
            });
        }

        return { 
            points: pointsList,
            lines: linesList,
            circles: circlesList,
            perpendicularLines: this.perpendicularLines.map((dependency) => ({ line1Id: dependency[0], line2Id: dependency[1] })),
            parallelLines: this.parallelLines.map((dependency) => ({ line1Id: dependency[0], line2Id: dependency[1] })),
            equalSegments: this.equalSegments.map((dependency) => ({ segment1End1Id: dependency[0], segment1End2Id: dependency[1], segment2End1Id: dependency[2], segment2End2Id: dependency[3] })),
            equalAngles: this.equalAngles.map((dependency) => ({ angle1End1Id: dependency[0], angle1VertexId: dependency[1], angle1End2Id: dependency[2], angle2End1Id: dependency[3], angle2VertexId: dependency[4], angle2End2Id: dependency[5] })),
            midPerpendiculars: this.midPerpendiculars.map((dependency) => ({ segmentEnd1Id: dependency[0], segmentEnd2Id: dependency[1], lineId: dependency[2] })),
            bisectors: this.bisectors.map((dependency) => ({ angleEnd1Id: dependency[0], angleVertexId: dependency[1], angleEnd2Id: dependency[2], lineId: dependency[3] })),
            tangentLines: this.tangentLines.map((dependency) => ({ circleId: dependency[0], lineId: dependency[1] })),
            tangentCircles: this.tangentCircles.map((dependency) => ({ circle1Id: dependency[0], circle2Id: dependency[1] })),
            circumscribedCircles: this.circumscribedCircles.map((dependency) => ({ circleId: dependency[0], polygonVerticesIds: dependency[1] })),
            inscribedCircles: this.inscribedCircles.map((dependency) => ({ circleId: dependency[0], polygonVerticesIds: dependency[1] })),
            escribedCircles: this.escribedCircles.map((dependency) => ({ circleId: dependency[0], polygonPoints: dependency.slice(1, 5) })),
            polygonTypes: this.polygonTypes.map((dependency) => ({  polygonVerticesIds: dependency[0], polygonType: dependency[1] })),
            medians: this.medians.map((dependency) => ({ polygonVerticesIds: dependency.slice(0, 3), segmentEnd1Id: dependency[3], segmentEnd2Id: dependency[4] })),
            altitudes: this.altitudes.map((dependency) => ({ polygonVerticesIds: dependency.slice(0, 3), segmentEnd1Id: dependency[3], segmentEnd2Id: dependency[4] })),
            midSegments: this.midSegments.map((dependency) => ({ polygonVerticesIds: dependency.slice(0, 4), segmentEnd1Id: dependency[4], segmentEnd2Id: dependency[5] })),
            segmentLengths: this.segmentLengths.map((dependency) => ({ segmentEnd1Id: dependency[0], segmentEnd2Id: dependency[1], length: dependency[2] })),
            angleMeasures: this.angleMeasures.map((dependency) => ({ angleEnd1Id: dependency[0], angleVertexId: dependency[1], angleEnd2Id: dependency[2], angleIsConvex: dependency[3], measure: dependency[4] })),
            formulas: this.formulas,
        };
    }
}