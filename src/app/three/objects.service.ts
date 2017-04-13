import { Injectable } from '@angular/core';

import * as THREE from 'three';

import { PhysicsService } from '../three/physics.service';
import { UtilsService } from '../three/utils.service';

@Injectable()
export class ObjectsService {

  private scene: THREE.Scene;

  private pos = new THREE.Vector3();
  private quat = new THREE.Quaternion();
  private jsonLoader = new THREE.JSONLoader();
  private sofaGeo: THREE.Geometry;
  private sofaTexture: THREE.Texture;

  private s = {
    mass:1,
    softmass: 15,
    pressure:120,
    friction: 0.1,
    damping: 0.01,
    stiffness: 0.9
  }

  private s2 = {
    mass:0.5,
  }

  public activeScene: number = 1;
  public sceneOne: number = 1;
  public sceneTwo: number = 2;

  private maxMeshes: number = 50;
  private meshes: Array<THREE.Mesh> = [];

  private spawnTime: number = 3;
  private deltaCounter: number = 0;

  private doNotClearUp: Array<THREE.Mesh> = [];

  constructor(
    public utils: UtilsService,
    public physicsService: PhysicsService
  ) { }

  create(_scene: THREE.Scene) {

    this.scene = _scene;

    // Ground
		this.pos.set( 0, -0.5, 0 );
		this.quat.set( 0, 90*Math.PI/180, 0, 1 );
    var ground = this.physicsService.createParalellepiped( 200, 1, 200, 0, this.pos.clone(), this.quat.clone(), new THREE.MeshStandardMaterial( { color: 0xFFFFFF, roughness:1, metalness: 0 } ) );
    ground.castShadow = true;
    ground.receiveShadow = true;
    ground.position.copy(this.pos);
    ground.rotation.set(this.quat.x,this.quat.y,this.quat.z);

    this.doNotClearUp.push(ground);

    //this.sofaTexture = this.utils.generateNoiseTexture(100,100,1);
    //this.sofaTexture.wrapS = this.sofaTexture.wrapT = THREE.RepeatWrapping;
    //this.sofaTexture.repeat.set( 10, 10 );

    this.jsonLoader.load( "assets/sofa_simple.json", ( geo: THREE.Geometry ) => {
      this.sofaGeo = geo;
    });

  }

  animate(delta: number){
    this.deltaCounter += delta;
    if(this.deltaCounter >= this.spawnTime){
      this.deltaCounter = 0;
      switch(this.activeScene){
        case this.sceneOne:
          this.physicsService.changeGravity(-9.8);
          this.sceneOneAnimate();
          break;
        case this.sceneTwo:
          this.physicsService.changeGravity(0.16*-9.8);
          this.sceneTwoAnimate();
          break;
      }
    }
  }

  switchScene(s: number){
    this.clearUp();
    this.activeScene = s;
  }

  clearUp(){
    for(let i=0; i<this.meshes.length; i++){
      this.scene.remove(this.meshes[i]);
    }
    this.meshes = [];
    this.physicsService.clearUp(this.doNotClearUp);
  }

  sceneOneAnimate(){
    if(this.meshes.length > this.maxMeshes){
      this.clearUp();
    } else {
      //console.log("sceneOneAnimate");
      let steps = 100;
      let step = this.utils.randomIntFromInterval(1,steps);
      this.pos.set( this.utils.randomIntFromInterval(-5,5), 20, this.utils.randomIntFromInterval(-5,5) );
      this.quat.set( this.utils.randomIntFromInterval(0,360)*Math.PI/180, this.utils.randomIntFromInterval(0,360)*Math.PI/180, this.utils.randomIntFromInterval(0,360)*Math.PI/180, 1 );
      let mesh: THREE.Mesh = new THREE.Mesh(this.sofaGeo, new THREE.MeshPhongMaterial( { color: this.utils.rainbow(steps,step), transparent:true  } ));
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.position.copy(this.pos);
      mesh.rotation.set(this.quat.x,this.quat.y,this.quat.z);
      
      

      this.physicsService.createFromJson(mesh,null,this.s.mass,this.pos.clone(),this.quat.clone());
      
      this.meshes.push(mesh);
      this.scene.add(mesh);
    }
  }


  sceneTwoAnimate(){
    if(this.meshes.length > this.maxMeshes){
      this.clearUp();
    } else {
      //console.log("sceneTwoAnimate");
      let steps = 100;
      let step = this.utils.randomIntFromInterval(1,steps);
      this.pos.set( this.utils.randomIntFromInterval(-5,5), 20, this.utils.randomIntFromInterval(-5,5) );
      this.quat.set( this.utils.randomIntFromInterval(0,360)*Math.PI/180, this.utils.randomIntFromInterval(0,360)*Math.PI/180, this.utils.randomIntFromInterval(0,360)*Math.PI/180, 1 );
      let mesh: THREE.Mesh = new THREE.Mesh(this.sofaGeo, new THREE.MeshPhongMaterial( { color: this.utils.rainbow(steps,step), transparent:true  } ));
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.position.copy(this.pos);
      mesh.rotation.set(this.quat.x,this.quat.y,this.quat.z);

      this.physicsService.createFromJson(mesh,null,this.s.mass,this.pos.clone(),this.quat.clone());
      
      this.meshes.push(mesh);
      this.scene.add(mesh);
    }
  }
  /*
  sceneTwoAnimate(){
    if(this.meshes.length > this.maxMeshes){
      this.clearUp();
    } else {
      console.log("sceneTwoAnimate");
      let steps = 100;
      let step = this.utils.randomIntFromInterval(1,steps);
      this.pos.set( this.utils.randomIntFromInterval(-5,5), 20, this.utils.randomIntFromInterval(-5,5) );
      this.quat.set( this.utils.randomIntFromInterval(0,360)*Math.PI/180, this.utils.randomIntFromInterval(0,360)*Math.PI/180, this.utils.randomIntFromInterval(0,360)*Math.PI/180, 1 );
      
      let mat = new THREE.MeshPhongMaterial({ color: this.utils.rainbow(steps,step)});
      var bufferGeom: any = new THREE.BufferGeometry().fromGeometry( this.sofaGeo );
      bufferGeom.translate( this.pos.x, this.pos.y, this.pos.z );
      let mesh = this.physicsService.createSoftVolume(bufferGeom,mat,this.s.softmass,this.s.pressure,this.s.friction,this.s.damping,this.s.stiffness);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.meshes.push(mesh);
      //let mesh = this.physicsService.createFromJsonSoft(this.sofaGeo,new THREE.MeshPhongMaterial({ color: this.utils.rainbow(steps,step)}), this.s.softmass, this.pos, this.quat, this.s);
      //mesh.castShadow = true;
      //mesh.receiveShadow = true;
      //this.meshes.push(mesh);
      
      
    }
  }
  */

  

}
