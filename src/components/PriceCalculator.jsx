import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { calculatePrice, GOLD_RATES, GST_RATE, PURITY_INFO, RATES_UPDATED } from '../utils/price.js';
import { formatINR } from '../utils/format.js';

const DEFAULTS = { purity: '22K', goldWeight: 10, goldRate: GOLD_RATES['22K'], makingPct: 12, stoneCost: 0, otherCharges: 500, taxPct: GST_RATE };

function Field({ label, suffix, prefix, value, onChange, step = 1, min = 0, hint }) {
  return (
    <label className="block">
      <span className="label-luxe">{label}</span>
      <span className="relative flex items-center">
        {prefix && <span className="pointer-events-none absolute left-4 text-sm text-stone">{prefix}</span>}
        <input
          type="number"
          inputMode="decimal"
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value === '' ? '' : Math.max(min, +e.target.value))}
          className={`input-luxe tabular-nums ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-14' : ''}`}
        />
        {suffix && <span className="pointer-events-none absolute right-4 text-xs font-semibold tracking-wider text-stone uppercase">{suffix}</span>}
      </span>
      {hint && <span className="mt-1 block text-[11px] text-mist">{hint}</span>}
    </label>
  );
}

function AnimatedAmount({ value, className = '' }) {
  return (
    <motion.span key={Math.round(value)} initial={{ opacity: 0.4, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className={`tabular-nums ${className}`}>
      {formatINR(value)}
    </motion.span>
  );
}

/**
 * Jewellery price calculator — updates instantly as inputs change.
 * Gold value = rate × weight; making = gold value × making %;
 * subtotal = gold + making + stones + other; tax = subtotal × GST %.
 */
export default function PriceCalculator({ className = '' }) {
  const [v, setV] = useState(DEFAULTS);
  const set = (key) => (val) => setV((s) => ({ ...s, [key]: val }));
  const result = useMemo(() => calculatePrice(v), [v]);

  const choosePurity = (purity) => setV((s) => ({ ...s, purity, goldRate: GOLD_RATES[purity] }));

  const rows = [
    ['Gold value', result.goldValue, `${formatINR(+v.goldRate || 0)} × ${+v.goldWeight || 0} g`],
    ['Making charges', result.making, `${+v.makingPct || 0}% of gold value`],
    ['Diamond / stone', result.stone],
    ['Other charges', result.other, 'Hallmarking, certification'],
  ];

  return (
    <div className={`grid border border-line bg-white/70 lg:grid-cols-[1.1fr_1fr] ${className}`}>
      <div className="p-6 sm:p-8 lg:p-10">
        <p className="label-luxe">Gold purity</p>
        <div className="grid grid-cols-3 gap-2">
          {Object.keys(GOLD_RATES).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => choosePurity(p)}
              aria-pressed={v.purity === p}
              className={`border px-3 py-3 text-left transition ${v.purity === p ? 'border-ink bg-ink text-ivory' : 'border-line bg-white hover:border-ink'}`}
            >
              <span className="block font-display text-2xl leading-none">{p}</span>
              <span className={`mt-1 block text-[10px] tracking-wider ${v.purity === p ? 'text-gold-light' : 'text-stone'}`}>
                {PURITY_INFO[p].fineness} · {formatINR(GOLD_RATES[p])}/g
              </span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-stone">{PURITY_INFO[v.purity].note}</p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Gold weight" suffix="grams" value={v.goldWeight} onChange={set('goldWeight')} step={0.1} />
          <Field label="Gold rate" prefix="₹" suffix="/ gram" value={v.goldRate} onChange={set('goldRate')} step={10} hint={`Indicative ${v.purity} rate · ${RATES_UPDATED}`} />
        </div>
        <div className="mt-5">
          <div className="flex items-center justify-between">
            <span className="label-luxe">Making charges</span>
            <span className="text-sm font-semibold tabular-nums">{+v.makingPct || 0}%</span>
          </div>
          <input type="range" min={0} max={35} step={0.5} value={+v.makingPct || 0} onChange={(e) => set('makingPct')(+e.target.value)} className="w-full" aria-label="Making charge percentage" />
          <div className="flex justify-between text-[10px] tracking-wider text-mist uppercase">
            <span>0%</span>
            <span>Plain gold 8–14% · Studded 16–25%</span>
            <span>35%</span>
          </div>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <Field label="Diamond / stone" prefix="₹" value={v.stoneCost} onChange={set('stoneCost')} step={500} />
          <Field label="Other charges" prefix="₹" value={v.otherCharges} onChange={set('otherCharges')} step={100} />
          <Field label="GST / tax" suffix="%" value={v.taxPct} onChange={set('taxPct')} step={0.5} />
        </div>
        <button type="button" onClick={() => setV(DEFAULTS)} className="mt-6 inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-stone uppercase hover:text-ink">
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
      </div>

      <div className="flex flex-col bg-noir p-6 text-ivory sm:p-8 lg:p-10">
        <p className="text-[10.5px] font-semibold tracking-[0.3em] text-gold-light uppercase">Price breakdown</p>
        <dl className="mt-6 space-y-4 text-sm">
          {rows.map(([label, value, note]) => (
            <div key={label} className="flex items-baseline justify-between gap-4">
              <dt>
                {label}
                {note && <span className="block text-[11px] text-ivory/45">{note}</span>}
              </dt>
              <dd>
                <AnimatedAmount value={value} />
              </dd>
            </div>
          ))}
          <div className="gold-rule" />
          <div className="flex items-baseline justify-between">
            <dt className="font-semibold">Subtotal</dt>
            <dd>
              <AnimatedAmount value={result.subtotal} className="font-semibold" />
            </dd>
          </div>
          <div className="flex items-baseline justify-between">
            <dt>GST ({+v.taxPct || 0}%)</dt>
            <dd>
              <AnimatedAmount value={result.tax} />
            </dd>
          </div>
          <div className="gold-rule" />
        </dl>
        <div className="mt-6 flex items-end justify-between gap-4">
          <span className="text-[11px] font-semibold tracking-[0.3em] uppercase">Total</span>
          <AnimatedAmount value={result.total} className="font-display text-4xl font-light text-gold-light sm:text-5xl" />
        </div>
        {/* composition bar */}
        <div className="mt-8 flex h-2 w-full overflow-hidden bg-white/10" aria-hidden="true">
          {[
            [result.goldValue, '#d9bf88'],
            [result.making, '#b08d4f'],
            [result.stone, '#e7e3dc'],
            [result.other, '#6f675e'],
            [result.tax, '#3d3833'],
          ].map(([val, color], i) => (
            <motion.span key={i} animate={{ width: `${result.total ? (val / result.total) * 100 : 0}%` }} transition={{ duration: 0.5 }} style={{ background: color }} />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] tracking-wider text-ivory/55 uppercase">
          <span><i className="mr-1 inline-block h-2 w-2 bg-gold-light" />Gold</span>
          <span><i className="mr-1 inline-block h-2 w-2 bg-gold" />Making</span>
          <span><i className="mr-1 inline-block h-2 w-2 bg-[#e7e3dc]" />Stones</span>
          <span><i className="mr-1 inline-block h-2 w-2 bg-stone" />Other</span>
          <span><i className="mr-1 inline-block h-2 w-2 bg-[#3d3833]" />GST</span>
        </div>
        <p className="mt-auto pt-8 text-[11px] leading-relaxed text-ivory/40">Estimates use mock indicative rates for illustration. Final prices are confirmed at checkout.</p>
      </div>
    </div>
  );
}
