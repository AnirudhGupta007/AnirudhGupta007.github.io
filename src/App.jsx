import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import Lenis from 'lenis'
import { links, stats, work, projects, stack } from './data.js'
import { reveal, TokenHeadline, SplitTitle, CountUp, Magnetic, Cursor, LayerMeter } from './components/Motion.jsx'
import ContactPanel from './components/ContactPanel.jsx'

const Transformer = lazy(() => import('./components/Transformer.jsx'))
const LAYERS = 7

let lenis
function scrollTo(e, id) {
  e.preventDefault()
  const el = document.getElementById(id)
  if (lenis) lenis.scrollTo(el, { offset: -40 })
  else el.scrollIntoView({ behavior: 'smooth' })
}

function Nav({ onContact }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <a href="#top" className="nav__brand" onClick={(e) => scrollTo(e, 'top')}>
        <span className="nav__mark">ag</span>
        <span>Anirudh Gupta</span>
      </a>
      <nav className="nav__links">
        <a href="#work" onClick={(e) => scrollTo(e, 'work')}>Work</a>
        <a href="#projects" onClick={(e) => scrollTo(e, 'projects')}>Projects</a>
        <a href="#stack" onClick={(e) => scrollTo(e, 'stack')}>Stack</a>
        {links.resume && (
          <a href={links.resume} target="_blank" rel="noreferrer">Résumé ↓</a>
        )}
      </nav>
      <Magnetic>
        <button type="button" className="pill pill--ember" onClick={onContact}>
          <span className="pulse" /> Say hi
        </button>
      </Magnetic>
    </header>
  )
}

const headline = [
  { text: 'I ' },
  { text: 'build ' },
  { text: 'agents' },
  { text: 'that ', br: true },
  { text: 'do ', em: true },
  { text: 'the ', em: true },
  { text: 'work.', em: true },
]

function Hero({ onContact }) {
  return (
    <section id="top" className="hero">
      <motion.p className="eyebrow" {...reveal}>
        <span className="eyebrow__dot" /> AI Product Engineer · Bengaluru
      </motion.p>
      <TokenHeadline className="hero__title" tokens={headline} />
      <motion.p className="hero__sub" {...reveal} transition={{ ...reveal.transition, delay: 1.3 }}>
        Multi-agent systems, long-term memory, agentic RAG and tool execution, shipped as products people
        actually use. Currently building <span className="hl">Ozyn</span> at Tipstat.
      </motion.p>
      <motion.div className="hero__cta" {...reveal} transition={{ ...reveal.transition, delay: 1.45 }}>
        <Magnetic>
          <a href="#work" className="pill pill--light" onClick={(e) => scrollTo(e, 'work')}>
            See the work <span aria-hidden>→</span>
          </a>
        </Magnetic>
        {links.resume ? (
          <a href={links.resume} target="_blank" rel="noreferrer" className="link">Download résumé ↓</a>
        ) : (
          <button type="button" className="link" onClick={onContact}>Get in touch ↗</button>
        )}
      </motion.div>
      <div className="hero__hint mono" aria-hidden>
        <span className="hero__line" /> scroll to run the forward pass
      </div>
    </section>
  )
}

function Stats() {
  return (
    <section className="stats">
      {stats.map((s, i) => (
        <motion.div className="stat" key={s.label} {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }}>
          <span className="stat__value">
            <CountUp {...s} />
          </span>
          <span className="stat__label">{s.label}</span>
        </motion.div>
      ))}
    </section>
  )
}

function Points({ items }) {
  return (
    <ul className="points">
      {items.map((p) => (
        <li key={p}>{p}</li>
      ))}
    </ul>
  )
}

function Work() {
  return (
    <section id="work" className="section">
      <div className="section__head">
        <motion.p className="eyebrow" {...reveal}>01 — Experience</motion.p>
        <SplitTitle className="section__title" parts={[{ text: 'Agents in production,', br: true }, { text: 'not in notebooks.', em: true }]} />
      </div>

      {work.map((job) => (
        <motion.article className="job" key={job.company} {...reveal}>
          <div className="job__meta">
            <h3>{job.company}</h3>
            <p>{job.role}</p>
            <p className="mono">{job.period}</p>
            <p className="mono muted">{job.place}</p>
          </div>
          <div className="job__body">
            {job.products ? (
              job.products.map((p) => (
                <div className="product" key={p.name}>
                  <div className="product__head">
                    <h4>{p.name}</h4>
                    <span className="muted">{p.tagline}</span>
                    {p.url && (
                      <a href={p.url} target="_blank" rel="noreferrer" className="link link--small">
                        {p.url.replace(/https?:\/\/|\/$/g, '')} ↗
                      </a>
                    )}
                  </div>
                  <Points items={p.points} />
                </div>
              ))
            ) : (
              <Points items={job.points} />
            )}
          </div>
        </motion.article>
      ))}
    </section>
  )
}

function Projects() {
  return (
    <section id="projects" className="section">
      <div className="section__head">
        <motion.p className="eyebrow" {...reveal}>02 — Projects</motion.p>
        <SplitTitle className="section__title" parts={[{ text: 'Things I built', br: true }, { text: 'on my own time.', em: true }]} />
      </div>

      <div className="cards">
        {projects.map((p, i) => (
          <article className="card" key={p.name} style={{ '--i': i }}>
            <div className="card__inner">
              <div className="card__top">
                <span className="mono muted">
                  {String(i + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
                </span>
                <span className="mono card__kind">{p.kind}</span>
              </div>
              <h3 className="card__name">{p.name}</h3>
              <p className="card__blurb">{p.blurb}</p>
              <div className="card__bottom">
                <p className="mono muted">{p.stack.join('  ·  ')}</p>
                <div className="card__links">
                  {p.live && (
                    <Magnetic strength={0.25}>
                      <a href={p.live} target="_blank" rel="noreferrer" className="pill pill--light">
                        Live <span aria-hidden>↗</span>
                      </a>
                    </Magnetic>
                  )}
                  {p.code && (
                    <a href={p.code} target="_blank" rel="noreferrer" className="link">Code ↗</a>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function Marquee({ items, reverse }) {
  const row = [...items, ...items]
  return (
    <div className={`marquee ${reverse ? 'marquee--rev' : ''}`}>
      <div className="marquee__track">
        {row.map((t, i) => (
          <span key={i} className={i % 2 ? 'marquee__item grad-soft' : 'marquee__item'}>
            {t}
            <i aria-hidden>✦</i>
          </span>
        ))}
      </div>
    </div>
  )
}

function Stack() {
  return (
    <section id="stack" className="section section--wide">
      <div className="section__head section__head--inset">
        <motion.p className="eyebrow" {...reveal}>03 — Stack</motion.p>
        <SplitTitle className="section__title" parts={[{ text: 'Tools I reach for', br: true }, { text: 'every day.', em: true }]} />
      </div>
      <div className="marquees">
        {stack.map((g, i) => (
          <Marquee key={g.group} items={g.items} reverse={i % 2 === 1} />
        ))}
      </div>
      <motion.p className="edu muted" {...reveal}>
        B.Tech, Artificial Intelligence &amp; Data Science · GGSIPU, New Delhi · 2021–2025
      </motion.p>
    </section>
  )
}

function Contact({ onContact }) {
  return (
    <section id="contact" className="contact">
      <motion.p className="eyebrow" {...reveal}>04 — Contact</motion.p>
      <SplitTitle className="contact__title" parts={[{ text: 'Have an agent that', br: true }, { text: 'needs to ship?', em: true }]} />
      <motion.div className="contact__actions" {...reveal}>
        <Magnetic>
          <button type="button" className="pill pill--ember pill--big" onClick={onContact}>
            <span className="pulse" /> Say hi
          </button>
        </Magnetic>
        <a href={`mailto:${links.email}`} className="link">{links.email}</a>
        <a href={links.phoneHref} className="link">{links.phone}</a>
      </motion.div>
      <motion.div className="contact__links" {...reveal}>
        <a href={links.linkedin} target="_blank" rel="noreferrer" className="link">LinkedIn ↗</a>
        <a href={links.github} target="_blank" rel="noreferrer" className="link">GitHub ↗</a>
        <a href={links.whatsapp} target="_blank" rel="noreferrer" className="link">WhatsApp ↗</a>
        {links.resume && (
          <a href={links.resume} target="_blank" rel="noreferrer" className="link">Résumé ↓</a>
        )}
      </motion.div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__row mono muted">
        <span>© {new Date().getFullYear()} Anirudh Gupta</span>
        <span>7 layers · 3 heads · rendered live in WebGL</span>
      </div>
      <div className="footer__word" aria-hidden>
        anirudh
      </div>
    </footer>
  )
}

export default function App() {
  const [contact, setContact] = useState(false)
  const [layer, setLayer] = useState(0)
  const last = useRef(0)
  const onProgress = useCallback((v) => {
    const r = Math.max(0, Math.min(LAYERS - 1, Math.round(v)))
    if (r !== last.current) {
      last.current = r
      setLayer(r)
    }
  }, [])
  const openContact = useCallback(() => setContact(true), [])
  const closeContact = useCallback(() => setContact(false), [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    lenis = new Lenis({ autoRaf: true, lerp: 0.09 })
    return () => {
      lenis.destroy()
      lenis = undefined
    }
  }, [])

  useEffect(() => {
    if (!lenis) return
    if (contact) lenis.stop()
    else lenis.start()
  }, [contact])

  return (
    <>
      <Suspense fallback={null}>
        <Transformer onProgress={onProgress} />
      </Suspense>
      <div className="vignette" aria-hidden />
      <div className="grain" aria-hidden />
      <Cursor />
      <LayerMeter active={layer} layers={LAYERS} />
      <Nav onContact={openContact} />
      <ContactPanel open={contact} onClose={closeContact} />
      <main>
        <Hero onContact={openContact} />
        <Stats />
        <Work />
        <Projects />
        <Stack />
        <Contact onContact={openContact} />
      </main>
      <Footer />
    </>
  )
}
