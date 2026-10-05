import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { PageHero, Reveal } from '../components/ui/Primitives.jsx';
import { CATEGORY_ICONS, TryOnIcon } from '../components/ui/Icons.jsx';
import { CATEGORIES, PRODUCTS } from '../data/products.js';
import { banner, CATEGORY_MEDIA } from '../data/media.js';
import { formatINR } from '../utils/format.js';

const STATS = Object.fromEntries(
  CATEGORIES.map((c) => {
    const items = PRODUCTS.filter((p) => p.category === c.id);
    return [c.id, { count: items.length, from: items.length ? Math.min(...items.map((p) => p.price)) : 0 }];
  }),
);

// 6-col grid on desktop: two wide tiles, then three; the last tile spans the row on tablets.
const LAYOUT = [
  { span: 'lg:col-span-3', aspect: 'aspect-[4/5] lg:aspect-[5/4]' },
  { span: 'lg:col-span-3', aspect: 'aspect-[4/5] lg:aspect-[5/4]' },
  { span: 'lg:col-span-2', aspect: 'aspect-[4/5]' },
  { span: 'lg:col-span-2', aspect: 'aspect-[4/5]' },
  { span: 'sm:col-span-2 lg:col-span-2', aspect: 'aspect-[4/5] sm:aspect-[16/9] lg:aspect-[4/5]' },
];

export default function Categories() {
  return (
    <>
      <PageHero
        eyebrow="Categories"
        title="Shop by category"
        subtitle="Five ways to wear Aurelia — each piece hallmarked, certified and ready to explore in 3D or try on live."
        image={banner('collection-heritage')}
      />

      <section className="container-luxe py-16 sm:py-24">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-6">
          {CATEGORIES.map((c, i) => {
            const Icon = CATEGORY_ICONS[c.id];
            const { count, from } = STATS[c.id];
            const layout = LAYOUT[i] ?? { span: 'lg:col-span-2', aspect: 'aspect-[4/5]' };
            return (
              <Reveal key={c.id} delay={(i % 3) * 0.08} className={layout.span}>
                <Link to={`/category/${c.id}`} className={`group relative block overflow-hidden bg-noir ${layout.aspect}`}>
                  <img
                    src={CATEGORY_MEDIA[c.id]?.tile}
                    alt={c.name}
                    loading={i < 2 ? 'eager' : 'lazy'}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.8s] ease-[var(--ease-luxe)] group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-noir/85 via-noir/15 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-ivory sm:p-8">
                    <div>
                      {Icon && (
                        <span className="mb-4 grid h-11 w-11 place-items-center rounded-full border border-ivory/30 text-gold-light">
                          <Icon className="h-5 w-5" />
                        </span>
                      )}
                      <h2 className="text-4xl font-light sm:text-5xl">{c.name}</h2>
                      <p className="mt-2 font-display text-lg text-ivory/75 italic">{c.tagline}</p>
                      <p className="mt-4 text-[10.5px] tracking-[0.22em] text-ivory/65 uppercase">
                        {count} {count === 1 ? 'piece' : 'pieces'}
                        {from > 0 && <> · From {formatINR(from)}</>}
                      </p>
                    </div>
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-ivory/40 transition-all duration-500 group-hover:border-gold-light group-hover:bg-gold-light group-hover:text-ink">
                      <ArrowUpRight className="h-5 w-5" strokeWidth={1.4} />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="border-t border-line bg-cream/60">
        <div className="container-luxe flex flex-col items-start justify-between gap-8 py-14 md:flex-row md:items-center">
          <div>
            <p className="eyebrow">Not sure where to begin?</p>
            <h2 className="mt-3 text-3xl font-light sm:text-4xl">Explore our most-loved pieces, or see them on you</h2>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link to="/best-sellers" className="btn-primary">
              Best sellers <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/try-on" className="btn-outline">
              <TryOnIcon className="h-4 w-4" /> Virtual try-on
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
