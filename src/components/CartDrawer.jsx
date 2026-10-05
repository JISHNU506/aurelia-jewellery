import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag, Trash2, Truck, X } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { formatINR } from '../utils/format.js';
import { Drawer } from './ui/Overlay.jsx';
import { EASE, QuantityStepper } from './ui/Primitives.jsx';

export default function CartDrawer() {
  const cart = useCart();
  const navigate = useNavigate();
  const go = (to) => {
    cart.close();
    navigate(to);
  };

  return (
    <Drawer open={cart.isOpen} onClose={cart.close} label="Shopping bag">
      <div className="flex items-center justify-between border-b border-line px-6 py-5">
        <div>
          <p className="eyebrow">Your bag</p>
          <p className="mt-1 font-display text-2xl">{cart.count ? `${cart.count} ${cart.count === 1 ? 'piece' : 'pieces'}` : 'Empty'}</p>
        </div>
        <button type="button" onClick={cart.close} aria-label="Close bag" className="grid h-10 w-10 place-items-center rounded-full hover:bg-cream">
          <X className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </div>

      {cart.items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <span className="grid h-20 w-20 place-items-center rounded-full border border-line text-gold-dark">
            <ShoppingBag className="h-8 w-8" strokeWidth={1.1} />
          </span>
          <p className="mt-6 font-display text-3xl font-light">Your bag is waiting</p>
          <p className="mt-2 text-sm text-stone">Discover pieces crafted to be treasured for generations.</p>
          <button type="button" onClick={() => go('/shop')} className="btn-primary mt-8">
            Explore jewellery
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 bg-cream px-6 py-3 text-xs text-stone">
            <Truck className="h-4 w-4 text-gold-dark" strokeWidth={1.4} /> Complimentary insured shipping on every order
          </div>
          <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
            <AnimatePresence initial={false}>
              {cart.items.map((item) => (
                <motion.li
                  key={item.key}
                  layout
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30, height: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="flex gap-4 py-5"
                >
                  <Link to={`/product/${item.product.slug}`} onClick={cart.close} className="shrink-0 bg-cream">
                    <img src={item.product.images[0]} alt={item.product.name} className="h-24 w-24 object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link to={`/product/${item.product.slug}`} onClick={cart.close} className="font-display text-lg leading-tight hover:text-gold-dark">
                        {item.product.name}
                      </Link>
                      <button type="button" onClick={() => cart.remove(item.key)} aria-label="Remove" className="p-1 text-mist hover:text-ruby">
                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                    </div>
                    <p className="mt-1 text-[11px] tracking-wider text-stone uppercase">
                      {item.product.purity} {item.product.metal}
                      {item.size && ` · Size ${item.size}`}
                    </p>
                    <div className="mt-auto flex items-end justify-between pt-3">
                      <QuantityStepper small value={item.qty} onIncrease={() => cart.increase(item.key)} onDecrease={() => cart.decrease(item.key)} min={0} />
                      <span className="text-sm font-semibold">{formatINR(item.lineTotal)}</span>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <div className="border-t border-line bg-white/60 px-6 py-5">
            {cart.savings > 0 && (
              <div className="mb-2 flex justify-between text-sm text-gold-dark">
                <span>You save on making charges</span>
                <span>−{formatINR(cart.savings)}</span>
              </div>
            )}
            {cart.couponDiscount > 0 && (
              <div className="mb-2 flex justify-between text-sm text-gold-dark">
                <span>Coupon {cart.coupon.code}</span>
                <span>−{formatINR(cart.couponDiscount)}</span>
              </div>
            )}
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase">Total</span>
              <span className="font-display text-3xl">{formatINR(cart.total)}</span>
            </div>
            <p className="mt-1 text-xs text-mist">Inclusive of GST · Free insured delivery</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => go('/cart')} className="btn-outline px-3">
                View bag
              </button>
              <button type="button" onClick={() => go('/checkout')} className="btn-primary px-3">
                Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </Drawer>
  );
}
