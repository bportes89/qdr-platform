import yfinance as yf

print("Downloading BTC-USD...")
data = yf.download(["BTC-USD"], period="1y", progress=False)
print("Data shape:", data.shape)
if data.empty:
    print("Data is empty!")
else:
    print("Data head:")
    print(data.head())
