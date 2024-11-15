import "./style.css";
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader';
import gsap from "gsap";

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 4;

// Renderer setup
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#draw'),
    antialias: true,
    alpha: true
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

// Postprocessing setup
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.0035; // Adjust the amount for desired effect
composer.addPass(rgbShiftPass);

let model;
// Load environment map
const rgbeLoader = new RGBELoader();
rgbeLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/pond_bridge_night_4k.hdr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    // scene.background = texture;
    
    // Load helmet model
    const loader = new GLTFLoader();
    // loader.load('/iron_man_helmet/scene.gltf', 
    loader.load('/DamagedHelmet.gltf', 
        (gltf) => {
            model = gltf.scene;
            scene.add(model);

            // Center model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);
            
            // Initial rotation
            // model.rotation.y = 0;
        },
        undefined, // Progress callback
        (error) => console.error('Error loading model:', error)
    );
});

let mouseX = 0;
let mouseY = 0;

window.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth - .5) * (Math.PI * .3);
    mouseY = (e.clientY / window.innerHeight - .5) * (Math.PI * .3);
});

function updateModelRotation() {
    if (model) {
        gsap.to(model.rotation, {
            x: mouseY,
            y: mouseX,
            duration: 0.5,
            ease: "power2.out"
        });
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    updateModelRotation();
    composer.render();
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

animate();
