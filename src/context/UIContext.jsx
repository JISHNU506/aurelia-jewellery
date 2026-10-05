import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const UIContext = createContext(null);

/**
 * Global UI state: toasts, the search overlay, and the full-screen 3D viewer /
 * virtual try-on experiences (so any product card can launch them).
 */
export function UIProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [viewer, setViewer] = useState(null); // product id shown in the 3D modal
  const [tryOn, setTryOn] = useState(null); // { productId }
  const seq = useRef(0);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback(
    (t) => {
      const id = ++seq.current;
      setToasts((prev) => [...prev.slice(-2), { id, tone: 'gold', ...t }]);
      setTimeout(() => dismiss(id), t.duration ?? 3800);
      return id;
    },
    [dismiss],
  );

  const value = useMemo(
    () => ({
      toasts,
      toast,
      dismiss,
      searchOpen,
      openSearch: () => setSearchOpen(true),
      closeSearch: () => setSearchOpen(false),
      viewer,
      open3D: (productId) => setViewer(productId),
      close3D: () => setViewer(null),
      tryOn,
      openTryOn: (productId) => setTryOn({ productId }),
      closeTryOn: () => setTryOn(null),
    }),
    [toasts, toast, dismiss, searchOpen, viewer, tryOn],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used inside <UIProvider>');
  return ctx;
}
