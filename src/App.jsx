import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { UIProvider } from './context/UIContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import SearchOverlay from './components/SearchOverlay.jsx';
import Toaster from './components/ui/Toaster.jsx';
import { EASE } from './components/ui/Primitives.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Categories from './pages/Categories.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import NewArrivals from './pages/NewArrivals.jsx';
import BestSellers from './pages/BestSellers.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderConfirmation from './pages/OrderConfirmation.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import PriceCalculatorPage from './pages/PriceCalculatorPage.jsx';
import TryOnPage from './pages/TryOnPage.jsx';
import NotFound from './pages/NotFound.jsx';

// Heavy WebGL / camera experiences are code-split and loaded on demand.
const Viewer3DModal = lazy(() => import('./components/Viewer3DModal.jsx'));
const VirtualTryOn = lazy(() => import('./components/VirtualTryOn.jsx'));

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 150);
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash]);
  return null;
}

function Page({ children }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.55, ease: EASE }}
      className="min-h-[60vh]"
    >
      {children}
    </motion.main>
  );
}

export default function App() {
  const location = useLocation();
  return (
    <MotionConfig reducedMotion="user">
      <UIProvider>
        <CartProvider>
          <WishlistProvider>
            <ScrollToTop />
            <Navbar />
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Page><Home /></Page>} />
                <Route path="/shop" element={<Page><Shop /></Page>} />
                <Route path="/product/:slug" element={<Page><ProductDetails /></Page>} />
                <Route path="/categories" element={<Page><Categories /></Page>} />
                <Route path="/category/:category" element={<Page><CategoryPage /></Page>} />
                <Route path="/new-arrivals" element={<Page><NewArrivals /></Page>} />
                <Route path="/best-sellers" element={<Page><BestSellers /></Page>} />
                <Route path="/wishlist" element={<Page><Wishlist /></Page>} />
                <Route path="/cart" element={<Page><Cart /></Page>} />
                <Route path="/checkout" element={<Page><Checkout /></Page>} />
                <Route path="/order/:orderId" element={<Page><OrderConfirmation /></Page>} />
                <Route path="/about" element={<Page><About /></Page>} />
                <Route path="/contact" element={<Page><Contact /></Page>} />
                <Route path="/price-calculator" element={<Page><PriceCalculatorPage /></Page>} />
                <Route path="/try-on" element={<Page><TryOnPage /></Page>} />
                <Route path="*" element={<Page><NotFound /></Page>} />
              </Routes>
            </AnimatePresence>
            <Footer />
            <CartDrawer />
            <SearchOverlay />
            <Suspense fallback={null}>
              <Viewer3DModal />
              <VirtualTryOn />
            </Suspense>
            <Toaster />
          </WishlistProvider>
        </CartProvider>
      </UIProvider>
    </MotionConfig>
  );
}
