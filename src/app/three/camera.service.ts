import { Injectable } from '@angular/core';

import * as THREE from 'three';
import { OrbitControls } from 'three-orbitcontrols-ts';

//import 'three/examples/js/controls/OrbitControls';

//declare var OrbitControls: any;
//import '../../../node_modules/three/examples/js/controls/OrbitControls.js';
//declare var THREE.OrbitControls: any;

import {TweenMax, Power2} from 'gsap';

import { UtilsService } from '../three/utils.service';

@Injectable()
export class CameraService {

  private scene: THREE.Scene;

  public camera: THREE.PerspectiveCamera;
  public cameraTarget: THREE.Vector3;
  private radius: number = 20;
  private angle: number = 0;
  private speed: number = 0.05;

  public controls: OrbitControls;

  private fieldOfView: number = 75;
  private nearClippingPane: number = 0.1;
  private farClippingPane: number = 1100;

  constructor(
    public utils: UtilsService
  ) {}

  public create(_scene: THREE.Scene, canvas: HTMLCanvasElement) {
    this.scene = _scene;

    // 1
    this.camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      canvas.clientWidth / canvas.clientHeight,
      this.nearClippingPane,
      this.farClippingPane
    );

    this.camera.position.set( -7, 5, 8 );
    this.cameraTarget = new THREE.Vector3(0, 0, 0);
    this.camera.lookAt(this.cameraTarget);

    this.controls = new OrbitControls( this.camera );
    this.controls.target = this.cameraTarget;

  }

  public update() {
    this.camera.updateProjectionMatrix();
  }

  public animate(delta: number) {
    /*
    this.camera.position.x = this.radius * Math.sin(this.angle*Math.PI/180);
    this.camera.position.z = this.radius * Math.cos(this.angle*Math.PI/180);
    this.camera.lookAt(this.cameraTarget);
    this.angle += this.speed;
    this.angle = this.angle >= 360 ? 0 : this.angle;*/
  }

}
