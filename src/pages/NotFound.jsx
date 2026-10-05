import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { EASE } from '../components/ui/Primitives.jsx';
import { DiamondMark } from '../components/ui/Icons.jsx';
import { CATEGORIES } from '../data/products.js';

export default function NotFound() {
  return (
    <section className="grain relative overflow-hidden bg-cream">
      <div className="container-luxe relative flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: EASE }} className="text-gold">
          <DiamondMark className="h-9 w-9" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.1, ease: EASE }}
          className="gold-text mt-6 font-display text-[8rem] leading-none font-light sm:text-[11rem]"
        >
          404
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.25, ease: EASE }}>
          <h1 className="text-4xl font-light sm:text-5xl">This piece has slipped away</h1>
          <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-stone">
            The page you’re looking for may have moved or no longer exists. Let us guide you back to something beautiful.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/" className="btn-primary">
              Return home
            </Link>
            <Link to="/shop" className="btn-outline">
              Shop jewellery <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="gold-rule mx-auto mt-14 w-40" />
          <nav aria-label="Popular categories" className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3">
            {CATEGORIES.map((c) => (
              <Link key={c.id} to={`/category/${c.id}`} className="link-underline text-[11px] font-semibold tracking-[0.2em] text-stone uppercase hover:text-ink">
                {c.name}
              </Link>
            ))}
          </nav>
        </motion.div>
      </div>
    </section>
  );
}
