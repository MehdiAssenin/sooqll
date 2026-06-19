import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { products, categories, testimonials, cartItems } from "@db/schema";
import { eq, like, and, desc, sql } from "drizzle-orm";

export const productsRouter = createRouter({
  // Get all categories
  getCategories: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(categories);
  }),

  // Get all products with optional filters
  getProducts: publicQuery
    .input(
      z.object({
        categorySlug: z.string().optional(),
        search: z.string().optional(),
        scentFamily: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        sortBy: z.enum(["newest", "price_asc", "price_desc", "name"]).optional(),
        featured: z.boolean().optional(),
        tags: z.array(z.string()).optional(),
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
        includeInactive: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];

      if (!input?.includeInactive) {
        conditions.push(eq(products.isActive, "active"));
      }

      if (input?.categorySlug) {
        const cat = await db.select().from(categories).where(eq(categories.slug, input.categorySlug)).limit(1);
        if (cat[0]) {
          conditions.push(eq(products.categoryId, cat[0].id));
        }
      }

      if (input?.search) {
        conditions.push(like(products.name, `%${input.search}%`));
      }

      if (input?.scentFamily) {
        conditions.push(eq(products.scentFamily, input.scentFamily));
      }

      if (input?.featured) {
        conditions.push(eq(products.isFeatured, "yes"));
      }

      if (input?.tags && input.tags.length > 0) {
        // Use JSON search for tags
        conditions.push(
          sql`${products.tags} IS NOT NULL`
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      let query = db.select().from(products).where(whereClause);

      if (input?.sortBy === "price_asc") {
        query = query.orderBy(products.price) as typeof query;
      } else if (input?.sortBy === "price_desc") {
        query = query.orderBy(desc(products.price)) as typeof query;
      } else if (input?.sortBy === "name") {
        query = query.orderBy(products.name) as typeof query;
      } else {
        query = query.orderBy(desc(products.createdAt)) as typeof query;
      }

      if (input?.limit) {
        query = query.limit(input.limit) as typeof query;
      }

      if (input?.offset) {
        query = query.offset(input.offset) as typeof query;
      }

      return query;
    }),

  // Get single product by slug
  getProduct: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(products)
        .where(eq(products.slug, input.slug))
        .limit(1);
      return result[0] || null;
    }),

  // Get related products
  getRelatedProducts: publicQuery
    .input(z.object({ productId: z.number(), categoryId: z.number().optional(), limit: z.number().default(4) }))
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [sql`${products.id} != ${input.productId}`];
      
      if (input.categoryId) {
        conditions.push(eq(products.categoryId, input.categoryId));
      }

      return db
        .select()
        .from(products)
        .where(and(...conditions))
        .limit(input.limit);
    }),

  // Get testimonials
  getTestimonials: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(testimonials).where(eq(testimonials.isActive, "active"));
  }),

  // Admin: Add product
  addProduct: adminQuery
    .input(z.object({
      name: z.string(),
      slug: z.string(),
      description: z.string().optional(),
      price: z.string(),
      image: z.string(),
      sizes: z.array(z.object({ size: z.string(), price: z.number() })).optional(),
      stock: z.number().default(0),
      volume: z.string().optional(),
      ingredients: z.string().optional(),
      topNotes: z.string().optional(),
      heartNotes: z.string().optional(),
      baseNotes: z.string().optional(),
      isActive: z.enum(["active", "inactive"]).default("active"),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(products).values({
        ...input,
        isFeatured: "no",
      });
      return { success: true };
    }),

  // Admin: Update product
  updateProduct: adminQuery
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      slug: z.string().optional(),
      description: z.string().optional(),
      price: z.string().optional(),
      image: z.string().optional(),
      sizes: z.array(z.object({ size: z.string(), price: z.number() })).optional(),
      stock: z.number().optional(),
      volume: z.string().optional(),
      ingredients: z.string().optional(),
      topNotes: z.string().optional(),
      heartNotes: z.string().optional(),
      baseNotes: z.string().optional(),
      isActive: z.enum(["active", "inactive"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const db = getDb();
      await db.update(products).set(data).where(eq(products.id, id));
      return { success: true };
    }),

  // Admin: Delete product
  deleteProduct: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      // Remove from carts first
      await db.delete(cartItems).where(eq(cartItems.productId, input.id));
      // Hard delete product
      await db.delete(products).where(eq(products.id, input.id));
      return { success: true };
    }),
});
