// lib/scoringAlgorithm.ts
// Algoritmo di scoring investimenti - Port da Python Streamlit

export interface StockData {
  name: string
  close: number
  RSI?: number
  'MACD.macd'?: number
  'MACD.signal'?: number
  SMA50?: number
  SMA200?: number
  'Volatility.D'?: number
  'Recommend.All'?: number
  market_cap_basic?: number
  volume?: number
  relative_volume_10d_calc?: number
  change?: number
}

export interface ScoredStock extends StockData {
  InvestmentScore: number
  RSIScore: number
  MACDScore: number
  TrendScore: number
  TechRatingScore: number
  VolatilityScore: number
  MCapScore: number
  RecommendationReason: string
}

// 1. RSI Score (peso 20%)
function calculateRSIScore(rsi?: number): number {
  if (!rsi || isNaN(rsi)) return 0
  if (rsi >= 50 && rsi <= 70) return 10 // Zona ottimale
  if (rsi >= 40 && rsi < 50) return 7   // Buona
  if (rsi >= 30 && rsi < 40) return 5   // Accettabile
  if (rsi > 80) return 2                 // Ipercomprato
  return 1                                // Troppo basso
}

// 2. MACD Score (peso 15%)
function calculateMACDScore(macd?: number, signal?: number): number {
  if (!macd || !signal || isNaN(macd) || isNaN(signal)) return 0
  const diff = macd - signal
  if (diff > 0.05) return 10
  if (diff > 0) return 7
  if (diff > -0.05) return 4
  return 1
}

// 3. Trend Score (peso 25%)
function calculateTrendScore(price?: number, sma50?: number, sma200?: number): number {
  if (!price || !sma50 || !sma200) return 0
  let score = 0
  if (price > sma50) score += 5    // Prezzo sopra SMA50
  if (price > sma200) score += 3   // Prezzo sopra SMA200
  if (sma50 > sma200) score += 2   // SMA50 sopra SMA200 (golden cross)
  return score
}

// 4. Technical Rating Score (peso 20%)
function calculateTechRatingScore(rating?: number): number {
  if (!rating || isNaN(rating)) return 0
  if (rating > 0.5) return 10
  if (rating > 0.3) return 8
  if (rating > 0.1) return 6
  if (rating > -0.1) return 4
  return 2
}

// 5. Volatility Score (peso 10%)
function calculateVolatilityScore(volatility?: number): number {
  if (!volatility || isNaN(volatility)) return 0
  if (volatility >= 0.5 && volatility <= 2.0) return 10 // Ideale per 2-4 settimane
  if (volatility >= 0.3 && volatility < 0.5) return 7
  if (volatility > 2.0 && volatility <= 3.0) return 6
  if (volatility > 3.0) return 3
  return 2
}

// 6. Market Cap Score (peso 10%)
function calculateMCapScore(mcap?: number): number {
  if (!mcap || isNaN(mcap)) return 0
  if (mcap >= 1e9 && mcap <= 50e9) return 10   // 1B-50B sweet spot
  if (mcap > 50e9 && mcap <= 200e9) return 8
  if (mcap >= 500e6 && mcap < 1e9) return 6
  return 4
}

// Funzione principale calcolo score
export function calculateInvestmentScore(stock: StockData): ScoredStock {
  const rsiScore = calculateRSIScore(stock.RSI)
  const macdScore = calculateMACDScore(stock['MACD.macd'], stock['MACD.signal'])
  const trendScore = calculateTrendScore(stock.close, stock.SMA50, stock.SMA200)
  const techRatingScore = calculateTechRatingScore(stock['Recommend.All'])
  const volatilityScore = calculateVolatilityScore(stock['Volatility.D'])
  const mcapScore = calculateMCapScore(stock.market_cap_basic)

  // Calcolo punteggio totale (normalizzato 0-100)
  const totalScore = 
    (rsiScore * 0.20) +
    (macdScore * 0.15) +
    (trendScore * 0.25) +
    (techRatingScore * 0.20) +
    (volatilityScore * 0.10) +
    (mcapScore * 0.10)

  const maxPossibleScore = 10
  const investmentScore = (totalScore / maxPossibleScore) * 100

  // Genera motivi raccomandazione
  const reasons: string[] = []
  if (rsiScore >= 8) reasons.push('RSI ottimale')
  if (macdScore >= 7) reasons.push('MACD positivo')
  if (trendScore >= 8) reasons.push('Strong uptrend')
  if (techRatingScore >= 8) reasons.push('Analisi tecnica positiva')
  if (volatilityScore >= 7) reasons.push('Volatilità controllata')

  return {
    ...stock,
    InvestmentScore: Math.round(investmentScore * 10) / 10,
    RSIScore: rsiScore,
    MACDScore: macdScore,
    TrendScore: trendScore,
    TechRatingScore: techRatingScore,
    VolatilityScore: volatilityScore,
    MCapScore: mcapScore,
    RecommendationReason: reasons.slice(0, 3).join(', ') || 'Analisi in corso'
  }
}

// Formatta rating tecnico
export function formatTechnicalRating(rating?: number): string {
  if (!rating || isNaN(rating)) return 'N/A'
  if (rating > 0.5) return 'Strong Buy'
  if (rating > 0.1) return 'Buy'
  if (rating > -0.1) return 'Neutral'
  if (rating > -0.5) return 'Sell'
  return 'Strong Sell'
}

// Seleziona top 5 picks
export function getTop5Picks(stocks: ScoredStock[]): ScoredStock[] {
  return stocks
    .sort((a, b) => b.InvestmentScore - a.InvestmentScore)
    .slice(0, 5)
}
