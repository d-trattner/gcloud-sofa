import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { SceneComponent } from './scene/scene.component';

import { UtilsService } from './three/utils.service';
import { CameraService } from './three/camera.service';
import { LightService } from './three/light.service';
import { PhysicsService } from './three/physics.service';
import { ObjectsService } from './three/objects.service';

@NgModule({
  declarations: [
    AppComponent,
    SceneComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [
    UtilsService,
    CameraService,
    LightService,
    PhysicsService,
    ObjectsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
