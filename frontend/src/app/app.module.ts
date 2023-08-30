import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AppRoutingModule } from './app-routing.module';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatButtonModule } from '@angular/material/button'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatIconModule } from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card'
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { InstructionSnackBarComponent } from './dashboard/snackbars/instructionSnackBar.component';
import { InfoSnackBarComponent } from './dashboard/snackbars/infoSnackBar.component';
import { DivideSegmentDialogComponent } from './dashboard/dialogs/divideSegmentDialog.component';
import { DivideAngleDialogComponent } from './dashboard/dialogs/divideAngleDialog.component';
import { EnterFormulaDialogComponent } from './dashboard/dialogs/enterFormula.component';
import { SetSegmentLengthDialogComponent } from './dashboard/dialogs/setSegmentLength.component';
import { SetAngleMeasureDialogComponent } from './dashboard/dialogs/setAngleMeasure.component';
import { AngleIsConvexDialogComponent } from './dashboard/dialogs/angleIsConvexDialog.component';
import { SetPerimeterDialogComponent } from './dashboard/dialogs/setPerimeter.component';
import { SetAreaDialogComponent } from './dashboard/dialogs/setArea.component';
import { EnterPolygonSidesNumberDialogComponent } from './dashboard/dialogs/enterPolygonSidesNumberDialog.component';



@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    InstructionSnackBarComponent,
    InfoSnackBarComponent,
    DivideSegmentDialogComponent,
    DivideAngleDialogComponent,
    EnterFormulaDialogComponent,
    SetSegmentLengthDialogComponent,
    SetAngleMeasureDialogComponent,
    AngleIsConvexDialogComponent,
    SetPerimeterDialogComponent,
    SetAreaDialogComponent,
    EnterPolygonSidesNumberDialogComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatTabsModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
