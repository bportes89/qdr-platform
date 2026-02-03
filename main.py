from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import pandas as pd
from qdr_core.ingestion import DataIngestion
from qdr_core.engine import QuantumOptimizer
import uvicorn
import os

app = FastAPI(
    title="Quantum-Dynamic Rebalancing (QDR) API",
    description="API for quantum-inspired portfolio optimization",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for demo purposes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class OptimizationRequest(BaseModel):
    tickers: List[str]
    risk_aversion: Optional[float] = 1.0
    period: Optional[str] = "1y"
    num_slices: Optional[int] = 20

@app.on_event("startup")
async def startup_event():
    print("SERVER RESTARTED - OptimizationRequest MODEL")

class PortfolioResponse(BaseModel):
    allocation: Dict[str, float]
    metrics: Dict[str, float]
    metadata: Dict[str, str]
    current_prices: Optional[Dict[str, float]] = None

@app.get("/")
def read_root():
    return {"status": "online", "system": "QDR Engine"}

@app.post("/optimize", response_model=PortfolioResponse)
def optimize_portfolio(request: OptimizationRequest):
    print(f"DEBUG REQUEST: {request}")
    try:
        tickers = request.tickers
        if not tickers:
            raise HTTPException(status_code=400, detail="Ticker list cannot be empty")
            
        # 1. Ingestion
        ingestor = DataIngestion()
        # Ensure we have enough data points. Using '1y' default or user provided.
        # Note: In a real serverless env, caching would be used here.
        prices = ingestor.get_historical_data(tickers, period=request.period)
        
        # Check which tickers were successfully retrieved
        processed_tickers = list(prices.columns)
        missing_tickers = list(set(tickers) - set(processed_tickers))
        
        # 1.1 Fetch Real-Time Prices (Hybrid Source: Binance/Yahoo)
        real_time_prices = {}
        for t in processed_tickers:
            try:
                real_time_prices[t] = ingestor.get_realtime_price(t)
            except:
                real_time_prices[t] = 0.0

        if prices.empty:
            raise HTTPException(status_code=404, detail="No data found for provided tickers. Check symbols (e.g., use PETR4.SA for Brazil).")
            
        # 2. Engine
        optimizer = QuantumOptimizer(prices)
        result = optimizer.optimize_portfolio(
            risk_aversion=request.risk_aversion, 
            num_slices=request.num_slices
        )
        
        return {
            "allocation": result["weights"],
            "metrics": result["metrics"],
            "metadata": {
                "status": result["status"],
                "algorithm": "Simulated Annealing (QUBO)",
                "tickers_processed": str(len(processed_tickers)),
                "missing_tickers": ", ".join(missing_tickers) if missing_tickers else ""
            },
            "current_prices": real_time_prices
        }
        
    except Exception as e:
        # Log error in real implementation
        print(f"Error: {str(e)}") # Debug log
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
