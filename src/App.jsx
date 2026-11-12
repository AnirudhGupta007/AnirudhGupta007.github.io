import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import Lenis from 'lenis'
import { availability, links, work, projects, facts, stack } from './data.js'
import { reveal, SplitTitle } from './components/Motion.jsx'
import ContactPanel from './components/ContactPanel.jsx'
import Year from './components/Year.jsx'

let lenis
function go(e, id) {
  e.preventDefault()
  const el = document.getElementById(id)
  if (lenis) lenis.scrollTo(el, { offset: -72 })
  else el.scrollIntoView({ behavior: 'smooth' })
}

function Nav({ onContact }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header className={`nav ${scrolled ? 'nav--solid' : ''}`}>
      <div className="wrap nav__row">
        <a href="#about" className="nav__brand" onClick={(e) => go(e, 'about')}>
          Anirudh Gupta<b>.</b>
        </a>
        <nav className="nav__links">
          <a href="#experience" onClick={(e) => go(e, 'experience')}>Experience</a>
          <a href="#projects" onClick={(e) => go(e, 'projects')}>Projects</a>
          <a href="#skills" onClick={(e) => go(e, 'skills')}>Skills</a>
          {links.resume && <a href={links.resume} target="_blank" rel="noreferrer">Résumé ↓</a>}
        </nav>
        <button type="button" className="btn btn--solid btn--sm" onClick={onContact}>Contact</button>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section id="about" className="hero">
      <div className="wrap">
      <motion.div className="hero__top" {...reveal}>
        <p className="eyebrow">AI Engineer at Tipstat · Bengaluru</p>
        <p className="status"><i /> {availability}</p>
      </motion.div>
      <SplitTitle
        as="h1"
        className="hero__title"
        parts={[{ text: 'I build AI agents', br: true }, { text: 'that' }, { text: 'do the work.', em: true }]}
      />
      <Year />
      <motion.p className="lead" {...reveal} transition={{ ...reveal.transition, delay: 0.25 }}>
        I'm Anirudh. I turn LLMs into software people rely on every day, not demos that live in a notebook. At
        Tipstat I build <strong>Ozyn</strong>, a multi-agent assistant that plans, remembers and takes action across
        238 business apps. In my own time I build things end to end and measure whether they actually work.
      </motion.p>
      <motion.div className="hero__cta" {...reveal} transition={{ ...reveal.transition, delay: 0.35 }}>
        <a href="#experience" className="btn btn--ivory" onClick={(e) => go(e, 'experience')}>
          See my work <span aria-hidden>→</span>
        </a>
        {links.resume && (
          <a href={links.resume} target="_blank" rel="noreferrer" className="btn btn--line">Download résumé</a>
        )}
      </motion.div>
      <motion.dl className="facts" {...reveal} transition={{ ...reveal.transition, delay: 0.45 }}>
        {facts.map((f) => (
          <div key={f.label}>
            <dt>{f.value}</dt>
            <dd>{f.label}</dd>
          </div>
        ))}
      </motion.dl>
      </div>
    </section>
  )
}

function Head({ label, parts, intro }) {
  return (
    <div className="head">
      <motion.p className="eyebrow" {...reveal}>{label}</motion.p>
      <SplitTitle className="head__title" parts={parts} />
      {intro && <motion.p className="head__intro" {...reveal}>{intro}</motion.p>}
    </div>
  )
}

// Demo clip that only plays while it is on screen.
function Demo({ media, name }) {
  const ref = useRef(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.35 })
    io.observe(v)
    return () => io.disconnect()
  }, [])
  if (!media.video) return <img className="study__demo" src={media.poster} alt={`${name} screenshot`} loading="lazy" />
  return <video className="study__demo" ref={ref} src={media.video} poster={media.poster} muted loop playsInline preload="none" aria-label={`${name} demo`} />
}

function Projects() {
  return (
    <section id="projects" className="section wrap">
      <Head
        label="Selected work"
        parts={[{ text: 'Things I built,', br: true }, { text: 'and how I know they work.', em: true }]}
        intro="Each project starts from a goal and ends with something measured."
      />
      {projects.map((p, i) => (
        <motion.article className="study" key={p.name} {...reveal}>
          <header className="study__head">
            <p className="study__kind">{String(i + 1).padStart(2, '0')} — {p.kind}</p>
            <h3 className="study__name">{p.name}</h3>
          </header>
          <div className="study__body">
            <div className="study__text">
              <h4>The goal</h4>
              <p className="study__goal">{p.goal}</p>
              <h4>How it works</h4>
              <p>{p.how}</p>
              <h4>The hard part</h4>
              <p>{p.hard}</p>
            </div>
            <div className="study__side">
              {p.media && <Demo media={p.media} name={p.name} />}
              <div className="result">
                <h4>Result</h4>
                <ul>{p.result.map((r) => <li key={r}>{r}</li>)}</ul>
              </div>
              <p className="study__stack">{p.stack.join(' · ')}</p>
              <div className="study__links">
                {p.live && <a href={p.live} target="_blank" rel="noreferrer" className="btn btn--solid btn--sm">Live demo ↗</a>}
                {p.code && <a href={p.code} target="_blank" rel="noreferrer" className="textlink">Code ↗</a>}
              </div>
            </div>
          </div>
        </motion.article>
      ))}
    </section>
  )
}

// Numbers in a bullet (43%, 89% to 100%, $3,450, 599, 1,000+, 2s) are shown as brass highlights.
// No lookbehind here: older iPhone Safari (iOS < 16.4) can't parse it and the whole page would fail.
const NUM = /(^|[^A-Za-z0-9.,\-])(~?\$?\d[\d,.]*(?:–\d[\d,.]*)?(?:%|\+|ms\b|s\b|M\b|K\b)?(?:\s(?:to|→)\s~?\$?\d[\d,.]*(?:%|\+)?)?)(?![A-Za-z0-9])/g
function Highlight({ text }) {
  const out = []
  let last = 0
  for (const m of text.matchAll(NUM)) {
    const start = m.index + m[1].length
    out.push(text.slice(last, start), <mark key={start}>{m[2]}</mark>)
    last = start + m[2].length
  }
  out.push(text.slice(last))
  return out
}

function Bullets({ items }) {
  return (
    <ul className="bullets">
      {items.map((p) => {
        const i = p.indexOf(': ')
        return i > 0 && i < 48 ? (
          <li key={p}><strong>{p.slice(0, i)}:</strong> <Highlight text={p.slice(i + 2)} /></li>
        ) : (
          <li key={p}><Highlight text={p} /></li>
        )
      })}
    </ul>
  )
}

function Experience() {
  const [main, ...interns] = work
  return (
    <section id="experience" className="section wrap">
      <Head label="Experience" parts={[{ text: 'Agents in production,', br: true }, { text: 'not in notebooks.', em: true }]} />

      <motion.article className="company" {...reveal}>
        <header className="company__head">
          <div>
            <h3 className="company__name">{main.company}</h3>
            <p className="company__role">{main.role}</p>
          </div>
          <p className="company__when">{main.period} · {main.place}</p>
        </header>
        <div className="products">
          {main.products.map((p) => (
            <div className={`product ${p.intro ? 'product--lead' : ''}`} key={p.name}>
              <div className="product__head">
                <h4>{p.name}</h4>
                <span className="product__tag">{p.tagline}</span>
              </div>
              {p.intro && <p className="product__intro">{p.intro}</p>}
              <Bullets items={p.points} />
              {p.url && (
                <a href={p.url} target="_blank" rel="noreferrer" className="textlink product__link">
                  {p.url.replace(/https?:\/\/|\/$/g, '')} ↗
                </a>
              )}
            </div>
          ))}
        </div>
      </motion.article>

      <div className="interns">
        {interns.map((job) => (
          <motion.article className="company company--small" key={job.company} {...reveal}>
            <header className="company__head">
              <div>
                <h3 className="company__name">{job.company}</h3>
                <p className="company__role">{job.role}</p>
              </div>
              <p className="company__when">{job.period} · {job.place}</p>
            </header>
            <Bullets items={job.points} />
          </motion.article>
        ))}
      </div>
    </section>
  )
}

function Skills() {
  return (
    <section id="skills" className="section wrap">
      <Head label="Skills" parts={[{ text: 'What I work' }, { text: 'with.', em: true }]} />
      <div className="skills">
        {stack.map((g, i) => (
          <motion.div key={g.group} {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }}>
            <h3>{g.group}</h3>
            <ul>{g.items.map((s) => <li key={s}>{s}</li>)}</ul>
          </motion.div>
        ))}
      </div>
      <motion.p className="edu" {...reveal}>
        B.Tech, Artificial Intelligence &amp; Data Science · GGSIPU, New Delhi · 2021–2025
      </motion.p>
    </section>
  )
}

function Contact({ onContact }) {
  return (
    <section id="contact" className="contact">
      <div className="wrap">
        <motion.p className="eyebrow" {...reveal}>Contact</motion.p>
        <SplitTitle className="contact__title" parts={[{ text: 'Hiring for an', br: true }, { text: 'AI Engineer?', em: true }]} />
        <motion.p className="contact__intro" {...reveal}>
          I'm open to AI Engineer roles, remote or on-site. Email is the fastest way to reach me.
        </motion.p>
        <motion.div className="contact__row" {...reveal}>
          <button type="button" className="btn btn--ivory" onClick={onContact}>Get in touch</button>
          {links.resume && <a href={links.resume} target="_blank" rel="noreferrer" className="btn btn--line">Download résumé</a>}
        </motion.div>
        <motion.dl className="contact__list" {...reveal}>
          <div><dt>Email</dt><dd><a href={`mailto:${links.email}`}>{links.email}</a></dd></div>
          <div><dt>Phone</dt><dd><a href={links.phoneHref}>{links.phone}</a></dd></div>
          <div><dt>LinkedIn</dt><dd><a href={links.linkedin} target="_blank" rel="noreferrer">anirudhgupta00</a></dd></div>
          <div><dt>GitHub</dt><dd><a href={links.github} target="_blank" rel="noreferrer">AnirudhGupta007</a></dd></div>
        </motion.dl>
        <footer className="footer">
          <span>© {new Date().getFullYear()} Anirudh Gupta</span>
          <span>Bengaluru, India</span>
        </footer>
      </div>
    </section>
  )
}

export default function App() {
  const [contact, setContact] = useState(false)
  const openContact = useCallback(() => setContact(true), [])
  const closeContact = useCallback(() => setContact(false), [])

  // Smooth scrolling, off for people who prefer reduced motion.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    lenis = new Lenis({ autoRaf: true, lerp: 0.1 })
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
      <Nav onContact={openContact} />
      <ContactPanel open={contact} onClose={closeContact} />
      <main>
        <Hero />
        <Experience />
        <Projects />
        <Skills />
        <Contact onContact={openContact} />
      </main>
    </>
  )
}
