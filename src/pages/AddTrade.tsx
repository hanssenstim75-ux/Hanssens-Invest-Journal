import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrades } from '../context/TradeContext'
import { TradeFormData, Market } from '../types/trade'

const MARKETS: Market[] = ['Crypto', 'Stocks', 'Forex', 'Commodities', 'ETF', 'Options']
const STRATEGIES = ['Breakout', 'Trend Follow', 'Mean Reversion', 'Swing', 'Scalp', 'News', 'Andere']

const EMPTY: TradeFormData = {
  date: new Date().toISOString().split('T')[0],
  symbol: '',
  market: 'Crypto',
  direction: 'LONG',
  entryPrice: '',
  exitPrice: '',
  quantity: '',
  status: 'OPEN',
  strategy: '',
  notes: '',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label-caps block mb-2">{label}</label>
      {children}
    </div>
  )
}

export default function AddTrade() {
  const { addTrade } = useTrades()
  const navigate = useNavigate()
  const [form, setForm] = useState<TradeFormData>(EMPTY)

  const set = (key: keyof TradeFormData, val: string) =>
    setForm(prev => ({ ...prev, [key]: val }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    addTrade(form)
    navigate('/trades')
  }

  const inputCls =
    'w-full bg-bg border border-border px-4 py-2.5 text-sm text-white focus:outline-none focus:border-border-light transition-colors'
  const selectCls = inputCls + ' cursor-pointer'

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <p className="label-caps text-muted mb-1">Registreer</p>
        <h1 className="brand-title text-4xl text-white">Nieuwe Trade</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border p-6 space-y-5">
        {/* Row 1 */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Datum">
            <input
              type="date"
              value={form.date}
              onChange={e => set('date', e.target.value)}
              required
              className={inputCls}
            />
          </Field>
          <Field label="Symbool">
            <input
              type="text"
              value={form.symbol}
              onChange={e => set('symbol', e.target.value)}
              required
              placeholder="BTC/USDT"
              className={inputCls}
            />
          </Field>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-3 gap-4">
          <Field label="Markt">
            <select value={form.market} onChange={e => set('market', e.target.value as Market)} className={selectCls}>
              {MARKETS.map(m => <option key={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Richting">
            <div className="flex h-[42px]">
              {(['LONG', 'SHORT'] as const).map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => set('direction', d)}
                  className={`flex-1 text-xs tracking-widest uppercase border transition-colors ${
                    form.direction === d
                      ? d === 'LONG'
                        ? 'bg-profit/10 border-profit/40 text-profit'
                        : 'bg-loss/10 border-loss/40 text-loss'
                      : 'border-border text-muted hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Status">
            <div className="flex h-[42px]">
              {(['OPEN', 'CLOSED'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set('status', s)}
                  className={`flex-1 text-xs tracking-widest uppercase border transition-colors ${
                    form.status === s
                      ? 'bg-white/10 border-white/40 text-white'
                      : 'border-border text-muted hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-3 gap-4">
          <Field label="Entry Prijs">
            <input
              type="number"
              step="any"
              value={form.entryPrice}
              onChange={e => set('entryPrice', e.target.value)}
              required
              placeholder="0.00"
              className={inputCls}
            />
          </Field>
          <Field label="Exit Prijs">
            <input
              type="number"
              step="any"
              value={form.exitPrice}
              onChange={e => set('exitPrice', e.target.value)}
              placeholder="0.00"
              className={inputCls}
            />
          </Field>
          <Field label="Hoeveelheid">
            <input
              type="number"
              step="any"
              value={form.quantity}
              onChange={e => set('quantity', e.target.value)}
              required
              placeholder="1"
              className={inputCls}
            />
          </Field>
        </div>

        {/* Strategy */}
        <Field label="Strategie">
          <select value={form.strategy} onChange={e => set('strategy', e.target.value)} className={selectCls}>
            <option value="">— Selecteer strategie —</option>
            {STRATEGIES.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>

        {/* Notes */}
        <Field label="Notities">
          <textarea
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            rows={3}
            placeholder="Reden voor entry, marktcontext, lessen..."
            className={inputCls + ' resize-none'}
          />
        </Field>

        {/* P&L preview */}
        {form.entryPrice && form.exitPrice && form.quantity && (
          <div className="border border-border p-3 bg-bg">
            <p className="label-caps mb-1">P&L Preview</p>
            {(() => {
              const entry = parseFloat(form.entryPrice)
              const exit = parseFloat(form.exitPrice)
              const qty = parseFloat(form.quantity)
              const diff = form.direction === 'LONG' ? exit - entry : entry - exit
              const pnl = diff * qty
              const pct = (diff / entry) * 100
              return (
                <p className={`text-lg font-light ${pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {pnl >= 0 ? '+' : ''}{new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(pnl)}
                  <span className="text-sm ml-2">({pct >= 0 ? '+' : ''}{pct.toFixed(2)}%)</span>
                </p>
              )
            })()}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-white text-bg font-semibold text-xs tracking-widest uppercase py-3 hover:bg-gray-200 transition-colors"
          >
            Trade Opslaan
          </button>
          <button
            type="button"
            onClick={() => navigate('/trades')}
            className="px-6 border border-border text-muted text-xs tracking-widest uppercase hover:text-white hover:border-border-light transition-colors"
          >
            Annuleren
          </button>
        </div>
      </form>
    </div>
  )
}
