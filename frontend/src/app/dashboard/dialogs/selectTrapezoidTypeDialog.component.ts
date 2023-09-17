import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PolygonTypeEnum } from '../board/shared-enums/PolygonTypeEnum';

export interface TrapezoidType {
  name: string;
  type: PolygonTypeEnum.SCALENE_TRAPEZOID | PolygonTypeEnum.ISOSCELES_TRAPEZOID | PolygonTypeEnum.RIGHT_TRAPEZOID;
  state: boolean;
}
  
@Component({
  selector: 'select-trapezoid-type-dialog',
  template: `
  <h1 mat-dialog-title> Select Trapezoid Type </h1>
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
export class SelectTrapezoidTypeDialogComponent {
  availableTypes: TrapezoidType[] = [
    {name: 'Scalene', type: PolygonTypeEnum.SCALENE_TRAPEZOID, state: true},
    {name: 'Isosceles', type: PolygonTypeEnum.ISOSCELES_TRAPEZOID, state: false},
    {name: 'Right', type: PolygonTypeEnum.RIGHT_TRAPEZOID, state: false},
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
    public dialogRef: MatDialogRef<SelectTrapezoidTypeDialogComponent>,
  ) { }
}