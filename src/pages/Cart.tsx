import { Link } from "react-router";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useCart, getItemPrice } from "@/hooks/useCart";

export default function Cart() {
  const { t } = useLanguage();
  const { items, updateQuantity, removeFromCart, subtotal, isLoading } = useCart();

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "DZD",
    }).format(typeof price === "string" ? parseFloat(price) : price);
  };

  const shipping = subtotal > 200 ? 0 : 15;
  const total = subtotal + shipping;

  if (isLoading) {
    return (
      <div className="pt-16 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <main className="pt-16 min-h-[60vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <ShoppingBag className="w-16 h-16 text-[#D1CCC4] mx-auto mb-4" />
          <h1 className="font-[Playfair_Display] text-2xl text-[#0F281F] mb-2">{t("cart.title")}</h1>
          <p className="text-[#9A9187] mb-6">{t("cart.empty")}</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-[#C9A96E] text-[#0F281F] px-8 py-3 rounded-full text-sm font-semibold uppercase tracking-wider hover:bg-[#d4b87a] transition-colors"
          >
            {t("cart.continue")}
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="pt-16">
      <section className="max-w-[1400px] mx-auto px-6 py-12">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-[Playfair_Display] text-3xl text-[#0F281F] font-medium mb-8"
        >
          {t("cart.title")}
          <span className="text-[#9A9187] text-lg ml-2">
            ({items.length} {items.length === 1 ? t("cart.item") : t("cart.items")})
          </span>
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 p-4 bg-white rounded-xl border border-[#E8E4DF]"
              >
                <Link
                  to={`/product/${item.product?.slug || ""}`}
                  className="w-24 h-24 rounded-lg bg-[#F5F0EB] overflow-hidden shrink-0"
                >
                  {item.product?.image && (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link to={`/product/${item.product?.slug || ""}`}>
                        <h3 className="text-sm font-medium text-[#1A1A1A] hover:text-[#1A4D3A] transition-colors">
                          {item.product?.name}
                        </h3>
                      </Link>
                      {item.size && (
                        <p className="text-xs text-[#9A9187] mt-0.5">
                          {t("products.size")}: {item.size}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[#9A9187] hover:text-[#8B2D3B] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1 border border-[#E8E4DF] rounded-full">
                      <button
                        onClick={() => item.quantity > 1 && updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-[#F5F0EB] rounded-full transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-[#F5F0EB] rounded-full transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-sm font-semibold text-[#0F281F]">
                      {formatPrice(getItemPrice(item) * item.quantity)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:sticky lg:top-24 h-fit"
          >
            <div className="bg-white rounded-xl border border-[#E8E4DF] p-6">
              <h2 className="font-medium text-[#0F281F] mb-4">{t("cart.checkout")}</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-[#7A7167]">{t("cart.subtotal")}</span>
                  <span className="text-[#1A1A1A]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#7A7167]">{t("cart.shipping")}</span>
                  <span className={shipping === 0 ? "text-[#1A4D3A]" : "text-[#1A1A1A]"}>
                    {shipping === 0 ? "FREE" : formatPrice(shipping)}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-[#9A9187]">
                    Free shipping on orders over DZD 200
                  </p>
                )}
                <div className="border-t border-[#E8E4DF] pt-3 flex justify-between">
                  <span className="font-medium text-[#0F281F]">{t("cart.total")}</span>
                  <span className="font-semibold text-[#0F281F]">{formatPrice(total)}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="block w-full bg-[#C9A96E] text-[#0F281F] text-center py-3.5 rounded-full font-semibold text-sm uppercase tracking-wider hover:bg-[#d4b87a] transition-colors mb-3"
              >
                {t("cart.checkout")}
              </Link>
              <Link
                to="/shop"
                className="block w-full text-center text-sm text-[#9A9187] hover:text-[#1A1A1A] transition-colors"
              >
                {t("cart.continue")}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
