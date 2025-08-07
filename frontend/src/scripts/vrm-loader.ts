import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';

// --- Variabel Global ---
let currentVrm: VRM | null = null;
const clock = new THREE.Clock();

// Dapatkan container dari halaman HTML
const container = document.getElementById('canvas-container');
if (!container) {
    throw new Error("Container #canvas-container tidak ditemukan");
}

// 1. Scene
const scene = new THREE.Scene();

// 2. Kamera
const camera = new THREE.PerspectiveCamera(30, container.clientWidth / container.clientHeight, 0.1, 20);
camera.position.set(0, 1.2, 1.2); // Posisikan kamera sedikit lebih jauh

// 3. Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// --- Kontrol Kamera (OrbitControls) ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Membuat gerakan lebih halus
controls.target.set(0, 1.0, 0); // Arahkan target kamera ke bagian tengah tubuh model
controls.update();

// 4. Pencahayaan (dibuat lebih baik)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(0.5, 1.0, 1.0).normalize();
scene.add(directionalLight);

// 5. Loader
const loader = new GLTFLoader();
loader.register((parser) => new VRMLoaderPlugin(parser));

// Muat model VRM
loader.load(
    '/character.vrm',
    (gltf) => {
        const vrm = gltf.userData.vrm as VRM;
        scene.add(vrm.scene);
        currentVrm = vrm;

        // Putar model agar menghadap ke depan
        VRMUtils.rotateVRM0(vrm);

        console.log('Model VRM berhasil dimuat:', vrm);
    },
    (progress) => console.log('Loading model...', 100.0 * (progress.loaded / progress.total), '%'),
    (error) => console.error('Gagal memuat model:', error)
);

// Fungsi untuk animasi
function animate() {
    requestAnimationFrame(animate);
    const deltaTime = clock.getDelta();

    // Jika model sudah dimuat, jalankan animasi idle
    if (currentVrm) {
        // --- Animasi Idle Sederhana ---
        // Dapatkan tulang dada (chest)
        const chest = currentVrm.humanoid.getNormalizedBoneNode('chest');
        if (chest) {
            // Buat gerakan bergoyang halus menggunakan sinus
            const elapsedTime = clock.getElapsedTime();
            const sway = Math.sin(elapsedTime * 0.7) * 0.02; // Goyangan kecil
            const breath = Math.sin(elapsedTime * 1.0) * 0.005; // Gerakan napas
            
            chest.rotation.y = sway;
            chest.position.y = 1.05 + breath; // Sesuaikan '1.05' jika posisi awal dada berbeda
        }
        
        currentVrm.update(deltaTime); // Update VRM
    }

    controls.update(); // Update kontrol kamera
    renderer.render(scene, camera);
}

// Mulai animasi
animate();

// Handle window resize
window.addEventListener('resize', () => {
    if (container) {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }
});