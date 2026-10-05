import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { BadgeCheck, Gem, Heart, MapPin, RefreshCw, RotateCcw, Ruler, ShieldCheck, ShoppingBag, Star, Truck } from 'lucide-react';
import ProductGallery from '../components/ProductGallery.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import { Accordion, Breadcrumbs, EmptyState, Price, QuantityStepper, Reveal, SectionHeading, Stars } from '../components/ui/Primitives.jsx';
import { Modal } from '../components/ui/Overlay.jsx';
import { Icon360, TryOnIcon } from '../components/ui/Icons.jsx';
import { getCategory, getCollection, getProduct, relatedProducts } from '../data/products.js';
import { ratingDistribution } from '../data/reviews.js';
import { defaultSize, useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed.js';
import { deliveryDate, formatDate, formatINR } from '../utils/format.js';
import { GOLD_RATES, GST_RATE, PURITY_INFO, productPricing } from '../utils/price.js';

const Jewellery3DViewer = lazy(() => import('../components/Jewellery3DViewer.jsx'));

const SIZE_LABELS = { rings: 'Ring size', bangles: 'Bangle size', necklaces: 'Chain length', bracelets: 'Bracelet length', earrings: 'Size' };

const SIZE_GUIDES = {
  rings: {
    head: ['Indian size', 'Diameter', 'Circumference'],
    rows: ['10', '11', '12', '13', '14', '15', '16', '17', '18'].map((s) => {
      const c = 40 + Number(s);
      return [s, `${(c / Math.PI).toFixed(1)} mm`, `${c} mm`];
    }),
    tip: 'Wrap a strip of paper around the base of your finger, mark where it overlaps and measure the length in millimetres.',
  },
  bangles: {
    head: ['Size', 'Inner diameter', 'Fits wrist'],
    rows: [
      ['2.2', '54.0 mm', 'Petite'],
      ['2.4', '57.2 mm', 'Small'],
      ['2.6', '60.3 mm', 'Medium'],
      ['2.8', '63.5 mm', 'Large'],
      ['2.10', '66.7 mm', 'Extra large'],
    ],
    tip: 'Bring your thumb and little finger together and measure the widest part of your hand — that is the diameter you need.',
  },
  necklaces: {
    head: ['Length', 'Centimetres', 'Sits at'],
    rows: [
      ['16"', '41 cm', 'Collarbone'],
      ['18"', '46 cm', 'Just below the collarbone'],
      ['20"', '51 cm', 'A few inches below'],
    ],
    tip: 'Most pendants are worn at 18" — choose 16" for a closer fit or 20" for layering.',
  },
  bracelets: {
    head: ['Length', 'Centimetres', 'Wrist size'],
    rows: [
      ['6.5"', '16.5 cm', 'Up to 15 cm'],
      ['7"', '17.8 cm', '15 – 16.5 cm'],
      ['7.5"', '19.0 cm', '16.5 – 18 cm'],
    ],
    tip: 'Measure your wrist just below the wrist bone and add about 1.5 cm for a comfortable drape.',
  },
};

const TRUST = [
  { icon: BadgeCheck, title: 'BIS Hallmarked', text: 'Certified gold purity' },
  { icon: ShieldCheck, title: 'IGI Certified', text: 'Natural diamonds' },
  { icon: RotateCcw, title: '30-day returns', text: 'No questions asked' },
  { icon: RefreshCw, title: 'Lifetime exchange', text: 'At full gold value' },
];

export default function ProductDetails() {
  const { slug } = useParams();
  const product = getProduct(slug);

  if (!product) {
    return (
      <div className="container-luxe">
        <EmptyState
          icon={Gem}
          title="This piece could not be found"
          text="It may have been moved or is no longer part of our collection."
          action={
            <Link to="/shop" className="btn-primary">
              Explore the collection
            </Link>
          }
        />
      </div>
    );
  }
  return <ProductView key={product.id} product={product} />;
}

function SpecTable({ rows }) {
  return (
    <dl className="divide-y divide-line border-y border-line text-[13px]">
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 py-2.5">
          <dt className="text-stone">{k}</dt>
          <dd className="text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function ProductView({ product }) {
  const navigate = useNavigate();
  const cart = useCart();
  const wishlist = useWishlist();
  const { open3D, openTryOn } = useUI();
  const { ids: recentIds, track } = useRecentlyViewed();

  const sizes = product.sizes ?? [];
  const multiSize = sizes.length > 1;
  const [size, setSize] = useState(defaultSize(product));
  const [qty, setQty] = useState(1);
  const [guideOpen, setGuideOpen] = useState(false);

  const collection = getCollection(product.collection);
  const category = getCategory(product.category);
  const pricing = productPricing(product);
  const saved = wishlist.has(product.id);
  const sizeLabel = SIZE_LABELS[product.category] ?? 'Size';
  const guide = SIZE_GUIDES[product.category];

  useEffect(() => {
    track(product.id);
  }, [product.id, track]);

  const recent = recentIds
    .filter((id) => id !== product.id)
    .map(getProduct)
    .filter(Boolean)
    .slice(0, 4);
  const related = relatedProducts(product, 4);

  const addToBag = () => {
    cart.add(product, { size, qty });
    cart.open();
  };
  const buyNow = () => {
    cart.add(product, { size, qty, silent: true });
    navigate('/checkout');
  };
  const scrollToReviews = () => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' });

  const chips = [
    `${product.purity} ${product.metal}`,
    `${product.goldWeight} g gold`,
    product.diamondWeight > 0 && `${product.diamondWeight} ct diamonds`,
    product.gemstone?.type,
  ].filter(Boolean);

  const d = product.diamond;
  const g = product.gemstone;
  const detailRows = [
    ['Gold purity', `${product.purity} (${PURITY_INFO[product.purity]?.fineness ?? ''})`],
    ['Gold weight', `${product.goldWeight} g`],
    ['Metal colour', product.metal],
    d && ['Diamond weight', `${product.diamondWeight} ct · ${d.count} ${d.count === 1 ? 'stone' : 'stones'}`],
    d && ['Diamond quality', `${d.shape} · ${d.color} colour · ${d.clarity} clarity · ${d.cut} cut`],
    d && ['Certificate', d.certificate],
    g && ['Gemstone', `${g.type} · ${g.weight} ct · ${g.shape}`],
    g && ['Gemstone colour', g.colour],
    g && ['Origin & treatment', `${g.origin} · ${g.treatment}`],
    product.dimensions && ['Dimensions', product.dimensions],
    ['SKU', product.id.toUpperCase()],
  ].filter(Boolean);

  const rate = GOLD_RATES[product.purity];
  const priceRows = [
    ['Gold value', `${formatINR(rate)}/g × ${product.goldWeight} g`, pricing.goldValue],
    ['Making charges', `${product.makingPct}% less ${product.makingDiscount ?? 0}% offer`, pricing.making],
    ['Diamond / stone', null, pricing.stone],
    ['Other charges', 'Hallmarking & certification', pricing.other],
  ];

  const accordion = [
    { title: 'Product details', content: <SpecTable rows={detailRows} /> },
    {
      title: 'Price breakdown',
      content: (
        <div className="text-[13px]">
          <div className="divide-y divide-line border-y border-line">
            {priceRows.map(([label, note, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-4 py-2.5">
                <span>
                  <span className="text-ink">{label}</span>
                  {note && <span className="block text-[11px] text-mist">{note}</span>}
                </span>
                <span className="text-ink tabular-nums">{formatINR(value)}</span>
              </div>
            ))}
            <div className="flex justify-between py-2.5">
              <span className="text-ink">Subtotal</span>
              <span className="tabular-nums">{formatINR(pricing.subtotal)}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-ink">GST {GST_RATE}%</span>
              <span className="tabular-nums">{formatINR(pricing.tax)}</span>
            </div>
            <div className="flex justify-between py-3 text-[15px] font-semibold text-ink">
              <span>Total</span>
              <span className="tabular-nums">{formatINR(pricing.total)}</span>
            </div>
          </div>
          {pricing.makingSaved > 0 && (
            <p className="mt-3 text-[12px] text-gold-dark">You save {formatINR(pricing.makingSaved + pricing.makingSaved * (GST_RATE / 100))} on making charges (incl. GST).</p>
          )}
          <p className="mt-2 text-[11px] text-mist">Indicative gold rate for {product.purity}. Final price is locked at checkout.</p>
        </div>
      ),
    },
    {
      title: 'Description',
      content: (
        <div>
          <p>{product.description}</p>
          {product.highlights?.length > 0 && (
            <ul className="mt-4 space-y-2">
              {product.highlights.map((h) => (
                <li key={h} className="flex gap-3">
                  <span className="mt-2 h-1 w-1 shrink-0 rotate-45 bg-gold" />
                  {h}
                </li>
              ))}
            </ul>
          )}
        </div>
      ),
    },
    {
      title: 'Delivery & returns',
      content: (
        <ul className="space-y-3">
          <li><strong className="font-semibold text-ink">Free insured shipping</strong> — delivered in 3–5 business days in tamper-proof packaging.</li>
          <li><strong className="font-semibold text-ink">30-day returns</strong> — full refund on unworn pieces with tags and certificates intact.</li>
          <li><strong className="font-semibold text-ink">Lifetime exchange</strong> — exchange for the prevailing gold value and 100% of diamond value, forever.</li>
        </ul>
      ),
    },
  ];

  return (
    <div className="pb-24 lg:pb-0">
      <div className="container-luxe pt-6 pb-16 sm:pt-8 lg:pb-24">
        <Breadcrumbs
          className="mb-6 sm:mb-8"
          items={[
            { label: 'Home', to: '/' },
            { label: category?.name ?? 'Shop', to: category ? `/category/${category.id}` : '/shop' },
            { label: product.name },
          ]}
        />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ProductGallery product={product} onOpen3D={() => open3D(product.id)} onTryOn={() => openTryOn(product.id)} />
          </div>

          <div className="min-w-0">
            <p className="eyebrow">{collection?.name}</p>
            <h1 className="mt-3 text-4xl leading-[1.05] font-light sm:text-5xl">{product.name}</h1>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-[13px] text-stone">
              <Stars value={product.rating} size={14} />
              <span className="font-semibold text-ink">{product.rating}</span>
              <button type="button" onClick={scrollToReviews} className="link-underline">
                ({product.reviewCount} reviews)
              </button>
            </div>

            <div className="mt-6">
              <Price size="lg" price={product.price} mrp={product.mrp} discountPct={product.discountPct} />
              <p className="mt-2 text-[12px] text-stone">
                Inclusive of {GST_RATE}% GST · {product.makingDiscount ?? 0}% off on making charges
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {chips.map((c) => (
                <span key={c} className="border border-line bg-white/60 px-3 py-1.5 text-[10.5px] font-semibold tracking-[0.14em] text-ink-soft uppercase">
                  {c}
                </span>
              ))}
            </div>

            <div className="hairline my-7" />

            {/* Size */}
            {sizes.length > 0 && (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="label-luxe mb-0">
                    {sizeLabel}: <span className="text-ink">{size}</span>
                  </span>
                  {multiSize && guide && (
                    <button type="button" onClick={() => setGuideOpen(true)} className="link-underline flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] text-gold-dark uppercase">
                      <Ruler className="h-3.5 w-3.5" /> Size guide
                    </button>
                  )}
                </div>
                {multiSize && (
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSize(s)}
                        aria-pressed={size === s}
                        className={`h-11 min-w-11 border px-3 text-[13px] transition ${size === s ? 'border-ink bg-ink text-ivory' : 'border-line bg-white/60 text-ink hover:border-ink'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quantity + actions */}
            <div className="mt-6 flex items-center gap-4">
              <span className="label-luxe mb-0">Quantity</span>
              <QuantityStepper value={qty} onIncrease={() => setQty((q) => Math.min(10, q + 1))} onDecrease={() => setQty((q) => Math.max(1, q - 1))} />
            </div>

            <div className="mt-6 flex gap-2">
              <button type="button" onClick={addToBag} className="btn-primary flex-1">
                <ShoppingBag className="h-4 w-4" /> Add to bag
              </button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => wishlist.toggle(product)}
                aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
                aria-pressed={saved}
                className="grid w-14 shrink-0 place-items-center border border-line bg-white/60 transition hover:border-ink"
              >
                <Heart className={`h-5 w-5 ${saved ? 'fill-ruby text-ruby' : 'text-ink'}`} strokeWidth={1.5} />
              </motion.button>
            </div>
            <button type="button" onClick={buyNow} className="btn-gold mt-2 w-full">
              Buy now
            </button>

            {/* 3D + Try on */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => open3D(product.id)}
                className="group flex flex-col items-center justify-center gap-2 border border-gold bg-gradient-to-b from-ivory to-cream px-3 py-5 text-ink transition duration-500 hover:border-gold-dark hover:shadow-soft"
              >
                <Icon360 className="h-8 w-8 text-gold-dark transition-transform duration-700 group-hover:rotate-180" />
                <span className="text-[11.5px] font-semibold tracking-[0.2em] uppercase">360° View</span>
                <span className="text-[11px] text-stone">Rotate & zoom in 3D</span>
              </button>
              <button
                type="button"
                onClick={() => openTryOn(product.id)}
                className="group flex flex-col items-center justify-center gap-2 border border-noir bg-noir px-3 py-5 text-ivory transition duration-500 hover:bg-ink-soft hover:shadow-soft"
              >
                <TryOnIcon className="h-8 w-8 text-gold-light transition-transform duration-500 group-hover:scale-110" />
                <span className="text-[11.5px] font-semibold tracking-[0.2em] uppercase">Try It On</span>
                <span className="text-[11px] text-ivory/60">Live with your camera</span>
              </button>
            </div>

            <PincodeCheck />

            {/* Trust */}
            <div className="mt-6 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
              {TRUST.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex flex-col items-center gap-1.5 bg-ivory px-2 py-4 text-center">
                  <Icon className="h-5 w-5 text-gold-dark" strokeWidth={1.4} />
                  <span className="text-[10.5px] font-semibold tracking-[0.12em] uppercase">{title}</span>
                  <span className="text-[11px] text-stone">{text}</span>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Accordion items={accordion} />
            </div>
          </div>
        </div>
      </div>

      <Inline3D product={product} />

      <Reviews product={product} />

      <section className="container-luxe py-16 sm:py-24">
        <SectionHeading eyebrow="You may also love" title="Complete the look" />
        <ProductGrid products={related} className="mt-12" />
      </section>

      {recent.length > 0 && (
        <section className="container-luxe border-t border-line py-16 sm:py-20">
          <SectionHeading eyebrow="Your journey" title="Recently viewed" />
          <ProductGrid products={recent} className="mt-12" />
        </section>
      )}

      {guide && (
        <Modal open={guideOpen} onClose={() => setGuideOpen(false)} size="sm" label="Size guide">
          <div className="p-6 sm:p-8">
            <p className="eyebrow">Size guide</p>
            <h3 className="mt-2 text-3xl font-light">{sizeLabel}</h3>
            <table className="mt-6 w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-ink/70">
                  {guide.head.map((h) => (
                    <th key={h} className="py-2 text-[10.5px] font-semibold tracking-[0.14em] text-stone uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {guide.rows.map((r) => (
                  <tr key={r[0]} className={r[0] === size ? 'bg-cream' : ''}>
                    {r.map((c, i) => (
                      <td key={i} className={`py-2.5 ${i === 0 ? 'font-semibold text-ink' : 'text-stone'}`}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-5 text-[12px] leading-relaxed text-stone">{guide.tip}</p>
            <p className="mt-2 text-[12px] text-stone">Unsure? We resize for free within 60 days.</p>
          </div>
        </Modal>
      )}

      {/* Mobile sticky bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ivory/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] text-stone">{product.name}</p>
            <p className="text-lg font-semibold text-ink">{formatINR(product.price)}</p>
          </div>
          <button type="button" onClick={() => open3D(product.id)} aria-label="View in 3D" className="grid h-12 w-12 place-items-center border border-line">
            <Icon360 className="h-5 w-5" />
          </button>
          <button type="button" onClick={addToBag} className="btn-primary px-5">
            <ShoppingBag className="h-4 w-4" /> Add to bag
          </button>
        </div>
      </div>
    </div>
  );
}

function PincodeCheck() {
  const [pin, setPin] = useState('');
  const [result, setResult] = useState(null);

  const check = (e) => {
    e.preventDefault();
    if (/^[1-9]\d{5}$/.test(pin)) setResult({ ok: true, text: `Delivery by ${deliveryDate(4)} · Free insured shipping` });
    else setResult({ ok: false, text: 'Please enter a valid 6-digit pincode.' });
  };

  return (
    <form onSubmit={check} className="mt-6 border border-line bg-white/50 p-4">
      <label htmlFor="pincode" className="label-luxe flex items-center gap-2">
        <Truck className="h-4 w-4 text-gold-dark" strokeWidth={1.5} /> Check delivery
      </label>
      <div className="flex">
        <div className="relative flex-1">
          <MapPin className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-mist" />
          <input
            id="pincode"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, ''));
              setResult(null);
            }}
            placeholder="Enter pincode"
            className="input-luxe pl-9"
          />
        </div>
        <button type="submit" className="border border-l-0 border-ink bg-ink px-5 text-[11px] font-semibold tracking-[0.18em] text-ivory uppercase transition hover:bg-ink-soft">
          Check
        </button>
      </div>
      {result && <p className={`mt-2.5 text-[12.5px] ${result.ok ? 'text-emerald' : 'text-ruby'}`}>{result.text}</p>}
    </form>
  );
}

function Inline3D({ product }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '300px' });
  const { open3D, openTryOn } = useUI();
  const skeleton = <div className="skeleton h-[480px] w-full" />;

  return (
    <section ref={ref} className="bg-cream py-16 sm:py-24">
      <div className="container-luxe">
        <SectionHeading
          eyebrow="Interactive atelier"
          title="Explore in 3D"
          subtitle="Drag to rotate, scroll or pinch to zoom. Every facet, prong and engraving — exactly as it will arrive."
        />
        <Reveal className="mt-10 border border-line bg-ivory">
          {inView ? (
            <Suspense fallback={skeleton}>
              <Jewellery3DViewer model={product.model} product={product} height={480} />
            </Suspense>
          ) : (
            skeleton
          )}
        </Reveal>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => open3D(product.id)} className="btn-outline">
            <Icon360 className="h-4 w-4" /> Full-screen 360°
          </button>
          <button type="button" onClick={() => openTryOn(product.id)} className="btn-primary">
            <TryOnIcon className="h-4 w-4" /> Try it on
          </button>
        </div>
      </div>
    </section>
  );
}

const EMPTY_REVIEW = { name: '', city: '', rating: 5, title: '', text: '' };

function Reviews({ product }) {
  const { toast } = useUI();
  const [extra, setExtra] = useLocalStorage(`reviews:${product.id}`, []);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_REVIEW);
  const [error, setError] = useState('');

  const all = [...extra, ...product.reviews];
  const total = product.reviewCount + extra.length;
  const average = (product.rating * product.reviewCount + extra.reduce((s, r) => s + r.rating, 0)) / total;
  const dist = ratingDistribution(product.rating, product.reviewCount).map((row) => ({
    ...row,
    count: row.count + extra.filter((r) => r.rating === row.stars).length,
  }));
  const maxCount = Math.max(...dist.map((r) => r.count), 1);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.text.trim()) {
      setError('Please add your name and a few words about the piece.');
      return;
    }
    setExtra((prev) => [
      {
        id: `u-${Date.now()}`,
        name: form.name.trim(),
        city: form.city.trim(),
        rating: Number(form.rating),
        title: form.title.trim() || 'Lovely piece',
        text: form.text.trim(),
        date: new Date().toISOString().slice(0, 10),
        verified: false,
      },
      ...prev,
    ]);
    setForm(EMPTY_REVIEW);
    setError('');
    setFormOpen(false);
    toast({ title: 'Thank you for your review', description: 'It is now visible on this page.' });
  };

  return (
    <section id="reviews" className="container-luxe scroll-mt-24 py-16 sm:py-24">
      <SectionHeading eyebrow="Client reviews" title="Loved and worn" align="left" />
      <div className="mt-12 grid gap-12 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-16">
        <div>
          <div className="flex items-end gap-4">
            <span className="font-display text-7xl leading-none font-light">{average.toFixed(1)}</span>
            <div className="pb-2">
              <Stars value={average} size={16} />
              <p className="mt-1 text-[12px] text-stone">{total} reviews</p>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            {dist.map((r) => (
              <div key={r.stars} className="flex items-center gap-3 text-[12px] text-stone">
                <span className="w-6 tabular-nums">{r.stars}★</span>
                <div className="h-1.5 flex-1 bg-sand">
                  <motion.div
                    className="h-full bg-gold"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(r.count / maxCount) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
                <span className="w-8 text-right tabular-nums">{r.count}</span>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setFormOpen((o) => !o)} className="btn-outline mt-8 w-full">
            {formOpen ? 'Cancel' : 'Write a review'}
          </button>
        </div>

        <div>
          {formOpen && (
            <motion.form
              onSubmit={submit}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 grid gap-4 border border-line bg-white/60 p-5 sm:grid-cols-2 sm:p-6"
            >
              <div className="sm:col-span-2">
                <span className="label-luxe">Your rating</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setForm((f) => ({ ...f, rating: n }))} aria-label={`${n} stars`} className="p-0.5">
                      <Star className={`h-6 w-6 transition ${form.rating >= n ? 'fill-gold text-gold' : 'text-champagne'}`} strokeWidth={1.4} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label-luxe" htmlFor="rv-name">Name</label>
                <input id="rv-name" value={form.name} onChange={set('name')} className="input-luxe" />
              </div>
              <div>
                <label className="label-luxe" htmlFor="rv-city">City</label>
                <input id="rv-city" value={form.city} onChange={set('city')} className="input-luxe" />
              </div>
              <div className="sm:col-span-2">
                <label className="label-luxe" htmlFor="rv-title">Title</label>
                <input id="rv-title" value={form.title} onChange={set('title')} className="input-luxe" />
              </div>
              <div className="sm:col-span-2">
                <label className="label-luxe" htmlFor="rv-text">Your review</label>
                <textarea id="rv-text" rows={4} value={form.text} onChange={set('text')} className="input-luxe resize-none" />
              </div>
              {error && <p className="text-[12.5px] text-ruby sm:col-span-2">{error}</p>}
              <div className="sm:col-span-2">
                <button type="submit" className="btn-primary">Submit review</button>
              </div>
            </motion.form>
          )}

          <ul className="divide-y divide-line border-y border-line">
            {all.map((r) => (
              <li key={r.id ?? `${r.name}-${r.date}`} className="py-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Stars value={r.rating} size={13} />
                  <span className="text-[11px] text-mist">{formatDate(r.date)}</span>
                </div>
                <h4 className="mt-3 text-xl">{r.title}</h4>
                <p className="mt-2 text-[14px] leading-relaxed text-stone">{r.text}</p>
                <p className="mt-3 text-[11px] font-semibold tracking-[0.14em] text-ink-soft uppercase">
                  {r.name}
                  {r.city && <span className="font-normal text-mist"> · {r.city}</span>}
                  {r.verified && (
                    <span className="ml-2 inline-flex items-center gap-1 text-emerald normal-case tracking-normal">
                      <BadgeCheck className="h-3.5 w-3.5" /> Verified buyer
                    </span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
