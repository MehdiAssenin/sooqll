import { getDb } from "../api/queries/connection";
import { categories, products, testimonials, users } from "./schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function seed() {
  const db = getDb();

  // Seed admin user
  const adminEmail = "admin@store.com";
  const existingAdmin = await db
    .select()
    .from(users)
    .where(eq(users.email, adminEmail))
    .limit(1);

  if (existingAdmin.length === 0) {
    const passwordHash = await bcrypt.hash("admin123", 10);
    await db.insert(users).values({
      email: adminEmail,
      passwordHash,
      name: "Store Admin",
      role: "admin",
    });
    console.log("Admin user seeded (admin@store.com / admin123)");
  } else {
    console.log("Admin user already exists, skipping.");
  }

  // Seed demo user
  const demoEmail = "demo@store.com";
  const existingDemo = await db
    .select()
    .from(users)
    .where(eq(users.email, demoEmail))
    .limit(1);

  if (existingDemo.length === 0) {
    const passwordHash = await bcrypt.hash("demo123", 10);
    await db.insert(users).values({
      email: demoEmail,
      passwordHash,
      name: "Demo User",
      role: "user",
    });
    console.log("Demo user seeded (demo@store.com / demo123)");
  }

  // Seed categories
  await db.insert(categories).values([
    {
      nameEn: "Women's Perfume",
      nameFr: "Parfum Femme",
      slug: "womens-perfume",
      image: "/images/category-women.jpg",
      descriptionEn: "Discover our exquisite collection of women's fragrances",
      descriptionFr: "Découvrez notre collection exquise de parfums pour femmes",
    },
    {
      nameEn: "Men's Cologne",
      nameFr: "Eau de Cologne Homme",
      slug: "mens-cologne",
      image: "/images/category-men.jpg",
      descriptionEn: "Bold and sophisticated scents for the modern gentleman",
      descriptionFr: "Des senteurs audacieuses et sophistiquées pour le gentleman moderne",
    },
    {
      nameEn: "Signature Handbags",
      nameFr: "Sacs à Main Signature",
      slug: "handbags",
      image: "/images/category-bags.jpg",
      descriptionEn: "Luxury handbags crafted with precision and elegance",
      descriptionFr: "Sacs de luxe fabriqués avec précision et élégance",
    },
    {
      nameEn: "Gift Sets",
      nameFr: "Coffrets Cadeaux",
      slug: "gift-sets",
      image: "/images/category-gifts.jpg",
      descriptionEn: "Curated gift sets for every special occasion",
      descriptionFr: "Coffrets cadeaux sélectionnés pour chaque occasion spéciale",
    },
  ]);
  console.log("Categories seeded");

  // Seed products
  await db.insert(products).values([
    {
      name: "Paris Chic N°5",
      slug: "paris-chic-no5",
      description: "A timeless classic inspired by the City of Light. Notes of jasmine, rose, and sandalwood create an unforgettable signature scent that captures the essence of Parisian elegance.",
      price: "185.00",
      compareAtPrice: "220.00",
      image: "/images/product-1.jpg",
      images: ["/images/product-1.jpg", "/images/hero-bottle.jpg"],
      categoryId: 1,
      brand: "L'Élégance Paris",
      scentFamily: "Floral",
      sizes: ["30ml", "50ml", "100ml"],
      stock: 45,
      isActive: "active",
      isFeatured: "yes",
      tags: ["bestseller", "classic", "women"],
    },
    {
      name: "Oud Royale",
      slug: "oud-royale",
      description: "An opulent blend of rare oud wood, amber, and exotic spices. This majestic fragrance commands attention with its deep, mysterious character and long-lasting sillage.",
      price: "320.00",
      image: "/images/product-2.jpg",
      images: ["/images/product-2.jpg"],
      categoryId: 2,
      brand: "L'Élégance Privé",
      scentFamily: "Oriental Woody",
      sizes: ["50ml", "100ml"],
      stock: 28,
      isActive: "active",
      isFeatured: "yes",
      tags: ["luxury", "oud", "unisex"],
    },
    {
      name: "Floral Essence",
      slug: "floral-essence",
      description: "A delicate bouquet of peony, lily of the valley, and white musk. This ethereal fragrance evokes the serenity of a blooming garden at dawn.",
      price: "145.00",
      compareAtPrice: "175.00",
      image: "/images/product-3.jpg",
      images: ["/images/product-3.jpg"],
      categoryId: 1,
      brand: "L'Élégance Paris",
      scentFamily: "Floral Fresh",
      sizes: ["30ml", "50ml", "100ml"],
      stock: 62,
      isActive: "active",
      isFeatured: "yes",
      tags: ["floral", "fresh", "women"],
    },
    {
      name: "Le Sac Rouge",
      slug: "le-sac-rouge",
      description: "Iconic quilted leather handbag with gold-tone hardware. This statement piece features a chain-link strap and signature clasp, embodying timeless Parisian sophistication.",
      price: "2850.00",
      image: "/images/product-4.jpg",
      images: ["/images/product-4.jpg"],
      categoryId: 3,
      brand: "L'Élégance Couture",
      sizes: ["Medium", "Large"],
      stock: 12,
      isActive: "active",
      isFeatured: "yes",
      tags: ["handbag", "quilted", "red", "luxury"],
    },
    {
      name: "Midnight Noir",
      slug: "midnight-noir",
      description: "A seductive blend of black vanilla, dark chocolate, and patchouli. This intoxicating fragrance is designed for evenings that turn into unforgettable nights.",
      price: "210.00",
      image: "/images/hero-bottle.jpg",
      categoryId: 2,
      brand: "L'Élégance Paris",
      scentFamily: "Oriental Gourmand",
      sizes: ["50ml", "100ml"],
      stock: 35,
      isActive: "active",
      isFeatured: "no",
      tags: ["evening", "men", "gourmand"],
    },
    {
      name: "Le Sac Noir",
      slug: "le-sac-noir",
      description: "Elegant black leather tote with gold hardware. Spacious interior with multiple compartments, perfect for the modern woman on the go.",
      price: "1950.00",
      image: "/images/hero-bag.jpg",
      categoryId: 3,
      brand: "L'Élégance Couture",
      sizes: ["One Size"],
      stock: 8,
      isActive: "active",
      isFeatured: "no",
      tags: ["handbag", "black", "tote"],
    },
    {
      name: "Coffret Romance",
      slug: "coffret-romance",
      description: "A luxurious gift set featuring our best-selling Paris Chic N°5 perfume (50ml) paired with a miniature Le Sac Rouge handbag charm. The perfect gift for someone special.",
      price: "245.00",
      compareAtPrice: "295.00",
      image: "/images/category-gifts.jpg",
      categoryId: 4,
      brand: "L'Élégance Paris",
      sizes: ["Gift Set"],
      stock: 20,
      isActive: "active",
      isFeatured: "yes",
      tags: ["gift", "set", "perfume"],
    },
    {
      name: "Golden Amber",
      slug: "golden-amber",
      description: "Warm amber blended with honey, vanilla, and a touch of cinnamon. This cozy, inviting fragrance wraps you in a golden embrace.",
      price: "165.00",
      image: "/images/product-1.jpg",
      categoryId: 1,
      brand: "L'Élégance Paris",
      scentFamily: "Oriental Amber",
      sizes: ["30ml", "50ml", "100ml"],
      stock: 50,
      isActive: "active",
      isFeatured: "no",
      tags: ["amber", "warm", "women"],
    },
  ]);
  console.log("Products seeded");

  // Seed testimonials
  await db.insert(testimonials).values([
    {
      name: "Sophie Laurent",
      location: "Paris, France",
      rating: 5,
      comment: "L'Élégance captures the true essence of luxury. Every perfume I've purchased has become a cherished part of my collection. The attention to detail is extraordinary.",
      isActive: "active",
    },
    {
      name: "Emma Thompson",
      location: "London, UK",
      rating: 5,
      comment: "The Oud Royale is simply divine. It lasts all day and receives compliments wherever I go. The packaging alone is a work of art.",
      isActive: "active",
    },
    {
      name: "Marie Dubois",
      location: "Montreal, Canada",
      rating: 5,
      comment: "I ordered the Le Sac Rouge as a gift for my mother, and she was absolutely speechless. The craftsmanship is impeccable. Worth every penny!",
      isActive: "active",
    },
    {
      name: "Isabella Romano",
      location: "Milan, Italy",
      rating: 5,
      comment: "The Floral Essence is my signature scent. Light, elegant, and uniquely feminine. Customer service was exceptional when I needed help choosing the right size.",
      isActive: "active",
    },
    {
      name: "Aisha Al-Rashid",
      location: "Dubai, UAE",
      rating: 5,
      comment: "From the packaging to the fragrance itself, everything screams luxury. The Midnight Noir has become my husband's favorite scent. We are loyal customers for life.",
      isActive: "active",
    },
    {
      name: "Claire Bennett",
      location: "New York, USA",
      rating: 5,
      comment: "I discovered L'Élégance during my trip to Paris and have been ordering online ever since. The quality is consistent, and shipping is always prompt.",
      isActive: "active",
    },
  ]);
  console.log("Testimonials seeded");

  console.log("Seed complete! ✅");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
