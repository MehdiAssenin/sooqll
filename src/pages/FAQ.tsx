import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    category: "Shipping & Delivery",
    id: "shipping",
    items: [
      {
        q: "Do you offer international shipping?",
        a: "Currently, we offer shipping exclusively within Algeria. We partner with premium logistics providers to ensure your luxury items arrive safely and promptly across all 58 Wilayas."
      },
      {
        q: "How long will my order take to arrive?",
        a: "Orders to Algiers and surrounding areas typically arrive within 1-2 business days. Deliveries to other Wilayas may take 2-5 business days depending on the location and chosen delivery method (Home or Office)."
      },
      {
        q: "How can I track my order?",
        a: "Once your order is confirmed, you will receive an order number. You can use this number on our 'Track Order' page to see the real-time status of your delivery."
      }
    ]
  },
  {
    category: "Returns & Exchanges",
    id: "returns",
    items: [
      {
        q: "What is your return policy?",
        a: "We accept returns within 14 days of delivery for unopened and unused products in their original packaging. Due to hygiene reasons, we cannot accept returns of opened fragrances unless they are defective."
      },
      {
        q: "How do I initiate a return?",
        a: "Please contact our Customer Care team at customercare@lelegance.com or through our Contact page with your order number. We will provide you with a return authorization and instructions."
      }
    ]
  },
  {
    category: "Products & Ingredients",
    id: "products",
    items: [
      {
        q: "Are your fragrances authentic?",
        a: "Absolutely. We guarantee that 100% of the products sold on L'Élégance are authentic. We source directly from the brands or their official authorized distributors."
      },
      {
        q: "Are your products cruelty-free?",
        a: "Yes, we are committed to ethical beauty. None of our products are tested on animals, and we prioritize brands that share our commitment to sustainability and cruelty-free practices."
      }
    ]
  }
];

export default function FAQ() {
  return (
    <main className="pt-24 pb-16 min-h-screen bg-white">
      <section className="max-w-[800px] mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-[Playfair_Display] text-4xl md:text-5xl text-[#0F281F] mb-6"
          >
            Frequently Asked Questions
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[#7A7167] text-lg"
          >
            Find answers to our most common questions below.
          </motion.p>
        </div>

        <div className="space-y-12">
          {faqs.map((section, idx) => (
            <motion.div 
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="scroll-mt-32"
            >
              <h2 className="font-[Playfair_Display] text-2xl text-[#0F281F] mb-6 pb-2 border-b border-[#E8E4DF]">
                {section.category}
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {section.items.map((item, i) => (
                  <AccordionItem key={i} value={`item-${idx}-${i}`} className="border-[#E8E4DF]">
                    <AccordionTrigger className="text-left font-medium text-[#1A1A1A] hover:text-[#C9A96E] hover:no-underline transition-colors py-4">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-[#7A7167] leading-relaxed pb-4">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 p-8 bg-[#F5F0EB] rounded-2xl text-center"
        >
          <h3 className="font-[Playfair_Display] text-2xl text-[#0F281F] mb-4">Still have questions?</h3>
          <p className="text-[#7A7167] mb-6">Our customer care team is always here to help you.</p>
          <a 
            href="/contact" 
            className="inline-block bg-[#0F281F] text-white px-8 py-3.5 rounded-full font-semibold uppercase tracking-wider hover:bg-[#1A4D3A] transition-colors"
          >
            Contact Us
          </a>
        </motion.div>
      </section>
    </main>
  );
}
