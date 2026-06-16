import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { Star, Waves, UtensilsCrossed, Sparkles, TreePine, Ship, ArrowRight, CheckCircle, ChevronLeft, ChevronRight, Quote, Award, Heart, Sun } from 'lucide-react'
import HeroSection from '../components/HeroSection'
import RoomCard from '../components/RoomCard'
import BookingForm from '../components/BookingForm'
import { api } from '../services/api'

const amenities = [
  { icon: Waves, title: 'Infinity Pool', desc: 'Overlooking the ocean with private cabanas', color: 'from-blue-400 to-cyan-500' },
  { icon: Sparkles, title: 'Luxury Spa', desc: 'Traditional and modern wellness treatments', color: 'from-purple-400 to-pink-500' },
  { icon: UtensilsCrossed, title: 'Fine Dining', desc: 'Multi-cuisine restaurant with ocean views', color: 'from-amber-400 to-orange-500' },
  { icon: TreePine, title: 'Private Beach', desc: 'Exclusive access to pristine shores', color: 'from-emerald-400 to-teal-500' },
  { icon: Ship, title: 'Water Sports', desc: 'Snorkeling, diving, and parasailing', color: 'from-sky-400 to-indigo-500' },
  { icon: Star, title: 'Concierge', desc: 'Personalized 24/7 concierge service', color: 'from-resort-400 to-resort-600' },
]

const testimonials = [
  { name: 'Sarah & James Mitchell', text: 'The most incredible resort we have ever stayed at. Every detail was perfect — from the room to the service.', rating: 5, trip: 'Honeymoon', location: 'London, UK' },
  { name: 'The Patel Family', text: 'Our kids loved the pool and activities. The staff went above and beyond to make our family vacation memorable.', rating: 5, trip: 'Family Vacation', location: 'Mumbai, India' },
  { name: 'David Chen', text: 'As a business traveler, the Presidential Suite exceeded all expectations. World-class accommodations.', rating: 5, trip: 'Business Retreat', location: 'Singapore' },
  { name: 'Emma Rodriguez', text: 'The spa treatments were heavenly. I left feeling completely rejuvenated. Will definitely return!', rating: 5, trip: 'Wellness Getaway', location: 'Barcelona, Spain' },
]

function AnimatedCounter({ target, suffix = '', decimals = 0 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const duration = 2000
    const step = 16
    const totalSteps = duration / step
    const increment = target / totalSteps

    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, step)

    return () => clearInterval(timer)
  }, [isInView, target])

  return <span ref={ref}>{count.toFixed(decimals)}{suffix}</span>
}

function TestimonialCarousel() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setCurrent(i => (i + 1) % testimonials.length), 5000)
    return () => clearInterval(interval)
  }, [])

  const t = testimonials[current]

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
          className="p-8 md:p-12 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
        >
          <Quote className="w-10 h-10 text-resort-400/50 mb-4" />
          <p className="text-xl md:text-2xl text-navy-100 leading-relaxed mb-8 font-light italic">"{t.text}"</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-resort-400 to-resort-600 flex items-center justify-center text-white font-bold">
              {t.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <p className="font-semibold text-white">{t.name}</p>
              <div className="flex items-center gap-3 text-sm text-navy-300">
                <span>{t.location}</span>
                <span className="w-1 h-1 rounded-full bg-navy-500" />
                <span className="text-resort-400">{t.trip}</span>
              </div>
            </div>
            <div className="ml-auto flex gap-0.5">
              {[...Array(t.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-resort-400 text-resort-400" />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center justify-center gap-3 mt-6">
        <button onClick={() => setCurrent(i => (i - 1 + testimonials.length) % testimonials.length)}
          className="w-10 h-10 rounded-full border border-white/20 hover:border-resort-400 text-white/60 hover:text-resort-400 flex items-center justify-center transition-all">
          <ChevronLeft className="w-5 h-5" />
        </button>
        {testimonials.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${i === current ? 'w-8 bg-resort-400' : 'w-1.5 bg-white/20 hover:bg-white/40'}`}
          />
        ))}
        <button onClick={() => setCurrent(i => (i + 1) % testimonials.length)}
          className="w-10 h-10 rounded-full border border-white/20 hover:border-resort-400 text-white/60 hover:text-resort-400 flex items-center justify-center transition-all">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

function SectionDivider({ flip = false }) {
  return (
    <div className="relative -mt-1">
      <svg viewBox="0 0 1440 60" className="w-full h-auto">
        <path d={flip
          ? 'M0,30 C360,60 720,0 1440,30 L1440,0 L0,0 Z'
          : 'M0,30 C360,0 720,60 1440,30 L1440,60 L0,60 Z'}
          fill="currentColor"
          className="text-white"
        />
      </svg>
    </div>
  )
}

export default function Home() {
  const [rooms, setRooms] = useState([])
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    api.getRooms().then(d => setRooms(d.rooms || [])).catch(() => {})
  }, [])

  return (
    <div>
      <HeroSection />

      {/* Welcome Section */}
      <section className="py-24 lg:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <motion.span
              initial={{ opacity: 0, letterSpacing: '0.5em' }}
              whileInView={{ opacity: 1, letterSpacing: '0.2em' }}
              viewport={{ once: true }}
              className="text-resort-500 font-medium tracking-[0.2em] text-sm uppercase"
            >
              Welcome to Naaz
            </motion.span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-navy-800 mt-4 mb-6">
              A Sanctuary of Luxury
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed max-w-2xl mx-auto">
              Nestled along pristine shores, Naaz Resort offers an unparalleled escape where
              every moment is crafted for your delight. From world-class dining to rejuvenating spa experiences,
              discover a world of elegance and tranquility.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              { number: 5, suffix: '', label: 'Room Categories', sub: 'From Standard to Presidential', icon: Award },
              { number: 28, suffix: '', label: 'Luxury Rooms', sub: 'Each uniquely designed', icon: Heart },
              { number: 247, suffix: '', label: 'Concierge', sub: 'Around-the-clock service', icon: Sun },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="relative group text-center p-8 lg:p-10 rounded-2xl bg-gradient-to-b from-resort-50 to-white border border-resort-100 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-resort-500/0 via-resort-500/0 to-resort-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-resort-100 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 group-hover:bg-resort-500 transition-all duration-300">
                    <s.icon className="w-6 h-6 text-resort-500 group-hover:text-white transition-colors" />
                  </div>
                  <p className="text-5xl lg:text-6xl font-serif font-bold text-resort-500">
                    {s.number === 247 ? (
                      <span>24/<span className="text-3xl">7</span></span>
                    ) : (
                      <AnimatedCounter target={s.number} />
                    )}
                    {s.suffix}
                  </p>
                  <p className="text-lg font-semibold text-navy-800 mt-2">{s.label}</p>
                  <p className="text-sm text-gray-500 mt-1">{s.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Rooms Preview */}
      <section className="py-24 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="flex flex-col sm:flex-row items-end justify-between mb-14"
          >
            <div>
              <span className="text-resort-500 font-medium tracking-[0.2em] text-sm uppercase">Accommodation</span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-navy-800 mt-2">Rooms & Suites</h2>
              <p className="text-gray-500 mt-2 max-w-lg">Choose from our selection of meticulously designed rooms and suites, each offering a unique experience.</p>
            </div>
            <Link to="/rooms" className="hidden sm:flex items-center gap-2 text-resort-600 hover:text-resort-700 font-medium mt-4 sm:mt-0 group">
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.slice(0, 3).map((room, i) => (
              <RoomCard key={room.id} room={room} index={i} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10 sm:hidden"
          >
            <Link to="/rooms" className="btn-dark inline-flex items-center gap-2">View All Rooms <ArrowRight className="w-4 h-4" /></Link>
          </motion.div>
        </div>
      </section>

      <SectionDivider flip />

      {/* Amenities */}
      <section className="py-24 lg:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-16"
          >
            <span className="text-resort-500 font-medium tracking-[0.2em] text-sm uppercase">Experiences</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-navy-800 mt-2">World-Class Amenities</h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto">Indulge in our curated selection of amenities designed for your comfort and pleasure.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {amenities.map((a, i) => (
              <motion.div
                key={a.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative p-6 lg:p-8 rounded-2xl border border-gray-100 bg-white hover:border-transparent transition-all duration-500 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${a.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 group-hover:scale-[6] transition-transform duration-700 ease-out" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-resort-50 to-resort-100 flex items-center justify-center mb-5 group-hover:from-resort-500 group-hover:to-resort-600 transition-all duration-500 shadow-lg shadow-resort-500/0 group-hover:shadow-resort-500/20">
                    <a.icon className="w-6 h-6 text-resort-500 group-hover:text-white transition-colors duration-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-navy-800 mb-2 group-hover:text-resort-600 transition-colors">{a.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{a.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Testimonials */}
      <section className="py-24 lg:py-32 bg-navy-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-resort-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-resort-500/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-12"
          >
            <span className="text-resort-400 font-medium tracking-[0.2em] text-sm uppercase">Testimonials</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mt-2">What Our Guests Say</h2>
          </motion.div>

          <TestimonialCarousel />
        </div>
      </section>

      <SectionDivider flip />

      {/* Quick Booking */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.7 }}
            >
              <span className="text-resort-500 font-medium tracking-[0.2em] text-sm uppercase">Book Now</span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-navy-800 mt-3 mb-6 leading-tight">
                Ready for an Unforgettable Experience?
              </h2>
              <p className="text-gray-500 leading-relaxed mb-8 text-lg">
                Book your stay at Naaz Resort and immerse yourself in luxury.
                Whether it's a romantic getaway, family vacation, or corporate retreat,
                we have the perfect accommodation for you.
              </p>
              <div className="space-y-4">
                {[
                  'Best price guarantee',
                  'Free cancellation up to 48 hours',
                  'Complimentary airport transfers on 5+ night stays',
                  'Exclusive access to spa and wellness facilities',
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.7 }}
              className="card-luxury p-8 lg:p-10"
            >
              <BookingForm variant="widget" />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
