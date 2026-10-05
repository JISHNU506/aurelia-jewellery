/* Deterministic mock reviews so every product page has believable feedback. */

const NAMES = [
  'Ananya R.', 'Meera K.', 'Rohan S.', 'Isha P.', 'Kavya N.', 'Arjun M.', 'Diya T.', 'Nikhil V.', 'Sana Q.', 'Priya D.',
  'Aditi G.', 'Vikram J.', 'Tara L.', 'Neha B.', 'Karan A.', 'Ira W.', 'Riya C.', 'Dev H.', 'Zoya F.', 'Mira E.',
];
const CITIES = ['Mumbai', 'Bengaluru', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Jaipur', 'Kochi', 'Ahmedabad'];

const GENERIC = [
  { title: 'Even better in person', text: 'The photos are lovely but they don’t capture the sparkle. The finishing is flawless and it arrived beautifully packaged.' },
  { title: 'Worth every rupee', text: 'I compared prices across several jewellers and the transparent price breakdown sold me. Quality is outstanding.' },
  { title: 'The 3D view helped me decide', text: 'Being able to rotate the piece and see it from every angle made me confident ordering online. It looks exactly the same.' },
  { title: 'Tried it on virtually first', text: 'The try-on feature gave me a real sense of the size. When it arrived it was exactly as I imagined.' },
  { title: 'Gifted it to my mother', text: 'She hasn’t taken it off since. The certificate and hallmark details gave us complete peace of mind.' },
  { title: 'Impeccable service', text: 'Delivered a day early, fully insured, and the concierge called to confirm the size. A truly luxurious experience.' },
];

const BY_CATEGORY = {
  rings: [
    { title: 'She said yes!', text: 'Proposed last weekend — the stone catches light from across the room. Resizing was quick and free.' },
    { title: 'Comfortable all day', text: 'The band sits beautifully and the comfort fit means I forget I’m wearing it, until someone compliments it.' },
  ],
  necklaces: [
    { title: 'Sits perfectly', text: 'The length is just right and the clasp feels very secure. It layers well with my everyday chains.' },
    { title: 'Heirloom quality', text: 'The craftsmanship is extraordinary — you can see the hours of handwork in every detail.' },
  ],
  earrings: [
    { title: 'Light and comfortable', text: 'I was worried they would be heavy, but I wore them through an entire wedding without any discomfort.' },
    { title: 'So much sparkle', text: 'They catch the light with every turn of the head. My most complimented pair by far.' },
  ],
  bracelets: [
    { title: 'Beautiful drape', text: 'The links move so fluidly on the wrist and the clasp is easy to fasten on my own.' },
    { title: 'Perfect for stacking', text: 'Looks gorgeous alone and even better stacked with my watch.' },
  ],
  bangles: [
    { title: 'Royal and timeless', text: 'Wore it for my sister’s wedding and everyone asked where it was from. The gold colour is so rich.' },
    { title: 'Great fit', text: 'Used the size guide and it fits perfectly. Solid, well made and beautifully finished.' },
  ],
};

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function buildReviews(p) {
  let seed = hash(p.id);
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const pool = [...(BY_CATEGORY[p.category] ?? []), ...GENERIC];
  const count = 4 + Math.floor(rnd() * 2);
  const used = new Set();
  const out = [];
  for (let i = 0; i < count; i++) {
    let k = Math.floor(rnd() * pool.length);
    while (used.has(k)) k = (k + 1) % pool.length;
    used.add(k);
    const rating = rnd() < p.rating - 4 + 0.15 ? 5 : 4;
    const daysAgo = Math.floor(4 + rnd() * 160);
    const d = new Date('2026-10-05');
    d.setDate(d.getDate() - daysAgo);
    out.push({
      id: `${p.id}-r${i}`,
      name: NAMES[Math.floor(rnd() * NAMES.length)],
      city: CITIES[Math.floor(rnd() * CITIES.length)],
      rating,
      date: d.toISOString().slice(0, 10),
      verified: rnd() > 0.15,
      helpful: Math.floor(rnd() * 40),
      ...pool[k],
    });
  }
  return out;
}

/** Star distribution (5 → 1) that is consistent with the average rating. */
export function ratingDistribution(rating, total) {
  const five = Math.min(0.95, Math.max(0.4, (rating - 4) * 0.95 + 0.06));
  const four = Math.max(0.03, 1 - five - 0.06);
  const parts = [five, four, 0.035, 0.015, 0.01];
  const sum = parts.reduce((a, b) => a + b, 0);
  return parts.map((x, i) => ({ stars: 5 - i, count: Math.round((x / sum) * total) }));
}
