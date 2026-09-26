import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import Lenis from 'lenis'
import { availability, links, work, projects, stack } from './data.js'
import { reveal, TokenHeadline, SplitTitle, Magnetic, Cursor } from './components/Motion.jsx'
import ContactPanel from './components/ContactPanel.jsx'
import AskAI from './components/AskAI.jsx'

const NeuralNet = lazy(() => import('./components/NeuralNet.jsx'))

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
        <button type="button" className="pill pill--accent" onClick={onContact}>
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

function Hero({ onAsk, onContact }) {
  return (
    <section id="top" className="hero">
      <motion.div className="hero__top" {...reveal}>
        <p className="eyebrow">AI Product Engineer · Bengaluru</p>
        <button type="button" className="status" onClick={onContact}>
          <i /> {availability}
        </button>
      </motion.div>
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
        <button type="button" className="link" onClick={onAsk}>
          <span className="grad-soft">✦</span> Ask my AI about me
        </button>
        {links.resume && (
          <a href={links.resume} target="_blank" rel="noreferrer" className="link">Résumé ↓</a>
        )}
      </motion.div>
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
        <motion.article className="job glass" key={job.company} {...reveal}>
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

// Browser-framed demo that only plays while the card is on screen.
function Preview({ media, name, href }) {
  const ref = useRef(null)
  useEffect(() => {
    const v = ref.current
    if (!v || !media.video) return
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), {
      threshold: 0.35,
    })
    io.observe(v)
    return () => io.disconnect()
  }, [media.video])
  return (
    <a className="preview" href={href} target="_blank" rel="noreferrer" aria-label={`Open ${name}`}>
      <span className="preview__bar" aria-hidden>
        <i /><i /><i />
        <span className="mono">{href?.replace(/https?:\/\/|\/$/g, '')}</span>
      </span>
      {media.video ? (
        <video ref={ref} src={media.video} poster={media.poster} muted loop playsInline preload="none" />
      ) : (
        <img src={media.poster} alt={`${name} screenshot`} loading="lazy" />
      )}
    </a>
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
              <div className="card__text">
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
              {p.media && <Preview media={p.media} name={p.name} href={p.live} />}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function Stack() {
  return (
    <section id="stack" className="section">
      <div className="section__head">
        <motion.p className="eyebrow" {...reveal}>03 — Skills</motion.p>
        <SplitTitle className="section__title" parts={[{ text: 'What I work', br: true }, { text: 'with.', em: true }]} />
      </div>
      <div className="skills glass">
        {stack.map((g, i) => (
          <motion.div className="skills__group" key={g.group} {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }}>
            <h3 className="mono">{g.group}</h3>
            <ul>
              {g.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </motion.div>
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
      <div className="contact__card glass">
        <motion.p className="eyebrow" {...reveal}>04 — Contact</motion.p>
        <SplitTitle className="contact__title" parts={[{ text: 'Have an agent that', br: true }, { text: 'needs to ship?', em: true }]} />
        <motion.p className="status status--static" {...reveal}>
          <i /> {availability}
        </motion.p>
        <motion.div className="contact__actions" {...reveal}>
          <Magnetic>
            <button type="button" className="pill pill--accent pill--big" onClick={onContact}>
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
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__row mono muted">
        <span>© {new Date().getFullYear()} Anirudh Gupta</span>
        <span>Neural net rendered live in WebGL</span>
      </div>
      <div className="footer__word" aria-hidden>
        anirudh
      </div>
    </footer>
  )
}

export default function App() {
  const [contact, setContact] = useState(false)
  const [askOpen, setAskOpen] = useState(false)
  const openContact = useCallback(() => setContact(true), [])
  const closeContact = useCallback(() => setContact(false), [])
  const openAsk = useCallback(() => setAskOpen(true), [])
  const closeAsk = useCallback(() => setAskOpen(false), [])

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
        <NeuralNet />
      </Suspense>
      <div className="vignette" aria-hidden />
      <div className="grain" aria-hidden />
      <Cursor />
      <Nav onContact={openContact} />
      <ContactPanel open={contact} onClose={closeContact} />
      <AskAI open={askOpen} onOpen={openAsk} onClose={closeAsk} />
      <main>
        <Hero onAsk={openAsk} onContact={openContact} />
        <Work />
        <Projects />
        <Stack />
        <Contact onContact={openContact} />
      </main>
      <Footer />
    </>
  )
}
