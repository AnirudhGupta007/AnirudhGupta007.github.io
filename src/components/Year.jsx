import { useState } from 'react'
import { weeks, total } from '../contributions.js'

// A year of real commits. Squares drop in on a diagonal wave, then a brass light keeps sweeping across the
// year. Hovering a square shows its day and how busy it was.
const LAST_WEEK = new Date(2026, 10, 8) // Sunday that starts the final column
const LEVEL = ['No commits', 'Quiet', 'Steady', 'Busy', 'Very busy']
const fmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

function dayLabel(w, d) {
  const date = new Date(LAST_WEEK)
  date.setDate(date.getDate() - (weeks.length - 1 - w) * 7 + d)
  return fmt.format(date)
}

export default function Year() {
  const [tip, setTip] = useState(null)
  return (
    <figure className="year" onPointerLeave={() => setTip(null)}>
      <div className="year__grid" role="img" aria-label={`${total.toLocaleString('en-US')} GitHub contributions in the last year`}>
        {weeks.map((w, i) => (
          <div className="year__week" key={i} style={{ '--w': i }}>
            {[...w].map((d, j) =>
              d === 'x' ? (
                <i key={j} className="is-future" style={{ '--d': j }} />
              ) : (
                <i
                  key={j}
                  className={`l${d}`}
                  style={{ '--d': j }}
                  onPointerEnter={(e) => {
                    const r = e.currentTarget.getBoundingClientRect()
                    const g = e.currentTarget.closest('.year').getBoundingClientRect()
                    setTip({ x: r.left - g.left + r.width / 2, y: r.top - g.top, text: `${dayLabel(i, j)} · ${LEVEL[d]}` })
                  }}
                />
              ),
            )}
          </div>
        ))}
      </div>
      {tip && (
        <span className="year__tip" style={{ left: tip.x, top: tip.y }}>
          {tip.text}
        </span>
      )}
      <figcaption>
        <strong>{total.toLocaleString('en-US')}</strong> contributions in the last year. <span className="year__hint">Hover a day.</span>
      </figcaption>
    </figure>
  )
}
