import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Star, ArrowRight, Waves } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const heroVideos = [
  'https://cdn.pixabay.com/video/2024/06/29/218714_large.mp4',
  'https://cdn.pixabay.com/video/2024/06/11/216199_large.mp4',
  'https://cdn.pixabay.com/video/2021/02/18/65562-515098354_large.mp4',
  'https://cdn.pixabay.com/video/2022/11/22/140111-774507949_large.mp4',
  'https://cdn.pixabay.com/video/2019/06/05/24216-340670744_large.mp4',
]

const fallbackImages = [
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80',
]

export default function HeroSection() {
  const [videoIndex, setVideoIndex] = useState(0)
  const [imgIndex, setImgIndex] = useState(0)
  const [videoFailed, setVideoFailed] = useState(false)
  const videoRef = useRef(null)
  const sectionRef = useRef(null)

  // Cycle videos every 7s, fallback images every 5s
  useEffect(() => {
    if (!videoFailed) {
      const interval = setInterval(() => setVideoIndex(i => (i + 1) % heroVideos.length), 7000)
      return () => clearInterval(interval)
    }
    const interval = setInterval(() => setImgIndex(i => (i + 1) % fallbackImages.length), 5000)
    return () => clearInterval(interval)
  }, [videoFailed])

  // Smooth video transition helper - preload next video
  useEffect(() => {
    const nextIdx = (videoIndex + 1) % heroVideos.length
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.as = 'video'
    link.href = heroVideos[nextIdx]
    document.head.appendChild(link)
    return () => document.head.removeChild(link)
  }, [videoIndex])

  return (
    <section ref={sectionRef} className="relative h-screen min-h-[650px] max-h-[1000px] overflow-hidden">
      {/* Background layer */}
      <div className="absolute inset-0">
        {!videoFailed ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={videoIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <video
                key={heroVideos[videoIndex]}
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ willChange: 'transform' }}
                onError={() => setVideoFailed(true)}
              >
                <source src={heroVideos[videoIndex]} type="video/mp4" />
              </video>
            </motion.div>
          </AnimatePresence>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={imgIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${fallbackImages[imgIndex]})` }}
            />
          </AnimatePresence>
        )}

        {/* Overlay layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950/80 via-navy-900/50 to-resort-900/20 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/30 via-transparent to-navy-950/30 z-10" />
      </div>

      {/* Video navigation dots */}
      {!videoFailed && (
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
          {heroVideos.map((_, i) => (
            <button
              key={i}
              onClick={() => setVideoIndex(i)}
              className={`rounded-full transition-all duration-500 ${
                i === videoIndex ? 'bg-resort-400 w-2 h-6' : 'bg-white/30 hover:bg-white/60 w-2 h-2'
              }`}
              aria-label={`Video ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-20 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center gap-3 mb-5"
            >
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.08, type: 'spring', stiffness: 300, damping: 15 }}
                  >
                    <Star className="w-5 h-5 fill-resort-400 text-resort-400" />
                  </motion.div>
                ))}
              </div>
              <span className="text-white/50 text-sm tracking-[0.2em] uppercase font-medium">Luxury Beachfront Resort</span>
              <div className="w-12 h-px bg-resort-500/50" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-white leading-[1.1]"
            >
              Where Paradise
              <br />
              <span className="text-resort-400">Meets Luxury</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-lg sm:text-xl text-white/70 mt-6 max-w-xl leading-relaxed font-light"
            >
              Experience world-class hospitality on pristine shores.
              Unforgettable moments await at Naaz Resort.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap gap-5 mt-10"
            >
              <Link
                to="/booking"
                className="bg-resort-500 hover:bg-resort-600 text-white font-medium py-4 px-10 rounded-xl text-base transition-all duration-300 shadow-2xl shadow-resort-500/30 hover:shadow-resort-500/50 hover:-translate-y-0.5 flex items-center gap-2"
              >
                Reserve Your Stay
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/rooms"
                className="border-2 border-white/20 hover:border-resort-400/50 text-white font-medium py-4 px-10 rounded-xl text-base transition-all duration-300 hover:bg-white/5 backdrop-blur-sm flex items-center gap-2"
              >
                Explore Rooms
                <Waves className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex gap-8 mt-14 pt-8 border-t border-white/10"
            >
              {[
                { icon: Star, value: '5-Star', label: 'Accommodation' },
                { icon: Waves, value: '120+', label: 'Awards Won' },
                { icon: Star, value: '98%', label: 'Guest Satisfaction' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <s.icon className="w-4 h-4 text-resort-400" />
                  <div>
                    <p className="text-white font-semibold text-sm">{s.value}</p>
                    <p className="text-white/40 text-xs">{s.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-10" />

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-white/30 text-[10px] tracking-[0.2em] uppercase">Scroll</span>
          <div className="w-[18px] h-7 rounded-full border border-white/20 flex items-start justify-center p-1">
            <motion.div
              className="w-[3px] h-[3px] rounded-full bg-resort-400"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
