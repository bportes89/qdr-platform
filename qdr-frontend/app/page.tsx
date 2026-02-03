"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, ScatterChart, Scatter, XAxis, YAxis, ZAxis } from 'recharts';
import { Activity, Shield, TrendingUp, Cpu, ArrowRight, Zap, Target, Flame, AlertTriangle, Info, Plus, X, Lock, CheckCircle, CreditCard } from 'lucide-react';

// Types
interface Metrics {
  volatility: number;
  expected_return: number;
  sharpe_ratio: number;
}

interface OptimizationResult {
  allocation: Record<string, number>;
  metrics: Metrics;
  metadata: Record<string, string> & { missing_tickers?: string };
  efficient_frontier?: { vol: number, ret: number, sharpe: number }[]; // Mock data for visualization
}

export default function Home() {
  const [tickers, setTickers] = useState<string[]>(["BTC-USD", "ETH-USD", "AAPL", "MSFT", "TSLA", "GOOGL"]);
  const [newTicker, setNewTicker] = useState("");
  const [investment, setInvestment] = useState<string>("10000"); // New state for investment amount
  const [mode, setMode] = useState<"conservative" | "aggressive">("conservative");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  
  // Auth & Plan State (Mock)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPlan, setUserPlan] = useState<'free' | 'pro'>('free');

  const handleLogin = () => {
      // Simula login e verifica plano
      setIsLoggedIn(true);
      // Aqui você conectaria com seu backend/Supabase
  };

  const handleUpgrade = () => {
      setUserPlan('pro');
      alert("Upgrade realizado com sucesso! (Simulação)");
  };

  const handleAddTicker = () => {
    if (newTicker && !tickers.includes(newTicker.toUpperCase())) {
      setTickers([...tickers, newTicker.toUpperCase()]);
      setNewTicker("");
    }
  };

  const handleRemoveTicker = (tickerToRemove: string) => {
    setTickers(tickers.filter(t => t !== tickerToRemove));
  };

  const handleOptimize = async () => {
    setLoading(true);
    setError(null);
    setProgress(0);
    setResult(null);

    // Simulate Quantum Processing Steps
    const steps = ["Initializing QUBO Matrix...", "Running Simulated Annealing...", "Tunneling through Local Minima...", "Finalizing Global Optimum..."];
    for (let i = 0; i < 4; i++) {
        await new Promise(r => setTimeout(r, 600));
        setProgress((i + 1) * 25);
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      const response = await fetch(`${apiUrl}/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tickers: tickers,
          risk_aversion: mode === "conservative" ? 2.0 : 0.1,
          num_slices: 20
        })
      });

      if (!response.ok) {
        throw new Error("Optimization failed. Check API connection.");
      }

      const data = await response.json();
      
      // Mock Efficient Frontier Data (since backend doesn't send it yet)
      const mockFrontier = Array.from({ length: 50 }, () => ({
        vol: Math.random() * 0.5 + 0.1, // 10% to 60%
        ret: Math.random() * 0.6 + 0.05, // 5% to 65%
        sharpe: Math.random() * 2
      }));

      setResult({ ...data, efficient_frontier: mockFrontier });
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Prepare Chart Data
  const chartData = result 
    ? Object.entries(result.allocation)
        .filter(([_, value]) => value > 0.01)
        .map(([name, value]) => ({ name, value: value * 100 })) 
    : [];
    
  // Prepare Scatter Data
  const scatterData = result ? [
     ...result.efficient_frontier!.map(p => ({ x: p.vol * 100, y: p.ret * 100, z: p.sharpe, type: 'Simulated' })),
     { x: result.metrics.volatility * 100, y: result.metrics.expected_return * 100, z: 10, type: 'Optimized (You)' }
  ] : [];

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans selection:bg-purple-500 selection:text-white">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <header className="text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="flex justify-between w-full items-center px-4">
                 <div className="inline-flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-full border border-slate-800 shadow-lg shadow-purple-900/20">
                    <Cpu className="w-5 h-5 text-purple-400" />
                    <span className="text-sm font-medium text-purple-200">Quantum-Dynamic Rebalancing Engine</span>
                 </div>
                 
                 <div className="flex gap-3">
                    {!isLoggedIn ? (
                        <button onClick={handleLogin} className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2">
                            Login
                        </button>
                    ) : (
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-400">Olá, Investidor</span>
                            {userPlan === 'free' && (
                                <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="text-xs bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-3 py-1 rounded-full font-bold animate-pulse">
                                    SEJA PRO
                                </button>
                            )}
                        </div>
                    )}
                 </div>
            </div>

            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mt-4">
            Otimize sua Carteira com Física Quântica
          </h1>
          </motion.div>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Fuja da paralisia de análise. Nosso algoritmo de inspiração quântica encontra o equilíbrio matemático perfeito entre risco e retorno em milissegundos.
          </p>
          
          {/* Disclaimer Banner */}
          {showDisclaimer && (
            <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="max-w-3xl mx-auto mt-6 bg-yellow-900/20 border border-yellow-700/50 p-4 rounded-xl flex items-start gap-3 text-left"
            >
                <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                <div className="text-sm text-yellow-200/80">
                    <p className="font-bold text-yellow-500 mb-1">Aviso Legal & Isenção de Responsabilidade</p>
                    <p>
                        Este sistema é uma <strong>ferramenta de análise quantitativa</strong> baseada em dados históricos e modelos matemáticos (Markowitz + Simulated Annealing). 
                        As "recomendações" geradas são sugestões de otimização matemática e <strong>NÃO constituem consultoria financeira ou garantia de lucro</strong>.
                        O mercado é volátil e rentabilidade passada não garante resultados futuros. Use estas informações como suporte à decisão, não como verdade absoluta.
                    </p>
                    <button onClick={() => setShowDisclaimer(false)} className="mt-2 text-xs underline hover:text-yellow-400">Entendi, fechar aviso.</button>
                </div>
            </motion.div>
          )}
        </header>

        {/* Input Section */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-8"
        >
          {/* Configuration Card */}
          <div className="md:col-span-1 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" /> Configuração
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Seus Ativos</label>
                
                {/* Ticker Input & Add Button */}
                <div className="flex gap-2 mb-3">
                  <input 
                    type="text"
                    value={newTicker}
                    onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTicker()}
                    placeholder="Símbolo (ex: PETR4, BTC-USD)"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none uppercase placeholder:normal-case"
                  />
                  <button 
                    onClick={handleAddTicker}
                    className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-lg border border-slate-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* Popular Chips */}
                <div className="flex flex-wrap gap-2 mb-2">
                    {["BTC-USD", "ETH-USD", "SPY", "QQQ", "GLD"].map(t => (
                        !tickers.includes(t) && (
                            <button 
                                key={t}
                                onClick={() => setTickers([...tickers, t])}
                                className="text-xs bg-slate-900/50 hover:bg-slate-800 border border-slate-800 rounded-full px-3 py-1 text-slate-400 transition-colors"
                            >
                                + {t}
                            </button>
                        )
                    ))}
                </div>
                
                {/* Ticker Tip */}
                <p className="text-[10px] text-slate-500 mb-4 px-1">
                    <Info className="w-3 h-3 inline mr-1" />
                    Dica: Para ações do Brasil use <strong>.SA</strong> (ex: PETR4.SA). Para Cripto use <strong>-USD</strong> (ex: BTC-USD).
                </p>

                {/* Ticker Tags */}
                <div className="flex flex-wrap gap-2 min-h-[80px] p-3 bg-slate-950/50 border border-slate-800 rounded-lg">
                    {tickers.length === 0 && <span className="text-slate-600 text-sm italic">Nenhum ativo selecionado...</span>}
                    {tickers.map(ticker => (
                        <span key={ticker} className="inline-flex items-center gap-1 bg-purple-900/20 text-purple-200 border border-purple-500/30 px-3 py-1 rounded-md text-sm">
                            {ticker}
                            <button onClick={() => handleRemoveTicker(ticker)} className="hover:text-purple-100"><X className="w-3 h-3" /></button>
                        </span>
                    ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Valor Total do Investimento (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-500 text-sm">R$</span>
                  <input 
                    type="number"
                    value={investment}
                    onChange={(e) => setInvestment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 pl-9 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    placeholder="10000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-3">Modo de Operação</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setMode("conservative")}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      mode === "conservative" 
                        ? "bg-purple-600 border-purple-500 text-white" 
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    <Shield className="w-4 h-4 mb-1 mx-auto" />
                    Conservador
                  </button>
                  <button
                    onClick={() => setMode("aggressive")}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      mode === "aggressive" 
                        ? "bg-pink-600 border-pink-500 text-white" 
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 mb-1 mx-auto" />
                    Agressivo
                  </button>
                </div>
              </div>

              <button
                onClick={handleOptimize}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Activity className="w-5 h-5 animate-pulse" />
                    Processando... {progress}%
                  </>
                ) : (
                  <>
                    <Cpu className="w-5 h-5" />
                    Otimizar Agora
                  </>
                )}
              </button>
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            </div>
          </div>

          {/* Visualization Area */}
          <div className="md:col-span-2 space-y-6">
            {!result ? (
              <div className="h-full flex flex-col items-center justify-center bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed min-h-[400px]">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-slate-500">Aguardando dados para simulação...</p>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* Missing Tickers Warning */}
                {result.metadata.missing_tickers && (
                    <div className="bg-orange-900/20 border border-orange-700/50 p-3 rounded-lg flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                        <div className="text-sm text-orange-200/80">
                            <p className="font-bold text-orange-500 text-xs uppercase">Ativos Não Encontrados</p>
                            <p className="text-xs">Os seguintes ativos não retornaram dados e foram ignorados: <strong className="text-white">{result.metadata.missing_tickers}</strong>. Verifique se o sufixo está correto (ex: .SA).</p>
                        </div>
                    </div>
                )}

                {/* Metrics Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <MetricCard 
                    label="Risco (Volatilidade)" 
                    value={`${(result.metrics.volatility * 100).toFixed(2)}%`}
                    trend="Baixo"
                    color="text-green-400"
                  />
                  <MetricCard 
                    label="Retorno Esperado" 
                    value={`${(result.metrics.expected_return * 100).toFixed(2)}%`}
                    trend="Alto"
                    color="text-blue-400"
                  />
                  <MetricCard 
                    label="Sharpe Ratio" 
                    value={result.metrics.sharpe_ratio.toFixed(2)}
                    trend="Eficiente"
                    color="text-purple-400"
                  />
                </div>

                {/* Charts & Action Plan */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Allocation Chart */}
                  <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-purple-400" /> Alocação Otimizada
                    </h3>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                            itemStyle={{ color: '#e2e8f0' }}
                            formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Peso']}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Efficient Frontier Chart (New Feature) */}
                  <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 relative overflow-hidden group">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Flame className="w-5 h-5 text-orange-400" /> Fronteira Eficiente (Risco x Retorno)
                    </h3>
                    
                    {userPlan === 'free' && (
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 transition-opacity">
                             <Lock className="w-10 h-10 text-slate-600 mb-2" />
                             <p className="text-slate-300 font-semibold mb-1">Feature Pro</p>
                             <p className="text-xs text-slate-500 max-w-[200px] text-center mb-3">Desbloqueie a visualização avançada de risco x retorno.</p>
                             <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-full transition-colors">
                                 Fazer Upgrade
                             </button>
                        </div>
                    )}

                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                          <XAxis type="number" dataKey="x" name="Risco" unit="%" stroke="#94a3b8" />
                          <YAxis type="number" dataKey="y" name="Retorno" unit="%" stroke="#94a3b8" />
                          <ZAxis type="number" dataKey="z" range={[50, 400]} />
                          <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                          <Scatter name="Portfolios" data={scatterData} fill="#8884d8">
                            {scatterData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.type === 'Optimized (You)' ? '#4ade80' : '#64748b'} />
                            ))}
                          </Scatter>
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Action List (Full Width) */}
                  <div className="md:col-span-2 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 overflow-hidden">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-400" /> Plano de Execução (Sugestão Algorítmica)
                    </h3>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {/* Header da Tabela */}
                      <div className="grid grid-cols-12 gap-4 text-xs font-medium text-slate-500 uppercase px-3 mb-2">
                        <div className="col-span-3">Ativo</div>
                        <div className="col-span-3 text-center">De (R$)</div>
                        <div className="col-span-1"></div>
                        <div className="col-span-3 text-center">Para (R$)</div>
                        <div className="col-span-2 text-right">
                            <span className="flex items-center gap-1 justify-end cursor-help" title="Baseado na otimização de Variância Mínima">
                                Sinal <Info className="w-3 h-3" />
                            </span>
                        </div>
                      </div>

                      {chartData
                           .map(item => {
                               // Simula carteira inicial igualitária (1/N) para gerar recomendações de rebalanceamento
                               // Em produção, isso viria do input do usuário
                               const currentWeight = 100 / tickers.length; 
                               const diff = item.value - currentWeight;
                               return { ...item, currentWeight, diff };
                           })
                        .sort((a, b) => b.diff - a.diff) // Ordenar por maior mudança (Compra -> Venda)
                        .map((item, idx) => {
                            const isBuy = item.diff > 1; // Margem de 1%
                            const isSell = item.diff < -1;
                            const isHold = !isBuy && !isSell;
                            const totalInv = parseFloat(investment) || 0;
                            const currentValue = (item.currentWeight / 100) * totalInv;
                            const targetValue = (item.value / 100) * totalInv;
                            
                            return (
                                <div key={idx} className="grid grid-cols-12 gap-4 items-center p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:bg-slate-800 transition-colors">
                                    <div className="col-span-3 flex items-center gap-3">
                                        <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                        <div>
                                            <p className="font-bold text-sm">{item.name}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="col-span-3 text-center font-mono text-slate-400 text-xs">
                                        <div className="font-bold">R$ {currentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                        <div className="text-[10px] opacity-60">({item.currentWeight.toFixed(1)}%)</div>
                                    </div>
                                    
                                    <div className="col-span-1 flex justify-center">
                                        <ArrowRight className="w-4 h-4 text-slate-600" />
                                    </div>
                                    
                                    <div className="col-span-3 text-center font-mono font-bold text-white text-xs">
                                        <div className="text-green-300">R$ {targetValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                        <div className="text-[10px] opacity-60">({item.value.toFixed(1)}%)</div>
                                    </div>
                                    
                                    <div className="col-span-2 text-right">
                                        {isBuy && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">
                                                COMPRAR
                                            </span>
                                        )}
                                        {isSell && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20">
                                                VENDER
                                            </span>
                                        )}
                                        {isHold && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-500/10 text-slate-400 text-xs font-bold border border-slate-500/20">
                                                MANTER
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        
                        {/* Itens que devem ser Zerados (Venda Total) - Lógica Extra */}
                         {tickers
                            .filter(t => !chartData.find(c => c.name === t))
                            .map((ticker, idx) => {
                             // Fix: Correctly calculate initial weight based on number of input tickers
                             const currentWeight = 100 / tickers.length;
                             const totalInv = parseFloat(investment) || 0;
                             const currentValue = (currentWeight / 100) * totalInv;
                              return (
                                 <div key={`sell-all-${idx}`} className="grid grid-cols-12 gap-4 items-center p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:bg-slate-800 transition-colors opacity-75">
                                     <div className="col-span-3 flex items-center gap-3">
                                         <div className="w-1.5 h-8 rounded-full bg-slate-600" />
                                         <div>
                                             <p className="font-bold text-sm text-slate-400">{ticker}</p>
                                         </div>
                                     </div>
                                     <div className="col-span-3 text-center font-mono text-slate-400 text-xs">
                                         <div className="font-bold">R$ {currentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                         <div className="text-[10px] opacity-60">({currentWeight.toFixed(1)}%)</div>
                                     </div>
                                     <div className="col-span-1 flex justify-center"><ArrowRight className="w-4 h-4 text-slate-600" /></div>
                                     <div className="col-span-3 text-center font-mono font-bold text-slate-500 text-xs">
                                         <div>R$ 0,00</div>
                                         <div className="text-[10px] opacity-60">(0.0%)</div>
                                     </div>
                                     <div className="col-span-2 text-right">
                                         <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-900/20 text-red-400 text-xs font-bold border border-red-900/30">
                                             VENDER TUDO
                                         </span>
                                     </div>
                                 </div>
                              )
                         })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* Pricing Section */}
        <section id="pricing" className="py-12 border-t border-slate-900">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">Planos Flexíveis</h2>
                <p className="text-slate-400">Comece grátis e escale seus investimentos com inteligência quântica.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {/* Free Plan */}
                <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-8 hover:border-slate-700 transition-colors relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                        Iniciante
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Free</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-4xl font-bold text-white">R$ 0</span>
                        <span className="text-slate-500">/mês</span>
                    </div>
                    <ul className="space-y-4 mb-8 text-sm text-slate-400">
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Otimização Básica (Markowitz)</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Até 5 Ativos</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Rebalanceamento Mensal</li>
                        <li className="flex items-center gap-2 opacity-50"><X className="w-4 h-4" /> Sem Alertas em Tempo Real</li>
                        <li className="flex items-center gap-2 opacity-50"><X className="w-4 h-4" /> Sem Suporte Prioritário</li>
                    </ul>
                    <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors">
                        Começar Agora
                    </button>
                </div>

                {/* Pro Plan */}
                <div className="bg-slate-900/80 border border-purple-500/50 rounded-2xl p-8 relative shadow-2xl shadow-purple-900/20 transform scale-105">
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
                        Mais Popular
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Trader Pro</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-4xl font-bold text-white">R$ 49</span>
                        <span className="text-slate-500">/mês</span>
                    </div>
                    <ul className="space-y-4 mb-8 text-sm text-slate-300">
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-400" /> <strong>Quantum Annealing</strong> (Simulado)</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-400" /> Ativos Ilimitados</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-400" /> Fronteira Eficiente Dinâmica</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-400" /> Alertas via Telegram/Email</li>
                    </ul>
                    <button 
                        onClick={handleUpgrade}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2"
                    >
                        <CreditCard className="w-4 h-4" /> Assinar Pro
                    </button>
                    <p className="text-center text-xs text-slate-500 mt-3">Cancelamento a qualquer momento.</p>
                </div>

                {/* Wealth Plan */}
                <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-8 hover:border-slate-700 transition-colors">
                    <h3 className="text-xl font-bold text-white mb-2">Wealth</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-4xl font-bold text-white">R$ 149</span>
                        <span className="text-slate-500">/mês</span>
                    </div>
                    <ul className="space-y-4 mb-8 text-sm text-slate-400">
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-500" /> Tudo do Plano Pro</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-500" /> API de Execução Automática</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-500" /> Consultoria Trimestral</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-500" /> Acesso Antecipado a Features</li>
                    </ul>
                    <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors">
                        Falar com Vendas
                    </button>
                </div>
            </div>
        </section>

      </div>
    </div>
  );
}

function MetricCard({ label, value, trend, color }: { label: string, value: string, trend: string, color: string }) {
  return (
    <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800">
      <p className="text-slate-400 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className={`text-xs font-medium mt-2 ${color} flex items-center gap-1`}>
        {trend}
      </p>
    </div>
  );
}
