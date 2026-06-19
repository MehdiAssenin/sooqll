import { motion } from "framer-motion";
import { Leaf, Award, Globe } from "lucide-react";

export default function AboutUs() {
  return (
    <main className="pt-24 pb-16 min-h-screen bg-white">
      {/* Hero Section */}
      <section className="max-w-[1000px] mx-auto px-6 mb-24 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-[Playfair_Display] text-4xl md:text-5xl text-[#0F281F] mb-6"
        >
          Our Story
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[#7A7167] text-lg leading-relaxed max-w-2xl mx-auto"
        >
          Founded in 2020, L'Élégance was born from a passion for timeless beauty and an uncompromising commitment to quality. We believe that a fragrance is more than a scent—it is an invisible garment that dresses the soul.
        </motion.p>
      </section>

      {/* Image & Text Section */}
      <section className="max-w-[1200px] mx-auto px-6 mb-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="aspect-[4/5] bg-[#F5F0EB] rounded-2xl overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-black/5" />
            <img 
              src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1000&auto=format&fit=crop" 
              alt="Craftsmanship" 
              className="w-full h-full object-cover"
            />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="font-[Playfair_Display] text-3xl text-[#0F281F]">The Art of Perfumery</h2>
            <p className="text-[#7A7167] leading-relaxed">
              Every bottle we create is a masterpiece, crafted by master perfumers using the world's most precious ingredients. We travel from the lavender fields of Grasse to the vibrant spice markets of the East to source raw materials of unparalleled quality.
            </p>
            <p className="text-[#7A7167] leading-relaxed">
              Our process is unhurried. We allow our fragrances to macerate and age until they reach perfect harmony, resulting in complex, multi-layered scents that evolve beautifully on the skin.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Sustainability Section */}
      <section id="sustainability" className="bg-[#0F281F] text-white py-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-[Playfair_Display] text-3xl text-[#C9A96E] mb-4">Our Commitment</h2>
            <p className="text-white/70 max-w-2xl mx-auto">Luxury should never come at the expense of our planet. Sustainability is woven into the fabric of everything we do.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Leaf,
                title: "Ethical Sourcing",
                desc: "We partner directly with farmers to ensure fair wages and sustainable harvesting practices for all our botanical ingredients."
              },
              {
                icon: Globe,
                title: "Eco-Friendly Packaging",
                desc: "Our signature glass bottles are fully recyclable, and our boxes are made from 100% FSC-certified recycled paper."
              },
              {
                icon: Award,
                title: "Cruelty Free",
                desc: "We love all creatures. Our products are never tested on animals, and we strictly adhere to vegan formulation standards."
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 p-8 rounded-2xl text-center hover:bg-white/10 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-[#C9A96E]/20 flex items-center justify-center mx-auto mb-6 text-[#C9A96E]">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-[Playfair_Display] text-xl mb-3">{feature.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
