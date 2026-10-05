import * as THREE from 'three';
import {
  Assembly,
  TAU,
  alignY,
  basis,
  chainAlongCurve,
  closedTube,
  compose,
  ellipseFn,
  gemGeometry,
  gemOutline,
  loopCurve,
  necklaceFn,
  offsetOutline,
  resampleClosed,
  rodBetween,
  ropeAlongCurve,
  sphere,
  sweepRing,
  torus,
} from './geometry.js';
import { createMaterialLibrary } from './materials.js';

/*
 * Procedural jewellery builders. All dimensions are in centimetres so that
 * the virtual try-on can size pieces from real-world face / hand proportions.
 *
 *   ring      — band in the XY plane, finger axis = Z, setting at +Y
 *   necklace  — closed loop as worn on an invisible bust, front faces +Z
 *   earrings  — single earring hangs from the piercing at the origin
 *   bracelet  — loop in the XY plane, wrist axis = Z
 */

const FACE_FORWARD = [Math.PI / 2, 0, 0]; // gem table (+Y) -> +Z
const RING_INNER = 0.86; // ~ size 7 / Indian size 14

/* ------------------------------------------------------------------ */
/*  Settings                                                           */
/* ------------------------------------------------------------------ */

function prongParams(shape, prongs) {
  if (shape === 'emerald') return 'corners';
  if (shape === 'pear') return [0, 0.36, 0.64];
  if (prongs === 6) return Array.from({ length: 6 }, (_, k) => k / 6);
  if (prongs === 4) return Array.from({ length: 4 }, (_, k) => (k + 0.5) / 4);
  return Array.from({ length: prongs }, (_, k) => k / prongs);
}

/**
 * A gemstone with its setting. Local frame: girdle at y = 0, table up.
 * `stretch` scales the stone along X (e.g. elongated ovals).
 */
function addHead(asm, opts) {
  const {
    stone = 'diamond',
    shape = 'round',
    size = 0.3,
    stretch = 1,
    prongs = 4,
    bezel = false,
    basket = true,
    rotY = 0,
    matrix = new THREE.Matrix4(),
  } = opts;
  const h = new Assembly();
  const n = shape === 'round' ? (size < 0.1 ? 10 : size < 0.16 ? 12 : 16) : 20;
  h.add(stone, gemGeometry(shape, n), compose([0, 0, 0], [0, 0, 0], [size * stretch, size, size]));

  const wire = Math.max(0.014, size * 0.075);
  const small = size < 0.16;
  const sc = (x, z, k) => new THREE.Vector3(x * size * stretch * k, 0, z * size * k);

  if (bezel) {
    const rim = offsetOutline(shape, size, [stretch, 1], wire * 0.6, 64).map(([x, z]) => new THREE.Vector3(x, 0.02 * size, z));
    h.add('metal', closedTube(rim, wire * 1.5, small ? 28 : 64, small ? 6 : 8));
    const cup = offsetOutline(shape, size * 0.72, [stretch, 1], 0, 48).map(([x, z]) => new THREE.Vector3(x, -0.45 * size, z));
    h.add('metal', closedTube(cup, size * 0.32, small ? 24 : 48, small ? 6 : 8));
  } else if (prongs) {
    const params = prongParams(shape, prongs);
    let pts;
    if (params === 'corners') {
      const o = gemOutline('emerald');
      pts = [[0, 1], [2, 3], [4, 5], [6, 7]].map(([a, b]) => [(o[a][0] + o[b][0]) / 2, (o[a][1] + o[b][1]) / 2]);
    } else {
      pts = params.map((t) => gemOutline(shape, 1000)[Math.round(t * 1000) % 1000]);
    }
    for (const [x, z] of pts) {
      const tip = sc(x, z, 1.04).setY(0.1 * size);
      const mid = sc(x, z, 0.86).setY(-0.36 * size);
      const base = sc(x, z, 0.26).setY(-0.92 * size);
      rodBetween(h, 'metal', base, mid, wire);
      rodBetween(h, 'metal', mid, tip, wire);
      h.add('metal', sphere(wire * 1.25, small ? 6 : 10, small ? 4 : 8), compose(tip));
    }
  }
  if (basket && !bezel) {
    const rail = offsetOutline(shape, size * 0.64, [stretch, 1], 0, 48).map(([x, z]) => new THREE.Vector3(x, -0.32 * size, z));
    h.add('metal', closedTube(rail, wire * 0.85, small ? 20 : 48, small ? 4 : 6));
    if (!small) {
      const lower = offsetOutline(shape, size * 0.3, [stretch, 1], 0, 32).map(([x, z]) => new THREE.Vector3(x, -0.78 * size, z));
      h.add('metal', closedTube(lower, wire * 0.8, 24, 6));
    }
  }
  asm.merge(h, matrix.clone().multiply(compose([0, 0, 0], [0, rotY, 0])));
  return asm;
}

/** Ring of small stones following the outline of a centre stone. */
function addHalo(asm, opts) {
  const {
    shape = 'round',
    size,
    stretch = 1,
    stoneR = 0.05,
    gap = 0.025,
    y = 0,
    stone = 'diamond',
    rotY = 0,
    matrix = new THREE.Matrix4(),
  } = opts;
  const h = new Assembly();
  const outline = offsetOutline(shape, size, [stretch, 1], gap + stoneR, 160);
  const spots = resampleClosed(outline, stoneR * 2.18);
  const gem = gemGeometry('round', 10);
  spots.forEach(([x, z]) => h.add(stone, gem, compose([x, y, z], [0, 0, 0], stoneR)));
  const frame = outline.map(([x, z]) => new THREE.Vector3(x, y - stoneR * 0.55, z));
  h.add('metal', closedTube(frame, stoneR * 0.82, 96, 6));
  const beadR = stoneR * 0.3;
  spots.forEach(([x, z], i) => {
    const [nx, nz] = spots[(i + 1) % spots.length];
    h.add('metal', sphere(beadR, 6, 4), compose([(x + nx) / 2, y + stoneR * 0.18, (z + nz) / 2]));
  });
  asm.merge(h, matrix.clone().multiply(compose([0, 0, 0], [0, rotY, 0])));
  return spots.length;
}

/** Plain or tapered ring shank. Returns the outer radius at the top. */
function addShank(asm, { t = 0.075, w = 0.1, taper = 0.25, n = 2.8 } = {}) {
  const profile = (u) => ({ t: t * (1.08 - 0.08 * u), w: w * (1 - taper + taper * u), n });
  asm.add('metal', sweepRing({ radius: RING_INNER + t, profile }));
  return RING_INNER + 2 * t * 1.08;
}

/** Small stones set along the shoulders of a ring shank. */
function addPave(asm, { top, start = 0.42, count = 7, stoneR = 0.042, stone = 'diamond' }) {
  const gem = gemGeometry('round', 10);
  const step = (stoneR * 2.25) / top;
  for (const side of [-1, 1]) {
    for (let k = 0; k < count; k++) {
      const phi = Math.PI / 2 + side * (start + k * step);
      const d = new THREE.Vector3(Math.cos(phi), Math.sin(phi), 0);
      asm.add(stone, gem, compose(d.clone().multiplyScalar(top - 0.012), alignY(d), stoneR));
      for (const z of [-1, 1]) {
        const pb = phi + side * step * 0.5;
        const db = new THREE.Vector3(Math.cos(pb), Math.sin(pb), 0).multiplyScalar(top + 0.004);
        asm.add('metal', sphere(stoneR * 0.3, 6, 4), compose(db.setZ(z * stoneR * 0.8)));
      }
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Rings                                                              */
/* ------------------------------------------------------------------ */

function ringSetting(spec) {
  const {
    stone = 'diamond',
    shape = 'round',
    size = 0.33,
    stretch = 1,
    prongs = 6,
    halo = false,
    haloStone = 'diamond',
    pave = false,
    sideStones = false,
    band = {},
  } = spec;
  const asm = new Assembly();
  const top = addShank(asm, { t: 0.075, w: pave ? 0.12 : 0.1, ...band });
  const elongated = shape === 'oval' || shape === 'emerald' || shape === 'pear';
  const rotY = elongated ? Math.PI / 2 : 0;
  const depth = shape === 'emerald' ? 0.6 : 0.86;
  const girdleY = top + depth * size + (halo ? 0.1 : 0.05);
  const headMatrix = compose([0, girdleY, 0]);

  addHead(asm, { stone, shape, size, stretch, prongs, rotY, matrix: headMatrix });
  if (halo) {
    addHalo(asm, { shape, size, stretch, stoneR: 0.05, y: -0.12 * size, stone: haloStone, rotY, matrix: headMatrix });
    // under-gallery shoulders connecting the halo to the shank
    for (const side of [-1, 1]) {
      const from = new THREE.Vector3(Math.cos(Math.PI / 2 + side * 0.36), Math.sin(Math.PI / 2 + side * 0.36), 0).multiplyScalar(top - 0.03);
      const to = new THREE.Vector3(side * size * 0.75, girdleY - 0.22 * size, 0);
      rodBetween(asm, 'metal', from, to, 0.032);
    }
  }
  if (pave) addPave(asm, { top, start: halo ? 0.5 : 0.36, count: 7 });
  if (sideStones) {
    const ss = size * 0.56;
    const extent = elongated ? size * 0.74 : size;
    for (const side of [-1, 1]) {
      // follow the curve of the shank so the side stones sit on the band
      const x = extent + ss * 0.95;
      const tilt = Math.asin(Math.min(0.9, x / top));
      const surface = Math.sqrt(top * top - x * x);
      const lift = 0.86 * ss + 0.03;
      const pos = [side * (x + Math.sin(tilt) * lift), surface + Math.cos(tilt) * lift, 0];
      const m = compose(pos, [0, 0, -side * tilt]);
      addHead(asm, { stone: sideStones === true ? 'diamond' : sideStones, shape: 'round', size: ss, prongs: 4, matrix: m });
    }
  }
  return { asm, tryOn: { type: 'ring', innerRadius: RING_INNER } };
}

function ringBand(spec) {
  const { width = 0.24, thickness = 0.09, lines = true } = spec;
  const asm = new Assembly();
  const t = thickness;
  asm.add('metal', sweepRing({ radius: RING_INNER + t, profile: () => ({ t, w: width, n: 2.3 }), csSegments: 24 }));
  if (lines) {
    const e = 2 / 2.3;
    const sz = 0.72;
    const sin = sz ** (1 / e);
    const sx = Math.sqrt(1 - sin * sin) ** e;
    for (const z of [-1, 1]) {
      asm.add('metal', torus(RING_INNER + t + t * sx, 0.012, 6, 160), compose([0, 0, z * width * sz]));
    }
  }
  return { asm, tryOn: { type: 'ring', innerRadius: RING_INNER } };
}

/* ------------------------------------------------------------------ */
/*  Necklaces                                                          */
/* ------------------------------------------------------------------ */

/**
 * Try-on calibration for necklaces. `neck` describes an elliptical cylinder
 * that hides the back of the chain (used as a depth-only occluder).
 */
function necklaceTryOn(fn, halfWidth, depth) {
  const side = fn(0.25);
  return {
    type: 'necklace',
    anchor: [0, side.y, 0],
    halfWidth,
    neck: { rx: halfWidth * 1.0, rz: depth * 0.96, bottom: side.y - 0.7, top: 6 },
  };
}

function addBail(asm, front, drop = 0.12) {
  asm.add('metal', torus(0.08, 0.026, 8, 24), compose([front.x, front.y - drop * 0.5, front.z], [0, Math.PI / 2, 0]));
}

function necklaceRope(spec) {
  const shape = { halfWidth: 6.3, depth: 5.4, drop: 8.6, forward: 2.4, sharp: 1.6 };
  const fn = necklaceFn(shape);
  const curve = loopCurve(fn, 160);
  const asm = new Assembly();
  const len = curve.getLength();
  ropeAlongCurve(asm, 'metal', curve, { radius: spec.thick ? 0.085 : 0.07, strand: spec.thick ? 0.065 : 0.052, twists: Math.round(len * 1.5), samples: 600 });
  return { asm, tryOn: necklaceTryOn(fn, shape.halfWidth, shape.depth) };
}

function necklaceCable(spec) {
  const shape = { halfWidth: 6.2, depth: 5.3, drop: 8.8, forward: 2.4, sharp: 1.6 };
  const fn = necklaceFn(shape);
  const curve = loopCurve(fn, 160);
  const asm = new Assembly();
  chainAlongCurve(asm, 'metal', curve, { length: spec.link ?? 0.56, width: (spec.link ?? 0.56) * 0.68, wire: spec.wire ?? 0.075 });
  return { asm, tryOn: necklaceTryOn(fn, shape.halfWidth, shape.depth) };
}

function fineChain(asm, curve) {
  chainAlongCurve(asm, 'metal', curve, { length: 0.38, width: 0.25, wire: 0.034 });
}

function necklaceHaloPendant(spec) {
  const shape = { halfWidth: 6.0, depth: 5.2, drop: 10.2, forward: 2.6, sharp: 1.9 };
  const fn = necklaceFn(shape);
  const curve = loopCurve(fn, 160);
  const asm = new Assembly();
  fineChain(asm, curve);
  const front = fn(0);
  addBail(asm, front);
  const size = spec.size ?? 0.3;
  const haloR = 0.048;
  const cy = front.y - 0.2 - size - haloR * 2 - 0.05;
  const m = compose([0, cy, front.z + 0.06], FACE_FORWARD);
  addHead(asm, { stone: spec.stone ?? 'diamond', shape: spec.shape ?? 'round', size, prongs: 4, matrix: m });
  addHalo(asm, { size, stoneR: haloR, y: -0.1 * size, matrix: m, shape: spec.shape ?? 'round' });
  rodBetween(asm, 'metal', new THREE.Vector3(0, front.y - 0.1, front.z + 0.03), new THREE.Vector3(0, cy + size + haloR * 2, front.z + 0.04), 0.028);
  return { asm, tryOn: necklaceTryOn(fn, shape.halfWidth, shape.depth) };
}

function necklaceCirclePendant() {
  const shape = { halfWidth: 5.9, depth: 5.1, drop: 8.0, forward: 2.3, sharp: 1.8 };
  const fn = necklaceFn(shape);
  const curve = loopCurve(fn, 160);
  const asm = new Assembly();
  fineChain(asm, curve);
  const front = fn(0);
  addBail(asm, front);
  const R = 0.46;
  const cy = front.y - 0.16 - R;
  asm.add('metal', torus(R, 0.05, 12, 96), compose([0, cy, front.z + 0.04]));
  addHead(asm, { size: 0.085, bezel: true, matrix: compose([0, cy - R, front.z + 0.08], FACE_FORWARD) });
  return { asm, tryOn: necklaceTryOn(fn, shape.halfWidth, shape.depth) };
}

function necklacePearls() {
  const shape = { halfWidth: 6.0, depth: 5.2, drop: 7.6, forward: 2.3, sharp: 1.5 };
  const fn = necklaceFn(shape);
  const curve = loopCurve(fn, 200);
  const asm = new Assembly();
  const L = curve.getLength();
  const radiusAt = (s) => {
    const u = s / L;
    return 0.3 + 0.13 * ((1 + Math.cos(u * TAU)) / 2) ** 1.3;
  };
  const pearl = sphere(1, 16, 10);
  let s = 0;
  let r = radiusAt(0);
  const placed = [];
  while (s < L / 2 - 0.45) {
    placed.push([s, r]);
    const rn = radiusAt(s + r * 2);
    s += r + rn + 0.03;
    r = rn;
  }
  for (const [ps, pr] of placed) {
    const p = curve.getPointAt(ps / L);
    asm.add('pearl', pearl, compose(p, [0, 0, 0], pr));
    if (ps > 0) asm.add('pearl', pearl, compose([-p.x, p.y, p.z], [0, 0, 0], pr));
  }
  // clasp at the nape
  const back = curve.getPointAt(0.5);
  asm.add('metal', new THREE.CylinderGeometry(0.2, 0.2, 0.7, 24), compose(back, [0, 0, Math.PI / 2]));
  asm.add('metal', torus(0.2, 0.03, 8, 32), compose([back.x - 0.36, back.y, back.z], [0, Math.PI / 2, 0]));
  asm.add('metal', torus(0.2, 0.03, 8, 32), compose([back.x + 0.36, back.y, back.z], [0, Math.PI / 2, 0]));
  return { asm, tryOn: necklaceTryOn(fn, shape.halfWidth, shape.depth) };
}

function templeMotif(asm, matrix, gem, small = true) {
  const m = new Assembly();
  const R = small ? 0.38 : 0.5;
  m.add('metal', new THREE.CylinderGeometry(R, R * 0.96, 0.09, 24), compose([0, 0, 0], [Math.PI / 2, 0, 0]));
  m.add('metal', torus(R, 0.045, 6, 32), compose([0, 0, 0.05]));
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * TAU;
    m.add('metal', sphere(0.045, 6, 4), compose([Math.cos(a) * R * 0.78, Math.sin(a) * R * 0.78, 0.06]));
  }
  m.add(`${gem}-cabochon`, sphere(1, 14, 10), compose([0, 0, 0.07], [0, 0, 0], [R * 0.5, R * 0.5, R * 0.3]));
  m.add('metal', torus(R * 0.52, 0.03, 5, 24), compose([0, 0, 0.07]));
  // hanging drop: gold bead + pearl
  rodBetween(m, 'metal', new THREE.Vector3(0, -R, 0), new THREE.Vector3(0, -R - 0.12, 0), 0.018);
  m.add('metal', sphere(0.07, 8, 6), compose([0, -R - 0.18, 0]));
  m.add('pearl', sphere(1, 12, 8), compose([0, -R - 0.38, 0], [0, 0, 0], small ? 0.12 : 0.15));
  asm.merge(m, matrix);
}

function necklaceTemple() {
  const shape = { halfWidth: 6.1, depth: 5.3, drop: 6.8, forward: 2.4, sharp: 1.35 };
  const fn = necklaceFn(shape);
  const curve = loopCurve(fn, 200);
  const asm = new Assembly();
  ropeAlongCurve(asm, 'metal', curve, { radius: 0.05, strand: 0.042, twists: Math.round(curve.getLength() * 1.6), samples: 520 });
  const L = curve.getLength();
  const spacing = 0.95;
  const centerGap = 1.1;
  const maxS = L * 0.27;
  let i = 0;
  for (let s = centerGap; s < maxS; s += spacing, i++) {
    for (const side of [1, -1]) {
      const u = (side > 0 ? s : L - s) / L;
      const p = curve.getPointAt(u);
      const out = new THREE.Vector3(p.x, 0, p.z).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const x = new THREE.Vector3().crossVectors(up, out);
      const pos = p.clone().addScaledVector(up, -0.36).addScaledVector(out, 0.06);
      templeMotif(asm, basis(pos, x, up, out), i % 2 ? 'emerald' : 'ruby', true);
    }
  }
  // central lotus pendant
  const front = fn(0);
  const c = new THREE.Vector3(0, front.y - 0.95, front.z + 0.12);
  const lotus = new Assembly();
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * TAU;
    lotus.add('metal', sphere(1, 16, 10), compose([Math.cos(a) * 0.62, Math.sin(a) * 0.62, -0.02], [0, 0, a + Math.PI / 2], [0.16, 0.3, 0.08]));
  }
  lotus.add('metal', new THREE.CylinderGeometry(0.62, 0.62, 0.1, 40), compose([0, 0, -0.06], [Math.PI / 2, 0, 0]));
  lotus.add('ruby-cabochon', sphere(1, 24, 16), compose([0, 0, 0.08], [0, 0, 0], [0.42, 0.42, 0.24]));
  lotus.add('metal', torus(0.44, 0.06, 10, 64), compose([0, 0, 0.06]));
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * TAU;
    lotus.add('metal', sphere(0.05, 8, 6), compose([Math.cos(a) * 0.53, Math.sin(a) * 0.53, 0.1]));
  }
  // emerald drop and pearl fringe
  lotus.add('metal', torus(0.27, 0.045, 8, 40), compose([0, -1.08, 0.02], [0, 0, 0], [1, 1.25, 1]));
  lotus.add('emerald-cabochon', sphere(1, 20, 14), compose([0, -1.08, 0.04], [0, 0, 0], [0.24, 0.3, 0.16]));
  rodBetween(lotus, 'metal', new THREE.Vector3(0, -0.72, 0), new THREE.Vector3(0, -0.74, 0), 0.05);
  for (const x of [-0.32, 0, 0.32]) {
    const y = -1.58 - (x === 0 ? 0.12 : 0);
    rodBetween(lotus, 'metal', new THREE.Vector3(x * 0.5, -1.4, 0), new THREE.Vector3(x, y + 0.1, 0), 0.016);
    lotus.add('pearl', sphere(1, 14, 10), compose([x, y, 0], [0, 0, 0], 0.13));
  }
  asm.merge(lotus, compose(c, [-0.18, 0, 0]));
  return { asm, tryOn: necklaceTryOn(fn, shape.halfWidth, shape.depth) };
}

/* ------------------------------------------------------------------ */
/*  Earrings (single earring hanging from the origin)                  */
/* ------------------------------------------------------------------ */

function earringStud(spec) {
  const asm = new Assembly();
  const size = spec.size ?? 0.26;
  addHead(asm, { stone: spec.stone ?? 'diamond', size, prongs: 4, matrix: compose([0, 0, 0.12], FACE_FORWARD) });
  rodBetween(asm, 'metal', new THREE.Vector3(0, 0, -0.1), new THREE.Vector3(0, 0, -0.95), 0.032);
  asm.add('metal', new THREE.CylinderGeometry(0.2, 0.2, 0.05, 28), compose([0, 0, -0.72], [Math.PI / 2, 0, 0]));
  return asm;
}

function earringHoop(spec, single) {
  const asm = new Assembly();
  const R = spec.radius ?? 0.95;
  const tube = spec.tube ?? 0.11;
  asm.add('metal', torus(R, tube, 16, 120), compose([0, -R, 0], [0, single ? 1.2 : 0, 0]));
  return asm;
}

function earringPearlDrop() {
  const asm = new Assembly();
  addHead(asm, { size: 0.085, bezel: true, matrix: compose([0, 0, 0.06], FACE_FORWARD) });
  rodBetween(asm, 'metal', new THREE.Vector3(0, -0.08, 0.02), new THREE.Vector3(0, -0.17, 0.02), 0.02);
  asm.add('metal', torus(0.065, 0.018, 8, 24), compose([0, -0.2, 0.02], [0, Math.PI / 2, 0]));
  asm.add('metal', new THREE.CylinderGeometry(0.05, 0.15, 0.09, 24), compose([0, -0.3, 0.02]));
  asm.add('pearl', sphere(1, 28, 20), compose([0, -0.72, 0.02], [0, 0, 0], 0.42));
  rodBetween(asm, 'metal', new THREE.Vector3(0, 0, -0.05), new THREE.Vector3(0, 0, -0.85), 0.03);
  return asm;
}

function earringPearDrop(spec) {
  const asm = new Assembly();
  addHead(asm, { size: 0.1, prongs: 4, matrix: compose([0, 0, 0.08], FACE_FORWARD) });
  const links = [-0.26, -0.43, -0.6];
  links.forEach((y) => addHead(asm, { size: 0.065, bezel: true, matrix: compose([0, y, 0.06], FACE_FORWARD) }));
  rodBetween(asm, 'metal', new THREE.Vector3(0, -0.06, 0.03), new THREE.Vector3(0, -0.7, 0.03), 0.02);
  const size = spec.size ?? 0.42;
  const haloR = 0.042;
  const cy = -0.72 - size - haloR * 2.4;
  const m = compose([0, cy, 0.08], FACE_FORWARD);
  addHead(asm, { stone: spec.stone ?? 'sapphire', shape: 'pear', size, prongs: 3, matrix: m });
  addHalo(asm, { shape: 'pear', size, stoneR: haloR, y: -0.1 * size, matrix: m });
  rodBetween(asm, 'metal', new THREE.Vector3(0, 0, -0.05), new THREE.Vector3(0, 0, -0.85), 0.03);
  return asm;
}

function earringJhumka() {
  const asm = new Assembly();
  // floral stud
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * TAU;
    asm.add('metal', sphere(1, 14, 10), compose([Math.cos(a) * 0.17, Math.sin(a) * 0.17, 0.03], [0, 0, a + Math.PI / 2], [0.09, 0.15, 0.06]));
  }
  asm.add('ruby-cabochon', sphere(1, 16, 12), compose([0, 0, 0.07], [0, 0, 0], [0.1, 0.1, 0.07]));
  asm.add('metal', torus(0.11, 0.02, 6, 28), compose([0, 0, 0.06]));
  rodBetween(asm, 'metal', new THREE.Vector3(0, 0, -0.05), new THREE.Vector3(0, 0, -0.8), 0.03);
  rodBetween(asm, 'metal', new THREE.Vector3(0, -0.24, 0), new THREE.Vector3(0, -0.42, 0), 0.025);
  asm.add('metal', torus(0.05, 0.016, 6, 20), compose([0, -0.3, 0], [0, Math.PI / 2, 0]));
  // bell dome
  const top = -0.42;
  const prof = [
    [0.05, 0], [0.16, -0.03], [0.3, -0.12], [0.42, -0.3], [0.5, -0.54], [0.56, -0.8], [0.62, -0.94], [0.64, -0.98],
    [0.6, -0.98], [0.55, -0.86], [0.49, -0.6], [0.41, -0.36], [0.3, -0.18], [0.16, -0.08], [0.05, -0.05], [0.05, 0],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  asm.add('metal', new THREE.LatheGeometry(prof, 56), compose([0, top, 0]));
  asm.add('metal', torus(0.47, 0.03, 8, 56), compose([0, top - 0.42, 0], [Math.PI / 2, 0, 0]));
  asm.add('metal', torus(0.6, 0.032, 8, 64), compose([0, top - 0.9, 0], [Math.PI / 2, 0, 0]));
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * TAU;
    const d = new THREE.Vector3(Math.cos(a), 0.25, Math.sin(a)).normalize();
    asm.add(k % 2 ? 'emerald-cabochon' : 'ruby-cabochon', sphere(1, 12, 8), compose([Math.cos(a) * 0.54, top - 0.68, Math.sin(a) * 0.54], alignY(d), [0.06, 0.045, 0.06]));
  }
  for (let k = 0; k < 18; k++) {
    const a = (k / 18) * TAU;
    asm.add('metal', sphere(0.045, 8, 6), compose([Math.cos(a) * 0.65, top - 0.99, Math.sin(a) * 0.65]));
  }
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * TAU + 0.13;
    const x = Math.cos(a) * 0.6;
    const z = Math.sin(a) * 0.6;
    rodBetween(asm, 'metal', new THREE.Vector3(x, top - 1.0, z), new THREE.Vector3(x, top - 1.1, z), 0.012);
    asm.add('pearl', sphere(1, 12, 8), compose([x, top - 1.18, z], [0, 0, 0], 0.075));
  }
  asm.add('ruby-cabochon', sphere(1, 14, 10), compose([0, top - 0.95, 0], [0, 0, 0], 0.12));
  return asm;
}

const EARRINGS = {
  stud: { build: earringStud, sep: 1.0, yaw: 0.25 },
  hoop: { build: earringHoop, sep: 1.45, yaw: 0.55 },
  'pearl-drop': { build: earringPearlDrop, sep: 1.15, yaw: 0.3 },
  'pear-drop': { build: earringPearDrop, sep: 1.2, yaw: 0.3 },
  jhumka: { build: earringJhumka, sep: 1.6, yaw: 0.35 },
};

function earrings(spec, { single }) {
  const def = EARRINGS[spec.style];
  const one = def.build(spec, single);
  if (single) return { asm: one, tryOn: { type: 'earring' } };
  const asm = new Assembly();
  asm.merge(one, compose([-def.sep, 0, 0], [0, def.yaw, 0]));
  asm.merge(spec.style === 'hoop' ? def.build(spec, false) : one, compose([def.sep, 0, 0], [0, -def.yaw, 0]));
  return { asm, tryOn: { type: 'earring' } };
}

/* ------------------------------------------------------------------ */
/*  Bracelets                                                          */
/* ------------------------------------------------------------------ */

const WRIST = { rx: 3.35, ry: 3.0 };

function braceletChain(spec) {
  const asm = new Assembly();
  const curve = loopCurve(ellipseFn(WRIST.rx, WRIST.ry), 120);
  const link = spec.link ?? 0.92;
  const opts = {
    curb: { length: 0.95, width: 0.64, wire: 0.13 },
    paperclip: { length: 0.98, width: 0.36, wire: 0.045, gapFrom: 0.47, gapTo: 0.53 },
    cable: { length: 0.5, width: 0.36, wire: 0.06 },
  }[spec.chain ?? 'curb'] ?? { length: link, width: link * 0.66, wire: 0.1 };
  chainAlongCurve(asm, 'metal', curve, opts);
  // clasp at the bottom
  const b = curve.getPointAt(0.0);
  asm.add('metal', new THREE.CylinderGeometry(0.12, 0.12, 0.5, 20), compose([b.x, b.y - 0.02, b.z], [0, 0, Math.PI / 2]));
  if (spec.chain === 'paperclip') {
    const t = curve.getPointAt(0.5);
    addHead(asm, { size: 0.13, bezel: true, matrix: compose([t.x, t.y + 0.02, t.z + 0.02], [0, 0, 0]) });
    for (const side of [-1, 1]) asm.add('metal', torus(0.1, 0.03, 8, 24), compose([side * 0.32, t.y, 0], [0, Math.PI / 2, 0]));
  }
  if (spec.charms) addCharms(asm, curve);
  return { asm, tryOn: { type: 'wrist', innerRadius: WRIST.ry } };
}

function heartGeometry() {
  const s = new THREE.Shape();
  s.moveTo(5, 5);
  s.bezierCurveTo(5, 5, 4, 0, 0, 0);
  s.bezierCurveTo(-6, 0, -6, 7, -6, 7);
  s.bezierCurveTo(-6, 11, -3, 15.4, 5, 19);
  s.bezierCurveTo(12, 15.4, 16, 11, 16, 7);
  s.bezierCurveTo(16, 7, 16, 0, 10, 0);
  s.bezierCurveTo(7, 0, 5, 5, 5, 5);
  const g = new THREE.ExtrudeGeometry(s, { depth: 1.6, bevelEnabled: true, bevelThickness: 0.9, bevelSize: 0.9, bevelSegments: 3, curveSegments: 14 });
  g.translate(-5, -9.5, -0.8);
  return g;
}

function starGeometry(outer = 0.3, inner = 0.13) {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + (i / 10) * TAU;
    const r = i % 2 ? inner : outer;
    if (i === 0) s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.02, bevelSegments: 2 });
  g.translate(0, 0, -0.02);
  return g;
}

function addCharms(asm, curve) {
  const heart = heartGeometry();
  const star = starGeometry();
  const charms = [
    { u: 0.9, kind: 'star' },
    { u: 0.955, kind: 'pearl' },
    { u: 0.0, kind: 'heart' },
    { u: 0.045, kind: 'disc' },
    { u: 0.1, kind: 'ruby' },
  ];
  for (const { u, kind } of charms) {
    const p = curve.getPointAt(u);
    const ring = new THREE.Vector3(p.x, p.y - 0.13, p.z);
    asm.add('metal', torus(0.075, 0.02, 6, 20), compose(ring, [0, Math.PI / 2, 0]));
    const c = new THREE.Vector3(p.x, p.y - 0.2, p.z);
    if (kind === 'heart') asm.add('metal', heart, compose([c.x, c.y - 0.3, c.z], [0, 0, Math.PI], 0.032));
    if (kind === 'star') asm.add('metal', star, compose([c.x, c.y - 0.3, c.z], [0, 0, 0]));
    if (kind === 'pearl') asm.add('pearl', sphere(1, 16, 12), compose([c.x, c.y - 0.16, c.z], [0, 0, 0], 0.16));
    if (kind === 'disc') {
      asm.add('metal', new THREE.CylinderGeometry(0.27, 0.27, 0.05, 36), compose([c.x, c.y - 0.27, c.z], [Math.PI / 2, 0, 0]));
      addHead(asm, { size: 0.07, bezel: true, matrix: compose([c.x, c.y - 0.27, c.z + 0.05], FACE_FORWARD) });
    }
    if (kind === 'ruby') addHead(asm, { stone: 'ruby', shape: 'pear', size: 0.2, bezel: true, matrix: compose([c.x, c.y - 0.26, c.z + 0.02], [Math.PI / 2, 0, Math.PI]) });
  }
}

function braceletTennis() {
  const asm = new Assembly();
  const curve = loopCurve(ellipseFn(WRIST.rx, WRIST.ry), 160);
  const L = curve.getLength();
  const n = Math.round(L / 0.34);
  const pts = [];
  for (let k = 0; k < n; k++) {
    const u = k / n;
    const p = curve.getPointAt(u);
    const t = curve.getTangentAt(u);
    const out = new THREE.Vector3(p.x / WRIST.rx ** 2, p.y / WRIST.ry ** 2, 0).normalize();
    const z = new THREE.Vector3().crossVectors(t, out);
    addHead(asm, { size: 0.135, prongs: 4, basket: false, matrix: basis(p.clone().addScaledVector(out, 0.1), t, out, z) });
    asm.add('metal', new THREE.CylinderGeometry(0.15, 0.1, 0.16, 12, 1), basis(p.clone().addScaledVector(out, 0.0), t, out, z));
    pts.push(p.clone().addScaledVector(out, -0.04));
  }
  pts.forEach((p, i) => rodBetween(asm, 'metal', p, pts[(i + 1) % pts.length], 0.035, 6));
  return { asm, tryOn: { type: 'wrist', innerRadius: WRIST.ry } };
}

/* ------------------------------------------------------------------ */
/*  Bangles                                                            */
/* ------------------------------------------------------------------ */

const BANGLE_R = 3.3;

function surfaceRadius(t, w, n, z) {
  const e = 2 / n;
  const sin = Math.min(1, Math.abs(z / w)) ** (1 / e);
  const sx = Math.sqrt(Math.max(0, 1 - sin * sin)) ** e;
  return BANGLE_R + t + t * sx;
}

function banglePolished() {
  const asm = new Assembly();
  const t = 0.14;
  const w = 0.34;
  const n = 3.2;
  asm.add('metal', sweepRing({ radius: BANGLE_R + t, profile: () => ({ t, w, n }), segments: 200, csSegments: 24 }));
  for (const z of [-0.24, 0.24]) asm.add('metal', torus(surfaceRadius(t, w, n, z), 0.022, 6, 240), compose([0, 0, z]));
  const beads = 84;
  for (let k = 0; k < beads; k++) {
    const a = (k / beads) * TAU;
    const r = BANGLE_R + 2 * t - 0.005;
    asm.add('metal', sphere(0.034, 6, 4), compose([Math.cos(a) * r, Math.sin(a) * r, 0]));
  }
  return { asm, tryOn: { type: 'wrist', innerRadius: BANGLE_R } };
}

function bangleDiamond() {
  const asm = new Assembly();
  const t = 0.12;
  const w = 0.2;
  const n = 3;
  asm.add('metal', sweepRing({ radius: BANGLE_R + t, profile: () => ({ t, w, n }), segments: 200, csSegments: 20 }));
  const outer = BANGLE_R + 2 * t;
  const gem = gemGeometry('round', 10);
  const count = 52;
  for (let k = 0; k <= count; k++) {
    const a = (k / count) * Math.PI;
    const d = new THREE.Vector3(Math.cos(a), Math.sin(a), 0);
    asm.add('diamond', gem, compose(d.clone().multiplyScalar(outer - 0.02), alignY(d), 0.085));
  }
  for (const z of [-0.125, 0.125]) asm.add('metal', torus(outer - 0.01, 0.032, 6, 160, Math.PI + 0.05), compose([0, 0, z], [0, 0, -0.025]));
  return { asm, tryOn: { type: 'wrist', innerRadius: BANGLE_R } };
}

function bangleKada() {
  const asm = new Assembly();
  const t = 0.18;
  const w = 0.58;
  const n = 5;
  asm.add('metal', sweepRing({ radius: BANGLE_R + t, profile: () => ({ t, w, n }), segments: 200, csSegments: 28 }));
  for (const z of [-0.3, 0.3]) asm.add('metal', torus(surfaceRadius(t, w, n, z), 0.045, 8, 220), compose([0, 0, z]));
  const edgeR = surfaceRadius(t, w, n, 0.5) + 0.02;
  for (const z of [-0.5, 0.5]) {
    for (let k = 0; k < 96; k++) {
      const a = (k / 96) * TAU;
      asm.add('metal', sphere(0.055, 6, 5), compose([Math.cos(a) * edgeR, Math.sin(a) * edgeR, z]));
    }
  }
  const outer = BANGLE_R + 2 * t;
  const stones = 20;
  for (let k = 0; k < stones; k++) {
    const a = (k / stones) * TAU;
    const d = new THREE.Vector3(Math.cos(a), Math.sin(a), 0);
    const q = alignY(d);
    asm.add(k % 2 ? 'emerald-cabochon' : 'ruby-cabochon', sphere(1, 16, 12), compose(d.clone().multiplyScalar(outer + 0.02), q, [0.17, 0.1, 0.17]));
    asm.add('metal', torus(0.19, 0.04, 8, 32), compose(d.clone().multiplyScalar(outer + 0.01), q.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)))));
    const a2 = a + Math.PI / stones;
    asm.add('metal', sphere(0.075, 10, 8), compose([Math.cos(a2) * (outer + 0.02), Math.sin(a2) * (outer + 0.02), 0]));
  }
  return { asm, tryOn: { type: 'wrist', innerRadius: BANGLE_R } };
}

/* ------------------------------------------------------------------ */
/*  Registry                                                           */
/* ------------------------------------------------------------------ */

const BUILDERS = {
  'ring:setting': ringSetting,
  'ring:band': ringBand,
  'necklace:rope': necklaceRope,
  'necklace:cable': necklaceCable,
  'necklace:halo-pendant': necklaceHaloPendant,
  'necklace:circle-pendant': necklaceCirclePendant,
  'necklace:pearls': necklacePearls,
  'necklace:temple': necklaceTemple,
  'earrings:stud': earrings,
  'earrings:hoop': earrings,
  'earrings:pearl-drop': earrings,
  'earrings:pear-drop': earrings,
  'earrings:jhumka': earrings,
  'bracelet:chain': braceletChain,
  'bracelet:tennis': braceletTennis,
  'bangle:polished': banglePolished,
  'bangle:diamond': bangleDiamond,
  'bangle:kada': bangleKada,
};

/** Preferred presentation angle for each kind (used by viewers and renders). */
export const DISPLAY_ROTATION = {
  ring: [-0.32, 0.62, 0],
  necklace: [0.2, 0, 0],
  earrings: [0.05, 0, 0],
  bracelet: [-1.0, 0, 0.12],
  bangle: [-1.05, 0, 0.1],
};

/**
 * Build a jewellery model from a spec such as
 *   { kind: 'ring', style: 'setting', metal: 'white', stone: 'diamond', size: 0.33 }
 * Returns a THREE.Group (one merged mesh per material) whose userData holds
 * try-on calibration data.
 */
export function buildJewellery(spec, { single = false } = {}) {
  const fn = BUILDERS[`${spec.kind}:${spec.style}`];
  if (!fn) throw new Error(`Unknown jewellery model ${spec.kind}:${spec.style}`);
  const { asm, tryOn } = fn(spec, { single });
  const group = asm.toGroup(createMaterialLibrary(spec.metal ?? 'yellow'), `${spec.kind}-${spec.style}`);
  group.userData = { kind: spec.kind, style: spec.style, metal: spec.metal, tryOn };
  return group;
}

/**
 * Invisible, depth-only elliptical "neck" that hides the back of a necklace,
 * so it drapes as if worn (used for product shots and virtual try-on).
 */
export function createNeckOccluder(neck) {
  const height = neck.top - neck.bottom;
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1, height, 48, 1),
    new THREE.MeshBasicMaterial({ colorWrite: false }),
  );
  mesh.scale.set(neck.rx, 1, neck.rz);
  mesh.position.y = neck.bottom + height / 2;
  mesh.renderOrder = -1;
  mesh.name = 'neck-occluder';
  return mesh;
}

/** True when a model-space point is hidden behind the neck occluder. */
export function isBehindNeck(neck, x, y, z) {
  if (y < neck.bottom || Math.abs(x) >= neck.rx) return false;
  return z < neck.rz * Math.sqrt(1 - (x / neck.rx) ** 2);
}

export function disposeObject(object) {
  object.traverse((o) => {
    if (o.isMesh) {
      o.geometry?.dispose();
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m) => m?.dispose());
    }
  });
}
