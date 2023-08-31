import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PolygonType } from '../board/PolygonType';

export interface TriangleType {
  name: string;
  type: PolygonType.SCALENE_ACUTE_TRIANGLE | PolygonType.SCALENE_RIGHT_TRIANGLE | PolygonType.EQUILATERAL_TRIANGLE | PolygonType.ISOSCELES_ACUTE_TRIANGLE | PolygonType.ISOSCELES_RIGHT_TRIANGLE | PolygonType.OBTUSE_SCALENE_TRIANGLE | PolygonType.OBTUSE_ISOSCELES_TRIANGLE;
  state: boolean;
}

@Component({
  selector: 'select-triangle-type-dialog',
  template: `
  <h1 mat-dialog-title> Select Triangle Type </h1>
  <div mat-dialog-content style="padding-top: 0px; padding-bottom: 0px;">
    <mat-chip-listbox class="mat-mdc-chip-set-stacked" aria-label="Type selection">
      <mat-chip-option *ngFor="let type of availableTypes" [selected]="type.state" (click)="changeSelected(type.type)">
        {{type.name}}
      </mat-chip-option>
    </mat-chip-listbox>
  </div>
  <div mat-dialog-actions>
    <button mat-button (click)="this.dialogRef.close(undefined);"> Cancel </button>
    <button mat-button (click)="this.dialogRef.close({numberValue: this.selectedType});"> Select </button>
  </div>
  `
})
export class SelectTriangleTypeDialogComponent {
  availableTypes: TriangleType[] = [
    {name: 'Scalene & Acute', type: PolygonType.SCALENE_ACUTE_TRIANGLE, state: true},
    {name: 'Scalene & Right', type: PolygonType.SCALENE_RIGHT_TRIANGLE, state: false},
    {name: 'Equilateral', type: PolygonType.EQUILATERAL_TRIANGLE, state: false},
    {name: 'Isosceles & Acute', type: PolygonType.ISOSCELES_ACUTE_TRIANGLE, state: false},
    {name: 'Isosceles & Right', type: PolygonType.ISOSCELES_RIGHT_TRIANGLE, state: false},
    {name: 'Scalene & Obtuse', type: PolygonType.OBTUSE_SCALENE_TRIANGLE, state: false},
    {name: 'Isosceles & Obtuse', type: PolygonType.OBTUSE_ISOSCELES_TRIANGLE, state: false},
  ];

  selectedType: PolygonType | undefined = PolygonType.SCALENE_TRAPEZOID;

  changeSelected(type: PolygonType) {
    if(this.selectedType == type) {
      this.selectedType = undefined;
    }
    else {
      this.selectedType = type;
    }
  }

  constructor(
    public dialogRef: MatDialogRef<SelectTriangleTypeDialogComponent>,
  ) { }
}