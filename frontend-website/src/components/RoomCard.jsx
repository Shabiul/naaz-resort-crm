import { Link } from 'react-router-dom'
import { Users, Wifi, Tv, Wind, Waves, Bath, Coffee, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

const amenityIcons = {
  'Wi-Fi': Wifi, 'TV': Tv, 'Air Conditioning': Wind, 'Mini Bar': Coffee,
  'Ocean View': Waves, 'Balcony': Wind, 'Jacuzzi': Bath, 'Private Pool': Waves,
}

export default function RoomCard({ room, index }) {
  const amenityList = (room.amenities || []).slice(0, 4)

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="card-luxury group"
    >
      <div className="relative h-56 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
        <div
          className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80)`,
          }}
        />
        <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5">
          <span className="text-resort-600 font-bold text-lg">${room.price_per_night}</span>
          <span className="text-gray-500 text-xs"> / night</span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-serif font-semibold text-navy-800">{room.name}</h3>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            room.available_rooms > 2 ? 'bg-green-50 text-green-700' :
            room.available_rooms > 0 ? 'bg-yellow-50 text-yellow-700' :
            'bg-red-50 text-red-700'
          }`}>
            {room.available_rooms > 0 ? `${room.available_rooms} left` : 'Sold Out'}
          </span>
        </div>

        <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
          {room.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {room.max_adults} Adults
          </span>
          {room.max_children > 0 && (
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {room.max_children} Children
            </span>
          )}
        </div>

        <div className="flex gap-2 flex-wrap mb-5">
          {amenityList.map((a) => {
            const Icon = amenityIcons[a] || Wifi
            return (
              <span key={a} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 rounded-full text-xs text-gray-600">
                <Icon className="w-3 h-3" />
                {a}
              </span>
            )
          })}
          {room.amenities?.length > 4 && (
            <span className="text-xs text-gray-400 self-center">+{room.amenities.length - 4} more</span>
          )}
        </div>

        <Link
          to={`/booking?room=${encodeURIComponent(room.room_type)}`}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-resort-500 text-resort-600 rounded-lg font-medium hover:bg-resort-500 hover:text-white transition-all group"
        >
          Book This Room
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  )
}
