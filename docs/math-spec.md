# Especificação Matemática — Cat Fortune

## 1. Estrutura da grade

- 3 colunas (rolos), 3 linhas → grade 3×3
- 5 linhas de pagamento **fixas** (sempre ativas)
- Aposta total = aposta por linha × 5

### Paylines

| ID | Posições (linha, coluna) | Descrição |
|----|--------------------------|-----------|
| 1  | (1,0)(1,1)(1,2)          | Linha central |
| 2  | (0,0)(0,1)(0,2)          | Linha superior |
| 3  | (2,0)(2,1)(2,2)          | Linha inferior |
| 4  | (0,0)(1,1)(2,2)          | Diagonal ↘ |
| 5  | (2,0)(1,1)(0,2)          | Diagonal ↗ |

## 2. Símbolos e paytable

Pagamento por 3 iguais em uma linha, em **múltiplos da aposta por linha**:

| Símbolo | Código | Pagamento (×line bet) |
|---------|--------|------------------------|
| Gato (WILD)     | W | 500 |
| Moeda           | C | 200 |
| Açaí            | A | 75  |
| Café            | F | 30  |
| Pitanga         | P | 12  |
| Limão           | L | 5   |
| Carambola       | X | 2   |

WILD substitui qualquer símbolo. WILD também paga combinação própria.

## 3. Reel strips

Cada rolo tem o mesmo strip de 40 posições (composição uniforme entre os 3 rolos):

| Símbolo    | Quantidade | Probabilidade marginal |
|------------|-----------:|------------------------:|
| WILD       | 1          | 2,50% |
| Moeda      | 2          | 5,00% |
| Açaí       | 4          | 10,00% |
| Café       | 6          | 15,00% |
| Pitanga    | 8          | 20,00% |
| Limão      | 9          | 22,50% |
| Carambola  | 10         | 25,00% |
| **Total**  | **40**     | **100%** |

## 4. Probabilidades por linha (3-de-um-tipo)

Como os 3 símbolos de uma linha vêm de 3 rolos independentes, e cada cell tem distribuição marginal definida pela composição:

P(3 de símbolo `s`, com WILD substituindo) = ((w_s + w_W) / N)³ − (w_W / N)³

Para WILD próprio: P(3 WILDs) = (w_W / N)³ = (1/40)³ ≈ 0,0015625%

### Contribuição teórica por linha (× line bet)

| Símbolo | Prob. de combo | × Pagamento | EV por linha |
|---------|---------------:|------------:|-------------:|
| WILD    | 0,000016       | 500         | 0,0078       |
| Moeda   | 0,000406       | 200         | 0,0813       |
| Açaí    | 0,001937       | 75          | 0,1453       |
| Café    | 0,005343       | 30          | 0,1603       |
| Pitanga | 0,011359       | 12          | 0,1363       |
| Limão   | 0,015609       | 5           | 0,0780       |
| Carambola | 0,020779     | 2           | 0,0416       |
| **Soma** |               |             | **≈ 0,6506** |

### RTP do jogo base

RTP_base = (EV_por_linha × 5 linhas) / aposta_total
       = (0,6506 × 5 × line_bet) / (5 × line_bet)
       = **≈ 65,1%** (validado via Monte Carlo)

## 5. Bônus: Respins de Símbolo Sticky

### Gatilho
- Probabilidade fixa por giro: **1,45%**
- Não depende de combinação na tela base
- Trigger é independente de win/loss da rodada base

### Seleção do símbolo do bônus
Aleatória ponderada (bias leve em direção a símbolos de baixo pagamento, gerando bônus frequentes mas com cauda longa em high-value):

| Símbolo | Peso | Probabilidade |
|---------|-----:|--------------:|
| Moeda     | 2  | 6,45%  |
| Açaí      | 3  | 9,68%  |
| Café      | 5  | 16,13% |
| Pitanga   | 6  | 19,35% |
| Limão     | 7  | 22,58% |
| Carambola | 8  | 25,81% |

Total de pesos = 31. Média ponderada de payout base do feature ≈ 29× line bet.

### Loop de respins
1. Tela inicia vazia (9 cells em branco)
2. A cada respin, cada cell vazia rola:
   - **Branco**: 75%
   - **Feature**: 20%
   - **WILD**: 5%
3. Cells preenchidas ficam **sticky** (não giram mais)
4. Se nenhuma cell nova foi preenchida no respin, o bônus encerra
5. Se a tela ficar completa (9/9), o bônus encerra com multiplicador
6. Limite duro: 10 respins (proteção; matematicamente improvável atingir)

### Pagamento do bônus
Sendo `B` = pagamento base do feature em paytable (× line bet), `f` = cells preenchidas no fim:

| Condição | Pagamento |
|----------|-----------|
| f < 3    | 0 |
| 3 ≤ f ≤ 8 | B × (f / 3) × line_bet |
| f = 9 (tela cheia) | B × 3 × **10** × line_bet |

Exemplo: feature = Pitanga (B=12), f=6 cells → payout = 12 × 2 × line_bet = 24 × line_bet
Exemplo: feature = Moeda (B=200), f=9 (tela cheia) → payout = 200 × 3 × 10 × line_bet = 6000 × line_bet = **1200× aposta total**

### Contribuição esperada do bônus
Validada via Monte Carlo (5M spins): **~31,65% RTP**. Aproximadamente 7,5% dos bônus resultam em tela cheia.

## 6. Métricas validadas (Monte Carlo 5M spins)

| Métrica | Valor medido | Alvo |
|---------|-------------:|-----:|
| RTP total              | **96,76%** | 96,00% (±1%) |
| RTP base               | 65,11%     | 65,1% |
| RTP bônus              | 31,65%     | ~31% |
| Hit rate (qualquer win) | 22,66%    | informativo |
| Frequência bônus       | 1,45%      | 1,45% |
| % bônus = tela cheia   | 7,48%      | informativo |
| Ganho máximo observado | 1280× bet  | ≤1200× teórico (variação) |

## 7. Como ajustar o RTP

Para subir/descer o RTP-alvo, na ordem de menor para maior impacto:

1. **Ajustar pagamento de um símbolo low-pay** (Carambola, Limão) — afeta RTP base linearmente
2. **Ajustar peso de feature no bônus** (`FEATURE_PICK_WEIGHTS` em `bonus.js`) — muda payout esperado do bônus
3. **Ajustar `BONUS_TRIGGER_PROBABILITY`** — afeta RTP de bônus proporcionalmente (controle mais limpo)
4. **Ajustar `BONUS_CELL_WEIGHTS`** — muda cells médias preenchidas, efeito altamente não-linear (sticky compounding)
5. **Ajustar composição dos rolos** — refaz toda a base, requer recalcular a tabela acima

Sempre rode `npm run simulate` (1M+ spins) após ajustes. Variância de slot com jackpot é alta; **rode 5M+ para validação confiável** e 100M+ para validação regulatória.

## 8. RNG

Backend: `crypto.randomInt` (Node.js, baseado em `getrandom`/`CryptoGenRandom`). Não há semente exposta nem reprodutibilidade de spin — cada spin é independente.

**Importante**: o RNG roda exclusivamente no servidor. O cliente apenas exibe o resultado. Nenhuma decisão de payout depende do código do cliente.
