import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DependencyCategoryEnum } from '../shared/enums/DependencyCategoryEnum';
import { DependencyTypeEnum } from '../shared/enums/DependencyTypeEnum';
import { DependencyReasonEnum } from '../shared/enums/DependencyReasonEnum';
import { DependencyImportanceEnum } from '../shared/enums/DependencyImportanceEnum';

  
@Component({
  selector: 'configure-solution-dialog',
  template: `
  <h1 mat-dialog-title> Configure Solution </h1>
  <div mat-dialog-content style="padding-top: 0px; padding-bottom: 0px;">
    <mat-accordion>
      <mat-expansion-panel *ngFor="let item of currentItems">
          <mat-expansion-panel-header>
              <p>{{ item.name }}</p>
          </mat-expansion-panel-header>
          
          <mat-chip-listbox [multiple]="true" [selectable]="true" class="mat-mdc-chip-set-stacked" aria-label="Type selection">
            <mat-chip-option *ngFor="let value of item.values" [selected]="value.checked" (click)="changeSelected(value)">
              {{value.name}}
            </mat-chip-option>
          </mat-chip-listbox>
      </mat-expansion-panel>
    </mat-accordion>
  </div>
  <div mat-dialog-actions>
    <button mat-button (click)="this.dialogRef.close(undefined);"> Cancel </button>
    <button mat-button (click)="this.dialogRef.close(this.prepareOutpus(currentItems)); this.save()"> Confirm </button>
  </div>
  `
})
export class ConfigureSolutionDialogComponent {
  static initialized: boolean = false;
  static items = [
    { name: 'Categories', values: [] as {name: string, checked: boolean}[] },
    { name: 'Types', values: [] as {name: string, checked: boolean}[] },
    { name: 'Reasons', values: [] as {name: string, checked: boolean}[] },
    { name: 'Importances', values: [] as {name: string, checked: boolean}[] }
  ];

  currentItems = [
    { name: 'Categories', values: [] as {name: string, checked: boolean}[] },
    { name: 'Types', values: [] as {name: string, checked: boolean}[] },
    { name: 'Reasons', values: [] as {name: string, checked: boolean}[] },
    { name: 'Importances', values: [] as {name: string, checked: boolean}[] }
  ];

  constructor(
    public dialogRef: MatDialogRef<ConfigureSolutionDialogComponent>
  ) {
    if(!ConfigureSolutionDialogComponent.initialized) { 
      for(const category of this.getEnumValues(DependencyCategoryEnum)) {
        ConfigureSolutionDialogComponent.items[0].values.push({name: category, checked: true})
      }

      for(const type of this.getEnumValues(DependencyTypeEnum)) {
        ConfigureSolutionDialogComponent.items[1].values.push({name: type, checked: true})
      }

      for(const reason of this.getEnumValues(DependencyReasonEnum)) {
        ConfigureSolutionDialogComponent.items[2].values.push({name: reason, checked: true})
      }

      for(const importance of this.getEnumValues(DependencyImportanceEnum)) {
        ConfigureSolutionDialogComponent.items[3].values.push({name: importance, checked: true})
      }

      ConfigureSolutionDialogComponent.initialized = true;
    }

    for(let feature = 0; feature < 4; feature++) {
      for(let valIdx = 0; valIdx < ConfigureSolutionDialogComponent.items[feature].values.length; valIdx++) {
        this.currentItems[feature].values.push({
          name: ConfigureSolutionDialogComponent.items[feature].values[valIdx].name,
          checked: ConfigureSolutionDialogComponent.items[feature].values[valIdx].checked
        });
      }
    }
  }

  changeSelected(value: {name: string, checked: boolean}) {
    value.checked = !value.checked;
  }

  save() {
    for(let feature = 0; feature < 4; feature++) {
      for(let valIdx = 0; valIdx < this.currentItems[feature].values.length; valIdx++) {
        ConfigureSolutionDialogComponent.items[feature].values[valIdx].checked = this.currentItems[feature].values[valIdx].checked;
      }
    }
  }

  prepareOutpus(data: any): [DependencyCategoryEnum[], DependencyTypeEnum[], DependencyReasonEnum[], DependencyImportanceEnum[]] {
    var categories: DependencyCategoryEnum[] = [];
    var types: DependencyTypeEnum[] = [];
    var reasons: DependencyReasonEnum[] = [];
    var importances: DependencyImportanceEnum[] = [];

    for(let i = 0; i < data[0].values.length; i++) {
      if(data[0].values[i].checked)
        categories.push(DependencyCategoryEnum[data[0].values[i].name as keyof typeof DependencyCategoryEnum]);
    }

    for(let i = 0; i < data[1].values.length; i++) {
      if(data[1].values[i].checked)
        types.push(DependencyTypeEnum[data[1].values[i].name as keyof typeof DependencyTypeEnum]);
    }

    for(let i = 0; i < data[2].values.length; i++) {
      if(data[2].values[i].checked)
        reasons.push(DependencyReasonEnum[data[2].values[i].name as keyof typeof DependencyReasonEnum]);
    }

    for(let i = 0; i < data[3].values.length; i++) {
      if(data[3].values[i].checked)
        importances.push(DependencyImportanceEnum[data[3].values[i].name as keyof typeof DependencyImportanceEnum]);
    }

    return [categories, types, reasons, importances];
  }

  private getEnumValues(enumClass: any): string[] {
    return Object.keys(enumClass).map(key => enumClass[key]).filter(value => typeof value === 'string') as string[];
  }
}