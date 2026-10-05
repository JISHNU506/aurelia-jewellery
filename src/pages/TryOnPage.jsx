import { Camera, Hand, ScanFace, ShieldCheck, Smartphone } from 'lucide-react';
import { useUI } from '../context/UIContext.jsx';
import { CATEGORIES, PRODUCTS } from '../data/products.js';
import { banner } from '../data/media.js';
import { Reveal, SectionHeading } from '../components/ui/Primitives.jsx';
import { TryOnIcon } from '../components/ui/Icons.jsx';
import { formatINR } from '../utils/format.js';

const STEPS = [
  { icon: Camera, title: 'Allow your camera', text: 'Video is processed on your device and never uploaded.' },
  { icon: ScanFace, title: 'We find you', text: 'AI landmark tracking locates your ears, neck, fingers or wrist.' },
  { icon: TryOnIcon, title: 'Wear it live', text: 'A real-time 3D model follows your movement. Fine-tune size and position.' },
  { icon: Smartphone, title: 'Capture & share', text: 'Save a photo of your look or share it with someone you trust.' },
];

export default function TryOnPage() {
  const { openTryOn } = useUI();
  return (
    <>
      <section className="relative overflow-hidden bg-noir text-ivory">
        <img src={banner('tryon-promo')} alt="" className="absolute inset-y-0 right-0 h-full w-full object-cover opacity-60 sm:w-2/3 sm:opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-r from-noir via-noir/85 to-noir/10" />
        <div className="container-luxe relative py-20 sm:py-28 lg:py-36">
          <Reveal className="max-w-xl">
            <p className="eyebrow mb-4 text-gold-light">Virtual try-on</p>
            <h1 className="text-5xl leading-[1.02] font-light sm:text-6xl lg:text-7xl">See it on you, before it’s yours.</h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ivory/70">
              Earrings, necklaces, rings and bracelets — rendered in real-time 3D over your live camera. Best experienced on your phone.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <button type="button" onClick={() => openTryOn('traditional-earrings')} className="btn-gold">
                <TryOnIcon className="h-4 w-4" /> Start try-on
              </button>
              <button type="button" onClick={() => openTryOn('diamond-solitaire-ring')} className="btn-ghost-light">
                <Hand className="h-4 w-4" /> Try a ring
              </button>
            </div>
            <p className="mt-6 flex items-center gap-2 text-xs text-ivory/50">
              <ShieldCheck className="h-4 w-4" /> Private by design — no images are stored or sent.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-luxe py-16 sm:py-24">
        <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.08} className="bg-ivory p-7">
              <span className="font-display text-sm text-gold-dark">0{i + 1}</span>
              <Icon className="mt-4 h-7 w-7 text-gold-dark" strokeWidth={1.2} />
              <p className="mt-4 font-display text-2xl">{title}</p>
              <p className="mt-2 text-sm leading-relaxed text-stone">{text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {CATEGORIES.map((c) => {
        const items = PRODUCTS.filter((p) => p.category === c.id);
        return (
          <section key={c.id} className="container-luxe pb-16">
            <SectionHeading align="left" eyebrow={`Try on ${c.name.toLowerCase()}`} title={c.name} />
            <div className="no-scrollbar mt-8 flex gap-4 overflow-x-auto pb-2">
              {items.map((p) => (
                <button key={p.id} type="button" onClick={() => openTryOn(p.id)} className="group w-56 shrink-0 text-left sm:w-64">
                  <div className="relative aspect-square overflow-hidden bg-cream">
                    <img src={p.images[0]} alt={p.name} loading="lazy" className="h-full w-full object-cover transition duration-1000 group-hover:scale-105" />
                    <span className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-2 bg-ink/90 py-2.5 text-[10px] font-semibold tracking-[0.18em] text-ivory uppercase opacity-0 transition group-hover:opacity-100">
                      <TryOnIcon className="h-4 w-4" /> Try it on
                    </span>
                  </div>
                  <p className="mt-3 font-display text-xl leading-tight">{p.name}</p>
                  <p className="text-sm text-stone">{formatINR(p.price)}</p>
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
