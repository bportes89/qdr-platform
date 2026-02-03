import sys
import os
import pandas as pd
from qdr_core.ingestion import DataIngestion
from qdr_core.engine import QuantumOptimizer

def run_demo():
    print("=== Quantum-Dynamic Rebalancing (QDR) Demo ===")
    
    # 1. Define Portfolio
    tickers = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "BTC-USD", "ETH-USD"]
    print(f"\n1. Analisando ativos: {', '.join(tickers)}")
    
    # 2. Ingestion
    print("\n2. Buscando dados históricos (Yahoo Finance)...")
    ingestor = DataIngestion()
    try:
        # Usando um período curto para ser rápido na demo
        prices = ingestor.get_historical_data(tickers, period="6mo")
        if prices.empty:
            print("Erro: Não foi possível obter dados.")
            return
        print(f"   Dados obtidos: {len(prices)} dias de negociação.")
    except Exception as e:
        print(f"   Erro na ingestão: {e}")
        return

    # 3. Optimization
    print("\n3. Inicializando Motor de Otimização (Simulated Annealing)...")
    print("   Parâmetros: Risco Moderado (Aversion=1.0), Fatias de Investimento=20 (precisão de 5%)")
    
    optimizer = QuantumOptimizer(prices)
    
    try:
        result = optimizer.optimize_portfolio(risk_aversion=0.5, num_slices=20)
        
        print("\n4. Resultado da Otimização:")
        print("-" * 40)
        print(f"{'Ativo':<10} | {'Alocação Sugerida':<20}")
        print("-" * 40)
        
        weights = result["weights"]
        # Sort by weight descending
        sorted_weights = sorted(weights.items(), key=lambda item: item[1], reverse=True)
        
        for ticker, weight in sorted_weights:
            percentage = weight * 100
            if percentage > 0:
                print(f"{ticker:<10} | {percentage:>6.1f}%")
                
        print("-" * 40)
        print(f"Status da Solução: {result['status']}")
        print("Nota: 'optimal' indica que as restrições (soma=100%) foram satisfeitas.")
        
    except Exception as e:
        print(f"Erro na otimização: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    run_demo()
