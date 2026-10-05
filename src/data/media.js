/* Editorial banners rendered from the 3D jewellery models (src/assets/banners). */
const banners = import.meta.glob('../assets/banners/*.webp', { eager: true, import: 'default' });

export const banner = (key) => banners[`../assets/banners/${key}.webp`];

export const CATEGORY_MEDIA = {
  rings: { tile: banner('tile-rings'), hero: banner('category-rings') },
  necklaces: { tile: banner('tile-necklaces'), hero: banner('category-necklaces') },
  earrings: { tile: banner('tile-earrings'), hero: banner('category-earrings') },
  bracelets: { tile: banner('tile-bracelets'), hero: banner('category-bracelets') },
  bangles: { tile: banner('tile-bangles'), hero: banner('category-bangles') },
};

export const COLLECTION_MEDIA = {
  bridal: banner('collection-bridal'),
  heritage: banner('collection-heritage'),
  everyday: banner('collection-everyday'),
  gemstone: banner('showcase-noir'),
};
