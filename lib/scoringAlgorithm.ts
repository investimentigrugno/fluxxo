export interface ScoredStock {
  name: string
  close: number
  market_cap_basic: number
  RSI: number
  'MACD.macd': number
  'MACD.signal': number
  SMA50: number
  SMA200: number
  'Volatility.D': number
  'Recommend.All': number
  InvestmentScore: number
  RSIScore: number
  MACDScore: number
  TrendScore: number
  TechRatingScore: number
  VolatilityScore: number
  MCapScore: number
  TechnicalRating: string
  RecommendationReason: string
  [key: string]: any
}

export function calculateInvestmentScore(stock: any): ScoredStock {
  const scored: any = { ...stock }
  
  scored.InvestmentScore = 0
  
  // 1. RSI Score (20%)
  const rsiScore = (rsi: number) => {
    if (isNaN(rsi)) return 0
    if (rsi >= 50 && rsi <= 70) return 10  // Ottimale
    if (rsi >= 40 && rsi < 50) return 7    // Buona
    if (rsi >= 30 && rsi < 40) return 5    // Accettabile
    if (rsi > 80) return 2                 // Ipercomprato
    return 1
  }
  
  scored.RSIScore = rsiScore(stock.RSI || 0)
  scored.InvestmentScore += scored.RSIScore * 0.20
  
  // 2. MACD Score (15%)
  const macdScore = (macd: number, signal: number) => {
    if (isNaN(macd) || isNaN(signal)) return 0
    const diff = macd - signal
    if (diff > 0.05) return 10
    if (diff > 0) return 7
    if (diff > -0.05) return 4
    return 1
  }
  
  scored.MACDScore = macdScore(stock['MACD.macd'] || 0, stock['MACD.signal'] || 0)
  scored.InvestmentScore += scored.MACDScore * 0.15
  
  // 3. Trend Score (25%)
  const trendScore = (price: number, sma50: number, sma200: number) => {
    if (isNaN(price) || isNaN(sma50) || isNaN(sma200)) return 0
    let score = 0
    if (price > sma50) score += 5
    if (price > sma200) score += 3
    if (sma50 > sma200) score += 2
    return score
  }
  
  scored.TrendScore = trendScore(
    stock.close || 0,
    stock.SMA50 || 0,
    stock.SMA200 || 0
  )
  scored.InvestmentScore += scored.TrendScore * 0.25
  
  // 4. Technical Rating Score (20%)
  const techRatingScore = (rating: number) => {
    if (isNaN(rating)) return 0
    if (rating >= 0.5) return 10
    if (rating >= 0.3) return 8
    if (rating >= 0.1) return 6
    if (rating >= -0.1) return 4
    return 2
  }
  
  scored.TechRatingScore = techRatingScore(stock['Recommend.All'] || 0)
  scored.InvestmentScore += scored.TechRatingScore * 0.20
  
  // 5. Volatility Score (10%)
  const volatilityScore = (vol: number) => {
    if (isNaN(vol)) return 0
    if (vol >= 0.5 && vol <= 2.0) return 10
    if (vol >= 0.3 && vol < 0.5) return 7
    if (vol > 2.0 && vol <= 3.0) return 6
    if (vol > 3.0) return 3
    return 2
  }
  
  scored.VolatilityScore = volatilityScore(stock['Volatility.D'] || 0)
  scored.InvestmentScore += scored.VolatilityScore * 0.10
  
  // 6. Market Cap Score (10%)
  const mcapScore = (mcap: number) => {
    if (isNaN(mcap)) return 0
    if (mcap >= 1e9 && mcap <= 50e9) return 10
    if (mcap > 50e9 && mcap <= 200e9) return 8
    if (mcap >= 500e6 && mcap < 1e9) return 6
    return 4
  }
  
  scored.MCapScore = mcapScore(stock.market_cap_basic || 0)
  scored.InvestmentScore += scored.MCapScore * 0.10
  
  // Normalizza 0-100
  const maxPossible = 10 * (0.20 + 0.15 + 0.25 + 0.20 + 0.10 + 0.10)
  scored.InvestmentScore = Math.round((scored.InvestmentScore / maxPossible) * 100)
  
  // Genera motivo raccomandazione
  const reasons = []
  if (scored.RSIScore >= 8) reasons.push("RSI ottimale")
  if (scored.MACDScore >= 7) reasons.push("MACD positivo")
  if (scored.TrendScore >= 8) reasons.push("Strong uptrend")
  if (scored.TechRatingScore >= 8) reasons.push("Analisi tecnica positiva")
  if (scored.VolatilityScore >= 7) reasons.push("Volatilità controllata")
  
  scored.RecommendationReason = reasons.slice(0, 3).join(" | ") || "Analisi in corso"
  
  return scored as ScoredStock
}

export function formatTechnicalRating(rating: number): string {
  if (isNaN(rating)) return 'N/A'
  if (rating >= 0.5) return 'Strong Buy'
  if (rating >= 0.1) return 'Buy'
  if (rating >= -0.1) return 'Neutral'
  if (rating >= -0.5) return 'Sell'
  return 'Strong Sell'
}
