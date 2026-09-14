// --- GAME CONFIG & STATE ---
const CONFIG = {
  maxSpeed: 0.85,
  reverseSpeed: -0.25,
  acceleration: 0.015,
  friction: 0.98,
  offRoadFriction: 0.90,
  turnSpeed: 0.035,
  driftTurnMultiplier: 1.4,
  gravity: 0.02
};

const keys = { up: false, down: false, left: false, right: false, drift: false };

let lap = 1;
const maxLaps = 3;
let checkpointPassed = false;
let gameFinished = false;

// --- THREE.JS INITIALIZATION ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x68c4fe);
scene.fog = new THREE.FogExp2(0x68c4fe, 0.008);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// --- LIGHTING ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(100, 150, 50);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 500;
const d = 150;
dirLight.shadow.camera.left = -d;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = -d;
scene.add(dirLight);

// --- ENVIRONMENT & TRACK CREATION ---
const trackCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, 120),
  new THREE.Vector3(140, 0, 80),
  new THREE.Vector3(160, 0, -60),
  new THREE.Vector3(60, 0, -140),
  new THREE.Vector3(-60, 0, -100),
  new THREE.Vector3(-140, 0, -40),
  new THREE.Vector3(-120, 0, 80)
], true);

const trackGeo = new THREE.TubeGeometry(trackCurve, 200, 18, 16, true);
const trackMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });
const trackMesh = new THREE.Mesh(trackGeo, trackMat);
trackMesh.scale.y = 0.05;
trackMesh.position.y = 0.1;
trackMesh.receiveShadow = true;
scene.add(trackMesh);

const curbGeo = new THREE.TubeGeometry(trackCurve, 200, 19.5, 16, true);
const curbMat = new THREE.MeshStandardMaterial({ color: 0xe74c3c, roughness: 0.5 });
const curbMesh = new THREE.Mesh(curbGeo, curbMat);
curbMesh.scale.y = 0.04;
curbMesh.receiveShadow = true;
scene.add(curbMesh);

const groundGeo = new THREE.PlaneGeometry(1000, 1000);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x55aa44, roughness: 1.0 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

function createHills() {
  const hillGeo = new THREE.SphereGeometry(30, 16, 16);
  const hillMat = new THREE.MeshStandardMaterial({ color: 0x449933, roughness: 0.9 });
  const positions = [
    [-80, 0, -30], [80, 0, -20], [-100, 0, 30], [100, 0, 20], [0, 0, -80]
  ];

  positions.forEach(pos => {
    const hill = new THREE.Mesh(hillGeo, hillMat);
    hill.position.set(pos[0], -10, pos[2]);
    hill.scale.set(1.5, 1, 1.5);
    scene.add(hill);
  });
}
createHills();

const itemBoxes = [];
function createItemBoxes() {
  const boxGeo = new THREE.BoxGeometry(3, 3, 3);
  const boxMat = new THREE.MeshStandardMaterial({ color: 0xffcc00, metalness: 0.3, roughness: 0.3 });
  const positions = [
    new THREE.Vector3(0, 2.5, -120),
    new THREE.Vector3(150, 2.5, 10),
    new THREE.Vector3(-120, 2.5, 20)
  ];

  positions.forEach(pos => {
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.copy(pos);
    box.castShadow = true;
    scene.add(box);
    itemBoxes.push(box);
  });
}
createItemBoxes();

// --- KART CREATION (Procedural 3D Model) ---
const kartGroup = new THREE.Group();

const bodyGeo = new THREE.BoxGeometry(2.2, 0.8, 3.8);
const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe74c3c, metalness: 0.1, roughness: 0.2 });
const body = new THREE.Mesh(bodyGeo, bodyMat);
body.position.y = 0.6;
body.castShadow = true;
kartGroup.add(body);

const seatGeo = new THREE.BoxGeometry(1.6, 1.2, 0.6);
const seatMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
const seat = new THREE.Mesh(seatGeo, seatMat);
seat.position.set(0, 1.2, -0.6);
kartGroup.add(seat);

const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 16);
const wheelMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });
const wheels = [];
const wheelPositions = [
  [-1.2, 0.5, 1.2],
  [1.2, 0.5, 1.2],
  [-1.2, 0.5, -1.2],
  [1.2, 0.5, -1.2]
];

wheelPositions.forEach(pos => {
  const wheel = new THREE.Mesh(wheelGeo, wheelMat);
  wheel.rotation.z = Math.PI / 2;
  wheel.position.set(...pos);
  wheel.castShadow = true;
  kartGroup.add(wheel);
  wheels.push(wheel);
});

const helmetGeo = new THREE.SphereGeometry(0.55, 16, 16);
const helmetMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
const helmet = new THREE.Mesh(helmetGeo, helmetMat);
helmet.position.set(0, 1.5, -0.2);
helmet.castShadow = true;
kartGroup.add(helmet);

scene.add(kartGroup);

const kartState = {
  pos: new THREE.Vector3(0, 0, 120),
  velocity: new THREE.Vector3(),
  speed: 0,
  angle: Math.PI / 2,
  driftDir: 0
};
kartGroup.position.copy(kartState.pos);

// --- INPUT LISTENERS ---
window.addEventListener('keydown', e => setKeys(e.code, true));
window.addEventListener('keyup', e => setKeys(e.code, false));

function setKeys(code, isPressed) {
  if (code === 'KeyW' || code === 'ArrowUp') keys.up = isPressed;
  if (code === 'KeyS' || code === 'ArrowDown') keys.down = isPressed;
  if (code === 'KeyA' || code === 'ArrowLeft') keys.left = isPressed;
  if (code === 'KeyD' || code === 'ArrowRight') keys.right = isPressed;
  if (code === 'ShiftLeft' || code === 'Space') keys.drift = isPressed;
}

const raycaster = new THREE.Raycaster();
const downVector = new THREE.Vector3(0, -1, 0);

function isOnTrack() {
  raycaster.set(kartGroup.position.clone().add(new THREE.Vector3(0, 2, 0)), downVector);
  const intersects = raycaster.intersectObject(trackMesh);
  return intersects.length > 0;
}

// --- GAME LOOP & PHYSICS ---
function updatePhysics() {
  if (gameFinished) return;

  const onTrack = isOnTrack();
  const currentFriction = onTrack ? CONFIG.friction : CONFIG.offRoadFriction;

  if (keys.up) {
    kartState.speed += CONFIG.acceleration;
  } else if (keys.down) {
    kartState.speed -= CONFIG.acceleration;
  } else {
    kartState.speed *= currentFriction;
  }

  const maxSpd = onTrack ? CONFIG.maxSpeed : CONFIG.maxSpeed * 0.45;
  if (kartState.speed > maxSpd) kartState.speed = maxSpd;
  if (kartState.speed < CONFIG.reverseSpeed) kartState.speed = CONFIG.reverseSpeed;

  let effectiveTurnSpeed = CONFIG.turnSpeed;
  if (keys.drift && Math.abs(kartState.speed) > 0.3 && (keys.left || keys.right)) {
    if (kartState.driftDir === 0) kartState.driftDir = keys.left ? -1 : 1;
    effectiveTurnSpeed *= CONFIG.driftTurnMultiplier;
  } else {
    kartState.driftDir = 0;
  }

  if (Math.abs(kartState.speed) > 0.05) {
    const dirFactor = kartState.speed >= 0 ? 1 : -1;
    if (keys.left) kartState.angle += effectiveTurnSpeed * dirFactor;
    if (keys.right) kartState.angle -= effectiveTurnSpeed * dirFactor;
  }

  kartGroup.rotation.y = kartState.angle;
  wheels.forEach(w => w.rotation.x += kartState.speed * 0.5);
  kartGroup.rotation.z = THREE.MathUtils.lerp(kartGroup.rotation.z, -kartState.driftDir * 0.15, 0.1);

  const forward = new THREE.Vector3(Math.sin(kartState.angle), 0, Math.cos(kartState.angle));
  kartGroup.position.addScaledVector(forward, kartState.speed);

  const distToStart = kartGroup.position.distanceTo(new THREE.Vector3(0, 0, 120));
  const distToCheckpoint = kartGroup.position.distanceTo(new THREE.Vector3(0, 0, -120));

  if (distToCheckpoint < 25) checkpointPassed = true;

  if (checkpointPassed && distToStart < 25) {
    checkpointPassed = false;
    lap++;
    if (lap > maxLaps) {
      gameFinished = true;
      document.getElementById('finish-screen').style.display = 'block';
      document.getElementById('lap-display').innerText = 'FINISH!';
    } else {
      document.getElementById('lap-display').innerText = `LAP ${lap} / ${maxLaps}`;
    }
  }

  const speedKm = Math.round(Math.abs(kartState.speed) * 160);
  document.getElementById('speed-display').innerText = `${speedKm} KM/H`;
}

function updateCamera() {
  const cameraOffset = new THREE.Vector3(
    -Math.sin(kartState.angle) * 14,
    6,
    -Math.cos(kartState.angle) * 14
  );

  const targetCamPos = kartGroup.position.clone().add(cameraOffset);
  camera.position.lerp(targetCamPos, 0.1);
  camera.lookAt(kartGroup.position.clone().add(new THREE.Vector3(0, 1.5, 0)));
}

function animateEnvironment() {
  itemBoxes.forEach(box => {
    box.rotation.y += 0.03;
    box.position.y = 2.5 + Math.sin(Date.now() * 0.003) * 0.3;
  });
}

function animate() {
  requestAnimationFrame(animate);
  updatePhysics();
  updateCamera();
  animateEnvironment();
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
