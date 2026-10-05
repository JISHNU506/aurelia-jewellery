/**
 * 3D model specifications for every product, keyed by product id.
 * Plain data (no Vite-only imports) so it can be shared by the app and by
 * `scripts/generate-models.mjs`, which exports each spec as a .glb file.
 */
export const MODEL_SPECS = {
  // Rings
  'diamond-solitaire-ring': { kind: 'ring', style: 'setting', metal: 'white', stone: 'diamond', shape: 'round', size: 0.33, prongs: 6 },
  'gold-engagement-ring': { kind: 'ring', style: 'setting', metal: 'yellow', stone: 'diamond', shape: 'round', size: 0.27, prongs: 4, halo: true, pave: true },
  'emerald-ring': { kind: 'ring', style: 'setting', metal: 'yellow', stone: 'emerald', shape: 'emerald', size: 0.4, halo: true },
  'ruby-ring': { kind: 'ring', style: 'setting', metal: 'rose', stone: 'ruby', shape: 'oval', size: 0.34, prongs: 4, sideStones: true },
  'wedding-ring': { kind: 'ring', style: 'band', metal: 'yellow22', width: 0.24 },
  'sapphire-halo-ring': { kind: 'ring', style: 'setting', metal: 'white', stone: 'sapphire', shape: 'cushion', size: 0.32, prongs: 4, halo: true, pave: true },
  // Necklaces
  'gold-necklace': { kind: 'necklace', style: 'rope', metal: 'yellow22', thick: true },
  'diamond-pendant': { kind: 'necklace', style: 'halo-pendant', metal: 'white', size: 0.3 },
  'pearl-necklace': { kind: 'necklace', style: 'pearls', metal: 'yellow' },
  'traditional-necklace': { kind: 'necklace', style: 'temple', metal: 'yellow22' },
  'minimal-pendant': { kind: 'necklace', style: 'circle-pendant', metal: 'rose' },
  'pure-gold-chain': { kind: 'necklace', style: 'cable', metal: 'yellow24' },
  // Earrings
  'diamond-stud-earrings': { kind: 'earrings', style: 'stud', metal: 'white', size: 0.26 },
  'gold-hoop-earrings': { kind: 'earrings', style: 'hoop', metal: 'yellow22' },
  'pearl-earrings': { kind: 'earrings', style: 'pearl-drop', metal: 'yellow' },
  'drop-earrings': { kind: 'earrings', style: 'pear-drop', metal: 'white', stone: 'sapphire' },
  'traditional-earrings': { kind: 'earrings', style: 'jhumka', metal: 'yellow22' },
  // Bracelets
  'gold-bracelet': { kind: 'bracelet', style: 'chain', chain: 'curb', metal: 'yellow22' },
  'diamond-bracelet': { kind: 'bracelet', style: 'tennis', metal: 'white' },
  'chain-bracelet': { kind: 'bracelet', style: 'chain', chain: 'paperclip', metal: 'rose' },
  'charm-bracelet': { kind: 'bracelet', style: 'chain', chain: 'cable', charms: true, metal: 'yellow' },
  // Bangles
  'gold-bangle': { kind: 'bangle', style: 'polished', metal: 'yellow22' },
  'diamond-bangle': { kind: 'bangle', style: 'diamond', metal: 'yellow' },
  'traditional-bangle': { kind: 'bangle', style: 'kada', metal: 'yellow22' },
};
