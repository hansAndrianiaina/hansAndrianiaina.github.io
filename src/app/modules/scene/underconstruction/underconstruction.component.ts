import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import * as THREE from "three";

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Component({
  selector: 'app-underconstruction',
  templateUrl: './underconstruction.component.html',
  styleUrls: ['./underconstruction.component.scss']
})
export class UnderconstructionComponent implements OnInit {

  @ViewChild('canvas', { static : true }) canvasRef : 
  ElementRef<
    HTMLCanvasElement
  >;
 
  ngOnInit(): void {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    const renderer = new THREE.WebGLRenderer({
      canvas : this.canvasRef.nativeElement,
      antialias : true
    });

    renderer.setSize( window.innerWidth, window.innerHeight );
    // document.body.appendChild( renderer.domElement );

    // load scene
    const loader : GLTFLoader = new GLTFLoader();

    loader.load(
      'assets/gltf/under_construction.glb',
      function ( gltf ){
        var model = gltf.scene;
        model.scale.set(0.1, 0.1, 0.1);
        scene.add( model );
        console.log("loading done");
      },
      function ( xhr ){
        console.log('loading underconstruction scene');
      },
      function ( error ){
        console.log('An error occured while loader under_construction scene : ' + error);
      }
    );


    // add light
    const filllight : THREE.HemisphereLight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
    scene.add(filllight);
    const light : THREE.PointLight = new THREE.PointLight( 0xffffff, 0.5);
    light.position.set(0, 2, 2); 
    scene.add( light );
    
    camera.position.z = 5;
    camera.position.y = 5;

    // add fog
    scene.fog = new THREE.FogExp2(0xffffff, 0.06);
    renderer.setClearColor(0xffffff);
    // add helper 
    const gridHelper = new THREE.GridHelper( 10, 10 );
    scene.add( gridHelper );

    // add control
    const controls : OrbitControls = new OrbitControls( camera, renderer.domElement );
    controls.enableDamping = true;
  

    // render and animate scene
    controls.update();

    function animate() {
    
      requestAnimationFrame( animate );
    
      // required if controls.enableDamping or controls.autoRotate are set to true
      controls.update();
    
      renderer.render( scene, camera );
    
    }

    animate();

  }
}
