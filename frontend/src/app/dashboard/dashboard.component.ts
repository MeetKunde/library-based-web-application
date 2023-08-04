import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Board } from './board/Board'
import { ActionEnum } from './board/ActionEnum';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  ActionEnum = ActionEnum;
  Board = Board

  actionButtons: { name: string, tooltip: string, imagePath: string, actionToDo: ActionEnum }[] = [
    {name: 'point', tooltip: 'Create Point', imagePath: '../../assets/button-images/PointIcon.svg', actionToDo: ActionEnum.CREATE_POINT},
    {name: 'segment', tooltip: 'Create Segment', imagePath: '../../assets/button-images/SegmentIcon.svg', actionToDo: ActionEnum.CREATE_SEGMENT},
    {name: 'line', tooltip: 'Create Line', imagePath: '../../assets/button-images/LineIcon.svg', actionToDo: ActionEnum.CREATE_LINE},
    {name: 'ray', tooltip: 'Create Ray', imagePath: '../../assets/button-images/RayIcon.svg', actionToDo: ActionEnum.CREATE_RAY},
    {name: 'circle', tooltip: 'Create Circle', imagePath: '../../assets/button-images/CircleIcon.svg', actionToDo: ActionEnum.CREATE_CIRCLE},
    {name: 'perpendicularity', tooltip: 'Set Perpendicularity', imagePath: '../../assets/button-images/PerpendicularityIcon.svg', actionToDo: ActionEnum.SET_PERPENDICULARITY},
    {name: 'parallelism', tooltip: 'Set Parallelism', imagePath: '../../assets/button-images/ParallelismIcon.svg', actionToDo: ActionEnum.SET_PARALLELISM},
    {name: 'mid-perpendicular', tooltip: 'Create Mid-Perpendicular', imagePath: '../../assets/button-images/MidPerpendicularIcon.svg', actionToDo: ActionEnum.CREATE_MID_PERPENDICULAR},
    {name: 'bisector', tooltip: 'Create Bisector', imagePath: '../../assets/button-images/BisectorIcon.svg', actionToDo: ActionEnum.CREATE_BISECTOR},
    {name: 'setLength', tooltip: 'Set Segment Length', imagePath: '../../assets/button-images/SegmentLengthIcon.svg', actionToDo: ActionEnum.SET_SEGMENT_LENGHT},
    {name: 'setAngle', tooltip: 'Set Angle Measure', imagePath: '../../assets/button-images/AngleMeasureIcon.svg', actionToDo: ActionEnum.SET_ANGLE_MEASURE},
    {name: 'setEquation', tooltip: 'Enter Equation', imagePath: '../../assets/button-images/EquationIcon.svg', actionToDo: ActionEnum.ENTER_EQUATION},
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
    {name: 'mid-segment', imagePath: '../../assets/button-images/Icon.svg', onClick: () => { }},
    {name: 'process', imagePath: '../../assets/button-images/Icon.svg', onClick: () => { }},
    {name: 'save', imagePath: '../../assets/button-images/Icon.svg', onClick: () => { }},
    {name: 'load', imagePath: '../../assets/button-images/Icon.svg', onClick: () => { }},
    {name: 'clear', imagePath: '../../assets/button-images/Icon.svg', onClick: () => { }}*/
  ];

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer) { 
      this.actionButtons.forEach(button => this.matIconRegistry.addSvgIcon(
        button.name,
        this.domSanitizer.bypassSecurityTrustResourceUrl(button.imagePath)
      ));
    }

  ngOnInit() {
    new Promise(resolve => setTimeout(resolve, 100)).then(() => {
      Board.initialize('jxgbox', [-100, 100, 100, -100], false);
    });
  }
}