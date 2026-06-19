import { useState } from "react";
import { useParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Package, Truck, CheckCircle, Clock } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { trpc } from "@/providers/trpc";

export default function TrackOrder() {
  const { orderNumber: paramOrderNumber } = useParams<{ orderNumber?: string }>();
  const { t } = useLanguage();
  const [orderNum, setOrderNum] = useState(paramOrderNumber || "");
  const [searchTriggered, setSearchTriggered] = useState(!!paramOrderNumber);

  const { data: order, isLoading } = trpc.orders.trackOrder.useQuery(
    { orderNumber: orderNum },
    { enabled: searchTriggered && !!orderNum }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTriggered(true);
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "DZD",
    }).format(parseFloat(price));
  };

  const statusIcons = {
    ordered: Clock,
    processing: Package,
    shipped: Truck,
    delivered: CheckCircle,
  };

  return (
    <main className="pt-16">
      <section className="max-w-[800px] mx-auto px-6 py-12">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-[Playfair_Display] text-3xl text-[#0F281F] font-medium text-center mb-8"
        >
          {t("track.title")}
        </motion.h1>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-12 max-w-[500px] mx-auto">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9187]" />
            <input
              type="text"
              value={orderNum}
              onChange={(e) => setOrderNum(e.target.value)}
              placeholder={t("track.orderNumber")}
              className="w-full pl-11 pr-4 py-3 border border-[#E8E4DF] rounded-full text-sm text-[#1A1A1A] placeholder-[#9A9187] focus:outline-none focus:border-[#C9A96E]"
            />
          </div>
          <button
            type="submit"
            className="bg-[#0F281F] text-white px-6 py-3 rounded-full text-sm font-semibold uppercase tracking-wider hover:bg-[#1A4D3A] transition-colors"
          >
            {t("track.search")}
          </button>
        </form>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Order Not Found */}
        {searchTriggered && !isLoading && !order && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Package className="w-12 h-12 text-[#D1CCC4] mx-auto mb-4" />
            <p className="text-[#9A9187]">{t("track.notFound")}</p>
          </motion.div>
        )}

        {/* Order Details */}
        <AnimatePresence>
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Order Info */}
              <div className="bg-white rounded-xl border border-[#E8E4DF] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-[#9A9187]">{t("track.orderNumber")}</p>
                    <p className="text-lg font-semibold text-[#0F281F]">{order.orderNumber}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                      order.status === "delivered"
                        ? "bg-[#1A4D3A]/10 text-[#1A4D3A]"
                        : order.status === "cancelled"
                        ? "bg-[#8B2D3B]/10 text-[#8B2D3B]"
                        : "bg-[#C9A96E]/10 text-[#C9A96E]"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-[#9A9187] text-xs">Date</p>
                    <p className="text-[#1A1A1A]">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[#9A9187] text-xs">Total</p>
                    <p className="text-[#1A1A1A] font-medium">{formatPrice(order.total)}</p>
                  </div>
                  <div>
                    <p className="text-[#9A9187] text-xs">Items</p>
                    <p className="text-[#1A1A1A]">{order.items?.length || 0}</p>
                  </div>
                  {order.trackingNumber && (
                    <div>
                      <p className="text-[#9A9187] text-xs">Tracking</p>
                      <p className="text-[#1A1A1A] font-medium">{order.trackingNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-xl border border-[#E8E4DF] p-6">
                <h3 className="font-medium text-[#0F281F] mb-6">{t("track.timeline")}</h3>
                <div className="space-y-0">
                  {order.timeline?.map((step: { step: string; label: string; completed: boolean; date: Date | null }, i: number) => {
                    const Icon = statusIcons[step.step as keyof typeof statusIcons] || Clock;
                    return (
                      <div key={step.step} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              step.completed
                                ? (order.status === "cancelled" && step.step === "processing" ? "bg-[#8B2D3B] text-white" : "bg-[#1A4D3A] text-white")
                                : "bg-[#E8E4DF] text-[#9A9187]"
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          {i < (order.timeline?.length || 0) - 1 && (
                            <div
                              className={`w-0.5 h-12 ${
                                step.completed ? (order.status === "cancelled" && step.step === "processing" ? "bg-[#E8E4DF]" : "bg-[#1A4D3A]") : "bg-[#E8E4DF]"
                              }`}
                            />
                          )}
                        </div>
                        <div className="pt-1.5">
                          <p
                            className={`text-sm font-medium ${
                              step.completed ? (order.status === "cancelled" && step.step === "processing" ? "text-[#8B2D3B]" : "text-[#0F281F]") : "text-[#9A9187]"
                            }`}
                          >
                            {step.label}
                          </p>
                          {step.date && (
                            <p className="text-xs text-[#9A9187] mt-0.5">
                              {new Date(step.date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-xl border border-[#E8E4DF] p-6">
                <h3 className="font-medium text-[#0F281F] mb-4">Items</h3>
                <div className="space-y-4">
                  {order.items?.map((item: { id: number; productName: string; productImage: string | null; quantity: number; unitPrice: string; totalPrice: string }) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-[#F5F0EB] overflow-hidden shrink-0">
                        {item.productImage && (
                          <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#1A1A1A]">{item.productName}</p>
                        <p className="text-xs text-[#9A9187]">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-medium text-[#0F281F]">
                        {formatPrice(item.totalPrice)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}
