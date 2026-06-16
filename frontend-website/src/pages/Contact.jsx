import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, MessageCircle } from 'lucide-react'
import { api } from '../services/api'

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const fadeLeft = {
  hidden: { opacity: 0, x: -30 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5 } },
}

const fadeRight = {
  hidden: { opacity: 0, x: 30 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5 } },
}

export default function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try { await api.createLead({ ...form, source: 'website_contact', preference: 'Contact form inquiry' }); setSent(true) } catch {}
    finally { setSubmitting(false) }
  }

  return (
    <div className="page-transition">
      <section className="relative pt-36 pb-24 bg-navy-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-resort-950/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-resort-400 text-sm tracking-[0.2em] uppercase font-medium">Get in Touch</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="page-hero-title mt-2">Contact Us</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="page-hero-subtitle mx-auto">
            We'd love to hear from you. Reach out for reservations, inquiries, or special requests.
          </motion.p>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-50px' }}>
              <motion.div variants={fadeLeft}>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-navy-800 mb-6">Get in Touch</h2>
                <p className="text-gray-500 mb-10 leading-relaxed text-lg">
                  Our dedicated team is available 24/7 to assist you with reservations, questions, or any special requests you may have.
                </p>
              </motion.div>

              <div className="space-y-6">
                {[
                  { icon: MapPin, label: 'Address', value: '123 Beachfront Drive, Paradise Island' },
                  { icon: Phone, label: 'Phone', value: '+1 (555) 123-4567' },
                  { icon: Mail, label: 'Email', value: 'reservations@naazresort.com' },
                  { icon: Clock, label: 'Front Desk', value: 'Open 24/7' },
                ].map((item, i) => (
                  <motion.div key={i} variants={fadeLeft} className="flex items-start gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-resort-50 flex items-center justify-center shrink-0 group-hover:bg-resort-500 transition-all duration-300">
                      <item.icon className="w-5 h-5 text-resort-500 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 font-medium">{item.label}</p>
                      <p className="text-navy-800 font-semibold">{item.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-50px' }}>
              <motion.div variants={fadeRight} className="card-luxury p-8 md:p-10">
                {sent ? (
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center py-8">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-2xl font-serif font-bold text-navy-800 mb-2">Message Sent!</h3>
                    <p className="text-gray-500 mb-6">Our team will get back to you shortly.</p>
                    <button onClick={() => setSent(false)} className="btn-gold">Send Another</button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <h3 className="text-2xl font-serif font-bold text-navy-800 mb-6">Send us a Message</h3>
                    <div>
                      <label className="text-sm text-gray-500 mb-1.5 block font-medium">Full Name *</label>
                      <input placeholder="John Doe" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-luxury" required />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 mb-1.5 block font-medium">Phone Number *</label>
                      <input placeholder="+1 (555) 000-0000" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input-luxury" required />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 mb-1.5 block font-medium">Email Address</label>
                      <input type="email" placeholder="john@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-luxury" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 mb-1.5 block font-medium">Message *</label>
                      <textarea rows="4" placeholder="How can we help you?" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="input-luxury" required />
                    </div>
                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={submitting}
                      className="btn-gold w-full py-4 flex items-center justify-center gap-2 text-lg">
                      <Send className="w-4 h-4" /> {submitting ? 'Sending...' : 'Send Message'}
                    </motion.button>
                  </form>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
