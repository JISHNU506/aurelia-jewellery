# Aurelia — Fine Jewellery (frontend demo)

**Live demo:** https://aurelia-jewellery-897.netlify.app

A premium jewellery storefront built with **React + Vite + Tailwind CSS**. It includes interactive **3D jewellery**, a **live camera virtual try-on**, and a **gold price calculator**.

> Frontend only: no backend, database or API server. Products are mock data, and the cart, wishlist, orders and reviews are stored in `localStorage`. Checkout and payment are simulated.

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build in dist/
npm run preview      # preview the production build
```

### Testing the virtual try-on on a phone
Browsers only allow camera access on **https** or **localhost**. Run:

```bash
npm run dev:mobile
```

Then open the `https://<your-LAN-IP>:5173` address it prints on your phone. Accept the self-signed certificate warning when it appears.

## Features

| Area | What you get |
| --- | --- |
| **Pages** | Home, Shop (search, filters, sort, grid/list), Categories, Category pages, Product details, New Arrivals, Best Sellers, Wishlist, Cart, Checkout (mock payment), Order confirmation, About, Contact, Price Calculator, Virtual Try-On |
| **3D viewer** | `Jewellery3DViewer.jsx` (React Three Fiber + Drei). Drag to rotate, zoom, angle presets, reset camera, 4 studio lighting presets, backdrops, live metal re-colouring, fullscreen |
| **Virtual try-on** | `VirtualTryOn.jsx`. Uses `getUserMedia` plus MediaPipe face/hand landmarks to place earrings, necklaces, rings and bracelets on the live camera image, with depth occluders. Size, rotation and position sliders, drag to move, reset, switch jewellery, front/back camera, capture/share a photo, and a no-camera preview mode |
| **Price calculator** | Purity (18K/22K/24K), weight, rate, making %, stones, other charges and GST. Updates instantly and shows a full breakdown. The same formula prices every product |
| **Cart & wishlist** | React context + localStorage: add, remove, change quantity, change size, move between wishlist and bag, coupon codes `AURELIA10` and `FIRSTGOLD` |
| **Search** | Instant search overlay, e.g. "diamond ring", "22k gold", "pearl earrings" |

## Usage

```jsx
<Jewellery3DViewer model="/models/diamond-ring.glb" product={product} />
```

If `model` is missing, the viewer builds the piece procedurally from `product.model3d`.

## Assets

All jewellery assets are generated in this project, so there are no external or broken image URLs.

- `src/utils/jewellery/` is a procedural Three.js jewellery library: faceted gems, prong and halo settings, chains, pearls, temple motifs and studio lighting.
- `src/assets/models/*.glb` are binary glTF exports of every product, created with `npm run generate:models`.
- `src/assets/products/*.webp` and `src/assets/banners/*.webp` are studio renders of the same 3D models.

Face and hand tracking models load at runtime from the official MediaPipe CDN. See `src/utils/tryon/tracking.js` to self-host them. If tracking can't load, the try-on falls back to manual placement.

## Structure

```
src/
  assets/{products,models,banners,icons}
  components/   Navbar, Footer, ProductCard, ProductGallery, Jewellery3DViewer,
                VirtualTryOn, PriceCalculator, CartDrawer, SearchOverlay, ui/, three/, tryon/
  pages/        Home, Shop, ProductDetails, Categories, CategoryPage, Wishlist, Cart,
                Checkout, OrderConfirmation, About, Contact, PriceCalculatorPage, TryOnPage …
  data/         products.js, modelSpecs.js, reviews.js, media.js
  context/      CartContext, WishlistContext, UIContext
  hooks/        useLocalStorage, useMediaQuery, useRecentlyViewed, useLockBodyScroll
  utils/        price.js, format.js, search.js, orders.js, jewellery/, tryon/
```

JavaScript + JSX only — no TypeScript.
