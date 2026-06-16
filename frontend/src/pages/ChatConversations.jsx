import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, MessageCircle, Eye, Bot, User, Phone, Mail } from 'lucide-react'
import { api } from '../services/api'

export default function ChatConversations() {
  const [conversations, setConversations] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [transcripts, setTranscripts] = useState({})

  useEffect(() => {
    api.getChatConversations()
      .then((data) => setConversations(Array.isArray(data) ? data : []))
      .catch(() => setConversations([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = conversations.filter(
    (c) =>
      c.guest_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  )

  const toggleExpand = async (id) => {
    if (expanded === id) {
      setExpanded(null)
      return
    }
    setExpanded(id)
    if (!transcripts[id]) {
      try {
        const data = await api.getChatConversation(id)
        setTranscripts((prev) => ({ ...prev, [id]: data.messages || [] }))
      } catch {
        setTranscripts((prev) => ({ ...prev, [id]: [] }))
      }
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Chat Conversations</h2>
        <p className="text-gray-500 mt-1">Live chatbot conversations with guests</p>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="input-field pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-resort-500" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="card text-center py-12 text-gray-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No chat conversations yet</p>
              <p className="text-sm mt-1">Open the chat widget on the dashboard to start a conversation</p>
            </div>
          ) : (
            filtered.map((conv) => (
              <div key={conv.id} className="card overflow-hidden p-0">
                <button
                  onClick={() => toggleExpand(conv.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      conv.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <MessageCircle className={`w-5 h-5 ${
                        conv.status === 'active' ? 'text-green-600' : 'text-gray-500'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{conv.guest_name || 'Guest'}</p>
                      <p className="text-xs text-gray-400">
                        {conv.status === 'active' ? (
                          <span className="text-green-600 font-medium">Active</span>
                        ) : (
                          conv.status
                        )}
                        {conv.phone && ` | ${conv.phone}`}
                        {conv.email && ` | ${conv.email}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {conv.lead_id > 0 && (
                      <span className="badge bg-purple-100 text-purple-700">Lead</span>
                    )}
                    {conv.booking_id > 0 && (
                      <span className="badge bg-blue-100 text-blue-700">Booked</span>
                    )}
                    <span className="text-xs text-gray-400">
                      {conv.updated_at ? new Date(conv.updated_at).toLocaleString() : ''}
                    </span>
                  </div>
                </button>

                {expanded === conv.id && (
                  <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {transcripts[conv.id]?.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">No messages loaded</p>
                      ) : (
                        transcripts[conv.id]?.map((msg, i) => (
                          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                              msg.role === 'user'
                                ? 'bg-resort-500 text-white'
                                : 'bg-white text-gray-800 border border-gray-200'
                            }`}>
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                              <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-resort-200' : 'text-gray-400'}`}>
                                {msg.created_at ? new Date(msg.created_at).toLocaleTimeString() : ''}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
