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
            DataFrame containing Close prices.
        """
        if not tickers:
            return pd.DataFrame()

        print(f"Fetching data for: {tickers}")
        # Download data
        # auto_adjust=True usually returns 'Close' as adjusted close
        try:
            data = yf.download(tickers, period=period, progress=False, auto_adjust=False)
        except Exception as e:
            print(f"[DataIngestion] Download failed: {e}")
            return pd.DataFrame()
        
        if data.empty:
            return pd.DataFrame()

        prices = pd.DataFrame()

        # Handle MultiIndex columns (Price Type, Ticker)
        if isinstance(data.columns, pd.MultiIndex):
            # Try to get Adjusted Close, fallback to Close
            # We need to be careful: sometimes 'Adj Close' is present for some but not others if download is messy
            
            # Strategy: Extract 'Adj Close' if available, otherwise 'Close'.
            # If we have mixed availability, we might need to iterate or prefer Close.
            
            # Check if 'Adj Close' is a top-level key
            if 'Adj Close' in data.columns.levels[0]:
                prices = data['Adj Close']
            elif 'Close' in data.columns.levels[0]:
                prices = data['Close']
            else:
                # Fallback: look for Close in any level
                try:
                    prices = data.xs('Close', axis=1, level=0, drop_level=True)
                except:
                    pass
            
            # If we still have a MultiIndex (unlikely after selection) or if we missed some tickers:
            # Let's double check. If 'Adj Close' was selected but some tickers are missing (NaN columns),
            # we might want to check 'Close' for them. 
            # For simplicity in this fix, we'll stick to one.
            
            # If prices is empty (e.g. neither found), try simple Close
            if prices.empty and 'Close' in data:
                 prices = data['Close']

        else:
            # Single level columns
            if 'Adj Close' in data:
                prices = data['Adj Close']
            elif 'Close' in data:
                prices = data['Close']
            else:
                prices = data

        # Ensure prices is a DataFrame (if single ticker Series)
        if isinstance(prices, pd.Series):
            prices = prices.to_frame(name=tickers[0])
            
        # 1. Drop columns (tickers) that are all NaN (failed downloads or invalid tickers)
        prices = prices.dropna(axis=1, how='all')
        
        # 2. Forward fill to handle different trading days (e.g. Crypto vs Stocks)
        prices = prices.ffill()
        
        # 3. Backward fill to handle initial NaNs
        prices = prices.bfill()
        
        # 4. Drop remaining rows with NaNs (if any)
        prices = prices.dropna()
        
        return prices

if __name__ == "__main__":
    # Test
    ingestor = DataIngestion()
    df = ingestor.get_historical_data(["AAPL", "MSFT", "BTC-USD"], period="1mo")
    print(df.head())
