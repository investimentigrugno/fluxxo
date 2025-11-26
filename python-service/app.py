from flask import Flask, request, jsonify
from flask_cors import CORS
from tradingview_screener import Query, Column
import yfinance as yf
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

@app.route('/api/scan', methods=['POST'])
def scan():
    """Scansione mercati completa"""
    try:
        print("🔍 Starting TradingView scan...")
        
        query = (Query()
            .set_markets(
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
            )
            .select(
                'name', 'description', 'country', 'sector', 'currency',
                'close', 'change', 'volume', 'market_cap_basic',
                'RSI', 'MACD.macd', 'MACD.signal',
                'SMA50', 'SMA200', 'Volatility.D', 'Recommend.All',
                'float_shares_percent_current', 'relative_volume_10d_calc',
                'price_earnings_ttm', 'earnings_per_share_basic_ttm',
                'Perf.W', 'Perf.1M'
            )
            .where(
                Column('type').isin(['stock', 'etf']),
                Column('is_primary') == True,
                Column('market_cap_basic').between(10_000_000_000, 200_000_000_000_000),
                Column('close') > Column('SMA50'),
                Column('close') > Column('SMA100'),
                Column('close') > Column('SMA200'),
                Column('RSI').between(30, 80),
                Column('MACD.macd') > Column('MACD.signal'),
                Column('Volatility.D') > 0.2,
                Column('Recommend.All') > 0.1,
                Column('relative_volume_10d_calc') > 0.7,
                Column('float_shares_percent_current') > 0.3
            )
            .order_by('market_cap_basic', ascending=False)
            .limit(100)
            .get_scanner_data()
        )
        
        df = query[1]
        
        if df.empty:
            return jsonify({'stocks': [], 'count': 0})
        
        stocks = df.to_dict('records')
        
        for stock in stocks:
            for k, v in stock.items():
                if pd.isna(v):
                    stock[k] = None
        
        print(f"✅ Found {len(stocks)} stocks")
        
        return jsonify({
            'stocks': stocks,
            'count': len(stocks)
        })
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/fundamental', methods=['POST'])
def get_fundamental():
    try:
        data = request.get_json() or {}
        ticker = data.get('ticker', '')
        
        if not ticker:
            return jsonify({'error': 'Ticker richiesto'}), 400
        
        print(f"🔍 Analyzing ticker: {ticker}")
        
        # TUTTI i mercati (completi)
        all_markets = [
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
        
        # TUTTE le colonne necessarie
        all_columns = [
            'name', 'description', 'country', 'sector', 'close', 'currency',
            'market_cap_basic', 'total_revenue_yoy_growth_fy', 
            'gross_profit_yoy_growth_fy', 'net_income_yoy_growth_fy',
            'earnings_per_share_diluted_yoy_growth_fy', 'price_earnings_ttm',
            'price_free_cash_flow_ttm', 'total_assets', 'total_debt',
            'operating_margin', 'ebitda_yoy_growth_fy', 'net_margin_ttm',
            'free_cash_flow_yoy_growth_fy', 'price_sales_ratio',
            'total_liabilities_fy', 'total_current_assets', 'capex_per_share_ttm',
            'ebitda', 'ebit_ttm', 'net_income', 
            'effective_interest_rate_on_debt_fy',
            'capital_expenditures_yoy_growth_ttm', 
            'enterprise_value_to_free_cash_flow_ttm',
            'free_cash_flow_cagr_5y', 'invent_turnover_current',
            'price_target_low', 'price_target_high', 'price_target_median',
            'revenue_forecast_fq', 'earnings_per_share_forecast_fq',
            'SMA10', 'SMA20', 'SMA50', 'SMA100', 'SMA200',
            'EMA10', 'EMA20', 'EMA50', 'EMA100', 'EMA200',
            'BB.upper', 'BB.lower', 'BB.middle',
            'RSI', 'MACD.macd', 'MACD.signal', 
            'Volatility.D', 'Volatility.W', 'Volatility.M',
            'Recommend.All', 'Recommend.MA', 'Recommend.Other',
            'volume', 'change', 'relative_volume_10d_calc',
            'beta_1_year', 'beta_2_year',
            'ATR', 'ADX', 'ADX+DI', 'ADX-DI',
            'Mom', 'ROC', 'W.R', 'Stoch.RSI.K', 'Stoch.RSI.D', 'CCI20'
        ]
        
        # Query TradingView per ticker specifico
        result = (Query()
            .set_markets(*all_markets)
            .set_tickers(ticker)
            .select(*all_columns)
            .get_scanner_data()
        )
        
        df = result[1]
        
        if df.empty:
            print(f"❌ No data found for {ticker}")
            return jsonify({'error': f'Nessun dato trovato per {ticker}'}), 404
        
        # Prima riga = il ticker richiesto
        row = df.iloc[0].to_dict()
        
        # Pulisci NaN values
        for key, value in row.items():
            if pd.isna(value):
                row[key] = None
        
        print(f"✅ Successfully retrieved data for {ticker}")
        
        return jsonify({'fundamentalData': row})
        
    except Exception as e:
        print(f"❌ Error in fundamental analysis: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/ticker/info', methods=['POST'])
def get_ticker_info():
    try:
        data = request.get_json() or {}
        ticker_input = data.get('ticker', '')
        
        if not ticker_input:
            return jsonify({'error': 'Ticker richiesto'}), 400
        
        print(f"🔍 Fetching info for ticker: {ticker_input}")
        
        ticker = yf.Ticker(ticker_input)

        try:
            name = ticker.info['shortName']
        except KeyError:
            name = ticker.info['longName']

        try:
            sector = ticker.info['sector']
        except KeyError:
            sector = ticker.info['industry']

        price = ticker.info['regularMarketPrice']
        currency = ticker.info['currency']
        
        if price is None:
            return jsonify({'error': f'Prezzo non disponibile per {ticker_input}'}), 404
        
        print(f"✅ Price: {price} {currency} {name} {sector}")
        
        return jsonify({
            'price': float(price),
            'currency': currency.upper(),
            'name': name,
            'sector': sector
        })
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"🚀 Starting server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
