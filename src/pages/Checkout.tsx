import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { CreditCard, Truck, Zap, CheckCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useCart, getItemPrice } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import { trpc } from "@/providers/trpc";
import { ALGERIA_WILAYAS } from "@/data/algeria_regions";

export default function Checkout() {
  const { t } = useLanguage();
  const { items, subtotal, clearCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const [form, setForm] = useState({
    name: "",
    instagram: "",
    phone: "",
    wilaya: "",
    baladiya: "",
    address: "",
    deliveryType: "office",
    notes: "",
    country: "الجزائر",
  });

  const createOrder = trpc.orders.createOrder.useMutation({
    onSuccess: (data) => {
      setOrderNumber(data.orderNumber);
      setOrderComplete(true);
      clearCart();
      addToast(t("checkout.success"), "success");
    },
    onError: () => {
      addToast(t("common.error"), "error");
      setIsProcessing(false);
    },
  });

  const selectedWilaya = ALGERIA_WILAYAS.find((w) => w.id.toString() === form.wilaya);
  const shippingCost = selectedWilaya
    ? (form.deliveryType === "home" ? selectedWilaya.homeShipping : selectedWilaya.officeShipping)
    : 0;
  const shipping = subtotal > 20000 ? 0 : shippingCost;
  const total = subtotal + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.wilaya || !form.baladiya) {
      addToast("يرجى تعبئة جميع الحقول المطلوبة", "error");
      return;
    }

    const nameRegex = /^[\u0600-\u06FFa-zA-Z\s]+$/;
    if (!nameRegex.test(form.name)) {
      addToast("الرجاء إدخال اسم صحيح بدون أرقام أو رموز", "error");
      return;
    }

    setIsProcessing(true);

    const sessionId = localStorage.getItem("cart_session_id") || undefined;

    await createOrder.mutateAsync({
      customerName: form.name,
      customerInstagram: form.instagram,
      customerPhone: form.phone,
      shippingAddress: form.address || form.baladiya,
      shippingCity: form.baladiya,
      shippingCountry: form.country,
      shippingMethod: "Standard",
      deliveryType: form.deliveryType,
      notes: form.notes,
      paymentMethod: "cod",
      cartItems: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size || undefined,
      })),
      subtotal,
      shippingCost: shipping,
      tax: 0,
      discount: 0,
      total,
      sessionId: sessionId || undefined,
    });

    setIsProcessing(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "DZD",
    }).format(price);
  };

  if (items.length === 0 && !orderComplete) {
    return (
      <main className="pt-16 min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-[Playfair_Display] text-2xl text-[#0F281F] mb-4">{t("cart.empty")}</h1>
          <button
            onClick={() => navigate("/shop")}
            className="text-[#1A4D3A] font-medium hover:underline"
          >
            {t("cart.continue")}
          </button>
        </div>
      </main>
    );
  }

  if (orderComplete) {
    return (
      <main className="pt-16 min-h-[60vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto px-6"
        >
          <div className="w-16 h-16 bg-[#1A4D3A] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-[Playfair_Display] text-3xl text-[#0F281F] mb-3">
            {t("checkout.success")}
          </h1>
          <p className="text-[#7A7167] mb-2">
            Your order number is:
          </p>
          <p className="font-semibold text-[#0F281F] text-lg mb-6">{orderNumber}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(`/track/${orderNumber}`)}
              className="bg-[#C9A96E] text-[#0F281F] px-6 py-3 rounded-full text-sm font-semibold uppercase tracking-wider hover:bg-[#d4b87a] transition-colors"
            >
              {t("track.title")}
            </button>
            <button
              onClick={() => navigate("/shop")}
              className="border border-[#E8E4DF] text-[#1A1A1A] px-6 py-3 rounded-full text-sm font-medium hover:bg-[#F5F0EB] transition-colors"
            >
              {t("cart.continue")}
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="pt-16">
      <section className="max-w-[1000px] mx-auto px-6 py-12">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-[Playfair_Display] text-3xl text-[#0F281F] font-medium mb-8 text-center"
        >
          {t("checkout.title")}
        </motion.h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[
            { num: 1, label: "Information", icon: null },
            { num: 2, label: "Shipping", icon: null },
            { num: 3, label: "Payment", icon: null },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= s.num
                  ? "bg-[#C9A96E] text-[#0F281F]"
                  : "bg-[#E8E4DF] text-[#9A9187]"
                  }`}
              >
                {s.num}
              </div>
              <span className={`text-xs hidden sm:inline ${step >= s.num ? "text-[#0F281F]" : "text-[#9A9187]"}`}>
                {s.label}
              </span>
              {i < 2 && <div className="w-8 h-px bg-[#E8E4DF] ml-2" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            {/* Step 1: Information */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h2 className="font-medium text-[#0F281F] mb-4">Customer Information </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="Full Name "
                    className="w-full px-4 py-3 border border-[#E8E4DF] rounded-lg text-sm focus:outline-none focus:border-[#C9A96E]"
                  />
                  <input
                    name="instagram"
                    value={form.instagram}
                    onChange={handleInputChange}
                    placeholder="Instagram Account "
                    className="w-full px-4 py-3 border border-[#E8E4DF] rounded-lg text-sm focus:outline-none focus:border-[#C9A96E]"
                  />
                </div>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleInputChange}
                  placeholder="Phone Number "
                  className="w-full px-4 py-3 border border-[#E8E4DF] rounded-lg text-sm focus:outline-none focus:border-[#C9A96E]"
                />

                <button
                  onClick={() => {
                    if (!form.name || !form.phone) {
                      addToast("Name and phone are required / Le nom et le téléphone sont obligatoires", "error");
                      return;
                    }
                    setStep(2);
                  }}
                  className="w-full bg-[#0F281F] text-white py-3.5 rounded-full text-sm font-semibold uppercase tracking-wider hover:bg-[#1A4D3A] transition-colors mt-4"
                >
                  {t("common.next")}
                </button>
              </motion.div>
            )}

            {/* Step 2: Shipping */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h2 className="font-medium text-[#0F281F] mb-4">Shipping Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <select
                    name="wilaya"
                    value={form.wilaya}
                    onChange={(e) => {
                      setForm({ ...form, wilaya: e.target.value, baladiya: "" });
                    }}
                    className="w-full px-4 py-3 border border-[#E8E4DF] rounded-lg text-sm focus:outline-none focus:border-[#C9A96E] bg-white"
                  >
                    <option value="">اختر الولاية...</option>
                    {ALGERIA_WILAYAS.map(w => (
                      <option key={w.id} value={w.id.toString()}>{w.id} - {w.nameEn}</option>
                    ))}
                  </select>

                  <select
                    name="baladiya"
                    value={form.baladiya}
                    onChange={handleInputChange}
                    disabled={!form.wilaya}
                    className="w-full px-4 py-3 border border-[#E8E4DF] rounded-lg text-sm focus:outline-none focus:border-[#C9A96E] bg-white disabled:bg-[#F5F0EB]"
                  >
                    <option value="">اختر البلدية...</option>
                    {selectedWilaya?.communes?.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-4 mb-4">
                  <label className={`flex-1 flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${form.deliveryType === 'office' ? 'border-[#C9A96E] bg-[#C9A96E]/5' : 'border-[#E8E4DF]'}`}>
                    <input type="radio" name="deliveryType" value="office" checked={form.deliveryType === 'office'} onChange={handleInputChange} className="hidden" />
                    <Truck className="w-5 h-5 text-[#1A4D3A]" />
                    <span className="text-sm font-medium">توصيل للمكتب (Office)</span>
                  </label>
                  <label className={`flex-1 flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${form.deliveryType === 'home' ? 'border-[#C9A96E] bg-[#C9A96E]/5' : 'border-[#E8E4DF]'}`}>
                    <input type="radio" name="deliveryType" value="home" checked={form.deliveryType === 'home'} onChange={handleInputChange} className="hidden" />
                    <Zap className="w-5 h-5 text-[#C9A96E]" />
                    <span className="text-sm font-medium">توصيل للمنزل (Home)</span>
                  </label>
                </div>

                <input
                  name="address"
                  value={form.address}
                  onChange={handleInputChange}
                  placeholder="العنوان التفصيلي (إجباري) *"
                  className="w-full px-4 py-3 border border-[#E8E4DF] rounded-lg text-sm focus:outline-none focus:border-[#C9A96E] mb-4"
                />

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleInputChange}
                  placeholder="ملاحظات إضافية للطلب (اختياري)"
                  className="w-full px-4 py-3 border border-[#E8E4DF] rounded-lg text-sm focus:outline-none focus:border-[#C9A96E] min-h-[100px]"
                />

                {subtotal > 20000 && (
                  <p className="text-xs text-[#1A4D3A] bg-[#1A4D3A]/10 rounded-lg p-3">
                    أنت مؤهل للحصول على توصيل مجاني! (Free Shipping)
                  </p>
                )}

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 border border-[#E8E4DF] text-[#1A1A1A] py-3.5 rounded-full text-sm font-medium hover:bg-[#F5F0EB] transition-colors"
                  >
                    {t("common.back")}
                  </button>
                  <button
                    onClick={() => {
                      if (!form.wilaya || !form.baladiya || !form.address) {
                        addToast("يرجى اختيار الولاية والبلدية وكتابة العنوان التفصيلي", "error");
                        return;
                      }
                      setStep(3);
                    }}
                    className="flex-1 bg-[#0F281F] text-white py-3.5 rounded-full text-sm font-semibold uppercase tracking-wider hover:bg-[#1A4D3A] transition-colors"
                  >
                    {t("common.next")}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h2 className="font-medium text-[#0F281F] mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  {t("checkout.payment")}
                </h2>

                <p className="text-sm text-[#7A7167] mb-4">
                  {t("checkout.cashOnDeliveryDesc") || "You will pay for your order in cash upon delivery."}
                </p>
                <div className="bg-[#1A4D3A]/10 border border-[#1A4D3A]/20 rounded-lg p-4 flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-[#1A4D3A] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-[#1A4D3A]">Cash on Delivery (COD)</h3>
                    <p className="text-xs text-[#1A4D3A]/80 mt-1">
                      No payment is required right now. Please have the exact amount ready when the courier arrives.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 border border-[#E8E4DF] text-[#1A1A1A] py-3.5 rounded-full text-sm font-medium hover:bg-[#F5F0EB] transition-colors"
                  >
                    {t("common.back")}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isProcessing}
                    className="flex-1 bg-[#C9A96E] text-[#0F281F] py-3.5 rounded-full text-sm font-semibold uppercase tracking-wider hover:bg-[#d4b87a] transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? t("checkout.processing") : t("checkout.placeOrder")}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-[#F5F0EB] rounded-xl p-6">
              <h3 className="font-medium text-[#0F281F] mb-4">ملخص الطلب (Order Summary)</h3>
              <div className="space-y-3 mb-4 max-h-[200px] overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg bg-white overflow-hidden shrink-0">
                      {item.product?.image && (
                        <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#1A1A1A] truncate">{item.product?.name}</p>
                      <p className="text-xs text-[#9A9187]">الكمية: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-medium text-[#0F281F]">
                      {formatPrice(getItemPrice(item) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#E8E4DF] pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#7A7167]">المجموع الفرعي</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {selectedWilaya && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#7A7167]">التوصيل ({selectedWilaya.nameAr})</span>
                    <span className={shipping === 0 ? "text-[#1A4D3A]" : ""}>
                      {shipping === 0 ? "مجاني" : formatPrice(shipping)}
                    </span>
                  </div>
                )}
                {!selectedWilaya && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#7A7167]">التوصيل</span>
                    <span className="text-[#9A9187]">اختر الولاية</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold pt-2 border-t border-[#E8E4DF]">
                  <span>الإجمالي</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
