import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Calculator, Camera, Check, Quote, ScanFace, Sparkles } from 'lucide-react';
import { TrustBar } from '../components/Footer.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import { EASE, Reveal, SectionHeading, Stars } from '../components/ui/Primitives.jsx';
import { Icon360, TryOnIcon } from '../components/ui/Icons.jsx';
import { useUI } from '../context/UIContext.jsx';
import { BEST_SELLERS, CATEGORIES, COLLECTIONS, FEATURED, NEW_ARRIVALS, PRODUCTS, TRENDING } from '../data/products.js';
import { banner, CATEGORY_MEDIA, COLLECTION_MEDIA } from '../data/media.js';
import { GOLD_RATES, RATES_UPDATED } from '../utils/price.js';
import { formatINR, formatNumber } from '../utils/format.js';

const countBy = (key, value) => PRODUCTS.filter((p) => p[key] === value).length;

const AVG_RATING = PRODUCTS.reduce((s, p) => s + p.rating, 0) / PRODUCTS.length;
const TOTAL_REVIEWS = PRODUCTS.reduce((s, p) => s + p.reviewCount, 0);

const TESTIMONIALS = [
  {
    name: 'Ananya Rao',
    city: 'Bengaluru',
    rating: 5,
    product: 'Lumière Solitaire Ring',
    text: 'I turned the ring around in 3D for a week before proposing. When it arrived it was even more brilliant than on screen — she said yes in a heartbeat.',
  },
  {
    name: 'Meera Kapoor',
    city: 'Mumbai',
    rating: 5,
    product: 'Meenakshi Jhumkas',
    text: 'The live try-on showed me exactly how they would frame my face. Wore them through a three-day wedding without a hint of discomfort.',
  },
  {
    name: 'Rohan Sharma',
    city: 'Delhi',
    rating: 4.5,
    product: 'Maharani Kada',
    text: 'The price breakdown was completely transparent — gold rate, making, GST, all of it. Rare to find that kind of honesty in fine jewellery.',
  },
  {
    name: 'Isha Pillai',
    city: 'Kochi',
    rating: 5,
    product: 'Akoya Pearl Strand',
    text: 'Packaged like an heirloom and delivered a day early. The lustre on these pearls is unreal. My new everyday indulgence.',
  },
];

/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section className="relative overflow-hidden bg-noir text-ivory">
      <div className="grid lg:min-h-[88vh] lg:grid-cols-[1.05fr_1fr]">
        {/* Image — first on mobile, right on desktop */}
        <div className="relative order-1 aspect-[4/3] overflow-hidden sm:aspect-[16/10] lg:order-2 lg:aspect-auto">
          <motion.img
            src={banner('showcase-noir')}
            alt="Lumière Bridal diamond jewellery"
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ scale: 1.12, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.8, ease: EASE }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-noir via-transparent to-transparent lg:bg-gradient-to-r lg:from-noir lg:via-transparent lg:via-35%" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1, ease: EASE }}
            className="absolute right-5 bottom-5 hidden border border-white/15 bg-noir/50 px-5 py-4 backdrop-blur-md sm:block lg:right-10 lg:bottom-10"
          >
            <p className="text-[10px] font-semibold tracking-[0.28em] text-gold-light uppercase">Lumière Bridal</p>
            <p className="mt-1 font-display text-xl font-light">Diamonds of exceptional fire</p>
            <Link to="/shop?collection=bridal" className="mt-2 inline-flex items-center gap-1.5 text-[11px] tracking-[0.18em] text-ivory/80 uppercase transition hover:text-ivory">
              Discover <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>
        </div>

        {/* Copy */}
        <div className="grain relative order-2 flex items-center lg:order-1">
          <div className="w-full px-4 pt-8 pb-16 sm:px-6 sm:pb-20 lg:py-24 lg:pr-16 lg:pl-[max(2.5rem,calc((100vw_-_1440px)/2_+_2.5rem))]">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
              className="eyebrow text-gold-light"
            >
              Fine jewellery · Handcrafted in Jaipur
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.35, ease: EASE }}
              className="mt-6 text-[3.4rem] leading-[0.95] font-light sm:text-7xl lg:text-[6.2rem]"
            >
              Crafted to be <em className="gold-text pr-2 font-normal">treasured</em>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.55, ease: EASE }}
              className="mt-7 max-w-md text-[15px] leading-relaxed text-ivory/70"
            >
              Hallmarked gold, certified diamonds and rare gemstones — shaped by master karigars into pieces you can turn in 3D and try on live before
              they are yours.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7, ease: EASE }}
              className="mt-10 flex flex-col gap-3 sm:flex-row"
            >
              <Link to="/shop" className="btn-gold">
                Shop the collection <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/try-on" className="btn-ghost-light">
                <TryOnIcon className="h-4 w-4" /> Try it on live
              </Link>
            </motion.div>
            <motion.dl
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 1 }}
              className="mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-8"
            >
              {[
                ['1987', 'Established'],
                [AVG_RATING.toFixed(1), 'Average rating'],
                ['100%', 'BIS hallmarked'],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="font-display text-3xl font-light text-gold-light sm:text-4xl">{value}</dt>
                  <dd className="mt-1 text-[10px] tracking-[0.18em] text-ivory/55 uppercase">{label}</dd>
                </div>
              ))}
            </motion.dl>
          </div>
        </div>
      </div>
    </section>
  );
}

function ShopByCategory() {
  return (
    <section className="container-luxe py-20 sm:py-28">
      <SectionHeading eyebrow="Shop by category" title="Find your signature" subtitle="From everyday gold to once-in-a-lifetime diamonds — begin with what speaks to you." />
      <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
        {CATEGORIES.map((c, i) => (
          <Reveal key={c.id} delay={i * 0.08} className={i === 0 ? 'col-span-2 sm:col-span-1' : ''}>
            <Link to={`/category/${c.id}`} className="group relative block overflow-hidden bg-cream">
              <div className={`relative ${i === 0 ? 'aspect-[16/10] sm:aspect-[3/4]' : 'aspect-[3/4]'}`}>
                <img
                  src={CATEGORY_MEDIA[c.id]?.tile}
                  alt={c.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.6s] ease-[var(--ease-luxe)] group-hover:scale-[1.07]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir/75 via-noir/5 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-ivory sm:p-5">
                  <h3 className="text-2xl font-light sm:text-3xl">{c.name}</h3>
                  <p className="mt-1 flex items-center justify-between text-[10px] tracking-[0.2em] text-ivory/75 uppercase">
                    {countBy('category', c.id)} pieces
                    <ArrowUpRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100" />
                  </p>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ViewAll({ to, children = 'View all' }) {
  return (
    <Link to={to} className="group inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase">
      <span className="link-underline">{children}</span>
      <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
    </Link>
  );
}

function ProductSection({ eyebrow, title, subtitle, products, to, linkLabel, className = '' }) {
  if (!products.length) return null;
  return (
    <section className={`py-20 sm:py-24 ${className}`}>
      <div className="container-luxe">
        <SectionHeading align="left" eyebrow={eyebrow} title={title} subtitle={subtitle} action={<ViewAll to={to}>{linkLabel}</ViewAll>} />
        <ProductGrid products={products} className="mt-12" />
      </div>
    </section>
  );
}

function Collections() {
  return (
    <section className="bg-cream py-20 sm:py-28">
      <div className="container-luxe">
        <SectionHeading eyebrow="Our collections" title="Four worlds of Aurelia" subtitle="Each collection tells its own story — of vows, of heritage, of daily rituals and of colour." />
        <div className="mt-14 grid gap-4 sm:gap-6 md:grid-cols-2">
          {COLLECTIONS.map((c, i) => (
            <Reveal key={c.id} delay={(i % 2) * 0.1}>
              <Link to={`/shop?collection=${c.id}`} className="group relative block aspect-[4/3] overflow-hidden bg-noir lg:aspect-[16/11]">
                <img
                  src={COLLECTION_MEDIA[c.id]}
                  alt={c.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-[1.8s] ease-[var(--ease-luxe)] group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir/85 via-noir/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-6 text-ivory sm:p-9">
                  <div className="max-w-sm">
                    <p className="text-[10px] font-semibold tracking-[0.28em] text-gold-light uppercase">
                      {String(i + 1).padStart(2, '0')} · {countBy('collection', c.id)} pieces
                    </p>
                    <h3 className="mt-2 text-3xl font-light sm:text-4xl">{c.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ivory/70">{c.description}</p>
                  </div>
                  <span className="hidden h-12 w-12 shrink-0 place-items-center rounded-full border border-ivory/40 transition-all duration-500 group-hover:border-gold-light group-hover:bg-gold-light group-hover:text-ink sm:grid">
                    <ArrowUpRight className="h-5 w-5" strokeWidth={1.4} />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Showcase3D() {
  const { open3D } = useUI();
  return (
    <section className="grain relative overflow-hidden bg-noir text-ivory">
      <div className="container-luxe grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-2 lg:gap-20">
        <Reveal className="relative order-2 lg:order-1">
          <div className="relative aspect-square overflow-hidden">
            <img src={banner('collection-heritage')} alt="Heritage jewellery rendered in 3D" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,var(--color-noir)_100%)]" />
          </div>
          <motion.div
            className="pointer-events-none absolute inset-[11%] rounded-full border border-gold-light/25"
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          >
            <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-gold-light" />
          </motion.div>
        </Reveal>
        <div className="order-1 lg:order-2">
          <SectionHeading
            light
            align="left"
            eyebrow="3D jewellery showcase"
            title={
              <>
                Hold it in your hands, <em className="text-gold-light">before</em> it’s yours
              </>
            }
            subtitle="Every Aurelia piece is modelled in true-to-life 3D. Rotate it through 360°, zoom into the setting, and watch the light play across gold and stone — right in your browser."
          />
          <Reveal delay={0.15}>
            <ul className="mt-8 space-y-3 text-sm text-ivory/75">
              {['Rotate a full 360° with a swipe or drag', 'Zoom into prongs, pavé and hand-engraving', 'Studio lighting tuned for gold and diamonds'].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-gold-light" strokeWidth={1.6} /> {t}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => open3D('emerald-ring')} className="btn-gold">
                <Icon360 className="h-4 w-4" /> Explore in 3D
              </button>
              <Link to="/shop?feature=3d" className="btn-ghost-light">
                Browse all pieces
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function TryOnPromo() {
  const { openTryOn } = useUI();
  const steps = [
    { icon: Camera, title: 'Allow your camera', text: 'Runs privately in your browser.' },
    { icon: ScanFace, title: 'Pick a piece', text: 'Earrings, necklaces, rings and more.' },
    { icon: Sparkles, title: 'See it on you', text: 'Move freely — it follows you live.' },
  ];
  return (
    <section className="container-luxe py-20 sm:py-28">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <SectionHeading
            align="left"
            eyebrow="Virtual try-on"
            title={
              <>
                See it on you, <em className="text-gold-dark">live</em>
              </>
            }
            subtitle="Our live camera try-on places each piece on you in real time — so you can see how jhumkas frame your face or how a pendant sits, before you ever step into a boutique."
          />
          <Reveal delay={0.1}>
            <ol className="mt-10 grid gap-6 sm:grid-cols-3">
              {steps.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="border-t border-line pt-5">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-gold-dark" strokeWidth={1.3} />
                    <span className="text-[10px] font-semibold tracking-[0.2em] text-mist">0{i + 1}</span>
                  </div>
                  <p className="mt-3 text-[12px] font-semibold tracking-[0.14em] uppercase">{title}</p>
                  <p className="mt-1 text-sm text-stone">{text}</p>
                </li>
              ))}
            </ol>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link to="/try-on" className="btn-primary">
                <TryOnIcon className="h-4 w-4" /> Start live try-on
              </Link>
              <button type="button" onClick={() => openTryOn('traditional-earrings')} className="btn-outline">
                Try the Meenakshi Jhumkas
              </button>
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.1} className="relative">
          <div className="relative aspect-[4/5] overflow-hidden bg-cream sm:aspect-[5/4] lg:aspect-[4/5]">
            <img src={banner('tryon-promo')} alt="Virtual try-on of gold earrings" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          </div>
          <div className="absolute top-5 left-5 flex items-center gap-2 bg-ivory/90 px-3 py-2 backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ruby opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-ruby" />
            </span>
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">Live</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function PricePromo() {
  return (
    <section className="border-y border-line bg-cream/60">
      <div className="container-luxe grid items-center gap-12 py-20 sm:py-24 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div>
          <SectionHeading
            align="left"
            eyebrow="Transparent pricing"
            title="Priced to the gram, never a mystery"
            subtitle="See exactly what you pay for — today’s gold rate, weight, making charges, stones and GST. Estimate any design with our gold price calculator."
          />
          <Reveal delay={0.1} className="mt-10">
            <Link to="/price-calculator" className="btn-primary">
              <Calculator className="h-4 w-4" /> Open price calculator
            </Link>
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <div className="border border-line bg-white/70">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-6 py-4">
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase">Today’s gold rate</p>
              <p className="text-[11px] text-stone">Updated {RATES_UPDATED}</p>
            </div>
            <div className="grid divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {['24K', '22K', '18K'].map((k) => (
                <div key={k} className="flex items-baseline justify-between px-6 py-6 sm:block">
                  <p className="font-display text-3xl font-light text-gold-dark">{k}</p>
                  <div className="sm:mt-3">
                    <p className="text-xl font-semibold tracking-tight tabular-nums">{formatINR(GOLD_RATES[k])}</p>
                    <p className="text-right text-[10px] tracking-[0.16em] text-mist uppercase sm:text-left">per gram</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 text-xs text-mist">Indicative rates for illustration. Final price is locked at checkout.</p>
        </Reveal>
      </div>
    </section>
  );
}

function Reviews() {
  return (
    <section className="container-luxe py-20 sm:py-28">
      <SectionHeading
        eyebrow="Loved across India"
        title="Words from our patrons"
        subtitle={`Rated ${AVG_RATING.toFixed(1)} out of 5 across ${formatNumber(TOTAL_REVIEWS)} verified reviews.`}
      />
      <div className="mt-14 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {TESTIMONIALS.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.08} className="h-full">
            <figure className="card-surface flex h-full flex-col p-7">
              <Quote className="h-7 w-7 text-champagne" strokeWidth={1.2} />
              <Stars value={t.rating} className="mt-5" />
              <blockquote className="mt-4 flex-1 font-display text-xl leading-snug font-light text-ink">“{t.text}”</blockquote>
              <figcaption className="mt-6 border-t border-line pt-5">
                <p className="text-[12px] font-semibold tracking-[0.14em] uppercase">{t.name}</p>
                <p className="mt-1 text-xs text-stone">
                  {t.city} · {t.product}
                </p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function BrandStory() {
  return (
    <section className="bg-noir text-ivory">
      <div className="grid lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden lg:aspect-auto lg:min-h-[640px]">
          <img src={banner('about-atelier')} alt="The Aurelia atelier" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div className="flex items-center px-4 py-20 sm:px-10 lg:px-20">
          <Reveal className="max-w-lg">
            <p className="eyebrow text-gold-light">Our story</p>
            <h2 className="mt-5 text-4xl leading-[1.05] font-light sm:text-5xl">
              Four decades of <em className="text-gold-light">quiet</em> mastery
            </h2>
            <div className="gold-rule my-8 w-24" />
            <p className="text-[15px] leading-relaxed text-ivory/70">
              Aurelia began in 1987 as a single workbench in Jaipur’s Johari Bazaar. Today our karigars still hand-set every stone and hand-finish every
              surface — the same patience, now paired with technology that lets you explore each piece in 3D and on your own skin.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-ivory/70">
              Every gram is BIS hallmarked, every diamond certified, and every piece backed by lifetime exchange.
            </p>
            <Link to="/about" className="btn-ghost-light mt-10">
              Read our story <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Newsletter() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setDone(true);
  };

  return (
    <section className="container-luxe py-20 sm:py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">The Aurelia letter</p>
        <h2 className="mt-4 text-4xl leading-[1.05] font-light sm:text-5xl">First to see, first to wear</h2>
        <p className="mt-5 text-[15px] leading-relaxed text-stone">
          Private previews of new collections, gold-rate alerts and invitations to atelier events. A few letters a month, never more.
        </p>
        <div className="mt-10 min-h-[120px]">
          <AnimatePresence mode="wait" initial={false}>
            {done ? (
              <motion.div
                key="thanks"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
                className="flex flex-col items-center"
                role="status"
              >
                <span className="grid h-12 w-12 place-items-center rounded-full bg-gold-light/40 text-gold-dark">
                  <Check className="h-5 w-5" />
                </span>
                <p className="mt-4 font-display text-2xl font-light">Thank you for joining us</p>
                <p className="mt-1 text-sm text-stone">
                  We’ll write to <span className="text-ink">{email}</span> soon.
                </p>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={submit} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-3 sm:flex-row">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="input-luxe flex-1 py-3.5"
                  autoComplete="email"
                />
                <button type="submit" className="btn-primary">
                  Subscribe
                </button>
              </motion.form>
            )}
          </AnimatePresence>
          {!done && <p className="mt-4 text-xs text-mist">By subscribing you agree to receive emails from Aurelia. Unsubscribe anytime.</p>}
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export default function Home() {
  return (
    <>
      <Hero />
      <TrustBar />
      <ShopByCategory />
      <ProductSection
        eyebrow="Featured jewellery"
        title="The Aurelia edit"
        subtitle="Signature pieces chosen by our atelier this season."
        products={FEATURED.slice(0, 8)}
        to="/shop"
        linkLabel="Shop all"
        className="border-t border-line"
      />
      <Collections />
      <ProductSection eyebrow="Just arrived" title="New arrivals" products={NEW_ARRIVALS.slice(0, 4)} to="/new-arrivals" />
      <Showcase3D />
      <ProductSection eyebrow="Most loved" title="Best sellers" products={BEST_SELLERS.slice(0, 4)} to="/best-sellers" />
      <TryOnPromo />
      <ProductSection eyebrow="Trending now" title="What everyone’s wearing" products={TRENDING.slice(0, 4)} to="/shop?sort=rating" className="bg-cream" />
      <PricePromo />
      <Reviews />
      <BrandStory />
      <Newsletter />
    </>
  );
}
