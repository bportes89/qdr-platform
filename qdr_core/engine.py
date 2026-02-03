import numpy as np
import pandas as pd
from typing import List, Dict, Any
import math

class QuantumOptimizer:
    def __init__(self, prices: pd.DataFrame):
        self.prices = prices
        self.returns = prices.pct_change().dropna()
        self.mu = self.returns.mean()
        self.sigma = self.returns.cov()
        self.tickers = prices.columns.tolist()
        
    def calculate_portfolio_metrics(self, weights_dict: Dict[str, float]) -> Dict[str, float]:
        """
        Calculates annualized volatility and return for a given weight distribution.
        """
        weights = np.array([weights_dict.get(ticker, 0.0) for ticker in self.tickers])
        
        # Annualized Volatility (Standard Deviation)
        # Variance = w.T * Sigma * w
        variance = np.dot(weights.T, np.dot(self.sigma, weights))
        volatility = np.sqrt(variance) * np.sqrt(252) # 252 trading days
        
        # Annualized Expected Return
        # Ret = w.T * mu
        expected_return = np.dot(weights.T, self.mu) * 252
        
        return {
            "volatility": float(volatility),
            "expected_return": float(expected_return),
            "sharpe_ratio": float(expected_return / volatility) if volatility > 0 else 0.0
        }

    def optimize_portfolio(self, risk_aversion: float = 1.0, num_slices: int = 10) -> Dict[str, Any]:
        """
        Optimizes portfolio using Simulated Annealing (Quantum-inspired).
        
        Args:
            risk_aversion: Lambda parameter. Higher value means minimizing risk is more important.
                           Lower value (e.g., 0.1) prioritizes returns.
            num_slices: Granularity of discretization. e.g., 10 means weights can be 0.0, 0.1, ..., 1.0.
                        Total units = num_slices.
        
        Returns:
            Dictionary with optimal weights and performance metrics.
        """
        # Lazy import to speed up initial server startup
        import neal
        from pyqubo import Array, Constraint

        n_assets = len(self.tickers)
        
        # Define integer variables for weights (0 to num_slices) using binary expansion manually
        # k_i = sum(2^b * x_{i,b})
        num_bits = math.floor(math.log2(num_slices)) + 1
        
        # x[i][b] is the b-th bit of asset i's weight
        x = Array.create('x', shape=(n_assets, num_bits), vartype='BINARY')
        
        # Define assets_k as expressions of x (integer values)
        assets_k_expr = []
        for i in range(n_assets):
            val_expr = 0
            for b in range(num_bits):
                val_expr += (2**b) * x[i][b]
            assets_k_expr.append(val_expr)
            
        # Hamiltonian Construction
        # Minimize: k^T * Sigma * k - lambda * num_slices * mu^T * k + Penalty * (sum(k) - num_slices)^2
        H = 0.0
        
        # Risk Term: sum(sigma_ij * ki * kj)
        cov_matrix = self.sigma.values
        mu_vector = self.mu.values
        
        for i in range(n_assets):
            for j in range(n_assets):
                H += cov_matrix[i][j] * assets_k_expr[i] * assets_k_expr[j]
        
        # Return Term: - lambda * num_slices * sum(mu_i * ki)
        return_term = 0.0
        for i in range(n_assets):
            return_term += mu_vector[i] * assets_k_expr[i]
            
        H -= risk_aversion * num_slices * return_term
        
        # Constraint: sum(k_i) = num_slices
        total_units_expr = sum(assets_k_expr)
        H += Constraint((total_units_expr - num_slices)**2, label='sum_constraint')
        
        # Compile model
        model = H.compile()
        bqm = model.to_bqm()
        
        # Solve using Simulated Annealing (running locally on CPU)
        sa = neal.SimulatedAnnealingSampler()
        sampleset = sa.sample(bqm, num_reads=100, num_sweeps=1000)
        
        # Decode solution
        decoded_samples = model.decode_sampleset(sampleset)
        best_sample = min(decoded_samples, key=lambda x: x.energy)
        
        # Decode manually
        weights = {}
        total_k = 0
        
        for i, ticker in enumerate(self.tickers):
            val = 0
            for b in range(num_bits):
                # Retrieve bit value from sample
                bit_name = f'x[{i}][{b}]'
                bit_val = best_sample.sample[bit_name]
                val += (2**b) * bit_val
            
            weights[ticker] = val
            total_k += val
            
        # Normalize weights
        if total_k == 0:
            total_k = 1 # Avoid division by zero
            
        normalized_weights = {k: v / total_k for k, v in weights.items()}
        
        metrics = self.calculate_portfolio_metrics(normalized_weights)
        
        return {
            "weights": normalized_weights,
            "metrics": metrics,
            "original_units": weights,
            "status": "optimal" if best_sample.constraints(only_broken=True) == {} else "approximate"
        }

if __name__ == "__main__":
    # Mock data for testing
    dates = pd.date_range(start="2023-01-01", periods=100)
    data = {
        "A": np.random.normal(100, 2, 100), # Stable
        "B": np.random.normal(50, 5, 100),  # Volatile
        "C": np.linspace(10, 20, 100) + np.random.normal(0, 1, 100) # Growth
    }
    df = pd.DataFrame(data, index=dates)
    
    optimizer = QuantumOptimizer(df)
    result = optimizer.optimize_portfolio(risk_aversion=0.5, num_slices=20)
    print("Optimization Result:", result)
