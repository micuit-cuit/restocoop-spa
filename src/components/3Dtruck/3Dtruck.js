//setup un environment 3D avec Three.js
//importer les librairies
import * as THREE from 'three';
import { GLTFLoader } from 'GLTFLoader';
import { OrbitControls } from 'OrbitControls';
import { OBJLoader } from 'OBJLoader';
import { MTLLoader } from 'MTLLoader';

const divContainer = document.getElementById('3Dtruck--container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ alpha: true });
const controle = new OrbitControls(camera, renderer.domElement)
controle.enableZoom = true;
controle.enablePan = true;
controle.enableDamping = false;
renderer.setSize(window.innerWidth, window.innerHeight);
divContainer.appendChild(renderer.domElement);
var loader = new GLTFLoader();
let truck
loader.load( '/media/3D/truck.glb', function ( gltf )
{
    truck = gltf.scene;  // truck 3D object is loaded
    truck.scale.set(2, 2, 2);
    truck.position.y = 4;
    scene.add(truck);
} );        
// var mtlLoader = new MTLLoader();
// mtlLoader.load('/media/3D/truck.mtl', function (materials) {
//     materials.preload();
//     var objLoader = new OBJLoader();
//     objLoader.setMaterials(materials);
//     objLoader.load('/media/3D/truck.obj', function (object) {
//         truck = object;
//         truck.scale.set(2, 2, 2);
//         truck.position.y = 4;
//         scene.add(truck);
//     });
// });
scene.add(camera);
console.log(scene);
camera.position.z = 5;
function animate() {
    requestAnimationFrame(animate);
    truck.rotation.y += 0.01;
    controle.update();
    renderer.render(scene, camera);
}
window.onload = animate;
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});