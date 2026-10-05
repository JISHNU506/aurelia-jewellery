import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Clock, Search, TrendingUp, X } from 'lucide-react';
import { useUI } from '../context/UIContext.jsx';
import { searchProducts, SEARCH_SUGGESTIONS } from '../utils/search.js';
import { TRENDING } from '../data/products.js';
import { formatINR } from '../utils/format.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll.js';
import { EASE } from './ui/Primitives.jsx';

export default function SearchOverlay() {
  const { searchOpen, closeSearch } = useUI();
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useLocalStorage('recent-searches', []);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  useLockBodyScroll(searchOpen);

  const results = useMemo(() => searchProducts(query, 8), [query]);

  useEffect(() => {
    if (!searchOpen) return undefined;
    setTimeout(() => inputRef.current?.focus(), 80);
    const onKey = (e) => e.key === 'Escape' && closeSearch();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchOpen, closeSearch]);

  const remember = (q) => q.trim() && setRecent((r) => [q.trim(), ...r.filter((x) => x !== q.trim())].slice(0, 5));
  const submit = (q = query) => {
    if (!q.trim()) return;
    remember(q);
    closeSearch();
    navigate(`/shop?q=${encodeURIComponent(q.trim())}`);
  };
  const close = () => {
    closeSearch();
    setQuery('');
  };

  return createPortal(
    <AnimatePresence>
      {searchOpen && (
        <motion.div className="fixed inset-0 z-[75]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-noir/50 backdrop-blur-sm" onClick={close} />
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="relative max-h-[100dvh] overflow-y-auto bg-ivory shadow-lift"
            role="dialog"
            aria-modal="true"
            aria-label="Search"
          >
            <div className="container-luxe py-6 sm:py-10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submit();
                }}
                className="flex items-center gap-4 border-b border-ink/70 pb-4"
              >
                <Search className="h-6 w-6 shrink-0 text-gold-dark" strokeWidth={1.3} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search diamond rings, 22K gold, pearls…"
                  className="min-w-0 flex-1 bg-transparent font-display text-2xl font-light outline-none placeholder:text-mist sm:text-4xl"
                  aria-label="Search jewellery"
                />
                <button type="button" onClick={close} aria-label="Close search" className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-cream">
                  <X className="h-5 w-5" />
                </button>
              </form>

              {!query.trim() ? (
                <div className="grid gap-10 py-8 md:grid-cols-3">
                  <div>
                    <p className="eyebrow mb-4 flex items-center gap-2">
                      <TrendingUp className="h-3.5 w-3.5" /> Popular searches
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {SEARCH_SUGGESTIONS.map((s) => (
                        <button key={s} type="button" onClick={() => setQuery(s)} className="border border-line bg-white/60 px-4 py-2 text-sm capitalize transition hover:border-ink">
                          {s}
                        </button>
                      ))}
                    </div>
                    {recent.length > 0 && (
                      <>
                        <p className="eyebrow mt-8 mb-3 flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5" /> Recent
                        </p>
                        <ul className="space-y-2 text-sm text-stone">
                          {recent.map((r) => (
                            <li key={r}>
                              <button type="button" onClick={() => setQuery(r)} className="link-underline hover:text-ink">
                                {r}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <p className="eyebrow mb-4">Trending now</p>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      {TRENDING.slice(0, 4).map((p) => (
                        <Link key={p.id} to={`/product/${p.slug}`} onClick={close} className="group">
                          <div className="aspect-square overflow-hidden bg-cream">
                            <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                          </div>
                          <p className="mt-2 font-display text-lg leading-tight">{p.name}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8">
                  <p className="mb-5 text-sm text-stone">
                    {results.length ? `${results.length === 8 ? '8+' : results.length} matches for “${query}”` : `No matches for “${query}”. Try “gold”, “diamond” or “earrings”.`}
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
                    {results.map((p, i) => (
                      <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                        <Link to={`/product/${p.slug}`} onClick={() => { remember(query); close(); }} className="group block">
                          <div className="aspect-square overflow-hidden bg-cream">
                            <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                          </div>
                          <p className="mt-2 text-[10px] tracking-[0.18em] text-stone uppercase">{p.purity} · {p.metal}</p>
                          <p className="font-display text-lg leading-tight">{p.name}</p>
                          <p className="text-sm font-semibold">{formatINR(p.price)}</p>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                  {results.length > 0 && (
                    <button type="button" onClick={() => submit()} className="btn-outline mt-8">
                      View all results <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
