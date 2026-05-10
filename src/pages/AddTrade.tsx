import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTrades } from '../context/TradeContext'
import { TradeFormData, Market } from '../types/trade'

const MARKETS: Market[] = ['Crypto', 'Stocks', 'Forex', 'Commodities', 'ETF', 'Options']
const STRATEGIES = ['Breakout', 'Trend Follow', 'Mean Reversion', 'Swing', 'Scalp', 'News', 'Other']

const EMPTY: TradeFormData = {
  date: new Date().toISOString().split('T')[0],
  symbol: '', market: 'Crypto', direction: 'LONG',
  entryPrice: '', exitPrice: '', quantity: '',
  status: 'OPEN', strategy: '', notes: '',
}

export default function AddTrade() {
  const { addTrade } = useTrades()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [form, setForm] = useState<TradeFormData>(EMPTY)

  const set = (key: keyof TradeFormData, val: string) => setForm(prev => ({ ...prev, [key]: val }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    addTrade(form)
    navigate('/trades')
  }

  const inputCls = 'w-full bg-bg border border-border px-4 py-2.5 text-sm text-white focus:outline-none focus:border-border-light transition-colors'

  return (
    <div className="p-8 w-full max-w-3xl">
      <div className="mb-8">
        <p className="label-caps text-muted mb-1">{t('addTrade.register')}</p>
        <h1 className="brand-title text-4xl text-white">{t('addTrade.title')}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-caps block mb-2">{t('addTrade.date')}</label>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} required className={inputCls} />
          </div>
          <div>
            <label className="label-caps block mb-2">{t('addTrade.symbol')}</label>
            <input type="text" value={form.symbol} onChange={e => set('symbol', e.target.value)} required placeholder="BTC/USDT" className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label-caps block mb-2">{t('addTrade.market')}</label>
            <select value={form.market} onChange={e => set('market', e.target.value as Market)} className={inputCls + ' cursor-pointer'}>
              {MARKETS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="label-caps block mb-2">{t('addTrade.direction')}</label>
            <div className="flex h-[42px]">
              {(['LONG', 'SHORT'] as const).map(d => (
                <button key={d} type="button" onClick={() => set('direction', d)}
                  className={`flex-1 text-xs tracking-widest uppercase border transition-colors ${form.direction === d ? d === 'LONG' ? 'bg-profit/10 border-profit/40 text-profit' : 'bg-loss/10 border-loss/40 text-loss' : 'border-border text-muted hover:text-white'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label-caps block mb-2">{t('addTrade.status')}</label>
            <div className="flex h-[42px]">
              {(['OPEN', 'CLOSED'] as const).map(s => (
                <button key={s} type="button" onClick={() => set('status', s)}
                  className={`flex-1 text-xs tracking-widest uppercase border transition-colors ${form.status === s ? 'bg-white/10 border-white/40 text-white' : 'border-border text-muted hover:text-white'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label-caps block mb-2">{t('addTrade.entry')}</label>
            <input type="number" step="any" value={form.entryPrice} onChange={e => set('entryPrice', e.target.value)} required placeholder="0.00" className={inputCls} />
          </div>
          <div>
            <label className="label-caps block mb-2">{t('addTrade.exit')}</label>
            <input type="number" step="any" value={form.exitPrice} onChange={e => set('exitPrice', e.target.value)} placeholder="0.00" className={inputCls} />
          </div>
          <div>
            <label className="label-caps block mb-2">{t('addTrade.quantity')}</label>
            <input type="number" step="any" value={form.quantity} onChange={e => set('quantity', e.target.value)} required placeholder="1" className={inputCls} />
          </div>
        </div>

        <div>
          <label className="label-caps block mb-2">{t('addTrade.strategy')}</label>
          <select value={form.strategy} onChange={e => set('strategy', e.target.value)} className={inputCls + ' cursor-pointer'}>
            <option value="">{t('addTrade.selectStrategy')}</option>
            {STRATEGIES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="label-caps block mb-2">{t('addTrade.notes')}</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} placeholder={t('addTrade.notesPlaceholder')} className={inputCls + ' resize-none'} />
        </div>

        {form.entryPrice && form.exitPrice && form.quantity && (() => {
          const entry = parseFloat(form.entryPrice), exit = parseFloat(form.exitPrice), qty = parseFloat(form.quantity)
          const diff = form.direction === 'LONG' ? exit - entry : entry - exit
          const pnl = diff * qty, pct = (diff / entry) * 100
          return (
            <div className="border border-border p-3 bg-bg">
              <p className="label-caps mb-1">{t('addTrade.pnlPreview')}</p>
              <p className={`text-lg font-light ${pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                {pnl >= 0 ? '+' : ''}{new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR' }).format(pnl)}
                <span className="text-sm ml-2">({pct >= 0 ? '+' : ''}{pct.toFixed(2)}%)</span>
              </p>
            </div>
          )
        })()}

        <div className="flex gap-3 pt-2">
          <button type="submit" className="flex-1 bg-white text-bg font-semibold text-xs tracking-widest uppercase py-3 hover:bg-gray-200 transition-colors">
            {t('addTrade.save')}
          </button>
          <button type="button" onClick={() => navigate('/trades')} className="px-6 border border-border text-muted text-xs tracking-widest uppercase hover:text-white hover:border-border-light transition-colors">
            {t('addTrade.cancel')}
          </button>
        </div>
      </form>
    </div>
  )
}
