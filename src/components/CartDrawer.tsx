import { Link } from "react-router";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useCart, getItemPrice } from "@/hooks/useCart";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { t } = useLanguage();
  const { items, updateQuantity, removeFromCart, subtotal, isLoading } = useCart();

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "DZD",
    }).format(typeof price === "string" ? parseFloat(price) : price);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[55]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-[420px] bg-white z-[56] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E4DF]">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#0F281F]" />
                <h2 className="text-lg font-[Playfair_Display] font-medium text-[#0F281F]">
                  {t("cart.title")}{" "}
                  <span className="text-sm text-[#9A9187]">
                    ({items.length} {items.length === 1 ? t("cart.item") : t("cart.items")})
                  </span>
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-[#F5F0EB] flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-[#1A1A1A]" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-6 h-6 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-12 h-12 text-[#D1CCC4] mb-4" />
                  <p className="text-[#9A9187] text-sm">{t("cart.empty")}</p>
                  <button
                    onClick={onClose}
                    className="mt-4 text-[#1A4D3A] text-sm font-medium underline underline-offset-4 hover:text-[#0F281F]"
                  >
                    {t("cart.continue")}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex gap-4 pb-4 border-b border-[#E8E4DF]"
                      >
                        {/* Image */}
                        <Link
                          to={`/product/${item.product?.slug || ""}`}
                          onClick={onClose}
                          className="w-20 h-20 rounded-lg bg-[#F5F0EB] overflow-hidden shrink-0"
                        >
                          {item.product?.image && (
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </Link>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/product/${item.product?.slug || ""}`}
                            onClick={onClose}
                          >
                            <h3 className="text-sm font-medium text-[#1A1A1A] line-clamp-1 hover:text-[#1A4D3A] transition-colors">
                              {item.product?.name}
                            </h3>
                          </Link>
                          {item.size && (
                            <p className="text-xs text-[#9A9187] mt-0.5">
                              {t("products.size")}: {item.size}
                            </p>
                          )}
                          <p className="text-sm font-semibold text-[#0F281F] mt-1">
                            {formatPrice(getItemPrice(item))}
                          </p>

                          {/* Quantity */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1 border border-[#E8E4DF] rounded-full">
                              <button
                                onClick={() =>
                                  item.quantity > 1 &&
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                className="w-7 h-7 flex items-center justify-center hover:bg-[#F5F0EB] rounded-full transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-medium w-6 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="w-7 h-7 flex items-center justify-center hover:bg-[#F5F0EB] rounded-full transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-[#9A9187] hover:text-[#8B2D3B] transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-[#E8E4DF] px-6 py-4 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[#9A9187]">{t("cart.subtotal")}</span>
                  <span className="font-semibold text-[#0F281F]">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <Link
                  to="/checkout"
                  onClick={onClose}
                  className="block w-full bg-[#C9A96E] text-[#0F281F] text-center py-3 rounded-full font-semibold text-sm uppercase tracking-wider hover:bg-[#d4b87a] transition-colors"
                >
                  {t("cart.checkout")}
                </Link>
                <button
                  onClick={onClose}
                  className="block w-full text-center text-sm text-[#9A9187] hover:text-[#1A1A1A] transition-colors"
                >
                  {t("cart.continue")}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
