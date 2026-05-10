import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Trash2, PlusCircle, Search } from 'lucide-react'
import { useTrades } from '../context/TradeContext'
import { Trade, Market } from '../types/trade'

function fmt(n: number) {
  return new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR' }).format(n)
}

const MARKETS: ('ALL' | Market)[] = ['ALL', 'Crypto', 'Stocks', 'Forex', 'Commodities', 'ETF', 'Options']

export default function Trades() {
  const { trades, deleteTrade } = useTrades()
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [marketFilter, setMarketFilter] = useState<'ALL' | Market>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL')

  const filtered = useMemo(() => trades.filter(tr => {
    const matchSearch = tr.symbol.toLowerCase().includes(search.toLowerCase()) || tr.strategy.toLowerCase().includes(search.toLowerCase())
    const matchMarket = marketFilter === 'ALL' || tr.market === marketFilter
    const matchStatus = statusFilter === 'ALL' || tr.status === statusFilter
    return matchSearch && matchMarket && matchStatus
  }), [trades, search, marketFilter, statusFilter])

  const totalPnl = useMemo(() => filtered.filter(tr => tr.status === 'CLOSED').reduce((s, tr) => s + (tr.pnl ?? 0), 0), [filtered])

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="label-caps text-muted mb-1">{t('trades.overview')}</p>
          <h1 className="brand-title text-4xl text-white">{t('trades.title')}</h1>
        </div>
        <Link to="/add" className="flex items-center gap-2 bg-white text-bg text-xs font-semibold tracking-widest uppercase px-4 py-2.5 hover:bg-gray-200 transition-colors">
          <PlusCircle size={13} />
          {t('trades.newTrade')}
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input type="text" placeholder={t('trades.search')} value={search} onChange={e => setSearch(e.target.value)}
            className="bg-card border border-border pl-8 pr-4 py-2 text-xs text-white placeholder:text-faint focus:outline-none focus:border-border-light w-52 transition-colors" />
        </div>
        <div className="flex gap-1">
          {(['ALL', 'OPEN', 'CLOSED'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 text-[0.65rem] tracking-widest uppercase border transition-colors ${statusFilter === s ? 'bg-white text-bg border-white' : 'border-border text-muted hover:text-white hover:border-border-light'}`}>
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap">
          {MARKETS.map(m => (
            <button key={m} onClick={() => setMarketFilter(m)}
              className={`px-3 py-2 text-[0.65rem] tracking-widest uppercase border transition-colors ${marketFilter === m ? 'bg-white text-bg border-white' : 'border-border text-muted hover:text-white hover:border-border-light'}`}>
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-6 mb-4 px-1">
        <p className="label-caps">{t('trades.summary').replace('{n}', filtered.length.toString())}</p>
        <div className="h-3 w-px bg-border" />
        <p className={`label-caps ${totalPnl >= 0 ? 'text-profit' : 'text-loss'}`}>P&L: {fmt(totalPnl)}</p>
      </div>

      <div className="bg-card border border-border overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              {[t('trades.date'), t('trades.symbol'), t('trades.market'), t('trades.direction'), t('trades.entry'), t('trades.exit'), t('trades.qty'), t('trades.pnl'), t('trades.pnlPct'), t('trades.status'), t('trades.strategy'), ''].map((h, i) => (
                <th key={i} className="label-caps px-4 py-3 text-left font-normal whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={12} className="text-center py-12 text-muted">{t('trades.noResults')}</td></tr>
              : filtered.map(tr => <TradeRow key={tr.id} trade={tr} onDelete={deleteTrade} />)
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TradeRow({ trade: tr, onDelete }: { trade: Trade; onDelete: (id: string) => void }) {
  const isProfit = (tr.pnl ?? 0) >= 0
  return (
    <tr className="border-b border-border last:border-0 hover:bg-bg transition-colors group">
      <td className="px-4 py-3 text-muted whitespace-nowrap">{tr.date}</td>
      <td className="px-4 py-3 text-white font-medium">{tr.symbol}</td>
      <td className="px-4 py-3 text-muted">{tr.market}</td>
      <td className="px-4 py-3">
        <span className={`text-[0.6rem] font-semibold tracking-widest px-1.5 py-0.5 border ${tr.direction === 'LONG' ? 'border-profit/30 text-profit' : 'border-loss/30 text-loss'}`}>{tr.direction}</span>
      </td>
      <td className="px-4 py-3 text-white tabular-nums">{tr.entryPrice.toLocaleString()}</td>
      <td className="px-4 py-3 text-muted tabular-nums">{tr.exitPrice ? tr.exitPrice.toLocaleString() : '—'}</td>
      <td className="px-4 py-3 text-muted tabular-nums">{tr.quantity}</td>
      <td className={`px-4 py-3 tabular-nums font-medium ${tr.pnl == null ? 'text-muted' : isProfit ? 'text-profit' : 'text-loss'}`}>
        {tr.pnl != null ? fmt(tr.pnl) : '—'}
      </td>
      <td className={`px-4 py-3 tabular-nums ${tr.pnlPercent == null ? 'text-muted' : isProfit ? 'text-profit' : 'text-loss'}`}>
        {tr.pnlPercent != null ? `${tr.pnlPercent >= 0 ? '+' : ''}${tr.pnlPercent}%` : '—'}
      </td>
      <td className="px-4 py-3"><span className={`label-caps text-[0.6rem] ${tr.status === 'OPEN' ? 'text-accent' : 'text-muted'}`}>{tr.status}</span></td>
      <td className="px-4 py-3 text-muted">{tr.strategy || '—'}</td>
      <td className="px-4 py-3">
        <button onClick={() => onDelete(tr.id)} className="opacity-0 group-hover:opacity-100 text-faint hover:text-loss transition-all"><Trash2 size={12} /></button>
      </td>
    </tr>
  )
}
