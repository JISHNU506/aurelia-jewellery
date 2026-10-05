import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, LayoutGrid, List, Search, SearchX, SlidersHorizontal, X } from 'lucide-react';
import ProductGrid from '../components/ProductGrid.jsx';
import { Breadcrumbs, EmptyState, PageHero } from '../components/ui/Primitives.jsx';
import { Drawer } from '../components/ui/Overlay.jsx';
import { Icon360 } from '../components/ui/Icons.jsx';
import { byNewest, CATEGORIES, COLLECTIONS, getCategory, getCollection, PRODUCTS } from '../data/products.js';
import { CATEGORY_MEDIA, COLLECTION_MEDIA } from '../data/media.js';
import { searchProducts } from '../utils/search.js';

/* ----------------------------- Filter config ----------------------------- */

const PRICE_RANGES = [
  { id: 'under-50k', label: 'Under ₹50,000', test: (p) => p.price < 50000 },
  { id: '50k-1l', label: '₹50,000 – ₹1 Lakh', test: (p) => p.price >= 50000 && p.price < 100000 },
  { id: '1l-3l', label: '₹1 Lakh – ₹3 Lakh', test: (p) => p.price >= 100000 && p.price < 300000 },
  { id: 'above-3l', label: 'Above ₹3 Lakh', test: (p) => p.price >= 300000 },
];

const PURITIES = ['18K', '22K', '24K'];
const METALS = ['Yellow Gold', 'White Gold', 'Rose Gold'];
const GEMSTONES = [
  { id: 'diamond', label: 'Diamond', test: (p) => p.diamondWeight > 0 },
  ...['Emerald', 'Ruby', 'Sapphire', 'Pearl'].map((g) => ({
    id: g.toLowerCase(),
    label: g,
    test: (p) => !!p.gemstone?.type?.toLowerCase().includes(g.toLowerCase()),
  })),
];

const SORTS = [
  { id: 'featured', label: 'Featured' },
  { id: 'newest', label: 'Newest' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'rating', label: 'Top Rated' },
];

const featuredScore = (p) => (p.isFeatured ? 4 : 0) + (p.isBestSeller ? 2 : 0) + (p.isNew ? 1 : 0);

const SORTERS = {
  newest: byNewest,
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
  featured: (a, b) => featuredScore(b) - featuredScore(a),
};

/* Each filter group: key = URL param, test(product, value) */
const GROUPS = [
  { key: 'category', title: 'Category', options: CATEGORIES.map((c) => ({ id: c.id, label: c.name })), test: (p, v) => p.category === v },
  { key: 'collection', title: 'Collection', options: COLLECTIONS.map((c) => ({ id: c.id, label: c.name })), test: (p, v) => p.collection === v },
  { key: 'price', title: 'Price', options: PRICE_RANGES, test: (p, v) => PRICE_RANGES.find((r) => r.id === v)?.test(p) ?? true },
  { key: 'purity', title: 'Gold purity', options: PURITIES.map((x) => ({ id: x, label: x })), test: (p, v) => p.purity === v },
  { key: 'metal', title: 'Metal', options: METALS.map((x) => ({ id: x, label: x })), test: (p, v) => p.metal === v },
  { key: 'gem', title: 'Gemstone', options: GEMSTONES, test: (p, v) => GEMSTONES.find((g) => g.id === v)?.test(p) ?? true },
];

const readList = (params, key) =>
  (params.get(key) ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

/** Products that pass every active group except `skipKey` (used for facet counts). */
function applyFilters(products, selected, skipKey) {
  return products.filter((p) =>
    GROUPS.every((g) => {
      if (g.key === skipKey) return true;
      const values = selected[g.key];
      return !values?.length || values.some((v) => g.test(p, v));
    }),
  );
}

/* ------------------------------- UI pieces ------------------------------- */

function CheckOption({ checked, onChange, label, count }) {
  const disabled = count === 0 && !checked;
  return (
    <label className={`flex items-center gap-3 py-1.5 text-sm ${disabled ? 'cursor-default opacity-40' : 'cursor-pointer'}`}>
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={onChange} disabled={disabled} />
      <span
        className={`grid h-4 w-4 shrink-0 place-items-center border transition peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold ${
          checked ? 'border-ink bg-ink text-ivory' : 'border-mist bg-white'
        }`}
      >
        {checked && <Check className="h-3 w-3" strokeWidth={2.5} />}
      </span>
      <span className={`flex-1 ${checked ? 'text-ink' : 'text-ink-soft'}`}>{label}</span>
      <span className="text-xs text-mist tabular-nums">{count}</span>
    </label>
  );
}

function FilterPanel({ groups, selected, counts, onToggle, className = 'border-t border-line' }) {
  return (
    <div className={`divide-y divide-line ${className}`}>
      {groups.map((g) => (
        <div key={g.key} role="group" aria-label={g.title} className="py-6">
          <p aria-hidden="true" className="mb-3 text-[11px] font-semibold tracking-[0.2em] uppercase">
            {g.title}
          </p>
          <div className="space-y-0.5">
            {g.options.map((o) => (
              <CheckOption
                key={o.id}
                label={o.label}
                checked={selected[g.key].includes(o.id)}
                count={counts[g.key][o.id]}
                onChange={() => onToggle(g.key, o.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ViewToggle({ view, setView }) {
  const btn = (id, Icon, label) => (
    <button
      type="button"
      onClick={() => setView(id)}
      aria-label={label}
      aria-pressed={view === id}
      className={`grid h-11 w-11 place-items-center transition ${view === id ? 'bg-ink text-ivory' : 'text-stone hover:text-ink'}`}
    >
      <Icon className="h-4 w-4" strokeWidth={1.5} />
    </button>
  );
  return (
    <div className="flex border border-line bg-white/70">
      {btn('grid', LayoutGrid, 'Grid view')}
      {btn('list', List, 'List view')}
    </div>
  );
}

/* --------------------------------- Page --------------------------------- */

export default function Shop({ fixedCategory, title, eyebrow, subtitle, heroImage }) {
  const [params, setParams] = useSearchParams();
  const [view, setView] = useState('grid');
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* --- search: local state for instant typing, mirrored into ?q= --- */
  const urlQuery = params.get('q') ?? '';
  const [query, setQuery] = useState(urlQuery);
  const lastPushed = useRef(urlQuery);

  useEffect(() => {
    // URL changed externally (e.g. global search overlay) → adopt it
    if (urlQuery !== lastPushed.current) {
      lastPushed.current = urlQuery;
      setQuery(urlQuery);
    }
  }, [urlQuery]);

  useEffect(() => {
    const value = query.trim();
    if (value === lastPushed.current) return undefined;
    const t = setTimeout(() => {
      lastPushed.current = value;
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value) next.set('q', value);
          else next.delete('q');
          return next;
        },
        { replace: true, preventScrollReset: true },
      );
    }, 250);
    return () => clearTimeout(t);
  }, [query, setParams]);

  /* --- filters (URL is the source of truth) --- */
  const groups = useMemo(() => (fixedCategory ? GROUPS.filter((g) => g.key !== 'category') : GROUPS), [fixedCategory]);

  const selected = useMemo(() => {
    const s = {};
    for (const g of GROUPS) {
      const valid = new Set(g.options.map((o) => o.id));
      s[g.key] = g.key === 'category' && fixedCategory ? [] : readList(params, g.key).filter((v) => valid.has(v));
    }
    return s;
  }, [params, fixedCategory]);

  const sort = SORTS.some((s) => s.id === params.get('sort')) ? params.get('sort') : 'featured';
  const feature = params.get('feature');

  const updateParam = (key, value) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value && value.length) next.set(key, Array.isArray(value) ? value.join(',') : value);
        else next.delete(key);
        return next;
      },
      { replace: true, preventScrollReset: true },
    );
  };

  const toggle = (key, id) => {
    const list = selected[key];
    updateParam(key, list.includes(id) ? list.filter((v) => v !== id) : [...list, id]);
  };

  const clearAll = () => {
    setQuery('');
    lastPushed.current = '';
    setParams(
      (prev) => {
        const next = new URLSearchParams();
        if (prev.get('sort')) next.set('sort', prev.get('sort'));
        return next;
      },
      { replace: true, preventScrollReset: true },
    );
  };

  /* --- derive results --- */
  const q = query.trim();
  const base = useMemo(() => {
    let list = q ? searchProducts(q) : PRODUCTS;
    if (fixedCategory) list = list.filter((p) => p.category === fixedCategory);
    return list;
  }, [q, fixedCategory]);

  const results = useMemo(() => {
    const list = applyFilters(base, selected);
    // keep search relevance order when searching with the default sort
    if (q && sort === 'featured') return list;
    return [...list].sort(SORTERS[sort]);
  }, [base, selected, sort, q]);

  const counts = useMemo(() => {
    const c = {};
    for (const g of groups) {
      const pool = applyFilters(base, selected, g.key);
      c[g.key] = Object.fromEntries(g.options.map((o) => [o.id, pool.filter((p) => g.test(p, o.id)).length]));
    }
    return c;
  }, [base, selected, groups]);

  const chips = [
    ...(q ? [{ key: 'q', id: 'q', label: `“${q}”` }] : []),
    ...groups.flatMap((g) => selected[g.key].map((id) => ({ key: g.key, id, label: g.options.find((o) => o.id === id)?.label ?? id }))),
  ];
  const activeCount = chips.length;

  const removeChip = (chip) => {
    if (chip.key === 'q') setQuery('');
    else toggle(chip.key, chip.id);
  };

  /* --- header copy --- */
  const singleCollection = !fixedCategory && selected.collection.length === 1 ? getCollection(selected.collection[0]) : null;
  const singleCategory = !fixedCategory && selected.category.length === 1 ? getCategory(selected.category[0]) : null;
  const heading = {
    eyebrow: eyebrow ?? (singleCollection ? 'Collection' : singleCategory ? 'Category' : 'The Collection'),
    title: title ?? singleCollection?.name ?? singleCategory?.name ?? 'All jewellery',
    subtitle:
      subtitle ??
      singleCollection?.description ??
      singleCategory?.tagline ??
      'Hallmarked gold, certified diamonds and rare gemstones — every piece viewable in 3D and ready to try on live.',
    image: heroImage ?? (singleCollection ? COLLECTION_MEDIA[singleCollection.id] : singleCategory ? CATEGORY_MEDIA[singleCategory.id]?.hero : undefined),
  };

  const crumbs = [{ label: 'Home', to: '/' }];
  if (fixedCategory) crumbs.push({ label: 'Categories', to: '/categories' }, { label: title ?? getCategory(fixedCategory)?.name ?? 'Category' });
  else {
    const sub = singleCollection?.name ?? singleCategory?.name;
    crumbs.push({ label: 'Shop', to: sub ? '/shop' : undefined }, ...(sub ? [{ label: sub }] : []));
  }

  const panelProps = { groups, selected, counts, onToggle: toggle };

  return (
    <>
      <PageHero eyebrow={heading.eyebrow} title={heading.title} subtitle={heading.subtitle} image={heading.image} />

      <div className="container-luxe pt-8 pb-24">
        <Breadcrumbs items={crumbs} />

        {/* Toolbar */}
        <div className="mt-6 flex flex-col gap-3 border-b border-line pb-6 md:flex-row md:items-center">
          <div className="relative flex-1 md:max-w-md">
            <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-mist" strokeWidth={1.6} />
            <label htmlFor="shop-search" className="sr-only">
              Search jewellery
            </label>
            <input
              id="shop-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={fixedCategory ? `Search ${title ?? 'this category'}…` : 'Search rings, 22K gold, emerald…'}
              className="input-luxe h-11 py-0 pr-10 pl-11 [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-mist hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 md:ml-auto">
            <button type="button" onClick={() => setDrawerOpen(true)} className="flex h-11 items-center gap-2 border border-line bg-white/70 px-4 text-[11px] font-semibold tracking-[0.18em] uppercase lg:hidden">
              <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} /> Filters
              {activeCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[10px] text-white">{activeCount}</span>}
            </button>
            <label htmlFor="shop-sort" className="sr-only">
              Sort by
            </label>
            <select
              id="shop-sort"
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value === 'featured' ? '' : e.target.value)}
              className="input-luxe h-11 min-w-0 flex-1 cursor-pointer py-0 text-[13px] md:w-52 md:flex-none"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id === 'featured' && q ? 'Most relevant' : s.label}
                </option>
              ))}
            </select>
            <ViewToggle view={view} setView={setView} />
          </div>
        </div>

        <div className="mt-8 grid gap-12 lg:grid-cols-[250px_1fr]">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block" aria-label="Filters">
            <div className="sticky top-28 max-h-[calc(100vh_-_8rem)] overflow-y-auto pr-2 no-scrollbar">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[11px] font-semibold tracking-[0.2em] uppercase">Refine</p>
                {activeCount > 0 && (
                  <button type="button" onClick={clearAll} className="link-underline text-[11px] tracking-[0.14em] text-stone uppercase hover:text-ink">
                    Clear all
                  </button>
                )}
              </div>
              <FilterPanel {...panelProps} />
            </div>
          </aside>

          {/* Results */}
          <div className="min-w-0">
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <p className="mr-2 text-sm text-stone">
                <span className="font-semibold text-ink">{results.length}</span> {results.length === 1 ? 'piece' : 'pieces'}
              </p>
              <AnimatePresence initial={false}>
                {chips.map((chip) => (
                  <motion.button
                    key={`${chip.key}:${chip.id}`}
                    type="button"
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={() => removeChip(chip)}
                    className="flex items-center gap-1.5 border border-line bg-white/70 px-3 py-1.5 text-xs text-ink-soft transition hover:border-ink"
                    aria-label={`Remove filter ${chip.label}`}
                  >
                    {chip.label} <X className="h-3 w-3" />
                  </motion.button>
                ))}
              </AnimatePresence>
              {activeCount > 1 && (
                <button type="button" onClick={clearAll} className="link-underline ml-1 text-[11px] font-semibold tracking-[0.16em] uppercase">
                  Clear all
                </button>
              )}
            </div>

            {feature === '3d' && (
              <p className="mb-8 flex items-center gap-3 border border-line bg-cream/60 px-4 py-3 text-sm text-stone">
                <Icon360 className="h-5 w-5 shrink-0 text-gold-dark" />
                Every piece can be explored in 3D — tap “3D View” on any piece to rotate and zoom.
              </p>
            )}

            {results.length ? (
              <ProductGrid products={results} layout={view} columns="lg:grid-cols-3" />
            ) : (
              <EmptyState
                icon={SearchX}
                title="Nothing quite matches"
                text={q ? `We couldn’t find pieces for “${q}” with these filters. Try a broader search or clear a filter.` : 'No pieces match these filters. Try removing one or two.'}
                action={
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button type="button" onClick={clearAll} className="btn-primary">
                      Clear filters
                    </button>
                    <Link to="/categories" className="btn-outline">
                      Browse categories
                    </Link>
                  </div>
                }
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile filters */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} side="left" label="Filters">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <p className="font-display text-2xl font-light">Filters</p>
          <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Close filters" className="grid h-10 w-10 place-items-center text-ink">
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5">
          <FilterPanel {...panelProps} className="" />
        </div>
        <div className="flex gap-3 border-t border-line p-4">
          <button type="button" onClick={clearAll} disabled={!activeCount} className="btn-outline flex-1 px-4">
            Clear
          </button>
          <button type="button" onClick={() => setDrawerOpen(false)} className="btn-primary flex-[2] px-4">
            Show {results.length} {results.length === 1 ? 'piece' : 'pieces'}
          </button>
        </div>
      </Drawer>
    </>
  );
}
