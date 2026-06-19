-- Schema for L'Élégance store (PostgreSQL / Supabase)

CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "email" VARCHAR(320) NOT NULL UNIQUE,
  "password_hash" TEXT NOT NULL,
  "name" VARCHAR(255),
  "avatar" TEXT,
  "role" VARCHAR(20) NOT NULL DEFAULT 'user',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "lastSignInAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "categories" (
  "id" SERIAL PRIMARY KEY,
  "nameEn" VARCHAR(255) NOT NULL,
  "nameFr" VARCHAR(255),
  "slug" VARCHAR(255) NOT NULL UNIQUE,
  "image" TEXT,
  "descriptionEn" TEXT,
  "descriptionFr" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "products" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(255) NOT NULL UNIQUE,
  "description" TEXT,
  "price" NUMERIC(10, 2) NOT NULL,
  "compareAtPrice" NUMERIC(10, 2),
  "image" TEXT NOT NULL,
  "images" JSON,
  "categoryId" INTEGER,
  "brand" VARCHAR(255),
  "scentFamily" VARCHAR(255),
  "sizes" JSON,
  "stock" INTEGER NOT NULL DEFAULT 0,
  "isActive" VARCHAR(10) NOT NULL DEFAULT 'active',
  "isFeatured" VARCHAR(5) NOT NULL DEFAULT 'no',
  "tags" JSON,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "cartItems" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER,
  "sessionId" VARCHAR(255),
  "productId" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "size" VARCHAR(100),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "orders" (
  "id" SERIAL PRIMARY KEY,
  "orderNumber" VARCHAR(255) NOT NULL UNIQUE,
  "userId" INTEGER,
  "customerName" VARCHAR(255) NOT NULL,
  "customerEmail" VARCHAR(320),
  "customerInstagram" VARCHAR(255),
  "customerPhone" VARCHAR(50),
  "shippingAddress" TEXT NOT NULL,
  "shippingCity" VARCHAR(255) NOT NULL,
  "shippingPostalCode" VARCHAR(50),
  "shippingCountry" VARCHAR(255) NOT NULL,
  "shippingMethod" VARCHAR(100) NOT NULL,
  "deliveryType" VARCHAR(50) NOT NULL DEFAULT 'office',
  "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
  "paymentStatus" VARCHAR(20) NOT NULL DEFAULT 'pending',
  "paymentMethod" VARCHAR(100),
  "subtotal" NUMERIC(10, 2) NOT NULL,
  "shippingCost" NUMERIC(10, 2) NOT NULL DEFAULT 0,
  "tax" NUMERIC(10, 2) NOT NULL DEFAULT 0,
  "discount" NUMERIC(10, 2) NOT NULL DEFAULT 0,
  "total" NUMERIC(10, 2) NOT NULL,
  "trackingNumber" VARCHAR(255),
  "notes" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "orderItems" (
  "id" SERIAL PRIMARY KEY,
  "orderId" INTEGER NOT NULL,
  "productId" INTEGER NOT NULL,
  "productName" VARCHAR(255) NOT NULL,
  "productImage" TEXT,
  "quantity" INTEGER NOT NULL,
  "size" VARCHAR(100),
  "unitPrice" NUMERIC(10, 2) NOT NULL,
  "totalPrice" NUMERIC(10, 2) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "chatMessages" (
  "id" SERIAL PRIMARY KEY,
  "sessionId" VARCHAR(255) NOT NULL,
  "userId" INTEGER,
  "role" VARCHAR(20) NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "testimonials" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "location" VARCHAR(255),
  "rating" INTEGER NOT NULL DEFAULT 5,
  "comment" TEXT NOT NULL,
  "avatar" TEXT,
  "isActive" VARCHAR(10) NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
