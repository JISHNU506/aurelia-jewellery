import { createContext, useCallback, useContext, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { getProduct } from '../data/products.js';
import { useCart } from './CartContext.jsx';
import { useUI } from './UIContext.jsx';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [ids, setIds] = useLocalStorage('wishlist', []);
  const cart = useCart();
  const { toast } = useUI();

  const has = useCallback((id) => ids.includes(id), [ids]);
  const add = useCallback((id) => setIds((prev) => (prev.includes(id) ? prev : [id, ...prev])), [setIds]);
  const remove = useCallback((id) => setIds((prev) => prev.filter((x) => x !== id)), [setIds]);

  const toggle = useCallback(
    (product) => {
      const exists = ids.includes(product.id);
      setIds((prev) => (exists ? prev.filter((x) => x !== product.id) : [product.id, ...prev]));
      toast({
        title: exists ? 'Removed from wishlist' : 'Saved to your wishlist',
        description: product.name,
        image: product.images[0],
        tone: exists ? 'neutral' : 'gold',
      });
    },
    [ids, setIds, toast],
  );

  const moveToCart = useCallback(
    (id, size) => {
      const product = getProduct(id);
      if (!product) return;
      cart.add(product, { size });
      setIds((prev) => prev.filter((x) => x !== id));
    },
    [cart, setIds],
  );

  const value = useMemo(
    () => ({
      ids,
      items: ids.map(getProduct).filter(Boolean),
      count: ids.length,
      has,
      add,
      remove,
      toggle,
      moveToCart,
      clear: () => setIds([]),
    }),
    [ids, has, add, remove, toggle, moveToCart, setIds],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside <WishlistProvider>');
  return ctx;
}
