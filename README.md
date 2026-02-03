# Quantum-Dynamic Rebalancing (QDR)

Projeto de otimização de portfólio utilizando algoritmos de inspiração quântica (Simulated Annealing) para rodar em hardware clássico com custo zero.

## Estrutura

- `qdr_core/`: Núcleo do sistema.
  - `ingestion.py`: Coleta de dados financeiros (Yahoo Finance).
  - `engine.py`: Motor de otimização usando PyQUBO e Neal (D-Wave).
- `main.py`: API FastAPI para expor o serviço (Serverless-ready).
- `demo_script.py`: Script para testar a lógica localmente via terminal.

## Como Rodar

1. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```

2. Execute a demonstração:
   ```bash
   python demo_script.py
   ```

3. (Opcional) Inicie a API:
   ```bash
   python main.py
   ```
   Acesse a documentação automática em: `http://localhost:8000/docs`

## Tecnologia

- **Linguagem**: Python 3.10+
- **Bibliotecas Quânticas**: PyQUBO, Neal (D-Wave Ocean SDK)
- **Dados**: Yahoo Finance (yfinance)
- **API**: FastAPI

## Diferencial

Utiliza o modelo QUBO (Quadratic Unconstrained Binary Optimization) para encontrar a melhor alocação de ativos, minimizando a variância (risco) e maximizando o retorno esperado, escapando de mínimos locais através de flutuações térmicas simuladas (Simulated Annealing).
