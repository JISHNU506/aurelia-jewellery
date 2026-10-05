import { AnimatePresence, motion } from 'framer-motion';
import ProductCard from './ProductCard.jsx';
import { EASE } from './ui/Primitives.jsx';

export default function ProductGrid({ products, layout = 'grid', columns = 'lg:grid-cols-4', className = '' }) {
  if (layout === 'list') {
    return (
      <div className={`flex flex-col gap-6 ${className}`}>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} layout="list" />
        ))}
      </div>
    );
  }
  return (
    <motion.div layout className={`grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-6 md:grid-cols-3 ${columns} ${className}`}>
      <AnimatePresence mode="popLayout">
        {products.map((p, i) => (
          <motion.div
            key={p.id}
            layout
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.6, delay: Math.min(i, 8) * 0.04, ease: EASE }}
          >
            <ProductCard product={p} priority={i < 4} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
