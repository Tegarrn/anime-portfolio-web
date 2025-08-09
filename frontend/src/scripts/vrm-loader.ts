import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VRM, VRMExpressionPresetName, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';

let currentVrm: VRM | null = null;
const clock = new THREE.Clock();
let animationState: 'idle' | 'talking' = 'idle';

// Interval untuk kedipan mata
let blinkInterval: ReturnType<typeof setInterval> | null = null;

const container = document.getElementById('canvas-container');
if (!container) throw new Error("Container #canvas-container tidak ditemukan");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, container.clientWidth / container.clientHeight, 0.1, 20);
camera.position.set(0, 1.2, 1.5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1.0, 0);

const light = new THREE.DirectionalLight(0xffffff, Math.PI);
light.position.set(1, 1, 1).normalize();
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, Math.PI * 0.3));


const loader = new GLTFLoader();
loader.register((parser) => new VRMLoaderPlugin(parser));

loader.load('/character.vrm', (gltf) => {
    const vrm = gltf.userData.vrm as VRM;
    VRMUtils.removeUnnecessaryJoints(gltf.scene);
    VRMUtils.rotateVRM0(vrm);
    scene.add(vrm.scene);
    currentVrm = vrm;
    console.log("Model dimuat & pose diperbaiki.");
    startBlinking(); // Mulai kedipan mata setelah model dimuat
},
(progress) => console.log('Loading...', progress.loaded / progress.total * 100, '%'),
(error) => console.error(error)
);

function animate() {
    requestAnimationFrame(animate);
    const deltaTime = clock.getDelta();

    if (currentVrm) {
        currentVrm.update(deltaTime); // Update internal VRM (termasuk ekspresi)

        const upperChest = currentVrm.humanoid.getNormalizedBoneNode('upperChest');
        const elapsedTime = clock.getElapsedTime();
        
        if (upperChest) {
            if (animationState === 'idle') {
                const sway = Math.sin(elapsedTime * 0.7) * 0.015;
                upperChest.rotation.z = sway;
            } else if (animationState === 'talking') {
                const sway = Math.sin(elapsedTime * 2.5) * 0.03;
                upperChest.rotation.z = sway;
            }
        }
    }
    
    controls.update();
    renderer.render(scene, camera);
}
animate();

// --- Fungsi Kedipan Mata yang Diperbaiki ---
function blink() {
    if (!currentVrm?.expressionManager) return;
    
    // Set ekspresi "blink" menjadi penuh (mata tertutup)
    currentVrm.expressionManager.setValue(VRMExpressionPresetName.Blink, 1.0);
    
    // Setelah 100ms, kembalikan ke 0 (mata terbuka)
    setTimeout(() => {
        if (currentVrm?.expressionManager) {
            currentVrm.expressionManager.setValue(VRMExpressionPresetName.Blink, 0.0);
        }
    }, 100);
}

function startBlinking() {
    if (blinkInterval) clearInterval(blinkInterval);
    // Jalankan fungsi blink setiap 2-5 detik secara acak
    blinkInterval = setInterval(blink, 2000 + Math.random() * 3000);
}

function stopBlinking() {
    if (blinkInterval) {
        clearInterval(blinkInterval);
        blinkInterval = null;
    }
}

// Fungsi yang diekspor untuk dikontrol oleh api-client.ts
export function startTalking() {
    animationState = 'talking';
    stopBlinking(); // Hentikan kedipan otomatis saat berbicara
}

export function stopTalking() {
    animationState = 'idle';
    startBlinking(); // Mulai lagi kedipan otomatis setelah selesai
}