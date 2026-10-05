import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PriceCalculator from '../components/PriceCalculator.jsx';
import { Accordion, Reveal, SectionHeading } from '../components/ui/Primitives.jsx';
import { GOLD_RATES, PURITY_INFO, RATES_UPDATED } from '../utils/price.js';
import { formatINR } from '../utils/format.js';

const FAQ = [
  { title: 'How is the price of gold jewellery calculated?', content: 'Price = gold rate × weight, plus making charges (a percentage of the gold value), plus the value of any diamonds or gemstones, plus other charges such as hallmarking. 3% GST is applied to the subtotal.' },
  { title: 'What is the difference between 24K, 22K and 18K?', content: '24K is 99.9% pure gold — rich in colour but soft. 22K (91.6%) is the classic choice for Indian jewellery. 18K (75%) is alloyed for strength, making it ideal for holding diamonds and gemstones.' },
  { title: 'Why do making charges vary?', content: 'Making charges reflect the craftsmanship involved. Machine-made chains may carry 8–12%, while hand-engraved temple pieces or diamond settings can be 18–25%.' },
  { title: 'Are these live gold rates?', content: 'No — this is a frontend demonstration, so rates are indicative mock values. In a production store they would come from a live rate feed.' },
];

export default function PriceCalculatorPage() {
  return (
    <>
      <section className="bg-cream">
        <div className="container-luxe py-14 sm:py-20">
          <Reveal className="max-w-2xl">
            <p className="eyebrow mb-4">Transparent pricing</p>
            <h1 className="text-5xl leading-[1.02] font-light sm:text-6xl lg:text-7xl">Jewellery price calculator</h1>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-stone">See exactly what you pay for — gold, craftsmanship, stones and tax — and how each one shapes the final price.</p>
          </Reveal>
          <div className="mt-10 grid grid-cols-3 gap-px border border-line bg-line">
            {Object.entries(GOLD_RATES).map(([k, rate]) => (
              <div key={k} className="bg-ivory p-4 sm:p-6">
                <p className="text-[10px] font-semibold tracking-[0.24em] text-stone uppercase">{k} · {PURITY_INFO[k].fineness}</p>
                <p className="mt-1 font-display text-2xl sm:text-4xl">{formatINR(rate)}<span className="text-sm text-stone">/g</span></p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-mist">Indicative rates · {RATES_UPDATED}</p>
        </div>
      </section>
      <section className="container-luxe py-14 sm:py-20">
        <PriceCalculator />
      </section>
      <section className="container-luxe grid gap-12 pb-20 lg:grid-cols-[1fr_1.4fr]">
        <SectionHeading align="left" eyebrow="Good to know" title="Understanding gold pricing" />
        <div>
          <Accordion items={FAQ} />
          <Link to="/shop" className="btn-primary mt-10">
            Shop with transparent prices <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
