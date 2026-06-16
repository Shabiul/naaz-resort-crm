import { motion } from 'framer-motion'
import { Ship, TreePine, Bike, Theater, ChefHat, Compass, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const activities = [
  { icon: Ship, title: 'Water Sports', desc: 'Snorkeling, scuba diving, jet skiing, parasailing, and banana boat rides.', highlight: 'Most Popular', color: 'from-blue-400 to-cyan-500' },
  { icon: TreePine, title: 'Nature Walks', desc: 'Guided tours through lush tropical forests and coastal trails.', highlight: 'Nature Lovers', color: 'from-emerald-400 to-teal-500' },
  { icon: Bike, title: 'Cycling Tours', desc: 'Explore the island on two wheels with our guided cycling expeditions.', highlight: 'Adventure', color: 'from-amber-400 to-orange-500' },
  { icon: Theater, title: 'Cultural Shows', desc: 'Evening performances featuring traditional music, dance, and local storytelling.', highlight: 'Evenings', color: 'from-purple-400 to-pink-500' },
  { icon: ChefHat, title: 'Cooking Classes', desc: 'Learn to prepare local delicacies with our master chefs.', highlight: 'Hands-On', color: 'from-red-400 to-rose-500' },
  { icon: Compass, title: 'Sightseeing', desc: 'Curated tours to nearby attractions, landmarks, and hidden gems.', highlight: 'Explore', color: 'from-resort-400 to-resort-600' },
]

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function Activities() {
  return (
    <div className="page-transition">
      <section className="relative pt-36 pb-24 bg-navy-900 overflow-hidden">
        <motion.div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?auto=format&fit=crop&w=1920&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }}
          animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} />
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950/80 to-navy-900/60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-resort-400 text-sm tracking-[0.2em] uppercase font-medium">Adventures</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="page-hero-title mt-2">Activities</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="page-hero-subtitle mx-auto">
            Endless adventures await — from thrilling water sports to cultural discoveries.
          </motion.p>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-resort-500 font-medium tracking-[0.2em] text-sm uppercase">Experiences</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-navy-800 mt-2">Discover & Explore</h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto">From adrenaline-pumping adventures to serene cultural experiences.</p>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {activities.map((a, i) => (
              <motion.div key={a.title} variants={fadeUp} whileHover={{ y: -6 }}
                className="group relative card-luxury p-6 lg:p-8 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${a.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                <div className="absolute top-4 right-4">
                  <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-resort-50 text-resort-600">{a.highlight}</span>
                </div>
                <div className="w-14 h-14 rounded-xl bg-navy-50 flex items-center justify-center mb-5 group-hover:bg-navy-800 transition-all duration-300">
                  <a.icon className="w-6 h-6 text-navy-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-navy-800 mb-3">{a.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{a.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mt-14">
            <Link to="/contact" className="btn-dark inline-flex items-center gap-2">Plan Your Adventure <ArrowRight className="w-4 h-4" /></Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
