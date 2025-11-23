# api/screener.py
from http.server import BaseHTTPRequestHandler
import json
import pandas as pd
from tradingview_screener import Query, Column

class handler(BaseHTTPRequestHandler):
    
    def do_POST(self):
        try:
            # Leggi body request
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length:
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
            else:
                data = {}
            
            filter_type = data.get('filterType', 'all')
            
            # Query TradingView con i tuoi criteri
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
                    'taiwan', 'uae', 'uk', 'venezuela', 'vietnam'
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
            )
            
            # Applica filtri specifici
            if filter_type == 'top_score':
                query = query.where(
                    Column('RSI').between(50, 70),
                    Column('Recommend.All') > 0.3
                )
            elif filter_type == 'value':
                query = query.where(
                    Column('price_earnings_ttm') < 20,
                    Column('price_earnings_ttm') > 5
                )
            elif filter_type == 'growth':
                query = query.where(
                    Column('Perf.1M') > 5,
                    Column('RSI') < 70
                )
            elif filter_type == 'dividend':
                # Per dividend serve aggiungere colonna dividend_yield_recent
                pass
            elif filter_type == 'momentum':
                query = query.where(
                    Column('RSI') > 50,
                    Column('MACD.macd') > Column('MACD.signal'),
                    Column('Recommend.All') > 0.3
                )
            
            # Ordina per market cap e limita risultati
            query = query.order_by('market_cap_basic', ascending=False).limit(100)
            
            # Esegui query
            result = query.get_scanner_data()
            
            if result[1].empty:
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'stocks': [],
                    'message': 'Nessun risultato trovato con i filtri applicati'
                }).encode())
                return
            
            # Converti in dict
            df = result[1]
            stocks = df.to_dict('records')
            
            # Pulisci NaN values
            for stock in stocks:
                for key, value in stock.items():
                    if pd.isna(value):
                        stock[key] = None
            
            # Risposta
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                'stocks': stocks,
                'count': len(stocks),
                'filter': filter_type
            }).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                'error': str(e),
                'type': type(e).__name__
            }).encode())
    
    def do_GET(self):
        # Health check
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({
            'status': 'ok',
            'message': 'TradingView Screener API - Use POST with filterType parameter'
        }).encode())
