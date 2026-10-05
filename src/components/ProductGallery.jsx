import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Icon360, TryOnIcon } from './ui/Icons.jsx';
import { Badge } from './ui/Primitives.jsx';
import { useMediaQuery } from '../hooks/useMediaQuery.js';

/**
 * Product image gallery: main image with hover zoom (desktop), swipe / arrows
 * (mobile) and a thumbnail rail that also launches the 3D viewer and try-on.
 */
export default function ProductGallery({ product, onOpen3D, onTryOn }) {
  const images = product.images ?? [];
  const canZoom = useMediaQuery('(hover: hover) and (min-width: 768px)');
  const [index, setIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const zoom = canZoom && hovering;
  const [origin, setOrigin] = useState('50% 50%');
  const touchX = useRef(null);

  const go = (dir) => setIndex((i) => (i + dir + images.length) % images.length);

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  const onTouchStart = (e) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    touchX.current = null;
  };

  const thumbBase = 'relative aspect-square shrink-0 overflow-hidden border transition';

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse lg:gap-4">
      {/* Main image */}
      <div
        className="relative aspect-square w-full overflow-hidden bg-cream select-none md:cursor-zoom-in lg:w-auto lg:min-w-0 lg:flex-1"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onMouseMove={onMove}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.img
            key={index}
            src={images[index]}
            alt={`${product.name} — view ${index + 1}`}
            draggable={false}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out"
            style={{ transformOrigin: origin, transform: zoom ? 'scale(1.8)' : 'scale(1)' }}
          />
        </AnimatePresence>

        <div className="pointer-events-none absolute top-4 left-4 z-10 flex flex-col items-start gap-1.5">
          {product.isNew && <Badge tone="dark">New</Badge>}
          {product.isBestSeller && <Badge>Bestseller</Badge>}
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute top-1/2 left-3 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-ink backdrop-blur transition hover:bg-white lg:hidden"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute top-1/2 right-3 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-ink backdrop-blur transition hover:bg-white lg:hidden"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 lg:hidden">
              {images.map((_, i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-5 bg-ink' : 'w-1.5 bg-ink/30'}`} />
              ))}
            </div>
          </>
        )}

        {canZoom && !zoom && (
          <span className="pointer-events-none absolute right-4 bottom-4 z-10 text-[10px] font-semibold tracking-[0.2em] text-stone uppercase">
            Hover to zoom
          </span>
        )}
      </div>

      {/* Thumbnails */}
      <div className="no-scrollbar flex gap-2.5 overflow-x-auto lg:w-24 lg:flex-col lg:overflow-visible">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show image ${i + 1}`}
            aria-current={i === index}
            className={`${thumbBase} w-20 bg-cream lg:w-full ${i === index ? 'border-ink' : 'border-line hover:border-gold'}`}
          >
            <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
          </button>
        ))}
        <button
          type="button"
          onClick={onOpen3D}
          className={`${thumbBase} flex w-20 flex-col items-center justify-center gap-1.5 border-line bg-ivory text-ink hover:border-gold hover:text-gold-dark lg:w-full`}
        >
          <Icon360 className="h-6 w-6" />
          <span className="text-[9px] font-semibold tracking-[0.16em] uppercase">360° / 3D</span>
        </button>
        <button
          type="button"
          onClick={onTryOn}
          className={`${thumbBase} flex w-20 flex-col items-center justify-center gap-1.5 border-ink bg-ink text-ivory hover:bg-ink-soft lg:w-full`}
        >
          <TryOnIcon className="h-6 w-6" />
          <span className="text-[9px] font-semibold tracking-[0.16em] uppercase">Try On</span>
        </button>
      </div>
    </div>
  );
}
