import { Component, Inject } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { ActionEnum } from '../board/ActionEnum';


@Component({
  selector: 'app-dashboard-instruction-snack-bar',
  template: `
  <div style="display: flex; flex-direction: row; align-items: center; justify-content: space-between; padding: 0px;">
    <span style="margin: 0px; padding: 0px;"> {{ this.text }} </span>
    <button mat-button (click)="this.snackBarRef.dismiss();" style="color: white; margin: 0px; padding: 0px;"> {{ this.exitButtonLabel }} </button>
  </div>
  `
})
export class InstructionSnackBarComponent {
  text: string = '';
  exitButtonLabel = '';

  constructor(
    public snackBarRef: MatSnackBarRef<InstructionSnackBarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: { action: ActionEnum; exitButtonLabel: string; }
  ) {
    this.exitButtonLabel = data.exitButtonLabel;
    switch(data.action) {
      case ActionEnum.NONE:
        this.text = '';
        break;
      case ActionEnum.CREATE_POINT:
        this.text = 'Click on board';
        break;
      case ActionEnum.CREATE_SEGMENT:
      case ActionEnum.CREATE_LINE:
      case ActionEnum.CREATE_RAY:
      case ActionEnum.CREATE_CIRCLE:
        this.text = 'Click on board or on shape';
        break;
      case ActionEnum.CREATE_PERPENDICULAR_LINE:
      case ActionEnum.CREATE_PARALLEL_LINE:
        this.text = 'Select line and click on board or on shape';
        break;
      case ActionEnum.DIVIDE_SEGMENT:
        this.text = 'Select segment ends';
        break;
      case ActionEnum.DIVIDE_ANGLE:
        this.text = 'Select angle vertices';
        break;
      case ActionEnum.CREATE_MID_PERPENDICULAR:
        this.text = 'Select segment ends';
        break;
      case ActionEnum.CREATE_BISECTOR:
        this.text = 'Select angle vertices';
        break;
      case ActionEnum.SET_EQUAL_SEGMENTS:
        this.text = 'Select segments ends';
        break;
      case ActionEnum.SET_EQUAL_ANGLES:
        this.text = 'Select angles vertices';
        break;
      case ActionEnum.CREATE_TANGENT_LINE:
        this.text = 'Select circle and select point or create point on it';
        break;
      case ActionEnum.CREATE_TANGENT_CIRCLE:
        this.text = 'Select line or circle and select or create point';
        break;
      case ActionEnum.CREATE_CIRCUMCIRCLE:
      case ActionEnum.CREATE_INCIRCLE:
        this.text = 'Select polygon vertices. Repeat first point to finish';
        break;
      case ActionEnum.CREATE_ESCRIBED_CIRCLE:
      case ActionEnum.CREATE_MEDIAN:
      case ActionEnum.CREATE_ALTITUDE:
        this.text = 'Select triangle vertices';
        break;
      case ActionEnum.CREATE_MID_SEGMENT:
        this.text = 'Select arms vertices';
        break;
      case ActionEnum.SET_SEGMENT_LENGHT:
        this.text = 'Select segment ends and enter formula';
        break;
      case ActionEnum.SET_ANGLE_MEASURE:
        this.text = 'Select angle vertices and enter formula';
        break;
      case ActionEnum.ENTER_FORMULA:
        this.text = 'Enter formula';
        break;
      case ActionEnum.SET_PERIMETER:
      case ActionEnum.SET_AREA:
        this.text = 'Select polygon vertices and enter formula';
        break;
      case ActionEnum.CREATE_TRIANGLE:
      case ActionEnum.CREATE_SQUARE:
      case ActionEnum.CREATE_RECTANGLE:
      case ActionEnum.CREATE_REGULAR_POLYGON:
      case ActionEnum.CREATE_PARALLELOGRAM:
      case ActionEnum.CREATE_KITE:
      case ActionEnum.CREATE_RHOMBUS:
      case ActionEnum.CREATE_TRAPEZOID:
        this.text = 'Click on board or on shape';
        break;
      case ActionEnum.CREATE_INTERSECTION:
        this.text = 'Select two shapes(line or circle types)';
        break;
      default:
        // unreachable
        break;
    }
  }
}
