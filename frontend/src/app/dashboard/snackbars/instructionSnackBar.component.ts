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
  exitButtonLabel = 'OK!';

  constructor(
    public snackBarRef: MatSnackBarRef<InstructionSnackBarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: { action: ActionEnum; }
  ) {
    switch(data.action) {
      case ActionEnum.CREATE_POINT:
        this.text = 'Click on board or on shape';
        break;
      case ActionEnum.CREATE_SEGMENT:
        this.text = 'Create/select two points';
        break;
      case ActionEnum.CREATE_LINE:
        this.text = 'Create/select two points';
        break;
      case ActionEnum.CREATE_RAY:
        this.text = 'Create/select two points';
        break;
      case ActionEnum.CREATE_CIRCLE:
        this.text = 'Create/select two points';
        break;
      case ActionEnum.CREATE_PERPENDICULAR_LINE:
        this.text = 'Select line and create/select point';
        break;
      case ActionEnum.CREATE_PARALLEL_LINE:
        this.text = 'Select line and create/select point';
        break;
      case ActionEnum.CREATE_MID_PERPENDICULAR:
        this.text = 'Create/select segment ends';
        break;
      case ActionEnum.CREATE_BISECTOR:
        this.text = 'Create/select angle points';
        break;
      case ActionEnum.SET_SEGMENT_LENGHT:
        this.text = 'Select segment ends and enter length';
        break;
      case ActionEnum.SET_ANGLE_MEASURE:
        this.text = 'Select angle points and enter measure';
        break;
      case ActionEnum.ENTER_FORMULA:
        this.text = 'Enter formula';
        break;
      case ActionEnum.DIVIDE_SEGMENT:
        this.text = 'Create/select segment ends and enter parts number';
        break;
      case ActionEnum.DIVIDE_ANGLE:
        this.text = 'Create/select angle points and enter parts number';
        break;
      case ActionEnum.SET_EQUAL_SEGMENTS:
        this.text = 'Create/select ends of segments';
        break;
      case ActionEnum.SET_EQUAL_ANGLES:
        this.text = 'Create/select points of angles';
        break;
      default:
        // do not display anything
        break;
    }
  }
}
