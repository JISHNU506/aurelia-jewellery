import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { getProduct } from '../data/products.js';
import { useUI } from './UIContext.jsx';

const CartContext = createContext(null);

export const COUPONS = {
  AURELIA10: { code: 'AURELIA10', label: '10% off (max ₹25,000)', apply: (subtotal) => Math.min(subtotal * 0.1, 25000) },
  FIRSTGOLD: { code: 'FIRSTGOLD', label: '₹2,000 off on orders above ₹20,000', apply: (subtotal) => (subtotal >= 20000 ? 2000 : 0) },
};

export const EXPRESS_SHIPPING = 500;

const keyOf = (id, size) => `${id}::${size ?? ''}`;

export function defaultSize(product) {
  const sizes = product.sizes ?? [];
  return sizes.length ? sizes[Math.floor(sizes.length / 2)] : null;
}

export function CartProvider({ children }) {
  const { toast } = useUI();
  const [items, setItems] = useLocalStorage('cart', []);
  const [couponCode, setCouponCode] = useLocalStorage('coupon', null);
  const [isOpen, setOpen] = useState(false);
  const [bump, setBump] = useState(0);

  const add = useCallback(
    (product, { size, qty = 1, silent = false } = {}) => {
      const chosen = size ?? defaultSize(product);
      const key = keyOf(product.id, chosen);
      setItems((prev) => {
        const found = prev.find((i) => i.key === key);
        if (found) return prev.map((i) => (i.key === key ? { ...i, qty: Math.min(10, i.qty + qty) } : i));
        return [...prev, { key, id: product.id, size: chosen, qty, addedAt: Date.now() }];
      });
      setBump((b) => b + 1);
      if (!silent) {
        toast({
          title: 'Added to your bag',
          description: product.name,
          image: product.images[0],
          action: { label: 'View bag', onClick: () => setOpen(true) },
        });
      }
    },
    [setItems, toast],
  );

  const remove = useCallback((key) => setItems((prev) => prev.filter((i) => i.key !== key)), [setItems]);
  const setQty = useCallback(
    (key, qty) => setItems((prev) => prev.map((i) => (i.key === key ? { ...i, qty: Math.max(1, Math.min(10, qty)) } : i))),
    [setItems],
  );
  const increase = useCallback(
    (key) => setItems((prev) => prev.map((i) => (i.key === key ? { ...i, qty: Math.min(10, i.qty + 1) } : i))),
    [setItems],
  );
  const decrease = useCallback(
    (key) => setItems((prev) => prev.flatMap((i) => (i.key !== key ? [i] : i.qty > 1 ? [{ ...i, qty: i.qty - 1 }] : []))),
    [setItems],
  );
  const changeSize = useCallback(
    (key, size) =>
      setItems((prev) => {
        const item = prev.find((i) => i.key === key);
        if (!item) return prev;
        const nextKey = keyOf(item.id, size);
        if (nextKey === key) return prev;
        const merged = prev.find((i) => i.key === nextKey);
        return prev
          .filter((i) => i.key !== nextKey)
          .map((i) => (i.key === key ? { ...i, key: nextKey, size, qty: Math.min(10, i.qty + (merged?.qty ?? 0)) } : i));
      }),
    [setItems],
  );
  const clear = useCallback(() => {
    setItems([]);
    setCouponCode(null);
  }, [setItems, setCouponCode]);

  const applyCoupon = useCallback(
    (code) => {
      const c = COUPONS[String(code).trim().toUpperCase()];
      if (!c) return { ok: false, message: 'This code is not valid.' };
      setCouponCode(c.code);
      return { ok: true, message: `${c.code} applied — ${c.label}` };
    },
    [setCouponCode],
  );

  const value = useMemo(() => {
    const lines = items
      .map((i) => ({ ...i, product: getProduct(i.id) }))
      .filter((i) => i.product)
      .map((i) => ({ ...i, lineTotal: i.product.price * i.qty, lineMrp: i.product.mrp * i.qty }));
    const count = lines.reduce((s, i) => s + i.qty, 0);
    const subtotal = lines.reduce((s, i) => s + i.lineTotal, 0);
    const mrpTotal = lines.reduce((s, i) => s + i.lineMrp, 0);
    const coupon = couponCode ? COUPONS[couponCode] : null;
    const couponDiscount = coupon ? Math.round(coupon.apply(subtotal)) : 0;
    const total = Math.max(0, subtotal - couponDiscount);
    // catalogue prices are GST-inclusive (3%)
    const gstIncluded = Math.round(total - total / 1.03);
    return {
      items: lines,
      count,
      subtotal,
      mrpTotal,
      savings: mrpTotal - subtotal,
      coupon,
      couponDiscount,
      total,
      gstIncluded,
      isOpen,
      bump,
      open: () => setOpen(true),
      close: () => setOpen(false),
      add,
      remove,
      setQty,
      increase,
      decrease,
      changeSize,
      clear,
      applyCoupon,
      removeCoupon: () => setCouponCode(null),
    };
  }, [items, couponCode, isOpen, bump, add, remove, setQty, increase, decrease, changeSize, clear, applyCoupon, setCouponCode]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
