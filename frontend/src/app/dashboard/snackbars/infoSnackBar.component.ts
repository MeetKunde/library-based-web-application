import { Component, Inject } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';


@Component({
  selector: 'app-dashboard-info-snack-bar',
  template: `
  <div style="display: flex; flex-direction: row; align-items: center; justify-content: space-between; padding: 0px;">
    <span style="margin: 0px; padding: 0px;"> {{ this.info }} </span>
    <button mat-button (click)="this.snackBarRef.dismiss();" style="color: white; margin: 0px; padding: 0px;"> {{ this.closeButtonLabel }} </button>
  </div>
  `
})
export class InfoSnackBarComponent {
  info: string = '';
  closeButtonLabel = 'OK!';

  constructor(
    public snackBarRef: MatSnackBarRef<InfoSnackBarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: { info: string; }
  ) { this.info = data.info; }
}
  