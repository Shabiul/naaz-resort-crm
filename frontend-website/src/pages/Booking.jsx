import { motion } from 'framer-motion'
import { Shield, RotateCcw, Plane, HeadphonesIcon, Clock } from 'lucide-react'
import BookingForm from '../components/BookingForm'

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function Booking() {
  return (
    <div className="page-transition">
      <section className="relative pt-36 pb-24 bg-navy-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-resort-950/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-resort-400 text-sm tracking-[0.2em] uppercase font-medium">Reservations</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="page-hero-title mt-2">Reservations</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="page-hero-subtitle mx-auto">
            Book your luxury stay at Naaz Resort. Best rates guaranteed.
          </motion.p>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-50px' }}
              className="lg:col-span-3">
              <motion.div variants={fadeIn} className="card-luxury p-8 md:p-12">
                <BookingForm variant="page" />
              </motion.div>
            </motion.div>

            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-50px' }}
              className="lg:col-span-2 space-y-6">
              <motion.div variants={fadeIn} whileHover={{ y: -3 }} className="p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-resort-50 to-resort-100/50 border border-resort-100">
                <h3 className="font-serif font-bold text-xl text-navy-800 mb-5">Why Book Direct?</h3>
                <div className="space-y-5">
                  {[
                    { icon: Shield, text: 'Best price guarantee — find a lower rate and we\'ll match it' },
                    { icon: RotateCcw, text: 'Free cancellation up to 48 hours before check-in' },
                    { icon: Plane, text: 'Complimentary airport transfers on stays of 5+ nights' },
                    { icon: HeadphonesIcon, text: 'Personalized concierge service throughout your stay' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
                        <item.icon className="w-4 h-4 text-resort-500" />
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={fadeIn} whileHover={{ y: -3 }} className="p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-navy-50 to-navy-100/50 border border-navy-100">
                <h3 className="font-serif font-bold text-xl text-navy-800 mb-4">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-5">Our reservation team is available 24/7 to assist you with any questions.</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                      <HeadphonesIcon className="w-4 h-4 text-navy-500" />
                    </div>
                    <span className="font-medium text-navy-800">+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                      <Shield className="w-4 h-4 text-navy-500" />
                    </div>
                    <span className="font-medium text-navy-800">reservations@naazresort.com</span>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={fadeIn} className="p-6 lg:p-8 rounded-2xl border border-gray-200 bg-white">
                <h3 className="font-serif font-bold text-xl text-navy-800 mb-4">Check-in / Check-out</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <span className="text-gray-500 font-medium flex items-center gap-2"><Clock className="w-4 h-4" /> Check-in</span>
                    <span className="font-semibold text-navy-800">2:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <span className="text-gray-500 font-medium flex items-center gap-2"><Clock className="w-4 h-4" /> Check-out</span>
                    <span className="font-semibold text-navy-800">11:00 AM</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
