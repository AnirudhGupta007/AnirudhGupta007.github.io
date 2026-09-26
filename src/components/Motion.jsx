import { Fragment, useEffect, useRef, useState } from 'react'
import { animate, motion, useInView, useMotionValue, useSpring } from 'motion/react'

const EASE = [0.22, 1, 0.36, 1]

export const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-10% 0px' },
  transition: { duration: 0.8, ease: EASE },
}

// Headline that streams in word by word like LLM output, with a blinking caret.
// tokens: [{ text, em?, br? }]
export function TokenHeadline({ tokens, className, delay = 450, speed = 120 }) {
  const [shown, setShown] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(tokens.length)
      return
    }
    let i = 0
    let timer = setTimeout(function tick() {
      i += 1
      setShown(i)
      if (i < tokens.length) timer = setTimeout(tick, speed + Math.random() * 90)
    }, delay)
    return () => clearTimeout(timer)
  }, [tokens, delay, speed])

  return (
    <h1 className={className} aria-label={tokens.map((t) => t.text).join('')}>
      {tokens.map((t, i) => (
        <span key={i} aria-hidden>
          {t.br && <br />}
          <span className={`token ${i < shown ? 'token--on' : ''} ${t.em ? 'grad' : ''}`}>{t.text}</span>
          {i === shown - 1 && <span className="caret" />}
        </span>
      ))}
      {shown === 0 && <span className="caret" aria-hidden />}
    </h1>
  )
}

// Section title whose words rise out of a mask one after another.
// parts: [{ text, em? }]
export function SplitTitle({ parts, className, as: Tag = 'h2' }) {
  const words = parts.flatMap((p) =>
    p.text.split(' ').filter(Boolean).map((w) => ({ w, em: p.em, br: false })).concat(p.br ? [{ br: true }] : []),
  )
  const MotionTag = motion[Tag]
  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ staggerChildren: 0.06 }}
    >
      {words.map((x, i) =>
        x.br ? (
          <br key={i} />
        ) : (
          <Fragment key={i}>
            <span className="mask">
              <motion.span
                className={x.em ? 'grad' : undefined}
                variants={{ hidden: { y: '105%' }, show: { y: 0 } }}
                transition={{ duration: 0.9, ease: EASE }}
              >
                {x.w}
              </motion.span>
            </span>{' '}
          </Fragment>
        ),
      )}
    </MotionTag>
  )
}

export function CountUp({ value, decimals = 0, prefix = '', suffix = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!inView) return
    const c = animate(0, value, { duration: 1.8, ease: EASE, onUpdate: setN })
    return () => c.stop()
  }, [inView, value])
  return (
    <span ref={ref}>
      {prefix}
      {n.toFixed(decimals)}
      {suffix}
    </span>
  )
}

// Wraps a button or link so it leans toward the pointer.
export function Magnetic({ children, strength = 0.35 }) {
  const ref = useRef(null)
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 16 })
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 16 })
  const move = (e) => {
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const leave = () => {
    x.set(0)
    y.set(0)
  }
  return (
    <motion.span ref={ref} className="magnetic" style={{ x, y }} onPointerMove={move} onPointerLeave={leave}>
      {children}
    </motion.span>
  )
}

// A soft ring that trails the pointer and swells over anything clickable. Fine pointers only.
export function Cursor() {
  const [on, setOn] = useState(false)
  const [hover, setHover] = useState(false)
  const x = useSpring(-100, { stiffness: 500, damping: 40 })
  const y = useSpring(-100, { stiffness: 500, damping: 40 })

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    setOn(true)
    const move = (e) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setHover(!!e.target.closest('a, button'))
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [x, y])

  if (!on) return null
  return <motion.div className={`cursor ${hover ? 'cursor--hover' : ''}`} style={{ x, y }} aria-hidden />
}

// Vertical readout of which transformer layer the forward pass is on.
export function LayerMeter({ active, layers }) {
  const idx = Math.round(active)
  return (
    <div className="meter" aria-hidden>
      <span className="meter__label mono">forward pass</span>
      {Array.from({ length: layers }, (_, i) => layers - 1 - i).map((l) => (
        <span key={l} className={`meter__tick ${l === idx ? 'is-on' : ''} ${l < idx ? 'is-done' : ''}`}>
          <i />
          <span className="mono">L{l}</span>
        </span>
      ))}
    </div>
  )
}
