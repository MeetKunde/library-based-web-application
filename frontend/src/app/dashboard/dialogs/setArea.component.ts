import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

  
@Component({
  selector: 'set-area-dialog',
  template: `
  <h1 mat-dialog-title> Set Polygon Area </h1>
  <div mat-dialog-content style="padding-top: 0px; padding-bottom: 0px;">
    <form [formGroup]="this.form">
      <mat-form-field>
        <input matInput formControlName="stringInput">
      </mat-form-field>
    </form>
  </div>
  <div mat-dialog-actions>
    <button mat-button (click)="this.dialogRef.close(undefined);"> Cancel </button>
    <button mat-button (click)="this.dialogRef.close(this.form.value);"> Confirm </button>
  </div>
  `
})
export class SetAreaDialogComponent {
  form: FormGroup

  constructor(
    public dialogRef: MatDialogRef<SetAreaDialogComponent>,
    private _formBuilder: FormBuilder
  ) {
    this.form = this._formBuilder.group({
      stringInput: new FormControl('')
    });
  }
}