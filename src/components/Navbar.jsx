import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Calculator, Heart, Menu, Search, ShoppingBag, Sparkles, X } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { CATEGORIES } from '../data/products.js';
import { CATEGORY_MEDIA, COLLECTION_MEDIA } from '../data/media.js';
import { GOLD_RATES } from '../utils/price.js';
import { formatINR } from '../utils/format.js';
import { CATEGORY_ICONS, Logo, TryOnIcon } from './ui/Icons.jsx';
import { Drawer } from './ui/Overlay.jsx';
import { EASE } from './ui/Primitives.jsx';

const ANNOUNCEMENTS = [
  'Complimentary insured shipping across India',
  `Today’s gold · 22K ${formatINR(GOLD_RATES['22K'])}/g · 18K ${formatINR(GOLD_RATES['18K'])}/g`,
  'Try any piece on live with your camera — no app needed',
  'Lifetime exchange · BIS hallmarked · IGI certified diamonds',
];

const LINKS = [
  { to: '/new-arrivals', label: 'New Arrivals' },
  { to: '/best-sellers', label: 'Best Sellers' },
  { to: '/try-on', label: 'Virtual Try-On' },
  { to: '/price-calculator', label: 'Gold Calculator' },
  { to: '/about', label: 'Our Story' },
];

function AnnouncementBar() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % ANNOUNCEMENTS.length), 4200);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="relative h-9 overflow-hidden bg-noir text-ivory">
      <AnimatePresence mode="wait">
        <motion.p
          key={i}
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -14, opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="absolute inset-0 flex items-center justify-center px-4 text-center text-[10.5px] font-medium tracking-[0.22em] uppercase"
        >
          {ANNOUNCEMENTS[i]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

function CountBadge({ count, pulse }) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          key={pulse}
          initial={{ scale: 0.4 }}
          animate={{ scale: [1.35, 1] }}
          exit={{ scale: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="absolute -top-0.5 -right-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-gold px-1 text-[9.5px] font-bold text-white"
        >
          {count}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

function MegaMenu({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="absolute inset-x-0 top-full border-t border-line bg-ivory/98 shadow-soft backdrop-blur-xl"
    >
      <div className="container-luxe grid grid-cols-12 gap-10 py-10">
        <div className="col-span-3">
          <p className="eyebrow mb-5">Shop by category</p>
          <ul className="space-y-1">
            {CATEGORIES.map((c) => {
              const Icon = CATEGORY_ICONS[c.id];
              return (
                <li key={c.id}>
                  <Link to={`/category/${c.id}`} onClick={onClose} className="group flex items-center gap-4 py-2.5">
                    <Icon className="h-6 w-6 text-gold-dark" />
                    <span className="font-display text-2xl transition group-hover:translate-x-1 group-hover:text-gold-dark">{c.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link to="/shop" onClick={onClose} className="mt-6 inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase link-underline">
            View all jewellery <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="col-span-3 border-l border-line pl-10">
          <p className="eyebrow mb-5">Discover</p>
          <ul className="space-y-3.5 text-sm">
            {[
              ['/shop?collection=bridal', 'Lumière Bridal'],
              ['/shop?collection=heritage', 'Heritage 22K Gold'],
              ['/shop?collection=gemstone', 'Gemstone Atelier'],
              ['/shop?collection=everyday', 'Everyday Luxe'],
              ['/shop?purity=24K', '24K Pure Gold'],
              ['/new-arrivals', 'New Arrivals'],
              ['/best-sellers', 'Best Sellers'],
            ].map(([to, label]) => (
              <li key={to}>
                <Link to={to} onClick={onClose} className="link-underline text-stone hover:text-ink">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <Link to="/category/rings" onClick={onClose} className="group relative col-span-3 overflow-hidden bg-cream">
          <img src={CATEGORY_MEDIA.rings.tile} alt="" className="h-72 w-full object-cover transition duration-[1.2s] group-hover:scale-105" />
          <span className="absolute bottom-4 left-4 bg-ivory/90 px-3 py-2 text-[10.5px] font-semibold tracking-[0.2em] uppercase">Engagement Rings</span>
        </Link>
        <Link to="/shop?collection=heritage" onClick={onClose} className="group relative col-span-3 overflow-hidden bg-noir">
          <img src={COLLECTION_MEDIA.heritage} alt="" className="h-72 w-full object-cover transition duration-[1.2s] group-hover:scale-105" />
          <span className="absolute bottom-4 left-4 bg-ivory/90 px-3 py-2 text-[10.5px] font-semibold tracking-[0.2em] uppercase">The Heritage Edit</span>
        </Link>
      </div>
    </motion.div>
  );
}

export default function Navbar() {
  const cart = useCart();
  const wishlist = useWishlist();
  const { openSearch } = useUI();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMega(false);
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  const iconBtn = 'relative grid h-10 w-10 place-items-center rounded-full text-ink transition hover:bg-cream';

  return (
    <>
      <AnnouncementBar />
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'border-b border-line bg-ivory/90 shadow-[0_8px_30px_-20px_rgba(0,0,0,.25)] backdrop-blur-xl' : 'border-b border-transparent bg-ivory'}`}
        onMouseLeave={() => setMega(false)}
      >
        <div className={`container-luxe grid grid-cols-[1fr_auto_1fr] items-center transition-all duration-500 ${scrolled ? 'h-16' : 'h-20'}`}>
          <nav className="flex items-center gap-1" aria-label="Primary">
            <button type="button" className={`${iconBtn} lg:hidden`} aria-label="Open menu" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <button type="button" className={`${iconBtn} lg:hidden`} aria-label="Search" onClick={openSearch}>
              <Search className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <div className="hidden items-center gap-7 lg:flex">
              <button
                type="button"
                onMouseEnter={() => setMega(true)}
                onClick={() => setMega((m) => !m)}
                aria-expanded={mega}
                className={`text-[11px] font-semibold tracking-[0.2em] uppercase link-underline ${mega ? 'active' : ''}`}
              >
                Jewellery
              </button>
              {LINKS.slice(0, 3).map((l) => (
                <NavLink key={l.to} to={l.to} onMouseEnter={() => setMega(false)} className={({ isActive }) => `text-[11px] font-semibold tracking-[0.2em] uppercase link-underline ${isActive ? 'active' : ''}`}>
                  {l.label}
                </NavLink>
              ))}
            </div>
          </nav>

          <Link to="/" aria-label="Aurelia home" className="justify-self-center">
            <Logo className={`transition-transform duration-500 ${scrolled ? 'scale-90' : ''}`} />
          </Link>

          <div className="flex items-center justify-end gap-0.5 sm:gap-1.5">
            <div className="hidden items-center gap-7 pr-4 xl:flex">
              {LINKS.slice(3).map((l) => (
                <NavLink key={l.to} to={l.to} className={({ isActive }) => `text-[11px] font-semibold tracking-[0.2em] uppercase link-underline ${isActive ? 'active' : ''}`}>
                  {l.label}
                </NavLink>
              ))}
            </div>
            <button type="button" className={`${iconBtn} hidden lg:grid`} aria-label="Search" onClick={openSearch}>
              <Search className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <Link to="/wishlist" className={iconBtn} aria-label={`Wishlist, ${wishlist.count} items`}>
              <Heart className="h-5 w-5" strokeWidth={1.5} />
              <CountBadge count={wishlist.count} pulse={wishlist.count} />
            </Link>
            <button type="button" className={iconBtn} aria-label={`Shopping bag, ${cart.count} items`} onClick={cart.open}>
              <motion.span key={cart.bump} animate={cart.bump ? { rotate: [0, -12, 10, -6, 0] } : {}} transition={{ duration: 0.6 }}>
                <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              </motion.span>
              <CountBadge count={cart.count} pulse={cart.bump} />
            </button>
          </div>
        </div>
        <AnimatePresence>{mega && <MegaMenu onClose={() => setMega(false)} />}</AnimatePresence>
      </header>

      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} side="left" label="Menu" width="max-w-sm">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <Logo />
          <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu" className="grid h-10 w-10 place-items-center">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-6">
          <p className="eyebrow mb-3">Jewellery</p>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((c) => {
              const Icon = CATEGORY_ICONS[c.id];
              return (
                <Link key={c.id} to={`/category/${c.id}`} className="flex items-center gap-3 border border-line bg-white/60 px-3 py-3">
                  <Icon className="h-5 w-5 text-gold-dark" />
                  <span className="font-display text-lg">{c.name}</span>
                </Link>
              );
            })}
            <Link to="/shop" className="flex items-center justify-center gap-2 bg-ink px-3 py-3 text-[10.5px] font-semibold tracking-[0.18em] text-ivory uppercase">
              Shop all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="mt-8 divide-y divide-line border-y border-line">
            {[{ to: '/', label: 'Home' }, ...LINKS, { to: '/contact', label: 'Contact & Boutiques' }].map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} className="flex items-center justify-between py-4 font-display text-2xl">
                  {l.label}
                  {l.to === '/try-on' && <TryOnIcon className="h-5 w-5 text-gold-dark" />}
                  {l.to === '/price-calculator' && <Calculator className="h-5 w-5 text-gold-dark" strokeWidth={1.3} />}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex items-start gap-3 bg-cream p-4 text-sm text-stone">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
            Book a private video consultation with our gemologists — complimentary, any day of the week.
          </div>
        </div>
      </Drawer>
    </>
  );
}
