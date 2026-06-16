import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react'

const images = [
  { src: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80', title: 'Ocean View Suite', category: 'Rooms' },
  { src: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80', title: 'Infinity Pool', category: 'Amenities' },
  { src: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80', title: 'Lobby Lounge', category: 'Amenities' },
  { src: 'https://images.unsplash.com/photo-1596178060671-7a80dc8051f4?auto=format&fit=crop&w=1200&q=80', title: 'Presidential Suite', category: 'Rooms' },
  { src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80', title: 'Fine Dining', category: 'Dining' },
  { src: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80', title: 'Spa Treatment Room', category: 'Spa' },
  { src: 'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?auto=format&fit=crop&w=1200&q=80', title: 'Beachfront View', category: 'Resort' },
  { src: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80', title: 'Breakfast Buffet', category: 'Dining' },
  { src: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80', title: 'Resort Garden', category: 'Resort' },
]

const categories = ['All', ...new Set(images.map(i => i.category))]

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function Gallery() {
  const [filter, setFilter] = useState('All')
  const [lightbox, setLightbox] = useState(null)

  const filtered = filter === 'All' ? images : images.filter(i => i.category === filter)

  return (
    <div className="page-transition">
      <section className="relative pt-36 pb-24 bg-navy-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 to-navy-900" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-resort-400 text-sm tracking-[0.2em] uppercase font-medium">Visual Journey</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="page-hero-title mt-2">Gallery</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="page-hero-subtitle mx-auto">
            A visual journey through the elegance and beauty of Naaz Resort.
          </motion.p>
        </div>
      </section>

      <section className="py-6 bg-white border-b border-gray-100 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(c => (
              <motion.button
                key={c}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(c)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === c ? 'bg-resort-500 text-white shadow-lg shadow-resort-500/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >{c}</motion.button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={stagger} initial="hidden" animate="show" layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((img, i) => (
              <motion.div
                key={img.src}
                variants={fadeUp}
                layout
                whileHover={{ y: -4 }}
                onClick={() => setLightbox(i)}
                className="relative h-64 sm:h-72 rounded-2xl overflow-hidden cursor-pointer group"
              >
                <div className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${img.src})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <p className="text-white font-semibold text-lg">{img.title}</p>
                  <p className="text-white/70 text-sm">{img.category}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No images found for this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button onClick={() => setLightbox(null)} className="absolute top-6 right-6 text-white/60 hover:text-white z-10 transition-colors">
              <X className="w-8 h-8" />
            </button>

            <button onClick={e => { e.stopPropagation(); setLightbox(lightbox > 0 ? lightbox - 1 : filtered.length - 1) }}
              className="absolute left-4 md:left-8 text-white/60 hover:text-white transition-colors z-10">
              <ChevronLeft className="w-10 h-10" />
            </button>

            <motion.div
              key={lightbox}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-5xl w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-full h-[60vh] md:h-[75vh] rounded-2xl bg-cover bg-center shadow-2xl" style={{ backgroundImage: `url(${filtered[lightbox]?.src})` }} />
              <div className="mt-5 text-center">
                <p className="text-white text-2xl font-semibold">{filtered[lightbox]?.title}</p>
                <p className="text-white/50 mt-1">{filtered[lightbox]?.category}</p>
              </div>
            </motion.div>

            <button onClick={e => { e.stopPropagation(); setLightbox(lightbox < filtered.length - 1 ? lightbox + 1 : 0) }}
              className="absolute right-4 md:right-8 text-white/60 hover:text-white transition-colors z-10">
              <ChevronRight className="w-10 h-10" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
