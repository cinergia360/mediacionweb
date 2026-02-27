// =========================================================
// CINERGIA 360 · FAUNO MODELO 3D
// - Viewer Three.js (OrbitControls + GLTFLoader)
// - Hover: highlight + audio del nombre de la parte (debounced)
// - Click: abre panel con nombre, descripción y botón de audio
// - Botón de audio: toggle play/pause con estado visual (aria-pressed)
// - Sistema de audio: delega a window.C360Audio (un solo audio a la vez)
// - Panel: se cierra con botón ×, clic fuera o tecla Escape
// =========================================================

import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

// ================= DEBUG / ELEMENTOS DEL DOM =================
const debugEl  = document.getElementById("modeloDebug");
const canvas   = document.getElementById("viewerCanvas");
const setDebug = (m) => { if (debugEl) debugEl.textContent = m; };

setDebug("Cargando modelo…");

// ================= RENDERER / SCENE / CAMERA =================
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 10000);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.zoomSpeed     = 3.5;
controls.panSpeed      = 1.5;
controls.rotateSpeed   = 1.2;

scene.add(new THREE.AmbientLight(0xffffff, 1));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(2, 3, 2);
scene.add(dirLight);

const loader    = new GLTFLoader();
let   model     = null;
const raycaster = new THREE.Raycaster();
const mouse     = new THREE.Vector2();

// ================= MAPA DE PARTES =================
// audioNombre → se reproduce al pasar el cursor (hover)
// audioDesc   → se reproduce desde el botón del panel (click)
const PARTES = {
  "Head": {
    title:       "Cabeza",
    text:        "La cabeza es alargada y tiene rasgos marcados. La superficie no es lisa: tiene grietas y relieves. La textura se ve rugosa y desgastada.",
    audioNombre: "audio/Cabeza.mp3",
    audioDesc:   "audio/Cabeza_Descripcion.mp3"
  },
  "Horns": {
    title:       "Cuernos",
    text:        "Los cuernos salen desde la parte superior de la cabeza y se curvan hacia atrás. Son gruesos en la base y terminan en punta. Tienen líneas marcadas en la superficie.",
    audioNombre: "audio/Cuernos.mp3",
    audioDesc:   "audio/Cuernos_Descripcion.mp3"
  },
  "Chest": {
    title:       "Torso",
    text:        "El torso es fuerte y vertical. Se notan relieves que parecen costillas. La superficie tiene partes hundidas y partes que sobresalen.",
    audioNombre: "audio/Torso.mp3",
    audioDesc:   "audio/Torso_Descripcion.mp3"
  }
};

// ================= HOVER HIGHLIGHT =================
let hoveredMesh             = null;
let hoveredOriginalMaterial = null;

const hoverMaterial = new THREE.MeshStandardMaterial({
  color:     0xffffff,
  emissive:  0x444444,
  metalness: 0.05,
  roughness: 0.35
});

function setHovered(mesh) {
  if (hoveredMesh && hoveredMesh !== mesh) {
    hoveredMesh.material    = hoveredOriginalMaterial;
    hoveredMesh             = null;
    hoveredOriginalMaterial = null;
  }
  if (!mesh) {
    canvas.style.cursor = "default";
    return;
  }
  if (hoveredMesh === mesh) return;
  hoveredMesh             = mesh;
  hoveredOriginalMaterial = mesh.material;
  mesh.material           = hoverMaterial;
  canvas.style.cursor     = "pointer";
}

// ================= HOVER AUDIO =================
const hoverAudioEl = new Audio();
let currentHoverName = null;
let hoverAudioTimer  = null;

hoverAudioEl.addEventListener("ended", () => {
  window.C360Audio.onEnded(hoverAudioEl);
});

/**
 * Intenta reproducir el audio del nombre de la parte.
 * Debounce 300 ms. Se suprime si el panel de información está abierto.
 */
function triggerHoverAudio(meshName) {
  if (currentHoverName === meshName) return;
  currentHoverName = meshName;
  clearTimeout(hoverAudioTimer);

  // No reproducir si el panel está abierto
  if (popup && !popup.classList.contains("hidden")) return;

  const parte = PARTES[meshName];
  if (!parte?.audioNombre) return;

  hoverAudioTimer = setTimeout(() => {
    window.C360Audio.play(hoverAudioEl, parte.audioNombre, null);
  }, 300);
}

function stopHoverAudio() {
  currentHoverName = null;
  clearTimeout(hoverAudioTimer);
  window.C360Audio.stopIfEl(hoverAudioEl);
}

// ================= POINTER MOVE (hover) =================
canvas.addEventListener("pointermove", (event) => {
  if (!model) return;

  const rect = canvas.getBoundingClientRect();
  mouse.x    =  ((event.clientX - rect.left) / rect.width)  * 2 - 1;
  mouse.y    = -((event.clientY - rect.top)  / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(model.children, true);

  if (hits.length > 0 && hits[0].object.isMesh) {
    const hit = hits[0].object;
    setHovered(hit);
    triggerHoverAudio(hit.name);
  } else {
    setHovered(null);
    stopHoverAudio();
  }
});

canvas.addEventListener("mouseleave", () => {
  setHovered(null);
  stopHoverAudio();
});

// ================= CARGAR MODELO =================
loader.load(
  "models/faunoorigin_separeted.glb",
  (gltf) => {
    model = gltf.scene;
    scene.add(model);

    const box    = new THREE.Box3().setFromObject(model);
    const size   = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);

    camera.near = size / 1000;
    camera.far  = size * 1000;
    camera.updateProjectionMatrix();
    camera.position.set(0, size * 0.2, size * 0.9);

    controls.target.set(0, 0, 0);
    controls.update();

    setDebug("Modelo cargado. Pasa el cursor para escuchar; clic para ver información.");
  },
  undefined,
  () => {
    setDebug("No se pudo cargar el modelo.");
  }
);

// ================= RESIZE =================
function resize() {
  const parent = canvas.parentElement;
  const w = parent.clientWidth;
  const h = parent.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);
resize();

// ================= RENDER LOOP =================
(function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
})();

// ================= CLICK → POPUP =================
let isDragging = false;

controls.addEventListener("start", () => (isDragging = true));
controls.addEventListener("end",   () => setTimeout(() => (isDragging = false), 0));
canvas.addEventListener("pointerdown", () => (isDragging = false));

canvas.addEventListener("pointerup", (event) => {
  if (isDragging || !model) return;

  const rect = canvas.getBoundingClientRect();
  mouse.x    =  ((event.clientX - rect.left) / rect.width)  * 2 - 1;
  mouse.y    = -((event.clientY - rect.top)  / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(model.children, true);
  if (hits.length > 0) openPopup(hits[0].object.name);
});

// ================= POPUP =================
const popup        = document.getElementById("modeloPopup");
const popupAudio   = document.getElementById("popupAudio");   // <audio> del HTML
const popupAudioBtn = document.getElementById("popupAudioBtn");
const popupTitle   = document.getElementById("popupTitle");
const popupText    = document.getElementById("popupText");
const popupClose   = document.getElementById("popupClose");

let currentPopupMesh = null;   // nombre del mesh actualmente en el panel

// Propagamos el evento "ended" al gestor global
if (popupAudio) {
  popupAudio.addEventListener("ended", () => {
    window.C360Audio.onEnded(popupAudio);
  });
}

// Resetea el botón de audio del popup a su estado inicial
function resetPopupBtn() {
  if (!popupAudioBtn) return;
  popupAudioBtn.classList.remove("is-playing");
  popupAudioBtn.setAttribute("aria-pressed", "false");
  popupAudioBtn.innerHTML = '<i class="fa-solid fa-volume-high" aria-hidden="true"></i>';
}

// Botón de audio del popup — toggle play/pause
if (popupAudioBtn) {
  popupAudioBtn.setAttribute("aria-pressed", "false");

  popupAudioBtn.addEventListener("click", () => {
    const parte = PARTES[currentPopupMesh];
    const src   = parte?.audioDesc;
    if (!src) return;

    // Toggle: si está sonando, detener
    if (window.C360Audio.isPlaying(popupAudio)) {
      window.C360Audio.stop();
      return;
    }

    // Reproducir; resetPopupBtn se llama cuando sea detenido externamente
    window.C360Audio.play(popupAudio, src, resetPopupBtn);

    popupAudioBtn.classList.add("is-playing");
    popupAudioBtn.setAttribute("aria-pressed", "true");
    popupAudioBtn.innerHTML = '<i class="fa-solid fa-pause" aria-hidden="true"></i>';
  });
}

// Cerrar con botón ×
if (popupClose) {
  popupClose.addEventListener("click", closePopup);
}

// Cerrar al hacer clic en el overlay (fuera del panel de contenido)
if (popup) {
  popup.addEventListener("click", (e) => {
    if (e.target === popup) closePopup();
  });
}

// Cerrar con Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && popup && !popup.classList.contains("hidden")) {
    closePopup();
  }
});

function openPopup(meshName) {
  const parte = PARTES[meshName];
  const title = parte?.title ?? "Parte";
  const text  = parte?.text  ?? "Descripción no disponible.";

  if (popupTitle) popupTitle.textContent = title;
  if (popupText)  popupText.textContent  = text;

  // Detener hover audio y cualquier audio que esté sonando
  stopHoverAudio();
  window.C360Audio.stop();
  resetPopupBtn();

  currentPopupMesh = meshName;

  if (popup) {
    popup.classList.remove("hidden");
    if (popupClose) setTimeout(() => popupClose.focus(), 50);
  }
}

function closePopup() {
  if (!popup) return;
  popup.classList.add("hidden");

  // Detener solo el audio del popup (no interrumpir audio de la lista fallback)
  window.C360Audio.stopIfEl(popupAudio);
  resetPopupBtn();

  currentPopupMesh = null;
}
