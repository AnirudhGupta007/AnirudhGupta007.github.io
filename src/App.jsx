import { lazy, Suspense, useEffect, useState } from 'react'
import { motion } from 'motion/react'
import Lenis from 'lenis'
import { links, stats, work, projects, stack } from './data.js'

const Orb = lazy(() => import('./components/Orb.jsx'))

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-12% 0px' },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
}

let lenis
function scrollTo(e, id) {
  e.preventDefault()
  const el = document.getElementById(id)
  if (lenis) lenis.scrollTo(el, { offset: -40 })
  else el.scrollIntoView({ behavior: 'smooth' })
}

function Nav() {
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
        <span className="nav__dot" /> anirudh
      </a>
      <nav className="nav__links">
        <a href="#work" onClick={(e) => scrollTo(e, 'work')}>Work</a>
        <a href="#projects" onClick={(e) => scrollTo(e, 'projects')}>Projects</a>
        <a href="#stack" onClick={(e) => scrollTo(e, 'stack')}>Stack</a>
      </nav>
      <a href="#contact" className="pill pill--light" onClick={(e) => scrollTo(e, 'contact')}>
        Say hi
      </a>
    </header>
  )
}

function Hero() {
  return (
    <section id="top" className="hero">
      <motion.p className="eyebrow" {...reveal}>
        AI Product Engineer · Bengaluru
      </motion.p>
      <motion.h1 className="hero__title" {...reveal} transition={{ ...reveal.transition, delay: 0.1 }}>
        I build agents
        <br />
        that <em>do the work.</em>
      </motion.h1>
      <motion.p className="hero__sub" {...reveal} transition={{ ...reveal.transition, delay: 0.2 }}>
        Multi-agent systems, long-term memory, agentic RAG and tool execution, shipped as products
        people actually use. Currently building Ozyn at Tipstat.
      </motion.p>
      <motion.div className="hero__cta" {...reveal} transition={{ ...reveal.transition, delay: 0.3 }}>
        <a href="#work" className="pill pill--light" onClick={(e) => scrollTo(e, 'work')}>
          See the work <span aria-hidden>→</span>
        </a>
        <a href={links.github} className="link" target="_blank" rel="noreferrer">
          GitHub ↗
        </a>
      </motion.div>
      <div className="hero__scroll" aria-hidden>
        <span />
        scroll
      </div>
    </section>
  )
}

function Stats() {
  return (
    <section className="stats">
      {stats.map((s, i) => (
        <motion.div className="stat" key={s.label} {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }}>
          <span className="stat__value">{s.value}</span>
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
      <motion.div className="section__head" {...reveal}>
        <p className="eyebrow">01 — Experience</p>
        <h2 className="section__title">
          Agents in production, <em>not in notebooks.</em>
        </h2>
      </motion.div>

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
      <motion.div className="section__head" {...reveal}>
        <p className="eyebrow">02 — Projects</p>
        <h2 className="section__title">
          Things I built <em>on my own time.</em>
        </h2>
      </motion.div>

      <div className="projects">
        {projects.map((p, i) => (
          <motion.article className="project" key={p.name} {...reveal}>
            <span className="project__index mono">0{i + 1}</span>
            <div className="project__main">
              <div className="project__title">
                <h3>{p.name}</h3>
                <span className="muted">{p.kind}</span>
              </div>
              <p className="project__blurb">{p.blurb}</p>
              <p className="project__stack mono">{p.stack.join('  ·  ')}</p>
            </div>
            <div className="project__links">
              {p.live && (
                <a href={p.live} target="_blank" rel="noreferrer" className="pill pill--ghost">
                  Live <span aria-hidden>↗</span>
                </a>
              )}
              {p.code && (
                <a href={p.code} target="_blank" rel="noreferrer" className="link">
                  Code ↗
                </a>
              )}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}

function Stack() {
  return (
    <section id="stack" className="section">
      <motion.div className="section__head" {...reveal}>
        <p className="eyebrow">03 — Stack</p>
        <h2 className="section__title">
          Tools I reach for <em>daily.</em>
        </h2>
      </motion.div>
      <div className="stack">
        {stack.map((g, i) => (
          <motion.div className="stack__group" key={g.group} {...reveal} transition={{ ...reveal.transition, delay: i * 0.06 }}>
            <h3 className="mono">{g.group}</h3>
            <p>{g.items.join(', ')}</p>
          </motion.div>
        ))}
      </div>
      <motion.p className="edu muted" {...reveal}>
        B.Tech, Artificial Intelligence &amp; Data Science · GGSIPU, New Delhi · 2021–2025
      </motion.p>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="contact">
      <motion.p className="eyebrow" {...reveal}>
        04 — Contact
      </motion.p>
      <motion.h2 className="contact__title" {...reveal}>
        Have an agent that <br />
        <em>needs to ship?</em>
      </motion.h2>
      <motion.a href={`mailto:${links.email}`} className="contact__mail" {...reveal}>
        {links.email} <span aria-hidden>↗</span>
      </motion.a>
      <motion.div className="contact__links" {...reveal}>
        <a href={links.linkedin} target="_blank" rel="noreferrer" className="link">LinkedIn ↗</a>
        <a href={links.github} target="_blank" rel="noreferrer" className="link">GitHub ↗</a>
      </motion.div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__row mono muted">
        <span>© {new Date().getFullYear()} Anirudh Gupta</span>
        <span>Built with React Three Fiber</span>
      </div>
      <div className="footer__word" aria-hidden>
        anirudh
      </div>
    </footer>
  )
}

export default function App() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    lenis = new Lenis({ autoRaf: true, lerp: 0.09 })
    return () => {
      lenis.destroy()
      lenis = undefined
    }
  }, [])

  return (
    <>
      <Suspense fallback={null}>
        <Orb />
      </Suspense>
      <div className="vignette" aria-hidden />
      <Nav />
      <main>
        <Hero />
        <Stats />
        <Work />
        <Projects />
        <Stack />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
