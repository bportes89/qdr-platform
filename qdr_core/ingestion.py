import yfinance as yf
import pandas as pd
import requests
from typing import List, Optional, Dict, Any

class DataIngestion:
    def __init__(self):
        self.session = requests.Session()

    def get_realtime_price(self, ticker: str) -> float:
        """
        Tries to get the most real-time price possible using multiple free sources.
        Hierarchy:
        1. Binance API (for Crypto) - Real-time, Free
        2. Yahoo Finance (Fallback) - Real-time for Crypto, 15m delay for Stocks
        """
        # 1. Try Binance for Crypto (assuming Yahoo format "BTC-USD" -> Binance "BTCUSDT")
        if "-USD" in ticker:
            try:
                symbol = ticker.replace("-USD", "USDT")
                url = f"https://api.binance.com/api/v3/ticker/price?symbol={symbol}"
                response = self.session.get(url, timeout=2)
                if response.status_code == 200:
                    data = response.json()
                    print(f"[DataIngestion] Fetched real-time price for {ticker} from Binance: {data['price']}")
                    return float(data['price'])
            except Exception as e:
                print(f"[DataIngestion] Binance fetch failed for {ticker}: {e}")

        # 2. Fallback to Yahoo Finance (Fast & Reliable for broad coverage)
        try:
            ticker_obj = yf.Ticker(ticker)
            # Try to get fast info
            price = ticker_obj.fast_info.last_price
            if price:
                 return price
            
            # Fallback to history if fast_info fails
            hist = ticker_obj.history(period="1d")
            if not hist.empty:
                return hist["Close"].iloc[-1]
                
        except Exception as e:
            print(f"[DataIngestion] Yahoo fetch failed for {ticker}: {e}")
            
        return 0.0

    def get_historical_data(self, tickers: List[str], period: str = "1y") -> pd.DataFrame:
        """
        Fetches historical data for a list of tickers.
        
        Args:
            tickers: List of stock/crypto tickers (e.g., ['AAPL', 'BTC-USD']).
            period: Period to download (e.g., '1mo', '3mo', '6mo', '1y', '2y').
            
        Returns:
            DataFrame containing Adjusted Close prices.
        """
        if not tickers:
            return pd.DataFrame()

        print(f"Fetching data for: {tickers}")
        # Download data
        data = yf.download(tickers, period=period, progress=False)
        
        # Extract 'Adj Close' or 'Close'
        if 'Adj Close' in data:
            prices = data['Adj Close']
        elif 'Close' in data:
            prices = data['Close']
        else:
            # Fallback for single ticker or different structure
            prices = data
            
        # Drop rows with NaN values to ensure data quality
        prices = prices.dropna()
        
        return prices

if __name__ == "__main__":
    # Test
    ingestor = DataIngestion()
    df = ingestor.get_historical_data(["AAPL", "MSFT", "BTC-USD"], period="1mo")
    print(df.head())
