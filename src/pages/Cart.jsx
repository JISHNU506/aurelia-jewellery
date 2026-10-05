import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Heart, Lock, ShoppingBag, Tag, Trash2, X } from 'lucide-react';
import { useCart, COUPONS } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { Breadcrumbs, EASE, EmptyState, QuantityStepper } from '../components/ui/Primitives.jsx';
import { formatINR } from '../utils/format.js';

export default function Cart() {
  const cart = useCart();
  const wishlist = useWishlist();
  const navigate = useNavigate();

  if (cart.items.length === 0) {
    return (
      <div className="container-luxe">
        <EmptyState
          icon={ShoppingBag}
          title="Your bag is empty"
          text="Discover pieces crafted to be treasured — from everyday luxe to heirloom bridal."
          action={
            <Link to="/shop" className="btn-primary">
              Start shopping <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      </div>
    );
  }

  const moveToWishlist = (item) => {
    wishlist.add(item.id);
    cart.remove(item.key);
  };

  return (
    <div className="container-luxe pt-6 pb-20 sm:pt-8 lg:pb-28">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Shopping bag' }]} />
      <div className="mt-6 flex items-end justify-between gap-4 border-b border-line pb-6">
        <h1 className="text-4xl font-light sm:text-5xl">Shopping bag</h1>
        <p className="pb-1 text-[12px] tracking-[0.14em] text-stone uppercase">
          {cart.count} {cart.count === 1 ? 'piece' : 'pieces'}
        </p>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-14">
        <ul className="divide-y divide-line">
          <AnimatePresence initial={false}>
            {cart.items.map((item) => {
              const p = item.product;
              const href = `/product/${p.slug}`;
              return (
                <motion.li
                  key={item.key}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 py-6 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-6">
                    <Link to={href} className="block aspect-square overflow-hidden bg-cream">
                      <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover transition duration-700 hover:scale-105" />
                    </Link>
                    <div className="flex min-w-0 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold tracking-[0.2em] text-stone uppercase">
                            {p.purity} · {p.metal}
                          </p>
                          <Link to={href} className="mt-1 block font-display text-xl leading-snug hover:text-gold-dark sm:text-2xl">
                            {p.name}
                          </Link>
                        </div>
                        <button type="button" onClick={() => cart.remove(item.key)} aria-label={`Remove ${p.name}`} className="-mt-1 -mr-1 grid h-9 w-9 shrink-0 place-items-center text-stone transition hover:text-ink">
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        {p.sizes?.length > 1 ? (
                          <label className="flex items-center gap-2 text-[12px] text-stone">
                            Size
                            <select
                              value={item.size ?? ''}
                              onChange={(e) => cart.changeSize(item.key, e.target.value)}
                              className="h-9 border border-line bg-white px-2 text-[13px] text-ink focus:border-gold focus:outline-none"
                            >
                              {p.sizes.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </label>
                        ) : (
                          item.size && <span className="text-[12px] text-stone">Size: {item.size}</span>
                        )}
                        <QuantityStepper small value={item.qty} onIncrease={() => cart.increase(item.key)} onDecrease={() => cart.decrease(item.key)} />
                      </div>

                      <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
                        <div className="flex gap-4 text-[11px] font-semibold tracking-[0.14em] text-stone uppercase">
                          <button type="button" onClick={() => moveToWishlist(item)} className="link-underline flex items-center gap-1.5 hover:text-ink">
                            <Heart className="h-3.5 w-3.5" /> Move to wishlist
                          </button>
                          <button type="button" onClick={() => cart.remove(item.key)} className="link-underline hidden items-center gap-1.5 hover:text-ink sm:flex">
                            <Trash2 className="h-3.5 w-3.5" /> Remove
                          </button>
                        </div>
                        <div className="text-right">
                          {item.lineMrp > item.lineTotal && <p className="text-[12px] text-mist line-through">{formatINR(item.lineMrp)}</p>}
                          <p className="text-[16px] font-semibold">{formatINR(item.lineTotal)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card-surface p-6 sm:p-8">
            <h2 className="text-2xl font-light">Order summary</h2>
            <dl className="mt-6 space-y-3 text-[14px]">
              <div className="flex justify-between">
                <dt className="text-stone">Bag total (MRP)</dt>
                <dd>{formatINR(cart.mrpTotal)}</dd>
              </div>
              {cart.savings > 0 && (
                <div className="flex justify-between text-gold-dark">
                  <dt>Making-charge savings</dt>
                  <dd>− {formatINR(cart.savings)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-stone">Subtotal</dt>
                <dd>{formatINR(cart.subtotal)}</dd>
              </div>
            </dl>

            <CouponBox />

            <dl className="mt-6 space-y-3 border-t border-line pt-6 text-[14px]">
              {cart.coupon && (
                <div className="flex justify-between text-emerald">
                  <dt>Coupon ({cart.coupon.code})</dt>
                  <dd>− {formatINR(cart.couponDiscount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-stone">Shipping</dt>
                <dd className="font-semibold tracking-wider text-emerald uppercase">Free</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-line pt-4">
                <dt className="text-[12px] font-semibold tracking-[0.18em] uppercase">Total</dt>
                <dd className="text-2xl font-semibold">{formatINR(cart.total)}</dd>
              </div>
              <p className="text-right text-[11.5px] text-mist">Includes GST of {formatINR(cart.gstIncluded)}</p>
            </dl>

            <button type="button" onClick={() => navigate('/checkout')} className="btn-primary mt-6 w-full">
              <Lock className="h-4 w-4" /> Secure checkout
            </button>
            <Link to="/shop" className="mt-4 block text-center text-[11px] font-semibold tracking-[0.18em] text-stone uppercase hover:text-ink">
              Continue shopping
            </Link>
          </div>
          <ul className="mt-4 space-y-1.5 px-1 text-[12px] text-stone">
            <li>· Free insured shipping in 3–5 days</li>
            <li>· 30-day returns · Lifetime exchange</li>
            <li>· BIS hallmarked gold, IGI certified diamonds</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}

function CouponBox() {
  const cart = useCart();
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState(null);

  const apply = (value) => {
    const res = cart.applyCoupon(value);
    setMsg(res);
    if (res.ok) setCode('');
  };

  if (cart.coupon) {
    return (
      <div className="mt-6 flex items-center justify-between gap-3 border border-dashed border-gold bg-cream/60 px-4 py-3">
        <div className="flex items-center gap-2 text-[13px]">
          <Tag className="h-4 w-4 text-gold-dark" />
          <span>
            <strong className="font-semibold">{cart.coupon.code}</strong>
            <span className="block text-[11.5px] text-stone">{cart.coupon.label}</span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            cart.removeCoupon();
            setMsg(null);
          }}
          className="text-[11px] font-semibold tracking-[0.14em] text-stone uppercase hover:text-ruby"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply(code);
        }}
        className="flex"
      >
        <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Coupon code" aria-label="Coupon code" className="input-luxe uppercase" />
        <button type="submit" disabled={!code.trim()} className="border border-l-0 border-ink bg-ink px-5 text-[11px] font-semibold tracking-[0.18em] text-ivory uppercase transition hover:bg-ink-soft disabled:opacity-50">
          Apply
        </button>
      </form>
      {msg && <p className={`mt-2 text-[12px] ${msg.ok ? 'text-emerald' : 'text-ruby'}`}>{msg.message}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {Object.values(COUPONS).map((c) => (
          <button
            key={c.code}
            type="button"
            onClick={() => apply(c.code)}
            title={c.label}
            className="border border-dashed border-champagne px-2.5 py-1.5 text-left text-[11px] text-stone transition hover:border-gold hover:text-ink"
          >
            <span className="font-semibold tracking-wider text-ink">{c.code}</span> · {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
