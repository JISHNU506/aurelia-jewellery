import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Heart, ShoppingBag, X } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext.jsx';
import { Breadcrumbs, EASE, EmptyState, Price } from '../components/ui/Primitives.jsx';

export default function Wishlist() {
  const { items, count, remove, moveToCart, clear } = useWishlist();

  if (count === 0) {
    return (
      <div className="container-luxe">
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          text="Tap the heart on any piece to save it here — your shortlist, waiting whenever you are."
          action={
            <Link to="/shop" className="btn-primary">
              Discover jewellery <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-luxe pt-6 pb-20 sm:pt-8 lg:pb-28">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Wishlist' }]} />
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="eyebrow">Saved for later</p>
          <h1 className="mt-2 text-4xl font-light sm:text-5xl">Your wishlist</h1>
        </div>
        <div className="flex items-center gap-5 pb-1 text-[11px] font-semibold tracking-[0.16em] text-stone uppercase">
          <span>
            {count} {count === 1 ? 'piece' : 'pieces'}
          </span>
          <button type="button" onClick={clear} className="link-underline hover:text-ruby">
            Clear all
          </button>
        </div>
      </div>

      <motion.div layout className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {items.map((p, i) => (
            <motion.article
              key={p.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, delay: Math.min(i, 8) * 0.04, ease: EASE }}
              className="group flex flex-col"
            >
              <div className="relative">
                <Link to={`/product/${p.slug}`} className="block aspect-[4/5] overflow-hidden bg-cream">
                  <img src={p.images[0]} alt={p.name} loading="lazy" className="h-full w-full object-cover transition duration-[1.2s] group-hover:scale-105" />
                </Link>
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  aria-label={`Remove ${p.name} from wishlist`}
                  className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-white/85 backdrop-blur transition hover:bg-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-4 truncate text-[10px] font-semibold tracking-[0.2em] text-stone uppercase">
                {p.purity} · {p.metal}
              </p>
              <Link to={`/product/${p.slug}`} className="mt-1.5 font-display text-[1.3rem] leading-snug hover:text-gold-dark">
                {p.name}
              </Link>
              <Price className="mt-2" price={p.price} mrp={p.mrp} discountPct={p.discountPct} />
              <button type="button" onClick={() => moveToCart(p.id)} className="btn-outline mt-4 w-full px-3 py-3 text-[10.5px]">
                <ShoppingBag className="h-4 w-4" /> Move to bag
              </button>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
