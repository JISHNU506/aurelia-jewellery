import * as THREE from 'three';

/**
 * Procedural photo-studio environments used for image based lighting.
 * Modelled on a jeweller's light tent: a bright graded dome, soft boxes,
 * a few dark "cards" that give polished metal its definition, and tiny
 * hot spots that make diamonds sparkle. No HDR files are downloaded.
 */
export const LIGHTING_PRESETS = {
  studio: {
    label: 'Studio',
    dome: ['#ffffff', '#d9d4ce', '#4a4642'],
    domeIntensity: 1.0,
    panels: [
      { size: [12, 3], pos: [0, 9, 3], intensity: 3.2 },
      { size: [2.2, 14], pos: [-10, 1.5, 3], intensity: 2.4 },
      { size: [2.2, 14], pos: [10, 1.5, -2], intensity: 2.0 },
      { size: [14, 1.4], pos: [0, 2.5, 11], intensity: 1.6 },
    ],
    cards: [
      { size: [3.5, 16], pos: [-8, 0, -8] },
      { size: [3, 16], pos: [9, 0, 6] },
      { size: [18, 2.5], pos: [0, -2.5, -12] },
      { size: [2, 14], pos: [0, 0, 14] },
    ],
    sparkles: 14,
  },
  warm: {
    label: 'Warm Gold',
    dome: ['#fff4e2', '#dcc3a0', '#3d2c1c'],
    domeIntensity: 1.0,
    panels: [
      { size: [12, 3], pos: [0, 9, 3], intensity: 3.0, color: '#fff0d8' },
      { size: [2.4, 14], pos: [-10, 1.5, 4], intensity: 2.6, color: '#ffd29a' },
      { size: [2.2, 14], pos: [10, 1.5, -2], intensity: 1.6 },
    ],
    cards: [
      { size: [3.5, 16], pos: [-8, 0, -8], color: '#120c06' },
      { size: [3, 16], pos: [9, 0, 6], color: '#120c06' },
      { size: [18, 2.5], pos: [0, -2.5, -12], color: '#120c06' },
    ],
    sparkles: 12,
  },
  daylight: {
    label: 'Daylight',
    dome: ['#f4f8ff', '#cfd6e0', '#4c525a'],
    domeIntensity: 1.1,
    panels: [
      { size: [16, 6], pos: [0, 10, 0], intensity: 2.6 },
      { size: [3, 14], pos: [-10, 2, 3], intensity: 1.6, color: '#e6eeff' },
      { size: [3, 14], pos: [10, 2, -2], intensity: 1.6, color: '#e6eeff' },
    ],
    cards: [
      { size: [3, 16], pos: [-9, 0, -7] },
      { size: [3, 16], pos: [9, 0, 7] },
    ],
    sparkles: 10,
  },
  noir: {
    label: 'Noir Spotlight',
    dome: ['#77706a', '#2a2724', '#070706'],
    domeIntensity: 1.0,
    panels: [
      { size: [6, 2], pos: [0, 10, 2], intensity: 7 },
      { size: [1.6, 12], pos: [-10, 2, -4], intensity: 3.2 },
      { size: [1.6, 12], pos: [10, 2, -4], intensity: 3.2 },
      { size: [12, 1], pos: [0, 1.5, 11], intensity: 2.0 },
      { size: [4, 4], pos: [-6, 5, 8], intensity: 2.2 },
    ],
    cards: [],
    sparkles: 18,
  },
  // High-contrast environment applied to gemstones and pearls only:
  // dark surroundings + crisp light strips give facets their black/white "fire".
  gem: {
    label: 'Gem',
    hidden: true,
    dome: ['#9a958f', '#4a4642', '#121110'],
    domeIntensity: 1.0,
    panels: [
      { size: [10, 2.2], pos: [0, 9, 4], intensity: 6 },
      { size: [1.4, 14], pos: [-10, 1.5, 3], intensity: 4 },
      { size: [1.4, 14], pos: [10, 1.5, -2], intensity: 4 },
      { size: [12, 1.2], pos: [0, 2.5, 11], intensity: 3 },
      { size: [3, 3], pos: [-7, 7, -6], intensity: 5 },
      { size: [3, 3], pos: [7, 6, -7], intensity: 4 },
    ],
    cards: [
      { size: [4, 18], pos: [-6, 0, 9] },
      { size: [4, 18], pos: [7, 0, 8] },
    ],
    sparkles: 34,
  },
};

export const GEM_MATERIALS = ['diamond', 'emerald', 'ruby', 'sapphire', 'pearl'];

/** Gives stones and pearls the high-contrast gem environment. */
export function applyGemEnvironment(object, gemEnv) {
  object.traverse((o) => {
    if (!o.isMesh) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach((m) => {
      if (GEM_MATERIALS.includes(m.name)) {
        m.envMap = gemEnv;
        m.needsUpdate = true;
      }
    });
  });
}

function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function gradientDome([top, horizon, bottom], intensity) {
  const geo = new THREE.SphereGeometry(20, 48, 24);
  const cTop = new THREE.Color(top).multiplyScalar(intensity);
  const cHor = new THREE.Color(horizon).multiplyScalar(intensity);
  const cBot = new THREE.Color(bottom).multiplyScalar(intensity);
  const colors = [];
  const pos = geo.attributes.position;
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) / 20;
    if (y >= 0) c.copy(cHor).lerp(cTop, Math.pow(y, 0.7));
    else c.copy(cHor).lerp(cBot, Math.pow(-y, 0.5));
    colors.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  return new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide }));
}

export function createStudioScene(presetKey = 'studio') {
  const preset = LIGHTING_PRESETS[presetKey] ?? LIGHTING_PRESETS.studio;
  const scene = new THREE.Scene();
  scene.add(gradientDome(preset.dome, preset.domeIntensity));

  const addPanel = ({ size, pos, intensity = 1, color = '#ffffff' }) => {
    const c = new THREE.Color(color).multiplyScalar(intensity);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(size[0], size[1]), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide }));
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    scene.add(m);
  };
  preset.panels.forEach(addPanel);
  preset.cards.forEach((card) => addPanel({ ...card, color: card.color ?? '#0b0b0b', intensity: 1 }));

  // small, very bright highlights -> fire and sparkle in diamonds
  const rand = seeded(7);
  for (let i = 0; i < preset.sparkles; i++) {
    const theta = rand() * Math.PI * 2;
    const phi = 0.25 + rand() * 1.1;
    const r = 14;
    addPanel({
      size: [0.4 + rand() * 0.5, 0.4 + rand() * 0.5],
      pos: [Math.cos(theta) * Math.sin(phi) * r, Math.cos(phi) * r, Math.sin(theta) * Math.sin(phi) * r],
      intensity: 10 + rand() * 10,
    });
  }
  return scene;
}

/** Returns a PMREM environment texture for the given renderer. */
export function createStudioEnvironment(renderer, presetKey = 'studio') {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const scene = createStudioScene(presetKey);
  const texture = pmrem.fromScene(scene, 0.02).texture;
  scene.traverse((o) => {
    if (o.isMesh) {
      o.geometry.dispose();
      o.material.dispose();
    }
  });
  pmrem.dispose();
  return texture;
}
