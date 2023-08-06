import { ActionEnum } from "./ActionEnum";
import { BoardScheme } from "./BoardScheme";

declare const JXG: any 

export class Board {
    private static PRIMARY_COLOR = '#2C3C5B';
    private static SECONDARY_COLOR = '#0AC5A8';
    private static STROKE_WIDTH = 3;
    private static POINT_SIZE = 2;

    private static CAPITAL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUWVXYZ';
    private static CAPITAL_LETTERS_SIZE = Board.CAPITAL_LETTERS.length;
    private static LOWERCASE_LETTERS = 'abcdefghijklmnopqrstuwvxyz';
    private static LOWERCASE_LETTERS_SIZE = Board.LOWERCASE_LETTERS.length;

    private static capitalLettersCounter = 0;
    private static lowercaseLettersCounter = 0;

    private static shapesAccumlator: any[];

    private static board: any;
    private static action: ActionEnum;
    private static shapeClicked: boolean;

    private static boardScheme: BoardScheme;

    private constructor() { }

    static initialize(boardId: string, bounds: [number, number, number, number], showAxis: boolean) {
        Board.board = JXG.JSXGraph.initBoard(boardId, {boundingbox: bounds, axis: showAxis, keepAspectRatio: true});
        Board.board.on('down', Board.handleBoardClick);
        Board.board.on('update', Board.correctIntersectionPoints);

        Board.action = ActionEnum.NONE;
        Board.shapeClicked = false;

        Board.capitalLettersCounter = 0;
        Board.lowercaseLettersCounter = 0;

        Board.shapesAccumlator = [];

        /*
        var p1 = Board.board.create('point', [-1, 4])
        var p2 = Board.board.create('point', [4, 1])
        var p3 = Board.board.create('point', [-2, -3])

        var li1 = Board.board.create('line', [p1, p2], {strokeColor:'black', lastArrow:true})
        var li2 = Board.board.create('line', [p1, p3], {lastArrow:true})

        var a1 = Board.board.create('angle', [p2, p1, p3], { radius:1 });
        //a2 = Board.board.create('angle', [li1, li2, 1, -1], { radius:2 });


        a1.setAngle(function() {
            return Math.PI * 90.0 / 180.0;
        });
        Board.board.update(); // This is necessary
        */
        
        const p1 = Board.board.create('point', [0, 0]);
        const p2 = Board.board.create('point', [-30, -10]);
        const p3 = Board.board.create('point', [-10, 50]);

        const s1 = Board.createSegment(p1, p2);
        const s2 = Board.createSegment(p1, p2);
        console.log(Board.board.objects)
        
    }

    static setAction(action: ActionEnum): void {
        Board.action = action;   
        Board.shapesAccumlator = [];
    }

    static getAction(): ActionEnum {
        return Board.action;
    }

    static changeAction(action: ActionEnum): boolean {
        if(Board.action == action) {
            Board.setAction(ActionEnum.NONE);
            return false;
        }
        else {
            Board.setAction(action);
            return true;
        }
    }

    private static getNextCapitalLetter(): string {
        Board.capitalLettersCounter++;

        if(Board.capitalLettersCounter <= Board.CAPITAL_LETTERS_SIZE) {
            return Board.CAPITAL_LETTERS[(Board.capitalLettersCounter - 1)];
        }
        else {
            const k = (Board.capitalLettersCounter - 1) % Board.CAPITAL_LETTERS_SIZE;
            const l = (Board.capitalLettersCounter - 1) / Board.CAPITAL_LETTERS_SIZE;
            return Board.CAPITAL_LETTERS[k] + '\''.repeat(l);
        }        
    }

    private static getNextLowercaseLetter(): string {
        Board.lowercaseLettersCounter++;

        if(Board.lowercaseLettersCounter <= Board.LOWERCASE_LETTERS_SIZE) {
            return Board.LOWERCASE_LETTERS[(Board.lowercaseLettersCounter - 1)];
        }
        else {
            const k = (Board.lowercaseLettersCounter - 1) % Board.LOWERCASE_LETTERS_SIZE;
            const l = (Board.lowercaseLettersCounter - 1) / Board.LOWERCASE_LETTERS_SIZE;
            return Board.LOWERCASE_LETTERS[k] + '\''.repeat(l);
        }  
    }       

    private static createPoint(x: number, y: number): any {
        const point = Board.board.create('point', [x, y], { 
            name: Board.getNextCapitalLetter(), 
            label: {fixed:false},
            size: Board.POINT_SIZE,
            color: Board.PRIMARY_COLOR,
            highlightFillColor: Board.SECONDARY_COLOR,
            highlightStrokeColor: Board.SECONDARY_COLOR,
            showInfobox: false
        });

        point.on('down', (event: any) => { event.stopPropagation(); Board.handleShapeClick(event, point); });
        Board.board.update();

        return point;
    }

    private static createGliderPoint(x: number, y: number, shape: any): any {
        const point = Board.board.create('glider', [x, y, shape], {
            name: Board.getNextCapitalLetter(), 
            label: {fixed:false},
            size: Board.POINT_SIZE,
            color: Board.PRIMARY_COLOR,
            highlightFillColor: Board.SECONDARY_COLOR,
            highlightStrokeColor: Board.SECONDARY_COLOR,
            showInfobox: false
        });

        point.on('down', (event: any) => { Board.handleShapeClick(event, point); });
        Board.board.update();

        return point;
    }

    private static createSegment(point1: any, point2: any): any {
        const segment = Board.board.create('line', [point1, point2], {
            straightFirst: false,
            straightLast: false,
            strokeWidth: Board.STROKE_WIDTH,
            color: Board.PRIMARY_COLOR,
            highlightStrokeColor: Board.SECONDARY_COLOR
        });

        segment.on('down', (event: any) => { Board.handleShapeClick(event, segment); });

        Board.solveCollisions(segment);
        
        return segment;
    }

    private static createRay(point1: any, point2: any): any {
        const ray = Board.board.create('line', [point1, point2], { 
            straightFirst: false,
            strokeWidth: Board.STROKE_WIDTH,
            color: Board.PRIMARY_COLOR,
            highlightStrokeColor: Board.SECONDARY_COLOR
        });

        ray.on('down', (event: any) => { Board.handleShapeClick(event, ray); });

        Board.solveCollisions(ray);

        return ray;
    }

    private static createLine(point1: any, point2: any): any {
        const line = Board.board.create('line', [point1, point2], {
            strokeWidth: Board.STROKE_WIDTH,
            color: Board.PRIMARY_COLOR,
            highlightStrokeColor: Board.SECONDARY_COLOR
        });

        line.on('down', (event: any) => { Board.handleShapeClick(event, line); });

        Board.solveCollisions(line);

        return line;
    }

    private static createCircle(point1: any, point2: any): any {
        const circle = Board.board.create('circle', [point1, point2], { 
            fillColor: 'none',
            strokeWidth: Board.STROKE_WIDTH,
            strokeColor: Board.PRIMARY_COLOR,
            highlightStrokeColor: Board.SECONDARY_COLOR
        });

        circle.on('down', (event: any) => { Board.handleShapeClick(event, circle); });

        Board.solveCollisions(circle);

        return circle;
    }

    private static createPerpendicularLine(baseLine: any, basePoint: any): any {
        const line = Board.board.create('perpendicular', [baseLine, basePoint], {
            strokeWidth: Board.STROKE_WIDTH,
            color: Board.PRIMARY_COLOR,
            highlightStrokeColor: Board.SECONDARY_COLOR
        });

        line.on('down', (event: any) => { Board.handleShapeClick(event, line); });

        Board.solveCollisions(line);

        return line;
    }

    private static createParallelLine(baseLine: any, basePoint: any): any {
        const line = Board.board.create('parallel', [baseLine, basePoint], {
            strokeWidth: Board.STROKE_WIDTH,
            color: Board.PRIMARY_COLOR,
            highlightStrokeColor: Board.SECONDARY_COLOR
        });

        line.on('down', (event: any) => { Board.handleShapeClick(event, line); });

        Board.solveCollisions(line);

        return line;
    }

    private static divideSegment(point1: any, point2: any, n: number): any[] {
        const coords1 = [point1.coords.usrCoords[1], point1.coords.usrCoords[2]]; 
        const coords2 = [point2.coords.usrCoords[1], point2.coords.usrCoords[2]]; 

        return [];
    }

    private static divideAngle(point1: any, point2: any, point3: any, n: number): any[] {

        return [];
    }

    private static createMidPerpendicular(point1: any, point2: any): any {
        const midPoint = Board.divideSegment(point1, point2, 2)[1];
        
        return this.createPerpendicularLine
    }   

    private static handleBoardClick(event: any): void {
        if(!Board.shapeClicked) {
            event.stopPropagation();
            Board.handleClick(event, undefined, (x: number, y: number) => {
                return Board.createPoint(x, y);
            });
        }
        Board.shapeClicked = false;
    }

    private static handleShapeClick(event: any, shape: any): void {
        if(!Board.shapeClicked) {
            Board.shapeClicked = true;
            event.stopPropagation();

            if(shape.elementClass === JXG.OBJECT_CLASS_POINT) {
                Board.handleClick(event, shape, (x: number, y: number) => {
                    return shape;
                });
            }
            else {
                Board.handleClick(event, shape, (x: number, y: number) => {
                    return Board.createGliderPoint(x, y, shape);
                });
            }
        }
    }

    private static handleClick(event: any, shape: any | undefined, createPoint: (x: number, y: number) => any): any { //
        const coords = Board.getCoords(event);
        const x = coords[0];
        const y = coords[1];
        const canBeCreated = coords[2];
        const duplicationPoint = coords[3];

        if(Board.action == ActionEnum.CREATE_POINT) {
            if(canBeCreated) {
                createPoint(x, y);
            }
        }
        else if(Board.action == ActionEnum.CREATE_SEGMENT || 
            Board.action == ActionEnum.CREATE_RAY || 
            Board.action == ActionEnum.CREATE_LINE || 
            Board.action == ActionEnum.CREATE_CIRCLE ||
            Board.action == ActionEnum.CREATE_MID_PERPENDICULAR) {

            if(canBeCreated) {
                const point = createPoint(x, y);
                Board.shapesAccumlator.push(point);
            }
            else {
                Board.shapesAccumlator.push(duplicationPoint);
            }

            if(Board.shapesAccumlator.length == 2) {
                switch(Board.action) {
                    case ActionEnum.CREATE_SEGMENT:
                        Board.createSegment(Board.shapesAccumlator[0], Board.shapesAccumlator[1]);
                        break;
                    case ActionEnum.CREATE_RAY:
                        Board.createRay(Board.shapesAccumlator[0], Board.shapesAccumlator[1]);
                        break;
                    case ActionEnum.CREATE_LINE:
                        Board.createLine(Board.shapesAccumlator[0], Board.shapesAccumlator[1]);
                        break;
                    case ActionEnum.CREATE_CIRCLE:
                        Board.createCircle(Board.shapesAccumlator[0], Board.shapesAccumlator[1]);
                        break;
                    case ActionEnum.CREATE_MID_PERPENDICULAR:

                    default:
                        // unreachable
                        break;
                }
                Board.shapesAccumlator = [];
            }
        }
        else if(Board.action == ActionEnum.CREATE_PERPENDICULAR_LINE || 
            Board.action == ActionEnum.CREATE_PARALLEL_LINE) {

            if(shape !== undefined && shape.elType == 'line') {
                if(Board.shapesAccumlator.length == 0) {
                    Board.shapesAccumlator.push(shape);
                }
                //else if(Board.shapesAccumlator.length == 1) {
                //    Board.shapesAccumlator[0] = shape;
                //}
            }
            else if(Board.shapesAccumlator.length == 1) {
                Board.shapesAccumlator.push(createPoint(x, y));
            }

            if(Board.shapesAccumlator.length == 2) {
                switch(Board.action) {
                    case ActionEnum.CREATE_PERPENDICULAR_LINE:
                        Board.createPerpendicularLine(Board.shapesAccumlator[0], Board.shapesAccumlator[1]);
                        break;
                    case ActionEnum.CREATE_PARALLEL_LINE:
                        Board.createParallelLine(Board.shapesAccumlator[0], Board.shapesAccumlator[1]);
                        break;
                    default:
                        // unreachable
                        break;
                }
                Board.shapesAccumlator = [];
            }
        }
    }

    private static pointExist(usrCoords: [s: number, x: number, y: number]): [canCreate: boolean, duplication: any] {
        var exist = false;
        var duplication = undefined;
        for(let el in Board.board.objects) {
            if(JXG.isPoint(Board.board.objects[el]) && Board.board.objects[el].hasPoint(usrCoords[1], usrCoords[2])) {
                exist = true;
                duplication = Board.board.objects[el];
                break;
            }
        }

        return [exist, duplication];
    }

    private static getCoords(event: any): [x: number, y: number, canCreate: boolean, duplication: any] {
        var fingerIndex = undefined;
        if(event[JXG.touchProperty]) {
            fingerIndex = 0;
        }

        var pos = Board.board.getMousePosition(event, fingerIndex);
        var coords = new JXG.Coords(JXG.COORDS_BY_SCREEN, pos, Board.board);

        var searchResult = Board.pointExist(coords.usrCoords);

        return [coords.usrCoords[1], coords.usrCoords[2], !searchResult[0], searchResult[1]];
    }

    private static solveCollisions(shape: any): void {
        for(let idx in Board.board.objects) {
            var el = Board.board.objects[idx];

            if(el.id == shape.id) {
                continue;
            }

            if(el.elType == 'line' || el.elType == 'circle') {
                const point1 = JXG.Math.Geometry.meet(shape.stdform, el.stdform, 0, Board.board);
                const point2 = JXG.Math.Geometry.meet(shape.stdform, el.stdform, 1, Board.board);

                const intersection1 = Board.createPoint(point1.usrCoords[1], point1.usrCoords[2]);
                intersection1.makeIntersection(shape, el, 0, 0);

                if(el.elType == 'circle' || shape.elType == 'circle') {
                    const intersection2 =  Board.createPoint(point2.usrCoords[1], point2.usrCoords[2]);  
                    intersection2.makeIntersection(shape, el, 1, 1); 
                }               
            }
        }

        Board.board.update();
    }

    private static correctIntersectionPoints(): any {
        var intersectionPoints: any[] = [];
        var nonIntersectionPoints: any[] = [];

        for(let el in Board.board.objects) {
            const point = Board.board.objects[el];

            if((point.elType == 'point' || point.elType == 'glider') && point.getAttribute('visible')) {
                nonIntersectionPoints.push(point);
            }

            if(point.elType == 'intersection') {
                intersectionPoints.push(point);
            }
        }

        for(const ip of intersectionPoints) {
            var newOpacity = 1;
            for(const nip of nonIntersectionPoints) {
                const dist = Board.distance(ip, nip);
                
                if(dist < 1 || Number.isNaN(dist)) {
                    newOpacity = 0;
                    break;
                }
            }

            ip.setAttribute({ opacity: newOpacity });
            ip.label.setAttribute({ opacity: newOpacity });
        }
    }

    private static distance(point1: any, point2: any): number {
        const dx = point1.coords.usrCoords[1] - point2.coords.usrCoords[1];
        const dy = point1.coords.usrCoords[2] - point2.coords.usrCoords[2];

        return Math.sqrt(dx * dx + dy * dy);
    }
};