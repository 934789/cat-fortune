import express from 'express';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { executeSpin } from './spin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT ?? 3000;
const STARTING_BALANCE = 10000;
const MIN_BET = 0.5;
const MAX_BET = 100;

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'client')));

const sessions = new Map();

function getSession(id) {
  if (!sessions.has(id)) sessions.set(id, { balance: STARTING_BALANCE });
  return sessions.get(id);
}

app.post('/api/spin', (req, res) => {
  const sessionId = req.headers['x-session-id'] ?? 'default';
  const session = getSession(sessionId);
  const bet = Number(req.body?.bet);

  if (!Number.isFinite(bet) || bet < MIN_BET || bet > MAX_BET) {
    return res.status(400).json({ error: `Aposta deve ser entre ${MIN_BET} e ${MAX_BET}` });
  }
  if (bet > session.balance) {
    return res.status(400).json({ error: 'Saldo insuficiente' });
  }

  session.balance -= bet;
  const result = executeSpin(bet);
  session.balance += result.totalWin;

  res.json({ ...result, balance: session.balance });
});

app.get('/api/balance', (req, res) => {
  const sessionId = req.headers['x-session-id'] ?? 'default';
  res.json({ balance: getSession(sessionId).balance });
});

app.post('/api/reset', (req, res) => {
  const sessionId = req.headers['x-session-id'] ?? 'default';
  sessions.set(sessionId, { balance: STARTING_BALANCE });
  res.json({ balance: STARTING_BALANCE });
});

app.listen(PORT, () => {
  console.log(`\nCat Fortune rodando em http://localhost:${PORT}`);
  console.log(`Saldo inicial: ${STARTING_BALANCE}`);
  console.log(`Apostas: ${MIN_BET} - ${MAX_BET}`);
  console.log(`No celular (mesma rede): http://<seu-ip-local>:${PORT}\n`);
});
