const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const inrNum = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

export const formatINR = (value) => inr.format(Math.round(value || 0));
export const formatNumber = (value) => inrNum.format(Math.round(value || 0));

export const formatDate = (date, opts = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  new Date(date).toLocaleDateString('en-IN', opts);

/** Estimated delivery date skipping Sundays. */
export function deliveryDate(daysAhead = 4) {
  const d = new Date();
  let added = 0;
  while (added < daysAhead) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) added++;
  }
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

export const pluralize = (n, word, plural = `${word}s`) => `${n} ${n === 1 ? word : plural}`;

export const classNames = (...xs) => xs.filter(Boolean).join(' ');
