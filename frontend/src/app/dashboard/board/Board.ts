import { ActionEnum } from "./ActionEnum";
import { BoardScheme } from "./BoardScheme";
import { BoardSchemeJson } from "./BoardSchemeJson";
import { Colors, Naming, Options, Sizes } from "./Config";
import { AnswearType, RequestEnum } from "./RequestEnum";
import { distance, genRandom, isCircle, isIntersectionPoint, isLine, isPoint, xCoord, yCoord } from "./Utils";

declare const JXG: any 

export class Board {
    private board: any;
    private action: ActionEnum;
    private shapeClicked: boolean;
    private shapesAccumulator: any[];
    private noIntersect: [string, string][];

    private capitalLettersCounter = 0;
    private lowercaseLettersCounter = 0;
    private segmentHatchesCounter = 0;
    private anglesHatchesCounter = 0;
    private enteredFormulas: any[] = [];
    private promptingShapes: any[] = [];
    private highlightedShapes: any[] = [];

    private boardScheme: BoardScheme;

    constructor(private boardId: string, private bounds: [number, number, number, number], private maxBounds: [number, number, number, number], private showAxis: boolean, private keepAspectRatio: boolean, private requestDataFromUser: (requestType: RequestEnum, callback: (data: AnswearType) => void) => void) {
        this.board = JXG.JSXGraph.initBoard(boardId, { boundingbox: bounds, maxBoundingBox: maxBounds, showcopyright: false, axis: showAxis, keepAspectRatio: keepAspectRatio });
        this.board.on('down', this.handleBoardClick);
        this.board.on('update', this.handleBoardUpdate);
        this.board.on('move', this.drawPromptingShapes);

        this.action = ActionEnum.NONE;
        this.shapeClicked = false;
        this.shapesAccumulator = [];
        this.noIntersect = [];

        this.capitalLettersCounter = 0;
        this.lowercaseLettersCounter = 0;
        this.segmentHatchesCounter = 1;
        this.anglesHatchesCounter = 1;
        this.enteredFormulas = [];
        this.promptingShapes = [];
        this.highlightedShapes = [];

        this.boardScheme = new BoardScheme();

        document.getElementById('jxgbox_navigation_out')!.addEventListener('click', () => { this.showFormulas(); });
        document.getElementById('jxgbox_navigation_100')!.addEventListener('click', () => { this.showFormulas(); });
        document.getElementById('jxgbox_navigation_in')!.addEventListener('click', () => { this.showFormulas(); });
        document.getElementById('jxgbox_navigation_left')!.addEventListener('click', () => { this.showFormulas(); });
        document.getElementById('jxgbox_navigation_down')!.addEventListener('click', () => { this.showFormulas(); });
        document.getElementById('jxgbox_navigation_up')!.addEventListener('click', () => { this.showFormulas(); });
        document.getElementById('jxgbox_navigation_right')!.addEventListener('click', () => { this.showFormulas(); });
    }

    setAction(action: ActionEnum): void {
        if(action == ActionEnum.ENTER_FORMULA) { 
            this.action = ActionEnum.NONE;
            this.addFormula(); 
        }
        else {
            this.action = action;   
            this.shapesAccumulator = [];
            this.highlightShapes();
            this.drawPromptingShapes(null);
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
            label: { fixed:false, fontSize: Sizes.TEXT_FONT },
            size: Sizes.POINT_SIZE,
            color: Colors.PRIMARY,
            highlightFillColor: Colors.SECONDARY,
            highlightStrokeColor: Colors.SECONDARY,
            showInfobox: false,
        });

        point.on('down', (event: any) => { this.handlePointClick(event, point); });
        this.boardScheme.addPoint(point);

        return point;
    }

    private createPromptingPoint(x: number, y: number): any {
        const point = this.board.create('point', [x, y], { 
            visible: false,
            showInfobox: false,
            label: {visible: false,}
        });

        return point;
    }

    private createPointFunCoord(coordsGenerator: () => [number, number, number]): any {
        const point = this.board.create('point', [coordsGenerator], { 
            name: this.getNextCapitalLetter(), 
            label: { fixed:false, fontSize: Sizes.TEXT_FONT },
            size: Sizes.POINT_SIZE,
            color: Colors.PRIMARY,
            highlightFillColor: Colors.SECONDARY,
            highlightStrokeColor: Colors.SECONDARY,
            showInfobox: false,
        });

        point.on('down', (event: any) => { this.handlePointClick(event, point); });
        this.boardScheme.addPoint(point);

        return point;
    }

    private createGliderPoint(x: number, y: number, shape: any): any {
        const point = this.board.create('glider', [x, y, shape], {
            name: this.getNextCapitalLetter(), 
            label: { fixed:false, fontSize: Sizes.TEXT_FONT },
            size: Sizes.POINT_SIZE,
            color: Colors.PRIMARY,
            highlightFillColor: Colors.SECONDARY,
            highlightStrokeColor: Colors.SECONDARY,
            showInfobox: false,
        });

        point.on('down', (event: any) => { this.handlePointClick(event, point); });
        this.boardScheme.addGlider(point, shape);

        return point;
    }

    private createSliderPoint(x: number, y: number, shape: any): any {
        const point = this.board.create('glider', [x, y, shape], {
            name: this.getNextCapitalLetter(), 
            label: { fixed:false, fontSize: Sizes.TEXT_FONT },
            size: Sizes.POINT_SIZE,
            color: Colors.PRIMARY,
            highlightFillColor: Colors.SECONDARY,
            highlightStrokeColor: Colors.SECONDARY,
            showInfobox: false,
        });

        point.on('down', (event: any) => { this.handlePointClick(event, point); });
        this.boardScheme.addPoint(point);

        return point;
    }

    private createSegment(point1: any, point2: any, noIntersectWithIds: string[] = []): any {
        const segment = this.board.create('line', [point1, point2], {
            straightFirst: false,
            straightLast: false,
            strokeWidth: Sizes.STROKE_WIDTH,
            color: Colors.PRIMARY,
            highlightStrokeColor: Colors.SECONDARY
        });

        segment.on('down', (event: any) => { this.handleLineClick(event, segment); });
        this.boardScheme.addSegment(segment);
        noIntersectWithIds.forEach((id) => this.noIntersect.push([segment.id, id]));
        this.createIntersectionPoints(segment);
        
        return segment;
    }

    private createPromptingSegment(point1: any, point2: [number, number]): any {
        const segment = this.board.create('line', [point1, point2], {
            straightFirst: false,
            straightLast: false,
            strokeWidth: Sizes.STROKE_WIDTH,
            color: Colors.TERTIARY,
            highlightStrokeColor: Colors.TERTIARY
        });

        return segment;
    }

    private createRay(point1: any, point2: any, noIntersectWithIds: string[] = []): any {
        const ray = this.board.create('line', [point1, point2], { 
            straightFirst: false,
            strokeWidth: Sizes.STROKE_WIDTH,
            color: Colors.PRIMARY,
            highlightStrokeColor: Colors.SECONDARY
        });

        ray.on('down', (event: any) => { this.handleLineClick(event, ray); });
        this.boardScheme.addRay(ray);
        noIntersectWithIds.forEach((id) => this.noIntersect.push([ray.id, id]));
        this.createIntersectionPoints(ray);

        return ray;
    }

    private createPromptingRay(point1: any, point2: [number, number]): any {
        const ray = this.board.create('line', [point1, point2], { 
            straightFirst: false,
            strokeWidth: Sizes.STROKE_WIDTH,
            color: Colors.TERTIARY,
            highlightStrokeColor: Colors.TERTIARY
        });

        return ray;
    }

    private createLine(point1: any, point2: any, noIntersectWithIds: string[] = []): any {
        const line = this.board.create('line', [point1, point2], {
            strokeWidth: Sizes.STROKE_WIDTH,
            color: Colors.PRIMARY,
            highlightStrokeColor: Colors.SECONDARY
        });

        line.on('down', (event: any) => { this.handleLineClick(event, line); });
        this.boardScheme.addLine(line);
        noIntersectWithIds.forEach((id) => this.noIntersect.push([line.id, id]));
        this.createIntersectionPoints(line);

        return line;
    }

    private createPromptingLine(point1: any, point2: [number, number]): any {
        const line = this.board.create('line', [point1, point2], {
            strokeWidth: Sizes.STROKE_WIDTH,
            color: Colors.TERTIARY,
            highlightStrokeColor: Colors.TERTIARY
        });

        return line;
    }

    private createCircle(point1: any, point2: any, noIntersectWithIds: string[] = []): any {
        const circle = this.board.create('circle', [point1, point2], { 
            fillColor: 'none',
            strokeWidth: Sizes.STROKE_WIDTH,
            strokeColor: Colors.PRIMARY,
            highlightStrokeColor: Colors.SECONDARY
        });

        circle.on('down', (event: any) => { this.handleCircleClick(event, circle); });
        this.boardScheme.addCircle(circle);
        noIntersectWithIds.forEach((id) => this.noIntersect.push([circle.id, id]));
        this.createIntersectionPoints(circle);

        return circle;
    }

    private createPromptingCircle(point1: any, point2: any): any {
        const circle = this.board.create('circle', [point1, point2], { 
            fillColor: 'none',
            strokeWidth: Sizes.STROKE_WIDTH,
            strokeColor: Colors.TERTIARY,
            highlightStrokeColor: Colors.TERTIARY
        });

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

            if(this.noIntersect.filter((pair) => pair.includes(obj.id) && pair.includes(shape.id)).length > 0) {
                continue;
            }

            if(this.promptingShapes.filter((promptingShape) => obj.id == promptingShape.id).length > 0) {
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

        this.correctIntersectionPoints();
    }

    private createPerpendicularLine(baseLine: any, basePoint: any, noIntersectWithIds: string[] = []): any {
        const line = this.board.create('perpendicular', [baseLine, basePoint], {
            strokeWidth: Sizes.STROKE_WIDTH,
            color: Colors.PRIMARY,
            highlightStrokeColor: Colors.SECONDARY
        });

        line.on('down', (event: any) => { this.handleLineClick(event, line); });
        this.boardScheme.addPerpendicularity(line, baseLine, basePoint);
        noIntersectWithIds.forEach((id) => this.noIntersect.push([line.id, id]));
        this.createIntersectionPoints(line);

        return line;
    }

    private createPromptingPerpendicularLine(baseLine: any, basePoint: any): any {
        const line = this.board.create('perpendicular', [baseLine, basePoint], {
            strokeWidth: Sizes.STROKE_WIDTH,
            color: Colors.TERTIARY,
            highlightStrokeColor: Colors.TERTIARY
        });

        return line;
    }

    private createParallelLine(baseLine: any, basePoint: any, noIntersectWithIds: string[] = []): any {
        const line = this.board.create('parallel', [baseLine, basePoint], {
            strokeWidth: Sizes.STROKE_WIDTH,
            color: Colors.PRIMARY,
            highlightStrokeColor: Colors.SECONDARY
        });

        line.on('down', (event: any) => { this.handleLineClick(event, line); });
        this.boardScheme.addParallelism(line, baseLine, basePoint);
        noIntersectWithIds.forEach((id) => this.noIntersect.push([line.id, id]));
        this.createIntersectionPoints(line);

        return line;
    }

    private createPromptingParallelLine(baseLine: any, basePoint: any): any {
        const line = this.board.create('parallel', [baseLine, basePoint], {
            strokeWidth: Sizes.STROKE_WIDTH,
            color: Colors.TERTIARY,
            highlightStrokeColor: Colors.TERTIARY
        });

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
        for(let i = 1; i < partsNumber; i++) {
            var x = xCoord(segmentEnds[0]) + i * dx;
            var y = yCoord(segmentEnds[0]) + i * dy;
            const point = this.createGliderPoint(x, y, line);
            point.setAttribute({fixed: true});
            points.push(point);
        }
        points.push(segmentEnds[1]);

        var equalSegments: [any, any][] = [];
        for(let i = 1; i < points.length; i++) { equalSegments.push([points[i - 1], points[i]]); }
        this.markEqualSegments(equalSegments);

        return points;
    }

    private divideSegmentRequestData(segmentEnds: [any, any]): void {
        this.requestDataFromUser(RequestEnum.PARTS_NUMBER_TO_DIVIDE_SEGMENT, (data) => {
            const castedData = data as { partsNumber: number };
            this.divideSegment(segmentEnds, castedData.partsNumber);
        });
    }

    private markEqualSegments(segmentsEnds: [any, any][]): void {
        segmentsEnds.forEach(segmentEnds => {
            var segment = this.board.create('segment', segmentEnds, {visible: false});
            var h = this.board.create('hatch', [segment, this.segmentHatchesCounter], {
                strokeWidth: Sizes.TICK_WIDTH,
                color: Colors.TERTIARY,
                highlightStrokeColor: Colors.TERTIARY,
                visible: true, 
                ticksDistance: Sizes.TICKS_DISTANCE,
            });
        });
        
        this.segmentHatchesCounter++;
    }

    private divideAngle(anglePoints: [any, any, any], partsNumber: number, angleIsConvex: boolean): any[] {
        var points: any[] = [];
        points.push(anglePoints[0]);
        for(let i = 1; i < partsNumber; i++) {
            let point = this.createPointFunCoord(function() {
                var angleMeasure = JXG.Math.Geometry.rad(...anglePoints);

                if(angleIsConvex) { if(angleMeasure > Math.PI) {  angleMeasure -= 2 * Math.PI; } }
                else { if(angleMeasure < Math.PI) { angleMeasure = - (2 * Math.PI - angleMeasure); } }
                
                const dalfa = angleMeasure / partsNumber;

                const newPointCoords = JXG.Math.Geometry.rotation(anglePoints[1], points[0], i * dalfa);
                return newPointCoords.usrCoords;
            });
            points.push(point); 

        }
        points.push(anglePoints[2]);

        var equalAngles: [any, any, any][] = [];
        for(let i = 1; i < points.length; i++) { equalAngles.push([points[i - 1], anglePoints[1], points[i]]); }
        this.markEqualAngles(equalAngles);

        return points;
    }

    private divideAngleRequestData(anglePoints: [any, any, any]): void {
        this.requestDataFromUser(RequestEnum.PARTS_NUMBER_AND_IS_CONVEX_TO_DIVIDE_ANGLE, (data) => {
            const castedData = data as { partsNumber: number, angleIsConvex: boolean };
            this.divideAngle(anglePoints, castedData.partsNumber, castedData.angleIsConvex);
        });
    }

    private markEqualAngles(anglesPoints: [any, any, any][]): void {
        anglesPoints.forEach(anglePoints => {
            const rand = genRandom(0.9, 1.1);
            var arcs: any[] = [];
            for(let i = 0; i < this.anglesHatchesCounter; i++) {
                var angleArc = this.board.create('angle', [...anglePoints], {
                    radius: function() { 
                        const baseRadius = 0.4 * rand * Math.min(distance(anglePoints[0], anglePoints[1]), distance(anglePoints[2], anglePoints[1]));
                        return baseRadius + i * Sizes.TICKS_DISTANCE;
                    },
                    strokeWidth: Sizes.TICK_WIDTH,
                    strokeColor: Colors.TERTIARY,
                    highlightStrokeWidth: Sizes.TICK_WIDTH,
                    highlightStrokeColor: Colors.TERTIARY,
                    fillColor: 'none',
                    highlightFillColor: 'none',
                    orthoSensitivity: false,
                    selection: 'minor',
                    label: { visible: false },
                });
                arcs.push(angleArc);
            }
        });

        this.anglesHatchesCounter++;
    }

    private createMidPerpendicular(baseSegmentEnds: [any, any]): any {
        const points = this.divideSegment(baseSegmentEnds, 2);
        const segmentSearch = this.boardScheme.getLineByPoints(baseSegmentEnds[0].id, baseSegmentEnds[1].id);
        const segment = this.board.objects[segmentSearch[1]];
        const line = this.createPerpendicularLine(segment, points[1]);

        this.boardScheme.addMidPerpendicular(baseSegmentEnds[0], baseSegmentEnds[1], line);
        return line;
    }

    private createBisector(baseAnglePoints: [any, any, any], angleIsConvex: boolean): any {
        const points = this.divideAngle(baseAnglePoints, 2, angleIsConvex);
        const line = this.createRay(baseAnglePoints[1], points[1]);

        line.on('down', (event: any) => { this.handleLineClick(event, line); });
        this.boardScheme.addBisector(baseAnglePoints[0], baseAnglePoints[1], baseAnglePoints[2], line);
        return line;
    }

    private createBisectorRequestData(baseAnglePoints: [any, any, any]): void {
        this.requestDataFromUser(RequestEnum.ANGLE_IS_CONVEX, (data) => {
            const castedData = data as {angleIsConvex: boolean}
            this.createBisector(baseAnglePoints, castedData.angleIsConvex);
        });
    }

    private setSegmentsEquality(segment1Ends: [any, any], segment2Ends: [any, any]): void {
        this.boardScheme.addEqualSegments(segment1Ends[0], segment1Ends[1], segment2Ends[0], segment2Ends[1]);
        this.markEqualSegments([segment1Ends, segment2Ends]);
    }

    private setAnglesEquality(angle1Points: [any, any, any], angle2Points: [any, any, any]): void {
        this.boardScheme.addEqualAngles(angle1Points[0], angle1Points[1], angle1Points[2], angle2Points[0], angle2Points[1], angle2Points[2]);
        this.markEqualAngles([angle1Points, angle2Points]);
    }

    private createTangentLine(circle: any, point: any, noIntersectWithIds: string[] = []): any {
        const line = this.board.create('tangent', [circle, point], {
            strokeWidth: Sizes.STROKE_WIDTH,
            color: Colors.PRIMARY,
            highlightStrokeColor: Colors.SECONDARY
        });

        line.on('down', (event: any) => { this.handleLineClick(event, line); });
        //this.boardScheme.addTangentLine(line);
        noIntersectWithIds.forEach((id) => this.noIntersect.push([line.id, id]));
        this.createIntersectionPoints(line);

        return line;
    }

    private createTangentCircle(shape: any, point: any): any {
        if(isLine(shape)) { return this.createTangentCircleToLine(shape, point); }
        else if(isCircle(shape)) { return this.createTangentCircleToCircle(shape, point); }
        else { return null; }
    }

    private createTangentCircleToCircle(circle: any, circleCenter: any): any {
        const intersectionPoint = this.createPointFunCoord(function() {
            var projection = JXG.Math.Geometry.projectPointToCircle(circleCenter, circle);
            return projection.usrCoords;
        });

        const tangentCircle = this.createCircle(circleCenter, intersectionPoint);

        return tangentCircle;
    }

    private createTangentCircleToLine(line: any, circleCenter: any): any {
        const intersectionPoint = this.createPointFunCoord(function() {
            var projection = JXG.Math.Geometry.projectPointToLine(circleCenter, line);
            return projection.usrCoords;
        });

        const tangentCircle = this.createCircle(circleCenter, intersectionPoint);

        return tangentCircle;
    }

    private createCircumcircle(polygonPoints: any[]): any {
        // it works only for triangles
        /*
        const circle = this.board.create('circumcircle', [...polygonPoints.slice(0, 3)], { 
            fillColor: 'none',
            strokeWidth: Sizes.STROKE_WIDTH,
            strokeColor: Colors.PRIMARY,
            highlightStrokeColor: Colors.SECONDARY
        });

        circle.on('down', (event: any) => { this.handleCircleClick(event, circle); });
        this.boardScheme.addCircle(circle);
        this.createIntersectionPoints(circle);

        return circle;
        */

        // it works for triangles and regular polygons created with built-in functions
        // it does not verify whether it can be done
        const center = this.createPointFunCoord(function() {
            const centerCoords = JXG.Math.Geometry.circumcenter(...polygonPoints.slice(0, 3));
            return centerCoords.usrCoords;
        });

        const circle = this.createCircle(center, polygonPoints[0]);

        return circle;
    }

    private createIncircle(polygonPoints: any[]): any {
        // it works only for triangles
        /*
        const circle = this.board.create('incircle', [...polygonPoints.slice(0, 3)], { 
            fillColor: 'none',
            strokeWidth: Sizes.STROKE_WIDTH,
            strokeColor: Colors.PRIMARY,
            highlightStrokeColor: Colors.SECONDARY
        });

        circle.on('down', (event: any) => { this.handleCircleClick(event, circle); });
        this.boardScheme.addCircle(circle);
        this.createIntersectionPoints(circle);

        return circle;
        */

        // it works for triangles and regular polygons created with built-in functions
        // it does not verify whether it can be done
        const center = this.createPointFunCoord(function() {
            const bisector1Point = JXG.Math.Geometry.angleBisector(polygonPoints[0], polygonPoints[1], polygonPoints[2]);
            const bisector2Point = JXG.Math.Geometry.angleBisector(polygonPoints[1], polygonPoints[2], polygonPoints[3 % polygonPoints.length]);

            const centerCoords = JXG.Math.Geometry.meetSegmentSegment(
                polygonPoints[1].coords.usrCoords,
                bisector1Point.usrCoords,
                polygonPoints[2].coords.usrCoords,
                bisector2Point.usrCoords
            );
                
            return centerCoords[0];
        });
        
        var pointsOnSides: any[] = [];
        var noIntersectWith: string[] = [];

        const getSegment = (end1: any, end2: any): any => { 
            const sideSearch = this.boardScheme.getLineByPoints(end1.id, end2.id)
            if(sideSearch[0]) { return this.board.objects[sideSearch[1]]; }
            else { return this.createSegment(end1, end2); }
        }

        for(let i = 0; i < polygonPoints.length; i++) {
            pointsOnSides.push(this.createPointFunCoord(function() {
                const side = getSegment(polygonPoints[i], polygonPoints[(i+1)%polygonPoints.length]);
                noIntersectWith.push(side.id);
                const pointProjection = JXG.Math.Geometry.projectPointToLine(center, side);
                return pointProjection.usrCoords;
            }));        
        }

        const circle = this.createCircle(center, pointsOnSides[0], noIntersectWith);

        return circle;
    }

    private createEscribedCircle(trianglePoints: [any, any, any]): any {    
        const getBoardInstance = (): any => { return this; }
        
        const center = this.createPointFunCoord(function() {
            const rotatedPoint1 = {coords:JXG.Math.Geometry.rotation(trianglePoints[1], trianglePoints[0], Math.PI)};
            const rotatedPoint2 = {coords:JXG.Math.Geometry.rotation(trianglePoints[2], trianglePoints[0], Math.PI)};

            const bisector1Point = JXG.Math.Geometry.angleBisector(rotatedPoint1, trianglePoints[1], trianglePoints[2], getBoardInstance().board);
            const bisector2Point = JXG.Math.Geometry.angleBisector(rotatedPoint2, trianglePoints[2], trianglePoints[1], getBoardInstance().board);

            const centerCoords = JXG.Math.Geometry.meetSegmentSegment(
                trianglePoints[1].coords.usrCoords,
                bisector1Point.usrCoords,
                trianglePoints[2].coords.usrCoords,
                bisector2Point.usrCoords
            );
            
            return centerCoords[0];
        });

        var side: any;
        const segmentSearch: [boolean, string] = this.boardScheme.getLineByPoints(trianglePoints[1].id, trianglePoints[2].id);
        if(segmentSearch[0]) { side = this.board.objects[segmentSearch[1]]; }
        else { side = this.createSegment(trianglePoints[1], trianglePoints[2]); }

        const ray1 = this.createRay(trianglePoints[0], trianglePoints[1]);
        const ray2 = this.createRay(trianglePoints[0], trianglePoints[2]);

        const ray1SpotPoint = this.createPointFunCoord(function() {
            var projection = JXG.Math.Geometry.projectPointToLine(center, ray1);
            return projection.usrCoords
        });

        const ray2SpotPoint = this.createPointFunCoord(function() {
            var projection = JXG.Math.Geometry.projectPointToLine(center, ray2);
            return projection.usrCoords
        });

        const sideSpotPoint = this.createPointFunCoord(function() {
            var projection = JXG.Math.Geometry.projectPointToLine(center, side);
            return projection.usrCoords
        });

        const circle = this.createCircle(center, sideSpotPoint, [side.id, ray1.id, ray2.id]);

        return circle;
    }

    private createMedian(vertexPoint: any, basePoints: [any, any]): any {
        const pointOnBase = this.divideSegment(basePoints, 2);
        const median = this.createSegment(vertexPoint, pointOnBase[1]);

        return median;
    }

    private createAltitude(vertexPoint: any, basePoints: [any, any]): any {
        var line: any;
        const lineSearch: [boolean, string] = this.boardScheme.getLineByPoints(basePoints[0].id, basePoints[1].id);
        if(lineSearch[0]) { line = this.board.objects[lineSearch[1]]; }
        else { line = this.createSegment(basePoints[0], basePoints[1]); }

        const spotPoint = this.createPointFunCoord(function() {
            var projection = JXG.Math.Geometry.projectPointToLine(vertexPoint, line);
            return projection.usrCoords
        });

        const altitude = this.createSegment(vertexPoint, spotPoint);

        return altitude;
    }

    private createMidSegment(side1Points: [any, any], side2Points: [any, any]): any {
        const pointOn1Side = this.divideSegment(side1Points, 2);
        const pointOn2Side = this.divideSegment(side2Points, 2);
        const midSegment = this.createSegment(pointOn1Side[1], pointOn2Side[1]);

        return midSegment;
    }

    private cretaeTrianglePoints(vertex1: any, vertex2: any): [any, any, any] {
        // it creates isosceles triangle

        const guideLine = this.board.create('curve', [
            function(t: number) { 
                return t; 
            }, 
            function(t: number) { 
                const xMid = (xCoord(vertex1) + xCoord(vertex2)) / 2;
                const yMid = (yCoord(vertex1) + yCoord(vertex2)) / 2;
                
                const epsilon = 0.0000001;
                const dx: number = xCoord(vertex2) - xCoord(vertex1);
                const dy: number = yCoord(vertex2) - yCoord(vertex1);

                if(Math.abs(dx) < epsilon) { Math.sign(dx) * epsilon; }
                const a = dy / dx;
                const aPerpendicular = -1 / a;
                const bPerpendicular = yMid - aPerpendicular * xMid;

                return aPerpendicular * t + bPerpendicular; 
            }
        ], 
        {
            visible: false
        });
        
        const vertex3 = this.createSliderPoint(0, 0, guideLine);

        return [vertex1, vertex2, vertex3];
    }

    private createSquarePoints(vertex1: any, vertex2: any): [any, any, any, any] {
        const vertex3 = this.createPointFunCoord(function() {
            const dx = xCoord(vertex1) - xCoord(vertex2);
            const dy = yCoord(vertex1) - yCoord(vertex2);
            var newUsrCoords: [number, number, number] = [...vertex2.coords.usrCoords] as [number, number, number];
            newUsrCoords[1] += dy;
            newUsrCoords[2] -= dx;

            return newUsrCoords;
        });

        const vertex4 = this.createPointFunCoord(function() {
            const dx = xCoord(vertex1) - xCoord(vertex2);
            const dy = yCoord(vertex1) - yCoord(vertex2);
            var newUsrCoords: [number, number, number] = [...vertex1.coords.usrCoords] as [number, number, number];
            newUsrCoords[1] += dy;
            newUsrCoords[2] -= dx;

            return newUsrCoords;
        });

        return [vertex1, vertex2, vertex3, vertex4];
    }

    private createRectaglePoints(vertex1: any, vertex2: any): [any, any, any, any] {
        const guideLine = this.board.create('curve', [
            function(t: number) { 
                const dy = yCoord(vertex1) - yCoord(vertex2);
                return xCoord(vertex1) + t * dy; 
            }, 
            function(t: number) { 
                const dx = xCoord(vertex1) - xCoord(vertex2);
                return yCoord(vertex1) - t * dx; 
            }
        ], 
        {
            visible: false
        });

        const dx = xCoord(vertex1) - xCoord(vertex2);
        const dy = yCoord(vertex1) - yCoord(vertex2);
        const vertex3 = this.createSliderPoint(xCoord(vertex1) + dy, yCoord(vertex1) - dx, guideLine);

        const vertex4 = this.createPointFunCoord(function() {
            const dx = xCoord(vertex1) - xCoord(vertex3);
            const dy = yCoord(vertex1) - yCoord(vertex3);
            var newUsrCoords: [number, number, number] = [...vertex2.coords.usrCoords] as [number, number, number];
            newUsrCoords[1] -= dx;
            newUsrCoords[2] -= dy;

            return newUsrCoords;
        }); 

        return [vertex1, vertex2, vertex3, vertex4];
    }

    private createPolygonPoints(vertex1: any, vertex2: any, n: number): any[] {
        var vertices: any[] = [];
        vertices.push(vertex1);
        vertices.push(vertex2);

        const dalfa = (n-2) * Math.PI / n;
        for(let i = 2; i < n; i++) {
            vertices.push(this.createPointFunCoord(function() {
                const newPointCoords = JXG.Math.Geometry.rotation(vertices[i-1], vertices[i-2], dalfa);
                return newPointCoords.usrCoords;
            }));
        }

        return vertices;
    }

    private createPolygonPointsRequestData(vertex1: any, vertex2: any): void {
        this.requestDataFromUser(RequestEnum.POLYGON_SIDES_NUMBER, (data) => {
            const castedData = data as {sides: number};
            this.createPolygonPoints(vertex1, vertex2, castedData.sides);
        });
    }

    private createParallelogramPoints(vertex1: any, vertex2: any, vertex3: any): [any, any, any, any] {
        const vertex4 = this.createPointFunCoord(function() {
            const dx = xCoord(vertex3) - xCoord(vertex2);
            const dy = yCoord(vertex3) - yCoord(vertex2);
            var newUsrCoords: [number, number, number] = [...vertex1.coords.usrCoords] as [number, number, number];
            newUsrCoords[1] += dx;
            newUsrCoords[2] += dy;

            return newUsrCoords;
        });

        return [vertex1, vertex2, vertex3, vertex4];
    }

    private createKitePoints(vertex1: any, vertex2: any, vertex3: any): [any, any, any, any] {
        const vertex4 = this.createPointFunCoord(function() {
            const diagonalCross = JXG.Math.Geometry.projectCoordsToSegment(vertex2.coords.usrCoords, vertex1.coords.usrCoords, vertex3.coords.usrCoords);
            const dx = xCoord(vertex2) - diagonalCross[0][1];
            const dy = yCoord(vertex2) - diagonalCross[0][2];
           
            var newUsrCoords: [number, number, number] = [...vertex2.coords.usrCoords] as [number, number, number];
            newUsrCoords[1] -= 2 * dx;
            newUsrCoords[2] -= 2 * dy;

            return newUsrCoords;
        });

        return [vertex1, vertex2, vertex3, vertex4];
    }

    private createRhombusPoints(vertex1: any, vertex2: any): [any, any, any, any] {
        const guideLine = this.board.create('curve', [
            function(t: number) { 
                const r = distance(vertex1, vertex2);
                return xCoord(vertex2) + r * Math.cos(t); 
            }, 
            function(t: number) { 
                const r = distance(vertex1, vertex2);
                return yCoord(vertex2) + r * Math.sin(t); 
            }
        ], 
        {
            visible: false
        });

        const vertex3 = this.createSliderPoint(0, 0, guideLine);

        const vertex4 = this.createPointFunCoord(function() {
            const dx = xCoord(vertex3) - xCoord(vertex2);
            const dy = yCoord(vertex3) - yCoord(vertex2);
            var newUsrCoords: [number, number, number] = [...vertex1.coords.usrCoords] as [number, number, number];
            newUsrCoords[1] += dx;
            newUsrCoords[2] += dy;

            return newUsrCoords;
        });

        return [vertex1, vertex2, vertex3, vertex4];
    }

    private createTrapezoidPoints(vertex1: any, vertex2: any, vertex3: any): [any, any, any, any] {
        // it creates isosceles trapezoid
        // top base includes vertex1 and vertex2

        const vertex4 = this.createPointFunCoord(function() {
            const dx = xCoord(vertex3) - xCoord(vertex2);
            const dy = yCoord(vertex3) - yCoord(vertex2);
            var newUsrCoords: [number, number, number] = [...vertex1.coords.usrCoords] as [number, number, number];
            newUsrCoords[1] -= dx;
            newUsrCoords[2] += dy;

            return newUsrCoords;
        });

        return [vertex1, vertex2, vertex3, vertex4];
    }

    private setSegmentLength(segmentEnds: [any, any]): void {
        this.requestDataFromUser(RequestEnum.LENGTH, (data) => {
            const castedData = data as { length: string };
            this.boardScheme.setSegmentLength(segmentEnds[0], segmentEnds[1], castedData.length);
            this.showSegmentLength(segmentEnds[0], segmentEnds[1], castedData.length);
        });
    }

    private setAngleMeasure(anglePoints: [any, any, any]): void {
        this.requestDataFromUser(RequestEnum.MEASURE, (data) => {
            const castedData = data as { measure: string, angleIsConvex: boolean };
            this.boardScheme.setAngleMeasure(anglePoints[0], anglePoints[1], anglePoints[2], castedData.angleIsConvex, castedData.measure);
            this.showAngleMeasure(anglePoints[0], anglePoints[1], anglePoints[2], castedData.angleIsConvex, castedData.measure);
        });
    }

    private addFormula(): void {
        this.requestDataFromUser(RequestEnum.FORMULA, (data) => {
            const castedData = data as { formula: string };
            this.boardScheme.addFormula(castedData.formula);
            this.enteredFormulas.push(
                this.board.create('text', [
                    0, 0, castedData.formula], 
                    { fontSize: Sizes.TEXT_FONT }
                ));
            this.showFormulas();
        });
    }

    private addPerimeter(polygonPoints: any[]): void {
        this.requestDataFromUser(RequestEnum.PERIMETER, (data) => {
            const castedData = data as { perimeter: string };

            var pointNames = '';
            for(let i = 0; i < polygonPoints.length; i++) { pointNames += polygonPoints[i].name; }
            const formula = 'P(' + pointNames + ') = ' + castedData.perimeter;
            
            this.boardScheme.addFormula(formula);
            this.enteredFormulas.push(
                this.board.create('text', [
                    0, 0, formula], 
                    { fontSize: Sizes.TEXT_FONT }
                ));
            this.showFormulas();
        });
    }

    private addArea(polygonPoints: any[]): void {
        this.requestDataFromUser(RequestEnum.AREA, (data) => {
            const castedData = data as { area: string };

            var pointNames = '';
            for(let i = 0; i < polygonPoints.length; i++) { pointNames += polygonPoints[i].name; }
            const formula = 'A(' + pointNames + ') = ' + castedData.area;
            
            this.boardScheme.addFormula(formula);
            this.enteredFormulas.push(
                this.board.create('text', [
                    0, 0, formula], 
                    { fontSize: Sizes.TEXT_FONT }
                ));
            this.showFormulas();
        });
    }

    private showSegmentLength(point1: any, point2: any, value: string): void {
        const name = '|' + point1.name + point2.name + '| = ' + value;

        this.board.create('text', [
            (xCoord(point1) + xCoord(point2)) / 2, 
            (yCoord(point1) + yCoord(point2)) / 2,
            name
        ],
        { fontSize: Sizes.TEXT_FONT });
    }

    private showAngleMeasure(point1: any, point2: any, point3: any, isConvex: boolean, value: string): void {
        var name = '';
        if(isConvex) { name = '<|' + point1.name + point2.name + point3.name + '| = ' + value; }
        else { { name = '>|' + point1.name + point2.name + point3.name + '| = ' + value; } }

        this.board.create('text', [
            xCoord(point2), 
            yCoord(point2),
            name
        ],
        { fontSize: Sizes.TEXT_FONT });
    }

    private showFormulas(): void {
        const minX = this.board.getBoundingBox()[0];
        const maxY = this.board.getBoundingBox()[1];
        const zoomX = this.board.zoomX;
        const zoomY = this.board.zoomY;

        var x = minX + Sizes.FORMULAS_SECTION_HORIZONTAL_MARGIN / zoomX;
        var y = maxY - Sizes.FORMULAS_SECTION_VERTICAL_MARGIN / zoomY;

        for(let i = 0; i < this.enteredFormulas.length; i++) {
            this.enteredFormulas[i].setPositionDirectly(JXG.COORDS_BY_USER, [x, y]);
            y -= Sizes.FORMULAS_LINE_HEIGHT / zoomY;
        }
    }

    private drawPromptingShapes = (event: any): void => {
        this.promptingShapes.forEach((shape) => this.board.removeObject(shape));
        this.promptingShapes = [];

        if(event === null) { return; }

        const mouseCoords = this.board.getUsrCoordsOfMouse(event);

        /*
        const boundingbox = this.board.getBoundingBox();
        if(mouseCoords[0] < 0.98 * boundingbox[0]) {
            return;
        }
        if(mouseCoords[0] > 0.98 * boundingbox[2]) {
            return;
        }
        if(mouseCoords[1] > 0.98 * boundingbox[1]) {
            return;
        }
        if(mouseCoords[1] < 0.98 * boundingbox[3]) {
            return;
        }
        */

        if(this.action == ActionEnum.CREATE_SEGMENT && this.shapesAccumulator.length == 1) {
            this.promptingShapes.push(this.createPromptingSegment(this.shapesAccumulator[0], mouseCoords));
        }
        else if(this.action == ActionEnum.CREATE_LINE && this.shapesAccumulator.length == 1) {
            this.promptingShapes.push(this.createPromptingLine(this.shapesAccumulator[0], mouseCoords));
        }
        else if(this.action == ActionEnum.CREATE_RAY && this.shapesAccumulator.length == 1) {
            this.promptingShapes.push(this.createPromptingRay(this.shapesAccumulator[0], mouseCoords));
        }
        else if(this.action == ActionEnum.CREATE_CIRCLE && this.shapesAccumulator.length == 1) {
            this.promptingShapes.push(this.createPromptingCircle(this.shapesAccumulator[0], mouseCoords));
        }
        else if(this.action == ActionEnum.CREATE_PERPENDICULAR_LINE && this.shapesAccumulator.length == 1) {
            const point = this.createPromptingPoint(mouseCoords[0], mouseCoords[1]);
            this.promptingShapes.push(this.createPromptingPerpendicularLine(this.shapesAccumulator[0], point));
        }
        else if(this.action == ActionEnum.CREATE_PARALLEL_LINE && this.shapesAccumulator.length == 1) {
            const point = this.createPromptingPoint(mouseCoords[0], mouseCoords[1]);
            this.promptingShapes.push(this.createPromptingParallelLine(this.shapesAccumulator[0], point));
        }
    }

    private highlightShapes = (): void => {
        this.highlightedShapes.forEach((shape) => shape.setAttribute({strokeColor: Colors.PRIMARY}));
        this.highlightedShapes = [];

        this.shapesAccumulator.forEach((shape) => {
            shape.setAttribute({strokeColor: Colors.SECONDARY});
            this.highlightedShapes.push(shape);
        });
        this.board.update();
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
                if(Options.ALLOW_CREATING_POINTS_FOR_LINES_AND_CIRCLES_CREATING) {
                    if(this.shapesAccumulator.length == 1 && canBeCreated) { this.shapesAccumulator.push(this.createPoint(x, y)) }
                    else if(this.shapesAccumulator.length == 1) { this.shapesAccumulator.push(duplicationPoint); }
                }
                break;
            case ActionEnum.DIVIDE_SEGMENT:
            case ActionEnum.DIVIDE_ANGLE:
            case ActionEnum.CREATE_MID_PERPENDICULAR:
            case ActionEnum.CREATE_BISECTOR:
            case ActionEnum.SET_EQUAL_SEGMENTS:
            case ActionEnum.SET_EQUAL_ANGLES:
            case ActionEnum.CREATE_CIRCUMCIRCLE:
            case ActionEnum.CREATE_INCIRCLE:
            case ActionEnum.CREATE_ESCRIBED_CIRCLE:
            case ActionEnum.CREATE_MEDIAN:
            case ActionEnum.CREATE_ALTITUDE:
            case ActionEnum.CREATE_MID_SEGMENT:
            case ActionEnum.SET_SEGMENT_LENGHT:
            case ActionEnum.SET_ANGLE_MEASURE:
            case ActionEnum.SET_PERIMETER:
            case ActionEnum.SET_AREA:   
                if(Options.ALLOW_CREATING_POINTS_FOR_COMPLEX_CONSTRUCTIONS) {
                    if(canBeCreated) { this.shapesAccumulator.push(this.createPoint(x, y)); }
                    else { this.shapesAccumulator.push(duplicationPoint); }
                }     
                break;
            case ActionEnum.CREATE_TANGENT_LINE:
                break;
            case ActionEnum.CREATE_TANGENT_CIRCLE:
                if(Options.ALLOW_CREATING_POINTS_FOR_LINES_AND_CIRCLES_CREATING) {
                    if(this.shapesAccumulator.length == 1 && canBeCreated) { this.shapesAccumulator.push(this.createPoint(x, y)) }
                    else if(this.shapesAccumulator.length == 1) { this.shapesAccumulator.push(duplicationPoint); }
                }
                break;
            case ActionEnum.CREATE_TRIANGLE:
            case ActionEnum.CREATE_SQUARE:
            case ActionEnum.CREATE_RECTANGLE:
            case ActionEnum.CREATE_REGULAR_POLYGON:
            case ActionEnum.CREATE_PARALLELOGRAM:
            case ActionEnum.CREATE_KITE:
            case ActionEnum.CREATE_RHOMBUS:
            case ActionEnum.CREATE_TRAPEZOID:
                if(Options.ALLOW_CREATING_POINTS_FOR_POLYGONS_CREATING) {
                    if(canBeCreated) { this.shapesAccumulator.push(this.createPoint(x, y)); }
                    else { this.shapesAccumulator.push(duplicationPoint); }
                }
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
            case ActionEnum.DIVIDE_SEGMENT:
            case ActionEnum.DIVIDE_ANGLE:
            case ActionEnum.CREATE_MID_PERPENDICULAR:
            case ActionEnum.CREATE_BISECTOR:
            case ActionEnum.SET_EQUAL_SEGMENTS:
            case ActionEnum.SET_EQUAL_ANGLES:
            case ActionEnum.CREATE_CIRCUMCIRCLE:
            case ActionEnum.CREATE_INCIRCLE:
            case ActionEnum.CREATE_ESCRIBED_CIRCLE:
            case ActionEnum.CREATE_MEDIAN:
            case ActionEnum.CREATE_ALTITUDE:
            case ActionEnum.CREATE_MID_SEGMENT:
            case ActionEnum.SET_SEGMENT_LENGHT:
            case ActionEnum.SET_ANGLE_MEASURE:
            case ActionEnum.SET_PERIMETER:
            case ActionEnum.SET_AREA:
                this.shapesAccumulator.push(point);
                break;
            case ActionEnum.CREATE_TANGENT_LINE:
                if(this.shapesAccumulator.length == 1 && this.boardScheme.pointLiesOnCircle(this.shapesAccumulator[0].id, point.id)) { this.shapesAccumulator.push(point) }
                break;
            case ActionEnum.CREATE_TANGENT_CIRCLE:
                if(this.shapesAccumulator.length == 1) { this.shapesAccumulator.push(point) }
                break;
            case ActionEnum.CREATE_TRIANGLE:
            case ActionEnum.CREATE_SQUARE:
            case ActionEnum.CREATE_RECTANGLE:
            case ActionEnum.CREATE_REGULAR_POLYGON:
            case ActionEnum.CREATE_PARALLELOGRAM:
            case ActionEnum.CREATE_KITE:
            case ActionEnum.CREATE_RHOMBUS:
            case ActionEnum.CREATE_TRAPEZOID:
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
                else { return duplicationPoint; }
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
                if(Options.ALLOW_CREATING_POINTS_FOR_LINES_AND_CIRCLES_CREATING) {
                    if(this.shapesAccumulator.length == 0) { this.shapesAccumulator.push(line); }
                    else if(this.shapesAccumulator.length == 1 && canBeCreated) { this.shapesAccumulator.push(this.createGliderPoint(x, y, line)) }
                    else if(this.shapesAccumulator.length == 1) { this.shapesAccumulator.push(duplicationPoint); }
                }
                else {
                    if(this.shapesAccumulator.length == 0) { this.shapesAccumulator.push(line); }
                }
                break;
            case ActionEnum.DIVIDE_SEGMENT:
            case ActionEnum.DIVIDE_ANGLE:
            case ActionEnum.CREATE_MID_PERPENDICULAR:
            case ActionEnum.CREATE_BISECTOR:
            case ActionEnum.SET_EQUAL_SEGMENTS:
            case ActionEnum.SET_EQUAL_ANGLES:
            case ActionEnum.CREATE_CIRCUMCIRCLE:
            case ActionEnum.CREATE_INCIRCLE:
            case ActionEnum.CREATE_ESCRIBED_CIRCLE:
            case ActionEnum.CREATE_MEDIAN:
            case ActionEnum.CREATE_ALTITUDE:
            case ActionEnum.CREATE_MID_SEGMENT:
            case ActionEnum.SET_SEGMENT_LENGHT:
            case ActionEnum.SET_ANGLE_MEASURE:
            case ActionEnum.SET_PERIMETER:
            case ActionEnum.SET_AREA:    
                if(Options.ALLOW_CREATING_POINTS_FOR_COMPLEX_CONSTRUCTIONS) {        
                    if(canBeCreated) { this.shapesAccumulator.push(this.createGliderPoint(x, y, line)); }
                    else { this.shapesAccumulator.push(duplicationPoint); }
                }
                break;
            case ActionEnum.CREATE_TANGENT_LINE:
                break;
            case ActionEnum.CREATE_TANGENT_CIRCLE:
                if(Options.ALLOW_CREATING_POINTS_FOR_LINES_AND_CIRCLES_CREATING) {
                    if(this.shapesAccumulator.length == 0) { this.shapesAccumulator.push(line); }
                    else if(this.shapesAccumulator.length == 1) {
                        if(canBeCreated) { this.shapesAccumulator.push(this.createGliderPoint(x, y, line)); }
                        else { this.shapesAccumulator.push(duplicationPoint); }
                    }
                }
                break;
            case ActionEnum.CREATE_TRIANGLE:
            case ActionEnum.CREATE_SQUARE:
            case ActionEnum.CREATE_RECTANGLE:
            case ActionEnum.CREATE_REGULAR_POLYGON:
            case ActionEnum.CREATE_PARALLELOGRAM:
            case ActionEnum.CREATE_KITE:
            case ActionEnum.CREATE_RHOMBUS:
            case ActionEnum.CREATE_TRAPEZOID:
                if(Options.ALLOW_CREATING_POINTS_FOR_POLYGONS_CREATING) {
                    if(canBeCreated) { this.shapesAccumulator.push(this.createGliderPoint(x, y, line)); }
                    else { this.shapesAccumulator.push(duplicationPoint); }
                }
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
                if(canBeCreated) { this.createGliderPoint(x, y, circle); }
                else { return duplicationPoint; }
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
                if(Options.ALLOW_CREATING_POINTS_FOR_LINES_AND_CIRCLES_CREATING) {
                    if(this.shapesAccumulator.length == 1 && canBeCreated) { this.shapesAccumulator.push(this.createGliderPoint(x, y, circle)) }
                    else if(this.shapesAccumulator.length == 1) { this.shapesAccumulator.push(duplicationPoint); }
                }
                break;
            case ActionEnum.DIVIDE_SEGMENT:
            case ActionEnum.DIVIDE_ANGLE:
            case ActionEnum.CREATE_MID_PERPENDICULAR:
            case ActionEnum.CREATE_BISECTOR:
            case ActionEnum.SET_EQUAL_SEGMENTS:
            case ActionEnum.SET_EQUAL_ANGLES:
            case ActionEnum.CREATE_CIRCUMCIRCLE:
            case ActionEnum.CREATE_INCIRCLE:
            case ActionEnum.CREATE_ESCRIBED_CIRCLE:
            case ActionEnum.CREATE_MEDIAN:
            case ActionEnum.CREATE_ALTITUDE:
            case ActionEnum.CREATE_MID_SEGMENT:
            case ActionEnum.SET_SEGMENT_LENGHT:
            case ActionEnum.SET_ANGLE_MEASURE:
            case ActionEnum.SET_PERIMETER:
            case ActionEnum.SET_AREA:
                if(Options.ALLOW_CREATING_POINTS_FOR_COMPLEX_CONSTRUCTIONS) {
                    if(canBeCreated) { this.shapesAccumulator.push(this.createGliderPoint(x, y, circle)); }
                    else { this.shapesAccumulator.push(duplicationPoint); }
                }
                break;
            case ActionEnum.CREATE_TANGENT_LINE:
                if(Options.ALLOW_CREATING_POINTS_FOR_LINES_AND_CIRCLES_CREATING) {
                    if(this.shapesAccumulator.length == 0) { this.shapesAccumulator.push(circle); }
                    else if(this.shapesAccumulator.length == 1 && circle.id == this.shapesAccumulator[0].id) {
                        if(canBeCreated) { this.shapesAccumulator.push(this.createGliderPoint(x, y, circle)); }
                        else { this.shapesAccumulator.push(duplicationPoint); }
                    }
                }
                else {
                    if(this.shapesAccumulator.length == 0) { this.shapesAccumulator.push(circle); }
                }
                break;
            case ActionEnum.CREATE_TANGENT_CIRCLE:
                if(Options.ALLOW_CREATING_POINTS_FOR_LINES_AND_CIRCLES_CREATING) {
                    if(this.shapesAccumulator.length == 0) { this.shapesAccumulator.push(circle); }
                    else if(this.shapesAccumulator.length == 1) {
                        if(canBeCreated) { this.shapesAccumulator.push(this.createGliderPoint(x, y, circle)); }
                        else { this.shapesAccumulator.push(duplicationPoint); }
                    }
                }
                else {
                    if(this.shapesAccumulator.length == 0) { this.shapesAccumulator.push(circle); }
                }
                break;
            case ActionEnum.CREATE_TRIANGLE:
            case ActionEnum.CREATE_SQUARE:
            case ActionEnum.CREATE_RECTANGLE:
            case ActionEnum.CREATE_REGULAR_POLYGON:
            case ActionEnum.CREATE_PARALLELOGRAM:
            case ActionEnum.CREATE_KITE:
            case ActionEnum.CREATE_RHOMBUS:
            case ActionEnum.CREATE_TRAPEZOID:
                if(Options.ALLOW_CREATING_POINTS_FOR_POLYGONS_CREATING) {
                    if(canBeCreated) { this.shapesAccumulator.push(this.createGliderPoint(x, y, circle)); }
                    else { this.shapesAccumulator.push(duplicationPoint); }
                }
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
        switch(this.action) {
            case ActionEnum.NONE:
            case ActionEnum.CREATE_POINT:
                break;
            case ActionEnum.CREATE_SEGMENT:
                if(this.shapesAccumulator.length == 2) { 
                    this.createSegment(this.shapesAccumulator[0], this.shapesAccumulator[1]); 
                    this.shapesAccumulator = [];
                }
                break;
            case ActionEnum.CREATE_LINE:
                if(this.shapesAccumulator.length == 2) { 
                    this.createLine(this.shapesAccumulator[0], this.shapesAccumulator[1]); 
                    this.shapesAccumulator = [];
                }
                break;
            case ActionEnum.CREATE_RAY:
                if(this.shapesAccumulator.length == 2) { 
                    this.createRay(this.shapesAccumulator[0], this.shapesAccumulator[1]); 
                    this.shapesAccumulator = [];
                }
                break;
            case ActionEnum.CREATE_CIRCLE:
                if(this.shapesAccumulator.length == 2) { 
                    this.createCircle(this.shapesAccumulator[0], this.shapesAccumulator[1]); 
                    this.shapesAccumulator = [];
                }
                break;
            case ActionEnum.CREATE_PERPENDICULAR_LINE:
                if(this.shapesAccumulator.length == 2) { 
                    this.createPerpendicularLine(this.shapesAccumulator[0], this.shapesAccumulator[1]); 
                    this.shapesAccumulator = [];
                }
                break;
            case ActionEnum.CREATE_PARALLEL_LINE:
                if(this.shapesAccumulator.length == 2) { 
                    this.createParallelLine(this.shapesAccumulator[0], this.shapesAccumulator[1]); 
                    this.shapesAccumulator = [];
                }
                break;
            case ActionEnum.DIVIDE_SEGMENT:
                if(this.shapesAccumulator.length == 2) { 
                    this.divideSegmentRequestData([this.shapesAccumulator[0], this.shapesAccumulator[1]]); 
                    this.shapesAccumulator = [];
                }
                break;
            case ActionEnum.DIVIDE_ANGLE:
                if(this.shapesAccumulator.length == 3) { 
                    this.divideAngleRequestData([this.shapesAccumulator[0], this.shapesAccumulator[1], this.shapesAccumulator[2]]); 
                    this.shapesAccumulator = [];
                }
                break;
            case ActionEnum.CREATE_MID_PERPENDICULAR:
                if(this.shapesAccumulator.length == 2) { 
                    this.createMidPerpendicular([this.shapesAccumulator[0], this.shapesAccumulator[1]]); 
                    this.shapesAccumulator = [];
                }
                break;
            case ActionEnum.CREATE_BISECTOR:
                if(this.shapesAccumulator.length == 3) { 
                    this.createBisectorRequestData([this.shapesAccumulator[0], this.shapesAccumulator[1], this.shapesAccumulator[2]]); 
                    this.shapesAccumulator = [];
                }
                break;
            case ActionEnum.SET_EQUAL_SEGMENTS:
                if(this.shapesAccumulator.length == 4) { 
                    this.setSegmentsEquality([this.shapesAccumulator[0], this.shapesAccumulator[1]], [this.shapesAccumulator[2], this.shapesAccumulator[3]]); 
                    this.shapesAccumulator = [];
                }
                break;
            case ActionEnum.SET_EQUAL_ANGLES:
                if(this.shapesAccumulator.length == 6) { 
                    this.setAnglesEquality([this.shapesAccumulator[0], this.shapesAccumulator[1], this.shapesAccumulator[2]], [this.shapesAccumulator[3], this.shapesAccumulator[4], this.shapesAccumulator[5]]); 
                    this.shapesAccumulator = [];
                }
                break;
            case ActionEnum.CREATE_TANGENT_LINE:
                if(this.shapesAccumulator.length == 2) { 
                    this.createTangentLine(this.shapesAccumulator[0], this.shapesAccumulator[1]); 
                    this.shapesAccumulator = [];
                }    
                break;
            case ActionEnum.CREATE_TANGENT_CIRCLE:
                if(this.shapesAccumulator.length == 2) { 
                    this.createTangentCircle(this.shapesAccumulator[0], this.shapesAccumulator[1]); 
                    this.shapesAccumulator = [];
                }
                break; 
            case ActionEnum.CREATE_CIRCUMCIRCLE:
                if(this.pointsRecur(this.shapesAccumulator)) { 
                    this.createCircumcircle(this.shapesAccumulator.slice(0, this.shapesAccumulator.length - 1)); 
                    this.shapesAccumulator = [];
                }
                break;
            case ActionEnum.CREATE_INCIRCLE:
                if(this.pointsRecur(this.shapesAccumulator)) { 
                    this.createIncircle(this.shapesAccumulator.slice(0, this.shapesAccumulator.length - 1));  
                    this.shapesAccumulator = [];
                }
                break;
            case ActionEnum.CREATE_ESCRIBED_CIRCLE:
                if(this.shapesAccumulator.length == 3) { 
                    this.createEscribedCircle([this.shapesAccumulator[0], this.shapesAccumulator[1], this.shapesAccumulator[2]]); 
                    this.shapesAccumulator = [];
                } 
                break;    
            case ActionEnum.CREATE_MEDIAN:
                if(this.shapesAccumulator.length == 3) { 
                    this.createMedian(this.shapesAccumulator[0], [this.shapesAccumulator[1], this.shapesAccumulator[2]]); 
                    this.shapesAccumulator = [];
                }
                break;
            case ActionEnum.CREATE_ALTITUDE:
                if(this.shapesAccumulator.length == 3) { 
                    this.createAltitude(this.shapesAccumulator[0], [this.shapesAccumulator[1], this.shapesAccumulator[2]]); 
                    this.shapesAccumulator = [];
                }
                break;
            case ActionEnum.CREATE_MID_SEGMENT:
                if(this.shapesAccumulator.length == 4) {
                    this.createMidSegment([this.shapesAccumulator[0], this.shapesAccumulator[1]], [this.shapesAccumulator[2], this.shapesAccumulator[3]]); 
                    this.shapesAccumulator = [];
                }
                break;
            case ActionEnum.SET_SEGMENT_LENGHT:
                if(this.shapesAccumulator.length == 2) { 
                    this.setSegmentLength([this.shapesAccumulator[0], this.shapesAccumulator[1]]); 
                    this.shapesAccumulator = [];
                }
                break;
            case ActionEnum.SET_ANGLE_MEASURE:
                if(this.shapesAccumulator.length == 3) { 
                    this.setAngleMeasure([this.shapesAccumulator[0], this.shapesAccumulator[1], this.shapesAccumulator[2]]); 
                    this.shapesAccumulator = [];
                }
                break;
            case ActionEnum.ENTER_FORMULA:
                break;
            case ActionEnum.SET_PERIMETER:
                if(this.pointsRecur(this.shapesAccumulator)) { 
                    this.addPerimeter(this.shapesAccumulator.slice(0, this.shapesAccumulator.length - 1)); 
                    this.shapesAccumulator = [];
                }
                break;
            case ActionEnum.SET_AREA:
                if(this.pointsRecur(this.shapesAccumulator)) { 
                    this.addArea(this.shapesAccumulator.slice(0, this.shapesAccumulator.length - 1)); 
                    this.shapesAccumulator = [];
                }
                break;
            case ActionEnum.CREATE_TRIANGLE:
                if(this.shapesAccumulator.length == 2) {
                    this.cretaeTrianglePoints(this.shapesAccumulator[0], this.shapesAccumulator[1]);
                    this.shapesAccumulator = [];
                }
                break;
            case ActionEnum.CREATE_SQUARE:
                if(this.shapesAccumulator.length == 2) {
                    this.createSquarePoints(this.shapesAccumulator[0], this.shapesAccumulator[1]);
                    this.shapesAccumulator = [];
                }
                break;
            case ActionEnum.CREATE_RECTANGLE:
                if(this.shapesAccumulator.length == 2) {
                    this.createRectaglePoints(this.shapesAccumulator[0], this.shapesAccumulator[1]);
                    this.shapesAccumulator = [];
                }
                break;
            case ActionEnum.CREATE_REGULAR_POLYGON:
                if(this.shapesAccumulator.length == 2) {
                    this.createPolygonPointsRequestData(this.shapesAccumulator[0], this.shapesAccumulator[1]);
                    this.shapesAccumulator = [];
                }
                break;
            case ActionEnum.CREATE_PARALLELOGRAM:
                if(this.shapesAccumulator.length == 3) {
                    this.createParallelogramPoints(this.shapesAccumulator[0], this.shapesAccumulator[1], this.shapesAccumulator[2]);
                    this.shapesAccumulator = [];
                }
                break;
            case ActionEnum.CREATE_KITE:
                if(this.shapesAccumulator.length == 3) {
                    this.createKitePoints(this.shapesAccumulator[0], this.shapesAccumulator[1], this.shapesAccumulator[2]);
                    this.shapesAccumulator = [];
                }
                break;
            case ActionEnum.CREATE_RHOMBUS:
                if(this.shapesAccumulator.length == 2) {
                    this.createRhombusPoints(this.shapesAccumulator[0], this.shapesAccumulator[1]);
                    this.shapesAccumulator = [];
                }
                break;
            case ActionEnum.CREATE_TRAPEZOID:
                if(this.shapesAccumulator.length == 3) {
                    this.createTrapezoidPoints(this.shapesAccumulator[0], this.shapesAccumulator[1], this.shapesAccumulator[2]);
                    this.shapesAccumulator = [];
                }
                break;
        }

        this.highlightShapes();
    }

    private pointsRecur(points: any[]): boolean {
        const lastPointId = points[points.length - 1].id;

        return points.filter((point) => point.id == lastPointId).length > 1;
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

        this.board.update();
    }
};