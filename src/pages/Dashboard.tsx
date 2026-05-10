import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, TrendingDown, Activity, Target, PlusCircle, ArrowRight } from 'lucide-react'
import { useTrades } from '../context/TradeContext'
import { Trade } from '../types/trade'

function fmt(n: number) {
  return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(n)
}

function pct(n: number) {
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`
}

function StatCard({
  label,
  value,
  sub,
  positive,
}: {
  label: string
  value: string
  sub?: string
  positive?: boolean
}) {
  return (
    <div className="bg-card border border-border p-5">
      <p className="label-caps mb-3">{label}</p>
      <p
        className={`text-2xl font-light tracking-tight ${
          positive === undefined ? 'text-white' : positive ? 'text-profit' : 'text-loss'
        }`}
      >
        {value}
      </p>
      {sub && <p className="label-caps text-faint mt-1">{sub}</p>}
    </div>
  )
}

function TradeRow({ trade }: { trade: Trade }) {
  const isProfit = (trade.pnl ?? 0) >= 0
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <span
          className={`text-[0.6rem] font-semibold tracking-widest px-1.5 py-0.5 border ${
            trade.direction === 'LONG'
              ? 'border-profit/30 text-profit'
              : 'border-loss/30 text-loss'
          }`}
        >
          {trade.direction}
        </span>
        <div>
          <p className="text-sm font-medium text-white">{trade.symbol}</p>
          <p className="label-caps text-[0.6rem]">{trade.date} · {trade.market}</p>
        </div>
      </div>
      <div className="text-right">
        {trade.status === 'OPEN' ? (
          <span className="label-caps text-accent">OPEN</span>
        ) : (
          <>
            <p className={`text-sm font-medium ${isProfit ? 'text-profit' : 'text-loss'}`}>
              {trade.pnl != null ? fmt(trade.pnl) : '—'}
            </p>
            <p className={`label-caps text-[0.6rem] ${isProfit ? 'text-profit' : 'text-loss'}`}>
              {trade.pnlPercent != null ? pct(trade.pnlPercent) : ''}
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { trades } = useTrades()

  const stats = useMemo(() => {
    const closed = trades.filter(t => t.status === 'CLOSED')
    const totalPnl = closed.reduce((sum, t) => sum + (t.pnl ?? 0), 0)
    const wins = closed.filter(t => (t.pnl ?? 0) > 0)
    const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0
    const open = trades.filter(t => t.status === 'OPEN').length
    const avgWin =
      wins.length > 0 ? wins.reduce((s, t) => s + (t.pnl ?? 0), 0) / wins.length : 0
    const losses = closed.filter(t => (t.pnl ?? 0) < 0)
    const avgLoss =
      losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + (t.pnl ?? 0), 0) / losses.length) : 0
    const rr = avgLoss > 0 ? avgWin / avgLoss : 0
    return { totalPnl, winRate, open, closed: closed.length, rr }
  }, [trades])

  const recent = trades.slice(0, 5)

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="label-caps text-muted mb-1">Overzicht</p>
          <h1 className="brand-title text-4xl text-white">Dashboard</h1>
        </div>
        <Link
          to="/add"
          className="flex items-center gap-2 bg-white text-bg text-xs font-semibold tracking-widest uppercase px-4 py-2.5 hover:bg-gray-200 transition-colors"
        >
          <PlusCircle size={13} />
          Nieuwe Trade
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-4">
        <StatCard
          label="Totaal P&L"
          value={fmt(stats.totalPnl)}
          sub={`${stats.closed} gesloten trades`}
          positive={stats.totalPnl >= 0}
        />
        <StatCard
          label="Win Rate"
          value={`${stats.winRate.toFixed(0)}%`}
          sub={`van ${stats.closed} trades`}
          positive={stats.winRate >= 50}
        />
        <StatCard
          label="Open Posities"
          value={stats.open.toString()}
          sub="actieve trades"
        />
        <StatCard
          label="Risk/Reward"
          value={`${stats.rr.toFixed(2)}x`}
          sub="gemiddeld"
          positive={stats.rr >= 1}
        />
      </div>

      {/* Direction split */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {(['LONG', 'SHORT'] as const).map(dir => {
          const dirTrades = trades.filter(t => t.direction === dir && t.status === 'CLOSED')
          const dirPnl = dirTrades.reduce((s, t) => s + (t.pnl ?? 0), 0)
          const dirWins = dirTrades.filter(t => (t.pnl ?? 0) > 0).length
          return (
            <div key={dir} className="bg-card border border-border p-5 flex items-center gap-4">
              <div className={`p-2 border ${dir === 'LONG' ? 'border-profit/30' : 'border-loss/30'}`}>
                {dir === 'LONG' ? (
                  <TrendingUp size={16} className="text-profit" strokeWidth={1.5} />
                ) : (
                  <TrendingDown size={16} className="text-loss" strokeWidth={1.5} />
                )}
              </div>
              <div className="flex-1">
                <p className="label-caps mb-0.5">{dir} Trades</p>
                <p className={`text-lg font-light ${dirPnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {fmt(dirPnl)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white">{dirTrades.length} trades</p>
                <p className="label-caps text-[0.6rem]">{dirWins} wins</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent trades */}
      <div className="bg-card border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity size={13} className="text-muted" strokeWidth={1.5} />
            <p className="label-caps">Recente Trades</p>
          </div>
          <Link
            to="/trades"
            className="flex items-center gap-1 label-caps text-faint hover:text-white transition-colors"
          >
            Alles bekijken <ArrowRight size={10} />
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-muted text-sm py-4 text-center">Nog geen trades. Voeg je eerste toe.</p>
        ) : (
          recent.map(t => <TradeRow key={t.id} trade={t} />)
        )}
      </div>

      {/* Market breakdown */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        {['Crypto', 'Stocks', 'Forex'].map(market => {
          const m = trades.filter(t => t.market === market && t.status === 'CLOSED')
          const pnl = m.reduce((s, t) => s + (t.pnl ?? 0), 0)
          return (
            <div key={market} className="bg-card border border-border p-4">
              <p className="label-caps mb-2">{market}</p>
              <p className={`text-lg font-light ${pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                {fmt(pnl)}
              </p>
              <p className="label-caps text-faint mt-1">{m.length} trades</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
