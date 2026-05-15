import { useMemo } from 'react'
import { ScorePill } from './ScorePill'
import { useDashboard } from '../../context/useDashboard'
import { useAuth } from '../../context/AuthContext'

// Maps a tone string to the matching bar gradient style.
const barStyles = {
  emerald: 'linear-gradient(90deg, var(--accent-emerald), #42d0ab)',
  blue:    'linear-gradient(90deg, var(--accent-blue), #7eaaff)',
  amber:   'linear-gradient(90deg, var(--accent-amber), #f0c579)',
  good:    'linear-gradient(90deg, var(--accent-emerald), #42d0ab)',
  neutral: 'linear-gradient(90deg, var(--accent-blue), #7eaaff)',
  alert:   'linear-gradient(90deg, var(--accent-amber), #f0c579)',
}

// Maps a tone string to the ring progress stroke color class via inline style.
const ringStroke = {
  emerald: 'var(--accent-emerald)',
  amber:   'var(--accent-amber)',
  blue:    'var(--accent-blue)',
  good:    'var(--accent-emerald)',
  neutral: 'var(--accent-blue)',
  alert:   'var(--accent-amber)',
}

export function HeroPanel() {
  // ── Pull everything from context – no props needed ────────────────────
  const { dashboardData, employees } = useDashboard()
  const { user } = useAuth()

  const { site, summary } = dashboardData

  // User's org name takes precedence over the static site name
  const orgName = user?.organization?.name || site?.name
  const resolvedSite = { ...site, name: orgName }

  const scoreDistribution = useMemo(() => {
    const fallbackZeroBars = [
      { label: 'Joyful facial expression', value: 0, tone: 'neutral' },
      { label: 'Polite verbal tone', value: 0, tone: 'neutral' },
      { label: 'Greeting on entry and exit', value: 0, tone: 'neutral' },
    ];

    // Primary source: dashboardData.scoreDistribution
    // Updated by both /api/analytics responses AND socket insight:refresh events
    // (including dev mock controls), so bars react to all data changes.
    if (dashboardData.scoreDistribution?.length > 0 &&
        dashboardData.scoreDistribution.some(d => d.value > 0)) {
      return dashboardData.scoreDistribution;
    }

    // Fallback: compute from local employees array when server hasn't
    // provided scoreDistribution yet (e.g. during initial load)
    if (!employees || employees.length === 0) {
      return fallbackZeroBars;
    }

    let totalFacial = 0;
    let totalVerbal = 0;
    let totalGreeting = 0;
    let validMetricsCount = 0;

    employees.forEach(emp => {
      if (emp.metrics) {
        totalFacial += emp.metrics.facialExpression || 0;
        totalVerbal += emp.metrics.verbalExpression || 0;
        totalGreeting += emp.metrics.greetingBehavior || 0;
        validMetricsCount++;
      }
    });

    if (validMetricsCount === 0) {
      return fallbackZeroBars;
    }

    return [
      { 
        label: 'Joyful facial expression', 
        value: Math.round(totalFacial / validMetricsCount), 
        tone: 'emerald' 
      },
      { 
        label: 'Polite verbal tone', 
        value: Math.round(totalVerbal / validMetricsCount), 
        tone: 'amber' 
      },
      { 
        label: 'Greeting on entry and exit', 
        value: Math.round(totalGreeting / validMetricsCount), 
        tone: 'blue' 
      },
    ];
  }, [employees, dashboardData.scoreDistribution]);

  return (
    <section className="reveal-on-scroll is-visible rounded-[28px] border border-[color:var(--line)] bg-[color:var(--bg-elevated)] backdrop-blur-xl [box-shadow:var(--shadow-md)] overflow-hidden p-5 sm:p-6 lg:p-7 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_auto] xl:grid-cols-[minmax(0,1.15fr)_auto_minmax(18rem,0.8fr)]">
      {/* ── Left: site info ──────────────────────────────────────────── */}
      <div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--bg-chip)] py-1.5 px-3 text-[0.72rem] font-black uppercase tracking-[0.16em] text-[color:var(--muted)]">
          <span className="w-2.5 h-2.5 rounded-full bg-[color:var(--accent-emerald)] shrink-0" />
          {resolvedSite.label}
        </div>

        <h2 className="mt-4 text-[clamp(2.1rem,4vw,3.6rem)] font-bold leading-[0.95] tracking-[-0.05em] text-[color:var(--text)]">{resolvedSite.name}</h2>

        <p className="mt-4 max-w-[42rem] text-base leading-[1.75] text-[color:var(--muted)]">{summary?.insight}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <span className="rounded-full border border-[color:var(--line)] bg-[color:var(--bg-panel)] py-2 px-4 text-sm font-semibold text-[color:var(--text)]">{resolvedSite.updatedAt}</span>
          <span className="rounded-full border border-[color:var(--line)] bg-[color:var(--bg-panel)] py-2 px-4 text-sm font-semibold text-[color:var(--text)]">{resolvedSite.coverage}</span>
        </div>
      </div>

      {/* ── Centre: overall score ring ───────────────────────────────── */}
      <div className="flex flex-col items-start gap-4 lg:items-center lg:justify-center">
        <div 
          className="relative grid h-40 w-40 place-items-center rounded-full bg-[color:var(--hero-ring-core)] [box-shadow:0_18px_40px_var(--hero-ring-core-shadow)] transition-[background-color,box-shadow] duration-[320ms] ease-linear"
          style={{ '--score-value': summary?.score || 0 }}
        >
          <svg 
            className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" 
            viewBox="0 0 100 100" 
            style={{ overflow: 'visible' }}
          >
            <defs>
              <filter id="ring-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
                <feComponentTransfer in="blur" result="glow">
                  <feFuncA type="linear" slope="0.75" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Continuous background track */}
            <circle 
              cx="50" cy="50" r="46.25" pathLength="100"
              className="fill-none [stroke:var(--hero-ring-rest)] [stroke-width:7.5] transition-[stroke] duration-[320ms] ease-linear"
            />
            
            {(() => {
              // Calculate segment lengths (each metric contributes equally to the total)
              const L0 = (scoreDistribution[0]?.value || 0) / 3;
              const L1 = (scoreDistribution[1]?.value || 0) / 3;
              const L2 = (scoreDistribution[2]?.value || 0) / 3;

              // Stack them so they share the same starting point.
              const layers = [
                { id: 2, tone: scoreDistribution[2]?.tone || 'blue', val: L0 + L1 + L2 },
                { id: 1, tone: scoreDistribution[1]?.tone || 'amber', val: L0 + L1 },
                { id: 0, tone: scoreDistribution[0]?.tone || 'emerald', val: L0 },
              ];

              return (
                <g filter="url(#ring-glow)">
                  {layers.map((layer) => (
                    <circle 
                      key={layer.id}
                      cx="50" cy="50" r="46.25" pathLength="100"
                      className="fill-none [stroke-width:7.5] [stroke-linecap:round] animate-[hero-ring-grow_1.2s_cubic-bezier(0.22,1,0.36,1)_backwards] transition-[stroke-dashoffset] duration-1000 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
                      style={{ 
                        stroke: ringStroke[layer.tone] || 'var(--accent-blue)',
                        strokeDasharray: '100 100',
                        strokeDashoffset: 100 - layer.val
                      }}
                    />
                  ))}
                </g>
              );
            })()}
          </svg>
          <div className="text-center relative z-[1]">
            {/* Score value transitions smoothly via CSS color transition
                when a socket insight:refresh event updates summary.score */}
            <strong className="block text-5xl font-bold tracking-[-0.05em] text-[color:var(--text)] leading-none transition-colors duration-[320ms] ease-linear">{summary?.score}</strong>
            <span className="text-sm font-semibold text-[color:var(--muted)]">Overall score</span>
          </div>
        </div>
        <ScorePill value={summary?.trend} label="vs last week" tone="good" />
      </div>

      {/* ── Right: score distribution bars ──────────────────────────── */}
      <div className="grid gap-4">
        {scoreDistribution.map((item, index) => (
          <div
            key={item.label}
            className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--bg-panel)] p-4 transition-[border-color,background-color] duration-[320ms] ease-linear animate-[dist-item-appear_600ms_cubic-bezier(0.22,1,0.36,1)_both]"
            style={{ animationDelay: `${index * 110}ms` }}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-[color:var(--muted)]">{item.label}</span>
              {/* Numeric % label – color transitions via CSS when value
                  updates so the jump from e.g. 70 → 85 feels animated  */}
              <strong className="text-lg font-bold text-[color:var(--text)] transition-colors duration-[400ms] ease-linear">{item.value}%</strong>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-[color:var(--metric-track)]">
              {/*
                --bar-value drives width via CSS var().
                Because `transition: width 600ms` is on the bar,
                any WebSocket-driven value change causes the fill to slide
                smoothly – no JS animation library needed.

                The animation-delay staggers the initial mount grow effect.
              */}
              <div
                className="h-full rounded-full origin-left transition-[width] duration-[600ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] animate-[hero-bar-grow_900ms_cubic-bezier(0.22,1,0.36,1)_both]"
                style={{
                  width: `${item.value}%`,
                  background: barStyles[item.tone] || barStyles.blue,
                  animationDelay: `${index * 140 + 120}ms`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
