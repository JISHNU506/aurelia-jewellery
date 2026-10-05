import { Link } from 'react-router-dom';
import { Award, Gem, RefreshCw, ShieldCheck, Truck } from 'lucide-react';
import { CATEGORIES } from '../data/products.js';
import { FacebookIcon, InstagramIcon, Logo, PinterestIcon, YoutubeIcon } from './ui/Icons.jsx';

const TRUST = [
  { icon: ShieldCheck, title: 'BIS Hallmarked', text: 'Every gram certified' },
  { icon: Gem, title: 'IGI Certified', text: 'Natural diamonds only' },
  { icon: RefreshCw, title: 'Lifetime Exchange', text: 'At prevailing gold rate' },
  { icon: Truck, title: 'Insured Shipping', text: 'Free across India' },
  { icon: Award, title: '30-Day Returns', text: 'No questions asked' },
];

export function TrustBar({ dark = false }) {
  return (
    <div className={`border-y ${dark ? 'border-white/10 bg-noir text-ivory' : 'border-line bg-cream/60'}`}>
      <div className="container-luxe grid grid-cols-2 gap-y-6 py-8 sm:grid-cols-3 lg:grid-cols-5">
        {TRUST.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-center gap-3">
            <Icon className={`h-7 w-7 shrink-0 ${dark ? 'text-gold-light' : 'text-gold-dark'}`} strokeWidth={1.1} />
            <div>
              <p className="text-[11px] font-semibold tracking-[0.16em] uppercase">{title}</p>
              <p className={`text-xs ${dark ? 'text-ivory/60' : 'text-stone'}`}>{text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const COLUMNS = [
  {
    title: 'Shop',
    links: [...CATEGORIES.map((c) => [`/category/${c.id}`, c.name]), ['/new-arrivals', 'New Arrivals'], ['/best-sellers', 'Best Sellers']],
  },
  {
    title: 'Experience',
    links: [
      ['/try-on', 'Virtual Try-On'],
      ['/shop?feature=3d', '3D Jewellery Viewer'],
      ['/price-calculator', 'Gold Price Calculator'],
      ['/wishlist', 'Wishlist'],
      ['/cart', 'Shopping Bag'],
    ],
  },
  {
    title: 'Maison',
    links: [
      ['/about', 'Our Story'],
      ['/about#craft', 'Craftsmanship'],
      ['/contact', 'Boutiques'],
      ['/contact#faq', 'FAQs'],
      ['/contact', 'Contact Us'],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-noir text-ivory">
      <div className="container-luxe grid gap-12 py-16 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-4">
          <Logo light />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-ivory/60">
            Since 1987, Aurelia has crafted fine jewellery in Jaipur and Mumbai — pairing heirloom techniques with the precision of modern design.
          </p>
          <div className="mt-8 flex gap-2">
            {[InstagramIcon, FacebookIcon, PinterestIcon, YoutubeIcon].map((Icon, i) => (
              <a key={i} href="#" onClick={(e) => e.preventDefault()} aria-label="Social link" className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-ivory/80 transition hover:border-gold-light hover:text-gold-light">
                <Icon />
              </a>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-5">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="mb-5 text-[10.5px] font-semibold tracking-[0.3em] text-gold-light uppercase">{col.title}</p>
              <ul className="space-y-3 text-sm text-ivory/65">
                {col.links.map(([to, label]) => (
                  <li key={label}>
                    <Link to={to} className="link-underline transition hover:text-ivory">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="lg:col-span-3">
          <p className="mb-5 text-[10.5px] font-semibold tracking-[0.3em] text-gold-light uppercase">Client Care</p>
          <ul className="space-y-3 text-sm text-ivory/65">
            <li>+91 22 4000 1987</li>
            <li>care@aurelia.example</li>
            <li>Mon – Sun · 10am – 9pm IST</li>
          </ul>
          <p className="mt-8 text-[10.5px] font-semibold tracking-[0.3em] text-gold-light uppercase">We accept</p>
          <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold tracking-wider text-ivory/70">
            {['VISA', 'MASTERCARD', 'RUPAY', 'UPI', 'AMEX', 'EMI'].map((m) => (
              <span key={m} className="border border-white/15 px-2 py-1">
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-luxe flex flex-col gap-2 py-6 text-[11px] tracking-wide text-ivory/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Aurelia Fine Jewellery. A frontend demonstration store — no real orders or payments are processed.</p>
          <p>Prices include 3% GST · Gold rates shown are indicative.</p>
        </div>
      </div>
    </footer>
  );
}
