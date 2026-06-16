import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Clock, CheckCircle, Star } from 'lucide-react'
import { api } from '../services/api'

const treatments = [
  { name: 'Swedish Massage', duration: '60 min', price: 120, desc: 'Classic relaxation massage with long flowing strokes to ease tension.' },
  { name: 'Deep Tissue Massage', duration: '60 min', price: 150, desc: 'Targeted deep muscle work for chronic tension and pain relief.' },
  { name: 'Aromatherapy', duration: '75 min', price: 140, desc: 'Essential oil based massage for mind-body relaxation.' },
  { name: 'Hot Stone Massage', duration: '90 min', price: 180, desc: 'Heated basalt stones combined with massage for deep relaxation.' },
  { name: 'Facial Treatment', duration: '60 min', price: 130, desc: 'Rejuvenating facial using premium organic products.' },
  { name: 'Couples Massage', duration: '90 min', price: 320, desc: 'Side-by-side massage experience for two in a private suite.' },
]

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function Spa() {
  const [form, setForm] = useState({ guest_name: '', phone: '', email: '', service: 'Swedish Massage', date: '', time: '10:00', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try { await api.bookSpa(form); setSuccess(true) } catch {}
    finally { setSubmitting(false) }
  }

  return (
    <div className="page-transition">
      <section className="relative pt-36 pb-24 bg-navy-900 overflow-hidden">
        <motion.div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1920&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }}
          animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} />
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950/80 to-navy-900/60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-resort-400 text-sm tracking-[0.2em] uppercase font-medium">Wellness</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="page-hero-title mt-2">Spa & Wellness</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="page-hero-subtitle mx-auto">
            Rejuvenate your mind, body, and soul with our world-class spa treatments.
          </motion.p>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-resort-500 font-medium tracking-[0.2em] text-sm uppercase">Treatments</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-navy-800 mt-2">Our Treatments</h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto">Pamper yourself with our curated selection of premium spa treatments.</p>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-20">
            {treatments.map((t, i) => (
              <motion.div key={t.name} variants={fadeUp} whileHover={{ y: -5 }}
                className="group p-6 lg:p-8 rounded-2xl border border-gray-100 bg-white hover:border-transparent hover:shadow-xl hover:shadow-resort-500/5 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-resort-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-resort-50 to-resort-100 flex items-center justify-center mb-4 group-hover:from-resort-500 group-hover:to-resort-600 transition-all duration-300">
                    <Sparkles className="w-5 h-5 text-resort-500 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-navy-800 mb-2">{t.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <Clock className="w-3.5 h-3.5" /><span>{t.duration}</span>
                    <span className="text-resort-600 font-bold text-lg ml-auto">${t.price}</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{t.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }}
            className="card-luxury p-8 md:p-12">
            {success ? (
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center py-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-2xl font-serif font-bold text-navy-800 mb-2">Spa Session Booked!</h3>
                <p className="text-gray-500 mb-6">We look forward to pampering you.</p>
                <button onClick={() => setSuccess(false)} className="btn-gold">Book Another</button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-2xl font-serif font-bold text-navy-800 mb-6">Book a Spa Session</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2"><input placeholder="Your Name *" value={form.guest_name} onChange={e => setForm({...form, guest_name: e.target.value})} className="input-luxury" required /></div>
                  <input placeholder="Phone *" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input-luxury" required />
                  <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-luxury" />
                  <select value={form.service} onChange={e => setForm({...form, service: e.target.value})} className="input-luxury">
                    {treatments.map(t => <option key={t.name}>{t.name}</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="input-luxury" required />
                    <input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} className="input-luxury" />
                  </div>
                  <div className="md:col-span-2"><textarea rows="2" placeholder="Notes or preferences..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="input-luxury" /></div>
                </div>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={submitting}
                  className="btn-gold w-full py-4 text-lg">{submitting ? 'Booking...' : 'Book Spa Session'}</motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  )
}
