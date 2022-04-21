import * as THREE from 'three'

export default class HomeScene extends THREE.Scene 
{
    addStars(){
        // star geometry 
        const starGeometry = new THREE.SphereGeometry(0.25, 0.25, 0.25);
        // star material
        const starMaterial = new THREE.MeshStandardMaterial({ color : 0xffffff});
        // star object
        const star = new THREE.Mesh(starGeometry, starMaterial);
        // random star position
        const [x, y, z] = Array(3).fill(null).map( () => THREE.MathUtils.randFloatSpread(100) );
        star.position.set(x,y,z);
        // add star to the scene
        this.add(star);
    }

    initialize()
    {
        // set background
        const spaceTexture = new THREE.TextureLoader().load('Assets/Images/space_background.jpg');
        this.background = spaceTexture;

        // function to add star to the scene
        for (var i = 0; i < 98; i++) {
            this.addStars();
        }
        // Array(200).fill(1).forEach(this.addStars);

        // add point ligh to the scene 
        const   pointLight = new THREE.PointLight(0xFFFFFF);
        pointLight.position.set(5,5,5);
        this.add(pointLight);

        // add ambient light to the scene
        const ambientLight = new THREE.AmbientLight(0xFFFFFF);
        this.add(ambientLight);

        // add grid helper
        const gridHelper = new THREE.GridHelper(100,100);
        this.add(gridHelper);

    }
};