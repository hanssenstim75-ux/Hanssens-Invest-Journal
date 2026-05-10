import { useMemo } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts'
import { useTrades } from '../context/TradeContext'

function fmt(n: number) {
  return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(n)
}

const COLORS = { profit: '#4ade80', loss: '#f87171', neutral: '#444' }

export default function Analytics() {
  const { trades } = useTrades()
  const closed = useMemo(() => trades.filter(t => t.status === 'CLOSED'), [trades])

  // Cumulative P&L over time
  const cumulativePnl = useMemo(() => {
    const sorted = [...closed].sort((a, b) => a.date.localeCompare(b.date))
    let running = 0
    return sorted.map(t => {
      running += t.pnl ?? 0
      return { date: t.date, pnl: parseFloat(running.toFixed(2)), trade: t.symbol }
    })
  }, [closed])

  // P&L per trade (bar)
  const perTrade = useMemo(() =>
    [...closed]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(t => ({ name: t.symbol, pnl: t.pnl ?? 0 })),
    [closed]
  )

  // Market distribution
  const marketDist = useMemo(() => {
    const map: Record<string, number> = {}
    closed.forEach(t => { map[t.market] = (map[t.market] ?? 0) + 1 })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [closed])

  // Win/loss by strategy
  const byStrategy = useMemo(() => {
    const map: Record<string, { wins: number; losses: number; pnl: number }> = {}
    closed.forEach(t => {
      const key = t.strategy || 'Onbekend'
      if (!map[key]) map[key] = { wins: 0, losses: 0, pnl: 0 }
      if ((t.pnl ?? 0) >= 0) map[key].wins++
      else map[key].losses++
      map[key].pnl += t.pnl ?? 0
    })
    return Object.entries(map).map(([name, v]) => ({ name, ...v, pnl: parseFloat(v.pnl.toFixed(2)) }))
  }, [closed])

  // Key stats
  const stats = useMemo(() => {
    const wins = closed.filter(t => (t.pnl ?? 0) > 0)
    const losses = closed.filter(t => (t.pnl ?? 0) < 0)
    const bestTrade = closed.reduce((best, t) => (!best || (t.pnl ?? 0) > (best.pnl ?? 0)) ? t : best, closed[0])
    const worstTrade = closed.reduce((worst, t) => (!worst || (t.pnl ?? 0) < (worst.pnl ?? 0)) ? t : worst, closed[0])
    const avgWin = wins.length ? wins.reduce((s, t) => s + (t.pnl ?? 0), 0) / wins.length : 0
    const avgLoss = losses.length ? Math.abs(losses.reduce((s, t) => s + (t.pnl ?? 0), 0)) / losses.length : 0
    return { wins: wins.length, losses: losses.length, bestTrade, worstTrade, avgWin, avgLoss }
  }, [closed])

  const tooltipStyle = {
    backgroundColor: '#1c1c1c',
    border: '1px solid #272727',
    borderRadius: 0,
    color: '#fff',
    fontSize: 11,
  }

  if (closed.length === 0) {
    return (
      <div className="p-8">
        <p className="label-caps text-muted mb-1">Statistieken</p>
        <h1 className="brand-title text-4xl text-white mb-8">Analyse</h1>
        <p className="text-muted">Nog geen gesloten trades om te analyseren.</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <p className="label-caps text-muted mb-1">Statistieken</p>
        <h1 className="brand-title text-4xl text-white">Analyse</h1>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-4">
        <div className="bg-card border border-border p-5">
          <p className="label-caps mb-2">Beste Trade</p>
          <p className="text-profit text-xl font-light">{fmt(stats.bestTrade?.pnl ?? 0)}</p>
          <p className="label-caps text-faint mt-1">{stats.bestTrade?.symbol}</p>
        </div>
        <div className="bg-card border border-border p-5">
          <p className="label-caps mb-2">Slechtste Trade</p>
          <p className="text-loss text-xl font-light">{fmt(stats.worstTrade?.pnl ?? 0)}</p>
          <p className="label-caps text-faint mt-1">{stats.worstTrade?.symbol}</p>
        </div>
        <div className="bg-card border border-border p-5">
          <p className="label-caps mb-2">Gem. Winst</p>
          <p className="text-profit text-xl font-light">{fmt(stats.avgWin)}</p>
          <p className="label-caps text-faint mt-1">{stats.wins} winstgevende trades</p>
        </div>
        <div className="bg-card border border-border p-5">
          <p className="label-caps mb-2">Gem. Verlies</p>
          <p className="text-loss text-xl font-light">-{fmt(stats.avgLoss)}</p>
          <p className="label-caps text-faint mt-1">{stats.losses} verliezende trades</p>
        </div>
      </div>

      {/* Cumulative P&L chart */}
      <div className="bg-card border border-border p-5 mb-4">
        <p className="label-caps mb-4">Cumulatieve P&L</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={cumulativePnl} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4ade80" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}`} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: number) => [fmt(v), 'P&L']}
            />
            <Area
              type="monotone"
              dataKey="pnl"
              stroke="#4ade80"
              strokeWidth={1.5}
              fill="url(#pnlGrad)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Per-trade bar */}
        <div className="bg-card border border-border p-5">
          <p className="label-caps mb-4">P&L per Trade</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={perTrade} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <XAxis dataKey="name" tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [fmt(v), 'P&L']} />
              <Bar dataKey="pnl" radius={0}>
                {perTrade.map((entry, i) => (
                  <Cell key={i} fill={entry.pnl >= 0 ? COLORS.profit : COLORS.loss} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Market pie */}
        <div className="bg-card border border-border p-5">
          <p className="label-caps mb-4">Trades per Markt</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={marketDist}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                dataKey="value"
                stroke="none"
              >
                {marketDist.map((_e, i) => (
                  <Cell
                    key={i}
                    fill={['#4ade80', '#60a5fa', '#f87171', '#facc15', '#a78bfa', '#fb923c'][i % 6]}
                  />
                ))}
              </Pie>
              <Legend
                iconType="square"
                iconSize={8}
                formatter={v => <span style={{ color: '#888', fontSize: 10 }}>{v}</span>}
              />
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strategy table */}
      <div className="bg-card border border-border">
        <div className="px-5 py-4 border-b border-border">
          <p className="label-caps">Resultaten per Strategie</p>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              {['Strategie', 'Wins', 'Losses', 'Win Rate', 'Totaal P&L'].map(h => (
                <th key={h} className="label-caps px-5 py-3 text-left font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {byStrategy.map(s => {
              const total = s.wins + s.losses
              const wr = total > 0 ? (s.wins / total) * 100 : 0
              return (
                <tr key={s.name} className="border-b border-border last:border-0 hover:bg-bg transition-colors">
                  <td className="px-5 py-3 text-white">{s.name}</td>
                  <td className="px-5 py-3 text-profit">{s.wins}</td>
                  <td className="px-5 py-3 text-loss">{s.losses}</td>
                  <td className="px-5 py-3 text-muted">{wr.toFixed(0)}%</td>
                  <td className={`px-5 py-3 font-medium ${s.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {fmt(s.pnl)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
