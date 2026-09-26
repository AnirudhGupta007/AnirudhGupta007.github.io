import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

const ENDPOINT = 'https://anirudh-portfolio-ai.vercel.app/api/chat'
const SUGGESTIONS = [
  'What has he shipped at Tipstat?',
  'Which projects use LangGraph?',
  'How does Ozyn’s memory work?',
  'How can I reach him?',
]

export default function AskAI({ open, onOpen, onClose }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const listRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => inputRef.current?.focus(), 250)
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const ask = async (text) => {
    const q = text.trim()
    if (!q || busy) return
    const history = [...messages, { role: 'user', content: q }]
    setMessages([...history, { role: 'assistant', content: '' }])
    setInput('')
    setBusy(true)
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })
      if (!res.ok || !res.body) {
        const msg = res.status === 429 ? await res.text() : 'Something went wrong. Try again, or email me directly.'
        throw new Error(msg)
      }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let out = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        out += decoder.decode(value, { stream: true })
        setMessages([...history, { role: 'assistant', content: out }])
      }
    } catch (err) {
      setMessages([...history, { role: 'assistant', content: err.message, error: true }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            className="ask__fab"
            onClick={onOpen}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24, delay: 0.1 }}
          >
            <span className="ask__spark" aria-hidden>✦</span> Ask my AI
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.section
            className="ask"
            role="dialog"
            aria-label="Ask my AI"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 360, damping: 30 }}
          >
            <header className="ask__head">
              <div>
                <p className="ask__title">Ask my AI</p>
                <p className="mono muted ask__sub">Answers only from my résumé and projects</p>
              </div>
              <button type="button" className="ask__close" onClick={onClose} aria-label="Close">
                ✕
              </button>
            </header>

            <div className="ask__list" ref={listRef} data-lenis-prevent>
              {messages.length === 0 && (
                <div className="ask__empty">
                  <p className="muted">Hi! I know Anirudh’s work inside out. Try one of these:</p>
                  <div className="ask__chips">
                    {SUGGESTIONS.map((s) => (
                      <button key={s} type="button" onClick={() => ask(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  className={`ask__msg ask__msg--${m.role} ${m.error ? 'ask__msg--error' : ''}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {m.content || <span className="ask__dots"><i /><i /><i /></span>}
                </motion.div>
              ))}
            </div>

            <form
              className="ask__form"
              onSubmit={(e) => {
                e.preventDefault()
                ask(input)
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about projects, stack, experience…"
                maxLength={500}
                aria-label="Your question"
              />
              <button type="submit" disabled={busy || !input.trim()} aria-label="Send">
                ↑
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  )
}
