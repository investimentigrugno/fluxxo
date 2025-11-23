from http.server import BaseHTTPRequestHandler
import json
from tradingview_screener import Query

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            ticker = data.get('ticker')
            
            if not ticker:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Ticker richiesto'}).encode())
                return
            
            markets = ['america', 'australia', 'brazil', 'canada', 'china', 'france', 'germany', 'india', 'italy', 'japan', 'uk']
            
            query = (Query()
                .set_markets(*markets)
                .select('name', 'close', 'market_cap_basic', 'price_earnings_ttm', 'earnings_per_share_basic_ttm')
                .set_tickers(ticker)
                .get_scanner_data())
            
            if query.empty:
                self.send_response(404)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Nessun dato trovato'}).encode())
                return
            
            row = query.iloc.to_dict()
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'fundamentalData': row}).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())
