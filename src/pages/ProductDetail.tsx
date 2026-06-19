import { useState } from "react";
import { useParams } from "react-router";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { trpc } from "@/providers/trpc";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import ProductCard from "@/components/ProductCard";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<string | null>("description");

  const { data: product, isLoading } = trpc.products.getProduct.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  const { data: relatedProducts } = trpc.products.getRelatedProducts.useQuery(
    { productId: product?.id || 0, categoryId: product?.categoryId || undefined, limit: 4 },
    { enabled: !!product }
  );

  const handleAddToCart = async () => {
    if (!product || product.stock <= 0) return;
    const sizes = product.sizes ? (typeof product.sizes === "string" ? JSON.parse(product.sizes) : product.sizes) as string[] : [];
    if (sizes.length > 0 && !selectedSize) {
      addToast(t("products.sizeRequired") || "Please select a size", "error");
      return;
    }
    try {
      await addToCart(product.id, quantity, selectedSize || undefined);
      addToast(`${product.name} added to bag!`, "success");
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

  if (isLoading) {
    return (
      <div className="pt-16 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-16 flex items-center justify-center min-h-[60vh]">
        <p className="text-[#9A9187] text-lg">{t("common.error")}</p>
      </div>
    );
  }

  const sizes = product.sizes ? (typeof product.sizes === "string" ? JSON.parse(product.sizes) : product.sizes) as { size: string, price: number }[] : [];
  const images = product.images ? (typeof product.images === "string" ? JSON.parse(product.images) : product.images) as string[] : [product.image];

  return (
    <main className="pt-16">
      {/* Product Hero */}
      <section className="max-w-[1400px] mx-auto px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="aspect-square rounded-2xl overflow-hidden bg-[#F5F0EB] mb-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.slice(0, 4).map((img, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg overflow-hidden bg-[#F5F0EB] cursor-pointer hover:ring-2 hover:ring-[#C9A96E] transition-all"
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col"
          >
            {product.brand && (
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#C9A96E] font-medium mb-2">
                {product.brand}
              </p>
            )}
            <h1 className="font-[Playfair_Display] text-3xl md:text-4xl text-[#0F281F] font-medium mb-3">
              {product.name}
            </h1>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-semibold text-[#0F281F]">
                {formatPrice(selectedSize && sizes.find(s => s.size === selectedSize)?.price ? sizes.find(s => s.size === selectedSize)!.price.toString() : product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-lg text-[#9A9187] line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            {/* Size Selector */}
            {sizes.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-[#1A1A1A] mb-2">
                  {t("products.size")}: {selectedSize}
                </p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s.size}
                      onClick={() => setSelectedSize(s.size)}
                      className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
                        selectedSize === s.size
                          ? "bg-[#0F281F] text-white border-[#0F281F]"
                          : "bg-white text-[#1A1A1A] border-[#E8E4DF] hover:border-[#0F281F]"
                      }`}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <p className="text-sm font-medium text-[#1A1A1A] mb-2">{t("products.quantity")}</p>
              <div className="flex items-center gap-3 border border-[#E8E4DF] rounded-full w-fit px-2">
                <button
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  className="w-9 h-9 flex items-center justify-center hover:bg-[#F5F0EB] rounded-full transition-colors"
                >
                  -
                </button>
                <span className="text-sm font-medium w-6 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-9 flex items-center justify-center hover:bg-[#F5F0EB] rounded-full transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Bag */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`flex-1 py-4 rounded-full font-semibold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
                  product.stock > 0 
                    ? "bg-[#C9A96E] text-[#0F281F] hover:bg-[#d4b87a]" 
                    : "bg-[#E8E4DF] text-[#9A9187] cursor-not-allowed"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                {product.stock > 0 ? t("products.addToBag") : "Sold Out / نفذت الكمية"}
              </button>
              <button className="w-14 h-14 border border-[#E8E4DF] rounded-full flex items-center justify-center text-[#1A1A1A] hover:text-[#8B2D3B] hover:border-[#8B2D3B] transition-colors">
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {/* Stock status */}
            <p className={`text-xs mb-6 ${product.stock > 0 ? "text-[#1A4D3A]" : "text-[#8B2D3B]"}`}>
              {product.stock > 0 ? `✓ ${t("products.inStock")} (${product.stock})` : t("products.outOfStock")}
            </p>

            {/* Accordions */}
            <div className="border-t border-[#E8E4DF]">
              {[
                { key: "description", label: t("products.description") || "Description", content: product.description || "No description available." },
                { 
                  key: "details", 
                  label: "Product Details", 
                  content: (
                    <div className="space-y-4">
                      {product.volume && <p><strong>Volume:</strong> {product.volume}</p>}
                      {product.topNotes && <p><strong>Top Notes:</strong> {product.topNotes}</p>}
                      {product.heartNotes && <p><strong>Heart Notes:</strong> {product.heartNotes}</p>}
                      {product.baseNotes && <p><strong>Base Notes:</strong> {product.baseNotes}</p>}
                      {product.ingredients && <p><strong>Ingredients:</strong> {product.ingredients}</p>}
                      {!product.volume && !product.topNotes && !product.ingredients && <p>More details coming soon.</p>}
                    </div>
                  ) 
                },
                { key: "shipping", label: t("products.shipping") || "Shipping", content: "Free shipping on orders over DZD 20000. Easy returns." },
              ].map((item) => (
                <div key={item.key} className="border-b border-[#E8E4DF]">
                  <button
                    onClick={() => setActiveAccordion(activeAccordion === item.key ? null : item.key)}
                    className="w-full flex items-center justify-between py-4 text-left"
                  >
                    <span className="text-sm font-medium text-[#1A1A1A]">{item.label}</span>
                    {activeAccordion === item.key ? (
                      <ChevronUp className="w-4 h-4 text-[#9A9187]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#9A9187]" />
                    )}
                  </button>
                  {activeAccordion === item.key && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="pb-4"
                    >
                      {typeof item.content === 'string' ? (
                        <p className="text-sm text-[#7A7167] leading-relaxed">{item.content}</p>
                      ) : (
                        <div className="text-sm text-[#7A7167] leading-relaxed">{item.content}</div>
                      )}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="bg-[#F5F0EB] py-16">
          <div className="max-w-[1400px] mx-auto px-6">
            <h2 className="font-[Playfair_Display] text-2xl text-[#0F281F] font-medium mb-8">
              {t("products.related")}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
