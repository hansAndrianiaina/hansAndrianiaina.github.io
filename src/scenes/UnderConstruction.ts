import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default class UnderConstruction extends THREE.Scene 
{
    async initialize()
    {
        // load model from gltf file
        const loader = new GLTFLoader();

        const underConstruction = await loader.loadAsync( 'Assets/3D_models/GLTF/under_construction.glb');

        this.add(underConstruction.scene)
        // set background
        this.background = new THREE.Color( 0xffffff );
        // add ambient light to the scene
        const ambientLight = new THREE.AmbientLight(0xFFFFFF);
        this.add(ambientLight);
        // add directional light
        const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
        this.add( directionalLight );

    }
};