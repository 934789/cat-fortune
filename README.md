# Cat Fortune

Slot 3×3 original, mobile-first, com mecânica de respins e símbolos sticky. Backend-autoritativo (RNG no servidor) e cliente web leve.

## ⚠️ Aviso legal

Este é um **protótipo educacional / portfólio**. Não usa dinheiro real, não persiste saldo entre sessões, e **não é apto para operação comercial**. Para operar um jogo de aposta no Brasil é necessário:

- Licença de operador junto à SPA/MF (Lei 14.790/2023)
- Homologação do jogo por laboratório credenciado
- Conformidade com KYC, jogo responsável e prevenção a lavagem

Use este código para estudar arquitetura de slots, matemática de RNG, design de bônus e desenvolvimento web mobile. Não publique como produto sem refazer arte, áudio, fluxo legal e licenciamento.

## Identidade

- **Nome**: Cat Fortune
- **Tema**: gato da sorte com símbolos de prosperidade
- **Mascote**: gato (WILD) — arte própria a definir
- **Símbolos**: gato WILD, moeda, açaí, café, pitanga, limão, carambola

Paytable, composição de rolos e mecânica de bônus são originais — não replicam multiplicadores ou regras específicas de produtos comerciais existentes.

## Como rodar

Requisitos: Node.js 18+.

```bash
cd cat-fortune
npm install
npm start
```

Abra `http://localhost:3000` no navegador (ou no celular, na mesma rede, usando o IP da máquina).

## Validar a matemática

```bash
npm run simulate         # 1 milhão de spins
npm run simulate:short   # 100 mil spins (rápido)
```

A simulação imprime RTP total, RTP de linhas, RTP de bônus, hit rate, frequência de bônus e maior ganho.

**RTP alvo: 96,00% ± 0,5% (sobre 1M spins).**

## Estrutura

```
cat-fortune/
├── server/              # Lógica autoritativa (RNG, paytable, reels, bônus)
│   ├── rng.js
│   ├── paytable.js
│   ├── reels.js
│   ├── paylines.js
│   ├── bonus.js
│   ├── spin.js          # Orquestra um giro completo
│   ├── simulate.js      # Monte Carlo de RTP
│   └── index.js         # Express + endpoints /api/spin, /api/balance
├── client/              # Cliente web mobile-first
│   ├── index.html
│   ├── css/style.css
│   └── js/{api.js,main.js}
└── docs/
    └── math-spec.md     # Paytable, reels, fórmulas, contribuição por componente
```

## O que NÃO está aqui (próximas iterações)

- Renderização animada com Pixi.js / Spine (este MVP usa CSS + grid)
- Sprites finais do gato e símbolos (atualmente placeholders coloridos com texto)
- Áudio
- Persistência de saldo / autenticação
- Anti-fraude / replay protection / assinatura criptográfica de spins
- Internacionalização

A matemática e a arquitetura backend já estão prontas para evoluir o cliente sem refazer servidor.
