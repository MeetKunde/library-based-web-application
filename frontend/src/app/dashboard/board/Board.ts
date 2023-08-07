import { ActionEnum } from "./ActionEnum";
import { BoardScheme } from "./BoardScheme";
import { Colors, Naming, Sizes } from "./Config";
import { distance, isCircle, isIntersectionPoint, isLine, isPoint } from "./Utils";

declare const JXG: any 

export class Board {
    private board: any;
    private action: ActionEnum;
    private shapeClicked: boolean;
    private shapesAccumulator: any[];

    private capitalLettersCounter = 0;
    private lowercaseLettersCounter = 0;

    private boardScheme: BoardScheme;

    constructor(boardId: string, bounds: [number, number, number, number], showAxis: boolean) {
        this.board = JXG.JSXGraph.initBoard(boardId, {boundingbox: bounds, axis: showAxis, keepAspectRatio: true});
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
        this.action = action;   
        this.shapesAccumulator = [];
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
        this.boardScheme.addGlider(point);
        this.boardScheme.addPointToShape(shape, point);

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
        this.createIntersectionPoints(segment);
        this.boardScheme.addSegment(segment);
        
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
        this.createIntersectionPoints(ray);
        this.boardScheme.addRay(ray);

        return ray;
    }

    private createLine(point1: any, point2: any): any {
        const line = this.board.create('line', [point1, point2], {
            strokeWidth: Sizes.STROKE_WIDTH,
            color: Colors.PRIMARY,
            highlightStrokeColor: Colors.SECONDARY
        });

        line.on('down', (event: any) => { this.handleLineClick(event, line); });
        this.createIntersectionPoints(line);
        this.boardScheme.addLine(line);

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
        this.createIntersectionPoints(circle);
        this.boardScheme.addCircle(circle);

        return circle;
    }

    private createIntersectionPoint(x: number, y: number, shape1: any, shape2: any, i1: number, i2: number): any {
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
        point.makeIntersection(shape1, shape2, i1, i2);
        this.boardScheme.addIntersection(point);
        this.boardScheme.addPointToShape(shape1, point);
        this.boardScheme.addPointToShape(shape2, point);
        
        return point;
    }

    private createIntersectionPoints(shape: any): void {
        for(let el in this.board.objects) {
            var obj = this.board.objects[el];

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

        this.createIntersectionPoints(line);

        return line;
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
                default:
                    return;
            }

            this.shapesAccumulator = [];
        }
        else if(this.shapesAccumulator.length == 3) {
            
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
        for(let el in this.board.objects) {
            if(JXG.isPoint(this.board.objects[el]) && this.board.objects[el].hasPoint(coords.usrCoords[1], coords.usrCoords[2])) {
                canBeCreated = false;
                duplication = this.board.objects[el];
                break;
            }
        }

        return [coords.usrCoords[1], coords.usrCoords[2], canBeCreated, duplication];
    }

    private correctIntersectionPoints(): any {
        var intersectionPoints: any[] = [];
        var nonIntersectionPoints: any[] = [];

        for(let el in this.board.objects) {
            const obj = this.board.objects[el];

            if(isPoint(obj) && obj.getAttribute('visible')) {
                nonIntersectionPoints.push(obj);
            }

            if(isIntersectionPoint(obj)) {
                intersectionPoints.push(obj);
            }
        }

        for(const ip of intersectionPoints) {
            var newOpacity = 1;
            for(const nip of nonIntersectionPoints) {
                const dist = distance(ip, nip);
                
                if(dist < 1 || Number.isNaN(dist)) {
                    newOpacity = 0;
                    break;
                }
            }

            ip.setAttribute({ opacity: newOpacity });
            ip.setAttribute({ highlightStrokeOpacity: newOpacity });
            ip.label.setAttribute({ opacity: newOpacity });
            ip.label.setAttribute({ highlightStrokeOpacity: newOpacity });
        }
    }
};