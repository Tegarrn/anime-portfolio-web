import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin } from '@pixiv/three-vrm';

// Dapatkan container dari halaman HTML
const container = document.getElementById('canvas-container');
if (!container) {
    throw new Error("Container #canvas-container tidak ditemukan");
}

// 1. Scene
const scene = new THREE.Scene();

// 2. Kamera
const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 1.3, -1.2); // Atur posisi kamera sedikit mundur dan ke atas
camera.rotation.set(0, Math.PI, 0); // Putar kamera agar menghadap model

// 3. Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// 4. Pencahayaan
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1).normalize();
scene.add(light);

// 5. Loader
const loader = new GLTFLoader();

// Daftarkan plugin VRM
loader.register((parser) => {
    return new VRMLoaderPlugin(parser);
});

// Muat model VRM
loader.load(
    '/character.vrm', // Path ke model di folder `public`
    (gltf) => {
        const vrm = gltf.userData.vrm;
        scene.add(vrm.scene);
        console.log('Model VRM berhasil dimuat:', vrm);
    },
    (progress) => {
        console.log('Loading model...', 100.0 * (progress.loaded / progress.total), '%');
    },
    (error) => {
        console.error('Gagal memuat model:', error);
    }
);

// Fungsi untuk animasi
function animate() {
    requestAnimationFrame(animate);
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