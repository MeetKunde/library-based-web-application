import { ActionEnum } from "./ActionEnum";

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
    
    private static points: any[] = [];
    private static segments: any[] = [];
    private static lines: any[] = [];
    private static rays: any[] = [];
    private static circles: any[] = [];

    private static shapesAccumlator: any[];

    private static board: any;
    private  static action: ActionEnum;

    private constructor() { }

    static initialize(boardId: string, bounds: [number, number, number, number], showAxis: boolean) {
        Board.board = JXG.JSXGraph.initBoard(boardId, {boundingbox: bounds, axis: showAxis, keepAspectRatio: true});
        Board.board.on('down', Board.handleBoardClick);
        Board.action = ActionEnum.NONE;

        Board.capitalLettersCounter = 0;
        Board.lowercaseLettersCounter = 0;

        Board.points = [];
        Board.segments = [];
        Board.lines = [];
        Board.rays = [];
        Board.circles = [];

        const p1 = Board.createPoint(50, 50);
        const p2 = Board.createPoint(30, 30);
        const p3 = Board.createPoint(20, 10);
        const p4 = Board.createPoint(0, 20);
        const s1 = Board.createSegment(p1, p2);
        const s2 = Board.createSegment(p3, p4);

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
            label:{fixed:false},
            size: Board.POINT_SIZE,
            color: Board.PRIMARY_COLOR,
            highlightFillColor: Board.SECONDARY_COLOR,
            highlightStrokeColor: Board.SECONDARY_COLOR,
            showInfobox: false
        });

        Board.points.push(point);

        return point;
    }

    private static createSegment(point1: any, point2: any): any {
        const segment = Board.board.create('segment', [point1, point2], {
            strokeWidth: Board.STROKE_WIDTH,
            color: Board.PRIMARY_COLOR,
            highlightStrokeColor: Board.SECONDARY_COLOR
        });

        segment.needsRegularUpdate = true;
        segment.on('down', function(event: any) {
            var fingerIndex = 0;
            var coords = Board.getMouseCoords(event, fingerIndex);
            console.log(coords);
            const point = Board.createPoint(coords.scrCoords[1], coords.scrCoords[2]);
            segment.addPoint(point);
        //addPointToSegment(segment, [coords.usrCoords[1], coords.usrCoords[2]]);
        });

        Board.segments.push(segment);

        return segment;
    }

    private static createRay(point1: any, point2: any): any {
        const ray = Board.board.create('line', [point1, point2], { 
            straightFirst: false,
            strokeWidth: Board.STROKE_WIDTH,
            color: Board.PRIMARY_COLOR,
            highlightStrokeColor: Board.SECONDARY_COLOR
        });

        Board.rays.push(ray);

        return ray;
    }

    private static createLine(point1: any, point2: any): any {
        const line = Board.board.create('line', [point1, point2], {
            strokeWidth: Board.STROKE_WIDTH,
            color: Board.PRIMARY_COLOR,
            highlightStrokeColor: Board.SECONDARY_COLOR
        });

        Board.lines.push(line);

        return line;
    }

    private static createCircle(point1: any, point2: any): any {
        const circle = Board.board.create('circle', [point1, point2], { 
            fillColor: 'none',
            strokeWidth: Board.STROKE_WIDTH,
            strokeColor: Board.PRIMARY_COLOR,
            highlightStrokeColor: Board.SECONDARY_COLOR
        });

        Board.circles.push(circle);

        return circle;
    }

    private static getMouseCoords(event: any, fingerIndex: any): any {
        var pos = Board.board.getMousePosition(event, fingerIndex);
        return new JXG.Coords(JXG.COORDS_BY_SCREEN, pos, Board.board);
    }

    private static solveCollisions(): void {
        
    }

    private static solveClick(x: number, y: number): void {
        if(Board.action == ActionEnum.CREATE_POINT) {
            Board.createPoint(x, y);
        }
        else if(Board.action == ActionEnum.CREATE_SEGMENT || Board.action == ActionEnum.CREATE_RAY || Board.action == ActionEnum.CREATE_LINE || Board.action == ActionEnum.CREATE_CIRCLE) {
            const point = Board.createPoint(x, y);
            Board.shapesAccumlator.push(point);

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
                    default:
                        // unreachable
                        break;
                }
                Board.shapesAccumlator = [];
            }
        }
    }

    private static handleBoardClick(event: any): void {
        var fingerIndex = undefined;
        if(event[JXG.touchProperty]) {
            fingerIndex = 0;
        }

        var coords = Board.getMouseCoords(event, fingerIndex);
        var canCreate = true;
        for(let el in Board.board.objects) {
            if(JXG.isPoint(Board.board.objects[el]) && Board.board.objects[el].hasPoint(coords.scrCoords[1], coords.scrCoords[2])) {
                canCreate = false;
                break;
            }
        }
 
        if(canCreate) {
            Board.solveClick(coords.usrCoords[1], coords.usrCoords[2]);
        }
    }
};