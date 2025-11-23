{/* DATI FONDAMENTALI */}
<TabsContent value="dati">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    
    {/* Card Prezzi */}
    <Card>
      <CardHeader>
        <CardTitle>💰 Valutazione</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Prezzo Attuale:</span>
          <span className="font-bold text-xl">${fundamentalData.close?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Market Cap:</span>
          <span className="font-semibold">
            ${(fundamentalData.market_cap_basic / 1e9)?.toFixed(2)}B
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">P/E Ratio:</span>
          <span className="font-semibold">
            {fundamentalData.price_earnings_ttm?.toFixed(2) || 'N/A'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Price/Sales:</span>
          <span className="font-semibold">
            {fundamentalData.price_sales_ratio?.toFixed(2) || 'N/A'}
          </span>
        </div>
      </CardContent>
    </Card>

    {/* Card Redditività */}
    <Card>
      <CardHeader>
        <CardTitle>📈 Redditività</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Operating Margin:</span>
          <span className="font-semibold">
            {(fundamentalData.operating_margin * 100)?.toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Net Margin:</span>
          <span className="font-semibold">
            {(fundamentalData.net_margin_ttm * 100)?.toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">EBITDA:</span>
          <span className="font-semibold">
            ${(fundamentalData.ebitda / 1e9)?.toFixed(2)}B
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Net Income:</span>
          <span className="font-semibold">
            ${(fundamentalData.net_income / 1e9)?.toFixed(2)}B
          </span>
        </div>
      </CardContent>
    </Card>

    {/* Card Bilancio */}
    <Card>
      <CardHeader>
        <CardTitle>🏛️ Bilancio</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Total Assets:</span>
          <span className="font-semibold">
            ${(fundamentalData.total_assets / 1e9)?.toFixed(2)}B
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Total Debt:</span>
          <span className="font-semibold">
            ${(fundamentalData.total_debt / 1e9)?.toFixed(2)}B
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Current Assets:</span>
          <span className="font-semibold">
            ${(fundamentalData.total_current_assets / 1e9)?.toFixed(2)}B
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Debt/Equity:</span>
          <span className="font-semibold">
            {((fundamentalData.total_debt / (fundamentalData.total_assets - fundamentalData.total_liabilities_fy)) || 0)?.toFixed(2)}
          </span>
        </div>
      </CardContent>
    </Card>

    {/* Card Target Price */}
    <Card>
      <CardHeader>
        <CardTitle>🎯 Target Analisti</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Target Alto:</span>
          <span className="font-semibold text-green-600">
            ${fundamentalData.price_target_high?.toFixed(2) || 'N/A'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Target Medio:</span>
          <span className="font-semibold">
            ${fundamentalData.price_target_median?.toFixed(2) || 'N/A'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Target Basso:</span>
          <span className="font-semibold text-red-600">
            ${fundamentalData.price_target_low?.toFixed(2) || 'N/A'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Upside Potenziale:</span>
          <Badge variant={
            ((fundamentalData.price_target_median - fundamentalData.close) / fundamentalData.close * 100) > 10 
              ? 'default' 
              : 'secondary'
          }>
            {((fundamentalData.price_target_median - fundamentalData.close) / fundamentalData.close * 100)?.toFixed(1)}%
          </Badge>
        </div>
      </CardContent>
    </Card>

  </div>
</TabsContent>
