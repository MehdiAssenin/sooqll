import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { orders, orderItems, cartItems, products } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";

export const ordersRouter = createRouter({
  // Create a new order
  createOrder: publicQuery
    .input(
      z.object({
        customerName: z.string().min(1),
        customerEmail: z.string().optional(),
        customerInstagram: z.string().optional(),
        customerPhone: z.string().optional(),
        shippingAddress: z.string().min(1),
        shippingCity: z.string().min(1),
        shippingPostalCode: z.string().optional(),
        shippingCountry: z.string().min(1),
        shippingMethod: z.string().default("Standard"),
        deliveryType: z.string().default("office"),
        notes: z.string().optional(),
        paymentMethod: z.string().default("card"),
        cartItems: z.array(
          z.object({
            productId: z.number(),
            quantity: z.number(),
            size: z.string().optional(),
          })
        ),
        subtotal: z.number(),
        shippingCost: z.number().default(0),
        tax: z.number().default(0),
        discount: z.number().default(0),
        total: z.number(),
        userId: z.number().optional(),
        sessionId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Generate order number
      const orderNumber = `LE${Date.now().toString(36).toUpperCase()}`;

      // Create order
      const [order] = await db.insert(orders).values({
        orderNumber,
        userId: input.userId || null,
        customerName: input.customerName,
        customerEmail: input.customerEmail || null,
        customerInstagram: input.customerInstagram || null,
        customerPhone: input.customerPhone || null,
        shippingAddress: input.shippingAddress,
        shippingCity: input.shippingCity,
        shippingPostalCode: input.shippingPostalCode || null,
        shippingCountry: input.shippingCountry,
        shippingMethod: input.shippingMethod,
        deliveryType: input.deliveryType,
        notes: input.notes || null,
        paymentMethod: input.paymentMethod,
        paymentStatus: "pending",
        status: "pending",
        subtotal: input.subtotal.toFixed(2),
        shippingCost: input.shippingCost.toFixed(2),
        tax: input.tax.toFixed(2),
        discount: input.discount.toFixed(2),
        total: input.total.toFixed(2),
      }).returning();

      const orderId = order.id;

      // Create order items and update stock
      for (const item of input.cartItems) {
        const product = await db
          .select()
          .from(products)
          .where(eq(products.id, item.productId))
          .limit(1);

        if (product[0]) {
          let priceStr = product[0].price;
          if (item.size && product[0].sizes) {
            const sizesArr = product[0].sizes as any[];
            const sizeData = sizesArr.find(s => s.size === item.size);
            if (sizeData && sizeData.price) {
              priceStr = sizeData.price.toString();
            }
          }

          await db.insert(orderItems).values({
            orderId,
            productId: item.productId,
            productName: product[0].name,
            productImage: product[0].image,
            quantity: item.quantity,
            size: item.size || null,
            unitPrice: priceStr,
            totalPrice: (parseFloat(priceStr) * item.quantity).toFixed(2),
          });

          // Decrement stock
          const newStock = Math.max(0, product[0].stock - item.quantity);
          await db.update(products).set({ stock: newStock }).where(eq(products.id, item.productId));
        }
      }

      // Clear cart after order
      if (input.userId) {
        await db.delete(cartItems).where(eq(cartItems.userId, input.userId));
      } else if (input.sessionId) {
        await db.delete(cartItems).where(eq(cartItems.sessionId, input.sessionId));
      }

      return { success: true, orderNumber, orderId };
    }),

  // Get order by order number
  getOrder: publicQuery
    .input(z.object({ orderNumber: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const order = await db
        .select()
        .from(orders)
        .where(eq(orders.orderNumber, input.orderNumber))
        .limit(1);

      if (!order[0]) return null;

      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order[0].id));

      return { ...order[0], items };
    }),

  // Track order
  trackOrder: publicQuery
    .input(z.object({ orderNumber: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const order = await db
        .select()
        .from(orders)
        .where(eq(orders.orderNumber, input.orderNumber))
        .limit(1);

      if (!order[0]) return null;

      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order[0].id));

      // Timeline for order tracking
      const timeline = [
        { step: "ordered", label: "Order Placed", date: order[0].createdAt, completed: true },
        { step: "processing", label: order[0].status === "cancelled" ? "Cancelled (Rejected)" : "Confirmed", date: order[0].status !== "pending" ? order[0].updatedAt : null, completed: ["processing", "shipped", "delivered", "cancelled"].includes(order[0].status) },
        { step: "shipped", label: "Shipped", date: order[0].status === "shipped" || order[0].status === "delivered" ? order[0].updatedAt : null, completed: ["shipped", "delivered"].includes(order[0].status) },
        { step: "delivered", label: "Delivered", date: order[0].status === "delivered" ? order[0].updatedAt : null, completed: order[0].status === "delivered" },
      ];

      return { ...order[0], items, timeline };
    }),

  // Get user's orders
  getMyOrders: publicQuery
    .input(z.object({ sessionId: z.string().optional() }).optional())
    .query(async ({ ctx }) => {
      const db = getDb();
      const userId = ctx.user?.id;

      if (userId) {
        return db
          .select()
          .from(orders)
          .where(eq(orders.userId, userId))
          .orderBy(desc(orders.createdAt));
      }

      // For guest users, we can't reliably track orders without email
      return [];
    }),

  // ===== ADMIN ROUTES =====

  // Get all orders (admin)
  getAllOrders: adminQuery
    .input(
      z.object({
        status: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];

      if (input?.status) {
        conditions.push(eq(orders.status, input.status as "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded"));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      return db
        .select()
        .from(orders)
        .where(whereClause)
        .orderBy(desc(orders.createdAt))
        .limit(input?.limit || 50)
        .offset(input?.offset || 0);
    }),

  // Update order status (admin)
  updateOrderStatus: adminQuery
    .input(
      z.object({
        orderId: z.number(),
        status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled", "refunded"]),
        trackingNumber: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const updateData: Record<string, unknown> = { status: input.status };
      if (["processing", "shipped", "delivered"].includes(input.status)) {
        updateData.paymentStatus = "paid";
      } else if (["cancelled", "refunded"].includes(input.status)) {
        updateData.paymentStatus = "refunded";
      }
      if (input.trackingNumber) {
        updateData.trackingNumber = input.trackingNumber;
      }

      await db.update(orders).set(updateData).where(eq(orders.id, input.orderId));
      return { success: true };
    }),

  // Delete order (admin)
  deleteOrder: adminQuery
    .input(z.object({ orderId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(orderItems).where(eq(orderItems.orderId, input.orderId));
      await db.delete(orders).where(eq(orders.id, input.orderId));
      return { success: true };
    }),

  // Get dashboard stats (admin)
  getDashboardStats: adminQuery.query(async () => {
    const db = getDb();

    const allOrders = await db.select().from(orders);
    const allProducts = await db.select().from(products);

    const totalSales = allOrders
      .filter((o) => o.paymentStatus === "paid")
      .reduce((sum, o) => sum + parseFloat(o.total), 0);

    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter((o) => o.status === "pending").length;
    const totalProducts = allProducts.length;
    const lowStockProducts = allProducts.filter((p) => p.stock < 10).length;

    // Recent orders
    const recentOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(10);

    // Sales by day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesByDay: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      salesByDay[d.toISOString().split("T")[0]] = 0;
    }

    allOrders.forEach((o) => {
      if (o.paymentStatus === "paid") {
        const date = o.createdAt.toISOString().split("T")[0];
        if (salesByDay[date] !== undefined) {
          salesByDay[date] += parseFloat(o.total);
        }
      }
    });

    const salesChart = Object.entries(salesByDay)
      .map(([date, sales]) => ({ date, sales }))
      .reverse();

    return {
      totalSales,
      totalOrders,
      pendingOrders,
      totalProducts,
      lowStockProducts,
      recentOrders,
      salesChart,
    };
  }),
});
