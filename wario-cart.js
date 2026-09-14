const CONFIG = {
  laps: 3,
  maxSpeed: 32,
  reverseSpeed: -9,
  acceleration: 42,
  brake: 52,
  drag: 0.93,
  offRoadDrag: 0.72,
  turnSpeed: 2.4,
  driftTurnMultiplier: 1.45,
  driftBoostThreshold: 0.7,
  boostSpeed: 62,
  boostDuration: 1.8,
  aiSpeed: 25
};

const keys = { up: false, down: false, left: false, right: false, drift: false };
const clock = new THREE.Clock();
const scene = new THREE.Scene();
const container = document.getElementById('canvas-container');
const lapDisplay = document.getElementById('lap-display');
const speedDisplay = document.getElementById('speed-display');
const raceStatus = document.getElementById('race-status');
const countdown = document.getElementById('countdown');
const startPanel = document.getElementById('start-panel');
const finishScreen = document.getElementById('finish-screen');

scene.background = new THREE.Color(0x91c8e8);
scene.fog = new THREE.Fog(0x91c8e8, 260, 900);
const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 1400);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xdaf1ff, 0x29452c, 1.5));
const sun = new THREE.DirectionalLight(0xfff1d2, 2.4);
sun.position.set(100, 180, 60);
sun.castShadow = true;
sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;
sun.shadow.camera.left = -300;
sun.shadow.camera.right = 300;
sun.shadow.camera.top = 300;
sun.shadow.camera.bottom = -300;
sun.shadow.bias = -0.00015;
scene.add(sun);

const coursePoints = [
  [0, 140], [65, 132], [125, 98], [153, 35], [135, -28], [174, -78],
  [126, -126], [55, -105], [18, -160], [-48, -145], [-102, -112],
  [-145, -55], [-132, 5], [-178, 55], [-135, 112], [-68, 92]
].map(point => new THREE.Vector3(point[0], 0, point[1]));
const trackCurve = new THREE.CatmullRomCurve3(coursePoints, true, 'catmullrom', 0.35);
const routeSamples = 720;
const roadWidth = 18;
const routePoints = Array.from({ length: routeSamples }, (_, index) => trackCurve.getPointAt(index / routeSamples));
const routeTangents = Array.from({ length: routeSamples }, (_, index) => trackCurve.getTangentAt(index / routeSamples).normalize());
const shortcutPaths = [];

function makeRibbon(width, color, y, lift = 0) {
  const vertices = [];
  const indices = [];
  for (let index = 0; index < routeSamples; index += 1) {
    const point = routePoints[index];
    const tangent = routeTangents[index];
    const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize().multiplyScalar(width / 2);
    vertices.push(point.x - side.x, y + lift, point.z - side.z, point.x + side.x, y + lift, point.z + side.z);
    const next = (index + 1) % routeSamples;
    indices.push(index * 2, next * 2, index * 2 + 1, index * 2 + 1, next * 2, next * 2 + 1);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: 0.88, metalness: 0.02 }));
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

const ground = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), new THREE.MeshStandardMaterial({ color: 0x527f42, roughness: 0.96, metalness: 0 }));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);
makeRibbon(roadWidth + 5, 0xd14a38, 0.14);
const trackMesh = makeRibbon(roadWidth, 0x30343a, 0.22, 0.02);
makeRibbon(1.1, 0xf4e8bd, 0.3, 0.04);

function addScenery() {
  const hillMaterial = new THREE.MeshStandardMaterial({ color: 0x347d39, roughness: 1 });
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x5b3925, roughness: 0.95 });
  const canopyMaterial = new THREE.MeshStandardMaterial({ color: 0x2f7138, roughness: 0.9 });
  for (let index = 0; index < 20; index += 1) {
    const angle = index * 1.73;
    const hill = new THREE.Mesh(new THREE.SphereGeometry(25 + (index % 3) * 9, 16, 12), hillMaterial);
    hill.position.set(Math.cos(angle) * (220 + index % 4 * 22), -14, Math.sin(angle) * (220 + index % 4 * 22));
    hill.scale.y = 0.7;
    hill.receiveShadow = true;
    scene.add(hill);
  }
  for (let index = 0; index < 28; index += 1) {
    const angle = index * 2.41;
    const radius = 105 + (index % 5) * 24;
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.5, 8, 8), trunkMaterial);
    const canopy = new THREE.Mesh(new THREE.ConeGeometry(6 + (index % 3), 14 + (index % 4) * 2, 9), canopyMaterial);
    trunk.position.y = 4;
    canopy.position.y = 13;
    trunk.castShadow = true;
    canopy.castShadow = true;
    tree.add(trunk, canopy);
    tree.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    tree.rotation.y = angle;
    tree.scale.setScalar(0.8 + (index % 4) * 0.12);
    scene.add(tree);
  }
}
addScenery();

function routePosition(progress, lane = 0, height = 0) {
  const index = Math.floor(((progress % 1 + 1) % 1) * routeSamples);
  const point = routePoints[index];
  const tangent = routeTangents[index];
  const side = new THREE.Vector3(-tangent.z, 0, tangent.x);
  return point.clone().addScaledVector(side, lane).setY(height);
}

function makeMarker(progress, color, width = 5) {
  const marker = new THREE.Mesh(new THREE.BoxGeometry(width, 0.18, 2.8), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.15 }));
  const point = routePosition(progress, 0, 0.45);
  marker.position.copy(point);
  marker.rotation.y = Math.atan2(routeTangents[Math.floor(progress * routeSamples)].x, routeTangents[Math.floor(progress * routeSamples)].z);
  marker.receiveShadow = true;
  scene.add(marker);
  return marker;
}

const boostPads = [0.14, 0.42, 0.68, 0.86].map(progress => makeMarker(progress, 0x22d9ff, 7));
const shortcutBridges = [];
[[0.27, 0.34], [0.58, 0.64]].forEach(([start, end]) => {
  const startPoint = routePosition(start, 0, 0.6);
  const endPoint = routePosition(end, 0, 0.6);
  const middle = startPoint.clone().add(endPoint).multiplyScalar(0.5);
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(13, 0.35, startPoint.distanceTo(endPoint)), new THREE.MeshStandardMaterial({ color: 0xf2c94c, emissive: 0x8f6500, emissiveIntensity: 0.25 }));
  bridge.position.copy(middle);
  bridge.rotation.y = Math.atan2(endPoint.x - startPoint.x, endPoint.z - startPoint.z);
  bridge.userData.start = start;
  bridge.userData.end = end;
  scene.add(bridge);
  shortcutBridges.push(bridge);
  const shortcutPoints = [];
  for (let step = 0; step <= 20; step += 1) {
    const amount = step / 20;
    const point = startPoint.clone().lerp(endPoint, amount);
    point.y = 0.38;
    shortcutPoints.push(point);
  }
  shortcutPaths.push(shortcutPoints);
});

function makeShortcutRoad(points) {
  const vertices = [];
  const indices = [];
  points.forEach((point, index) => {
    const previous = points[Math.max(0, index - 1)];
    const next = points[Math.min(points.length - 1, index + 1)];
    const tangent = next.clone().sub(previous).normalize();
    const side = new THREE.Vector3(-tangent.z, 0, tangent.x).multiplyScalar(6.5);
    vertices.push(point.x - side.x, 0.42, point.z - side.z, point.x + side.x, 0.42, point.z + side.z);
    if (index < points.length - 1) indices.push(index * 2, index * 2 + 2, index * 2 + 1, index * 2 + 1, index * 2 + 2, index * 2 + 3);
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x56616a, roughness: 0.75 }));
  mesh.receiveShadow = true;
  scene.add(mesh);
}
shortcutPaths.forEach(makeShortcutRoad);

const itemBoxes = [];
const itemProgress = [0.08, 0.21, 0.37, 0.51, 0.72, 0.9];
itemProgress.forEach((progress, index) => {
  const box = new THREE.Mesh(new THREE.BoxGeometry(3.6, 3.6, 3.6), new THREE.MeshStandardMaterial({ color: 0xffd21f, emissive: 0x9b6700, emissiveIntensity: 0.4, metalness: 0.25, roughness: 0.3 }));
  box.position.copy(routePosition(progress, index % 2 ? 3.6 : -3.6, 3));
  box.userData.progress = progress;
  box.userData.active = true;
  box.castShadow = true;
  scene.add(box);
  itemBoxes.push(box);
});

const obstacles = [];
function addObstacle(progress, lane, type = 'barrel') {
  const material = new THREE.MeshStandardMaterial({ color: type === 'barrel' ? 0xf26e5d : 0x8b5cf6, roughness: 0.55 });
  const geometry = type === 'barrel' ? new THREE.CylinderGeometry(1.8, 1.8, 3.5, 12) : new THREE.BoxGeometry(4, 3.5, 4);
  const obstacle = new THREE.Mesh(geometry, material);
  obstacle.position.copy(routePosition(progress, lane, type === 'barrel' ? 1.8 : 1.75));
  obstacle.userData.progress = progress;
  obstacle.userData.lane = lane;
  obstacle.userData.hit = false;
  obstacle.castShadow = true;
  scene.add(obstacle);
  obstacles.push(obstacle);
}
[[0.05, -4], [0.18, 4], [0.32, 0], [0.47, -4], [0.56, 4], [0.75, 0], [0.82, -4], [0.94, 4]].forEach((item, index) => addObstacle(item[0], item[1], index % 2 ? 'crate' : 'barrel'));

function createKart(color, label) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.9, 4.3), new THREE.MeshStandardMaterial({ color, metalness: 0.15, roughness: 0.28 }));
  body.position.y = 0.72;
  body.castShadow = true;
  group.add(body);
  const nose = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.38, 1.4), new THREE.MeshStandardMaterial({ color: 0xffd21f, roughness: 0.25 }));
  nose.position.set(0, 1.05, 1.35);
  group.add(nose);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.65, 1.25, 0.7), new THREE.MeshStandardMaterial({ color: 0x131722 }));
  seat.position.set(0, 1.42, -0.65);
  group.add(seat);
  const wheelGeometry = new THREE.CylinderGeometry(0.56, 0.56, 0.42, 14);
  const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x17191e, roughness: 0.85 });
  const wheels = [];
  [[-1.35, 0.52, 1.25], [1.35, 0.52, 1.25], [-1.35, 0.52, -1.25], [1.35, 0.52, -1.25]].forEach(position => {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(...position);
    wheel.castShadow = true;
    group.add(wheel);
    wheels.push(wheel);
  });
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.62, 16, 12), new THREE.MeshStandardMaterial({ color: 0xf5f5f5 }));
  helmet.position.set(0, 2.05, -0.2);
  helmet.castShadow = true;
  group.add(helmet);
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.5, 2.8, 12), new THREE.MeshBasicMaterial({ color: 0xff7a18, transparent: true, opacity: 0.9 }));
  flame.rotation.x = -Math.PI / 2;
  flame.position.set(0, 0.72, -3.1);
  flame.visible = false;
  group.add(flame);
  group.userData = { wheels, flame, label };
  scene.add(group);
  return group;
}

const playerKart = createKart(0xe74c3c, 'YOU');
const player = { mesh: playerKart, progress: 0, lane: 0, speed: 0, angle: 0, driftTime: 0, boostTimer: 0, boostReady: false, lap: 1, checkpoint: false, stunned: 0 };
const aiColors = [0x46a0ff, 0x9d55e8, 0x2ed39a, 0xff8c32];
const racers = aiColors.map((color, index) => {
  const mesh = createKart(color, `RIVAL ${index + 1}`);
  const racer = { mesh, progress: 0.985 - index * 0.008, lane: (index - 1.5) * 2.5, speed: CONFIG.aiSpeed + index * 1.2, lap: 1, phase: index * 1.7 };
  mesh.position.copy(routePosition(racer.progress, racer.lane, 0));
  return racer;
});

const raceState = { active: false, countdown: false, finished: false, elapsed: 0 };

function setKeys(code, pressed) {
  if (code === 'KeyW' || code === 'ArrowUp') keys.up = pressed;
  if (code === 'KeyS' || code === 'ArrowDown') keys.down = pressed;
  if (code === 'KeyA' || code === 'ArrowLeft') keys.left = pressed;
  if (code === 'KeyD' || code === 'ArrowRight') keys.right = pressed;
  if (code === 'ShiftLeft' || code === 'ShiftRight' || code === 'Space') keys.drift = pressed;
}
window.addEventListener('keydown', event => setKeys(event.code, true));
window.addEventListener('keyup', event => setKeys(event.code, false));

function beginRace() {
  if (raceState.active || raceState.countdown) return;
  raceState.countdown = true;
  startPanel.style.display = 'none';
  finishScreen.style.display = 'none';
  if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
  let count = 3;
  countdown.textContent = count;
  raceStatus.textContent = 'Get ready';
  const timer = setInterval(() => {
    count -= 1;
    if (count > 0) {
      countdown.textContent = count;
    } else {
      clearInterval(timer);
      countdown.textContent = 'GO!';
      raceState.countdown = false;
      raceState.active = true;
      raceStatus.textContent = 'Race on';
      setTimeout(() => { countdown.textContent = ''; }, 650);
    }
  }, 850);
}
document.getElementById('start-race').addEventListener('click', beginRace);

function getNearestRouteProgress(position) {
  let bestIndex = 0;
  let bestDistance = Infinity;
  const roughStep = 5;
  for (let index = 0; index < routeSamples; index += roughStep) {
    const distance = position.distanceToSquared(routePoints[index]);
    if (distance < bestDistance) { bestDistance = distance; bestIndex = index; }
  }
  return bestIndex / routeSamples;
}

function updatePlayer(delta) {
  if (!raceState.active || raceState.finished) return;
  if (player.stunned > 0) player.stunned -= delta;
  const nearestProgress = getNearestRouteProgress(playerKart.position);
  const nearestIndex = Math.floor(nearestProgress * routeSamples);
  const tangent = routeTangents[nearestIndex];
  const onShortcut = shortcutPaths.some(path => path.some(point => playerKart.position.distanceToSquared(point) < 55));
  const onRoad = playerKart.position.distanceTo(routePoints[nearestIndex]) < roadWidth * 0.72 || onShortcut;
  const grip = onRoad ? 1 : 0.58;
  if (player.stunned <= 0) {
    if (keys.up) player.speed += CONFIG.acceleration * delta;
    else if (keys.down) player.speed -= CONFIG.brake * delta;
    else player.speed *= Math.pow(onRoad ? CONFIG.drag : CONFIG.offRoadDrag, delta * 60);
    const drifting = keys.drift && Math.abs(player.speed) > 8 && (keys.left || keys.right);
    if (drifting) {
      player.driftTime += delta;
      player.boostReady = player.driftTime >= CONFIG.driftBoostThreshold;
    } else if (player.driftTime > 0) {
      if (player.boostReady) player.boostTimer = CONFIG.boostDuration;
      player.driftTime = 0;
      player.boostReady = false;
    }
    if (player.boostTimer > 0) player.boostTimer -= delta;
    const turn = CONFIG.turnSpeed * grip * delta * (player.boostTimer > 0 ? 1.05 : 1);
    if (keys.left) player.angle += turn * (player.speed >= 0 ? 1 : -1) * (keys.drift ? CONFIG.driftTurnMultiplier : 1);
    if (keys.right) player.angle -= turn * (player.speed >= 0 ? 1 : -1) * (keys.drift ? CONFIG.driftTurnMultiplier : 1);
    const maxSpeed = player.boostTimer > 0 ? CONFIG.boostSpeed : (onRoad ? CONFIG.maxSpeed : CONFIG.maxSpeed * 0.48);
    player.speed = THREE.MathUtils.clamp(player.speed, CONFIG.reverseSpeed, maxSpeed);
    const forward = new THREE.Vector3(Math.sin(player.angle), 0, Math.cos(player.angle));
    playerKart.position.addScaledVector(forward, player.speed * delta);
    playerKart.rotation.y = player.angle;
    playerKart.rotation.z = THREE.MathUtils.lerp(playerKart.rotation.z, keys.drift ? (keys.left ? 0.18 : -0.18) : 0, 0.12);
    playerKart.userData.wheels.forEach(wheel => { wheel.rotation.x += player.speed * delta * 1.6; });
    playerKart.userData.flame.visible = player.boostTimer > 0;
    playerKart.userData.flame.scale.set(1, 0.8 + Math.random() * 0.5, 1);
  }
  const updatedProgress = getNearestRouteProgress(playerKart.position);
  const progressDelta = updatedProgress - player.progress;
  if (progressDelta > 0.45) player.lap = Math.max(1, player.lap - 1);
  if (progressDelta < -0.45) {
    player.lap += 1;
    if (player.lap > CONFIG.laps) finishRace();
  }
  player.progress = updatedProgress;
  collectPowerUps();
  checkTrackObjects();
  updateHud();
}

function updateAi(delta) {
  if (!raceState.active || raceState.finished) return;
  racers.forEach((racer, index) => {
    racer.progress = (racer.progress + racer.speed * delta / 930) % 1;
    racer.lap = Math.floor((raceState.elapsed * racer.speed) / 930) + 1;
    const laneWave = Math.sin(raceState.elapsed * 0.9 + racer.phase) * 1.2;
    const targetLane = racer.lane + laneWave;
    racer.mesh.position.lerp(routePosition(racer.progress, targetLane, 0), 0.25);
    const tangent = routeTangents[Math.floor(racer.progress * routeSamples)];
    racer.mesh.rotation.y = Math.atan2(tangent.x, tangent.z);
    racer.mesh.userData.wheels.forEach(wheel => { wheel.rotation.x += racer.speed * delta * 1.6; });
    racer.mesh.userData.flame.visible = index === 1 && Math.sin(raceState.elapsed * 2) > 0.7;
  });
}

function collectPowerUps() {
  itemBoxes.forEach(box => {
    if (!box.userData.active || playerKart.position.distanceTo(box.position) > 5) return;
    box.userData.active = false;
    box.visible = false;
    player.boostTimer = Math.max(player.boostTimer, 1.25);
    player.speed = Math.min(CONFIG.boostSpeed, player.speed + 18);
    raceStatus.textContent = 'Power-up boost!';
    setTimeout(() => { if (raceState.active) raceStatus.textContent = 'Race on'; }, 900);
  });
}

function checkTrackObjects() {
  const currentProgress = getNearestRouteProgress(playerKart.position);
  boostPads.forEach(pad => {
    const padProgress = pad.position.distanceTo(playerKart.position) < 10;
    if (padProgress) player.boostTimer = Math.max(player.boostTimer, 0.8);
  });
  obstacles.forEach(obstacle => {
    if (obstacle.userData.hit) return;
    if (playerKart.position.distanceTo(obstacle.position) < 4.2) {
      obstacle.userData.hit = true;
      player.speed *= 0.28;
      player.stunned = 0.5;
      obstacle.rotation.x += 0.7;
      raceStatus.textContent = 'Obstacle hit!';
      setTimeout(() => { obstacle.userData.hit = false; if (raceState.active) raceStatus.textContent = 'Race on'; }, 700);
    }
  });
  racers.forEach(racer => {
    if (playerKart.position.distanceTo(racer.mesh.position) < 4.5) {
      player.speed *= 0.75;
      racer.speed *= 0.98;
    }
  });
  if (currentProgress > 0.26 && currentProgress < 0.35) player.speed = Math.min(player.speed + 2, CONFIG.boostSpeed);
}

function updateHud() {
  const position = 1 + racers.filter(racer => racer.lap > player.lap || (racer.lap === player.lap && racer.progress > player.progress)).length;
  lapDisplay.textContent = `LAP ${Math.min(player.lap, CONFIG.laps)} / ${CONFIG.laps} · ${position}/${racers.length + 1}`;
  speedDisplay.textContent = `${Math.round(Math.abs(player.speed) * 3.6)} KM/H`;
  if (player.boostReady) raceStatus.textContent = 'BOOST READY';
  else if (player.boostTimer > 0) raceStatus.textContent = 'ROCKET BOOST';
}

function finishRace() {
  raceState.finished = true;
  raceState.active = false;
  finishScreen.textContent = 'COURSE COMPLETE!';
  finishScreen.style.display = 'block';
  raceStatus.textContent = 'Finish line crossed';
}

function updateCamera(delta) {
  const forward = new THREE.Vector3(Math.sin(player.angle), 0, Math.cos(player.angle));
  const target = playerKart.position.clone().addScaledVector(forward, -18).add(new THREE.Vector3(0, 8, 0));
  camera.position.lerp(target, 1 - Math.pow(0.001, delta));
  camera.lookAt(playerKart.position.clone().add(new THREE.Vector3(0, 1.5, 0)).addScaledVector(forward, 5));
}

function animateEnvironment(delta) {
  itemBoxes.forEach((box, index) => {
    if (box.userData.active) {
      box.rotation.y += delta * 2.2;
      box.position.y = 3 + Math.sin(raceState.elapsed * 3 + index) * 0.45;
    }
  });
  boostPads.forEach((pad, index) => { pad.material.emissiveIntensity = 0.25 + Math.sin(raceState.elapsed * 5 + index) * 0.18; });
}

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);
  if (raceState.active) raceState.elapsed += delta;
  updatePlayer(delta);
  updateAi(delta);
  updateCamera(delta);
  animateEnvironment(delta);
  renderer.render(scene, camera);
}

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

playerKart.position.copy(routePosition(0.985, 0, 0));
playerKart.rotation.y = Math.atan2(routeTangents[routeSamples - 1].x, routeTangents[routeSamples - 1].z);
updateHud();
animate();
