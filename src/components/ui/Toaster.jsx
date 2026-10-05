import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useUI } from '../../context/UIContext.jsx';
import { EASE } from './Primitives.jsx';

export default function Toaster() {
  const { toasts, dismiss } = useUI();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[90] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 border border-line bg-white/95 p-3 pr-2 shadow-lift backdrop-blur"
          >
            {t.image ? (
              <img src={t.image} alt="" className="h-14 w-14 shrink-0 object-cover" />
            ) : (
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-light/40 text-gold-dark">
                <Check className="h-4 w-4" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[10.5px] font-semibold tracking-[0.18em] text-gold-dark uppercase">
                {t.tone !== 'neutral' && <Check className="h-3 w-3" />}
                {t.title}
              </p>
              {t.description && <p className="mt-0.5 truncate font-display text-lg leading-tight">{t.description}</p>}
              {t.action && (
                <button
                  type="button"
                  className="mt-1 text-[11px] font-semibold tracking-[0.14em] uppercase underline underline-offset-4"
                  onClick={() => {
                    t.action.onClick();
                    dismiss(t.id);
                  }}
                >
                  {t.action.label}
                </button>
              )}
            </div>
            <button type="button" aria-label="Dismiss" onClick={() => dismiss(t.id)} className="self-start p-1 text-mist hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
