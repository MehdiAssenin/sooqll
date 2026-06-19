import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  numeric,
  json,
  boolean,
} from "drizzle-orm/pg-core";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 255 }),
  avatar: text("avatar"),
  role: varchar("role", { length: 20 }).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  nameEn: varchar("nameEn", { length: 255 }).notNull(),
  nameFr: varchar("nameFr", { length: 255 }),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  image: text("image"),
  descriptionEn: text("descriptionEn"),
  descriptionFr: text("descriptionFr"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;

// Products table
export const productStatusEnum = pgEnum("product_status", ["active", "inactive"]);
export const featuredEnum = pgEnum("featured", ["yes", "no"]);

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: numeric("compareAtPrice", { precision: 10, scale: 2 }),
  image: text("image").notNull(),
  images: json("images").$type<string[]>(),
  categoryId: integer("categoryId"),
  brand: varchar("brand", { length: 255 }),
  scentFamily: varchar("scentFamily", { length: 255 }),
  volume: varchar("volume", { length: 100 }),
  ingredients: text("ingredients"),
  topNotes: varchar("topNotes", { length: 255 }),
  heartNotes: varchar("heartNotes", { length: 255 }),
  baseNotes: varchar("baseNotes", { length: 255 }),
  sizes: json("sizes").$type<Array<{ size: string, price: number }>>(),
  stock: integer("stock").default(0).notNull(),
  isActive: varchar("isActive", { length: 10 }).default("active").notNull(),
  isFeatured: varchar("isFeatured", { length: 5 }).default("no").notNull(),
  tags: json("tags").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// Cart items table
export const cartItems = pgTable("cartItems", {
  id: serial("id").primaryKey(),
  userId: integer("userId"),
  sessionId: varchar("sessionId", { length: 255 }),
  productId: integer("productId").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  size: varchar("size", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type CartItem = typeof cartItems.$inferSelect;

// Orders table
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
]);

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("orderNumber", { length: 255 }).notNull().unique(),
  userId: integer("userId"),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }),
  customerInstagram: varchar("customerInstagram", { length: 255 }),
  customerPhone: varchar("customerPhone", { length: 50 }),
  shippingAddress: text("shippingAddress").notNull(),
  shippingCity: varchar("shippingCity", { length: 255 }).notNull(),
  shippingPostalCode: varchar("shippingPostalCode", { length: 50 }),
  shippingCountry: varchar("shippingCountry", { length: 255 }).notNull(),
  shippingMethod: varchar("shippingMethod", { length: 100 }).notNull(),
  deliveryType: varchar("deliveryType", { length: 50 }).default("office").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  paymentStatus: varchar("paymentStatus", { length: 20 }).default("pending").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 100 }),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  shippingCost: numeric("shippingCost", { precision: 10, scale: 2 }).default("0").notNull(),
  tax: numeric("tax", { precision: 10, scale: 2 }).default("0").notNull(),
  discount: numeric("discount", { precision: 10, scale: 2 }).default("0").notNull(),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  trackingNumber: varchar("trackingNumber", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Order = typeof orders.$inferSelect;

// Order items table
export const orderItems = pgTable("orderItems", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId").notNull(),
  productId: integer("productId").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  productImage: text("productImage"),
  quantity: integer("quantity").notNull(),
  size: varchar("size", { length: 100 }),
  unitPrice: numeric("unitPrice", { precision: 10, scale: 2 }).notNull(),
  totalPrice: numeric("totalPrice", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;

// Chat messages table
export const chatMessages = pgTable("chatMessages", {
  id: serial("id").primaryKey(),
  sessionId: varchar("sessionId", { length: 255 }).notNull(),
  userId: integer("userId"),
  role: varchar("role", { length: 20 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;

// Testimonials table
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  rating: integer("rating").default(5).notNull(),
  comment: text("comment").notNull(),
  avatar: text("avatar"),
  isActive: varchar("isActive", { length: 10 }).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Testimonial = typeof testimonials.$inferSelect;
