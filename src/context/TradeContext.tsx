import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Trade, TradeFormData } from '../types/trade'

interface TradeContextType {
  trades: Trade[]
  addTrade: (data: TradeFormData) => void
  updateTrade: (id: string, data: Partial<Trade>) => void
  deleteTrade: (id: string) => void
}

const TradeContext = createContext<TradeContextType | null>(null)


function calcPnl(trade: TradeFormData): { pnl: number | null; pnlPercent: number | null } {
  const entry = parseFloat(trade.entryPrice)
  const exit = trade.exitPrice ? parseFloat(trade.exitPrice) : null
  const qty = parseFloat(trade.quantity)

  if (!exit || isNaN(entry) || isNaN(qty)) return { pnl: null, pnlPercent: null }

  const diff = trade.direction === 'LONG' ? exit - entry : entry - exit
  const pnl = parseFloat((diff * qty).toFixed(2))
  const pnlPercent = parseFloat(((diff / entry) * 100).toFixed(2))
  return { pnl, pnlPercent }
}

export function TradeProvider({ children }: { children: ReactNode }) {
  const [trades, setTrades] = useState<Trade[]>(() => {
    const stored = localStorage.getItem('hg_trades')
    return stored ? JSON.parse(stored) : []
  })

  useEffect(() => {
    localStorage.setItem('hg_trades', JSON.stringify(trades))
  }, [trades])

  const addTrade = (data: TradeFormData) => {
    const { pnl, pnlPercent } = calcPnl(data)
    const trade: Trade = {
      id: Date.now().toString(),
      date: data.date,
      symbol: data.symbol.toUpperCase(),
      market: data.market,
      direction: data.direction,
      entryPrice: parseFloat(data.entryPrice),
      exitPrice: data.exitPrice ? parseFloat(data.exitPrice) : null,
      quantity: parseFloat(data.quantity),
      status: data.status,
      pnl,
      pnlPercent,
      strategy: data.strategy,
      notes: data.notes,
    }
    setTrades(prev => [trade, ...prev])
  }

  const updateTrade = (id: string, data: Partial<Trade>) => {
    setTrades(prev => prev.map(t => (t.id === id ? { ...t, ...data } : t)))
  }

  const deleteTrade = (id: string) => {
    setTrades(prev => prev.filter(t => t.id !== id))
  }

  return (
    <TradeContext.Provider value={{ trades, addTrade, updateTrade, deleteTrade }}>
      {children}
    </TradeContext.Provider>
  )
}

export function useTrades() {
  const ctx = useContext(TradeContext)
  if (!ctx) throw new Error('useTrades must be used within TradeProvider')
  return ctx
}
