import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, UtensilsCrossed, MapPin, CheckCircle, Star } from 'lucide-react'
import { api } from '../services/api'

const experiences = [
  { title: 'Sunrise Breakfast', time: '7:00 AM - 10:30 AM', desc: 'Start your day with a lavish breakfast buffet featuring local and international delicacies.', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80', rating: 4.8 },
  { title: 'Ocean View Lunch', time: '12:00 PM - 3:00 PM', desc: 'Light and refreshing meals served with breathtaking ocean panoramas.', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80', rating: 4.7 },
  { title: 'Candlelight Dinner', time: '6:30 PM - 11:00 PM', desc: 'An exquisite fine dining experience under the stars with our chef curated tasting menu.', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80', rating: 4.9 },
]

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

export default function Dining() {
  const [form, setForm] = useState({ guest_name: '', phone: '', email: '', guests: '2', date: '', time: '19:00', special_requests: '' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await api.reserveRestaurant(form)
      setSuccess(true)
      setForm({ guest_name: '', phone: '', email: '', guests: '2', date: '', time: '19:00', special_requests: '' })
    } catch { setError('Reservation failed.') }
    finally { setSubmitting(false) }
  }

  return (
    <div className="page-transition">
      <section className="relative pt-36 pb-24 bg-navy-900 overflow-hidden">
        <motion.div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1920&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }}
          animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} />
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950/80 to-navy-900/60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-resort-400 text-sm tracking-[0.2em] uppercase font-medium">Culinary Excellence</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="page-hero-title mt-2">Dining</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="page-hero-subtitle mx-auto">
            A culinary journey through global flavors with breathtaking ocean views.
          </motion.p>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-resort-500 font-medium tracking-[0.2em] text-sm uppercase">A Taste of Paradise</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-navy-800 mt-2">A Taste of Paradise</h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto">Three unique dining experiences curated by our world-class chefs.</p>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {experiences.map((e, i) => (
              <motion.div key={e.title} variants={fadeUp} whileHover={{ y: -6 }} className="card-luxury overflow-hidden group">
                <div className="h-52 overflow-hidden relative">
                  <div className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${e.image})` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 text-sm font-medium">
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" /> {e.rating}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-serif font-semibold text-navy-800 mb-2">{e.title}</h3>
                  <p className="text-resort-500 text-sm font-medium mb-3 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> {e.time}
                  </p>
                  <p className="text-gray-500 text-sm leading-relaxed">{e.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Reservation Form */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }}
            className="card-luxury p-8 md:p-12">
            {success ? (
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center py-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-2xl font-serif font-bold text-navy-800 mb-2">Reservation Confirmed!</h3>
                <p className="text-gray-500 mb-6">We look forward to serving you.</p>
                <button onClick={() => setSuccess(false)} className="btn-gold">Make Another Reservation</button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-2xl font-serif font-bold text-navy-800 mb-6">Reserve a Table</h3>
                {error && <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</motion.div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <input name="guest_name" placeholder="Your Name *" value={form.guest_name} onChange={e => setForm({...form, guest_name: e.target.value})} className="input-luxury" required />
                  </div>
                  <input name="phone" placeholder="Phone *" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input-luxury" required />
                  <input name="email" type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-luxury" />
                  <input name="guests" type="number" min="1" value={form.guests} onChange={e => setForm({...form, guests: e.target.value})} className="input-luxury" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" name="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="input-luxury" required />
                    <input type="time" name="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} className="input-luxury" />
                  </div>
                  <div className="md:col-span-2">
                    <textarea name="special_requests" rows="2" placeholder="Dietary restrictions or special occasion..." value={form.special_requests} onChange={e => setForm({...form, special_requests: e.target.value})} className="input-luxury" />
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={submitting}
                  className="btn-gold w-full py-4 text-lg">{submitting ? 'Reserving...' : 'Reserve Table'}</motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  )
}
