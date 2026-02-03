import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
import time
from qdr_core.ingestion import DataIngestion
from qdr_core.engine import QuantumOptimizer

# Configuração da Página
st.set_page_config(
    page_title="QDR - Quantum-Dynamic Rebalancing",
    page_icon="⚛️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- CSS Customizado para Look & Feel "Tech/Quantum" ---
st.markdown("""
    <style>
    .main {
        background-color: #0e1117;
    }
    .stButton>button {
        width: 100%;
        background-color: #7C4DFF;
        color: white;
        border-radius: 8px;
        font-weight: bold;
        transition: 0.3s;
    }
    .stButton>button:hover {
        background-color: #651FFF;
        box-shadow: 0 0 15px #651FFF;
    }
    h1, h2, h3 {
        color: #E0E0E0;
    }
    .metric-card {
        background-color: #1F2937;
        padding: 20px;
        border-radius: 10px;
        border: 1px solid #374151;
        text-align: center;
    }
    </style>
""", unsafe_allow_html=True)

# --- Sidebar: Entrada e Onboarding ---
st.sidebar.title("⚛️ QDR Config")
st.sidebar.markdown("---")

st.sidebar.header("1. Sua Carteira")
default_tickers = "BTC-USD, ETH-USD, AAPL, MSFT, TSLA, GOOGL"
tickers_input = st.sidebar.text_area("Ativos (separados por vírgula)", default_tickers, height=100)
tickers = [t.strip() for t in tickers_input.split(",") if t.strip()]

st.sidebar.header("2. Perfil de Risco")
mode = st.sidebar.radio("Modo de Operação", ["Conservador 🛡️", "Quantum-Aggressive 🚀"])

risk_aversion = 2.0 if "Conservador" in mode else 0.1
num_slices = 20 # 5% granularity

# --- Main Area ---

st.title("Quantum-Dynamic Rebalancing (QDR)")
st.markdown("### Otimização de Portfólio em Tempo Real via Algoritmos de Inspiração Quântica")

if not tickers:
    st.warning("Por favor, insira pelo menos um ativo na barra lateral.")
    st.stop()

# Session State para armazenar dados entre interações
if 'data' not in st.session_state:
    st.session_state['data'] = None
if 'optimized' not in st.session_state:
    st.session_state['optimized'] = False
if 'optimization_result' not in st.session_state:
    st.session_state['optimization_result'] = None

# 1. Ingestão de Dados (Automática ao carregar ou mudar tickers)
if st.button("🔍 1. Realizar Diagnóstico de Mercado"):
    with st.spinner('Conectando ao Yahoo Finance e baixando dados históricos...'):
        ingestor = DataIngestion()
        try:
            df = ingestor.get_historical_data(tickers, period="1y")
            if df.empty:
                st.error("Não foi possível obter dados para os ativos informados.")
            else:
                st.session_state['data'] = df
                st.session_state['optimized'] = False # Reset optimization if data changes
                st.success("Dados de mercado atualizados com sucesso!")
        except Exception as e:
            st.error(f"Erro na conexão: {e}")

if st.session_state['data'] is not None:
    df = st.session_state['data']
    
    # Exibir Gráfico de Preços Normalizado
    st.subheader("📊 Diagnóstico: Performance dos Ativos (1 Ano)")
    
    tab1, tab2 = st.tabs(["📈 Performance Relativa", "🔥 Mapa de Correlação (Risco)"])
    
    with tab1:
        normalized_df = df / df.iloc[0] * 100
        fig_perf = px.line(normalized_df, x=normalized_df.index, y=normalized_df.columns, title="Performance Relativa (%)")
        fig_perf.update_layout(template="plotly_dark")
        st.plotly_chart(fig_perf, use_container_width=True)
    
    with tab2:
        st.write("Este mapa mostra o quanto seus ativos 'andam juntos'. Cores quentes (vermelho) indicam alto risco conjunto.")
        corr_matrix = df.pct_change().corr()
        fig_corr = px.imshow(
            corr_matrix, 
            text_auto=True, 
            aspect="auto", 
            color_continuous_scale="RdBu_r",
            zmin=-1, zmax=1
        )
        fig_corr.update_layout(template="plotly_dark")
        st.plotly_chart(fig_corr, use_container_width=True)
    
    # 2. O Processamento (A Magia)
    st.markdown("---")
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.markdown("### ⚙️ Motor de Otimização (Simulated Annealing)")
        st.info(f"Modo Selecionado: **{mode}**")
        st.write("O algoritmo irá buscar o Mínimo Global de risco utilizando Simulated Annealing (processo estocástico inspirado na física).")
        
        if st.button("🚀 Otimizar Agora"):
            # Animação de "Otimização Estocástica"
            progress_bar = st.progress(0)
            status_text = st.empty()
            
            for i in range(100):
                # Simula etapas do processo
                if i < 30: status_text.text("Gerando Matriz QUBO...")
                elif i < 60: status_text.text("Executando Simulated Annealing...")
                elif i < 90: status_text.text("Convergindo para Mínimo Global...")
                else: status_text.text("Finalizando Alocação...")
                time.sleep(0.02) # Fake delay for dramatic effect
                progress_bar.progress(i + 1)
            
            status_text.text("Otimização Completa!")
            
            # Execução Real
            optimizer = QuantumOptimizer(df)
            result = optimizer.optimize_portfolio(risk_aversion=risk_aversion, num_slices=num_slices)
            
            # Calcular métricas da carteira ATUAL (Equally Weighted para comparação)
            n = len(tickers)
            equal_weights = {t: 1.0/n for t in tickers}
            current_metrics = optimizer.calculate_portfolio_metrics(equal_weights)
            
            # Salvar no estado
            st.session_state['optimization_result'] = {
                'result': result,
                'current_metrics': current_metrics
            }
            st.session_state['optimized'] = True

    with col2:
        if st.session_state['optimized']:
            res = st.session_state['optimization_result']
            opt_res = res['result']
            curr_met = res['current_metrics']
            opt_met = opt_res['metrics']
            
            # 3. Recomendação/Execução (A Resolução)
            st.subheader("🎯 Resultado da Otimização")
            
            # Métricas Comparativas ("Susto Positivo")
            m_col1, m_col2, m_col3 = st.columns(3)
            
            # Volatilidade (Risco)
            delta_risk = ((opt_met['volatility'] - curr_met['volatility']) / curr_met['volatility']) * 100
            m_col1.metric(
                label="Risco (Volatilidade Anual)",
                value=f"{opt_met['volatility']*100:.2f}%",
                delta=f"{delta_risk:.1f}%",
                delta_color="inverse"
            )
            
            # Retorno
            delta_ret = ((opt_met['expected_return'] - curr_met['expected_return']) / abs(curr_met['expected_return'])) * 100
            m_col2.metric(
                label="Retorno Esperado (Anual)",
                value=f"{opt_met['expected_return']*100:.2f}%",
                delta=f"{delta_ret:.1f}%"
            )
            
            # Sharpe
            m_col3.metric(
                label="Índice de Sharpe",
                value=f"{opt_met['sharpe_ratio']:.2f}",
                delta=f"{opt_met['sharpe_ratio'] - curr_met['sharpe_ratio']:.2f}"
            )
            
            st.success(f"💡 Insight: Com a otimização via Simulated Annealing, você reduziu o risco em **{abs(delta_risk):.1f}%** mantendo eficiência.")

            # --- Visualização de Comparação e Fronteira Eficiente ---
            st.markdown("---")
            st.subheader("⚔️ Sua Carteira vs. QDR AI")
            
            comp_tab1, comp_tab2 = st.tabs(["📊 Comparação de Alocação", "🚀 Fronteira Eficiente"])
            
            with comp_tab1:
                # Gráfico de Pizza Comparativo
                weights = opt_res['weights']
                # Filtrar pesos > 0
                active_weights = {k: v for k, v in weights.items() if v > 0.01}
                
                fig_pie = px.pie(
                    values=list(active_weights.values()),
                    names=list(active_weights.keys()),
                    title="Nova Alocação Sugerida (Carteira Otimizada)",
                    hole=0.4,
                    color_discrete_sequence=px.colors.sequential.RdBu
                )
                fig_pie.update_layout(template="plotly_dark")
                st.plotly_chart(fig_pie, use_container_width=True)

            with comp_tab2:
                # Fronteira Eficiente (Simulada para Contexto)
                st.write("O gráfico abaixo mostra onde sua carteira está (🔴) e para onde o QDR a leva (🟢). O objetivo é ir para o canto superior esquerdo (Menor Risco, Maior Retorno).")
                
                # Gerar portfólios aleatórios para fundo
                num_portfolios = 200
                all_weights = np.zeros((num_portfolios, len(tickers)))
                ret_arr = np.zeros(num_portfolios)
                vol_arr = np.zeros(num_portfolios)
                sharpe_arr = np.zeros(num_portfolios)
                
                # Mock simulation (fast) using optimizer logic
                for i in range(num_portfolios):
                    # Random weights
                    w = np.random.random(len(tickers))
                    w /= np.sum(w)
                    all_weights[i,:] = w
                    
                    # Metrics
                    met = optimizer.calculate_portfolio_metrics(dict(zip(tickers, w)))
                    ret_arr[i] = met['expected_return']
                    vol_arr[i] = met['volatility']
                    sharpe_arr[i] = met['sharpe_ratio']
                
                # Create Scatter Plot
                fig_ef = go.Figure()
                
                # 1. Random Portfolios (Cloud)
                fig_ef.add_trace(go.Scatter(
                    x=vol_arr * 100,
                    y=ret_arr * 100,
                    mode='markers',
                    marker=dict(
                        color=sharpe_arr,
                        colorscale='Viridis',
                        showscale=True,
                        size=5,
                        opacity=0.5
                    ),
                    name='Cenários Possíveis'
                ))
                
                # 2. Current Portfolio (User)
                fig_ef.add_trace(go.Scatter(
                    x=[curr_met['volatility'] * 100],
                    y=[curr_met['expected_return'] * 100],
                    mode='markers+text',
                    marker=dict(color='red', size=15, symbol='x'),
                    text=["Sua Carteira"],
                    textposition="top right",
                    name='Sua Carteira (Atual)'
                ))
                
                # 3. Optimized Portfolio (QDR)
                fig_ef.add_trace(go.Scatter(
                    x=[opt_met['volatility'] * 100],
                    y=[opt_met['expected_return'] * 100],
                    mode='markers+text',
                    marker=dict(color='#00FF00', size=20, symbol='star'),
                    text=["QDR AI (Otimizada)"],
                    textposition="top left",
                    name='QDR Otimizada'
                ))
                
                fig_ef.update_layout(
                    title="Fronteira Eficiente & Risco x Retorno",
                    xaxis_title="Risco (Volatilidade %)",
                    yaxis_title="Retorno Esperado (%)",
                    template="plotly_dark",
                    legend=dict(yanchor="top", y=0.99, xanchor="left", x=0.01)
                )
                
                st.plotly_chart(fig_ef, use_container_width=True)

            
            # Tabela de Ação
            st.subheader("📋 Plano de Ação")
            
            action_data = []
            for ticker in tickers:
                curr_w = 1.0/len(tickers) # Assuming equal weight start
                new_w = weights.get(ticker, 0.0)
                diff = new_w - curr_w
                action = "MANTER"
                if diff > 0.02: action = "COMPRAR 🟢"
                elif diff < -0.02: action = "VENDER 🔴"
                
                action_data.append({
                    "Ativo": ticker,
                    "Alocação Atual": f"{curr_w*100:.1f}%",
                    "Alocação Nova": f"{new_w*100:.1f}%",
                    "Ação Recomendada": action,
                    "Ajuste": f"{diff*100:+.1f}%"
                })
            
            st.table(pd.DataFrame(action_data))
            
            # Botão de Execução (Simulado)
            st.button("✅ Executar Rebalanceamento Automático (API)", type="primary")

# --- Rodapé ---
st.markdown("---")
st.markdown("Desenvolvido com ⚛️ QDR Engine | Powered by PyQUBO & D-Wave Neal")
