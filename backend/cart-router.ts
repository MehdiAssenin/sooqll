import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { cartItems, products } from "@db/schema";
import { eq, and, sql } from "drizzle-orm";

export const cartRouter = createRouter({
  // Get cart items - works for both logged in and guest users
  getCart: publicQuery
    .input(z.object({ sessionId: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user?.id;
      const sessionId = input?.sessionId;

      let items;
      if (userId) {
        items = await db.select().from(cartItems).where(eq(cartItems.userId, userId));
      } else if (sessionId) {
        items = await db.select().from(cartItems).where(eq(cartItems.sessionId, sessionId));
      } else {
        return [];
      }

      // Enrich with product details
      const enriched = await Promise.all(
        items.map(async (item) => {
          const product = await db
            .select()
            .from(products)
            .where(eq(products.id, item.productId))
            .limit(1);
          return {
            ...item,
            product: product[0] || null,
          };
        })
      );

      return enriched;
    }),

  // Add item to cart
  addToCart: publicQuery
    .input(
      z.object({
        productId: z.number(),
        quantity: z.number().min(1).default(1),
        size: z.string().optional(),
        sessionId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user?.id;
      const sessionId = input.sessionId;

      // Check if item already in cart
      let existing;
      if (userId) {
        existing = await db
          .select()
          .from(cartItems)
          .where(
            and(
              eq(cartItems.userId, userId),
              eq(cartItems.productId, input.productId),
              input.size ? eq(cartItems.size, input.size) : sql`${cartItems.size} IS NULL`
            )
          )
          .limit(1);
      } else if (sessionId) {
        existing = await db
          .select()
          .from(cartItems)
          .where(
            and(
              eq(cartItems.sessionId, sessionId),
              eq(cartItems.productId, input.productId),
              input.size ? eq(cartItems.size, input.size) : sql`${cartItems.size} IS NULL`
            )
          )
          .limit(1);
      }

      if (existing && existing[0]) {
        // Update quantity
        await db
          .update(cartItems)
          .set({ quantity: existing[0].quantity + input.quantity })
          .where(eq(cartItems.id, existing[0].id));
        return { success: true, action: "updated" };
      }

      // Insert new item
      await db.insert(cartItems).values({
        userId: userId || null,
        sessionId: sessionId || null,
        productId: input.productId,
        quantity: input.quantity,
        size: input.size || null,
      });

      return { success: true, action: "added" };
    }),

  // Update cart item quantity
  updateQuantity: publicQuery
    .input(
      z.object({
        cartItemId: z.number(),
        quantity: z.number().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(cartItems)
        .set({ quantity: input.quantity })
        .where(eq(cartItems.id, input.cartItemId));
      return { success: true };
    }),

  // Remove item from cart
  removeFromCart: publicQuery
    .input(z.object({ cartItemId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(cartItems).where(eq(cartItems.id, input.cartItemId));
      return { success: true };
    }),

  // Clear cart
  clearCart: publicQuery
    .input(z.object({ sessionId: z.string().optional() }).optional())
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user?.id;
      const sessionId = input?.sessionId;

      if (userId) {
        await db.delete(cartItems).where(eq(cartItems.userId, userId));
      } else if (sessionId) {
        await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
      }

      return { success: true };
    }),
});
