import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useUI } from '../context/UIContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { getProduct, getCollection } from '../data/products.js';
import { Modal } from './ui/Overlay.jsx';
import { Price, Stars } from './ui/Primitives.jsx';
import { TryOnIcon } from './ui/Icons.jsx';
import Jewellery3DViewer from './Jewellery3DViewer.jsx';

/** Full-screen "360° / 3D View" experience that any product card can open. */
export default function Viewer3DModal() {
  const { viewer, close3D, openTryOn } = useUI();
  const cart = useCart();
  const product = viewer ? getProduct(viewer) : null;

  return (
    <Modal open={!!product} onClose={close3D} size="full" label="3D jewellery viewer">
      {product && (
        <div className="grid h-[100dvh] grid-rows-[1fr_auto] lg:grid-cols-[1fr_380px] lg:grid-rows-1">
          <Jewellery3DViewer key={product.id} model={product.model} product={product} height="100%" className="h-full min-h-0" />
          <aside className="flex flex-col gap-4 overflow-y-auto border-t border-line bg-ivory p-5 lg:border-t-0 lg:border-l lg:p-8">
            <div className="hidden lg:block">
              <p className="eyebrow">{getCollection(product.collection)?.name} · 3D View</p>
              <h2 className="mt-3 text-4xl leading-tight font-light">{product.name}</h2>
              <div className="mt-2 flex items-center gap-2 text-xs text-stone">
                <Stars value={product.rating} size={12} /> {product.rating} ({product.reviewCount})
              </div>
            </div>
            <div className="flex items-end justify-between gap-3 lg:block">
              <div className="lg:hidden">
                <p className="font-display text-2xl leading-tight">{product.name}</p>
              </div>
              <Price price={product.price} mrp={product.mrp} discountPct={product.discountPct} size="md" />
            </div>
            <dl className="hidden grid-cols-2 gap-px border border-line bg-line text-sm lg:grid">
              {[
                ['Purity', `${product.purity} ${product.metal}`],
                ['Gold weight', `${product.goldWeight} g`],
                ['Diamonds', product.diamondWeight ? `${product.diamondWeight} ct` : '—'],
                ['Gemstone', product.gemstone?.type ?? '—'],
              ].map(([k, v]) => (
                <div key={k} className="bg-ivory p-3">
                  <dt className="text-[10px] tracking-[0.18em] text-stone uppercase">{k}</dt>
                  <dd className="mt-1 font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="hidden text-sm leading-relaxed text-stone lg:block">{product.shortDescription} Try the lighting presets and metal swatches to see how it looks in different settings.</p>
            <div className="grid grid-cols-2 gap-2 lg:mt-auto lg:grid-cols-1">
              <button type="button" onClick={() => cart.add(product)} className="btn-primary px-3">
                <ShoppingBag className="h-4 w-4" /> Add to bag
              </button>
              <button
                type="button"
                onClick={() => {
                  close3D();
                  openTryOn(product.id);
                }}
                className="btn-gold px-3"
              >
                <TryOnIcon className="h-4 w-4" /> Try it on
              </button>
              <Link to={`/product/${product.slug}`} onClick={close3D} className="col-span-2 py-2 text-center text-[11px] font-semibold tracking-[0.18em] uppercase underline-offset-4 hover:underline lg:col-span-1">
                View full details
              </Link>
            </div>
          </aside>
        </div>
      )}
    </Modal>
  );
}
