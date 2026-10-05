import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll.js';
import { EASE } from './Primitives.jsx';

function useEscape(open, onClose) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
}

/** Centered dialog. `size="full"` produces an edge-to-edge experience. */
export function Modal({ open, onClose, children, size = 'md', label, className = '', dark = false, hideClose = false }) {
  useEscape(open, onClose);
  useLockBodyScroll(open);
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-5xl',
    full: 'h-[100dvh] w-full max-w-none',
  };
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          role="dialog"
          aria-modal="true"
          aria-label={label}
        >
          <div className="absolute inset-0 bg-noir/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className={`relative w-full ${sizes[size]} ${size === 'full' ? '' : 'max-h-[92dvh] overflow-y-auto'} ${dark ? 'bg-noir text-ivory' : 'bg-ivory'} shadow-lift ${className}`}
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            {!hideClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className={`absolute top-3 right-3 z-20 grid h-10 w-10 place-items-center rounded-full transition ${dark ? 'bg-white/10 text-ivory hover:bg-white/20' : 'bg-white/80 text-ink hover:bg-white'}`}
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/** Side sheet (cart, filters, mobile menu). */
export function Drawer({ open, onClose, children, side = 'right', label, width = 'max-w-md', className = '' }) {
  useEscape(open, onClose);
  useLockBodyScroll(open);
  const from = side === 'right' ? '100%' : '-100%';
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={label}>
          <div className="absolute inset-0 bg-noir/45 backdrop-blur-[2px]" onClick={onClose} />
          <motion.aside
            className={`absolute top-0 ${side === 'right' ? 'right-0' : 'left-0'} flex h-[100dvh] w-full ${width} flex-col bg-ivory shadow-lift ${className}`}
            initial={{ x: from }}
            animate={{ x: 0 }}
            exit={{ x: from }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            {children}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
