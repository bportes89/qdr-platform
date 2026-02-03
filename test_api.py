import requests
import json

url = "http://localhost:8000/optimize"
payload = {
    "tickers": ["BTC-USD", "ETH-USD"],
    "risk_aversion": 1.0,
    "num_slices": 10
}
headers = {
    "Content-Type": "application/json"
}

try:
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print("Response Body:")
    print(response.text)
except Exception as e:
    print(f"Error: {e}")
