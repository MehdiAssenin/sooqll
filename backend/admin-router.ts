import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { products, categories, orders, orderItems, testimonials, users } from "@db/schema";
import { eq, desc, like, and } from "drizzle-orm";

export const adminRouter = createRouter({
  // ===== PRODUCT MANAGEMENT =====

  // Create product
  createProduct: adminQuery
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        price: z.number().positive(),
        compareAtPrice: z.number().optional(),
        image: z.string().min(1),
        images: z.array(z.string()).optional(),
        categoryId: z.number().optional(),
        brand: z.string().optional(),
        scentFamily: z.string().optional(),
        sizes: z.array(z.string()).optional(),
        stock: z.number().default(0),
        isActive: z.enum(["active", "inactive"]).default("active"),
        isFeatured: z.enum(["yes", "no"]).default("no"),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const [product] = await db.insert(products).values({
        name: input.name,
        slug: input.slug,
        description: input.description || null,
        price: input.price.toFixed(2),
        compareAtPrice: input.compareAtPrice ? input.compareAtPrice.toFixed(2) : null,
        image: input.image,
        images: input.images || null,
        categoryId: input.categoryId || null,
        brand: input.brand || null,
        scentFamily: input.scentFamily || null,
        sizes: input.sizes || null,
        stock: input.stock,
        isActive: input.isActive,
        isFeatured: input.isFeatured,
        tags: input.tags || null,
      }).returning();
      return { success: true, productId: product.id };
    }),

  // Update product
  updateProduct: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
        price: z.number().optional(),
        compareAtPrice: z.number().optional(),
        image: z.string().optional(),
        images: z.array(z.string()).optional(),
        categoryId: z.number().optional(),
        brand: z.string().optional(),
        scentFamily: z.string().optional(),
        sizes: z.array(z.string()).optional(),
        stock: z.number().optional(),
        isActive: z.enum(["active", "inactive"]).optional(),
        isFeatured: z.enum(["yes", "no"]).optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;

      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.slug !== undefined) updateData.slug = data.slug;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.price !== undefined) updateData.price = data.price.toFixed(2);
      if (data.compareAtPrice !== undefined) updateData.compareAtPrice = data.compareAtPrice ? data.compareAtPrice.toFixed(2) : null;
      if (data.image !== undefined) updateData.image = data.image;
      if (data.images !== undefined) updateData.images = data.images;
      if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
      if (data.brand !== undefined) updateData.brand = data.brand;
      if (data.scentFamily !== undefined) updateData.scentFamily = data.scentFamily;
      if (data.sizes !== undefined) updateData.sizes = data.sizes;
      if (data.stock !== undefined) updateData.stock = data.stock;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
      if (data.tags !== undefined) updateData.tags = data.tags;

      await db.update(products).set(updateData).where(eq(products.id, id));
      return { success: true };
    }),

  // Delete product
  deleteProduct: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(products).where(eq(products.id, input.id));
      return { success: true };
    }),

  // ===== CATEGORY MANAGEMENT =====

  // Create category
  createCategory: adminQuery
    .input(
      z.object({
        nameEn: z.string().min(1),
        nameFr: z.string().optional(),
        slug: z.string().min(1),
        image: z.string().optional(),
        descriptionEn: z.string().optional(),
        descriptionFr: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const [cat] = await db.insert(categories).values({
        nameEn: input.nameEn,
        nameFr: input.nameFr || null,
        slug: input.slug,
        image: input.image || null,
        descriptionEn: input.descriptionEn || null,
        descriptionFr: input.descriptionFr || null,
      }).returning();
      return { success: true, categoryId: cat.id };
    }),

  // ===== TESTIMONIAL MANAGEMENT =====

  // Create testimonial
  createTestimonial: adminQuery
    .input(
      z.object({
        name: z.string().min(1),
        location: z.string().optional(),
        rating: z.number().min(1).max(5).default(5),
        comment: z.string().min(1),
        isActive: z.enum(["active", "inactive"]).default("active"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(testimonials).values({
        name: input.name,
        location: input.location || null,
        rating: input.rating,
        comment: input.comment,
        isActive: input.isActive,
      });
      return { success: true };
    }),

  // ===== CUSTOMER MANAGEMENT =====

  // Get all customers
  getCustomers: adminQuery
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];

      if (input?.search) {
        conditions.push(like(users.name || "", `%${input.search}%`));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      return db
        .select()
        .from(users)
        .where(whereClause)
        .orderBy(desc(users.createdAt))
        .limit(input?.limit || 50)
        .offset(input?.offset || 0);
    }),

  // Get analytics
  getAnalytics: adminQuery.query(async () => {
    const db = getDb();

    const allOrders = await db.select().from(orders);
    const allProducts = await db.select().from(products);
    const allUsers = await db.select().from(users);

    // Calculate metrics
    const totalSales = allOrders
      .filter((o) => o.paymentStatus === "paid")
      .reduce((sum, o) => sum + parseFloat(o.total), 0);

    const totalOrders = allOrders.length;
    const totalCustomers = allUsers.filter((u) => u.role === "user").length;
    const totalProducts = allProducts.length;

    // Orders by status
    const ordersByStatus = {
      pending: allOrders.filter((o) => o.status === "pending").length,
      processing: allOrders.filter((o) => o.status === "processing").length,
      shipped: allOrders.filter((o) => o.status === "shipped").length,
      delivered: allOrders.filter((o) => o.status === "delivered").length,
      cancelled: allOrders.filter((o) => o.status === "cancelled").length,
    };

    // Sales by day (last 30 days)
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
      .map(([date, sales]) => ({ date, sales: Math.round(sales * 100) / 100 }))
      .reverse();

    // Top products by order count
    const allOrderItems = await db.select().from(orderItems);
    const productCounts: Record<number, { name: string; count: number; revenue: number }> = {};

    allOrderItems.forEach((item) => {
      if (!productCounts[item.productId]) {
        productCounts[item.productId] = {
          name: item.productName,
          count: 0,
          revenue: 0,
        };
      }
      productCounts[item.productId].count += item.quantity;
      productCounts[item.productId].revenue += parseFloat(item.totalPrice);
    });

    const topProducts = Object.values(productCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalSales: Math.round(totalSales * 100) / 100,
      totalOrders,
      totalCustomers,
      totalProducts,
      conversionRate: totalCustomers > 0 ? Math.round((totalOrders / totalCustomers) * 100) / 100 : 0,
      ordersByStatus,
      salesChart,
      topProducts,
    };
  }),
});
