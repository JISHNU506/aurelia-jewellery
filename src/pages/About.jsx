import { Link } from 'react-router-dom';
import { ArrowRight, Gem, HandHeart, Leaf, Scale } from 'lucide-react';
import { PageHero, Reveal, SectionHeading } from '../components/ui/Primitives.jsx';
import { banner, COLLECTION_MEDIA } from '../data/media.js';
import { getProduct } from '../data/products.js';

// Editorial banners may not be generated yet — fall back to product photography.
const img = (src, productId, i = 0) => src ?? getProduct(productId)?.images[i];

const STATS = [
  { value: 'Est. 1987', label: 'Three generations of jewellers' },
  { value: '120+', label: 'Master karigars in our atelier' },
  { value: '40,000+', label: 'Clients across India & abroad' },
  { value: '100%', label: 'BIS hallmarked gold' },
];

const PROCESS = [
  { title: 'Design', text: 'Every piece begins as a hand sketch, refined into a precise 3D model so proportions are perfect before any gold is poured.' },
  { title: 'Casting', text: 'Recycled and responsibly sourced gold is alloyed in-house to exact purity, then lost-wax cast for crisp, flawless detail.' },
  { title: 'Setting', text: 'Under magnification, our setters seat each diamond and gemstone by hand — claw, bezel, pavé or channel.' },
  { title: 'Polishing', text: 'Pieces pass through five stages of finishing, from coarse filing to a mirror polish that makes gold glow.' },
  { title: 'Certification', text: 'Gold is BIS hallmarked and diamonds IGI certified. Only then does a piece earn the Aurelia name.' },
];

const VALUES = [
  { icon: Gem, title: 'Uncompromising quality', text: 'Natural, conflict-free diamonds and gemstones selected one by one for fire and colour.' },
  { icon: Scale, title: 'Radical transparency', text: 'A full price breakdown on every piece — gold value, making, stones and tax. No hidden mark-ups.' },
  { icon: Leaf, title: 'Responsible sourcing', text: 'Recycled gold, Kimberley Process diamonds and traceable gemstones from audited partners.' },
  { icon: HandHeart, title: 'Made to be passed on', text: 'Lifetime exchange, free cleaning and repairs — because heirlooms deserve lifelong care.' },
];

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="Our story"
        title="Crafted in light since 1987"
        subtitle="From a single workbench in Jaipur to an atelier of master karigars — Aurelia has always believed fine jewellery should be honest, beautiful and made to last generations."
        image={banner('about-atelier')}
      />

      {/* Story */}
      <section className="container-luxe py-20 sm:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal className="relative">
            <div className="aspect-[4/5] overflow-hidden bg-cream">
              <img src={img(COLLECTION_MEDIA.heritage, 'traditional-necklace')} alt="Heritage gold jewellery from the Aurelia atelier" className="h-full w-full object-cover" />
            </div>
            <div className="absolute -right-4 -bottom-6 hidden w-44 border-8 border-ivory bg-cream sm:block lg:-right-10">
              <img src={img(null, 'gold-bangle', 1)} alt="" className="aspect-square w-full object-cover" />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="eyebrow">The beginning</p>
            <h2 className="mt-4 text-4xl leading-[1.08] font-light sm:text-5xl">A family workshop, a lifelong promise</h2>
            <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-stone">
              <p>
                In 1987, master goldsmith Raghunath Varma opened a small workshop in Jaipur’s Johari Bazaar with a simple promise: every piece would be made as
                though it were for his own family.
              </p>
              <p>
                Three generations later, that promise remains. Our karigars still hand-finish every piece, now alongside designers who use 3D modelling to
                perfect each proportion — and technology that lets you rotate, zoom and even try on a piece before it is made for you.
              </p>
              <p className="font-display text-2xl leading-snug text-ink italic">“Gold remembers the hands that shaped it.”</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-noir text-ivory">
        <div className="container-luxe grid grid-cols-2 gap-y-10 py-16 sm:py-20 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className="px-2 text-center">
              <p className="gold-text font-display text-4xl font-light sm:text-5xl lg:text-6xl">{s.value}</p>
              <p className="mt-3 text-[11px] tracking-[0.18em] text-ivory/60 uppercase">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Craft */}
      <section id="craft" className="container-luxe scroll-mt-20 py-20 sm:py-28">
        <SectionHeading
          eyebrow="The craft"
          title="From sketch to heirloom"
          subtitle="Each Aurelia piece passes through more than forty pairs of hands over two to six weeks. Here is how it comes to life."
        />
        <ol className="mt-14 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
          {PROCESS.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 0.08} className="flex flex-col bg-ivory p-6 sm:p-7">
              <span className="font-display text-5xl font-light text-champagne">0{i + 1}</span>
              <h3 className="mt-4 text-2xl">{s.title}</h3>
              <p className="mt-3 text-[13.5px] leading-relaxed text-stone">{s.text}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* Image banners */}
      <section className="grid md:grid-cols-2">
        {[
          { src: img(COLLECTION_MEDIA.bridal, 'diamond-solitaire-ring'), eyebrow: 'Lumière Bridal', title: 'For the moments that last forever', to: '/shop?collection=bridal' },
          { src: img(COLLECTION_MEDIA.everyday, 'chain-bracelet'), eyebrow: 'Everyday Luxe', title: 'Fine jewellery, made to be worn', to: '/shop?collection=everyday' },
        ].map((b) => (
          <Link key={b.eyebrow} to={b.to} className="group relative block aspect-[4/3] overflow-hidden bg-noir md:aspect-[5/4]">
            <img src={b.src} alt="" className="absolute inset-0 h-full w-full object-cover opacity-85 transition duration-[1.6s] group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-noir/80 via-noir/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-ivory sm:p-10">
              <p className="eyebrow text-gold-light">{b.eyebrow}</p>
              <h3 className="mt-2 max-w-sm text-3xl leading-tight font-light sm:text-4xl">{b.title}</h3>
              <span className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase">
                Explore <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </section>

      {/* Values */}
      <section className="container-luxe py-20 sm:py-28">
        <SectionHeading eyebrow="What we stand for" title="Our values" />
        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.08} className="text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-line text-gold-dark">
                <Icon className="h-6 w-6" strokeWidth={1.3} />
              </span>
              <h3 className="mt-5 text-2xl">{title}</h3>
              <p className="mt-3 text-[13.5px] leading-relaxed text-stone">{text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-cream">
        {COLLECTION_MEDIA.gemstone && <img src={COLLECTION_MEDIA.gemstone} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />}
        <div className="container-luxe relative py-20 text-center sm:py-24">
          <Reveal>
            <p className="eyebrow">Visit the atelier</p>
            <h2 className="mx-auto mt-4 max-w-2xl text-4xl leading-tight font-light sm:text-5xl">See our karigars at work in Jaipur, or book a private consultation.</h2>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/contact" className="btn-primary">
                Book an appointment
              </Link>
              <Link to="/shop" className="btn-outline">
                Shop the collection
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
