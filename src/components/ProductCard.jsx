import { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { Badge, Price, Stars } from './ui/Primitives.jsx';
import { Icon360, TryOnIcon } from './ui/Icons.jsx';
import { getCollection } from '../data/products.js';

function WishlistButton({ product, className = '' }) {
  const { has, toggle } = useWishlist();
  const saved = has(product.id);
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.85 }}
      onClick={(e) => {
        e.preventDefault();
        toggle(product);
      }}
      aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      aria-pressed={saved}
      className={`grid h-9 w-9 place-items-center rounded-full bg-white/85 backdrop-blur transition hover:bg-white ${className}`}
    >
      <Heart className={`h-[17px] w-[17px] transition ${saved ? 'fill-ruby text-ruby' : 'text-ink'}`} strokeWidth={1.5} />
    </motion.button>
  );
}

function ProductCard({ product, layout = 'grid', priority = false }) {
  const { add } = useCart();
  const { open3D, openTryOn } = useUI();
  const href = `/product/${product.slug}`;
  const [img1, img2] = product.images;
  const collection = getCollection(product.collection);

  const badges = (
    <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-1.5">
      {product.isNew && <Badge tone="dark">New</Badge>}
      {product.isBestSeller && !product.isNew && <Badge>Bestseller</Badge>}
    </div>
  );

  const quickActions = (
    <div className="absolute inset-x-3 bottom-3 z-10 flex gap-2 transition-all duration-500 md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          open3D(product.id);
        }}
        className="flex flex-1 items-center justify-center gap-1.5 bg-white/90 py-2.5 text-[10px] font-semibold tracking-[0.16em] uppercase backdrop-blur transition hover:bg-white"
        aria-label={`View ${product.name} in 3D`}
      >
        <Icon360 className="h-4 w-4" /> <span className="hidden sm:inline">3D View</span>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          openTryOn(product.id);
        }}
        className="flex flex-1 items-center justify-center gap-1.5 bg-ink/90 py-2.5 text-[10px] font-semibold tracking-[0.16em] text-ivory uppercase backdrop-blur transition hover:bg-ink"
        aria-label={`Try on ${product.name}`}
      >
        <TryOnIcon className="h-4 w-4" /> <span className="hidden sm:inline">Try On</span>
      </button>
    </div>
  );

  const media = (
    <Link to={href} className="group/img relative block aspect-[4/5] overflow-hidden bg-cream">
      <img
        src={img1}
        alt={product.name}
        loading={priority ? 'eager' : 'lazy'}
        className="absolute inset-0 h-full w-full object-cover transition-all duration-[1.4s] ease-[var(--ease-luxe)] group-hover:scale-[1.06]"
      />
      {img2 && (
        <img
          src={img2}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-[1.1s] ease-[var(--ease-luxe)] group-hover:scale-[1.03] group-hover:opacity-100"
        />
      )}
    </Link>
  );

  if (layout === 'list') {
    return (
      <article className="group grid grid-cols-[120px_1fr] gap-4 border-b border-line pb-6 sm:grid-cols-[220px_1fr] sm:gap-8">
        <div className="relative">
          {media}
          {badges}
        </div>
        <div className="flex min-w-0 flex-col py-1">
          <p className="eyebrow text-[9.5px]">{collection?.name}</p>
          <Link to={href} className="mt-2 font-display text-2xl leading-tight hover:text-gold-dark sm:text-3xl">
            {product.name}
          </Link>
          <div className="mt-2 flex items-center gap-2 text-xs text-stone">
            <Stars value={product.rating} size={12} /> {product.rating} · {product.reviewCount} reviews
          </div>
          <p className="mt-3 line-clamp-2 hidden text-sm leading-relaxed text-stone sm:block">{product.description}</p>
          <p className="mt-3 text-[11px] tracking-[0.14em] text-stone uppercase">
            {product.purity} {product.metal}
            {product.diamondWeight > 0 && ` · ${product.diamondWeight} ct diamonds`}
          </p>
          <Price className="mt-3" price={product.price} mrp={product.mrp} discountPct={product.discountPct} />
          <div className="mt-auto flex flex-wrap gap-2 pt-4">
            <button type="button" onClick={() => add(product)} className="btn-primary px-5 py-3 text-[10.5px]">
              <ShoppingBag className="h-4 w-4" /> Add to bag
            </button>
            <button type="button" onClick={() => open3D(product.id)} className="btn-outline px-4 py-3 text-[10.5px]">
              <Icon360 className="h-4 w-4" /> 3D
            </button>
            <button type="button" onClick={() => openTryOn(product.id)} className="btn-outline px-4 py-3 text-[10.5px]">
              <TryOnIcon className="h-4 w-4" /> Try on
            </button>
            <WishlistButton product={product} className="border border-line" />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex flex-col">
      <div className="relative overflow-hidden">
        {media}
        {badges}
        <WishlistButton product={product} className="absolute top-3 right-3 z-10" />
        {quickActions}
      </div>
      <div className="flex flex-1 flex-col pt-4">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[10px] font-semibold tracking-[0.2em] text-stone uppercase">
            {product.purity} · {product.metal}
          </p>
          <span className="flex shrink-0 items-center gap-1 text-[11px] text-stone">
            <Stars value={product.rating} size={10} />
            <span className="hidden sm:inline">({product.reviewCount})</span>
          </span>
        </div>
        <Link to={href} className="mt-1.5 font-display text-[1.32rem] leading-snug text-ink transition-colors hover:text-gold-dark">
          {product.name}
        </Link>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <Price price={product.price} mrp={product.mrp} discountPct={product.discountPct} />
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => add(product)}
            aria-label={`Add ${product.name} to bag`}
            className="grid h-9 w-9 shrink-0 place-items-center border border-line text-ink transition hover:border-ink hover:bg-ink hover:text-ivory"
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
          </motion.button>
        </div>
      </div>
    </article>
  );
}

export default memo(ProductCard);
export { WishlistButton };
