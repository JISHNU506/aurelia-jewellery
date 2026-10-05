import { PRODUCTS } from '../data/products.js';

const normalize = (s) =>
  String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9.\s]/g, ' ');

const SYNONYMS = {
  jhumka: ['jhumki', 'traditional earrings'],
  kada: ['bangle'],
  chain: ['necklace'],
  pendant: ['necklace'],
  studs: ['stud', 'earrings'],
  hoop: ['hoops'],
  engagement: ['solitaire', 'proposal'],
  wedding: ['band'],
  diamond: ['diamonds'],
};

function stem(token) {
  if (token.length > 4 && token.endsWith('es') && !token.endsWith('ses')) return token.slice(0, -2);
  if (token.length > 3 && token.endsWith('s')) return token.slice(0, -1);
  return token;
}

function haystack(p) {
  return normalize(
    [
      p.name, p.type, p.category, p.collection, p.metal, `${p.purity} gold`, p.purity, p.shortDescription,
      p.gemstone?.type, p.diamond ? 'diamond' : '', ...(p.tags ?? []),
    ].join(' '),
  );
}

const INDEX = PRODUCTS.map((p) => ({ p, text: haystack(p), name: normalize(`${p.name} ${p.type}`) }));

/** Instant search: every query word must match; name matches rank higher. */
export function searchProducts(query, limit = Infinity) {
  const tokens = normalize(query).split(/\s+/).filter(Boolean).map(stem);
  if (!tokens.length) return [];
  const results = [];
  for (const { p, text, name } of INDEX) {
    let score = 0;
    let ok = true;
    for (const t of tokens) {
      const alts = [t, ...(SYNONYMS[t] ?? [])];
      const hit = alts.some((a) => text.includes(a));
      if (!hit) {
        ok = false;
        break;
      }
      score += name.includes(t) ? 3 : 1;
      if (normalize(p.category).startsWith(t)) score += 2;
    }
    if (ok) results.push({ p, score: score + p.rating / 10 });
  }
  return results.sort((a, b) => b.score - a.score).slice(0, limit).map((r) => r.p);
}

export const SEARCH_SUGGESTIONS = ['diamond ring', 'gold necklace', 'pearl earrings', 'bracelet', '22k gold', 'jhumka', 'emerald', 'tennis bracelet'];
