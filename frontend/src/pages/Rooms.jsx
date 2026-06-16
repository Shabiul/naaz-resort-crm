import { useState, useEffect } from 'react'
import { Building2, Users, Wifi, Tv, Wind, Coffee, Waves, Ship, Trees } from 'lucide-react'
import { api } from '../services/api'

const amenityIcons = {
  wifi: Wifi,
  tv: Tv,
  air: Wind,
  'mini bar': Coffee,
  balcony: Building2,
  'ocean view': Waves,
  'garden view': Trees,
  pool: Waves,
  jacuzzi: Waves,
  butler: Building2,
}

const roomData = [
  { name: 'Standard Room', type: 'Standard Room', price: 120, maxAdults: 2, maxChildren: 1, total: 10, desc: 'Comfortable room with modern amenities. Perfect for budget-conscious travelers.', amenities: ['Wi-Fi', 'TV', 'Air Conditioning', 'Mini Bar', 'Room Service'] },
  { name: 'Deluxe Room', type: 'Deluxe Room', price: 200, maxAdults: 2, maxChildren: 2, total: 8, desc: 'Spacious room with premium furnishings and garden view.', amenities: ['Wi-Fi', 'TV', 'Air Conditioning', 'Mini Bar', 'Room Service', 'Balcony', 'Garden View'] },
  { name: 'Suite', type: 'Suite', price: 350, maxAdults: 3, maxChildren: 2, total: 5, desc: 'Luxurious suite with separate living area and panoramic views.', amenities: ['Wi-Fi', 'TV', 'Air Conditioning', 'Mini Bar', 'Living Area', 'Balcony', 'Ocean View', 'Jacuzzi'] },
  { name: 'Villa', type: 'Villa', price: 550, maxAdults: 4, maxChildren: 3, total: 3, desc: 'Private villa with personal pool, garden, and butler service.', amenities: ['Wi-Fi', 'TV', 'Air Conditioning', 'Full Bar', 'Private Pool', 'Garden', 'Butler Service', 'Kitchen', 'Ocean View'] },
  { name: 'Presidential Suite', type: 'Presidential Suite', price: 1200, maxAdults: 4, maxChildren: 2, total: 2, desc: 'Our finest accommodation with panoramic ocean views, private terrace, and personalized concierge.', amenities: ['Wi-Fi', 'TV', 'Air Conditioning', 'Full Bar', 'Private Pool', 'Butler Service', 'Concierge', 'Terrace', 'Ocean View', 'Jacuzzi', 'Private Chef'] },
]

export default function Rooms() {
  const [avail, setAvail] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getRoomAvailability()
      .then((data) => {
        const map = {}
        data.rooms?.forEach((r) => { map[r.room_type] = r.available_rooms })
        setAvail(map)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Rooms & Suites</h2>
        <p className="text-gray-500 mt-1">Manage room inventory and availability</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roomData.map((room) => (
          <div key={room.type} className="card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                <p className="text-2xl font-bold text-resort-600 mt-1">${room.price}<span className="text-sm font-normal text-gray-400">/night</span></p>
              </div>
              {!loading && (
                <div className="text-right">
                  <p className="text-sm text-gray-500">Available</p>
                  <p className={`text-xl font-bold ${(avail[room.type] || 0) > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {avail[room.type] || 0}/{room.total}
                  </p>
                </div>
              )}
            </div>

            <p className="text-sm text-gray-600 mb-4">{room.desc}</p>

            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
              <Users className="w-3 h-3" />
              <span>Up to {room.maxAdults} adults, {room.maxChildren} children</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {room.amenities.map((a) => (
                <span key={a} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 rounded-full text-xs text-gray-600">
                  {a}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
