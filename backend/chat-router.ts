import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { chatMessages } from "@db/schema";
import { eq } from "drizzle-orm";

// Simple AI responses without external API (prices updated to JOD)
const aiResponses: Record<string, string> = {
  "hello": "Bonjour! Welcome to L'Élégance. I'm your personal fragrance advisor. How may I assist you today?",
  "hi": "Hello! Welcome to L'Élégance. I'm here to help you find the perfect fragrance or accessory. What are you looking for?",
  "help": "I can help you with:\n• Finding the perfect fragrance\n• Recommending gift sets\n• Providing product details\n• Order tracking\n• Shipping information\n\nWhat would you like to know?",
  "perfume": "We offer a stunning collection of perfumes! Our bestsellers include:\n• **Paris Chic N°5** - A timeless floral classic (JOD 185)\n• **Oud Royale** - An exotic oriental masterpiece (JOD 320)\n• **Floral Essence** - A delicate, fresh bouquet (JOD 145)\n\nWould you like details about any specific fragrance?",
  "recommend": "I'd be happy to recommend a fragrance! Could you tell me:\n1. Do you prefer floral, oriental, woody, or fresh scents?\n2. Is it for day or evening wear?\n3. For women, men, or unisex?",
  "floral": "For floral lovers, I recommend:\n• **Paris Chic N°5** - Jasmine, rose & sandalwood (JOD 185)\n• **Floral Essence** - Peony, lily of the valley & white musk (JOD 145)\n• **Golden Amber** - Warm amber with honey & vanilla (JOD 165)\n\nWould you like more details?",
  "oud": "Our **Oud Royale** (JOD 320) is an exceptional choice! It features:\n• Rare oud wood\n• Rich amber\n• Exotic spices\n\nA truly majestic fragrance that commands attention.",
  "price": "Our fragrances range from JOD 145 to JOD 320, and handbags from JOD 1,950 to JOD 2,850. We also have beautiful gift sets starting at JOD 245. Would you like to see our current promotions?",
  "gift": "Our gift sets are perfect for any occasion!\n• **Coffret Romance** - Paris Chic N°5 (50ml) + handbag charm (JOD 245)\n• We also offer gift wrapping services\n\nWho is the gift for?",
  "handbag": "Our signature handbags include:\n• **Le Sac Rouge** - Iconic quilted leather with gold hardware (JOD 2,850)\n• **Le Sac Noir** - Elegant black leather tote (JOD 1,950)\n\nBoth are crafted with the finest materials.",
  "shipping": "We offer:\n• **Standard Shipping** - 5-7 business days (JOD 15)\n• **Express Shipping** - 2-3 business days (JOD 35)\n• **Free shipping** on orders over JOD 200\n\nWe ship worldwide!",
  "track": "I can help you track your order! Please provide your order number (starts with 'LE').",
  "contact": "You can reach us at:\n• Email: contact@lelegance.com\n• Phone: +33 1 42 60 00 00\n• Live Chat: Available 9 AM - 6 PM CET\n\nOr I can connect you with a live agent right now!",
  "return": "Our return policy:\n• 30-day returns on unopened items\n• Free return shipping on defective products\n• Store credit or full refund available\n\nWould you like to initiate a return?",
  "thank": "You're very welcome! It's my pleasure to assist you. Enjoy your L'Élégance experience!",
  "thanks": "You're most welcome! Feel free to return anytime you need assistance. Have a wonderful day!",
  "bye": "Au revoir! Thank you for visiting L'Élégance. We look forward to seeing you again!",
};

function getAIResponse(message: string): string {
  const lowerMsg = message.toLowerCase().trim();

  // Check for exact matches first
  if (aiResponses[lowerMsg]) {
    return aiResponses[lowerMsg];
  }

  // Check for keyword matches
  const keywords = [
    { words: ["hello", "hi", "hey"], response: aiResponses.hello },
    { words: ["perfume", "fragrance", "scent", "cologne"], response: aiResponses.perfume },
    { words: ["recommend", "suggest", "what should"], response: aiResponses.recommend },
    { words: ["floral", "flower", "rose", "jasmine"], response: aiResponses.floral },
    { words: ["oud", "oriental", "woody", "spicy"], response: aiResponses.oud },
    { words: ["price", "cost", "how much", "expensive"], response: aiResponses.price },
    { words: ["gift", "present", "birthday", "anniversary"], response: aiResponses.gift },
    { words: ["bag", "handbag", "purse", "tote"], response: aiResponses.handbag },
    { words: ["shipping", "delivery", "ship", "deliver"], response: aiResponses.shipping },
    { words: ["track", "tracking", "where is", "status"], response: aiResponses.track },
    { words: ["contact", "reach", "call", "email"], response: aiResponses.contact },
    { words: ["return", "refund", "exchange"], response: aiResponses.return },
    { words: ["thank", "thanks"], response: aiResponses.thank },
    { words: ["bye", "goodbye", "see you"], response: aiResponses.bye },
  ];

  for (const kw of keywords) {
    if (kw.words.some((w) => lowerMsg.includes(w))) {
      return kw.response;
    }
  }

  // Default response
  return "Thank you for your message! I'm here to help with:\n• Fragrance recommendations\n• Product details\n• Order assistance\n• General inquiries\n\nCould you please provide more details about what you're looking for? Or type 'help' to see all options.";
}

export const chatRouter = createRouter({
  // Get chat history for a session
  getHistory: publicQuery
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, input.sessionId))
        .orderBy(chatMessages.createdAt);
    }),

  // Send a message and get AI response
  sendMessage: publicQuery
    .input(
      z.object({
        sessionId: z.string(),
        userId: z.number().optional(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Save user message
      await db.insert(chatMessages).values({
        sessionId: input.sessionId,
        userId: input.userId || null,
        role: "user",
        content: input.content,
      });

      // Check if session has requested live agent
      const history = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, input.sessionId))
        .orderBy(chatMessages.createdAt);

      const requestedAgent = history.some(m => 
        m.content.includes("A live agent will be with you shortly")
      );

      // If they requested a live agent, do NOT generate an AI response
      if (requestedAgent) {
        return { success: true, response: null };
      }

      // Get AI response
      const aiContent = getAIResponse(input.content);

      // Save AI response
      await db.insert(chatMessages).values({
        sessionId: input.sessionId,
        role: "assistant",
        content: aiContent,
      });

      return { success: true, response: aiContent };
    }),

  // Connect to live agent (mark as needing agent)
  requestAgent: publicQuery
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();

      await db.insert(chatMessages).values({
        sessionId: input.sessionId,
        role: "assistant",
        content: "A live agent will be with you shortly. Estimated wait time: **2 minutes**. Thank you for your patience!",
      });

      return { success: true, estimatedWait: 2 };
    }),

  // Admin: Get all chat sessions with their messages
  getSessions: adminQuery.query(async () => {
    const db = getDb();
    const allMessages = await db.select().from(chatMessages).orderBy(chatMessages.createdAt);

    // Group messages by sessionId
    const sessionsMap: Record<
      string,
      {
        sessionId: string;
        messages: typeof allMessages;
        lastMessageAt: Date;
        needsAgent: boolean;
      }
    > = {};

    allMessages.forEach((msg) => {
      if (!sessionsMap[msg.sessionId]) {
        sessionsMap[msg.sessionId] = {
          sessionId: msg.sessionId,
          messages: [],
          lastMessageAt: msg.createdAt,
          needsAgent: false,
        };
      }
      sessionsMap[msg.sessionId].messages.push(msg);
      if (msg.createdAt > sessionsMap[msg.sessionId].lastMessageAt) {
        sessionsMap[msg.sessionId].lastMessageAt = msg.createdAt;
      }
      if (msg.content.includes("A live agent will be with you shortly")) {
        sessionsMap[msg.sessionId].needsAgent = true;
      }
    });

    return Object.values(sessionsMap).sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
  }),

  // Admin: Reply to a specific session
  adminReply: adminQuery
    .input(
      z.object({
        sessionId: z.string(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(chatMessages).values({
        sessionId: input.sessionId,
        role: "agent",
        content: input.content,
      });
      return { success: true };
    }),
});
