from flask import Flask, request, jsonify
from flask_cors import CORS
from tradingview_screener import Query, Column
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

@app.route('/api/scan', methods=['POST'])
def scan():
    try:
        data = request.get_json() or {}
        filter_type = data.get('filterType', 'all')
        
        # Query TradingView - IDENTICO al tuo Streamlit
        query = (Query()
            .set_markets('america', 'europe', 'asia')
            .select(
                'name', 'close', 'volume', 'market_cap_basic',
                'RSI', 'MACD.macd', 'MACD.signal',
                'SMA50', 'SMA200', 'Volatility.D', 'Recommend.All',
                'price_earnings_ttm', 'return_on_equity', 
                'debt_to_equity', 'change'
            )
            .where(
                Column('market_cap_basic') > 1_000_000_000,
                Column('close') > Column('SMA50'),
                Column('RSI').between(30, 80)
            )
            .order_by('market_cap_basic', ascending=False)
            .limit(100)
        )
        
        result = query.get_scanner_data()
        
        if result[1].empty:
            return jsonify({'stocks': [], 'count': 0})
        
        df = result[1]
        stocks = df.to_dict('records')
        
        # Pulisci NaN
        for stock in stocks:
            for k, v in stock.items():
                if pd.isna(v):
                    stock[k] = None
        
        return jsonify({'stocks': stocks, 'count': len(stocks)})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)

@app.route('/api/fundamental', methods=['POST'])
def get_fundamental():
    """
    Analisi fondamentale singolo ticker
    Body: { "ticker": "NASDAQ:AAPL" }
    """
    try:
        data = request.get_json() or {}
        ticker = data.get('ticker', '')
        
        if not ticker:
            return jsonify({'error': 'Ticker richiesto'}), 400
        
        print(f"🔍 Analyzing ticker: {ticker}")
        
        # Tutti i mercati (come Streamlit)
        markets = [
            'america', 'australia', 'belgium', 'brazil', 'canada', 
            'chile', 'china', 'italy', 'czech', 'denmark', 'egypt',
            'estonia', 'finland', 'france', 'germany', 'greece',
            'hongkong', 'hungary', 'india', 'indonesia', 'ireland',
            'israel', 'japan', 'korea', 'kuwait', 'lithuania',
            'luxembourg', 'malaysia', 'mexico', 'morocco',
            'netherlands', 'newzealand', 'norway', 'peru',
            'philippines', 'poland', 'portugal', 'qatar', 'russia',
            'singapore', 'slovakia', 'spain', 'sweden', 'switzerland',
            'taiwan', 'uae', 'uk', 'venezuela', 'vietnam', 'crypto'
        ]
        
        # Colonne complete (come Streamlit)
        columns = [
            'name', 'description', 'country', 'sector', 'close', 'currency',
            'market_cap_basic', 'total_revenue_yoy_growth_fy', 
            'gross_profit_yoy_growth_fy', 'net_income_yoy_growth_fy',
            'earnings_per_share_diluted_yoy_growth_fy', 'price_earnings_ttm',
            'price_free_cash_flow_ttm', 'total_assets', 'total_debt',
            'operating_margin', 'ebitda_yoy_growth_fy', 'net_margin_ttm',
            'free_cash_flow_yoy_growth_fy', 'price_sales_ratio',
            'total_liabilities_fy', 'total_current_assets', 'capex_per_share_ttm',
            'ebitda', 'ebit_ttm', 'net_income', 'effective_interest_rate_on_debt_fy',
            'capital_expenditures_yoy_growth_ttm', 'enterprise_value_to_free_cash_flow_ttm',
            'free_cash_flow_cagr_5y', 'invent_turnover_current',
            'price_target_low', 'price_target_high', 'price_target_median',
            'revenue_forecast_fq', 'earnings_per_share_forecast_fq',
            'SMA50', 'SMA200', 'beta_1_year', 'beta_2_year',
            'RSI', 'MACD.macd', 'MACD.signal', 'Volatility.D', 'Recommend.All',
            'volume', 'change', 'relative_volume_10d_calc'
        ]
        
        # Query TradingView per ticker specifico
        query = (Query()
            .set_markets(*markets)
            .set_tickers(ticker)
            .select(*columns)
            .get_scanner_data()
        )
        
        if query[1].empty:
            return jsonify({
                'error': f'Nessun dato trovato per {ticker}'
            }), 404
        
        # Prima riga risultati
        row = query[1].iloc[0].to_dict()
        
        # Pulisci NaN
        for key, value in row.items():
            if pd.isna(value):
                row[key] = None
        
        print(f"✅ Data retrieved for {ticker}")
        
        return jsonify({'fundamentalData': row})
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({'error': str(e)}), 500
