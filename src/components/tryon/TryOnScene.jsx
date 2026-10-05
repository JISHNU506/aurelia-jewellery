import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { buildJewellery, createNeckOccluder, disposeObject } from '../../utils/jewellery/builders.js';
import { applyGemEnvironment, GEM_MATERIALS } from '../../utils/jewellery/studio.js';
import { getStudioEnv } from '../three/JewelleryModel.jsx';
import { defaultPlacement } from '../../utils/tryon/placement.js';

const occluderMaterial = new THREE.MeshBasicMaterial({ colorWrite: false });

function addOccluder(model, type, tryOn) {
  if (type === 'necklace' && tryOn?.neck) {
    model.add(createNeckOccluder(tryOn.neck));
  } else if (type === 'ring' || type === 'wrist') {
    const r = (tryOn?.innerRadius ?? 0.86) * (type === 'ring' ? 0.97 : 0.9);
    const occ = new THREE.Mesh(new THREE.CylinderGeometry(r, r, type === 'ring' ? 4 : 9, 32), occluderMaterial);
    occ.rotation.x = Math.PI / 2; // align with the finger / wrist axis (model Z)
    occ.renderOrder = -1;
    model.add(occ);
  }
}

/** Builds one placed jewellery instance (model + depth occluder) for the overlay. */
function makeInstance(spec, type) {
  const model = buildJewellery(spec, { single: true });
  const { tryOn } = model.userData;
  // over a live camera feed, crisp reflective stones read better than refraction
  model.traverse((o) => {
    if (o.isMesh && GEM_MATERIALS.includes(o.material.name) && o.material.name !== 'pearl') {
      o.material.transmission = 0;
      o.material.envMapIntensity = 2.4;
    }
  });
  const anchor = tryOn?.anchor ?? [0, 0, 0];
  model.position.set(-anchor[0], -anchor[1], -anchor[2]);
  addOccluder(model, type, tryOn);
  const holder = new THREE.Group();
  holder.add(model);
  holder.visible = false;
  return holder;
}

const qa = new THREE.Quaternion();
const qb = new THREE.Quaternion();
const X = new THREE.Vector3(1, 0, 0);
const Z = new THREE.Vector3(0, 0, 1);

/**
 * Overlay scene rendered with an orthographic camera where 1 world unit = 1 CSS px.
 * Reads tracking results from refs every frame (no React re-renders).
 */
export default function TryOnScene({ product, type, trackRef, adjustRef, manual }) {
  const { gl, size } = useThree();
  const group = useRef();

  const instances = useMemo(() => {
    const count = type === 'earring' ? 2 : 1;
    return Array.from({ length: count }, () => makeInstance(product.model3d, type));
  }, [product, type]);

  useEffect(() => {
    instances.forEach((inst) => applyGemEnvironment(inst, getStudioEnv(gl, 'gem')));
    return () => instances.forEach((inst) => disposeObject(inst));
  }, [instances, gl]);

  const smooth = useRef([]);

  useFrame(() => {
    const now = performance.now();
    const tracked = trackRef.current;
    const live = tracked && now - tracked.at < 650;
    const placement = manual ? defaultPlacement(type, size.width, size.height) : live ? tracked.placement : null;
    const adj = adjustRef.current;

    instances.forEach((inst, i) => {
      const p = placement?.points[i];
      if (!p || !p.visible) {
        inst.visible = false;
        smooth.current[i] = null;
        return;
      }
      const target = {
        x: p.x + adj.x - size.width / 2,
        y: size.height / 2 - (p.y + adj.y),
        s: placement.pxPerCm * adj.scale,
        r: -placement.angle - THREE.MathUtils.degToRad(adj.rotation),
      };
      const prev = smooth.current[i];
      const k = prev ? 0.45 : 1;
      const cur = prev
        ? { x: prev.x + (target.x - prev.x) * k, y: prev.y + (target.y - prev.y) * k, s: prev.s + (target.s - prev.s) * 0.35, r: prev.r + (target.r - prev.r) * 0.4 }
        : target;
      smooth.current[i] = cur;

      inst.visible = true;
      inst.position.set(cur.x, cur.y, 0);
      inst.scale.setScalar(cur.s);
      if (type === 'ring' || type === 'wrist') {
        // band axis along the finger / forearm, tilted so the face of the piece is visible
        qa.setFromAxisAngle(Z, cur.r);
        qb.setFromAxisAngle(X, Math.PI / 2 - (type === 'ring' ? 0.42 : 0.32));
        inst.quaternion.copy(qa).multiply(qb);
      } else {
        inst.quaternion.setFromAxisAngle(Z, cur.r);
        if (type === 'necklace') inst.quaternion.multiply(qb.setFromAxisAngle(X, 0.12));
      }
    });
  });

  return (
    <group ref={group}>
      {instances.map((inst) => (
        <primitive key={inst.uuid} object={inst} />
      ))}
    </group>
  );
}
