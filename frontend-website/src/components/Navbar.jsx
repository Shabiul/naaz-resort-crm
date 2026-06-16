import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Phone, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/rooms', label: 'Rooms & Suites' },
  { to: '/dining', label: 'Dining' },
  { to: '/spa', label: 'Spa & Wellness' },
  { to: '/activities', label: 'Activities' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60)
      const total = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(Math.min(window.scrollY / total, 1))
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [location])

  const bgClass = scrolled || !isHome
    ? 'bg-white/95 backdrop-blur-lg shadow-lg shadow-black/5'
    : 'bg-transparent'

  const textClass = scrolled || !isHome
    ? 'text-navy-800'
    : 'text-white'

  const mobileBg = scrolled || !isHome
    ? 'bg-white/95 backdrop-blur-lg'
    : 'bg-navy-900/95 backdrop-blur-md'

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${bgClass}`}>
      {/* Scroll progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-100/20">
        <motion.div
          className="h-full bg-gradient-to-r from-resort-400 to-resort-600"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: -10, scale: 1.1 }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-resort-400 to-resort-600 flex items-center justify-center shadow-lg shadow-resort-500/20"
            >
              <span className="text-white font-serif font-bold text-lg">N</span>
            </motion.div>
            <div>
              <span className={`font-serif font-bold text-xl transition-colors ${textClass}`}>Naaz</span>
              <span className={`text-[10px] block -mt-1 tracking-[0.2em] uppercase transition-colors ${scrolled || !isHome ? 'text-resort-500' : 'text-resort-300'}`}>Resort</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${textClass} ${
                    isActive ? (scrolled || !isHome ? 'text-resort-600' : 'text-resort-300') : 'hover:bg-white/5'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className={`absolute bottom-0 left-3 right-3 h-0.5 rounded-full ${scrolled || !isHome ? 'bg-resort-500' : 'bg-resort-300'}`}
                    />
                  )}
                </Link>
              )
            })}
            <Link to="/booking" className="ml-4 btn-gold text-sm py-2.5 px-6 relative overflow-hidden group">
              <span className="relative z-10">Book Now</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            </Link>
          </div>

          <div className="flex items-center gap-3 lg:hidden">
            <Link to="/booking" className="btn-gold text-sm py-2 px-4">
              Book
            </Link>
            <button onClick={() => setOpen(!open)} className={`p-2 rounded-lg ${textClass}`}>
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`lg:hidden border-t ${mobileBg} ${scrolled || !isHome ? 'border-gray-100' : 'border-white/10'}`}
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? 'bg-resort-50 text-resort-600'
                      : `${scrolled || !isHome ? 'text-navy-700 hover:bg-gray-50' : 'text-white/80 hover:bg-white/10'}`
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 flex items-center gap-2 text-sm px-4 py-2 text-navy-500">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
