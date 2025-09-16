// Countdown Timer Logic
const festStart = new Date('2025-10-28T00:00:00Z');
const countdownEl = document.getElementById('countdown-timer');
function updateCountdown() {
    if (!countdownEl) return;
    const now = new Date();
    let diff = festStart - now;
    if (diff < 0) diff = 0;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}
setInterval(updateCountdown, 1000);
updateCountdown();

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- SCENE SETUP ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    antialias: true,
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

// --- LIGHTING ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 15, 15);
scene.add(ambientLight, pointLight);

// --- CONTROLS ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // For smooth camera movement
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 15;
controls.maxDistance = 50;

// --- BLOCH SPHERE ---
const sphereRadius = 10;
const sphereGroup = new THREE.Group(); // Group to hold all sphere elements

// Main Sphere
const sphereGeom = new THREE.SphereGeometry(sphereRadius, 32, 32);
const sphereMat = new THREE.MeshPhongMaterial({
    color: 0xaaaaaa,
    transparent: true,
    opacity: 0.1,
});
const mainSphere = new THREE.Mesh(sphereGeom, sphereMat);
sphereGroup.add(mainSphere);

// Sphere Wireframe
const wireframe = new THREE.LineSegments(
    new THREE.WireframeGeometry(sphereGeom),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 })
);
sphereGroup.add(wireframe);

// Axes (X, Y, Z)
const lineMat = new THREE.LineBasicMaterial({ color: 0xaaaaaa, transparent: true, opacity: 0.5 });
const axes = [
    new THREE.Vector3(-sphereRadius * 1.2, 0, 0), new THREE.Vector3(sphereRadius * 1.2, 0, 0), // X
    new THREE.Vector3(0, -sphereRadius * 1.2, 0), new THREE.Vector3(0, sphereRadius * 1.2, 0), // Y
    new THREE.Vector3(0, 0, -sphereRadius * 1.2), new THREE.Vector3(0, 0, sphereRadius * 1.2, 0)  // Z
];
for (let i = 0; i < axes.length; i += 2) {
    const geom = new THREE.BufferGeometry().setFromPoints([axes[i], axes[i+1]]);
    sphereGroup.add(new THREE.Line(geom, lineMat));
}

// Equator
const equatorGeom = new THREE.TorusGeometry(sphereRadius, 0.05, 16, 100);
const equatorMat = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, transparent: true, opacity: 0.5 });
const equator = new THREE.Mesh(equatorGeom, equatorMat);
equator.rotation.x = Math.PI / 2;
sphereGroup.add(equator);


// --- STATE VECTOR ---
const stateVectorGroup = new THREE.Group();
const vectorLineMat = new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 2 });
const vectorLineGeom = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, sphereRadius)]);
const vectorLine = new THREE.Line(vectorLineGeom, vectorLineMat);
stateVectorGroup.add(vectorLine);

const vectorHeadGeom = new THREE.SphereGeometry(0.3, 16, 16);
const vectorHeadMat = new THREE.MeshBasicMaterial({ color: 0xff00ff });
const vectorHead = new THREE.Mesh(vectorHeadGeom, vectorHeadMat);
vectorHead.position.set(0, 0, sphereRadius);
stateVectorGroup.add(vectorHead);

sphereGroup.add(stateVectorGroup);
scene.add(sphereGroup);


// --- LABELS ---
const labelsContainer = document.getElementById('labels-container');
const labels = {
    '|0⟩': new THREE.Vector3(0, sphereRadius + 1.5, 0),
    '|1⟩': new THREE.Vector3(0, -sphereRadius - 1.5, 0),
    '|+⟩': new THREE.Vector3(sphereRadius + 1.5, 0, 0),
    '|-⟩': new THREE.Vector3(-sphereRadius - 1.5, 0, 0),
    '|+i⟩': new THREE.Vector3(0, 0, sphereRadius + 1.5),
    '|-i⟩': new THREE.Vector3(0, 0, -sphereRadius - 1.5),
};

// Create HTML elements for labels
Object.keys(labels).forEach(key => {
    const div = document.createElement('div');
    div.className = 'label';
    div.textContent = key;
    labelsContainer.appendChild(div);
    labels[key].element = div; // Store element for later
});

function updateLabels() {
    Object.keys(labels).forEach(key => {
        const pos = labels[key].clone();
        pos.project(camera); // Project 3D position to 2D screen space

        const x = (pos.x * .5 + .5) * renderer.domElement.clientWidth;
        const y = (pos.y * -.5 + .5) * renderer.domElement.clientHeight;

        labels[key].element.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
    });
}


// --- BACKGROUND ELEMENTS ---
// Stars
function addStar() {
    const geometry = new THREE.SphereGeometry(0.1, 24, 24);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const star = new THREE.Mesh(geometry, material);

    const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(200));
    star.position.set(x, y, z);
    scene.add(star);
}
Array(300).fill().forEach(addStar);

// Floating Cubes
const cubeTexture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/crate.gif');
for (let i = 0; i < 5; i++) {
    const cube = new THREE.Mesh(
        new THREE.BoxGeometry(3, 3, 3),
        new THREE.MeshBasicMaterial({ map: cubeTexture })
    );
    cube.position.set(
        THREE.MathUtils.randFloatSpread(100),
        THREE.MathUtils.randFloatSpread(100),
        THREE.MathUtils.randFloatSpread(-150, -50)
    );
    scene.add(cube);
}

// --- ANIMATION LOOP ---
let theta = Math.PI / 4;
let phi = Math.PI / 4;

function animate() {
    requestAnimationFrame(animate);

    // Dynamic animation for the state vector
    const time = Date.now() * 0.0005;
    theta = (Math.sin(time * 0.5) + 1) * Math.PI / 2; // Varies between 0 and PI
    phi = time; // Constantly rotates

    const x = sphereRadius * Math.sin(theta) * Math.cos(phi);
    const y = sphereRadius * Math.cos(theta);
    const z = sphereRadius * Math.sin(theta) * Math.sin(phi);
    
    // Update vector head position
    vectorHead.position.set(x, y, z);
    
    // Update vector line
    const positions = vectorLine.geometry.attributes.position.array;
    positions[3] = x;
    positions[4] = y;
    positions[5] = z;
    vectorLine.geometry.attributes.position.needsUpdate = true;

    // Rotate the entire sphere group for a cool effect
    sphereGroup.rotation.y += 0.0005;

    // Update controls and labels
    controls.update();
    updateLabels();
    
    renderer.render(scene, camera);
}

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);


// Start the animation
animate();
