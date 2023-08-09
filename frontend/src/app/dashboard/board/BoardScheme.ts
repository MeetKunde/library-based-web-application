import { BoardSchemeJson, CircleJson, LineJson, PointJson } from "./BoardSchemeJson";

type PointType = {obj: any, isActive: boolean, inactiveReason: string};
type LineType = {obj: any, pointsOn: Set<string>};
type CircleType = {obj: any, center: string, pointsOn: Set<string>};
type LineCircleType = {obj: any, pointsOn: Set<string>};

export class BoardScheme {
    private points: string[];
    private gliders: string[];
    private intersections: string[];
    private segments: string[];
    private rays: string[];
    private lines: string[];
    private circles: string[];
    private shapes: { [key: string]: PointType | LineType | CircleType };

    private perpendicularLines: [string, string][];
    private parallelLines: [string, string][];
    private midPerpendiculars: [string, string][];

    private segmentLengths: string[];
    private angleMeasures: string[];
    private equations: string[];

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
        this.midPerpendiculars = [];

        this.segmentLengths = [];
        this.angleMeasures = [];
        this.equations = [];
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

    addCircle(circleObject: any): void {
        this.circles.push(circleObject.id);
        this.shapes[circleObject.id] = { obj: circleObject, center: circleObject.inherits[0].id, pointsOn: new Set() };
        (this.shapes[circleObject.id] as CircleType).pointsOn.add(circleObject.inherits[1].id);
    }

    addPerpendicularity(lineObject: any, baseLineObject: any, basePointObject: any): void {
        this.lines.push(lineObject.id);
        this.shapes[lineObject.id] = { obj: lineObject, pointsOn: new Set() };
        (this.shapes[lineObject.id] as LineType).pointsOn.add(basePointObject.id);
        this.perpendicularLines.push([lineObject.id, baseLineObject.id]);
    }

    addParallelism(lineObject: any, baseLineObject: any, basePointObject: any): void {
        this.lines.push(lineObject.id);
        this.shapes[lineObject.id] = { obj: lineObject, pointsOn: new Set() };
        (this.shapes[lineObject.id] as LineType).pointsOn.add(basePointObject.id);
        this.parallelLines.push([lineObject.id, baseLineObject.id]);
    }

    get(): BoardSchemeJson {
        console.log(this.shapes)
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
            perpendicular: this.perpendicularLines,
            parallel: this.parallelLines
        };
    }

    chooseInactiveReason(inactiveReasons: any[]): string {
        if(inactiveReasons.length == 0) { return ''; }

        for(const point of inactiveReasons) {
            if(this.gliders.includes(point.id)) { return point.id; }
        }

        return inactiveReasons[0].id;
    }
}