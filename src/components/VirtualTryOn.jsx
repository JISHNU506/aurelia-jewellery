import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { AnimatePresence, motion } from 'framer-motion';
import * as THREE from 'three';
import {
  Camera, CameraOff, ChevronDown, Download, Hand, Loader2, RotateCcw, ScanFace, Share2, ShoppingBag, SlidersHorizontal, SwitchCamera, X,
} from 'lucide-react';
import { useUI } from '../context/UIContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { CATEGORIES, getProduct, PRODUCTS } from '../data/products.js';
import { formatINR } from '../utils/format.js';
import { getDetector, TRACKER_FOR } from '../utils/tryon/tracking.js';
import { GUIDE_TEXT, makeProjector, placeFromLandmarks } from '../utils/tryon/placement.js';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll.js';
import { StudioEnvironment } from './three/JewelleryModel.jsx';
import TryOnScene from './tryon/TryOnScene.jsx';
import { EASE } from './ui/Primitives.jsx';

const DEFAULT_ADJUST = { scale: 1, rotation: 0, x: 0, y: 0 };

function Slider({ label, value, min, max, step = 1, onChange, format }) {
  return (
    <label className="grid grid-cols-[72px_1fr_44px] items-center gap-3 text-[10px] font-semibold tracking-[0.18em] text-ivory/70 uppercase">
      {label}
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} className="h-1 w-full cursor-pointer" />
      <span className="text-right tabular-nums text-ivory">{format ? format(value) : value}</span>
    </label>
  );
}

function useStageSize(ref) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([e]) => setSize({ width: e.contentRect.width, height: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

function TryOnExperience({ initialProductId, onClose }) {
  const cart = useCart();
  const [productId, setProductId] = useState(initialProductId);
  const product = getProduct(productId) ?? PRODUCTS[0];
  const type = product.tryOn;

  const videoRef = useRef(null);
  const stageRef = useRef(null);
  const glRef = useRef(null);
  const trackRef = useRef(null);
  const stage = useStageSize(stageRef);

  const [facing, setFacing] = useState('user');
  const [camera, setCamera] = useState('starting'); // starting | live | denied | unsupported | error | off
  const [tracking, setTracking] = useState('loading'); // loading | searching | tracking | unavailable
  const [manual, setManual] = useState(false);
  const [adjust, setAdjust] = useState(DEFAULT_ADJUST);
  const adjustRef = useRef(adjust);
  adjustRef.current = adjust;
  const [shot, setShot] = useState(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [filter, setFilter] = useState(product.category);
  const [attempt, setAttempt] = useState(0);
  const mirror = facing === 'user' && camera === 'live';
  const facingRef = useRef(facing);
  facingRef.current = facing;
  const cameraOff = camera === 'off';

  /* ---------------- camera ---------------- */
  useEffect(() => {
    if (cameraOff) return undefined;
    let stream;
    let cancelled = false;
    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCamera('unsupported');
        return;
      }
      setCamera('starting');
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 960 } },
          audio: false,
        });
        if (cancelled) return;
        const video = videoRef.current;
        video.srcObject = stream;
        await video.play().catch(() => {});
        setCamera('live');
      } catch (err) {
        if (cancelled) return;
        setCamera(err?.name === 'NotAllowedError' || err?.name === 'SecurityError' ? 'denied' : 'error');
      }
    }
    start();
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [facing, cameraOff, attempt]);

  /* ---------------- landmark tracking loop ---------------- */
  const trackerKind = TRACKER_FOR[type];
  useEffect(() => {
    if (camera !== 'live' || manual) return undefined;
    let raf;
    let stopped = false;
    let detector;
    let lastVideoTime = -1;
    let lastSeen = 0;
    let state = 'loading';
    const set = (s) => {
      if (s !== state) {
        state = s;
        setTracking(s);
      }
    };
    set('loading');
    getDetector(trackerKind)
      .then((d) => {
        if (stopped) return;
        detector = d;
        set('searching');
        loop();
      })
      .catch(() => !stopped && set('unavailable'));

    function loop() {
      if (stopped) return;
      const video = videoRef.current;
      const el = stageRef.current;
      if (video && el && video.readyState >= 2 && video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        const now = performance.now();
        try {
          const lm = detector.detect(video, now);
          if (lm) {
            const project = makeProjector({ videoW: video.videoWidth, videoH: video.videoHeight, stageW: el.clientWidth, stageH: el.clientHeight, mirror: facingRef.current === 'user' });
            trackRef.current = { placement: placeFromLandmarks(type, lm, project), at: now };
            lastSeen = now;
            set('tracking');
          } else if (now - lastSeen > 700) {
            set('searching');
          }
        } catch {
          /* skip a bad frame */
        }
      }
      raf = requestAnimationFrame(loop);
    }
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      trackRef.current = null;
    };
  }, [camera, manual, trackerKind, type]);

  useEffect(() => {
    if (tracking === 'unavailable') setManual(true);
  }, [tracking]);

  const noCamera = camera === 'off';
  const effectiveManual = manual || noCamera;

  /* ---------------- drag to reposition ---------------- */
  const drag = useRef(null);
  const onPointerDown = (e) => {
    if (e.target.closest('[data-ui]')) return;
    drag.current = { x: e.clientX, y: e.clientY, start: adjustRef.current };
  };
  const onPointerMove = (e) => {
    if (!drag.current) return;
    const { x, y, start } = drag.current;
    setAdjust({ ...start, x: start.x + (e.clientX - x), y: start.y + (e.clientY - y) });
  };
  const onPointerUp = () => (drag.current = null);

  /* ---------------- capture ---------------- */
  const capture = useCallback(() => {
    const el = stageRef.current;
    const gl = glRef.current;
    if (!el || !gl) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = el.clientWidth;
    const H = el.clientHeight;
    const canvas = document.createElement('canvas');
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    const video = videoRef.current;
    if (camera === 'live' && video?.videoWidth) {
      const s = Math.max(W / video.videoWidth, H / video.videoHeight);
      const dw = video.videoWidth * s;
      const dh = video.videoHeight * s;
      ctx.save();
      if (mirror) {
        ctx.translate(W, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, (W - dw) / 2, (H - dh) / 2, dw, dh);
      ctx.restore();
    } else {
      const g = ctx.createRadialGradient(W / 2, H * 0.4, 0, W / 2, H / 2, Math.max(W, H) * 0.7);
      g.addColorStop(0, '#3a332c');
      g.addColorStop(1, '#0e0d0c');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.drawImage(gl.domElement, 0, 0, W, H);
    ctx.fillStyle = 'rgba(14,13,12,.55)';
    ctx.fillRect(0, H - 44, W, 44);
    ctx.fillStyle = '#e9d5a4';
    ctx.font = '600 11px Manrope Variable, sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('AURELIA · VIRTUAL TRY-ON', 16, H - 18);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#faf7f2';
    ctx.font = 'italic 16px Cormorant Garamond, serif';
    ctx.fillText(product.name, W - 16, H - 17);
    setShot(canvas.toDataURL('image/jpeg', 0.92));
  }, [camera, mirror, product.name]);

  const share = async () => {
    try {
      const blob = await (await fetch(shot)).blob();
      const file = new File([blob], `aurelia-${product.id}.jpg`, { type: 'image/jpeg' });
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: product.name });
    } catch {
      /* user cancelled */
    }
  };

  const list = useMemo(() => PRODUCTS.filter((p) => !filter || p.category === filter), [filter]);
  const statusLabel = ['denied', 'unsupported', 'error'].includes(camera)
    ? { icon: CameraOff, text: 'Camera unavailable' }
    : camera === 'starting'
      ? { icon: Loader2, text: 'Starting camera…', spin: true }
      : effectiveManual
    ? { icon: SlidersHorizontal, text: noCamera ? 'Preview mode · drag to place' : 'Manual placement · drag to move' }
    : {
        loading: { icon: Loader2, text: 'Loading AI tracking…', spin: true },
        searching: { icon: trackerKind === 'face' ? ScanFace : Hand, text: trackerKind === 'face' ? 'Looking for your face…' : 'Looking for your hand…' },
        tracking: { icon: trackerKind === 'face' ? ScanFace : Hand, text: trackerKind === 'face' ? 'Face tracked' : 'Hand tracked', ok: true },
        unavailable: { icon: SlidersHorizontal, text: 'Tracking unavailable · manual mode' },
      }[tracking];
  const StatusIcon = statusLabel.icon;

  const cameraProblem = ['denied', 'unsupported', 'error'].includes(camera);

  return (
    <motion.div
      className="fixed inset-0 z-[85] bg-noir text-ivory"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      role="dialog"
      aria-modal="true"
      aria-label="Virtual try-on"
    >
      <div className="flex h-[100dvh] flex-col lg:flex-row">
        {/* ---------------- stage ---------------- */}
        <div
          ref={stageRef}
          className="relative min-h-0 flex-1 touch-none overflow-hidden bg-[radial-gradient(ellipse_at_50%_40%,#3a332c,#0e0d0c_70%)]"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          <video
            ref={videoRef}
            playsInline
            muted
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${camera === 'live' ? 'opacity-100' : 'opacity-0'}`}
            style={{ transform: mirror ? 'scaleX(-1)' : 'none' }}
          />

          {stage.width > 0 && (camera === 'live' || noCamera) && (
            <Canvas
              orthographic
              camera={{ zoom: 1, position: [0, 0, 600], near: 1, far: 2000 }}
              gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping }}
              onCreated={(state) => (glRef.current = state.gl)}
              className="!absolute inset-0"
              style={{ pointerEvents: 'none' }}
            >
              <StudioEnvironment preset="studio" />
              <Suspense fallback={null}>
                <TryOnScene key={product.id} product={product} type={type} trackRef={trackRef} adjustRef={adjustRef} manual={effectiveManual} />
              </Suspense>
            </Canvas>
          )}

          {/* guide while searching */}
          <AnimatePresence>
            {camera === 'live' && !effectiveManual && tracking !== 'tracking' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="flex flex-col items-center gap-5 px-6 text-center">
                  {trackerKind === 'face' ? (
                    <div className="h-64 w-48 rounded-[50%] border border-dashed border-gold-light/70 sm:h-80 sm:w-60" />
                  ) : (
                    <Hand className="h-40 w-40 text-gold-light/60" strokeWidth={0.6} />
                  )}
                  <p className="max-w-xs bg-noir/50 px-4 py-2 text-xs tracking-wide text-ivory/90 backdrop-blur">{GUIDE_TEXT[type]}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* camera problems */}
          {(camera === 'starting' || cameraProblem) && (
            <div className="absolute inset-0 grid place-items-center p-6" data-ui>
              <div className="max-w-sm text-center">
                {camera === 'starting' ? (
                  <>
                    <Loader2 className="mx-auto h-10 w-10 animate-spin text-gold-light" strokeWidth={1.2} />
                    <p className="mt-5 font-display text-3xl font-light">Opening your camera</p>
                    <p className="mt-2 text-sm text-ivory/60">Please allow camera access when prompted. Video never leaves your device.</p>
                  </>
                ) : (
                  <>
                    <CameraOff className="mx-auto h-10 w-10 text-gold-light" strokeWidth={1.2} />
                    <p className="mt-5 font-display text-3xl font-light">
                      {camera === 'denied' ? 'Camera access was blocked' : camera === 'unsupported' ? 'Camera not available here' : 'We couldn’t start the camera'}
                    </p>
                    <p className="mt-2 text-sm text-ivory/60">
                      {camera === 'unsupported'
                        ? 'Live try-on needs a secure (https) connection and a device with a camera.'
                        : 'Allow camera access in your browser settings, then try again — or preview the piece without a camera.'}
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                      {camera !== 'unsupported' && (
                        <button type="button" className="btn-ghost-light px-5 py-3" onClick={() => setAttempt((a) => a + 1)}>
                          <Camera className="h-4 w-4" /> Try again
                        </button>
                      )}
                      <button type="button" className="btn-gold px-5 py-3" onClick={() => setCamera('off')}>
                        Preview without camera
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* top bar */}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 bg-gradient-to-b from-noir/70 to-transparent p-3 sm:p-4" data-ui>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold tracking-[0.32em] text-gold-light uppercase">Live Try-On</span>
              <span className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5 text-[11px] backdrop-blur ${statusLabel.ok ? 'bg-emerald/80' : 'bg-white/10'}`}>
                <StatusIcon className={`h-3.5 w-3.5 ${statusLabel.spin ? 'animate-spin' : ''}`} /> {statusLabel.text}
              </span>
            </div>
            <div className="flex gap-2">
              {!noCamera && (
                <button type="button" onClick={() => setFacing((f) => (f === 'user' ? 'environment' : 'user'))} aria-label={facing === 'user' ? 'Switch to back camera' : 'Switch to front camera'} className="grid h-11 w-11 place-items-center rounded-full bg-white/10 backdrop-blur transition hover:bg-white/20">
                  <SwitchCamera className="h-5 w-5" strokeWidth={1.5} />
                </button>
              )}
              <button type="button" onClick={onClose} aria-label="Close try-on" className="grid h-11 w-11 place-items-center rounded-full bg-white/10 backdrop-blur transition hover:bg-white/20">
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* capture button */}
          {(camera === 'live' || noCamera) && (
            <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-6" data-ui>
              <button type="button" onClick={() => setAdjust(DEFAULT_ADJUST)} aria-label="Reset adjustments" className="grid h-11 w-11 place-items-center rounded-full bg-white/10 backdrop-blur hover:bg-white/20">
                <RotateCcw className="h-5 w-5" strokeWidth={1.5} />
              </button>
              <button type="button" onClick={capture} aria-label="Capture photo" className="grid h-[68px] w-[68px] place-items-center rounded-full border-2 border-ivory/90 p-1 transition active:scale-95">
                <span className="h-full w-full rounded-full bg-ivory" />
              </button>
              <button type="button" onClick={() => setPanelOpen((o) => !o)} aria-label="Toggle controls" className="grid h-11 w-11 place-items-center rounded-full bg-white/10 backdrop-blur hover:bg-white/20 lg:hidden">
                <SlidersHorizontal className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>
          )}
        </div>

        {/* ---------------- controls panel ---------------- */}
        <AnimatePresence initial={false}>
          {panelOpen && (
            <motion.aside
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="shrink-0 overflow-hidden border-t border-white/10 bg-noir lg:!h-auto lg:w-[380px] lg:border-t-0 lg:border-l lg:!opacity-100"
            >
              <div className="flex max-h-[44dvh] flex-col gap-5 overflow-y-auto p-4 sm:p-5 lg:h-full lg:max-h-none lg:p-7">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] tracking-[0.24em] text-gold-light uppercase">{product.purity} {product.metal}</p>
                    <p className="truncate font-display text-2xl leading-tight lg:text-3xl">{product.name}</p>
                    <p className="text-sm text-ivory/70">{formatINR(product.price)}</p>
                  </div>
                  <button type="button" onClick={() => cart.add(product)} className="btn-gold shrink-0 px-4 py-3 text-[10px]">
                    <ShoppingBag className="h-4 w-4" /> Add
                  </button>
                </div>

                <div className="space-y-3.5">
                  <Slider label="Size" min={50} max={200} value={Math.round(adjust.scale * 100)} onChange={(v) => setAdjust((a) => ({ ...a, scale: v / 100 }))} format={(v) => `${v}%`} />
                  <Slider label="Rotation" min={-45} max={45} value={adjust.rotation} onChange={(v) => setAdjust((a) => ({ ...a, rotation: v }))} format={(v) => `${v}°`} />
                  <Slider label="Position X" min={-160} max={160} value={Math.round(adjust.x)} onChange={(v) => setAdjust((a) => ({ ...a, x: v }))} />
                  <Slider label="Position Y" min={-160} max={160} value={Math.round(adjust.y)} onChange={(v) => setAdjust((a) => ({ ...a, y: v }))} />
                </div>

                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setAdjust(DEFAULT_ADJUST)} className="btn-ghost-light flex-1 px-3 py-2.5 text-[10px]">
                    <RotateCcw className="h-3.5 w-3.5" /> Reset
                  </button>
                  {!noCamera && tracking !== 'unavailable' && (
                    <button type="button" onClick={() => setManual((m) => !m)} className="btn-ghost-light flex-1 px-3 py-2.5 text-[10px]">
                      {manual ? <ScanFace className="h-3.5 w-3.5" /> : <SlidersHorizontal className="h-3.5 w-3.5" />} {manual ? 'Auto-track' : 'Manual'}
                    </button>
                  )}
                  <button type="button" onClick={capture} className="btn-ghost-light flex-1 px-3 py-2.5 text-[10px]">
                    <Camera className="h-3.5 w-3.5" /> Capture
                  </button>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[10px] font-semibold tracking-[0.24em] text-gold-light uppercase">Switch jewellery</p>
                    <label className="relative text-[11px] text-ivory/80">
                      <select value={filter} onChange={(e) => setFilter(e.target.value)} className="appearance-none bg-transparent pr-5 outline-none" aria-label="Filter by category">
                        <option value="" className="text-ink">All</option>
                        {CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id} className="text-ink">
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute top-0.5 right-0 h-3.5 w-3.5" />
                    </label>
                  </div>
                  <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:grid lg:grid-cols-3 lg:overflow-visible">
                    {list.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setProductId(p.id);
                          setAdjust(DEFAULT_ADJUST);
                        }}
                        className={`w-20 shrink-0 text-left transition lg:w-auto ${p.id === product.id ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                        aria-label={`Try ${p.name}`}
                        aria-pressed={p.id === product.id}
                      >
                        <img src={p.images[0]} alt="" className={`aspect-square w-full object-cover ${p.id === product.id ? 'ring-2 ring-gold-light' : ''}`} />
                        <span className="mt-1 line-clamp-1 block text-[10px] text-ivory/70">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-[11px] leading-relaxed text-ivory/45">
                  Tracking runs entirely on your device. Sizes are approximate — use the size slider to fine-tune. Drag the jewellery to move it.
                </p>
                <Link to={`/product/${product.slug}`} onClick={onClose} className="text-[11px] font-semibold tracking-[0.18em] text-ivory/80 uppercase underline-offset-4 hover:underline">
                  View product details →
                </Link>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* captured photo */}
      <AnimatePresence>
        {shot && (
          <motion.div className="absolute inset-0 z-10 grid place-items-center bg-noir/90 p-4 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.94, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE }} className="flex max-h-full w-full max-w-lg flex-col items-center gap-4">
              <img src={shot} alt="Your try-on capture" className="max-h-[70dvh] w-auto border border-white/10 object-contain shadow-lift" />
              <div className="flex flex-wrap justify-center gap-2">
                <a href={shot} download={`aurelia-${product.id}.jpg`} className="btn-gold px-5 py-3">
                  <Download className="h-4 w-4" /> Save photo
                </a>
                {typeof navigator !== 'undefined' && navigator.share && (
                  <button type="button" onClick={share} className="btn-ghost-light px-5 py-3">
                    <Share2 className="h-4 w-4" /> Share
                  </button>
                )}
                <button type="button" onClick={() => setShot(null)} className="btn-ghost-light px-5 py-3">
                  Retake
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** Full-screen virtual try-on (camera + 3D jewellery overlay), opened via useUI().openTryOn(id). */
export default function VirtualTryOn() {
  const { tryOn, closeTryOn } = useUI();
  useLockBodyScroll(!!tryOn);
  useEffect(() => {
    if (!tryOn) return undefined;
    const onKey = (e) => e.key === 'Escape' && closeTryOn();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tryOn, closeTryOn]);
  return createPortal(
    <AnimatePresence>{tryOn && <TryOnExperience key="tryon" initialProductId={tryOn.productId} onClose={closeTryOn} />}</AnimatePresence>,
    document.body,
  );
}
