import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

export const TAU = Math.PI * 2;
const UP = new THREE.Vector3(0, 1, 0);

/* ------------------------------------------------------------------ */
/*  Matrix helpers                                                     */
/* ------------------------------------------------------------------ */

export function compose(position = [0, 0, 0], rotation = [0, 0, 0], scale = 1) {
  const q =
    rotation instanceof THREE.Quaternion
      ? rotation
      : new THREE.Quaternion().setFromEuler(new THREE.Euler(rotation[0], rotation[1], rotation[2], rotation[3] ?? 'XYZ'));
  const s = typeof scale === 'number' ? new THREE.Vector3(scale, scale, scale) : new THREE.Vector3(...scale);
  const p = position instanceof THREE.Vector3 ? position : new THREE.Vector3(...position);
  return new THREE.Matrix4().compose(p, q, s);
}

/** Quaternion that rotates +Y onto `dir`. */
export function alignY(dir) {
  return new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize());
}

/** Matrix whose local X, Y, Z axes map to the given world axes. */
export function basis(position, x, y, z, scale = 1) {
  const m = new THREE.Matrix4().makeBasis(x, y, z);
  if (scale !== 1) m.scale(new THREE.Vector3(scale, scale, scale));
  m.setPosition(position);
  return m;
}

/* ------------------------------------------------------------------ */
/*  Assembly — collects parts and merges them per material             */
/* ------------------------------------------------------------------ */

export class Assembly {
  constructor() {
    this.parts = {};
  }

  add(material, geometry, matrix) {
    const g = geometry.clone();
    if (matrix) g.applyMatrix4(matrix);
    (this.parts[material] ||= []).push(g);
    return this;
  }

  /** Merge another assembly into this one, transformed by `matrix`. */
  merge(other, matrix) {
    for (const [mat, list] of Object.entries(other.parts)) list.forEach((g) => this.add(mat, g, matrix));
    return this;
  }

  toGroup(getMaterial, name = 'jewellery') {
    const group = new THREE.Group();
    group.name = name;
    for (const [key, list] of Object.entries(this.parts)) {
      const cleaned = list.map((g) => {
        const c = g;
        for (const attr of Object.keys(c.attributes)) if (attr !== 'position' && attr !== 'normal') c.deleteAttribute(attr);
        if (!c.attributes.normal) c.computeVertexNormals();
        return c;
      });
      const anyIndexed = cleaned.some((g) => g.index);
      const anyFlat = cleaned.some((g) => !g.index);
      let ready = cleaned;
      if (anyIndexed && anyFlat) ready = cleaned.map((g) => (g.index ? g : mergeVertices(g, 1e-5)));
      const merged = mergeGeometries(ready, false);
      merged.computeBoundingSphere();
      const mesh = new THREE.Mesh(merged, getMaterial(key));
      mesh.name = key;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    }
    return group;
  }
}

/* ------------------------------------------------------------------ */
/*  Faceted gemstones                                                  */
/* ------------------------------------------------------------------ */

const SHAPE_FNS = {
  round: (t) => [Math.cos(t * TAU), Math.sin(t * TAU)],
  oval: (t) => [Math.cos(t * TAU), Math.sin(t * TAU) * 0.74],
  cushion: (t) => {
    const c = Math.cos(t * TAU);
    const s = Math.sin(t * TAU);
    const e = 0.62;
    return [Math.sign(c) * Math.abs(c) ** e, Math.sign(s) * Math.abs(s) ** e];
  },
  // Teardrop with the point towards -Z (rotates to point "up" on pendants).
  pear: (t) => {
    const a = t * TAU;
    const x = Math.cos(a);
    const y = Math.sin(a) * Math.sin(a / 2) ** 1.15;
    return [y * 1.06, -x];
  },
};

const EMERALD_OUTLINE = (() => {
  const a = 1;
  const b = 0.72;
  const c = 0.22;
  return [
    [a, b - c], [a - c, b], [-a + c, b], [-a, b - c],
    [-a, -b + c], [-a + c, -b], [a - c, -b], [a, -b + c],
  ];
})();

export function gemOutline(shape = 'round', n = 16, half = false) {
  if (shape === 'emerald') return EMERALD_OUTLINE;
  const f = SHAPE_FNS[shape] ?? SHAPE_FNS.round;
  return Array.from({ length: n }, (_, j) => f((j + (half ? 0.5 : 0)) / n));
}

/** Dense outline (for halos / bezels) offset outward by `offset` after scaling. */
export function offsetOutline(shape, size, scale = [1, 1], offset = 0, samples = 96) {
  const base =
    shape === 'emerald'
      ? densifyPolygon(EMERALD_OUTLINE, samples)
      : gemOutline(shape, samples).map(([x, z]) => [x, z]);
  const pts = base.map(([x, z]) => [x * size * scale[0], z * size * scale[1]]);
  const n = pts.length;
  return pts.map(([x, z], i) => {
    const [px, pz] = pts[(i - 1 + n) % n];
    const [nx, nz] = pts[(i + 1) % n];
    let tx = nx - px;
    let tz = nz - pz;
    const len = Math.hypot(tx, tz) || 1;
    tx /= len;
    tz /= len;
    // outward normal (polygon is counter-clockwise in X/Z => rotate tangent)
    let ox = tz;
    let oz = -tx;
    if (ox * x + oz * z < 0) {
      ox = -ox;
      oz = -oz;
    }
    return [x + ox * offset, z + oz * offset];
  });
}

function densifyPolygon(poly, samples) {
  const segs = poly.map((p, i) => [p, poly[(i + 1) % poly.length]]);
  const lens = segs.map(([a, b]) => Math.hypot(b[0] - a[0], b[1] - a[1]));
  const total = lens.reduce((s, l) => s + l, 0);
  const out = [];
  segs.forEach(([a, b], i) => {
    const k = Math.max(1, Math.round((lens[i] / total) * samples));
    for (let j = 0; j < k; j++) out.push([a[0] + ((b[0] - a[0]) * j) / k, a[1] + ((b[1] - a[1]) * j) / k]);
  });
  return out;
}

/** Resample a closed 2D polyline at a fixed spacing. */
export function resampleClosed(points, spacing) {
  const n = points.length;
  const cum = [0];
  for (let i = 0; i < n; i++) {
    const a = points[i];
    const b = points[(i + 1) % n];
    cum.push(cum[i] + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  const total = cum[n];
  const count = Math.max(3, Math.round(total / spacing));
  const out = [];
  let seg = 0;
  for (let k = 0; k < count; k++) {
    const d = (k / count) * total;
    while (cum[seg + 1] < d) seg++;
    const a = points[seg];
    const b = points[(seg + 1) % n];
    const t = (d - cum[seg]) / (cum[seg + 1] - cum[seg] || 1);
    out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
  }
  return out;
}

export const CUTS = {
  brilliant: [
    { y: -0.86, s: 0 },
    { y: -0.4, s: 0.535, half: true },
    { y: 0, s: 1 },
    { y: 0.035, s: 1 },
    { y: 0.16, s: 0.79, half: true },
    { y: 0.3, s: 0.56 },
    { y: 0.3, s: 0 },
  ],
  step: [
    { y: -0.6, s: 0 },
    { y: -0.42, s: 0.4 },
    { y: -0.2, s: 0.76 },
    { y: 0, s: 1 },
    { y: 0.035, s: 1 },
    { y: 0.11, s: 0.88 },
    { y: 0.18, s: 0.76 },
    { y: 0.22, s: 0.67 },
    { y: 0.22, s: 0 },
  ],
};

const gemCache = new Map();

/**
 * Flat-shaded faceted gem. Girdle sits at y = 0, table faces +Y,
 * largest outline radius = 1.
 */
export function gemGeometry(shape = 'round', n = 16) {
  const key = `${shape}-${n}`;
  if (gemCache.has(key)) return gemCache.get(key);
  const cut = shape === 'emerald' ? 'step' : 'brilliant';
  const levels = CUTS[cut];
  const rings = levels.map((l) =>
    gemOutline(shape, n, !!l.half).map(([x, z]) => new THREE.Vector3(x * l.s, l.y, z * l.s)),
  );
  const ys = levels.map((l) => l.y);
  const center = new THREE.Vector3(0, (Math.min(...ys) + Math.max(...ys)) / 2, 0);
  const pos = [];
  const ab = new THREE.Vector3();
  const ac = new THREE.Vector3();
  const g = new THREE.Vector3();
  const tri = (a, b, c) => {
    ab.subVectors(b, a);
    ac.subVectors(c, a);
    const nrm = ab.clone().cross(ac);
    if (nrm.lengthSq() < 1e-12) return;
    g.copy(a).add(b).add(c).divideScalar(3).sub(center);
    if (nrm.dot(g) < 0) [b, c] = [c, b];
    pos.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
  };
  for (let i = 0; i < rings.length - 1; i++) {
    const A = rings[i];
    const B = rings[i + 1];
    const m = A.length;
    const ha = !!levels[i].half;
    const hb = !!levels[i + 1].half;
    for (let j = 0; j < m; j++) {
      const a0 = A[j];
      const a1 = A[(j + 1) % m];
      const b0 = B[j];
      const b1 = B[(j + 1) % m];
      if (hb && !ha) {
        tri(a0, a1, b0);
        tri(b0, a1, b1);
      } else if (ha && !hb) {
        tri(a0, b1, b0);
        tri(a0, a1, b1);
      } else {
        tri(a0, a1, b1);
        tri(a0, b1, b0);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  gemCache.set(key, geo);
  return geo;
}

/* ------------------------------------------------------------------ */
/*  Metal primitives                                                   */
/* ------------------------------------------------------------------ */

/**
 * Sweeps a superellipse cross-section around the Z axis (ring in the XY plane).
 * `profile(u)` receives u = 0 at the top (+Y) to 1 at the bottom and returns
 * { t: radial half-thickness, w: axial half-width, n: squareness, off: radial offset }.
 */
export function sweepRing({ radius, profile, segments = 160, csSegments = 20 }) {
  const pos = [];
  const idx = [];
  for (let i = 0; i < segments; i++) {
    const phi = (i / segments) * TAU;
    const dx = Math.cos(phi);
    const dy = Math.sin(phi);
    const dTop = Math.abs(((((phi - Math.PI / 2 + Math.PI) % TAU) + TAU) % TAU) - Math.PI);
    const p = profile(dTop / Math.PI);
    const e = 2 / (p.n ?? 2.6);
    for (let j = 0; j < csSegments; j++) {
      const th = (j / csSegments) * TAU;
      const c = Math.cos(th);
      const s = Math.sin(th);
      const sx = Math.sign(c) * Math.abs(c) ** e;
      const sz = Math.sign(s) * Math.abs(s) ** e;
      const r = radius + (p.off ?? 0) + p.t * sx;
      pos.push(dx * r, dy * r, p.w * sz);
    }
  }
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < csSegments; j++) {
      const a = i * csSegments + j;
      const b = ((i + 1) % segments) * csSegments + j;
      const c = ((i + 1) % segments) * csSegments + ((j + 1) % csSegments);
      const d = i * csSegments + ((j + 1) % csSegments);
      idx.push(a, b, d, b, c, d);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

/** A rod (capsule) between two points. */
export function rodBetween(asm, material, a, b, radius, radialSegments = radius < 0.03 ? 6 : 8) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const geo = new THREE.CapsuleGeometry(radius, Math.max(0.0001, len), radius < 0.03 ? 2 : 3, radialSegments);
  const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
  asm.add(material, geo, compose(mid, alignY(dir)));
}

export function sphere(radius, w = 16, h = 12) {
  return new THREE.SphereGeometry(radius, w, h);
}

/** Torus in the XY plane (axis Z). */
export function torus(radius, tube, radialSegments = 10, tubularSegments = 48, arc = TAU) {
  return new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments, arc);
}

/** Closed tube following a list of 3D points. */
export function closedTube(points, radius, tubularSegments = 64, radialSegments = 8) {
  const curve = new THREE.CatmullRomCurve3(points, true, 'centripetal');
  return new THREE.TubeGeometry(curve, tubularSegments, radius, radialSegments, true);
}

/** Stadium-shaped chain link: long axis X, lying in the XY plane. */
const linkCache = new Map();
export function linkGeometry(length, width, wire) {
  const key = [length, width, wire].join('|');
  if (!linkCache.has(key)) linkCache.set(key, buildLink(length, width, wire));
  return linkCache.get(key);
}

function buildLink(length, width, wire) {
  const fine = wire < 0.08;
  const segments = fine ? 16 : 28;
  const radial = fine ? 5 : 7;
  const hx = Math.max(0, length / 2 - width / 2);
  const r = width / 2 - wire;
  const pts = [];
  const arcN = fine ? 6 : 10;
  const lineN = hx > 0.001 ? (fine ? 2 : 3) : 0;
  const V = (x, y) => new THREE.Vector3(x, y, 0);
  for (let i = 0; i < arcN; i++) {
    const a = -Math.PI / 2 + (i / arcN) * Math.PI;
    pts.push(V(hx + r * Math.cos(a), r * Math.sin(a)));
  }
  for (let i = 0; i < lineN; i++) pts.push(V(hx - 2 * hx * (i / lineN), r));
  for (let i = 0; i < arcN; i++) {
    const a = Math.PI / 2 + (i / arcN) * Math.PI;
    pts.push(V(-hx + r * Math.cos(a), r * Math.sin(a)));
  }
  for (let i = 0; i < lineN; i++) pts.push(V(-hx + 2 * hx * (i / lineN), -r));
  return closedTube(pts, wire, segments, radial);
}

/* ------------------------------------------------------------------ */
/*  Curves                                                             */
/* ------------------------------------------------------------------ */

export function loopCurve(fn, samples = 120) {
  const pts = Array.from({ length: samples }, (_, i) => fn(i / samples));
  return new THREE.CatmullRomCurve3(pts, true, 'centripetal');
}

/**
 * Necklace path as worn on an invisible bust: u = 0 at the front centre,
 * u = 0.5 at the nape. Neck sides sit at y ≈ -sideDrop.
 */
export function necklaceFn({ halfWidth = 6.2, depth = 5.2, drop = 9, forward = 2.6, sharp = 1.6 } = {}) {
  return (u) => {
    const a = u * TAU;
    const f = ((1 + Math.cos(a)) / 2) ** sharp;
    return new THREE.Vector3(
      halfWidth * Math.sin(a) * (1 + 0.18 * f),
      -drop * f ** 1.15,
      depth * Math.cos(a) + forward * f,
    );
  };
}

export function ellipseFn(rx, ry) {
  return (u) => new THREE.Vector3(Math.sin(u * TAU) * rx, -Math.cos(u * TAU) * ry, 0);
}

/** Interlocking links following a closed curve. */
export function chainAlongCurve(asm, material, curve, { length, width, wire, twist = true, gapFrom, gapTo }) {
  const link = linkGeometry(length, width, wire);
  const pitch = length - wire * 2.3;
  const total = curve.getLength();
  const count = Math.max(6, Math.round(total / pitch));
  const frames = curve.computeFrenetFrames(count, true);
  for (let k = 0; k < count; k++) {
    const u = k / count;
    if (gapFrom !== undefined && u > gapFrom && u < gapTo) continue;
    const p = curve.getPointAt(u);
    const T = frames.tangents[k];
    const Y = (twist && k % 2 ? frames.binormals[k] : frames.normals[k]).clone();
    const Z = new THREE.Vector3().crossVectors(T, Y);
    asm.add(material, link, basis(p, T, Y, Z));
  }
  return count;
}

/** Twisted rope chain made of helical strands. */
export function ropeAlongCurve(asm, material, curve, { radius = 0.07, strand = 0.05, strands = 3, twists = 90, samples = 720 }) {
  const frames = curve.computeFrenetFrames(samples, true);
  for (let s = 0; s < strands; s++) {
    const pts = [];
    for (let i = 0; i < samples; i++) {
      const u = i / samples;
      const phi = TAU * twists * u + (s * TAU) / strands;
      const p = curve.getPointAt(u);
      p.addScaledVector(frames.normals[i], Math.cos(phi) * radius);
      p.addScaledVector(frames.binormals[i], Math.sin(phi) * radius);
      pts.push(p);
    }
    asm.add(material, closedTube(pts, strand, samples, 7));
  }
}

/** Point + frame on a curve (tangent, outward normal relative to the curve centroid). */
export function frameAt(curve, u, centroid = new THREE.Vector3()) {
  const p = curve.getPointAt(u);
  const t = curve.getTangentAt(u);
  const out = new THREE.Vector3().subVectors(p, centroid);
  out.addScaledVector(t, -out.dot(t)).normalize();
  return { p, t, out };
}

export { mergeGeometries };
