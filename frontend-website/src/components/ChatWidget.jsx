import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../services/api'

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Welcome to Naaz Resort! How may I assist you today?' }])
  const [input, setInput] = useState('')
  const [convId, setConvId] = useState(null)
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typing])

  useEffect(() => {
    if (open && !convId) {
      api.createChat({ source: 'website_widget' }).then(res => setConvId(res.conversation_id)).catch(() => {})
    }
  }, [open, convId])

  const send = async () => {
    if (!input.trim() || !convId) return
    const text = input.trim()
    setInput('')
    setMessages(p => [...p, { role: 'user', content: text }])
    setTyping(true)
    try {
      const res = await api.sendChat(convId, text)
      setTimeout(() => { setTyping(false); setMessages(p => [...p, { role: 'assistant', content: res.response }]) }, 1000)
    } catch { setTyping(false) }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            <div className="bg-navy-800 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-resort-400" />
                <div>
                  <p className="font-semibold text-sm">Naaz Resort</p>
                  <p className="text-xs text-navy-300">Online</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="h-72 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === 'user' ? 'bg-resort-500 text-white rounded-br-md' : 'bg-white text-navy-800 border border-gray-200 rounded-bl-md shadow-sm'
                  }`}>{msg.content}</div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex gap-1">{[0, 150, 300].map(d => (<span key={d} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />))}</div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-gray-200 p-3 bg-white">
              <div className="flex items-center gap-2">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
                  placeholder="Type a message..." className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-resort-500 outline-none" disabled={typing} />
                <button onClick={send} disabled={typing || !input.trim()}
                  className="w-10 h-10 bg-resort-500 hover:bg-resort-600 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-all">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={() => setOpen(!open)}
        className="w-14 h-14 bg-resort-500 hover:bg-resort-600 text-white rounded-full shadow-2xl shadow-resort-500/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95">
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  )
}
