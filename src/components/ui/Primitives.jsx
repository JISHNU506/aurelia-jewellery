import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronRight, Minus, Plus, Star } from 'lucide-react';
import { formatINR } from '../../utils/format.js';

export const EASE = [0.22, 0.61, 0.36, 1];

/** Fades content in as it scrolls into view. */
export function Reveal({ children, delay = 0, y = 24, className = '', as = 'div', once = true }) {
  const Comp = motion[as] ?? motion.div;
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-60px' }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </Comp>
  );
}

export function SectionHeading({ eyebrow, title, subtitle, align = 'center', action, light = false, className = '' }) {
  const centered = align === 'center';
  return (
    <div className={`flex flex-col gap-6 ${centered ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between'} ${className}`}>
      <Reveal className={centered ? 'max-w-2xl' : 'max-w-2xl'}>
        {eyebrow && <p className={`eyebrow mb-4 ${light ? 'text-gold-light' : ''}`}>{eyebrow}</p>}
        <h2 className={`text-4xl leading-[1.05] font-light sm:text-5xl lg:text-[3.6rem] ${light ? 'text-ivory' : 'text-ink'}`}>{title}</h2>
        {subtitle && <p className={`mt-5 text-[15px] leading-relaxed ${light ? 'text-ivory/65' : 'text-stone'}`}>{subtitle}</p>}
      </Reveal>
      {action && <Reveal delay={0.1}>{action}</Reveal>}
    </div>
  );
}

export function Stars({ value = 0, size = 13, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i + 1));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star className="absolute inset-0 text-champagne" style={{ width: size, height: size }} strokeWidth={1.4} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className="fill-gold text-gold" style={{ width: size, height: size }} strokeWidth={1.4} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

export function Price({ price, mrp, discountPct, size = 'md', className = '' }) {
  const big = size === 'lg';
  return (
    <div className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 ${className}`}>
      <span className={`${big ? 'text-3xl font-normal' : 'text-[15px] font-semibold'} tracking-tight text-ink`}>{formatINR(price)}</span>
      {mrp > price && (
        <>
          <span className={`${big ? 'text-base' : 'text-xs'} text-mist line-through`}>{formatINR(mrp)}</span>
          <span className={`${big ? 'text-xs' : 'text-[10px]'} font-semibold tracking-wider text-gold-dark uppercase`}>
            {discountPct >= 5 ? `${discountPct}% off` : `Save ${formatINR(mrp - price)}`}
          </span>
        </>
      )}
    </div>
  );
}

export function QuantityStepper({ value, onIncrease, onDecrease, min = 1, max = 10, small = false }) {
  const h = small ? 'h-9' : 'h-11';
  return (
    <div className={`inline-flex ${h} items-stretch border border-line bg-white`}>
      <button type="button" onClick={onDecrease} disabled={value <= min && min > 0} aria-label="Decrease quantity" className="grid w-9 place-items-center text-stone transition hover:text-ink disabled:opacity-30">
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="grid w-9 place-items-center text-sm font-semibold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button type="button" onClick={onIncrease} disabled={value >= max} aria-label="Increase quantity" className="grid w-9 place-items-center text-stone transition hover:text-ink disabled:opacity-30">
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function Breadcrumbs({ items, className = '' }) {
  return (
    <nav aria-label="Breadcrumb" className={`flex flex-wrap items-center gap-1.5 text-[11px] tracking-[0.14em] text-stone uppercase ${className}`}>
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="h-3 w-3 text-mist" />}
          {item.to ? (
            <Link to={item.to} className="link-underline transition hover:text-ink">
              {item.label}
            </Link>
          ) : (
            <span className="text-ink">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function Accordion({ items, defaultOpen = 0 }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.title}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between py-5 text-left text-[12px] font-semibold tracking-[0.18em] uppercase"
            >
              {item.title}
              <ChevronDown className={`h-4 w-4 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="overflow-hidden"
                >
                  <div className="pb-6 text-sm leading-relaxed text-stone">{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-20 text-center">
      {Icon && (
        <span className="mb-6 grid h-20 w-20 place-items-center rounded-full border border-line bg-white/70 text-gold-dark">
          <Icon className="h-8 w-8" strokeWidth={1.2} />
        </span>
      )}
      <h2 className="text-3xl font-light">{title}</h2>
      {text && <p className="mt-3 text-sm leading-relaxed text-stone">{text}</p>}
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}

export function Badge({ children, tone = 'light', className = '' }) {
  const tones = {
    light: 'bg-ivory/90 text-ink',
    dark: 'bg-ink text-ivory',
    gold: 'bg-gold-light text-ink',
  };
  return <span className={`inline-flex items-center px-2.5 py-1 text-[9.5px] font-bold tracking-[0.2em] uppercase ${tones[tone]} ${className}`}>{children}</span>;
}

/** Page header band used by listing and content pages. */
export function PageHero({ eyebrow, title, subtitle, image, dark = false, children }) {
  return (
    <section className={`relative overflow-hidden ${dark ? 'bg-noir text-ivory' : 'bg-cream'}`}>
      {image && <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover object-right" />}
      {image && <div className={`absolute inset-0 ${dark ? 'bg-gradient-to-r from-noir via-noir/80 to-transparent' : 'bg-gradient-to-r from-cream via-cream/85 to-transparent'}`} />}
      <div className="container-luxe relative py-16 sm:py-24 lg:py-28">
        <Reveal className="max-w-xl">
          {eyebrow && <p className={`eyebrow mb-4 ${dark ? 'text-gold-light' : ''}`}>{eyebrow}</p>}
          <h1 className="text-5xl leading-[1.02] font-light sm:text-6xl lg:text-7xl">{title}</h1>
          {subtitle && <p className={`mt-5 max-w-md text-[15px] leading-relaxed ${dark ? 'text-ivory/70' : 'text-stone'}`}>{subtitle}</p>}
          {children}
        </Reveal>
      </div>
    </section>
  );
}
