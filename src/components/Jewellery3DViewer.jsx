import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, OrbitControls, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import { Maximize2, Minimize2, Pause, Play, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import JewelleryModel, { StudioEnvironment } from './three/JewelleryModel.jsx';
import { LIGHTING_PRESETS } from '../utils/jewellery/studio.js';

const VIEWS = {
  angle: { label: '3/4', pos: [2.4, 1.3, 2.9] },
  front: { label: 'Front', pos: [0, 0.25, 3.9] },
  side: { label: 'Side', pos: [3.9, 0.3, 0] },
  top: { label: 'Top', pos: [0, 3.9, 0.02] },
};

const BACKDROPS = {
  ivory: { label: 'Ivory', color: '#f6f1e8', ui: 'light' },
  champagne: { label: 'Champagne', color: '#e8dbc3', ui: 'light' },
  noir: { label: 'Noir', color: '#151311', ui: 'dark' },
};

const METAL_OPTIONS = [
  { key: null, label: 'Original', swatch: 'conic-gradient(#e3e4e8, #f2c36b, #eba78a, #e3e4e8)' },
  { key: 'yellow', label: 'Yellow Gold', swatch: '#e9c27a' },
  { key: 'rose', label: 'Rose Gold', swatch: '#e7ab92' },
  { key: 'white', label: 'White Gold', swatch: '#dfe0e4' },
];

/** Smoothly moves the camera to a requested position. */
function CameraRig({ request }) {
  const { camera, controls } = useThree();
  const goal = useRef(null);
  useEffect(() => {
    if (request) goal.current = new THREE.Vector3(...request.pos);
  }, [request]);
  useFrame(() => {
    if (!goal.current) return;
    camera.position.lerp(goal.current, 0.12);
    controls?.target.lerp(new THREE.Vector3(0, 0, 0), 0.12);
    controls?.update();
    if (camera.position.distanceTo(goal.current) < 0.005) goal.current = null;
  });
  return null;
}

function Loader({ dark }) {
  const { active, progress } = useProgress();
  if (!active) return null;
  return (
    <div className={`pointer-events-none absolute inset-0 grid place-items-center ${dark ? 'text-ivory' : 'text-ink'}`}>
      <div className="flex flex-col items-center gap-3">
        <span className="h-10 w-10 animate-spin rounded-full border border-current border-t-transparent opacity-60" />
        <span className="text-[10px] font-semibold tracking-[0.3em] uppercase">Polishing {Math.round(progress)}%</span>
      </div>
    </div>
  );
}

/**
 * Interactive 3D jewellery viewer.
 *
 *   <Jewellery3DViewer model="/models/diamond-ring.glb" product={product} />
 *
 * Loads the .glb when `model` is given, otherwise builds the piece
 * procedurally from `product.model3d`. Drag to rotate, scroll / pinch to
 * zoom, switch angle, lighting, backdrop and metal colour.
 */
export default function Jewellery3DViewer({ model, product, height = 520, className = '', compact = false, initialBackdrop = 'ivory', autoRotate: autoRotateInitial = true }) {
  const container = useRef(null);
  const [lighting, setLighting] = useState('studio');
  const [backdrop, setBackdrop] = useState(initialBackdrop);
  const [metal, setMetal] = useState(null);
  const [autoRotate, setAutoRotate] = useState(autoRotateInitial);
  const [view, setView] = useState({ key: 'angle', pos: VIEWS.angle.pos, t: 0 });
  const [bottom, setBottom] = useState(-0.6);
  const [fullscreen, setFullscreen] = useState(false);
  const dark = BACKDROPS[backdrop].ui === 'dark';
  const kind = product?.model3d?.kind;

  const goTo = (key) => setView({ key, pos: VIEWS[key].pos, t: Date.now() });
  const zoom = (factor) => setView((v) => ({ key: v.key, pos: null, zoom: factor, t: Date.now() }));
  const onReady = useCallback(({ bottom: b }) => setBottom(b), []);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === container.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else container.current?.requestFullscreen?.();
  };

  const chip = (active) =>
    `px-3 py-1.5 text-[10px] font-semibold tracking-[0.16em] uppercase transition ${
      active ? (dark ? 'bg-ivory text-ink' : 'bg-ink text-ivory') : dark ? 'text-ivory/70 hover:text-ivory' : 'text-stone hover:text-ink'
    }`;
  const iconBtn = `grid h-9 w-9 place-items-center rounded-full backdrop-blur transition ${dark ? 'bg-white/10 text-ivory hover:bg-white/20' : 'bg-white/80 text-ink hover:bg-white'}`;

  return (
    <div
      ref={container}
      className={`relative w-full overflow-hidden select-none ${className}`}
      style={{ height: fullscreen ? '100dvh' : height, background: BACKDROPS[backdrop].color }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: dark ? 'radial-gradient(ellipse at 50% 40%, rgba(255,240,215,.10), transparent 65%)' : 'radial-gradient(ellipse at 50% 38%, rgba(255,255,255,.85), transparent 70%)' }}
      />
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: VIEWS.angle.pos, fov: 32, near: 0.05, far: 100 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, preserveDrawingBuffer: false }}
        className="!absolute inset-0 touch-none"
      >
        <StudioEnvironment preset={lighting} />
        <Suspense fallback={null}>
          {product && <JewelleryModel url={model} spec={product.model3d} kind={kind} metal={metal} onReady={onReady} />}
        </Suspense>
        <ContactShadows position={[0, bottom - 0.01, 0]} opacity={dark ? 0.6 : 0.32} scale={5} blur={2.6} far={1.6} resolution={512} color={dark ? '#000000' : '#5a4630'} />
        <OrbitControls makeDefault enablePan={false} enableDamping dampingFactor={0.08} minDistance={1.6} maxDistance={7} autoRotate={autoRotate} autoRotateSpeed={1.4} />
        <CameraRig request={view.pos ? view : null} />
        <DevHandle />
        <ZoomHandler request={view.zoom ? view : null} />
      </Canvas>

      <Loader dark={dark} />

      {/* top bar */}
      <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
        <div className={`flex flex-wrap ${dark ? 'bg-white/10' : 'bg-white/75'} backdrop-blur`}>
          {Object.entries(VIEWS).map(([key, v]) => (
            <button key={key} type="button" onClick={() => goTo(key)} className={chip(view.key === key)}>
              {v.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          <button type="button" className={iconBtn} onClick={() => setAutoRotate((a) => !a)} aria-label={autoRotate ? 'Pause rotation' : 'Auto rotate'}>
            {autoRotate ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button type="button" className={iconBtn} onClick={() => goTo('angle')} aria-label="Reset camera">
            <RotateCcw className="h-4 w-4" />
          </button>
          {!compact && (
            <button type="button" className={`${iconBtn} hidden sm:grid`} onClick={toggleFullscreen} aria-label="Toggle fullscreen">
              {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {/* zoom */}
      <div className="absolute top-1/2 right-3 flex -translate-y-1/2 flex-col gap-1.5">
        <button type="button" className={iconBtn} onClick={() => zoom(0.8)} aria-label="Zoom in">
          <ZoomIn className="h-4 w-4" />
        </button>
        <button type="button" className={iconBtn} onClick={() => zoom(1.25)} aria-label="Zoom out">
          <ZoomOut className="h-4 w-4" />
        </button>
      </div>

      {/* bottom controls */}
      {!compact && (
        <div className="absolute inset-x-3 bottom-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className={`flex flex-wrap items-center gap-1 ${dark ? 'bg-white/10' : 'bg-white/75'} p-1 backdrop-blur`}>
            <span className={`px-2 text-[9px] font-bold tracking-[0.24em] uppercase ${dark ? 'text-gold-light' : 'text-gold-dark'}`}>Light</span>
            {Object.entries(LIGHTING_PRESETS)
              .filter(([, p]) => !p.hidden)
              .map(([key, p]) => (
                <button key={key} type="button" onClick={() => setLighting(key)} className={chip(lighting === key)}>
                  {p.label}
                </button>
              ))}
          </div>
          <div className={`flex items-center gap-2 ${dark ? 'bg-white/10' : 'bg-white/75'} px-2 py-1.5 backdrop-blur`}>
            <span className={`text-[9px] font-bold tracking-[0.24em] uppercase ${dark ? 'text-gold-light' : 'text-gold-dark'}`}>Metal</span>
            {METAL_OPTIONS.map((m) => (
              <button
                key={m.label}
                type="button"
                title={m.label}
                aria-label={`Metal: ${m.label}`}
                onClick={() => setMetal(m.key)}
                className={`h-6 w-6 rounded-full border-2 transition ${metal === m.key ? 'scale-110 border-gold' : 'border-transparent'}`}
                style={{ background: m.swatch }}
              />
            ))}
            <span className={`mx-1 h-4 w-px ${dark ? 'bg-white/20' : 'bg-line'}`} />
            {Object.entries(BACKDROPS).map(([key, b]) => (
              <button
                key={key}
                type="button"
                title={`${b.label} backdrop`}
                aria-label={`${b.label} backdrop`}
                onClick={() => setBackdrop(key)}
                className={`h-6 w-6 border-2 transition ${backdrop === key ? 'scale-110 border-gold' : 'border-mist/40'}`}
                style={{ background: b.color }}
              />
            ))}
          </div>
        </div>
      )}

      <p className={`pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 text-center text-[9.5px] font-semibold tracking-[0.24em] whitespace-nowrap uppercase ${dark ? 'text-ivory/50' : 'text-stone/80'}`}>
        Drag to rotate · Pinch to zoom
      </p>
    </div>
  );
}

/** Exposes the scene for debugging in development builds only. */
function DevHandle() {
  const state = useThree();
  useEffect(() => {
    if (import.meta.env.DEV) window.__viewer = state;
  }, [state]);
  return null;
}

function ZoomHandler({ request }) {
  const { camera, controls } = useThree();
  const goal = useRef(null);
  useEffect(() => {
    if (!request) return;
    const target = controls?.target ?? new THREE.Vector3();
    const offset = camera.position.clone().sub(target);
    const dist = THREE.MathUtils.clamp(offset.length() * request.zoom, 1.6, 7);
    goal.current = target.clone().add(offset.setLength(dist));
  }, [request, camera, controls]);
  useFrame(() => {
    if (!goal.current) return;
    camera.position.lerp(goal.current, 0.15);
    controls?.update();
    if (camera.position.distanceTo(goal.current) < 0.005) goal.current = null;
  });
  return null;
}
