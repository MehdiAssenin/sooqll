import { Link } from "react-router";
import { useLanguage } from "@/i18n/LanguageProvider";

import { Instagram, Facebook, Twitter, Mail, ArrowRight } from "lucide-react";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#0A0A0A] text-white border-t border-[#C9A96E]/20 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#C9A96E]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Brand & Newsletter - Takes up more space */}
          <div className="lg:col-span-5 pr-0 lg:pr-12">
            <Link to="/" className="inline-block mb-6">
              <h3 className="font-[Playfair_Display] text-3xl tracking-wide font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#C9A96E] to-[#E8D09E]">
                L'ÉLÉGANCE
              </h3>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-md">
              {t("footer.tagline") || "Discover the essence of luxury through our curated collection of premium fragrances and elegant accessories."}
            </p>
            
            {/* Newsletter */}
            <div className="mb-8">
              <h4 className="text-xs uppercase tracking-[0.2em] text-white/80 mb-4 font-semibold">
                Join Our Newsletter
              </h4>
              <div className="relative max-w-md flex items-center">
                <Mail className="absolute left-4 w-4 h-4 text-white/40" />
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="w-full bg-white/5 border border-white/10 rounded-full py-3.5 pl-11 pr-14 text-sm focus:outline-none focus:border-[#C9A96E]/50 focus:bg-white/10 transition-all text-white placeholder:text-white/30"
                />
                <button className="absolute right-2 w-10 h-10 rounded-full bg-[#C9A96E] flex items-center justify-center text-[#0A0A0A] hover:bg-[#E8D09E] transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Socials */}
            <div className="flex gap-4">
              {[
                { icon: Instagram, href: "#" },
                { icon: Facebook, href: "#" },
                { icon: Twitter, href: "#" }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-[#0A0A0A] hover:bg-[#C9A96E] hover:border-[#C9A96E] transition-all duration-300"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div className="lg:col-span-2 lg:col-start-7">
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#C9A96E] mb-6 font-semibold">
              {t("footer.shop") || "Shop"}
            </h4>
            <ul className="space-y-4">
              {[
                { to: "/shop/womens-perfume", label: t("nav.women") },
                { to: "/shop/mens-cologne", label: t("nav.men") },
                { to: "/shop/handbags", label: t("nav.handbags") },
                { to: "/shop/gift-sets", label: t("nav.gifts") },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-white/60 text-sm hover:text-[#C9A96E] hover:translate-x-1 inline-block transition-all duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="lg:col-span-2">
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#C9A96E] mb-6 font-semibold">
              {t("footer.company") || "Company"}
            </h4>
            <ul className="space-y-4">
              {[
                { label: t("footer.story") || "Our Story", to: "/about" },
                { label: t("footer.sustainability") || "Sustainability", to: "/about#sustainability" },
                { label: t("footer.careers") || "Careers", to: "#" },
                { label: t("footer.press") || "Press", to: "#" }
              ].map(
                (item) => (
                  <li key={item.label}>
                    <Link to={item.to} className="text-white/60 text-sm hover:text-[#C9A96E] hover:translate-x-1 inline-block transition-all duration-300">
                      {item.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Customer Care Links */}
          <div className="lg:col-span-2">
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#C9A96E] mb-6 font-semibold">
              {t("footer.care") || "Customer Care"}
            </h4>
            <ul className="space-y-4">
              {[
                { label: t("footer.shipping") || "Shipping", to: "/faq#shipping" },
                { label: t("footer.returns") || "Returns", to: "/faq#returns" },
                { label: t("footer.faq") || "FAQ", to: "/faq" },
                { label: t("footer.contact") || "Contact Us", to: "/contact" }
              ].map(
                (item) => (
                  <li key={item.label}>
                    <Link to={item.to} className="text-white/60 text-sm hover:text-[#C9A96E] hover:translate-x-1 inline-block transition-all duration-300">
                      {item.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-xs tracking-wide">
            {t("footer.copyright") || `© ${new Date().getFullYear()} L'Élégance. All rights reserved.`}
          </p>
          <div className="flex gap-6 text-white/40 text-xs tracking-wide">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
