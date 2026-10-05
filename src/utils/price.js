/**
 * Jewellery pricing — the same formula powers the price calculator,
 * product prices and the price breakdown on product pages.
 *
 *   Gold value     = gold rate × gold weight
 *   Making charge  = gold value × making %
 *   Subtotal       = gold value + making + stone cost + other charges
 *   Tax            = subtotal × tax %
 *   Final price    = subtotal + tax
 */

/** Mock indicative gold rates in ₹ per gram (no live API — frontend only). */
export const GOLD_RATES = {
  '24K': 12480,
  '22K': 11440,
  '18K': 9360,
};

export const RATES_UPDATED = '05 Oct 2026, 10:30 AM IST';

export const PURITY_INFO = {
  '24K': { fineness: '999', percent: 99.9, note: 'Pure gold — rich colour, softest. Ideal for coins and chains.' },
  '22K': { fineness: '916', percent: 91.6, note: 'The classic for Indian heirloom and bridal jewellery.' },
  '18K': { fineness: '750', percent: 75.0, note: 'Strong enough to hold diamonds and gemstones securely.' },
};

export const GST_RATE = 3;

export function calculatePrice({ goldRate = 0, goldWeight = 0, makingPct = 0, stoneCost = 0, otherCharges = 0, taxPct = GST_RATE }) {
  const num = (v) => (Number.isFinite(+v) ? Math.max(0, +v) : 0);
  const goldValue = num(goldRate) * num(goldWeight);
  const making = goldValue * (num(makingPct) / 100);
  const stone = num(stoneCost);
  const other = num(otherCharges);
  const subtotal = goldValue + making + stone + other;
  const tax = subtotal * (num(taxPct) / 100);
  return { goldValue, making, stone, other, subtotal, tax, total: subtotal + tax };
}

/** Full price breakdown of a catalogue product (with any making-charge offer applied). */
export function productPricing(p) {
  const base = {
    goldRate: GOLD_RATES[p.purity],
    goldWeight: p.goldWeight,
    makingPct: p.makingPct,
    stoneCost: p.stoneCost,
    otherCharges: p.otherCharges,
    taxPct: GST_RATE,
  };
  const full = calculatePrice(base);
  const offer = calculatePrice({ ...base, makingPct: p.makingPct * (1 - (p.makingDiscount ?? 0) / 100) });
  const price = Math.round(offer.total);
  const mrp = Math.round(full.total);
  return {
    ...offer,
    price,
    mrp,
    savings: mrp - price,
    discountPct: mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0,
    makingSaved: full.making - offer.making,
  };
}
