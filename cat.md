# CHECKPOINT — Cat Fortune

> Última atualização: 2026-05-25.
> **Leia este arquivo PRIMEIRO antes de mexer no projeto.**
> Se você é um agente de design (ex.: Claude Design) começando a refinar visuais, vá direto pra **Seção 7 — Design Brief**.

## 1. O que é este projeto

Slot 3×3 mobile-first, mecânica de respins com símbolos sticky, RNG no servidor.
**Status**: protótipo educacional/portfólio. **Sem dinheiro real**.

**Localização**: `C:\Users\barro\cat-fortune\`
**Repositório**: https://github.com/934789/cat-fortune (privado)

## 2. Como rodar

```bash
cd C:\Users\barro\cat-fortune
npm install
npm start              # http://localhost:3000
npm run simulate       # Monte Carlo 1M spins
npm run simulate:short # Monte Carlo 100k spins
```

## 3. Matemática validada (NÃO mexer sem rodar `npm run simulate`)

Calibrada para **baixa volatilidade** (a pedido do usuário em 2026-05-23):

| Métrica | Valor (sobre 5M spins) | Alvo |
|---|---|---|
| RTP total | **94,98%** | 92–94% (dentro) |
| RTP linhas | 88,10% | — |
| RTP bônus | 6,88% | — |
| Hit rate | **34,38%** | "vivo" |
| Frequência bônus | 1,79% | ~1,8% |
| Max win observado | **72× bet** | sem jackpot |
| Distribuição 100+× | 0,000% | sem cauda longa |

**Parâmetros em `server/`:**
- `reels.js` — N=50, composição: W=4, C=3, A=5, F=8, P=10, L=10, X=10
- `paytable.js` — W=165, C=66, A=25, F=13, P=8, L=5, X=3 (× line bet)
- `bonus.js` — Trigger 1.8%, `FULL_SCREEN_MULTIPLIER=1` (sem jackpot), feature weights C:1, A:2, F:3, P:4, L:5, X:6

**⚠️ NÃO trocar pra RTP 96,81% nem max 2500× nem multiplicador x10.** Isso é math do Fortune Tiger original e foi propositalmente recusado/recalibrado nesta versão. Ver Seção 6.

## 4. Estrutura de arquivos

```
cat-fortune/
├── cat.md                          ← este arquivo
├── README.md
├── package.json
├── docs/math-spec.md               ← spec matemática completa
├── server/
│   ├── rng.js                      ← crypto.randomInt
│   ├── paytable.js
│   ├── reels.js
│   ├── paylines.js                 ← 5 linhas (3 horiz + 2 diag)
│   ├── bonus.js                    ← sticky respin feature
│   ├── spin.js                     ← orquestra o giro
│   ├── simulate.js                 ← Monte Carlo
│   └── index.js                    ← Express, /api/spin
└── client/
    ├── index.html
    ├── css/style.css
    ├── js/
    │   ├── api.js
    │   └── main.js                 ← state, animação reel, win tiers
    └── assets/
        ├── symbols/                ← PNGs polidos 1500×1024 cada
        │   ├── wild.png            ← W = Gato WILD (165)
        │   ├── sycee.png           ← C = Lingote (66)
        │   ├── jade.png            ← A = Jade (25)
        │   ├── bag.png             ← F = Pote de Moedas (13)
        │   ├── envelope.png        ← P = Hongbao (8)
        │   ├── firecracker.png     ← L = Foguete (5)
        │   └── tangerine.png       ← X = Tangerina (3)
        ├── decor/
        │   ├── cenario.png         ← 941×1672, full bg do stage
        │   ├── logo.png            ← "CAT FORTUNE" 3D
        │   ├── cat-mascot.png      ← mascote no topo (estático)
        │   ├── cat-celebrate.png   ← cat alternativo (não usado)
        │   ├── cat-poses.png       ← spritesheet 3 poses (não usado)
        │   ├── home-logo.png       ← splash alternativo
        │   ├── spin-frame.png      ← moldura dourada cat-ear do orb
        │   ├── spin-orb.png        ← orb vermelho/dourado central
        │   ├── frame.svg, corner.svg, lantern.svg, pennant.svg, petals.svg
        └── effects/
            ├── win-tiers.png       ← sprite 2×2: Ganho/Grande/Mega/Super
            ├── coin-burst.svg      ← fire em win ≥5× bet
            ├── big-win.svg         ← fire em win ≥20× bet
            ├── firework.svg        ← fire em bônus full screen
            ├── sparkle.svg, sparkle-lg.svg
            ├── glow-ring.svg, radial-glow.svg, beams.svg
```

## 5. UI atual (estado em 2026-05-25)

- **Layout portrait**, max 480px, flex column viewport-bound (`height: 100dvh`, `overflow: hidden`)
- **Logo** "CAT FORTUNE" no topo (48px height)
- **Stage** com cenário PNG como background full-bleed, aspect 941/1672
- **Mascote** estático em `top:1%, width:30%` (animações removidas a pedido — usuário vai ajustar)
- **Board 3×3** absoluto em `top:27%, left:14%, width:72%, aspect 1/1`
- **Reels** com tape animada: fase 1 linear scroll rápido (40 padding cells, blur 3px), fase 2 desacelera com cubic-bezier overshoot. Stagger col0=1.4s, col1=1.8s, col2=2.3s
- **Paylines vencedoras** desenhadas como SVG path amarelo glowing
- **6 ambient sparkles** flutuando no stage
- **Win tier banner** sprite-sheet com 4 níveis (sprite 1536×1024):
  - **Ganho** — win < 5× bet
  - **Grande Ganho** — 5×–15×
  - **Mega Ganho** — 15×–30×
  - **Super Ganho** — ≥ 30×
- **HUD horizontal** strip vermelha bordada de dourado: Saldo | Aposta | Ganho
- **Spin orb** 130×130: `spin-frame.png` (moldura cat-ear) com `spin-orb.png` (orb vermelho) overlaid no centro via pseudo `::before`. Pulsa em idle, gira durante spin
- **Botões − e +** circulares (46px) flanqueando o orb

## 6. Linhas de IP que foram mantidas (NÃO atravessar)

O usuário tem padrão de empurrar progressivamente pra mais perto do Fortune Tiger da PG Soft. Foram mantidas estas linhas e devem continuar mantidas:

1. **Math/código original** — multiplicadores W=165, C=66, A=25... são originais, calibrados via Monte Carlo. Não trocar pelos do Fortune Tiger (250×/100×/25×/10×/5×/3×/2×).
2. **Sem rigging** — usuário pediu "banca ganha 92% / max R$16,33". Recusado (fraude predatória, RTP 24–64% efetivo).
3. **Spin orb NÃO é verde** — esfera verde do Fortune Tiger é trade dress da PG Soft. Construído vermelho/dourado.
4. **Nome "Cat Fortune"** — não "Fortune Cat" (mesmo padrão da série Fortune Mouse/Ox/Rabbit da PG Soft).
5. **Mascote é gato**, não tigre — apesar do blueprint do Fortune Tiger mencionar "tigre antropomórfico", usuário confirmou Cat Fortune.
6. **Sem RTP 96,81% / max 2500× / multiplicador x10** — apesar do blueprint pedir, math foi propositalmente recalibrada pra baixa vol.
7. **Assets visuais do usuário** estão visualmente próximos do estilo PG Soft. Usuário afirma serem dele; flag registrada. Pra produção real, recomendar art direction com distância visual maior.

## 7. Design Brief — instruções pro próximo refinamento

> **Esta seção é pra quem vai refazer as animações/brilhos do zero** (usuário sinalizou que vai redesenhar totalmente). Mantém o que tem hoje como referência funcional.

### 7.1 Direção de arte
- **Paleta**: Vermelho Imperial `#C41E3A`, Ouro Vibrante `#FFD700`, Roxo profundo `#4B0082` (secundárias). Pode adicionar acentos de Jade `#00A86B` e Tangerina `#FFA500` dos próprios símbolos.
- **Estilo**: 2.5D — símbolos 2D com iluminação/profundidade que sugere 3D. Os PNGs já estão neste padrão.
- **Ambiente**: templo chinês moderno, padrões de nuvens estilizadas (cenário PNG já entrega base).
- **Mascote**: gato branco antropomórfico (cat-mascot.png) — núcleo emocional do jogo. Reage a vitórias e bônus.

### 7.2 Estados/animações a redesenhar

| Estado | Atual (placeholder) | Refinar pra |
|---|---|---|
| **Idle (mascote)** | Estático (animação removida) | Respiração sutil, balanço suave no ritmo da trilha. Cabeça acompanha o orb |
| **Idle (orb)** | Pulse de drop-shadow (placeholder) | Glow respirando, partículas douradas leves orbitando |
| **Idle (moldura)** | Estático | Brilhos esporádicos pelas bordas douradas do cenário e da moldura do orb |
| **Spin start** | Sem antecipação | **Antecipação de ~100ms**: rolos sobem levemente antes de descerem (squash-and-stretch) |
| **Spin loop** | translateY linear + blur 3px (placeholder) | Motion blur vertical mais natural; mascote em pose de "torcida" ou dança |
| **Spin stop** | Cubic-bezier overshoot 1 vez | **Rebote sutil de impacto** em cada rolo, da esquerda pra direita, sequencial |
| **Win cell** | Border dourada + sparkle SVG (placeholder) | Pulse squash-and-stretch + brilho radial + arcos elétricos curtos |
| **Win payline** | SVG stroke draw-in amarelo (placeholder) | Linha dourada elétrica, com partículas correndo ao longo dela |
| **Ganho (Win)** | Banner sprite, scale pop+fade | OK — só refinar timing/curva |
| **Grande Ganho** | Mesmo banner, mesma anim | Adicionar background dim leve + 1 leva de partículas douradas |
| **Mega Ganho** | Mesma anim | Background dim médio + chuva de moedas (sprite particles) + shake |
| **Super Ganho** | Mesma anim | Background dim forte, chuva massiva de moedas, lens flare central, shake intenso |
| **Bônus trigger** | Banner texto + clear board | Transição: bg muda de vermelho pra gradiente dourado/laranja vibrante. Mascote celebra |
| **Bônus respin** | Cells sticky com glow vermelho | Entrada animada por cell nova: zoom-bounce + brilho que se acomoda em borda dourada/vermelha |
| **Bônus full screen** | Firework SVG + banner | **Sem multiplicador x10 (decisão de math)** — mas pode ter overlay "TELA CHEIA!" massivo + fogos em todo o stage |
| **Coin burst** | SVG single fade | Sprite-particles emitidas do centro pras bordas, com física |
| **Spin orb pressed** | Scale 0.92 (placeholder) | Press 3D real (brilho fica embaixo, ressalta o "click") |
| **Botões bet ± press** | Scale 0.93 | Mesmo tratamento |

### 7.3 Sound design (TODO inteiro — não existe)

A implementar via Web Audio API:
- Reel spin loop (sustain)
- Reel stop click (×3, um por coluna)
- Win small / big / mega / super (4 cues distintos, escalando)
- Bonus trigger (cinemático curto, gong + tambor)
- Bonus respin stop click
- Bonus full screen (cinemático longo)
- Mute toggle (botão no header)

### 7.4 Princípios técnicos pra preservar

- **Backend autoritativo**: cliente só renderiza resultado de `/api/spin`. RNG NUNCA no cliente.
- **Stack vanilla**: HTML + CSS + JS puro com módulos. Funciona. Se quiser migrar pra React/Tailwind/Framer Motion, é decisão posterior — não é obrigatório do blueprint.
- **Mobile-first**: layout em `100dvh`, max-width 480px, sem scroll. Manter.
- **Sem assets externos pesados sem otimizar**: PNGs hoje somam ~25MB. Pra produção, comprimir com TinyPNG/Squoosh ou converter pra WebP.

### 7.5 O que NÃO refazer

- Math do servidor (`server/*.js`). É calibrada.
- Estrutura de payload da API `/api/spin`.
- Símbolos IDs (W, C, A, F, P, L, X) — usados em servidor + cliente, renomear quebra.
- Linhas de IP da Seção 6. Especificamente: spin orb não vira verde, mascote não vira tigre, RTP/max win não muda pros valores do Fortune Tiger.

## 8. Pendências priorizadas (estado atual)

- [ ] **Refinamento de design**: todas as animações e efeitos serão recriados (escopo da Seção 7)
- [ ] **Sound design** completo (Seção 7.3)
- [ ] **Otimização de PNGs** — TinyPNG/WebP, total cai de 25MB pra ~5MB
- [ ] **Turbo button** — reduz duração das animações em 50%
- [ ] **Auto spin** — N giros sequenciais (10/25/50/100)
- [ ] **Persistência de saldo** — atualmente em-memória por sessão. Pra demo OK, pra mais sério precisa DB
- [ ] **Mascote** — usuário vai ajustar posicionamento/animações de novo

## 9. Comandos úteis

```bash
# Dimensões de PNG
node -e "const fs=require('fs'); const b=fs.readFileSync('client/assets/decor/cenario.png'); console.log(b.readUInt32BE(16)+'x'+b.readUInt32BE(20))"

# Simulação curta (100k spins)
npm run simulate:short

# Servidor
npm start

# Git
git add -A && git commit -m "msg" && git push
```

## 10. Como retomar sessão futura

1. **Ler este arquivo inteiro primeiro.**
2. Confirmar com o usuário em que estado ele acha que parou (memórias do agente podem estar desatualizadas).
3. Antes de mexer em `server/bonus.js`, `reels.js` ou `paytable.js`, rodar `npm run simulate`.
4. Se o usuário pedir algo perto das linhas da Seção 6, **PARAR e confirmar** — não atravessar silenciosamente.
5. Verificar servidor: PowerShell `Get-NetTCPConnection -LocalPort 3000`.
