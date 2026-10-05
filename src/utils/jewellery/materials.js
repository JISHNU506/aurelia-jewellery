import * as THREE from 'three';

/**
 * Physically based material presets for metals and stones.
 * Material names are preserved in exported GLB files so the 3D viewer can
 * re-tint metals ("metal") at runtime.
 */
export const METALS = {
  yellow: { label: '18K Yellow Gold', color: '#f2c36b', roughness: 0.16 },
  yellow22: { label: '22K Yellow Gold', color: '#f1b850', roughness: 0.17 },
  yellow24: { label: '24K Pure Gold', color: '#f3ae38', roughness: 0.2 },
  rose: { label: '18K Rose Gold', color: '#eba78a', roughness: 0.16 },
  white: { label: '18K White Gold', color: '#e3e4e8', roughness: 0.11 },
};

export const STONES = {
  diamond: { color: '#ffffff', attenuation: '#ffffff', ior: 2.42, transmission: 0.92, dispersion: 6 },
  emerald: { color: '#2fae78', attenuation: '#0b6a43', ior: 1.58, transmission: 0.82, dispersion: 0.4 },
  ruby: { color: '#e0284f', attenuation: '#8d0a26', ior: 1.77, transmission: 0.8, dispersion: 0.6 },
  sapphire: { color: '#3557d6', attenuation: '#14257e', ior: 1.77, transmission: 0.8, dispersion: 0.6 },
};

export function metalMaterial(key = 'yellow') {
  const m = METALS[key] ?? METALS.yellow;
  return new THREE.MeshPhysicalMaterial({
    name: 'metal',
    color: new THREE.Color(m.color),
    metalness: 1,
    roughness: m.roughness,
    clearcoat: 0.35,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.25,
  });
}

export function stoneMaterial(key = 'diamond') {
  const s = STONES[key] ?? STONES.diamond;
  return new THREE.MeshPhysicalMaterial({
    name: key,
    color: new THREE.Color(s.color),
    metalness: 0,
    roughness: 0,
    transmission: s.transmission,
    thickness: 0.35,
    ior: s.ior,
    dispersion: s.dispersion,
    attenuationColor: new THREE.Color(s.attenuation),
    attenuationDistance: key === 'diamond' ? 10 : 0.45,
    specularIntensity: 1,
    clearcoat: 1,
    clearcoatRoughness: 0,
    envMapIntensity: key === 'diamond' ? 2.6 : 1.8,
  });
}

/** Opaque polished cabochon (used for temple/kundan work). */
export function cabochonMaterial(key = 'ruby') {
  const s = STONES[key] ?? STONES.ruby;
  return new THREE.MeshPhysicalMaterial({
    name: `${key}-cabochon`,
    color: new THREE.Color(s.attenuation).lerp(new THREE.Color(s.color), 0.45),
    metalness: 0,
    roughness: 0.08,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    sheen: 0.4,
    sheenColor: new THREE.Color(s.color),
    envMapIntensity: 1.4,
  });
}

export function pearlMaterial() {
  return new THREE.MeshPhysicalMaterial({
    name: 'pearl',
    color: new THREE.Color('#f3e8da'),
    metalness: 0,
    roughness: 0.38,
    sheen: 1,
    sheenRoughness: 0.3,
    sheenColor: new THREE.Color('#ffcfdc'),
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    iridescence: 0.85,
    iridescenceIOR: 1.4,
    iridescenceThicknessRange: [250, 650],
    envMapIntensity: 1.15,
  });
}

/** Creates (lazily) the materials a builder asks for, keyed by name. */
export function createMaterialLibrary(metal = 'yellow') {
  const cache = {};
  return (key) => {
    if (cache[key]) return cache[key];
    let mat;
    if (key === 'metal') mat = metalMaterial(metal);
    else if (key === 'pearl') mat = pearlMaterial();
    else if (key.endsWith('-cabochon')) mat = cabochonMaterial(key.replace('-cabochon', ''));
    else mat = stoneMaterial(key);
    cache[key] = mat;
    return mat;
  };
}
