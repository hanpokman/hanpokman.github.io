import * as THREE from './assets/vendor/three.module.min.js';

// Everything here is drawn locally. These are original, conceptual sculptures,
// so the site never needs a model download, external texture, or API key.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const initialMotion = document.documentElement.dataset.motion;
let reducedMotion = initialMotion === 'full' ? false
  : initialMotion === 'reduced' ? true : motionPreference.matches;
const mobile = window.matchMedia('(max-width: 700px)').matches;
const scenes = [];
let frame = 0;
let pageVisible = !document.hidden;

// Large, soft studio panels give real metal its reflections. A plain light
// alone cannot create convincing chrome. PMREM converts this handmade studio
// panorama into the reflection texture used by all three models.
function studioTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const base = ctx.createLinearGradient(0, 0, 0, 512);
  base.addColorStop(0, '#a4a5a8');
  base.addColorStop(0.38, '#35363a');
  base.addColorStop(0.65, '#141518');
  base.addColorStop(1, '#9e9fa1');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 1024, 512);
  for (const [x, y, width, height, glow] of [
    [70, 42, 170, 320, '#ffffff'],
    [430, 80, 86, 330, '#f3f4f7'],
    [760, 20, 180, 180, '#ffffff'],
  ]) {
    ctx.shadowColor = glow;
    ctx.shadowBlur = 22;
    ctx.fillStyle = glow;
    ctx.fillRect(x, y, width, height);
  }
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#e2e2e4';
  ctx.fillRect(0, 14, 1024, 18);
  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createEnvironment(renderer, scene) {
  const source = studioTexture();
  const generator = new THREE.PMREMGenerator(renderer);
  try {
    const target = generator.fromEquirectangular(source);
    scene.environment = target.texture;
    return target;
  } finally {
    source.dispose();
    generator.dispose();
  }
}

function showFallback(state) {
  state.lost = true;
  state.renderer.domElement.style.visibility = 'hidden';
  state.element.classList.remove('is-ready');
  state.element.dataset.renderer = 'unavailable';
}

const metal = (color = 0xc7c8cb, roughness = 0.2, metalness = 1) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

function mesh(geometry, material, parent, position = [0, 0, 0]) {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(...position);
  parent.add(object);
  return object;
}

function box(width, height, depth, material, parent, position) {
  return mesh(new THREE.BoxGeometry(width, height, depth), material, parent, position);
}

function cylinder(radius, height, material, parent, position) {
  return mesh(new THREE.CylinderGeometry(radius, radius, height, mobile ? 16 : 24), material, parent, position);
}

function torus(radius, thickness, material, parent) {
  return mesh(new THREE.TorusGeometry(radius, thickness, mobile ? 12 : 20, mobile ? 72 : 112), material, parent);
}

function shadow(parent, size, y, opacity) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 3, 64, 64, 64);
  gradient.addColorStop(0, `rgba(0,0,0,${opacity})`);
  gradient.addColorStop(0.4, `rgba(0,0,0,${opacity * 0.4})`);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const mat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, depthWrite: false });
  const plane = mesh(new THREE.PlaneGeometry(size, size), mat, parent, [0, y, 0]);
  plane.rotation.x = -Math.PI / 2;
}

function gyroscope(group) {
  const chrome = metal(0xe5e5e7, 0.15);
  const satin = metal(0xc0c1c3, 0.27);
  const inner = metal(0xf3f3f4, 0.11);
  const a = torus(1.43, 0.16, chrome, group);
  a.rotation.set(0.14, 0.32, -0.31);
  const b = torus(1.2, 0.14, satin, group);
  b.rotation.set(1.35, 0.38, 0.68);
  const c = torus(0.96, 0.13, chrome, group);
  c.rotation.set(0.55, 1.35, -0.25);
  mesh(new THREE.SphereGeometry(0.46, mobile ? 32 : 56, mobile ? 24 : 40), inner, group);
  // Tiny inner-ring pivots make the sculpture feel precisely machined.
  for (const direction of [-1, 1]) {
    const pivot = mesh(new THREE.SphereGeometry(0.11, 20, 16), satin, c, [direction * 0.95, 0, 0]);
    pivot.scale.set(1, 0.8, 1);
  }
}

function quantumChip(group) {
  const graphite = metal(0x16171a, 0.35, 0.75);
  const board = metal(0x242528, 0.38, 0.62);
  const silver = metal(0xc8c9cc, 0.24);
  const bright = metal(0xe8e9eb, 0.17);
  const traces = metal(0x8f9095, 0.34);
  box(2.55, 0.14, 2.55, graphite, group, [0, -0.12, 0]);
  box(2.36, 0.09, 2.36, board, group, [0, -0.015, 0]);
  box(1.32, 0.15, 1.32, graphite, group, [0, 0.11, 0]);
  box(1.15, 0.06, 1.15, silver, group, [0, 0.215, 0]);
  box(0.93, 0.035, 0.93, graphite, group, [0, 0.262, 0]);
  box(0.57, 0.06, 0.57, bright, group, [0, 0.31, 0]);
  box(0.38, 0.014, 0.38, graphite, group, [0, 0.349, 0]);

  for (let side = 0; side < 4; side++) {
    const edge = new THREE.Group();
    edge.rotation.y = side * Math.PI / 2;
    group.add(edge);
    for (let i = 0; i < 9; i++) {
      const x = (i - 4) * 0.205;
      box(0.08, 0.065, 0.28, silver, edge, [x, -0.115, 1.31]);
      box(0.014, 0.008, 0.28 + (i % 2) * 0.17, traces, edge, [x, 0.038, 0.94]);
      if (i % 2 === 0) {
        box(0.13, 0.009, 0.014, traces, edge, [x + 0.06, 0.039, 0.8]);
      }
    }
  }
  for (const x of [-1.02, 1.02]) {
    for (const z of [-1.02, 1.02]) {
      cylinder(0.06, 0.024, silver, group, [x, 0.048, z]);
      box(0.06, 0.005, 0.01, graphite, group, [x, 0.063, z]);
    }
  }
  // Three floating paths suggest quantum states; they are conceptual art.
  const orbits = new THREE.Group();
  orbits.position.y = 0.94;
  group.add(orbits);
  const a = torus(0.73, 0.022, bright, orbits);
  a.rotation.set(0.85, 0.26, 0.14);
  const b = torus(0.73, 0.022, silver, orbits);
  b.rotation.set(-0.8, 0.75, 0.2);
  const c = torus(0.73, 0.018, silver, orbits);
  c.rotation.set(0.1, 1.45, 0.3);
  mesh(new THREE.SphereGeometry(0.115, 28, 20), bright, orbits);
  mesh(new THREE.SphereGeometry(0.06, 20, 16), bright, a, [0.73, 0, 0]);
  mesh(new THREE.SphereGeometry(0.047, 20, 16), bright, b, [0, 0.73, 0]);
  group.position.y = -0.26;
}

function vessel(group) {
  const silver = metal(0xbfc1c4, 0.29);
  const shell = metal(0xeeeeef, 0.29, 0.68);
  const dark = metal(0x202226, 0.2, 0.7);
  const glass = metal(0x15171b, 0.09, 0.45);
  const bright = metal(0xf4f4f4, 0.17);
  const shape = new THREE.Shape();
  shape.moveTo(0, -1.64);
  shape.bezierCurveTo(-0.15, -1.55, -0.25, -1.07, -0.25, -0.67);
  shape.lineTo(-0.25, 1.19);
  shape.quadraticCurveTo(-0.24, 1.32, -0.1, 1.34);
  shape.lineTo(0.1, 1.34);
  shape.quadraticCurveTo(0.24, 1.32, 0.25, 1.19);
  shape.lineTo(0.25, -0.67);
  shape.bezierCurveTo(0.25, -1.07, 0.15, -1.55, 0, -1.64);
  const hullGeometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.26, bevelEnabled: true, bevelThickness: 0.065,
    bevelSize: 0.05, bevelSegments: mobile ? 2 : 4, curveSegments: mobile ? 12 : 24,
  });
  hullGeometry.rotateX(Math.PI / 2);
  for (const x of [-0.7, 0.7]) {
    mesh(hullGeometry, silver, group, [x, 0, 0]);
    const deck = mesh(hullGeometry, shell, group, [x, 0.055, 0]);
    deck.scale.y = 0.24;
    box(0.32, 0.026, 0.7, dark, group, [x, 0.078, 0.78]);
    for (let row = 0; row < 5; row++) {
      box(0.28, 0.006, 0.01, silver, group, [x, 0.095, 0.5 + row * 0.13]);
    }
  }
  box(1.56, 0.11, 1.27, shell, group, [0, 0.11, 0.0]);
  box(1.53, 0.036, 0.24, dark, group, [0, 0.037, 0.0]);
  // Raised bridge, panoramic glazing, and a compact instrument mast.
  box(0.73, 0.29, 0.69, silver, group, [0, 0.3, -0.03]);
  box(0.743, 0.16, 0.705, glass, group, [0, 0.385, -0.03]);
  box(0.84, 0.055, 0.79, shell, group, [0, 0.493, -0.03]);
  for (const x of [-0.3, 0.3]) box(0.024, 0.18, 0.716, silver, group, [x, 0.385, -0.03]);
  cylinder(0.025, 0.48, dark, group, [0, 0.76, 0.16]);
  box(0.36, 0.035, 0.075, silver, group, [0, 0.98, 0.16]);
  cylinder(0.085, 0.08, bright, group, [0, 1.037, 0.16]);
  const camera = cylinder(0.055, 0.085, dark, group, [0, 0.89, 0.09]);
  camera.rotation.x = Math.PI / 2;
  cylinder(0.02, 0.3, silver, group, [0.18, 0.68, 0.15]);
  // Restrained brushed-metal bow rails.
  for (const x of [-0.7, 0.7]) {
    for (const z of [-0.73, -1.1]) cylinder(0.011, 0.14, silver, group, [x - 0.14, 0.15, z]);
    const rail = cylinder(0.01, 0.43, bright, group, [x - 0.14, 0.22, -0.92]);
    rail.rotation.x = Math.PI / 2;
  }
  group.position.y = -0.12;
}

function initScene(id, build, options) {
  const element = document.getElementById(id);
  if (!element) return;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !mobile, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = options.exposure || 1.15;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    renderer.domElement.style.pointerEvents = 'none';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    element.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(options.fov || 36, 1, 0.1, 60);
    camera.position.set(...options.camera);
    camera.lookAt(0, options.lookAt || 0, 0);
    const environmentTarget = createEnvironment(renderer, scene);
    scene.environmentIntensity = options.dark ? 1.65 : 1.3;
    scene.add(new THREE.HemisphereLight(0xffffff, 0x4a4b50, options.dark ? 1.3 : 2.2));
    const key = new THREE.DirectionalLight(0xffffff, options.dark ? 4.5 : 4.0);
    key.position.set(-3, 6, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffffff, options.dark ? 3 : 1.5);
    rim.position.set(4, 2, -3);
    scene.add(rim);
    const group = new THREE.Group();
    scene.add(group);
    build(group);
    if (!options.dark) shadow(scene, options.shadowSize || 4.9, options.shadowY ?? -1.8, 0.23);
    const state = { element, renderer, scene, camera, group, options, environmentTarget,
      section: element.closest('section') || element, progress: 0, target: 0,
      visible: true, dirty: true, initialized: false, lost: false };
    scenes.push(state);
    renderer.domElement.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      showFallback(state);
    });
    renderer.domElement.addEventListener('webglcontextrestored', () => {
      try {
        // Generated reflection maps live on the GPU and must be rebuilt after
        // a context reset before the chrome can be rendered correctly again.
        state.environmentTarget.dispose();
        state.environmentTarget = createEnvironment(renderer, scene);
        state.lost = false;
        state.dirty = true;
        requestFrame();
      } catch (_) {
        showFallback(state);
      }
    });
    const resize = () => {
      const width = element.clientWidth;
      const height = element.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      // Preserve the whole object on narrow screens.
      camera.zoom = Math.min(1, camera.aspect / (options.minAspect || 0.88));
      camera.updateProjectionMatrix();
      state.dirty = true;
      updateTargets();
    };
    new ResizeObserver(resize).observe(element);
    const observer = new IntersectionObserver(([entry]) => {
      state.visible = entry.isIntersecting;
      if (state.visible) { state.dirty = true; updateTargets(); }
    }, { rootMargin: '120px' });
    observer.observe(element);
    resize();
  } catch (_) {
    if (renderer) { renderer.domElement.remove(); renderer.dispose(); }
    element.dataset.renderer = 'unavailable';
    element.classList.remove('is-ready');
  }
}

function updateTargets() {
  const viewport = window.innerHeight;
  for (const state of scenes) {
    const bounds = state.section.getBoundingClientRect();
    state.target = Math.max(0, Math.min(1, (viewport - bounds.top) / (viewport + bounds.height)));
    if (!state.initialized) state.progress = state.target;
  }
  requestFrame();
}

function requestFrame() {
  if (!frame && pageVisible) frame = window.requestAnimationFrame(render);
}

function render() {
  frame = 0;
  if (!pageVisible) return;
  let settling = false;
  for (const state of scenes) {
    if (state.lost || (!state.visible && state.initialized)) continue;
    const difference = state.target - state.progress;
    const moving = !reducedMotion && Math.abs(difference) > 0.00008;
    if (moving) {
      state.progress += difference * 0.085;
      settling = true;
    } else if (!reducedMotion) state.progress = state.target;
    if (!state.dirty && !moving && state.initialized) continue;
    // Increase `turn` in the scene options below for more rotation per scroll.
    // Reduced motion keeps every model in its composed, static starting pose.
    const progress = reducedMotion ? 0 : state.progress - 0.48;
    const base = state.options.rotation;
    state.group.rotation.set(base[0] + progress * 0.33,
      base[1] + progress * state.options.turn, base[2] + progress * 0.13);
    state.element.dataset.modelAngle = state.group.rotation.y.toFixed(4);
    try {
      state.renderer.render(state.scene, state.camera);
      if (state.lost || state.renderer.getContext().isContextLost()) {
        showFallback(state);
        continue;
      }
      state.renderer.domElement.style.visibility = 'visible';
      state.element.classList.add('is-ready');
      state.element.dataset.renderer = 'ready';
      state.initialized = true;
      state.dirty = false;
    } catch (_) {
      showFallback(state);
    }
  }
  if (settling) requestFrame();
}

window.addEventListener('scroll', updateTargets, { passive: true });
window.addEventListener('resize', updateTargets, { passive: true });
document.addEventListener('visibilitychange', () => {
  pageVisible = !document.hidden;
  if (pageVisible) updateTargets();
  else if (frame) { cancelAnimationFrame(frame); frame = 0; }
});
function setMotion(reduced) {
  reducedMotion = reduced;
  for (const state of scenes) state.dirty = true;
  requestFrame();
}
document.addEventListener('motionchange', (event) => setMotion(Boolean(event.detail?.reduced)));

initScene('hero-scene', gyroscope, {
  camera: [0, 0.4, 6.9], rotation: [-0.12, -0.3, 0.15], turn: 3.7,
  exposure: 1.07, shadowY: -1.84, shadowSize: 4.7,
});
initScene('quantum-scene', quantumChip, {
  camera: [3.9, 3.5, 5.4], rotation: [0, -0.1, 0], turn: 2.7,
  dark: true, exposure: 1.2, lookAt: 0.17, fov: 36,
});
initScene('vessel-scene', vessel, {
  camera: [4.2, 3.5, -5.2], rotation: [0, -0.15, 0], turn: 2.35,
  exposure: 1.17, lookAt: 0.05, fov: 32, shadowY: -0.48, shadowSize: 5.5,
});
updateTargets();
