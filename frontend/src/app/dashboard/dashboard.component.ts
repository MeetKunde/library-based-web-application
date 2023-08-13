import { Component, numberAttribute } from '@angular/core';
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
    {name: 'setLength', tooltip: 'Set Segment Length', imagePath: '../../assets/button-images/SegmentLengthIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.SET_SEGMENT_LENGHT); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.SET_SEGMENT_LENGHT; }},
    {name: 'setAngle', tooltip: 'Set Angle Measure', imagePath: '../../assets/button-images/AngleMeasureIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.SET_ANGLE_MEASURE); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.SET_ANGLE_MEASURE; }},
    {name: 'setEquation', tooltip: 'Enter Equation', imagePath: '../../assets/button-images/EquationIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.ENTER_FORMULA); /*this.openInstructionSnackBar();*/ }, highlightButton: () => { return false; }},
    {name: 'divideSegment', tooltip: 'Divide Segment', imagePath: '../../assets/button-images/DivideSegmentIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.DIVIDE_SEGMENT); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.DIVIDE_SEGMENT; }},
    {name: 'divideAngle', tooltip: 'Divide Angle', imagePath: '../../assets/button-images/DivideAngleIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.DIVIDE_ANGLE); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.DIVIDE_ANGLE; }},
    {name: 'equalSegments', tooltip: 'Set Equal Segments', imagePath: '../../assets/button-images/EqualLengthsIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.SET_EQUAL_SEGMENTS); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.SET_EQUAL_SEGMENTS; }},
    {name: 'equalAngles', tooltip: 'Set Equal Angles', imagePath: '../../assets/button-images/EqualAnglesIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.SET_EQUAL_ANGLES); this.openInstructionSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.SET_EQUAL_ANGLES; }},
    /*
    {name: 'tangent', imagePath: '../../assets/button-images/Icon.svg', onClick: () => { }},
    {name: 'incscribedCircle', imagePath: '../../assets/button-images/Icon.svg', onClick: () => { }},
    {name: 'describedCircle', imagePath: '../../assets/button-images/Icon.svg', onClick: () => { }},
    {name: 'escribedCircle', imagePath: '../../assets/button-images/Icon.svg', onClick: () => { }},
    {name: 'triangle', imagePath: '../../assets/button-images/Icon.svg', onClick: () => { }},
    {name: 'square', imagePath: '../../assets/button-images/Icon.svg', onClick: () => { }},
    {name: 'rectangle', imagePath: '../../assets/button-images/Icon.svg', onClick: () => { }},
    {name: 'polygon', imagePath: '../../assets/button-images/Icon.svg', onClick: () => { }},
    {name: 'parallelogram', imagePath: '../../assets/button-images/Icon.svg', onClick: () => { }},
    {name: 'kite', imagePath: '../../assets/button-images/Icon.svg', onClick: () => { }},
    {name: 'rhombus', imagePath: '../../assets/button-images/Icon.svg', onClick: () => { }},
    {name: 'trapezoid', imagePath: '../../assets/button-images/Icon.svg', onClick: () => { }},
    {name: 'median', imagePath: '../../assets/button-images/Icon.svg', onClick: () => { }},
    {name: 'altitude', imagePath: '../../assets/button-images/Icon.svg', onClick: () => { }},
    {name: 'mid-segment', imagePath: '../../assets/button-images/Icon.svg', onClick: () => { }},*/
    {name: 'process', tooltip: 'Process Exercise', imagePath: '../../assets/button-images/ProcessIcon.svg', actionToDo: () => { }, highlightButton: () => { return false; }},
    {name: 'save', tooltip: 'Save Exercise', imagePath: '../../assets/button-images/SaveIcon.svg', actionToDo: () => { this.saveScheme(); }, highlightButton: () => { return false; }},
    {name: 'load', tooltip: 'Load Exercise', imagePath: '../../assets/button-images/LoadIcon.svg', actionToDo: () => { this.loadScheme(); }, highlightButton: () => { return false; }},
    {name: 'clear', tooltip: 'Clear Board', imagePath: '../../assets/button-images/DeleteIcon.svg', actionToDo: () => { this.reinitializeBoard(); }, highlightButton: () => { return false; }},
  ];

  board: Board | undefined;
  tabLabel: string;

  private boardId = 'jxgbox';
  private minX = -100;
  private maxX = 100;
  private minY = 100;
  private maxY = -100;
  private showAxis = false;
  private keepAspectRatio = true;

  constructor(
    private _matIconRegistry: MatIconRegistry,
    private _domSanitizer: DomSanitizer,
    private _snackBar: MatSnackBar,
    public _dialog: MatDialog) { 
      this.tabLabel = 'exercise';
      this.actionButtons.forEach(button => this._matIconRegistry.addSvgIcon(
        button.name,
        this._domSanitizer.bypassSecurityTrustResourceUrl(button.imagePath)
      ));
    }

  ngOnInit() {
    new Promise(resolve => setTimeout(resolve, 100)).then(() => {
      this.board = new Board(this.boardId, [this.minX, this.maxX, this.minY, this.maxY], this.showAxis, this.keepAspectRatio, this.requestDataFromUser);
    });
  }

  setTab(label: string) {
    this.tabLabel = label;
  }

  openInstructionSnackBar() {
    if(this.board === undefined) { return; }
    if(this.board.getAction() == ActionEnum.NONE) { return; }

    this._snackBar.openFromComponent(InstructionSnackBarComponent, {
      data: { action: this.board.getAction() },
      duration: 3000,
      panelClass: 'custom-info-snackbar',
    });
  }

  openErrorSnackBar(info: string) {
    this._snackBar.openFromComponent(InfoSnackBarComponent, {
      data: { info: info },
      duration: 3000,
      panelClass: 'custom-error-snackbar',
    });
  }

  openSuccessSnackBar(info: string) {
    this._snackBar.openFromComponent(InfoSnackBarComponent, {
      data: { info: info },
      duration: 3000,
      panelClass: 'custom-success-snackbar',
    });
  }

  openInfoSnackBar(info: string) {
    this._snackBar.openFromComponent(InfoSnackBarComponent, {
      data: { info: info },
      duration: 3000,
      panelClass: 'custom-info-snackbar',
    });
  }

  requestDataFromUser = (requestType: RequestEnum, callback: (data: AnswearType) => void): void  =>{
    switch(requestType) {
      case RequestEnum.FORMULA:
        this.openRequestDataDialog(EnterFormulaDialogComponent, (data: { stringValue: string, booleanValue: boolean }) => {
          var formula: string = data.stringValue;
          if(formula.length > 0) { callback({ formula: formula }); }
          else { this.openErrorSnackBar('Incorrect data have been entered'); }
        });
        break;
      case RequestEnum.LENGTH:
        this.openRequestDataDialog(SetSegmentLengthDialogComponent, (data: { stringValue: string, booleanValue: boolean }) => {
          var length: string = data.stringValue;
          if(length.length > 0) { callback({ length: length }); }
          else { this.openErrorSnackBar('Incorrect data have been entered'); }
        });
        break;
      case RequestEnum.MEASURE:
        this.openRequestDataDialog(SetAngleMeasureDialogComponent, (data: { stringValue: string, booleanValue: boolean }) => {
          var measure: string = data.stringValue;
          var angleIsConvex: boolean = data.booleanValue;
          if(measure.length > 0) { callback({ measure: measure, angleIsConvex: angleIsConvex }); }
          else { this.openErrorSnackBar('Incorrect data have been entered'); }
        });
        break;
      case RequestEnum.ANGLE_IS_CONVEX:
        this.openRequestDataDialog(AngleIsConvexDialogComponent, (data: { stringValue: string, booleanValue: boolean }) => {
          var angleIsConvex: boolean = data.booleanValue;
          callback({ angleIsConvex: angleIsConvex });
        });
        break;
      case RequestEnum.PARTS_NUMBER_TO_DIVIDE_SEGMENT:
        this.openRequestDataDialog(DivideSegmentDialogComponent, (data: { stringValue: string, booleanValue: boolean }) => {
          var partsNumber: number = parseInt(data.stringValue);
          if(Number.isInteger(partsNumber) && partsNumber > 1) { callback({ partsNumber: partsNumber }); }
          else { this.openErrorSnackBar('Incorrect data have been entered'); }
        });
        break;
      case RequestEnum.PARTS_NUMBER_AND_IS_CONVEX_TO_DIVIDE_ANGLE:
        this.openRequestDataDialog(DivideAngleDialogComponent, (data: { stringValue: string, booleanValue: boolean }) => {
          var partsNumber: number = parseInt(data.stringValue);
          var angleIsConvex: boolean = data.booleanValue;
          if(Number.isInteger(partsNumber) && partsNumber > 1) { callback({ partsNumber: partsNumber, angleIsConvex: angleIsConvex }); }
          else { this.openErrorSnackBar('Incorrect data have been entered'); }
        });
        break;
      default:
        // unreachable
        break;
    }
  }

  private openRequestDataDialog = (dialogComponent: any, callback: (data: { stringValue: string, booleanValue: boolean }) => void): void => {
    const dialogRef = this._dialog.open(dialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if(result) { callback({ stringValue: result.stringInput, booleanValue: result.booleanInput }); }
    });
  }

  saveScheme() {
    console.log(this.board?.getScheme());
  }

  loadScheme() {
    
  }

  reinitializeBoard() {
    this.board?.detach();
    this.board = new Board(this.boardId, [this.minX, this.maxX, this.minY, this.maxY], this.showAxis, this.keepAspectRatio, this.requestDataFromUser);
  } 
}