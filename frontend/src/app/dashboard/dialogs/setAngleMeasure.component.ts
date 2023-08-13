import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

  
@Component({
  selector: 'set-angle-measure-dialog',
  template: `
  <h1 mat-dialog-title> Set Angle Measure </h1>
  <div mat-dialog-content style="padding-top: 0px; padding-bottom: 0px;">
    <form [formGroup]="this.form">
      <mat-form-field>
        <input matInput formControlName="stringInput">
      </mat-form-field>
      <mat-checkbox formControlName="booleanInput" color="primary"> Is the angle convex? </mat-checkbox>
    </form>
  </div>
  <div mat-dialog-actions>
    <button mat-button (click)="this.dialogRef.close(undefined);"> Cancel </button>
    <button mat-button (click)="this.dialogRef.close(this.form.value);"> Confirm </button>
  </div>
  `
})
export class SetAngleMeasureDialogComponent {
  form: FormGroup

  constructor(
    public dialogRef: MatDialogRef<SetAngleMeasureDialogComponent>,
    private _formBuilder: FormBuilder
  ) {
    this.form = this._formBuilder.group({
      stringInput: new FormControl(''),
      booleanInput: new FormControl(true)
    });
  }
}