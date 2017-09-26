import { NgModule } from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { NgPipesModule } from 'ng-pipes';

import { AppComponent } from './app.component';
import { ResultsComponent } from './results/results.component';

import { ApiService } from './services/api.service';
import { ErrorService } from './services/error.service';
import { ModalService } from './services/modal.service';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    NgPipesModule
  ],
  declarations: [
    AppComponent,
    ResultsComponent
  ],
  providers: [
    ApiService,
    ErrorService,
    ModalService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {}
