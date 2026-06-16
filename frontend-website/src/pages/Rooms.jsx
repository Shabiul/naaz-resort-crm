import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import RoomCard from '../components/RoomCard'
import { api } from '../services/api'

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const roomTypes = ['', 'Standard Room', 'Deluxe Room', 'Suite', 'Villa', 'Presidential Suite']

export default function Rooms() {
  const [rooms, setRooms] = useState([])
  const [filter, setFilter] = useState('')

  useEffect(() => {
    api.getRooms(filter || undefined).then(d => setRooms(d.rooms || [])).catch(() => {})
  }, [filter])

  return (
    <div className="page-transition">
      {/* Hero */}
      <section className="relative pt-36 pb-24 bg-navy-900 overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1920&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950/80 to-navy-900/60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-resort-400 text-sm tracking-[0.2em] uppercase font-medium">Accommodation</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="page-hero-title mt-2">
            Rooms & Suites
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="page-hero-subtitle mx-auto">
            From comfortable standards to the opulent Presidential Suite — find your perfect sanctuary.
          </motion.p>
        </div>
      </section>

      {/* Filter */}
      <section className="py-6 bg-white border-b border-gray-100 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 items-center">
            <Search className="w-4 h-4 text-gray-400 mr-1" />
            {roomTypes.map((r) => (
              <motion.button
                key={r}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(r)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === r ? 'bg-resort-500 text-white shadow-lg shadow-resort-500/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {r || 'All Rooms'}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Room Grid */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room, i) => (
              <motion.div key={room.id} variants={fadeUp}>
                <RoomCard room={room} index={i} />
              </motion.div>
            ))}
          </motion.div>
          {rooms.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 text-gray-400">
              <p className="text-lg">No rooms available for the selected filter.</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-navy-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-resort-500/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">Not Sure Which Room to Choose?</motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-navy-200 mb-8 max-w-xl mx-auto text-lg">Our concierge team is here to help you find the perfect accommodation.</motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <Link to="/contact" className="btn-gold inline-flex items-center gap-2 text-lg px-12 py-4">Contact Us <ArrowRight className="w-5 h-5" /></Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
