import { Injectable } from '@angular/core';

import * as THREE from 'three';

@Injectable()
export class UtilsService {

  constructor() { }

  public randomIntFromInterval(min, max) {
      return Math.floor(Math.random() * ( max - min + 1 ) + min);
  }

  public randomNoisyTexture(opacity: number): THREE.Texture {
    var canvas = document.createElement("canvas"),
        ctx = canvas.getContext('2d'),
        x, y,
        rdm,
        colorRGB = this.rainbowRGB(100,this.randomIntFromInterval(1,100)),
        opacity = opacity || .2;

      canvas.width = 128;
      canvas.height = 128;
      for ( x = 0; x < canvas.width; x++ ) {
        for ( y = 0; y < canvas.height; y++ ) {
            rdm = this.randomIntFromInterval(1,5);
            if(rdm === 1){
              ctx.fillStyle = "rgba(1,1,1," + opacity + ")";
              ctx.fillRect(x, y, 1, 1);
            } else {
              ctx.fillStyle = "rgba(" + colorRGB.r + "," + colorRGB.g + "," + colorRGB.b + ",1)";
              ctx.fillRect(x, y, 1, 1);
            }
            
        }
      }
      const tex = new THREE.Texture(canvas);
      tex.needsUpdate = true;
      return tex;
  }

  public generateNoiseTexture(width,height,opacity) {
      var canvas = document.createElement("canvas"),
      ctx = canvas.getContext('2d'),
      x, y,
      number,
      opacity = opacity || .2;

      canvas.width = width;
      canvas.height = height;

      for ( x = 0; x < canvas.width; x++ ) {
        for ( y = 0; y < canvas.height; y++ ) {

            number = Math.floor( Math.random() * 60 );
            ctx.fillStyle = "rgba(" + number + "," + number + "," + number + "," + opacity + ")";
            ctx.fillRect(x, y, 1, 1);
        }
      }
      const tex = new THREE.Texture(canvas);
      tex.needsUpdate = true;
      return tex;
  }

  public rainbow(numOfSteps, step) {
      // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
      // Adam Cole, 2011-Sept-14
      // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
      var r, g, b;
      var h = step / numOfSteps;
      var i = ~~(h * 6);
      var f = h * 6 - i;
      var q = 1 - f;
      switch(i % 6){
          case 0: r = 1; g = f; b = 0; break;
          case 1: r = q; g = 1; b = 0; break;
          case 2: r = 0; g = 1; b = f; break;
          case 3: r = 0; g = q; b = 1; break;
          case 4: r = f; g = 0; b = 1; break;
          case 5: r = 1; g = 0; b = q; break;
      }
      var c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
      return (c);
  }

  public rainbowRGB(numOfSteps, step) {
      // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
      // Adam Cole, 2011-Sept-14
      // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
      var r, g, b;
      var h = step / numOfSteps;
      var i = ~~(h * 6);
      var f = h * 6 - i;
      var q = 1 - f;
      switch(i % 6){
          case 0: r = 1; g = f; b = 0; break;
          case 1: r = q; g = 1; b = 0; break;
          case 2: r = 0; g = 1; b = f; break;
          case 3: r = 0; g = q; b = 1; break;
          case 4: r = f; g = 0; b = 1; break;
          case 5: r = 1; g = 0; b = q; break;
      }
      var c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
      return (this.hexToRgb(c));
  }

  public hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

}
