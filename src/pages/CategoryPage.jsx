import { Link, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Shop from './Shop.jsx';
import { getCategory } from '../data/products.js';
import { CATEGORY_MEDIA } from '../data/media.js';

export default function CategoryPage() {
  const { category: id } = useParams();
  const cat = getCategory(id);

  if (!cat) {
    return (
      <section className="container-luxe flex flex-col items-center py-28 text-center sm:py-36">
        <p className="eyebrow">Category not found</p>
        <h1 className="mt-4 text-5xl font-light sm:text-6xl">We couldn’t find “{id}”</h1>
        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-stone">This category may have moved. Browse all our categories to find what you’re looking for.</p>
        <Link to="/categories" className="btn-primary mt-10">
          View all categories <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    );
  }

  return <Shop key={cat.id} fixedCategory={cat.id} title={cat.name} eyebrow="Category" subtitle={cat.tagline} heroImage={CATEGORY_MEDIA[cat.id]?.hero} />;
}
