import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ContainerComponent } from './components/container.component';
import { BoardComponent } from './components/keyboard.component';

@NgModule({
  declarations: [AppComponent, ContainerComponent, BoardComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
