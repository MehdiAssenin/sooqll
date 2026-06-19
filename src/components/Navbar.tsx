import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { ShoppingBag, Search, Menu, X, Globe, User } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useCart } from "@/hooks/useCart";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { lang, setLang, t } = useLanguage();
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isHome = location.pathname === "/";
  const showBg = scrolled || !isHome;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-500 ${
          showBg
            ? "bg-[#0F281F]/95 backdrop-blur-md shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 h-full flex items-center justify-between">
          {/* Left: Menu + Search */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="text-white/80 hover:text-[#C9A96E] transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-white/80 hover:text-[#C9A96E] transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Center: Logo */}
          <Link
            to="/"
            className="absolute left-1/2 -translate-x-1/2 font-[Playfair_Display] text-xl font-semibold text-white tracking-wide"
          >
            L'ÉLÉGANCE
          </Link>

          {/* Right: Language + Account + Cart */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLang(lang === "en" ? "fr" : "en")}
              className="text-white/80 hover:text-[#C9A96E] transition-colors text-xs font-medium flex items-center gap-1"
            >
              <Globe className="w-4 h-4" />
              {lang === "en" ? "FR" : "EN"}
            </button>

            {user ? (
              <Link to={user.role === "admin" ? "/admin" : "/account"} className="text-white/80 hover:text-[#C9A96E] transition-colors">
                <User className="w-5 h-5" />
              </Link>
            ) : (
              <Link to="/login" className="text-white/80 hover:text-[#C9A96E] transition-colors">
                <User className="w-5 h-5" />
              </Link>
            )}

            <Link to="/cart" className="relative text-white/80 hover:text-[#C9A96E] transition-colors">
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#C9A96E] text-[#0F281F] text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-[#0F281F]/95 backdrop-blur-md border-t border-white/10 overflow-hidden"
            >
              <div className="max-w-[600px] mx-auto px-6 py-4">
                <input
                  type="text"
                  placeholder={t("nav.search") + "..."}
                  autoFocus
                  className="w-full bg-white/10 border border-white/20 rounded-full px-5 py-2.5 text-white placeholder-white/50 focus:outline-none focus:border-[#C9A96E]"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[#0F281F]/98 backdrop-blur-lg"
          >
            <div className="flex flex-col h-full p-6">
              <div className="flex justify-between items-center mb-12">
                <span className="font-[Playfair_Display] text-xl font-semibold text-white">
                  L'ÉLÉGANCE
                </span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-col gap-6">
                {[
                  { to: "/", label: t("nav.home") },
                  { to: "/shop", label: t("nav.shop") },
                  { to: "/shop/womens-perfume", label: t("nav.women") },
                  { to: "/shop/mens-cologne", label: t("nav.men") },
                  { to: "/shop/handbags", label: t("nav.handbags") },
                  { to: "/shop/gift-sets", label: t("nav.gifts") },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="text-white text-2xl font-[Playfair_Display] hover:text-[#C9A96E] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}

                {user?.role === "admin" && (
                  <Link
                    to="/admin"
                    className="text-[#C9A96E] text-2xl font-[Playfair_Display] hover:text-white transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("nav.admin")}
                  </Link>
                )}

                {user ? (
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-white/60 text-lg hover:text-white transition-colors text-left mt-8"
                  >
                    {t("nav.logout")}
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="text-white/60 text-lg hover:text-white transition-colors mt-8"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("nav.login")}
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
