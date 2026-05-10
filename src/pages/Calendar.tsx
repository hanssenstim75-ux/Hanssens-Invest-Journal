import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTrades } from '../context/TradeContext'
import { Trade } from '../types/trade'

function fmt(n: number) {
  return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(n)
}

const MONTHS_NL = [
  'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
  'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December',
]
const DAYS_NL = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']

export default function Calendar() {
  const { trades } = useTrades()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selected, setSelected] = useState<string | null>(null)

  const prev = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const next = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  // Map date string → trades
  const byDate = useMemo(() => {
    const map: Record<string, Trade[]> = {}
    trades.forEach(t => {
      if (!map[t.date]) map[t.date] = []
      map[t.date].push(t)
    })
    return map
  }, [trades])

  // Build calendar grid (Mon-first)
  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    // Monday = 0 offset
    let startOffset = firstDay.getDay() - 1
    if (startOffset < 0) startOffset = 6
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells: (number | null)[] = [
      ...Array(startOffset).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ]
    // Pad to full weeks
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [year, month])

  const dateKey = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const dayPnl = (day: number) => {
    const ts = byDate[dateKey(day)]
    if (!ts) return null
    const closed = ts.filter(t => t.pnl != null)
    if (closed.length === 0) return null
    return closed.reduce((s, t) => s + (t.pnl ?? 0), 0)
  }

  const selectedTrades = selected ? (byDate[selected] ?? []) : []

  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <p className="label-caps text-muted mb-1">Overzicht</p>
        <h1 className="brand-title text-4xl text-white">Kalender</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-card border border-border p-5">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-5">
            <button onClick={prev} className="p-1.5 border border-border text-muted hover:text-white hover:border-border-light transition-colors">
              <ChevronLeft size={14} />
            </button>
            <p className="brand-title text-xl text-white tracking-widest">
              {MONTHS_NL[month]} {year}
            </p>
            <button onClick={next} className="p-1.5 border border-border text-muted hover:text-white hover:border-border-light transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS_NL.map(d => (
              <div key={d} className="label-caps text-center py-1">{d}</div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              if (!day) return <div key={i} />
              const key = dateKey(day)
              const pnl = dayPnl(day)
              const trades = byDate[key] ?? []
              const isToday = key === todayKey
              const isSelected = key === selected
              const hasOpen = trades.some(t => t.status === 'OPEN')

              return (
                <button
                  key={i}
                  onClick={() => setSelected(isSelected ? null : key)}
                  className={`relative aspect-square flex flex-col items-center justify-center border transition-colors text-xs
                    ${isSelected ? 'border-white bg-bg' : 'border-border hover:border-border-light'}
                    ${isToday && !isSelected ? 'border-muted' : ''}
                  `}
                >
                  <span className={`font-medium ${isToday ? 'text-white' : 'text-muted'}`}>
                    {day}
                  </span>
                  {pnl != null && (
                    <span className={`text-[0.55rem] font-semibold mt-0.5 ${pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                      {pnl >= 0 ? '+' : ''}{Math.round(pnl)}
                    </span>
                  )}
                  {hasOpen && pnl == null && (
                    <span className="w-1 h-1 rounded-full bg-accent mt-1" />
                  )}
                  {trades.length > 0 && (
                    <span className="absolute top-1 right-1 w-1 h-1 rounded-full bg-border-light" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-1.5">
              <span className="text-profit text-xs">+100</span>
              <p className="label-caps text-[0.6rem]">winstgevende dag</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-loss text-xs">-100</span>
              <p className="label-caps text-[0.6rem]">verliesdag</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
              <p className="label-caps text-[0.6rem]">open positie</p>
            </div>
          </div>
        </div>

        {/* Day detail panel */}
        <div className="bg-card border border-border p-5">
          {selected ? (
            <>
              <p className="label-caps mb-1">Geselecteerde dag</p>
              <p className="brand-title text-xl text-white mb-4">{selected}</p>

              {selectedTrades.length === 0 ? (
                <p className="text-muted text-xs">Geen trades op deze dag.</p>
              ) : (
                <div className="space-y-3">
                  {selectedTrades.map(t => (
                    <div key={t.id} className="border border-border p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-white">{t.symbol}</p>
                        <span className={`text-[0.6rem] font-semibold tracking-widest px-1.5 py-0.5 border ${
                          t.direction === 'LONG' ? 'border-profit/30 text-profit' : 'border-loss/30 text-loss'
                        }`}>
                          {t.direction}
                        </span>
                      </div>
                      <p className="label-caps text-[0.6rem] mb-2">{t.market} · {t.strategy || '—'}</p>
                      <div className="flex justify-between">
                        <div>
                          <p className="label-caps text-[0.55rem]">Entry</p>
                          <p className="text-xs text-white">{t.entryPrice.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="label-caps text-[0.55rem]">Exit</p>
                          <p className="text-xs text-muted">{t.exitPrice?.toLocaleString() ?? '—'}</p>
                        </div>
                        <div className="text-right">
                          <p className="label-caps text-[0.55rem]">P&L</p>
                          {t.status === 'OPEN' ? (
                            <p className="text-xs text-accent">OPEN</p>
                          ) : (
                            <p className={`text-xs font-medium ${(t.pnl ?? 0) >= 0 ? 'text-profit' : 'text-loss'}`}>
                              {t.pnl != null ? fmt(t.pnl) : '—'}
                            </p>
                          )}
                        </div>
                      </div>
                      {t.notes && (
                        <p className="text-muted text-[0.65rem] mt-2 border-t border-border pt-2 leading-relaxed">
                          {t.notes}
                        </p>
                      )}
                    </div>
                  ))}

                  {/* Day total */}
                  {selectedTrades.some(t => t.pnl != null) && (
                    <div className="border-t border-border pt-3 flex justify-between items-center">
                      <p className="label-caps">Dag Totaal</p>
                      {(() => {
                        const total = selectedTrades.reduce((s, t) => s + (t.pnl ?? 0), 0)
                        return (
                          <p className={`text-sm font-medium ${total >= 0 ? 'text-profit' : 'text-loss'}`}>
                            {fmt(total)}
                          </p>
                        )
                      })()}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-32 text-center">
              <p className="label-caps text-faint">Klik op een dag</p>
              <p className="label-caps text-faint text-[0.6rem] mt-1">om trades te bekijken</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
