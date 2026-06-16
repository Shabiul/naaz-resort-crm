import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot } from 'lucide-react'
import { api } from '../services/api'

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [convId, setConvId] = useState(null)
  const [typing, setTyping] = useState(false)
  const [guestInfo, setGuestInfo] = useState({})
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const startConversation = async () => {
    try {
      const res = await api.createChatConversation()
      setConvId(res.conversation_id)
      setMessages([{ role: 'assistant', content: res.message }])
    } catch {
      setMessages([{ role: 'assistant', content: 'Welcome to Naaz Resort! How may I assist you today?' }])
    }
  }

  const sendMessage = async () => {
    if (!input.trim()) return
    const text = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setTyping(true)
    try {
      if (!convId) {
        const res = await api.createChatConversation()
        setConvId(res.conversation_id)
      }
      const res = await api.sendChatMessage(convId, text, guestInfo)
      const nameMatch = text.match(/my name is (\w+)/i) || text.match(/i am (\w+)/i) || text.match(/i'm (\w+)/i)
      if (nameMatch) setGuestInfo((prev) => ({ ...prev, guest_name: nameMatch[1] }))
      setTimeout(() => {
        setTyping(false)
        setMessages((prev) => [...prev, { role: 'assistant', content: res.response }])
      }, 1200)
    } catch {
      setTyping(false)
    }
  }

  const handleToggle = () => {
    if (!open && messages.length === 0) startConversation()
    setOpen(!open)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {open && (
        <div className="mb-4 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="bg-resort-600 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <div>
                <p className="font-semibold text-sm">Naaz Resort Assistant</p>
                <p className="text-xs text-resort-200">Online</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 h-72 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === 'user'
                    ? 'bg-resort-500 text-white rounded-br-md'
                    : 'bg-white text-navy-800 border border-gray-200 rounded-bl-md shadow-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    {[0, 150, 300].map(d => (<span key={d} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-gray-200 p-3 bg-white">
            <div className="flex items-center gap-2">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..." className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-resort-500 focus:border-resort-500 outline-none" disabled={typing} />
              <button onClick={sendMessage} disabled={typing || !input.trim()}
                className="w-10 h-10 bg-resort-500 hover:bg-resort-600 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-all">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <button onClick={handleToggle}
        className="w-14 h-14 bg-resort-500 hover:bg-resort-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95">
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  )
}
