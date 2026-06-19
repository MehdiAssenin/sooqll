import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { trpc } from "@/providers/trpc";
import ProductCard from "@/components/ProductCard";
import Marquee from "react-fast-marquee";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ─────────── Hero Section ─────────── */
function HeroSection() {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const images = ["/images/hero-bottle.jpg", "/images/hero-bag.jpg"];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const imgElements: HTMLImageElement[] = [];
    let loaded = 0;

    images.forEach((src, i) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        loaded++;
        imgElements[i] = img;
        if (loaded === images.length) {
          startDissolve();
        }
      };
      img.src = src;
    });

    let animFrame: number;
    let progress = 0;
    let direction = 1;
    let active = 0;

    function drawDissolve() {
      if (!ctx || !canvas) return;
      const w = canvas.width;
      const h = canvas.height;

      progress += 0.008 * direction;

      if (progress >= 1) {
        progress = 1;
        direction = -1;
        active = 1 - active;
      } else if (progress <= 0) {
        progress = 0;
        direction = 1;
      }

      // Ease-in-out-cubic
      const p =
        progress < 0.5
          ? 4 * Math.pow(progress, 3)
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      // Draw base image
      ctx.globalAlpha = 1;
      ctx.drawImage(imgElements[active], 0, 0, w, h);

      // Draw dissolve overlay
      if (p > 0 && p < 1) {
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;
        const nextImg = imgElements[1 - active];

        const offCanvas = document.createElement("canvas");
        offCanvas.width = w;
        offCanvas.height = h;
        const offCtx = offCanvas.getContext("2d");
        if (offCtx) {
          offCtx.drawImage(nextImg, 0, 0, w, h);
          const nextData = offCtx.getImageData(0, 0, w, h).data;

          for (let y = 0; y < h; y += 2) {
            for (let x = 0; x < w; x += 2) {
              // Simple noise
              const noise =
                Math.sin(x * 0.01 + y * 0.01) * 0.5 +
                Math.cos(x * 0.02 - y * 0.015) * 0.5 +
                Math.random() * 0.1;

              const threshold = p * 2 - 1 + noise;
              const smooth = threshold > -0.2 ? 1 : 0;

              if (smooth > 0) {
                const idx = (y * w + x) * 4;
                const blend = Math.min(1, (threshold + 0.2) * 2);
                data[idx] = nextData[idx] * blend + data[idx] * (1 - blend);
                data[idx + 1] = nextData[idx + 1] * blend + data[idx + 1] * (1 - blend);
                data[idx + 2] = nextData[idx + 2] * blend + data[idx + 2] * (1 - blend);
              }
            }
          }

          ctx.putImageData(imageData, 0, 0);
        }
      }

      animFrame = requestAnimationFrame(drawDissolve);
    }

    function startDissolve() {
      drawDissolve();
    }

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-xs uppercase tracking-[0.2em] text-[#C9A96E] mb-4 font-medium"
        >
          {t("hero.caption")}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="font-[Playfair_Display] text-5xl md:text-6xl lg:text-7xl text-white font-medium leading-[1.1] mb-6"
          style={{ textShadow: "0 2px 30px rgba(0,0,0,0.5)" }}
        >
          {t("hero.title").split(" ").slice(0, -1).join(" ")}
          <br />
          {t("hero.title").split(" ").slice(-1)}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-white/80 text-base md:text-lg max-w-[480px] mb-8 leading-relaxed"
          style={{ textShadow: "0 1px 10px rgba(0,0,0,0.5)" }}
        >
          {t("hero.subtitle")}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 border border-[#C9A96E] text-white px-8 py-3.5 rounded-full text-sm font-semibold uppercase tracking-wider hover:bg-[#C9A96E] hover:text-[#0F281F] transition-all duration-300"
          >
            {t("hero.cta")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center p-1.5"
        >
          <div className="w-1.5 h-2.5 bg-white/60 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ─────────── Introduction Section ─────────── */
function IntroSection() {
  const { t } = useLanguage();

  return (
    <section className="bg-[#0F281F] py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-[Playfair_Display] text-3xl md:text-4xl text-white font-medium leading-[1.15] mb-6">
              {t("intro.title")}
            </h2>
            <p className="text-white/70 text-base md:text-lg leading-relaxed">
              {t("intro.body")}
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-[#C9A96E] mt-8 text-sm font-medium hover:gap-3 transition-all"
            >
              {t("hero.cta")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl aspect-[4/5]">
              <img
                src="/images/hero-bottle.jpg"
                alt="Luxury Perfume"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 border-2 border-[#C9A96E]/30 rounded-2xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─────────── Categories Section ─────────── */
function CategoriesSection() {
  const { t } = useLanguage();
  const { data: categories } = trpc.products.getCategories.useQuery();

  const getCatName = (slug: string) => {
    switch (slug) {
      case "womens-perfume": return t("categories.women");
      case "mens-cologne": return t("categories.men");
      case "handbags": return t("categories.handbags");
      case "gift-sets": return t("categories.gifts");
      default: return slug;
    }
  };

  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="max-w-[1400px] mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-[Playfair_Display] text-3xl md:text-4xl text-[#0F281F] font-medium text-center mb-12"
        >
          {t("categories.title")}
        </motion.h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categories?.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
            >
              <Link
                to={`/shop/${cat.slug}`}
                className="group block relative aspect-[3/4] rounded-xl overflow-hidden"
              >
                <img
                  src={cat.image || ""}
                  alt={cat.nameEn}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                  <h3 className="text-white font-[Playfair_Display] text-lg md:text-xl font-medium">
                    {getCatName(cat.slug)}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────── Products Section ─────────── */
function ProductsSection() {
  const { t } = useLanguage();
  const { data: products } = trpc.products.getProducts.useQuery({
    featured: true,
    limit: 4,
  });

  return (
    <section className="py-24 md:py-32 bg-[#F5F0EB]">
      <div className="max-w-[1400px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-12"
        >
          <h2 className="font-[Playfair_Display] text-3xl md:text-4xl text-[#0F281F] font-medium">
            {t("products.title")}
          </h2>
          <Link
            to="/shop"
            className="hidden md:inline-flex items-center gap-1.5 text-sm text-[#1A4D3A] font-medium hover:text-[#0F281F] transition-colors"
          >
            {t("hero.cta")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {products?.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-sm text-[#1A4D3A] font-medium"
          >
            {t("hero.cta")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────── Brand Statement Section ─────────── */
function BrandSection() {
  const { t } = useLanguage();
  const [fragrancesCount, setFragrancesCount] = useState(0);
  const [heritageCount, setHeritageCount] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const duration = 2000;
          const start = Date.now();

          const animate = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);

            setFragrancesCount(Math.round(120 * eased));
            setHeritageCount(Math.round(35 * eased));

            if (progress < 1) requestAnimationFrame(animate);
          };

          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    const el = document.getElementById("brand-stats");
    if (el) observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-[#1A4D3A] py-24 md:py-32">
      <div className="max-w-[800px] mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-[Playfair_Display] text-4xl md:text-5xl lg:text-6xl text-white font-medium leading-[1.1] mb-6"
        >
          {t("brand.title").split(" ").slice(0, -1).join(" ")}
          <br />
          {t("brand.title").split(" ").slice(-1)}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-white/80 text-base md:text-lg leading-relaxed max-w-[600px] mx-auto mb-12"
        >
          {t("brand.body")}
        </motion.p>

        <div id="brand-stats" className="grid grid-cols-2 gap-8 md:gap-16">
          <div>
            <span className="font-[Playfair_Display] text-5xl md:text-6xl text-[#C9A96E] font-medium">
              {fragrancesCount}+
            </span>
            <p className="text-white/70 text-sm uppercase tracking-wider mt-2">{t("brand.fragrances")}</p>
          </div>
          <div>
            <span className="font-[Playfair_Display] text-5xl md:text-6xl text-[#C9A96E] font-medium">
              {heritageCount}
            </span>
            <p className="text-white/70 text-sm uppercase tracking-wider mt-2">{t("brand.heritage")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────── Testimonials Section ─────────── */
function TestimonialsSection() {
  const { t } = useLanguage();
  const { data: testimonials } = trpc.products.getTestimonials.useQuery();

  return (
    <section className="bg-[#0F281F] py-24 md:py-32 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-[Playfair_Display] text-3xl md:text-4xl text-white font-medium text-center"
        >
          {t("testimonials.title")}
        </motion.h2>
      </div>

      {testimonials && testimonials.length > 0 && (
        <Marquee speed={40} pauseOnHover gradient={false}>
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="w-[400px] mx-3 bg-[#1A4D3A]/50 rounded-xl p-6 shrink-0"
            >
              <p className="text-white/80 text-sm leading-relaxed mb-4 italic">
                &ldquo;{testimonial.comment}&rdquo;
              </p>
              <div>
                <p className="text-white font-medium text-sm">{testimonial.name}</p>
                <p className="text-white/50 text-xs">{testimonial.location}</p>
              </div>
            </div>
          ))}
        </Marquee>
      )}
    </section>
  );
}

/* ─────────── Newsletter Section ─────────── */
function NewsletterSection() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <section className="bg-[#F5F0EB] py-24 md:py-32">
      <div className="max-w-[600px] mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-[Playfair_Display] text-3xl md:text-4xl text-[#0F281F] font-medium mb-4">
            {t("newsletter.title")}
          </h2>
          <p className="text-[#7A7167] text-base mb-8">{t("newsletter.body")}</p>

          {subscribed ? (
            <motion.p
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[#1A4D3A] font-medium"
            >
              {t("newsletter.success")}
            </motion.p>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-3 max-w-[480px] mx-auto">
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9187]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("newsletter.placeholder")}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#0F281F]/20 rounded-full text-sm text-[#1A1A1A] placeholder-[#9A9187] focus:outline-none focus:border-[#0F281F] transition-colors"
                />
              </div>
              <button
                type="submit"
                className="bg-[#C9A96E] text-[#0F281F] px-7 py-3 rounded-full text-sm font-semibold uppercase tracking-wider hover:bg-[#d4b87a] transition-colors shrink-0"
              >
                {t("newsletter.button")}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────── Home Page ─────────── */
export default function Home() {
  return (
    <main>
      <HeroSection />
      <IntroSection />
      <CategoriesSection />
      <ProductsSection />
      <BrandSection />
      <TestimonialsSection />
      <NewsletterSection />
    </main>
  );
}
