import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Clock, Instagram, Twitter, Facebook, Youtube, ArrowUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const footerLinks = {
  accommodation: [
    { to: '/rooms', label: 'Standard Room' },
    { to: '/rooms', label: 'Deluxe Room' },
    { to: '/rooms', label: 'Suite' },
    { to: '/rooms', label: 'Villa' },
    { to: '/rooms', label: 'Presidential Suite' },
  ],
  experiences: [
    { to: '/dining', label: 'Fine Dining' },
    { to: '/spa', label: 'Spa & Wellness' },
    { to: '/activities', label: 'Adventure Sports' },
    { to: '/activities', label: 'Sightseeing' },
    { to: '/gallery', label: 'Gallery' },
  ],
  support: [
    { to: '/contact', label: 'Contact Us' },
    { to: '/booking', label: 'Reservations' },
    { to: '/contact', label: 'FAQ' },
    { to: '/contact', label: 'Privacy Policy' },
    { to: '/contact', label: 'Terms & Conditions' },
  ],
}

const socials = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Youtube, href: '#', label: 'Youtube' },
]

export default function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 600)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer className="bg-navy-900 text-white relative">
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={scrollToTop}
            className="fixed bottom-6 left-6 z-40 w-12 h-12 rounded-full bg-resort-500 hover:bg-resort-600 text-white flex items-center justify-center shadow-lg shadow-resort-500/30 transition-all hover:scale-105 active:scale-95"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-resort-400 to-resort-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-serif font-bold text-2xl">N</span>
              </div>
              <div>
                <span className="font-serif font-bold text-2xl">Naaz Resort</span>
                <p className="text-xs text-resort-300 tracking-[0.2em] uppercase">Luxury Beachfront Retreat</p>
              </div>
            </div>
            <p className="text-navy-200 leading-relaxed mb-6 max-w-md">
              Experience unparalleled luxury at Naaz Resort. Nestled along pristine shores,
              we offer world-class accommodations, exceptional dining, and unforgettable experiences.
            </p>
            <div className="space-y-3 text-sm text-navy-200">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-resort-400" />
                <span>123 Beachfront Drive, Paradise Island</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-resort-400" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-resort-400" />
                <span>reservations@naazresort.com</span>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              {socials.map((s) => (
                <a key={s.label} href={s.href}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-resort-500 flex items-center justify-center transition-all hover:-translate-y-0.5"
                  aria-label={s.label}>
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-lg mb-5">Accommodation</h4>
            <ul className="space-y-3">
              {footerLinks.accommodation.map((l, i) => (
                <li key={i}>
                  <Link to={l.to} className="text-navy-300 hover:text-resort-400 text-sm transition-colors hover:translate-x-1 inline-block">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-lg mb-5">Experiences</h4>
            <ul className="space-y-3">
              {footerLinks.experiences.map((l, i) => (
                <li key={i}>
                  <Link to={l.to} className="text-navy-300 hover:text-resort-400 text-sm transition-colors hover:translate-x-1 inline-block">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-lg mb-5">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((l, i) => (
                <li key={i}>
                  <Link to={l.to} className="text-navy-300 hover:text-resort-400 text-sm transition-colors hover:translate-x-1 inline-block">{l.label}</Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-resort-400 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Check-in / Check-out</span>
              </div>
              <p className="text-sm text-navy-200">Check-in: 2:00 PM</p>
              <p className="text-sm text-navy-200">Check-out: 11:00 AM</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-navy-400">&copy; {new Date().getFullYear()} Naaz Resort. All rights reserved.</p>
          <p className="text-sm text-navy-400">Crafted with care for extraordinary experiences.</p>
        </div>
      </div>
    </footer>
  )
}
