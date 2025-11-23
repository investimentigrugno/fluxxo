# api/fundamental.py
from http.server import BaseHTTPRequestHandler
import json
import pandas as pd
from tradingview_screener import Query

class handler(BaseHTTPRequestHandler):
    
    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            ticker = data.get('ticker', '')
            
            if not ticker:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Ticker richiesto'}).encode())
                return
            
            # Query TradingView per ticker specifico
            markets = [
                'america', 'australia', 'belgium', 'brazil', 'canada', 
                'italy', 'france', 'germany', 'uk', 'spain', 'netherlands'
            ]
            
            columns = [
                'name', 'description', 'close', 'market_cap_basic', 
                'volume', 'RSI', 'MACD.macd', 'MACD.signal',
                'SMA50', 'SMA200', 'Volatility.D', 'Recommend.All',
                'price_earnings_ttm', 'earnings_per_share_basic_ttm',
                'return_on_equity', 'debt_to_equity', 'current_ratio',
                'price_book_ratio', 'dividend_yield_recent'
            ]
            
            query = (Query()
                .set_markets(*markets)
                .set_tickers(ticker)
                .select(*columns)
                .get_scanner_data()
            )
            
            if query[1].empty:
                self.send_response(404)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'error': f'Nessun dato trovato per {ticker}'
                }).encode())
                return
            
            # Prima riga dei risultati
            row = query[1].iloc[0].to_dict()
            
            # Pulisci NaN
            for key, value in row.items():
                if pd.isna(value):
                    row[key] = None
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                'fundamentalData': row
            }).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'error': str(e)
            }).encode())
    
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({
            'status': 'ok',
            'message': 'Fundamental API - Use POST with ticker parameter'
        }).encode())
