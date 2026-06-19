import { Routes, Route, useLocation } from "react-router";
import { useState } from "react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { LanguageProvider } from "./i18n/LanguageProvider";
import { CartProvider } from "./hooks/useCart";
import { ToastProvider } from "./hooks/useToast";
import { TRPCProvider } from "@/providers/trpc";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import TrackOrder from "./pages/TrackOrder";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";

function Layout() {
  const [cartOpen, setCartOpen] = useState(false);
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:categorySlug" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/track" element={<TrackOrder />} />
        <Route path="/track/:orderNumber" element={<TrackOrder />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isDashboard && <Footer />}
      <SpeedInsights />
    </div>
  );
}

export default function App() {
  return (
    <TRPCProvider>
      <LanguageProvider>
        <CartProvider>
          <ToastProvider>
            <Layout />
          </ToastProvider>
        </CartProvider>
      </LanguageProvider>
    </TRPCProvider>
  );
}
