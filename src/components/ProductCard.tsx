import { useState } from "react";
import { Link } from "react-router";
import { ShoppingBag, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug: string;
    price: string;
    compareAtPrice: string | null;
    image: string;
    brand: string | null;
    stock: number;
    scentFamily: string | null;
  };
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, 1);
      addToast(`${product.name} ${t("products.addToBag")}`, "success");
    } catch {
      addToast(t("common.error"), "error");
    }
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "DZD",
    }).format(parseFloat(price));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      className="group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <Link to={`/product/${product.slug}`} className="block relative overflow-hidden rounded-lg bg-[#F5F0EB] aspect-square">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-700 ${
            hovered ? "scale-105" : "scale-100"
          }`}
        />
        {/* Hover overlay with quick add */}
        <motion.div
          initial={false}
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 10 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-0 left-0 right-0 p-3"
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              if (product.stock > 0) handleAddToCart();
            }}
            disabled={product.stock <= 0}
            className={`w-full py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
              product.stock > 0 
                ? "bg-[#C9A96E] text-[#0F281F] hover:bg-[#d4b87a]" 
                : "bg-[#1A1A1A]/80 backdrop-blur-sm text-white cursor-not-allowed"
            }`}
          >
            {product.stock > 0 ? (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                {t("products.quickAdd")}
              </>
            ) : "Sold Out / نفذت الكمية"}
          </button>
        </motion.div>

        {/* Sale / Sold Out badge */}
        {product.stock <= 0 ? (
          <span className="absolute top-3 left-3 bg-[#1A1A1A] text-white text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-semibold">
            Sold Out
          </span>
        ) : product.compareAtPrice && (
          <span className="absolute top-3 left-3 bg-[#8B2D3B] text-white text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-semibold">
            {t("common.sale")}
          </span>
        )}

        {/* Wishlist */}
        <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-[#1A1A1A] hover:text-[#8B2D3B] hover:bg-white transition-all opacity-0 group-hover:opacity-100">
          <Heart className="w-4 h-4" />
        </button>
      </Link>

      {/* Info */}
      <div className="mt-3 px-1">
        {product.brand && (
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#C9A96E] font-medium mb-0.5">
            {product.brand}
          </p>
        )}
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-sm font-medium text-[#1A1A1A] hover:text-[#1A4D3A] transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-semibold text-[#0F281F]">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-xs text-[#9A9187] line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
