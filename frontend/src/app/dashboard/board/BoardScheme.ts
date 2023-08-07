
export class BoardScheme {
    private points: { [key: string]: {obj: any} };
    private gliders: { [key: string]: {obj: any} };
    private intersections: { [key: string]: {obj: any, isActive: boolean} };
    private segments: { [key: string]: {obj: any} };
    private rays: { [key: string]: {obj: any} };
    private lines: { [key: string]: {obj: any} };
    private circles: { [key: string]: {obj: any} };
    private shapes: { [key: string]: {obj: any, pointOn: string[]} };

    constructor() {
        this.points = {};
        this.gliders = {};
        this.intersections = {};
        this.segments = {};
        this.rays = {};
        this.lines = {};
        this.circles = {};
        this.shapes = {};
    }

    addPoint(pointObject: any): void {
        this.points[pointObject.id] = { obj: pointObject };
        this.shapes[pointObject.id] = { obj: pointObject, pointOn: [] }
    }

    addGlider(gliderObject: any): void {
        this.gliders[gliderObject.id] = { obj: gliderObject };
        this.shapes[gliderObject.id] = { obj: gliderObject, pointOn: [] }
    }

    addIntersection(intersectionObject: any): void {
        this.intersections[intersectionObject.id] = { obj: intersectionObject, isActive: false };
        this.shapes[intersectionObject.id] = { obj: intersectionObject, pointOn: [] }
    }

    setIntersectionState(intersection: any, isActive: boolean): void {
        this.intersections[intersection.id].isActive = isActive;
    }

    addSegment(segmentObject: any): void {
        this.segments[segmentObject.id] = { obj: segmentObject };
        this.shapes[segmentObject.id] = { obj: segmentObject, pointOn: [] }
    }

    addRay(rayObject: any): void {
        this.rays[rayObject.id] = { obj: rayObject };
        this.shapes[rayObject.id] = { obj: rayObject, pointOn: [] }
    }

    addLine(lineObject: any): void {
        this.lines[lineObject.id] = { obj: lineObject };
        this.shapes[lineObject.id] = { obj: lineObject, pointOn: [] }
    }

    addCircle(circleObject: any): void {
        this.circles[circleObject.id] = { obj: circleObject };
        this.shapes[circleObject.id] = { obj: circleObject, pointOn: [] }
    }

    addPointToShape(shape: any, point: any): void {
        this.shapes[shape.id].pointOn.push(point.id);
    }
}