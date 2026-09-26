import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { links } from '../data.js'

export default function ContactPanel({ open, onClose }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(links.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      window.location.href = `mailto:${links.email}`
    }
  }

  const rows = [
    { label: 'Call', value: links.phone, href: links.phoneHref },
    { label: 'WhatsApp', value: 'Message me', href: links.whatsapp, external: true },
    { label: 'LinkedIn', value: 'anirudhgupta00', href: links.linkedin, external: true },
    { label: 'GitHub', value: 'AnirudhGupta007', href: links.github, external: true },
  ]

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="panel__backdrop"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            className="panel"
            role="dialog"
            aria-label="Contact"
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            <div className="panel__head">
              <p className="panel__title">Say hi</p>
              <span className="panel__status mono">
                <i /> Bengaluru · IST
              </span>
            </div>

            <div className="panel__mail">
              <a href={`mailto:${links.email}`}>{links.email}</a>
              <button type="button" onClick={copy} className="panel__copy mono">
                {copied ? 'Copied ✓' : 'Copy'}
              </button>
            </div>

            <ul className="panel__rows">
              {rows.map((r, i) => (
                <motion.li
                  key={r.label}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05 }}
                >
                  <a href={r.href} {...(r.external ? { target: '_blank', rel: 'noreferrer' } : {})}>
                    <span className="mono muted">{r.label}</span>
                    <span>{r.value} ↗</span>
                  </a>
                </motion.li>
              ))}
            </ul>

            {links.resume && (
              <a href={links.resume} target="_blank" rel="noreferrer" className="pill pill--accent panel__resume">
                Download résumé <span aria-hidden>↓</span>
              </a>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
