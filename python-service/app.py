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
