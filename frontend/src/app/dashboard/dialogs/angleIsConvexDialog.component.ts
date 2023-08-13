import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

  
@Component({
  selector: 'angle-is-convex-dialog',
  template: `
  <h1 mat-dialog-title> On which angle perform the action?  </h1>
  <div mat-dialog-content style="padding-top: 0px; padding-bottom: 0px;">
    <form [formGroup]="this.form">
      <mat-checkbox formControlName="booleanInput" color="primary"> Is the angle convex? </mat-checkbox>
    </form>
  </div>
  <div mat-dialog-actions>
    <button mat-button (click)="this.dialogRef.close(undefined);"> Cancel </button>
    <button mat-button (click)="this.dialogRef.close(this.form.value);"> Confirm </button>
  </div>
  `
})
export class AngleIsConvexDialogComponent {
  form: FormGroup

  constructor(
    public dialogRef: MatDialogRef<AngleIsConvexDialogComponent>,
    private _formBuilder: FormBuilder
  ) {
    this.form = this._formBuilder.group({
      booleanInput: new FormControl(true)
    });
  }
}