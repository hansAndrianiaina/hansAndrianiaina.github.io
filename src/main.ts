import './style.css'

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import HomeScene from './scenes/HomeScene';
import UnderConstruction from './scenes/UnderConstruction';

// scene setup
const scene = new UnderConstruction();
scene.initialize();

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE. WebGLRenderer({
  canvas : document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(100);
camera.position.setY(30);


// add orbit control
const orbitControl = new OrbitControls(camera, renderer.domElement);



// gameloop animation
function Animate(){
  requestAnimationFrame( Animate );

  orbitControl.update();

  renderer.render(scene, camera);
}

Animate();


// render scene
renderer.render(scene, camera);