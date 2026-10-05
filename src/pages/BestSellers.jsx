import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductGrid from '../components/ProductGrid.jsx';
import { Breadcrumbs, PageHero, Reveal } from '../components/ui/Primitives.jsx';
import { BEST_SELLERS } from '../data/products.js';
import { banner } from '../data/media.js';

export default function BestSellers() {
  return (
    <>
      <PageHero
        eyebrow="Most loved"
        title="Best sellers"
        subtitle="The pieces our patrons return to again and again — chosen for proposals, weddings and every day in between."
        image={banner('collection-bridal')}
      />

      <section className="container-luxe pt-8 pb-20 sm:pb-24">
        <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Best sellers' }]} />
          <p className="text-sm text-stone">
            <span className="font-semibold text-ink">{BEST_SELLERS.length}</span> most-loved {BEST_SELLERS.length === 1 ? 'piece' : 'pieces'}
          </p>
        </div>
        <ProductGrid products={BEST_SELLERS} className="mt-10" />
      </section>

      <section className="bg-noir text-ivory">
        <Reveal className="container-luxe flex flex-col items-start justify-between gap-8 py-16 md:flex-row md:items-center">
          <div>
            <p className="eyebrow text-gold-light">The full collection</p>
            <h2 className="mt-3 text-3xl font-light sm:text-4xl">Find the piece that becomes yours</h2>
          </div>
          <Link to="/shop" className="btn-gold w-full sm:w-auto">
            Shop all jewellery <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </section>
    </>
  );
}
