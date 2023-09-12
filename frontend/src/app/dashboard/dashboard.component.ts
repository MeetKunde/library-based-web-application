import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Board } from './board/Board'
import { ActionEnum } from './board/ActionEnum';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DivideSegmentDialogComponent } from './dialogs/divideSegmentDialog.component';
import { InstructionSnackBarComponent } from './snackbars/instructionSnackBar.component';
import { AnswearType, RequestEnum } from './board/RequestEnum';
import { InfoSnackBarComponent } from './snackbars/infoSnackBar.component';
import { DivideAngleDialogComponent } from './dialogs/divideAngleDialog.component';
import { EnterFormulaDialogComponent } from './dialogs/enterFormula.component';
import { SetSegmentLengthDialogComponent } from './dialogs/setSegmentLength.component';
import { SetAngleMeasureDialogComponent } from './dialogs/setAngleMeasure.component';
import { AngleIsConvexDialogComponent } from './dialogs/angleIsConvexDialog.component';
import { SetPerimeterDialogComponent } from './dialogs/setPerimeter.component';
import { SetAreaDialogComponent } from './dialogs/setArea.component';
import { EnterPolygonSidesNumberDialogComponent } from './dialogs/enterPolygonSidesNumberDialog.component';
import { ProcessExerciseService } from '../service/process-exercise.service';
import { SelectTriangleTypeDialogComponent } from './dialogs/selectTriangleTypeDialog.component';
import { SelectTrapezoidTypeDialogComponent } from './dialogs/selectTrapezoidTypeDialog.component';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  ActionEnum = ActionEnum;

  actionButtons: { name: string, tooltip: string, imagePath: string, actionToDo: () => void, highlightButton: () => boolean }[] = [
    {name: 'point', tooltip: 'Create Point', imagePath: '../../assets/button-images/PointIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.CREATE_POINT); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.CREATE_POINT; }},
    {name: 'segment', tooltip: 'Create Segment', imagePath: '../../assets/button-images/SegmentIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.CREATE_SEGMENT); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.CREATE_SEGMENT; }},
    {name: 'line', tooltip: 'Create Line', imagePath: '../../assets/button-images/LineIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.CREATE_LINE); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.CREATE_LINE; }},
    {name: 'ray', tooltip: 'Create Ray', imagePath: '../../assets/button-images/RayIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.CREATE_RAY); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.CREATE_RAY; }},
    {name: 'circle', tooltip: 'Create Circle', imagePath: '../../assets/button-images/CircleIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.CREATE_CIRCLE); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.CREATE_CIRCLE; }},
    {name: 'perpendicularity', tooltip: 'Create Perpendicular Line', imagePath: '../../assets/button-images/PerpendicularityIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.CREATE_PERPENDICULAR_LINE); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.CREATE_PERPENDICULAR_LINE; }},
    {name: 'parallelism', tooltip: 'Create Parallel Line', imagePath: '../../assets/button-images/ParallelismIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.CREATE_PARALLEL_LINE); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.CREATE_PARALLEL_LINE; }},
    {name: 'mid-perpendicular', tooltip: 'Create Mid-Perpendicular', imagePath: '../../assets/button-images/MidPerpendicularIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.CREATE_MID_PERPENDICULAR); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.CREATE_MID_PERPENDICULAR; }},
    {name: 'bisector', tooltip: 'Create Bisector', imagePath: '../../assets/button-images/BisectorIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.CREATE_BISECTOR); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.CREATE_BISECTOR; }},
    {name: 'incircle', tooltip: 'Create Incircle', imagePath: '../../assets/button-images/IncircleIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.CREATE_INCIRCLE); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.CREATE_INCIRCLE; }},
    {name: 'circumcircle', tooltip: 'Create Circumcircle', imagePath: '../../assets/button-images/CircumcircleIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.CREATE_CIRCUMCIRCLE); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.CREATE_CIRCUMCIRCLE; }},
    {name: 'escribedCircle', tooltip: 'Create Escribed Circle', imagePath: '../../assets/button-images/EscribedCircleIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.CREATE_ESCRIBED_CIRCLE); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.CREATE_ESCRIBED_CIRCLE; }},
    {name: 'divideSegment', tooltip: 'Divide Segment', imagePath: '../../assets/button-images/DivideSegmentIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.DIVIDE_SEGMENT); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.DIVIDE_SEGMENT; }},
    {name: 'divideAngle', tooltip: 'Divide Angle', imagePath: '../../assets/button-images/DivideAngleIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.DIVIDE_ANGLE); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.DIVIDE_ANGLE; }},
    {name: 'equalSegments', tooltip: 'Set Equal Segments', imagePath: '../../assets/button-images/EqualLengthsIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.SET_EQUAL_SEGMENTS); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.SET_EQUAL_SEGMENTS; }},
    {name: 'equalAngles', tooltip: 'Set Equal Angles', imagePath: '../../assets/button-images/EqualAnglesIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.SET_EQUAL_ANGLES); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.SET_EQUAL_ANGLES; }},
    {name: 'tangentLine', tooltip: 'Create Tangent Line', imagePath: '../../assets/button-images/TangentCircleToLineIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.CREATE_TANGENT_LINE); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.CREATE_TANGENT_LINE; }},
    {name: 'tangentCircle', tooltip: 'Create Tangent Circle', imagePath: '../../assets/button-images/TangentCircleToCircleIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.CREATE_TANGENT_CIRCLE); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.CREATE_TANGENT_CIRCLE; }},
    {name: 'median', tooltip: 'Create Median', imagePath: '../../assets/button-images/MedianIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.CREATE_MEDIAN); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.CREATE_MEDIAN; }},
    {name: 'altitude', tooltip: 'Create Altitude', imagePath: '../../assets/button-images/AltitudeIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.CREATE_ALTITUDE); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.CREATE_ALTITUDE; }},
    {name: 'mid-segment', tooltip: 'Create Mid-Segment', imagePath: '../../assets/button-images/MidSegmentIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.CREATE_MID_SEGMENT); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.CREATE_MID_SEGMENT; }},
    {name: 'setLength', tooltip: 'Set Segment Length', imagePath: '../../assets/button-images/SegmentLengthIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.SET_SEGMENT_LENGHT); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.SET_SEGMENT_LENGHT; }},
    {name: 'setAngle', tooltip: 'Set Angle Measure', imagePath: '../../assets/button-images/AngleMeasureIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.SET_ANGLE_MEASURE); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.SET_ANGLE_MEASURE; }},
    {name: 'setEquation', tooltip: 'Enter Equation', imagePath: '../../assets/button-images/EquationIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.ENTER_FORMULA); /*this.openInstructionSnackBar();*/ }, highlightButton: () => { return false; }},
    {name: 'setPerimeter', tooltip: 'Set Perimeter', imagePath: '../../assets/button-images/PerimeterIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.SET_PERIMETER); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.SET_PERIMETER; }},
    {name: 'setArea', tooltip: 'Set Area', imagePath: '../../assets/button-images/AreaIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.SET_AREA); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.SET_AREA; }},
    {name: 'triangle', tooltip: 'Create Triangle', imagePath: '../../assets/button-images/TriangleIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.CREATE_TRIANGLE); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.CREATE_TRIANGLE; }},
    {name: 'square', tooltip: 'Create Square', imagePath: '../../assets/button-images/SquareIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.CREATE_SQUARE); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.CREATE_SQUARE; }},
    {name: 'rectangle', tooltip: 'Create Rectangle', imagePath: '../../assets/button-images/RectangleIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.CREATE_RECTANGLE); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.CREATE_RECTANGLE; }},
    {name: 'regularPolygon', tooltip: 'Create Regular Polygon', imagePath: '../../assets/button-images/RegularPolygonIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.CREATE_REGULAR_POLYGON); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.CREATE_REGULAR_POLYGON; }},
    {name: 'parallelogram', tooltip: 'Create Parallelogram', imagePath: '../../assets/button-images/ParallelogramIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.CREATE_PARALLELOGRAM); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.CREATE_PARALLELOGRAM; }},
    {name: 'kite', tooltip: 'Create Kite', imagePath: '../../assets/button-images/KiteIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.CREATE_KITE); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.CREATE_KITE; }},
    {name: 'rhombus', tooltip: 'Create Rhombus', imagePath: '../../assets/button-images/RhombusIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.CREATE_RHOMBUS); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.CREATE_RHOMBUS; }},
    {name: 'trapezoid', tooltip: 'Create Trapezoid', imagePath: '../../assets/button-images/TrapezoidIcon.svg', actionToDo: ()=> { this.board?.changeAction(ActionEnum.CREATE_TRAPEZOID); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.CREATE_TRAPEZOID; }},
    {name: 'process', tooltip: 'Process Exercise', imagePath: '../../assets/button-images/ProcessIcon.svg', actionToDo: () => { this.processExercise(); }, highlightButton: () => { return false; }},
    {name: 'save', tooltip: 'Save Exercise', imagePath: '../../assets/button-images/SaveIcon.svg', actionToDo: () => { this.saveScheme(); }, highlightButton: () => { return false; }},
    {name: 'load', tooltip: 'Load Exercise', imagePath: '../../assets/button-images/LoadIcon.svg', actionToDo: () => { this.loadScheme(); }, highlightButton: () => { return false; }},
    {name: 'clear', tooltip: 'Clear Board', imagePath: '../../assets/button-images/DeleteIcon.svg', actionToDo: () => { this.reinitializeBoard(); }, highlightButton: () => { return false; }},
  ];

  board: Board | undefined;
  tabLabel: string;
  solutionIsLoading: boolean;

  private boardId = 'jxgbox';
  private bounds: [number, number, number, number] = [-100, 100, 100, -100];
  private maxBounds: [number, number, number, number] = [-400, 400, 300, -300];
  private showAxis = false;
  private keepAspectRatio = true;

  constructor(
    private _matIconRegistry: MatIconRegistry,
    private _domSanitizer: DomSanitizer,
    private _snackBar: MatSnackBar,
    public _dialog: MatDialog,
    private _processExerciseService: ProcessExerciseService) { 
      this.tabLabel = 'exercise';
      this.solutionIsLoading = false;
      this.actionButtons.forEach(button => this._matIconRegistry.addSvgIcon(
        button.name,
        this._domSanitizer.bypassSecurityTrustResourceUrl(button.imagePath)
      ));
    }

  ngOnInit() {
    new Promise(resolve => setTimeout(resolve, 100)).then(() => {
      this.board = new Board(this.boardId, this.bounds, this.maxBounds, this.showAxis, this.keepAspectRatio, this.requestDataFromUser);
    });
  }

  setTab(label: string) {
    this.tabLabel = label;
  }

  openInstructionSnackBar() {
    if(this.board === undefined) { return; }
    if(this.board.getAction() == ActionEnum.NONE) { return; }

    this._snackBar.openFromComponent(InstructionSnackBarComponent, {
      data: { action: this.board.getAction(), exitButtonLabel: 'OK!' },
      duration: 3000,
      panelClass: 'custom-info-snackbar',
    });
  }

  openErrorSnackBar(info: string, closeButtonLabel: string) {
    this._snackBar.openFromComponent(InfoSnackBarComponent, {
      data: { info: info, closeButtonLabel: closeButtonLabel },
      duration: 3000,
      panelClass: 'custom-error-snackbar',
    });
  }

  openSuccessSnackBar(info: string, closeButtonLabel: string) {
    this._snackBar.openFromComponent(InfoSnackBarComponent, {
      data: { info: info, closeButtonLabel: closeButtonLabel },
      duration: 3000,
      panelClass: 'custom-success-snackbar',
    });
  }

  openInfoSnackBar(info: string, closeButtonLabel: string) {
    this._snackBar.openFromComponent(InfoSnackBarComponent, {
      data: { info: info, closeButtonLabel: closeButtonLabel },
      duration: 3000,
      panelClass: 'custom-info-snackbar',
    });
  }

  requestDataFromUser = (requestType: RequestEnum, callback: (data: AnswearType) => void): void  =>{
    switch(requestType) {
      case RequestEnum.FORMULA:
        this.openRequestDataDialog(EnterFormulaDialogComponent, (data: { stringValue: string, booleanValue: boolean, numberValue: number }) => {
          var formula: string = data.stringValue;
          if(formula.length > 0) { callback({ formula: formula }); }
          else { this.openErrorSnackBar('Incorrect data have been entered', 'OK!'); }
        });
        break;
      case RequestEnum.LENGTH:
        this.openRequestDataDialog(SetSegmentLengthDialogComponent, (data: { stringValue: string, booleanValue: boolean, numberValue: number }) => {
          var length: string = data.stringValue;
          if(length.length > 0) { callback({ length: length }); }
          else { this.openErrorSnackBar('Incorrect data have been entered', 'OK!'); }
        });
        break;
      case RequestEnum.MEASURE:
        this.openRequestDataDialog(SetAngleMeasureDialogComponent, (data: { stringValue: string, booleanValue: boolean, numberValue: number }) => {
          var measure: string = data.stringValue;
          var angleIsConvex: boolean = data.booleanValue;
          if(measure.length > 0) { callback({ measure: measure, angleIsConvex: angleIsConvex }); }
          else { this.openErrorSnackBar('Incorrect data have been entered', 'OK!'); }
        });
        break;
      case RequestEnum.ANGLE_IS_CONVEX:
        this.openRequestDataDialog(AngleIsConvexDialogComponent, (data: { stringValue: string, booleanValue: boolean, numberValue: number }) => {
          var angleIsConvex: boolean = data.booleanValue;
          callback({ angleIsConvex: angleIsConvex });
        });
        break;
      case RequestEnum.PARTS_NUMBER_TO_DIVIDE_SEGMENT:
        this.openRequestDataDialog(DivideSegmentDialogComponent, (data: { stringValue: string, booleanValue: boolean, numberValue: number }) => {
          var partsNumber: number = parseInt(data.stringValue);
          if(Number.isInteger(partsNumber) && partsNumber > 1) { callback({ partsNumber: partsNumber }); }
          else { this.openErrorSnackBar('Incorrect data have been entered', 'OK!'); }
        });
        break;
      case RequestEnum.PARTS_NUMBER_AND_IS_CONVEX_TO_DIVIDE_ANGLE:
        this.openRequestDataDialog(DivideAngleDialogComponent, (data: { stringValue: string, booleanValue: boolean, numberValue: number }) => {
          var partsNumber: number = parseInt(data.stringValue);
          var angleIsConvex: boolean = data.booleanValue;
          if(Number.isInteger(partsNumber) && partsNumber > 1) { callback({ partsNumber: partsNumber, angleIsConvex: angleIsConvex }); }
          else { this.openErrorSnackBar('Incorrect data have been entered', 'OK!'); }
        });
        break;
      case RequestEnum.PERIMETER:
        this.openRequestDataDialog(SetPerimeterDialogComponent, (data: { stringValue: string, booleanValue: boolean, numberValue: number }) => {
          var perimeter: string = data.stringValue;
          if(perimeter.length > 0) { callback({ perimeter: perimeter }); }
          else { this.openErrorSnackBar('Incorrect data have been entered', 'OK!'); }
        });
        break;
      case RequestEnum.AREA:
        this.openRequestDataDialog(SetAreaDialogComponent, (data: { stringValue: string, booleanValue: boolean, numberValue: number }) => {
          var area: string = data.stringValue;
          if(area.length > 0) { callback({ area: area }); }
          else { this.openErrorSnackBar('Incorrect data have been entered', 'OK!'); }
        });
        break;
      case RequestEnum.POLYGON_SIDES_NUMBER:
        this.openRequestDataDialog(EnterPolygonSidesNumberDialogComponent, (data: { stringValue: string, booleanValue: boolean, numberValue: number }) => {
          var sides: number = parseInt(data.stringValue);
          if(Number.isInteger(sides) && sides > 2) { callback({ sides: sides }); }
          else { this.openErrorSnackBar('Incorrect data have been entered', 'OK!'); }
        });
        break;
      case RequestEnum.TRIANGLE_TYPE:
        this.openRequestDataDialog(SelectTriangleTypeDialogComponent, (data: { stringValue: string, booleanValue: boolean, numberValue: number }) => {
          callback({ triangleType: data.numberValue });
        });
        break;
      case RequestEnum.TRAPEZOID_TYPE:
        this.openRequestDataDialog(SelectTrapezoidTypeDialogComponent, (data: { stringValue: string, booleanValue: boolean, numberValue: number }) => {
          callback({ trapezoidType: data.numberValue });
        });
        break;
      default:
        // unreachable
        break;
    }
  }

  private openRequestDataDialog = (dialogComponent: any, callback: (data: { stringValue: string, booleanValue: boolean, numberValue: number }) => void): void => {
    const dialogRef = this._dialog.open(dialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if(result) { callback({ stringValue: result.stringInput, booleanValue: result.booleanInput, numberValue: result.numberValue }); }
    });
  }

  processExercise() {
    if(this.board === undefined) { return; }

    this.setTab('solution');
    this.solutionIsLoading = true;
    
    setTimeout(() => {
      this._processExerciseService.compute(this.board!.getScheme()).subscribe(
        response => {
          this.solutionIsLoading = false;
          console.log(response);
        },
        error => {
            this.setTab('exercise');
            this.solutionIsLoading = false;
            this.openErrorSnackBar('Cannot process exercise. Something hs gone wrong', 'OK!');
            console.error('Error:', error);
        }
      );
    }, 500);
  }

  saveScheme() {
    console.log(JSON.stringify(this.board?.getScheme()));
  }

  loadScheme() {
    console.log(JSON.stringify(this.board?.getScheme()));
  }

  reinitializeBoard() {
    this.board?.detach();
    this.board = new Board(this.boardId, this.bounds, this.maxBounds, this.showAxis, this.keepAspectRatio, this.requestDataFromUser);
  } 
}