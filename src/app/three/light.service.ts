import { Injectable } from '@angular/core';

import * as THREE from 'three';

@Injectable()
export class LightService {

  private enableLightHelpers: Boolean = false;

  private scene: THREE.Scene;

  public shadowMapSize = 1024;
  //public shadowMapSize = 2048;

  /* LIGHTS */

  public light: THREE.DirectionalLight;
  public light2: THREE.PointLight;

  constructor(
  ) { }

  public create(_scene: THREE.Scene) {
    this.scene = _scene;

    this.scene.add( new THREE.AmbientLight( 0xABABAB ) );

    this.light = new THREE.DirectionalLight( 0xffffff, 1 );
    this.light.position.set( -10, 10, 0 );
    this.light.castShadow = true;
    this.light.shadow.mapSize.width = this.shadowMapSize;
    this.light.shadow.mapSize.height = this.shadowMapSize;
    //this.light.shadowBias = 0.9;
    
    this.light.shadowCameraLeft = -50;
    this.light.shadowCameraRight = 50;
    this.light.shadowCameraTop = 50;
    this.light.shadowCameraBottom = -50;
    this.light.shadowCameraNear = 0;
    this.light.shadowCameraFar = 1000;
    this.light.lookAt(new THREE.Vector3(0,0,0));
    this.scene.add( this.light );

    if ( this.enableLightHelpers) {
      this.light.add( new THREE.DirectionalLightHelper( this.light, 1 ) );
    }
    

    /*
    this.light = new THREE.PointLight( 0xffffff, 1 );
    this.light.position.set( -10, 10, 5 );
    this.light.castShadow = true;
    this.light.shadow.mapSize.width = this.shadowMapSize;
    this.light.shadow.mapSize.height = this.shadowMapSize;
    this.scene.add( this.light );

    if ( this.enableLightHelpers) {
      this.light.add( new THREE.PointLightHelper( this.light, 1 ) );
    }
    */

    /*
    this.light2 = new THREE.PointLight( 0xffffff, 1 );
    this.light2.position.set( 10, 10, 5 );
    this.light2.castShadow = true;
    this.light2.shadow.mapSize.width = this.shadowMapSize;
    this.light2.shadow.mapSize.height = this.shadowMapSize;
    this.scene.add( this.light2 );

    if ( this.enableLightHelpers) {
      this.light2.add( new THREE.PointLightHelper( this.light2, 1 ) );
    }
    */

  }

  public animate() {

  }

}
