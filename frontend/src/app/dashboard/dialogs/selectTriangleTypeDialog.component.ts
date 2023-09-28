import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PolygonTypeEnum } from '../shared/enums/PolygonTypeEnum';

export interface TriangleType {
  name: string;
  type: PolygonTypeEnum.SCALENE_RIGHT_TRIANGLE | PolygonTypeEnum.EQUILATERAL_TRIANGLE | PolygonTypeEnum.ISOSCELES_ACUTE_TRIANGLE | PolygonTypeEnum.ISOSCELES_RIGHT_TRIANGLE | PolygonTypeEnum.OBTUSE_ISOSCELES_TRIANGLE;
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
    {name: 'Scalene & Right', type: PolygonTypeEnum.SCALENE_RIGHT_TRIANGLE, state: false},
    {name: 'Equilateral', type: PolygonTypeEnum.EQUILATERAL_TRIANGLE, state: false},
    {name: 'Isosceles & Acute', type: PolygonTypeEnum.ISOSCELES_ACUTE_TRIANGLE, state: false},
    {name: 'Isosceles & Right', type: PolygonTypeEnum.ISOSCELES_RIGHT_TRIANGLE, state: false},
    {name: 'Isosceles & Obtuse', type: PolygonTypeEnum.OBTUSE_ISOSCELES_TRIANGLE, state: false},
  ];

  selectedType: PolygonTypeEnum | undefined = PolygonTypeEnum.SCALENE_TRAPEZOID;

  changeSelected(type: PolygonTypeEnum) {
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