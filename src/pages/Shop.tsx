import { useState } from "react";
import { useParams } from "react-router";
import { motion } from "framer-motion";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { trpc } from "@/providers/trpc";
import ProductCard from "@/components/ProductCard";

export default function Shop() {
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const { t } = useLanguage();
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc" | "name">("newest");
  const [showFilters, setShowFilters] = useState(false);

  const { data: products, isLoading } = trpc.products.getProducts.useQuery({
    categorySlug,
    sortBy,
    limit: 50,
  });

  const { data: categories } = trpc.products.getCategories.useQuery();

  const getPageTitle = () => {
    if (categorySlug && categories) {
      const cat = categories.find((c) => c.slug === categorySlug);
      if (cat) return cat.nameEn;
    }
    return t("nav.shop");
  };

  const getPageImage = () => {
    switch (categorySlug) {
      case "womens-perfume":
        return "/images/category-women.jpg";
      case "mens-cologne":
        return "/images/category-men.jpg";
      case "handbags":
        return "/images/category-bags.jpg";
      case "gift-sets":
        return "/images/category-gifts.jpg";
      default:
        return "/images/hero-bottle.jpg";
    }
  };

  return (
    <main className="pt-16">
      {/* Shop Header */}
      <section className="relative h-[300px] md:h-[400px] overflow-hidden">
        <img
          src={getPageImage()}
          alt={getPageTitle()}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="font-[Playfair_Display] text-4xl md:text-5xl text-white font-medium">
              {getPageTitle()}
            </h1>
            <p className="text-white/60 text-sm mt-2">
              Home / {getPageTitle()}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters Bar */}
      <section className="sticky top-16 z-30 bg-white border-b border-[#E8E4DF]">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm text-[#1A1A1A] hover:text-[#1A4D3A] transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">{t("common.filter")}</span>
          </button>

          <p className="text-sm text-[#9A9187]">
            {products?.length || 0} {t("common.loading")}
          </p>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="appearance-none bg-transparent text-sm text-[#1A1A1A] pr-6 pl-2 py-1 focus:outline-none cursor-pointer"
            >
              <option value="newest">{t("common.newest")}</option>
              <option value="price_asc">{t("common.priceLow")}</option>
              <option value="price_desc">{t("common.priceHigh")}</option>
              <option value="name">{t("common.name")}</option>
            </select>
            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
          </div>
        </div>

        {/* Filter Pills */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[#E8E4DF] overflow-hidden"
          >
            <div className="max-w-[1400px] mx-auto px-6 py-4 flex flex-wrap gap-2">
              {categories?.map((cat) => (
                <a
                  key={cat.id}
                  href={`/shop/${cat.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = `/shop/${cat.slug}`;
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    categorySlug === cat.slug
                      ? "bg-[#0F281F] text-white"
                      : "bg-[#F5F0EB] text-[#1A1A1A] hover:bg-[#E8E4DF]"
                  }`}
                >
                  {cat.nameEn}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </section>

      {/* Product Grid */}
      <section className="max-w-[1400px] mx-auto px-6 py-12">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-[#9A9187] text-lg">{t("common.loading")}</p>
          </div>
        )}
      </section>
    </main>
  );
}
