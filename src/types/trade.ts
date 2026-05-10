export type TradeDirection = 'LONG' | 'SHORT'
export type TradeStatus = 'OPEN' | 'CLOSED'
export type Market = 'Crypto' | 'Stocks' | 'Forex' | 'Commodities' | 'ETF' | 'Options'

export interface Trade {
  id: string
  date: string
  symbol: string
  market: Market
  direction: TradeDirection
  entryPrice: number
  exitPrice: number | null
  quantity: number
  status: TradeStatus
  pnl: number | null
  pnlPercent: number | null
  strategy: string
  notes: string
}

export interface TradeFormData {
  date: string
  symbol: string
  market: Market
  direction: TradeDirection
  entryPrice: string
  exitPrice: string
  quantity: string
  status: TradeStatus
  strategy: string
  notes: string
}
