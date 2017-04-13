import { Component, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';

import * as THREE from 'three';

import { CameraService } from '../three/camera.service';
import { LightService } from '../three/light.service';
import { PhysicsService } from '../three/physics.service';
import { ObjectsService } from '../three/objects.service';

const EffectComposer = require('three-effectcomposer')(THREE);
const FXAAShader = require('../shaders/FXAAShader.js')(THREE);
const UnrealBloomPass = require('../postprocessing/UnrealBloomPass.js')(THREE);

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.css']
})
export class SceneComponent implements AfterViewInit {

  @ViewChild('canvas')
  private canvasRef: ElementRef;

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private renderPass: any;
  private composer: any;
  private effectFXAA: any;
  private bloomPass: any;

  private bloomParams = {
    projection: 'normal',
    background: false,
    exposure: 0.1,
    threshold: 0.7,
    strength: 0.1,
    radius: 10
  };

  private clock = new THREE.Clock();

  constructor(
    public cameraService: CameraService,
    public lightService: LightService,
    public physicsService: PhysicsService,
    public objectsService: ObjectsService
  ) { }

  //*************************************************************
    // EVENTS
  //*************************************************************
  
  @HostListener('window:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    //console.log(event, event.keyCode, event.char);
    if (event.key === '1') {
      this.objectsService.switchScene(this.objectsService.sceneOne);
    }
    if (event.key === '2') {
      this.objectsService.switchScene(this.objectsService.sceneTwo);
    }
    if (event.key === 's') {
      var imgData, imgNode;
      try {
          
          var strMime = "image/jpeg";
          var strDownloadMime = "image/octet-stream";
          
          // SIZE UP
          //const sw = 7680;
          //const sh = 4320;
          const sw = 3840;
          const sh = 2160;
          //this.renderer.setSize( sw, sh );
          //this.renderer.render( this.scene, this.cameraService.camera );
          //this.initComposer(sw,sh);
          this.renderer.setSize( sw, sh );
          //this.canvas.width = sw;
          //this.canvas.height = sh;
          //this.canvas.style.width = sw+"px";
          //this.canvas.style.height = sh+"px";
          //this.composer.setSize(sw, sh );
          //let delta = this.clock.getDelta();
          //this.composer.render(delta);
          this.cameraService.update();
          this.renderer.clear();
          this.renderer.render( this.scene, this.cameraService.camera );
          // TAKE SHOT
          imgData = this.renderer.domElement.toDataURL(strMime);
          //imgData = this.composer.domElement.toDataURL(strMime);
          
          // SIZE DOWN
          this.renderer.setSize( this.canvas.clientWidth, this.canvas.clientHeight );
          //this.canvas.width = this.canvas.clientWidth;
          //this.canvas.height = this.canvas.clientHeight;
          //this.canvas.style.width = this.canvas.clientWidth+"px";
          //this.canvas.style.height = this.canvas.clientHeight+"px";
          //this.composer.setSize(this.canvas.clientWidth, this.canvas.clientHeight );
          //this.initComposer();
          //delta = this.clock.getDelta();
          //this.renderer.clear();
          //this.composer.render(delta);
          this.cameraService.update();
          this.renderer.render( this.scene, this.cameraService.camera );

          // SAVE SHOT
          this.saveFile(imgData.replace(strMime, strDownloadMime), "sofas.jpg");

      } catch (e) {
          console.log(e);
          return;
      }
    }

    if (event.key === '1' || event.key === '2'  || event.key === '3') {
      //this.initComposer();
    }
  }

  saveFile(strData, filename) {
        var link = document.createElement('a');
        if (typeof link.download === 'string') {
            document.body.appendChild(link); //Firefox requires the link to be in the body
            link.download = filename;
            link.href = strData;
            link.click();
            document.body.removeChild(link); //remove the link when done
        } else {
            //location.replace(uri);
        }
    }

  public onMouseUp(event: MouseEvent) {
    //this.objectsService.sofa();
  }

  //*************************************************************
    // SCENE
  //*************************************************************

  private createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xffffff );
  }

  private initComposer(width: number = window.innerWidth, height: number = window.innerHeight) {

      console.log("Composer initializing with "+width+"x"+height);

      this.renderPass = new EffectComposer.RenderPass(this.scene, this.cameraService.camera);
      // renderPass.clear = true;
      this.effectFXAA = new EffectComposer.ShaderPass(FXAAShader);
      this.effectFXAA.uniforms['resolution'].value.set(1 / width, 1 / height );

      // smaaPass = new THREE.SMAAPass( window.innerWidth, window.innerHeight );
      // smaaPass.renderToScreen = true;


      const copyShader = new EffectComposer.ShaderPass(EffectComposer.CopyShader);
      copyShader.renderToScreen = true;


      const resolution = new THREE.Vector2(width, height);
      this.bloomPass = new UnrealBloomPass(resolution, this.bloomParams.strength, this.bloomParams.radius, this.bloomParams.threshold);
      //const bloomPass = new BloomPass(3, 100, 100, 256);
      // let filmPass = new FilmPass(0.8, 0.325, 256, false);
      // filmPass.renderToScreen = true;



      this.composer = new EffectComposer(this.renderer);
      this.composer.setSize(width, height);
      this.composer.addPass(this.renderPass);
      this.composer.addPass(this.effectFXAA);
      this.composer.addPass(this.bloomPass);
      // this.composer.addPass(filmPass);
      this.composer.addPass(copyShader);
      // composer.addPass( smaaPass );

      /*
      if (this.enableGui) {
        this.devGui.add( this.bloomParams, 'exposure', 0.1, 5 );
        this.devGui.add( this.bloomParams, 'threshold', 0.0, 1.0 ).onChange( function(value) {
          this.bloomPass.threshold = Number(value);
        });
        this.devGui.add( this.bloomParams, 'strength', 0.0, 10.0 ).onChange( function(value) {
          this.bloomPass.strength = Number(value);
        });
        this.devGui.add( this.bloomParams, 'radius', 0.0, 1.0 ).onChange( function(value) {
          this.bloomPass.radius = Number(value);
        });
      }
      */

  }

  private startRendering() {

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, preserveDrawingBuffer: false, antialias: true });
    //this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.gammaInput = true;
    this.renderer.gammaOutput = true;

    this.clock.start();

    this.initComposer();

    const ref: SceneComponent = this;

    (function render() {
      //console.log("rendering");
      requestAnimationFrame(render);

      const delta = ref.clock.getDelta();

      ref.physicsService.update(delta);
      ref.cameraService.animate(delta);
      ref.objectsService.animate(delta);

      //ref.renderer.toneMappingExposure = Math.pow( ref.bloomParams.exposure, 4.0 );
      // ref.renderer.render(ref.scene, ref.camera);
      ref.renderer.clear();
      ref.composer.render(delta);
      //ref.renderer.render(ref.scene,ref.cameraService.camera);
    }());
  }

  private initScene() {

    this.createScene();
    this.cameraService.create(this.scene, this.canvas);
    this.lightService.create(this.scene);
    this.physicsService.init(this.scene);
    this.objectsService.create(this.scene);
    this.objectsService.activeScene = this.objectsService.sceneOne;
    this.startRendering();

  }

  ngAfterViewInit() {
    this.initScene();
  }

}
