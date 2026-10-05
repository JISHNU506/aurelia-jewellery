import { useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { buildJewellery, DISPLAY_ROTATION } from '../../utils/jewellery/builders.js';
import { METALS } from '../../utils/jewellery/materials.js';
import { applyGemEnvironment, createStudioEnvironment } from '../../utils/jewellery/studio.js';

/* ---------- environment maps (cached per renderer + preset) ---------- */
const envCache = new WeakMap();
export function getStudioEnv(gl, preset) {
  let byPreset = envCache.get(gl);
  if (!byPreset) envCache.set(gl, (byPreset = new Map()));
  if (!byPreset.has(preset)) byPreset.set(preset, createStudioEnvironment(gl, preset));
  return byPreset.get(preset);
}

/** Procedural photo-studio lighting (no HDR downloads). */
export function StudioEnvironment({ preset = 'studio', intensity = 1 }) {
  const { gl, scene } = useThree();
  useEffect(() => {
    scene.environment = getStudioEnv(gl, preset);
    scene.environmentIntensity = intensity;
  }, [gl, scene, preset, intensity]);
  return null;
}

/* ---------- model sources ---------- */
function cloneWithMaterials(source) {
  const copy = source.clone(true);
  copy.traverse((o) => {
    if (o.isMesh) o.material = Array.isArray(o.material) ? o.material.map((m) => m.clone()) : o.material.clone();
  });
  return copy;
}

function useGLBObject(url) {
  const { scene } = useGLTF(url);
  return useMemo(() => cloneWithMaterials(scene), [scene]);
}

function useProceduralObject(spec, single) {
  return useMemo(() => buildJewellery(spec, { single }), [spec, single]);
}

/* ---------- presentation ---------- */
function usePresentation(object, { kind, metal, normalize = true }) {
  const { gl } = useThree();

  // Measure without permanently re-parenting `object` (useMemo may run twice in StrictMode).
  const layout = useMemo(() => {
    const rotation = normalize ? (DISPLAY_ROTATION[kind] ?? [0, 0, 0]) : [0, 0, 0];
    if (!normalize) return { rotation, offset: [0, 0, 0], scale: 1, bottom: 0 };
    const probe = new THREE.Group();
    probe.rotation.set(...rotation);
    const parent = object.parent;
    probe.add(object);
    probe.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(probe);
    probe.remove(object);
    if (parent) parent.add(object);
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const scale = 1 / sphere.radius;
    return { rotation, offset: sphere.center.clone().multiplyScalar(-1).toArray(), scale, bottom: (box.min.y - sphere.center.y) * scale };
  }, [object, kind, normalize]);

  // stones & pearls get the high-contrast "gem" environment for fire and lustre
  useEffect(() => {
    applyGemEnvironment(object, getStudioEnv(gl, 'gem'));
  }, [object, gl]);

  // live metal re-tint (materials are named "metal" in both GLB and procedural models)
  useEffect(() => {
    if (!metal || !METALS[metal]) return;
    object.traverse((o) => {
      if (o.isMesh && o.material?.name === 'metal') {
        o.material.color.set(METALS[metal].color);
        o.material.roughness = METALS[metal].roughness;
      }
    });
  }, [object, metal]);

  return layout;
}

function Presented({ object, kind, metal, onReady, normalize }) {
  const { rotation, offset, scale, bottom } = usePresentation(object, { kind, metal, normalize });
  useEffect(() => {
    onReady?.({ bottom });
  }, [bottom, onReady]);
  return (
    <group scale={scale}>
      <group position={offset}>
        <group rotation={rotation}>
          <primitive object={object} />
        </group>
      </group>
    </group>
  );
}

function GLBModel(props) {
  const object = useGLBObject(props.url);
  return <Presented object={object} {...props} />;
}

function ProceduralModel(props) {
  const object = useProceduralObject(props.spec, props.single);
  return <Presented object={object} {...props} />;
}

/**
 * Renders a jewellery piece from a .glb URL when available, otherwise builds
 * it procedurally from its spec. Normalised to a unit bounding sphere.
 */
export default function JewelleryModel({ url, spec, kind, metal, single = false, normalize = true, onReady }) {
  if (url && !single) return <GLBModel url={url} kind={kind} metal={metal} onReady={onReady} normalize={normalize} />;
  return <ProceduralModel spec={spec} single={single} kind={kind} metal={metal} onReady={onReady} normalize={normalize} />;
}
