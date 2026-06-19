import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function Admin() {
  const { t } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Redirect if not admin
  if (!authLoading && (!user || user.role !== "admin")) {
    navigate("/");
    return null;
  }

  const { data: stats } = trpc.orders.getDashboardStats.useQuery(undefined, {
    enabled: user?.role === "admin",
  });



  const { data: orders } = trpc.orders.getAllOrders.useQuery(undefined, {
    enabled: activeTab === "orders" && user?.role === "admin",
  });

  const { data: customers } = trpc.admin.getCustomers.useQuery(undefined, {
    enabled: activeTab === "customers" && user?.role === "admin",
  });

  const { data: analytics } = trpc.admin.getAnalytics.useQuery(undefined, {
    enabled: activeTab === "analytics" && user?.role === "admin",
  });

  const utils = trpc.useContext();
  const updateOrderMutation = trpc.orders.updateOrderStatus.useMutation({
    onSuccess: () => {
      utils.orders.getAllOrders.invalidate();
    }
  });

  const deleteOrderMutation = trpc.orders.deleteOrder.useMutation({
    onSuccess: () => {
      utils.orders.getAllOrders.invalidate();
      utils.orders.getDashboardStats.invalidate();
      setSelectedOrder(null);
    },
    onError: (error) => {
      console.error("Delete order error:", error);
      alert("Failed to delete order: " + error.message);
    }
  });

  const formatPrice = (price: number | string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "DZD",
    }).format(typeof price === "string" ? parseFloat(price) : price);
  };

  const sidebarItems = [
    { id: "dashboard", label: t("admin.overview"), icon: LayoutDashboard },
    { id: "products", label: t("admin.products"), icon: Package },
    { id: "orders", label: t("admin.orders"), icon: ShoppingCart },
    { id: "customers", label: t("admin.customers"), icon: Users },
    { id: "analytics", label: t("admin.analytics"), icon: BarChart3 },
    { id: "settings", label: t("admin.settings"), icon: Settings },
  ];

  return (
    <div className="pt-16 min-h-screen bg-[#FAFAFA] flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F281F] min-h-screen fixed left-0 top-16 bottom-0 overflow-y-auto hidden lg:block">
        <div className="p-6">
          <h2 className="font-[Playfair_Display] text-lg text-[#C9A96E] font-medium mb-8">
            L'ÉLÉGANCE
          </h2>
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  activeTab === item.id
                    ? "bg-[#C9A96E]/20 text-[#C9A96E]"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-16 left-0 right-0 z-30 bg-[#0F281F] px-4 py-2 overflow-x-auto flex gap-2">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
              activeTab === item.id
                ? "bg-[#C9A96E] text-[#0F281F]"
                : "text-white/70"
            }`}
          >
            <item.icon className="w-3.5 h-3.5" />
            {item.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-6 lg:p-8 mt-10 lg:mt-0">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && stats && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-[Playfair_Display] text-3xl text-[#0F281F] mb-8">{t("admin.title")}</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: t("admin.totalSales"), value: formatPrice(stats.totalSales), icon: DollarSign, color: "bg-[#C9A96E]" },
                { label: t("admin.totalOrders"), value: stats.totalOrders.toString(), icon: ShoppingCart, color: "bg-[#1A4D3A]" },
                { label: t("admin.customers"), value: stats.totalProducts.toString(), icon: Users, color: "bg-[#0F281F]" },
                { label: t("admin.pending"), value: stats.pendingOrders.toString(), icon: AlertCircle, color: "bg-[#8B2D3B]" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-xl p-5 border border-[#E8E4DF]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-[#9A9187]">{stat.label}</span>
                    <div className={`w-8 h-8 ${stat.color} rounded-lg flex items-center justify-center`}>
                      <stat.icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className="text-2xl font-semibold text-[#0F281F]">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl border border-[#E8E4DF]/50 shadow-sm p-6 mb-8">
              <h3 className="font-medium text-[#0F281F] mb-4">{t("admin.recentOrders")}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E8E4DF]">
                      <th className="text-left py-3 text-[#9A9187] font-medium">Order</th>
                      <th className="text-left py-3 text-[#9A9187] font-medium">Customer</th>
                      <th className="text-left py-3 text-[#9A9187] font-medium">Date</th>
                      <th className="text-left py-3 text-[#9A9187] font-medium">Total</th>
                      <th className="text-left py-3 text-[#9A9187] font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders?.map((order) => (
                      <tr key={order.id} className="border-b border-[#F5F0EB]">
                        <td className="py-3 font-medium text-[#0F281F]">{order.orderNumber}</td>
                        <td className="py-3 text-[#1A1A1A]">{order.customerName}</td>
                        <td className="py-3 text-[#9A9187]">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 font-medium text-[#0F281F]">{formatPrice(order.total)}</td>
                        <td className="py-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              order.status === "delivered"
                                ? "bg-[#1A4D3A]/10 text-[#1A4D3A]"
                                : order.status === "pending"
                                ? "bg-[#C9A96E]/10 text-[#C9A96E]"
                                : "bg-[#8B2D3B]/10 text-[#8B2D3B]"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sales Chart */}
            <div className="bg-white rounded-xl border border-[#E8E4DF]/50 shadow-sm p-6">
              <h3 className="font-medium text-[#0F281F] mb-4">{t("admin.salesChart")}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.salesChart || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DF" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9A9187" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#9A9187" }} tickFormatter={(v) => `DZD ${v}`} />
                  <Tooltip
                    formatter={(value: number) => [`DZD ${value.toFixed(2)}`, "Sales"]}
                    contentStyle={{ borderRadius: 8, border: "1px solid #E8E4DF", fontSize: 12 }}
                  />
                  <Line type="monotone" dataKey="sales" stroke="#C9A96E" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && <AdminProductsTab />}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-[Playfair_Display] text-3xl text-[#0F281F] mb-8">{t("admin.orders")}</h1>

            <div className="bg-white rounded-xl border border-[#E8E4DF]/50 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E8E4DF] bg-[#F5F0EB]">
                      <th className="text-left py-3 px-4 text-[#9A9187] font-medium">Order</th>
                      <th className="text-left py-3 px-4 text-[#9A9187] font-medium">Customer</th>
                      <th className="text-left py-3 px-4 text-[#9A9187] font-medium">Date</th>
                      <th className="text-left py-3 px-4 text-[#9A9187] font-medium">Total</th>
                      <th className="text-left py-3 px-4 text-[#9A9187] font-medium">Payment</th>
                      <th className="text-left py-3 px-4 text-[#9A9187] font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-[#9A9187] font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders?.map((order) => (
                      <tr key={order.id} className="border-b border-[#F5F0EB] hover:bg-[#F5F0EB]/50">
                        <td className="py-3 px-4 font-medium text-[#0F281F]">{order.orderNumber}</td>
                        <td className="py-3 px-4 text-[#1A1A1A]">{order.customerName}</td>
                        <td className="py-3 px-4 text-[#9A9187]">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4 font-medium">{formatPrice(order.total)}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs ${order.paymentStatus === "paid" ? "text-[#1A4D3A]" : "text-[#8B2D3B]"}`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              order.status === "delivered"
                                ? "bg-[#1A4D3A]/10 text-[#1A4D3A]"
                                : order.status === "pending"
                                ? "bg-[#C9A96E]/10 text-[#C9A96E]"
                                : order.status === "shipped"
                                ? "bg-[#0F281F]/10 text-[#0F281F]"
                                : order.status === "processing"
                                ? "bg-[#1A4D3A]/20 text-[#1A4D3A]"
                                : "bg-[#8B2D3B]/10 text-[#8B2D3B]"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-2">
                            <button 
                              onClick={() => setSelectedOrder(order)}
                              className="px-3 py-1 bg-[#F5F0EB] text-[#1A1A1A] rounded text-xs hover:bg-[#E8E4DF] transition-colors"
                            >
                              Details
                            </button>
                            {order.status === "pending" && (
                              <>
                                <button 
                                  onClick={() => updateOrderMutation.mutate({ orderId: order.id, status: "processing" })}
                                  disabled={updateOrderMutation.isPending}
                                  className="px-3 py-1 bg-[#1A4D3A] text-white rounded text-xs hover:bg-[#1A4D3A]/90 transition-colors"
                                >
                                  Confirm
                                </button>
                                <button 
                                  onClick={() => updateOrderMutation.mutate({ orderId: order.id, status: "cancelled" })}
                                  disabled={updateOrderMutation.isPending}
                                  className="px-3 py-1 bg-[#8B2D3B] text-white rounded text-xs hover:bg-[#8B2D3B]/90 transition-colors"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {order.status === "processing" && (
                              <button 
                                onClick={() => updateOrderMutation.mutate({ orderId: order.id, status: "shipped" })}
                                disabled={updateOrderMutation.isPending}
                                className="px-3 py-1 bg-[#0F281F] text-white rounded text-xs hover:bg-[#0F281F]/90 transition-colors"
                              >
                                Ship
                              </button>
                            )}
                            {order.status === "shipped" && (
                              <button 
                                onClick={() => updateOrderMutation.mutate({ orderId: order.id, status: "delivered" })}
                                disabled={updateOrderMutation.isPending}
                                className="px-3 py-1 bg-[#1A4D3A]/80 text-white rounded text-xs hover:bg-[#1A4D3A] transition-colors"
                              >
                                Deliver
                              </button>
                            )}
                            <button 
                              onClick={() => {
                                deleteOrderMutation.mutate({ orderId: order.id });
                              }}
                              disabled={deleteOrderMutation.isPending}
                              className="px-3 py-1 bg-[#8B2D3B]/10 text-[#8B2D3B] rounded text-xs hover:bg-[#8B2D3B]/20 transition-colors"
                            >
                              {deleteOrderMutation.isPending ? "..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                  <div className="p-6 border-b border-[#E8E4DF] flex justify-between items-center shrink-0">
                    <h2 className="font-[Playfair_Display] text-xl text-[#0F281F]">
                      Order Details: {selectedOrder.orderNumber}
                    </h2>
                    <button onClick={() => setSelectedOrder(null)} className="text-[#9A9187] hover:text-[#1A1A1A]">
                      X
                    </button>
                  </div>
                  <div className="p-6 overflow-y-auto space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">Customer Information</h3>
                      <div className="bg-[#F5F0EB] p-4 rounded-lg grid grid-cols-2 gap-4 text-sm">
                        <div><span className="text-[#7A7167]">Name:</span> {selectedOrder.customerName}</div>
                        <div><span className="text-[#7A7167]">Email:</span> {selectedOrder.customerEmail}</div>
                        <div><span className="text-[#7A7167]">Phone:</span> {selectedOrder.customerPhone || "N/A"}</div>
                        <div><span className="text-[#7A7167]">City:</span> {selectedOrder.shippingCity}</div>
                        <div className="col-span-2"><span className="text-[#7A7167]">Address:</span> {selectedOrder.shippingAddress}</div>
                        <div className="col-span-2"><span className="text-[#7A7167]">Postal Code:</span> {selectedOrder.shippingPostalCode}</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 border-t border-[#E8E4DF] flex justify-end shrink-0">
                    <button onClick={() => setSelectedOrder(null)} className="px-4 py-2 bg-[#E8E4DF] text-[#1A1A1A] rounded-full text-sm font-medium hover:bg-[#dcd8d3]">
                      Close
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}

        {/* Customers Tab */}
        {activeTab === "customers" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-[Playfair_Display] text-3xl text-[#0F281F] mb-8">{t("admin.customers")}</h1>

            <div className="bg-white rounded-xl border border-[#E8E4DF]/50 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E8E4DF] bg-[#F5F0EB]">
                      <th className="text-left py-3 px-4 text-[#9A9187] font-medium">Name</th>
                      <th className="text-left py-3 px-4 text-[#9A9187] font-medium">Email</th>
                      <th className="text-left py-3 px-4 text-[#9A9187] font-medium">Role</th>
                      <th className="text-left py-3 px-4 text-[#9A9187] font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers?.map((customer) => (
                      <tr key={customer.id} className="border-b border-[#F5F0EB] hover:bg-[#F5F0EB]/50">
                        <td className="py-3 px-4 font-medium text-[#1A1A1A]">{customer.name || "N/A"}</td>
                        <td className="py-3 px-4 text-[#9A9187]">{customer.email || "N/A"}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${customer.role === "admin" ? "bg-[#C9A96E]/10 text-[#C9A96E]" : "bg-[#E8E4DF] text-[#7A7167]"}`}>
                            {customer.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#9A9187]">{new Date(customer.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && analytics && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-[Playfair_Display] text-3xl text-[#0F281F] mb-8">{t("admin.analytics")}</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: t("admin.totalSales"), value: formatPrice(analytics.totalSales), icon: DollarSign },
                { label: t("admin.totalOrders"), value: analytics.totalOrders.toString(), icon: ShoppingCart },
                { label: t("admin.customers"), value: analytics.totalCustomers.toString(), icon: Users },
                { label: t("admin.conversion"), value: `${(analytics.conversionRate * 100).toFixed(1)}%`, icon: TrendingUp },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-xl p-5 border border-[#E8E4DF]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-[#9A9187]">{stat.label}</span>
                    <stat.icon className="w-4 h-4 text-[#C9A96E]" />
                  </div>
                  <p className="text-2xl font-semibold text-[#0F281F]">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-[#E8E4DF]/50 shadow-sm p-6">
                <h3 className="font-medium text-[#0F281F] mb-4">Sales Trend</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={analytics.salesChart || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DF" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9A9187" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#9A9187" }} tickFormatter={(v) => `DZD ${v}`} />
                    <Tooltip formatter={(value: number) => [`DZD ${value.toFixed(2)}`, "Sales"]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey="sales" stroke="#C9A96E" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl border border-[#E8E4DF]/50 shadow-sm p-6">
                <h3 className="font-medium text-[#0F281F] mb-4">{t("admin.topProducts")}</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics.topProducts || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DF" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#9A9187" }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#9A9187" }} width={100} />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" fill="#C9A96E" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}


        {activeTab === "settings" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-[Playfair_Display] text-2xl text-[#0F281F] mb-6">{t("admin.settings")}</h1>
            <div className="bg-white rounded-xl border border-[#E8E4DF]/50 shadow-sm p-6 max-w-lg">
              <p className="text-[#9A9187] text-sm">Settings coming soon. Contact your developer for configuration changes.</p>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}



// ========== Admin Products Tab Component ==========
function AdminProductsTab() {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    image: "",
    sizes: [] as { size: string, price: number }[],
    stock: 0,
    isActive: "active" as "active" | "inactive",
    volume: "",
    ingredients: "",
    topNotes: "",
    heartNotes: "",
    baseNotes: "",
  });

  const { data: products, refetch } = trpc.products.getProducts.useQuery({ limit: 100, includeInactive: true });
  
  const addMutation = trpc.products.addProduct.useMutation({
    onSuccess: () => {
      refetch();
      setIsModalOpen(false);
      resetForm();
    }
  });

  const updateMutation = trpc.products.updateProduct.useMutation({
    onSuccess: () => {
      refetch();
      setIsModalOpen(false);
      resetForm();
    }
  });

  const deleteMutation = trpc.products.deleteProduct.useMutation({
    onSuccess: () => refetch()
  });

  const formatPrice = (price: number | string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "DZD",
    }).format(typeof price === "string" ? parseFloat(price) : price);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setForm({
      name: "",
      slug: "",
      description: "",
      price: "",
      image: "",
      sizes: [],
      stock: 0,
      isActive: "active",
      volume: "",
      ingredients: "",
      topNotes: "",
      heartNotes: "",
      baseNotes: "",
    });
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      price: product.price,
      image: product.image,
      sizes: product.sizes ? (typeof product.sizes === "string" ? JSON.parse(product.sizes) : product.sizes) : [],
      stock: product.stock,
      isActive: product.isActive as "active" | "inactive",
      volume: product.volume || "",
      ingredients: product.ingredients || "",
      topNotes: product.topNotes || "",
      heartNotes: product.heartNotes || "",
      baseNotes: product.baseNotes || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form };
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, ...payload });
    } else {
      addMutation.mutate(payload);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-[Playfair_Display] text-2xl text-[#0F281F]">{t("admin.products")}</h1>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-[#C9A96E] text-[#0F281F] px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#d4b87a] transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t("admin.addProduct")}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#E8E4DF]/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E8E4DF] bg-[#F5F0EB]">
                <th className="text-left py-3 px-4 text-[#9A9187] font-medium">Image</th>
                <th className="text-left py-3 px-4 text-[#9A9187] font-medium">Name</th>
                <th className="text-left py-3 px-4 text-[#9A9187] font-medium">Price</th>
                <th className="text-left py-3 px-4 text-[#9A9187] font-medium">Stock</th>
                <th className="text-left py-3 px-4 text-[#9A9187] font-medium">Status</th>
                <th className="text-left py-3 px-4 text-[#9A9187] font-medium">{t("admin.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {products?.map((product) => (
                <tr key={product.id} className="border-b border-[#F5F0EB] hover:bg-[#F5F0EB]/50">
                  <td className="py-3 px-4">
                    <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                  </td>
                  <td className="py-3 px-4 font-medium text-[#1A1A1A]">{product.name}</td>
                  <td className="py-3 px-4">{formatPrice(product.price)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.stock <= 0 
                        ? "bg-[#8B2D3B]/10 text-[#8B2D3B]" 
                        : product.stock < 10 
                          ? "bg-[#C9A96E]/15 text-[#8B6914]" 
                          : "bg-[#1A4D3A]/10 text-[#1A4D3A]"
                    }`}>
                      {product.stock <= 0 ? "Sold Out" : product.stock}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${product.isActive === "active" ? "bg-[#1A4D3A]/10 text-[#1A4D3A]" : "bg-[#8B2D3B]/10 text-[#8B2D3B]"}`}>
                      {product.isActive}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(product)} className="p-1.5 hover:bg-[#F5F0EB] rounded transition-colors">
                        <Pencil className="w-4 h-4 text-[#9A9187]" />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-1.5 hover:bg-[#F5F0EB] rounded transition-colors">
                        <Trash2 className="w-4 h-4 text-[#8B2D3B]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="font-[Playfair_Display] text-xl text-[#0F281F] mb-6">
              {editingProduct ? "Edit Product" : "Add Product"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#7A7167] mb-1">Name</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#7A7167] mb-1">Slug</label>
                  <input required value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#7A7167] mb-1">Price (DZD)</label>
                  <input required type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#7A7167] mb-1">Stock</label>
                  <input required type="number" value={form.stock} onChange={e => setForm({...form, stock: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#7A7167] mb-1">Product Image</label>
                <div className="flex gap-2">
                  <input 
                    value={form.image} 
                    onChange={e => setForm({...form, image: e.target.value})} 
                    placeholder="Paste image URL or upload a file" 
                    className="flex-1 px-3 py-2 border rounded-lg text-sm" 
                  />
                  <label className="cursor-pointer px-3 py-2 bg-[#F5F0EB] border border-[#E8E4DF] rounded-lg text-xs font-medium text-[#7A7167] hover:bg-[#E8E4DF] transition-colors flex items-center gap-1 whitespace-nowrap">
                    {uploading ? (
                      <><span className="w-3 h-3 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" /> Uploading...</>
                    ) : (
                      <><Plus className="w-3 h-3" /> Upload</>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploading(true);
                        try {
                          const formData = new FormData();
                          formData.append("file", file);
                          const res = await fetch("/api/upload", { method: "POST", body: formData });
                          const data = await res.json();
                          if (data.url) setForm(prev => ({...prev, image: data.url}));
                        } catch (err) {
                          console.error("Upload failed", err);
                        } finally {
                          setUploading(false);
                          e.target.value = "";
                        }
                      }}
                    />
                  </label>
                </div>
                {form.image && (
                  <div className="mt-2 relative w-20 h-20 rounded-lg overflow-hidden bg-[#F5F0EB] border border-[#E8E4DF]">
                    <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-[#7A7167] mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#7A7167] mb-1">Volume (e.g. 50ml)</label>
                  <input value={form.volume} onChange={e => setForm({...form, volume: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#7A7167] mb-1">Top Notes</label>
                  <input value={form.topNotes} onChange={e => setForm({...form, topNotes: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#7A7167] mb-1">Heart Notes</label>
                  <input value={form.heartNotes} onChange={e => setForm({...form, heartNotes: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#7A7167] mb-1">Base Notes</label>
                  <input value={form.baseNotes} onChange={e => setForm({...form, baseNotes: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#7A7167] mb-1">Ingredients</label>
                <textarea value={form.ingredients} onChange={e => setForm({...form, ingredients: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-[#7A7167]">Sizes & Prices</label>
                  <button 
                    type="button" 
                    onClick={() => setForm({...form, sizes: [...form.sizes, { size: "", price: 0 }]})}
                    className="text-xs text-[#1A4D3A] hover:underline"
                  >
                    + Add Size
                  </button>
                </div>
                {form.sizes.map((s, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input 
                      placeholder="Size (e.g. 50ml)" 
                      value={s.size} 
                      onChange={e => {
                        const newSizes = [...form.sizes];
                        newSizes[i].size = e.target.value;
                        setForm({...form, sizes: newSizes});
                      }}
                      className="w-full px-3 py-2 border rounded-lg text-sm" 
                    />
                    <input 
                      type="number" 
                      placeholder="Price (DZD)" 
                      value={s.price || ""} 
                      onChange={e => {
                        const newSizes = [...form.sizes];
                        newSizes[i].price = parseFloat(e.target.value) || 0;
                        setForm({...form, sizes: newSizes});
                      }}
                      className="w-full px-3 py-2 border rounded-lg text-sm" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setForm({...form, sizes: form.sizes.filter((_, idx) => idx !== i)})}
                      className="px-2 text-[#8B2D3B] hover:bg-[#F5F0EB] rounded"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-medium text-[#7A7167] mb-1">Status</label>
                <select value={form.isActive} onChange={e => setForm({...form, isActive: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-full text-sm font-medium hover:bg-[#F5F0EB]">
                  Cancel
                </button>
                <button type="submit" disabled={addMutation.isPending || updateMutation.isPending} className="px-4 py-2 bg-[#C9A96E] text-[#0F281F] rounded-full text-sm font-medium hover:bg-[#d4b87a]">
                  {editingProduct ? "Update Product" : "Add Product"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
