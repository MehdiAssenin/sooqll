import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/useToast";

export default function Contact() {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      addToast("Your message has been sent successfully. We will get back to you soon.", "success");
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <main className="pt-24 pb-16 min-h-screen bg-[#F5F0EB]">
      <section className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-[Playfair_Display] text-4xl md:text-5xl text-[#0F281F] mb-6"
          >
            Contact Us
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[#7A7167] text-lg max-w-2xl mx-auto"
          >
            We are here to assist you with any inquiries about our fragrances, your orders, or our brand.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24">
          {/* Contact Information */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="font-[Playfair_Display] text-3xl text-[#0F281F] mb-8">Get in Touch</h2>
            
            <div className="space-y-8">
              {[
                {
                  icon: Mail,
                  title: "Email",
                  content: "customercare@lelegance.com",
                  desc: "We aim to reply to all emails within 24 hours."
                },
                {
                  icon: Phone,
                  title: "Phone",
                  content: "+213 555 00 00 00",
                  desc: "Available for urgent inquiries."
                },
                {
                  icon: Clock,
                  title: "Hours of Operation",
                  content: "Sunday - Thursday",
                  desc: "09:00 AM - 05:00 PM (GMT+1)"
                },
                {
                  icon: MapPin,
                  title: "Boutique",
                  content: "Algiers, Algeria",
                  desc: "Visit our flagship store to experience our fragrances in person."
                }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-[#C9A96E]">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#0F281F] mb-1">{item.title}</h3>
                    <p className="text-[#1A1A1A] font-medium mb-1">{item.content}</p>
                    <p className="text-[#7A7167] text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-8 rounded-2xl shadow-sm border border-[#E8E4DF]"
          >
            <h2 className="font-[Playfair_Display] text-2xl text-[#0F281F] mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#0F281F] mb-2">First Name</label>
                  <input 
                    required 
                    className="w-full px-4 py-3 border border-[#E8E4DF] rounded-lg focus:outline-none focus:border-[#C9A96E] bg-[#F5F0EB]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F281F] mb-2">Last Name</label>
                  <input 
                    required 
                    className="w-full px-4 py-3 border border-[#E8E4DF] rounded-lg focus:outline-none focus:border-[#C9A96E] bg-[#F5F0EB]/50"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#0F281F] mb-2">Email Address</label>
                <input 
                  type="email" 
                  required 
                  className="w-full px-4 py-3 border border-[#E8E4DF] rounded-lg focus:outline-none focus:border-[#C9A96E] bg-[#F5F0EB]/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F281F] mb-2">Subject</label>
                <select className="w-full px-4 py-3 border border-[#E8E4DF] rounded-lg focus:outline-none focus:border-[#C9A96E] bg-[#F5F0EB]/50">
                  <option>Order Status</option>
                  <option>Returns & Exchanges</option>
                  <option>Product Information</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F281F] mb-2">Message</label>
                <textarea 
                  required 
                  rows={5}
                  className="w-full px-4 py-3 border border-[#E8E4DF] rounded-lg focus:outline-none focus:border-[#C9A96E] bg-[#F5F0EB]/50 resize-none"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[#0F281F] text-white py-4 rounded-full font-semibold uppercase tracking-wider hover:bg-[#1A4D3A] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
