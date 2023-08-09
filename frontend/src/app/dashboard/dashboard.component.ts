import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Board } from './board/Board'
import { ActionEnum } from './board/ActionEnum';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  ActionEnum = ActionEnum;

  actionButtons: { name: string, tooltip: string, imagePath: string, actionToDo: () => void, highlightButton: () => boolean }[] = [
    {name: 'point', tooltip: 'Create Point', imagePath: '../../assets/button-images/PointIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.CREATE_POINT); this.openSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.CREATE_POINT; }},
    {name: 'segment', tooltip: 'Create Segment', imagePath: '../../assets/button-images/SegmentIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.CREATE_SEGMENT); this.openSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.CREATE_SEGMENT; }},
    {name: 'line', tooltip: 'Create Line', imagePath: '../../assets/button-images/LineIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.CREATE_LINE); this.openSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.CREATE_LINE; }},
    {name: 'ray', tooltip: 'Create Ray', imagePath: '../../assets/button-images/RayIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.CREATE_RAY); this.openSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.CREATE_RAY; }},
    {name: 'circle', tooltip: 'Create Circle', imagePath: '../../assets/button-images/CircleIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.CREATE_CIRCLE); this.openSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.CREATE_CIRCLE; }},
    {name: 'perpendicularity', tooltip: 'Create Perpendicular Line', imagePath: '../../assets/button-images/PerpendicularityIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.CREATE_PERPENDICULAR_LINE); this.openSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.CREATE_PERPENDICULAR_LINE; }},
    {name: 'parallelism', tooltip: 'Create Parallel Line', imagePath: '../../assets/button-images/ParallelismIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.CREATE_PARALLEL_LINE); this.openSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.CREATE_PARALLEL_LINE; }},
    {name: 'mid-perpendicular', tooltip: 'Create Mid-Perpendicular', imagePath: '../../assets/button-images/MidPerpendicularIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.CREATE_MID_PERPENDICULAR); this.openSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.CREATE_MID_PERPENDICULAR; }},
    {name: 'bisector', tooltip: 'Create Bisector', imagePath: '../../assets/button-images/BisectorIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.CREATE_BISECTOR); this.openSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.CREATE_BISECTOR; }},
    {name: 'setLength', tooltip: 'Set Segment Length', imagePath: '../../assets/button-images/SegmentLengthIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.SET_SEGMENT_LENGHT); this.openSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.SET_SEGMENT_LENGHT; }},
    {name: 'setAngle', tooltip: 'Set Angle Measure', imagePath: '../../assets/button-images/AngleMeasureIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.SET_ANGLE_MEASURE); this.openSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.SET_ANGLE_MEASURE; }},
    {name: 'setEquation', tooltip: 'Enter Equation', imagePath: '../../assets/button-images/EquationIcon.svg', actionToDo: () => { this.board?.changeAction(ActionEnum.ENTER_EQUATION); this.openSnackBar(); }, highlightButton: () => { return this.board?.getAction() == ActionEnum.ENTER_EQUATION; }},
    /*{name: 'divideSegment', imagePath: '../../assets/button-images/Icon.svg', onClick: () => { }},
    {name: 'divideAngle', imagePath: '../../assets/button-images/Icon.svg', onClick: () => { }},
    {name: 'tangent', imagePath: '../../assets/button-images/Icon.svg', onClick: () => { }},
    {name: 'equalSegments', imagePath: '../../assets/button-images/Icon.svg', onClick: () => { }},
    {name: 'equalAngles', imagePath: '../../assets/button-images/Icon.svg', onClick: () => { }},
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
    private _snackBar: MatSnackBar) { 
      this.tabLabel = 'exercise';
      this.actionButtons.forEach(button => this._matIconRegistry.addSvgIcon(
        button.name,
        this._domSanitizer.bypassSecurityTrustResourceUrl(button.imagePath)
      ));
    }

  ngOnInit() {
    new Promise(resolve => setTimeout(resolve, 100)).then(() => {
      this.board = new Board(this.boardId, [this.minX, this.maxX, this.minY, this.maxY], this.showAxis, this.keepAspectRatio);
    });
  }

  setTab(label: string) {
    this.tabLabel = label;
  }

  saveScheme() {
    console.log(this.board?.getScheme());
  }

  loadScheme() {
    
  }

  reinitializeBoard() {
    this.board?.detach();
    this.board = new Board(this.boardId, [this.minX, this.maxX, this.minY, this.maxY], this.showAxis, this.keepAspectRatio);
  }

  openSnackBar() {
    const duration = 3000;

    if(this.board === undefined) {
      return;
    }

    switch(this.board.getAction()) {
      case ActionEnum.CREATE_POINT:
        this._snackBar.open('Click on board or on shape', 'OK!', { duration: duration });
        break;
      case ActionEnum.CREATE_SEGMENT:
        this._snackBar.open('Create/select two points', 'OK!', { duration: duration });
        break;
      case ActionEnum.CREATE_LINE:
        this._snackBar.open('Create/select two points', 'OK!', { duration: duration });
        break;
      case ActionEnum.CREATE_RAY:
        this._snackBar.open('Create/select two points', 'OK!', { duration: duration });
        break;
      case ActionEnum.CREATE_CIRCLE:
        this._snackBar.open('Create/select two points', 'OK!', { duration: duration });
        break;
      case ActionEnum.CREATE_PERPENDICULAR_LINE:
        this._snackBar.open('Select line and create/select point', 'OK!', { duration: duration });
        break;
      case ActionEnum.CREATE_PARALLEL_LINE:
        this._snackBar.open('Select line and create/select point', 'OK!', { duration: duration });
        break;
      case ActionEnum.CREATE_MID_PERPENDICULAR:
        this._snackBar.open('', 'OK!', { duration: duration });
        break;
      case ActionEnum.CREATE_BISECTOR:
        this._snackBar.open('', 'OK!', { duration: duration });
        break;
      case ActionEnum.SET_SEGMENT_LENGHT:
        this._snackBar.open('', 'OK!', { duration: duration });
        break;
      case ActionEnum.SET_ANGLE_MEASURE:
        this._snackBar.open('', 'OK!', { duration: duration });
        break;
      case ActionEnum.ENTER_EQUATION:
        this._snackBar.open('', 'OK!', { duration: duration });
        break;
      default:
        // do not display anything
        break;
    }
  }
}