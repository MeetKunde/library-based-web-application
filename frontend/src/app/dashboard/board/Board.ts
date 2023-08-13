import { ActionEnum } from "./ActionEnum";
import { BoardScheme } from "./BoardScheme";
import { BoardSchemeJson } from "./BoardSchemeJson";
import { Colors, Naming, Sizes } from "./Config";
import { AnswearType, RequestEnum } from "./RequestEnum";
import { distance, isCircle, isIntersectionPoint, isLine, isPoint, xCoord, yCoord } from "./Utils";

declare const JXG: any 

export class Board {
    private board: any;
    private action: ActionEnum;
    private shapeClicked: boolean;
    private shapesAccumulator: any[];

    private capitalLettersCounter = 0;
    private lowercaseLettersCounter = 0;

    private boardScheme: BoardScheme;

    constructor(private boardId: string, private bounds: [number, number, number, number], private showAxis: boolean, private keepAspectRatio: boolean, private requestDataFromUser: (requestType: RequestEnum, callback: (data: AnswearType) => void) => void) {
        this.board = JXG.JSXGraph.initBoard(boardId, { boundingbox: bounds, showcopyright: false, axis: showAxis, keepAspectRatio: keepAspectRatio });
        this.board.on('down', this.handleBoardClick);
        this.board.on('update', this.handleBoardUpdate);

        this.action = ActionEnum.NONE;
        this.shapeClicked = false;
        this.shapesAccumulator = [];

        this.capitalLettersCounter = 0;
        this.lowercaseLettersCounter = 0;

        this.boardScheme = new BoardScheme();
    }

    setAction(action: ActionEnum): void {
        if(action == ActionEnum.ENTER_FORMULA) { 
            this.action = ActionEnum.NONE;
            this.addFormula(); 
        }
        else {
            this.action = action;   
            this.shapesAccumulator = [];
        }
    }

    getAction(): ActionEnum {
        return this.action;
    }

    changeAction(action: ActionEnum): boolean {
        if(this.action == action) {
            this.setAction(ActionEnum.NONE);
            return false;
        }
        else {
            this.setAction(action);
            return true;
        }
    }

    getScheme(): BoardSchemeJson {  
        console.log(this.board.objects);
        return this.boardScheme.get();
    }

    detach() {
        JXG.JSXGraph.freeBoard(this.board);
    }

    private getNextCapitalLetter(): string {
        this.capitalLettersCounter++;

        if(this.capitalLettersCounter <= Naming.CAPITAL_LETTERS.length) {
            return Naming.CAPITAL_LETTERS[(this.capitalLettersCounter - 1)];
        }
        else {
            const k = (this.capitalLettersCounter - 1) % Naming.CAPITAL_LETTERS.length;
            const l = (this.capitalLettersCounter - 1) / Naming.CAPITAL_LETTERS.length;
            return Naming.CAPITAL_LETTERS[k] + '\''.repeat(l);
        }        
    }

    private getNextLowercaseLetter(): string {
        this.lowercaseLettersCounter++;

        if(this.lowercaseLettersCounter <= Naming.LOWERCASE_LETTERS.length) {
            return Naming.LOWERCASE_LETTERS[(this.lowercaseLettersCounter - 1)];
        }
        else {
            const k = (this.lowercaseLettersCounter - 1) % Naming.LOWERCASE_LETTERS.length;
            const l = (this.lowercaseLettersCounter - 1) / Naming.LOWERCASE_LETTERS.length;
            return Naming.LOWERCASE_LETTERS[k] + '\''.repeat(l);
        }  
    }       

    private createPoint(x: number, y: number): any {
        const point = this.board.create('point', [x, y], { 
            name: this.getNextCapitalLetter(), 
            label: {fixed:false},
            size: Sizes.POINT_SIZE,
            color: Colors.PRIMARY,
            highlightFillColor: Colors.SECONDARY,
            highlightStrokeColor: Colors.SECONDARY,
            showInfobox: false
        });

        point.on('down', (event: any) => { this.handlePointClick(event, point); });
        this.board.update();
        this.boardScheme.addPoint(point);

        return point;
    }

    private createGliderPoint(x: number, y: number, shape: any): any {
        const point = this.board.create('glider', [x, y, shape], {
            name: this.getNextCapitalLetter(), 
            label: {fixed:false},
            size: Sizes.POINT_SIZE,
            color: Colors.PRIMARY,
            highlightFillColor: Colors.SECONDARY,
            highlightStrokeColor: Colors.SECONDARY,
            showInfobox: false
        });

        point.on('down', (event: any) => { this.handlePointClick(event, point); });
        this.board.update();
        this.boardScheme.addGlider(point, shape);

        return point;
    }

    private createSegment(point1: any, point2: any): any {
        const segment = this.board.create('line', [point1, point2], {
            straightFirst: false,
            straightLast: false,
            strokeWidth: Sizes.STROKE_WIDTH,
            color: Colors.PRIMARY,
            highlightStrokeColor: Colors.SECONDARY
        });

        segment.on('down', (event: any) => { this.handleLineClick(event, segment); });
        this.boardScheme.addSegment(segment);
        this.createIntersectionPoints(segment);
        
        return segment;
    }

    private createRay(point1: any, point2: any): any {
        const ray = this.board.create('line', [point1, point2], { 
            straightFirst: false,
            strokeWidth: Sizes.STROKE_WIDTH,
            color: Colors.PRIMARY,
            highlightStrokeColor: Colors.SECONDARY
        });

        ray.on('down', (event: any) => { this.handleLineClick(event, ray); });
        this.boardScheme.addRay(ray);
        this.createIntersectionPoints(ray);

        return ray;
    }

    private createLine(point1: any, point2: any): any {
        const line = this.board.create('line', [point1, point2], {
            strokeWidth: Sizes.STROKE_WIDTH,
            color: Colors.PRIMARY,
            highlightStrokeColor: Colors.SECONDARY
        });

        line.on('down', (event: any) => { this.handleLineClick(event, line); });
        this.boardScheme.addLine(line);
        this.createIntersectionPoints(line);

        return line;
    }

    private createCircle(point1: any, point2: any): any {
        const circle = this.board.create('circle', [point1, point2], { 
            fillColor: 'none',
            strokeWidth: Sizes.STROKE_WIDTH,
            strokeColor: Colors.PRIMARY,
            highlightStrokeColor: Colors.SECONDARY
        });

        circle.on('down', (event: any) => { this.handleCircleClick(event, circle); });
        this.boardScheme.addCircle(circle);
        this.createIntersectionPoints(circle);

        return circle;
    }

    private createIntersectionPoint(x: number, y: number, shape1: any, shape2: any, i1: number, i2: number): any {
        const point = this.board.create('point', [x, y], { 
            name: this.getNextCapitalLetter(), 
            label: {fixed:false, opacity: 0, highlightStrokeOpacity: 0},
            size: Sizes.POINT_SIZE,
            color: Colors.PRIMARY,
            highlightFillColor: Colors.SECONDARY,
            highlightStrokeColor: Colors.SECONDARY,
            showInfobox: false,
            opacity: 0,
            highlightStrokeOpacity: 0
        });

        point.on('down', (event: any) => { this.handlePointClick(event, point); });
        point.makeIntersection(shape1, shape2, i1, i2);
        this.boardScheme.addIntersection(point, shape1, shape2);
        
        return point;
    }

    private createIntersectionPoints(shape: any): void {
        for(let objKey in this.board.objects) {
            var obj = this.board.objects[objKey];

            if(obj.id == shape.id) {
                continue;
            }

            if(isLine(obj) || isCircle(obj)) {
                const point1 = JXG.Math.Geometry.meet(shape.stdform, obj.stdform, 0, this.board);
                const point2 = JXG.Math.Geometry.meet(shape.stdform, obj.stdform, 1, this.board);
                
                const intersectionPoint1 = this.createIntersectionPoint(point1.usrCoords[1], point1.usrCoords[2], shape, obj, 0, 0);

                if(isCircle(obj) || isCircle(shape)) {
                    const intersectionPoint2 =  this.createIntersectionPoint(point2.usrCoords[1], point2.usrCoords[2], shape, obj, 1, 1);  
                }               
            }
        }

        this.board.update();
    }

    private createPerpendicularLine(baseLine: any, basePoint: any): any {
        const line = this.board.create('perpendicular', [baseLine, basePoint], {
            strokeWidth: Sizes.STROKE_WIDTH,
            color: Colors.PRIMARY,
            highlightStrokeColor: Colors.SECONDARY
        });

        line.on('down', (event: any) => { this.handleLineClick(event, line); });
        this.boardScheme.addPerpendicularity(line, baseLine, basePoint);
        this.createIntersectionPoints(line);

        return line;
    }

    private createParallelLine(baseLine: any, basePoint: any): any {
        const line = this.board.create('parallel', [baseLine, basePoint], {
            strokeWidth: Sizes.STROKE_WIDTH,
            color: Colors.PRIMARY,
            highlightStrokeColor: Colors.SECONDARY
        });

        line.on('down', (event: any) => { this.handleLineClick(event, line); });
        this.boardScheme.addParallelism(line, baseLine, basePoint);
        this.createIntersectionPoints(line);

        return line;
    }

    private divideSegment(segmentEnds: [any, any], partsNumber: number): any[] {
        var line: any;
        const lineSearch: [boolean, string] = this.boardScheme.getLineByPoints(segmentEnds[0].id, segmentEnds[1].id);
        if(lineSearch[0]) { line = this.board.objects[lineSearch[1]]; }
        else { line = this.createSegment(segmentEnds[0], segmentEnds[1]); }

        const dx = (xCoord(segmentEnds[1]) - xCoord(segmentEnds[0])) / partsNumber;
        const dy = (yCoord(segmentEnds[1]) - yCoord(segmentEnds[0])) / partsNumber;

        var points: any[] = [];
        points.push(segmentEnds[0]);
        for(var i = 1; i < partsNumber; i++) {
            var x = xCoord(segmentEnds[0]) + i * dx;
            var y = yCoord(segmentEnds[0]) + i * dy;
            const point = this.createGliderPoint(x, y, line);
            point.setAttribute({fixed: true});
            points.push(point);
        }
        points.push(segmentEnds[1]);

        return points;
    }

    private divideSegmentRequestData(segmentEnds: [any, any]): void {
        this.requestDataFromUser(RequestEnum.PARTS_NUMBER_TO_DIVIDE_SEGMENT, (data) => {
            const castedData = data as { partsNumber: number };
            this.divideSegment(segmentEnds, castedData.partsNumber);
        });
    }

    private divideAngle(anglePoints: [any, any, any], partsNumber: number, angleIsConvex: boolean, radius: number = 1): any[] {
        var parts: any[] = [];

        //const dx = Math.cos(angle.Value() * i / n) * angle.radius;
        //const dy = Math.cos(angle.Value() * i / n) * angle.radius;
        
        return parts;
    }

    private divideAngleRequestData(anglePoints: [any, any, any]): void {
        this.requestDataFromUser(RequestEnum.PARTS_NUMBER_AND_IS_CONVEX_TO_DIVIDE_ANGLE, (data) => {
            const castedData = data as { partsNumber: number, angleIsConvex: boolean };
            this.divideAngle(anglePoints, castedData.partsNumber, castedData.angleIsConvex);
        });
    }

    private createMidPerpendicular(baseSegmentEnds: [any, any]): any {
        const points = this.divideSegment(baseSegmentEnds, 2);
        const segmentSearch = this.boardScheme.getLineByPoints(baseSegmentEnds[0].id, baseSegmentEnds[1].id);
        const segment = this.board.objects[segmentSearch[1]];
        const line = this.createPerpendicularLine(segment, points[1]);

        this.boardScheme.addMidPerpendicular(baseSegmentEnds[0], baseSegmentEnds[1], line);
        return line;
    }

    private createBisector(baseAnglePoints: [any, any, any], baseAngleIsConvex: boolean): any {
        
    }

    private createBisectorRequestData(baseAnglePoints: [any, any, any]): any {
        this.requestDataFromUser(RequestEnum.ANGLE_IS_CONVEX, (data) => {
            const castedData = data as { angleIsConvex: boolean };
            this.createBisector(baseAnglePoints, castedData.angleIsConvex);
        });
    }

    private setSegmentsEquality(segment1Ends: [any, any], segment2Ends: [any, any]): void {

        this.boardScheme.addEqualSegments(segment1Ends[0], segment1Ends[1], segment2Ends[0], segment2Ends[1]);
    }

    private setAnglesEquality(angle1Points: [any, any, any], angle2Points: [any, any, any]): void {
        
        this.boardScheme.addEqualAngles(angle1Points[0], angle1Points[1], angle1Points[2], angle2Points[0], angle2Points[1], angle2Points[2]);
    }

    private setSegmentLength(segmentEnds: [any, any]): void {
        this.requestDataFromUser(RequestEnum.LENGTH, (data) => {
            const castedData = data as { length: string };
            this.boardScheme.setSegmentLength(segmentEnds[0], segmentEnds[1], castedData.length);
        });
    }

    private setAngleMeasure(anglePoints: [any, any, any]): void {
        this.requestDataFromUser(RequestEnum.MEASURE, (data) => {
            const castedData = data as { measure: string, angleIsConvex: boolean };
            this.boardScheme.setAngleMeasure(anglePoints[0], anglePoints[1], anglePoints[2], castedData.angleIsConvex, castedData.measure);
        });
    }

    private addFormula(): void {
        this.requestDataFromUser(RequestEnum.FORMULA, (data) => {
            const castedData = data as { formula: string };
            this.boardScheme.addFormula(castedData.formula);
        });
    }

    private handleBoardClick = (event: any): void => {        
        if(this.shapeClicked) {
            this.shapeClicked = false;
            return;
        }
        else {
            this.shapeClicked = false;
        }

        const coords = this.getCoords(event);
        const x = coords[0];
        const y = coords[1];
        const canBeCreated = coords[2];
        const duplicationPoint = coords[3];
        
        switch(this.action) {
            case ActionEnum.CREATE_POINT:
                if(canBeCreated) { this.createPoint(x, y); }
                break;
            case ActionEnum.CREATE_SEGMENT:
            case ActionEnum.CREATE_LINE:
            case ActionEnum.CREATE_RAY:
            case ActionEnum.CREATE_CIRCLE:
                if(canBeCreated) { this.shapesAccumulator.push(this.createPoint(x, y)); }
                else { this.shapesAccumulator.push(duplicationPoint); }
                break;
            case ActionEnum.CREATE_PERPENDICULAR_LINE:
            case ActionEnum.CREATE_PARALLEL_LINE:
                if(this.shapesAccumulator.length == 1 && canBeCreated) { this.shapesAccumulator.push(this.createPoint(x, y)) }
                else if(this.shapesAccumulator.length == 1) { this.shapesAccumulator.push(duplicationPoint); }
                break;
            case ActionEnum.CREATE_MID_PERPENDICULAR:
            case ActionEnum.CREATE_BISECTOR:
            case ActionEnum.SET_SEGMENT_LENGHT:
            case ActionEnum.SET_ANGLE_MEASURE:
            case ActionEnum.DIVIDE_SEGMENT:
            case ActionEnum.DIVIDE_ANGLE:
            case ActionEnum.SET_EQUAL_SEGMENTS:
            case ActionEnum.SET_EQUAL_ANGLES:
                if(canBeCreated) { this.shapesAccumulator.push(this.createPoint(x, y)); }
                else { this.shapesAccumulator.push(duplicationPoint); }
                break;
            default:
                return;
        }

        this.processAccumulator();
    }

    private handlePointClick = (event: any, point: any): void => {
        if(this.shapeClicked) {
            return;
        }
        else {
            this.shapeClicked = true;
        }

        const coords = this.getCoords(event);
        const x = coords[0];
        const y = coords[1];
        const canBeCreated = coords[2];
        const duplicationPoint = coords[3];

        switch(this.action) {
            case ActionEnum.CREATE_POINT:
                break;
            case ActionEnum.CREATE_SEGMENT:
            case ActionEnum.CREATE_LINE:
            case ActionEnum.CREATE_RAY:
            case ActionEnum.CREATE_CIRCLE:
                this.shapesAccumulator.push(point);
                break;
            case ActionEnum.CREATE_PERPENDICULAR_LINE:
            case ActionEnum.CREATE_PARALLEL_LINE:
                if(this.shapesAccumulator.length == 1) { this.shapesAccumulator.push(point) }
                break;
            case ActionEnum.CREATE_MID_PERPENDICULAR:
            case ActionEnum.CREATE_BISECTOR:
            case ActionEnum.SET_SEGMENT_LENGHT:
            case ActionEnum.SET_ANGLE_MEASURE:
            case ActionEnum.DIVIDE_SEGMENT:
            case ActionEnum.DIVIDE_ANGLE:
            case ActionEnum.SET_EQUAL_SEGMENTS:
            case ActionEnum.SET_EQUAL_ANGLES:
                this.shapesAccumulator.push(point);
                break;
            default:
                return;
        }
        
        this.processAccumulator();
    }

    private handleLineClick = (event: any, line: any): void => {
        for(const shape of this.board.getAllUnderMouse(event)) {
            if(isPoint(shape)) {
                return; // point has higher priority than line
            }
        }

        if(this.shapeClicked) {
            return;
        }
        else {
            this.shapeClicked = true;
        }

        const coords = this.getCoords(event);
        const x = coords[0];
        const y = coords[1];
        const canBeCreated = coords[2];
        const duplicationPoint = coords[3];

        switch(this.action) {
            case ActionEnum.CREATE_POINT:
                if(canBeCreated) { this.createGliderPoint(x, y, line); }
                break;
            case ActionEnum.CREATE_SEGMENT:
            case ActionEnum.CREATE_LINE:
            case ActionEnum.CREATE_RAY:
            case ActionEnum.CREATE_CIRCLE:
                if(canBeCreated) { this.shapesAccumulator.push(this.createGliderPoint(x, y, line)); }
                else { this.shapesAccumulator.push(duplicationPoint); }
                break;
            case ActionEnum.CREATE_PERPENDICULAR_LINE:
            case ActionEnum.CREATE_PARALLEL_LINE:
                if(this.shapesAccumulator.length == 0) { this.shapesAccumulator.push(line); }
                else if(this.shapesAccumulator.length == 1 && canBeCreated) { this.shapesAccumulator.push(this.createGliderPoint(x, y, line)) }
                else if(this.shapesAccumulator.length == 1) { this.shapesAccumulator.push(duplicationPoint); }
                break;
            case ActionEnum.CREATE_MID_PERPENDICULAR:
            case ActionEnum.CREATE_BISECTOR:
            case ActionEnum.SET_SEGMENT_LENGHT:
            case ActionEnum.SET_ANGLE_MEASURE:
            case ActionEnum.DIVIDE_SEGMENT:
            case ActionEnum.DIVIDE_ANGLE:
            case ActionEnum.SET_EQUAL_SEGMENTS:
            case ActionEnum.SET_EQUAL_ANGLES:
                if(canBeCreated) { this.shapesAccumulator.push(this.createGliderPoint(x, y, line)); }
                else { this.shapesAccumulator.push(duplicationPoint); }
                break;
            default:
                return;
        }

        this.processAccumulator();
    }

    private handleCircleClick = (event: any, circle: any): void => {
        for(const shape of this.board.getAllUnderMouse(event)) {
            if(isPoint(shape)) {
                return; // point has higher priority than circle
            }
            else if(isLine(shape)) {
                return; // line has higher prioroty than circle
            }
        }
        
        if(this.shapeClicked) {
            return;
        }
        else {
            this.shapeClicked = true;
        }

        const coords = this.getCoords(event);
        const x = coords[0];
        const y = coords[1];
        const canBeCreated = coords[2];
        const duplicationPoint = coords[3];

        switch(this.action) {
            case ActionEnum.CREATE_POINT:
                if(canBeCreated) {
                    this.createGliderPoint(x, y, circle);
                }
                break;
            case ActionEnum.CREATE_SEGMENT:
            case ActionEnum.CREATE_LINE:
            case ActionEnum.CREATE_RAY:
            case ActionEnum.CREATE_CIRCLE:
                if(canBeCreated) { this.shapesAccumulator.push(this.createGliderPoint(x, y, circle)); }
                else { this.shapesAccumulator.push(duplicationPoint); }
                break;
            case ActionEnum.CREATE_PERPENDICULAR_LINE:
            case ActionEnum.CREATE_PARALLEL_LINE:
                if(this.shapesAccumulator.length == 1 && canBeCreated) { this.shapesAccumulator.push(this.createGliderPoint(x, y, circle)) }
                else if(this.shapesAccumulator.length == 1) { this.shapesAccumulator.push(duplicationPoint); }
                break;
            case ActionEnum.CREATE_MID_PERPENDICULAR:
            case ActionEnum.CREATE_BISECTOR:
            case ActionEnum.SET_SEGMENT_LENGHT:
            case ActionEnum.SET_ANGLE_MEASURE:
            case ActionEnum.DIVIDE_SEGMENT:
            case ActionEnum.DIVIDE_ANGLE:
            case ActionEnum.SET_EQUAL_SEGMENTS:
            case ActionEnum.SET_EQUAL_ANGLES:
                if(canBeCreated) { this.shapesAccumulator.push(this.createGliderPoint(x, y, circle)); }
                else { this.shapesAccumulator.push(duplicationPoint); }
                break;
            default:
                return;
        }

        this.processAccumulator();
    }

    private handleBoardUpdate = (): void => {
        this.correctIntersectionPoints();
    }

    private processAccumulator(): void {
        if(this.shapesAccumulator.length == 2) {
            switch(this.action) {
                case ActionEnum.CREATE_SEGMENT:
                    this.createSegment(this.shapesAccumulator[0], this.shapesAccumulator[1]);
                    break;
                case ActionEnum.CREATE_RAY:
                    this.createRay(this.shapesAccumulator[0], this.shapesAccumulator[1]);
                    break;
                case ActionEnum.CREATE_LINE:
                    this.createLine(this.shapesAccumulator[0], this.shapesAccumulator[1]);
                    break;
                case ActionEnum.CREATE_CIRCLE:
                    this.createCircle(this.shapesAccumulator[0], this.shapesAccumulator[1]);
                    break;
                case ActionEnum.CREATE_PERPENDICULAR_LINE:
                    this.createPerpendicularLine(this.shapesAccumulator[0], this.shapesAccumulator[1]);
                    break;
                case ActionEnum.CREATE_PARALLEL_LINE:
                    this.createParallelLine(this.shapesAccumulator[0], this.shapesAccumulator[1]);
                    break;
                case ActionEnum.CREATE_MID_PERPENDICULAR:
                    this.createMidPerpendicular([this.shapesAccumulator[0], this.shapesAccumulator[1]]);
                    break;
                case ActionEnum.SET_SEGMENT_LENGHT:
                    this.setSegmentLength([this.shapesAccumulator[0], this.shapesAccumulator[1]]);
                    break;
                case ActionEnum.DIVIDE_SEGMENT:
                    this.divideSegmentRequestData([this.shapesAccumulator[0], this.shapesAccumulator[1]]);
                    break;
                default:
                    return;
            }

            this.shapesAccumulator = [];
        }
        else if(this.shapesAccumulator.length == 3) {
            switch(this.action) {
                case ActionEnum.CREATE_BISECTOR:
                    this.createBisectorRequestData([this.shapesAccumulator[0], this.shapesAccumulator[1], this.shapesAccumulator[2]]);
                    break;
                case ActionEnum.SET_ANGLE_MEASURE:
                    this.setAngleMeasure([this.shapesAccumulator[0], this.shapesAccumulator[1], this.shapesAccumulator[2]]);
                    break;
                case ActionEnum.DIVIDE_ANGLE:
                    this.divideAngleRequestData([this.shapesAccumulator[0], this.shapesAccumulator[1], this.shapesAccumulator[2]]);
                    break;
                case ActionEnum.SET_EQUAL_SEGMENTS:
                case ActionEnum.SET_EQUAL_ANGLES:
                default:
                    return;
            }

            this.shapesAccumulator = [];
        }
        else if(this.shapesAccumulator.length == 6) {
            switch(this.action) {
                case ActionEnum.SET_EQUAL_ANGLES:
                    this.setAnglesEquality([this.shapesAccumulator[0], this.shapesAccumulator[1], this.shapesAccumulator[2]], [this.shapesAccumulator[3], this.shapesAccumulator[4], this.shapesAccumulator[5]]);
                    break;
                default:
                    return;
            }
        }
    }

    private getCoords(event: any): [x: number, y: number, canBeCreated: boolean, duplication: any] {
        var fingerIndex = undefined;
        if(event[JXG.touchProperty]) {
            fingerIndex = 0;
        }

        var pos = this.board.getMousePosition(event, fingerIndex);
        var coords = new JXG.Coords(JXG.COORDS_BY_SCREEN, pos, this.board);

        var canBeCreated = true;
        var duplication = undefined;
        for(let objKey in this.board.objects) {
            if(JXG.isPoint(this.board.objects[objKey]) && this.board.objects[objKey].hasPoint(coords.usrCoords[1], coords.usrCoords[2])) {
                canBeCreated = false;
                duplication = this.board.objects[objKey];
                break;
            }
        }

        return [coords.usrCoords[1], coords.usrCoords[2], canBeCreated, duplication];
    }

    private correctIntersectionPoints(): any {
        var intersectionPoints: any[] = [];
        var nonIntersectionPoints: any[] = [];

        for(let objKey in this.board.objects) {
            const obj = this.board.objects[objKey];

            if(isPoint(obj) && obj.isReal) {
                nonIntersectionPoints.push(obj);
            }

            if(isIntersectionPoint(obj)) {
                intersectionPoints.push(obj);
            }
        }

        for(const ip of intersectionPoints) {
            if(Number.isNaN(xCoord(ip)) || Number.isNaN(yCoord(ip))) {
                this.boardScheme.setIntersectionState(ip, false, []); 
                continue; 
            }

            var newOpacity = 1;
            var inactiveReasons: any[] = [];
            for(const nip of nonIntersectionPoints) {
                const dist = distance(ip, nip);
                if(dist < 1) {
                    newOpacity = 0;
                    inactiveReasons.push(nip);
                }
            }

            ip.setAttribute({ opacity: newOpacity });
            ip.setAttribute({ highlightStrokeOpacity: newOpacity });
            ip.label.setAttribute({ opacity: newOpacity });
            ip.label.setAttribute({ highlightStrokeOpacity: newOpacity });

            this.boardScheme.setIntersectionState(ip, newOpacity === 1, inactiveReasons);
        }
    }
};