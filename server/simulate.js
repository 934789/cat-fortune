import { executeSpin } from './spin.js';

const SPINS = parseInt(process.argv[2] ?? '1000000', 10);
const BET = 1;

let totalWagered = 0;
let totalReturned = 0;
let basePayouts = 0;
let bonusPayouts = 0;
let bonusCount = 0;
let fullScreenCount = 0;
let winCount = 0;
let maxWin = 0;
let maxWinSpin = 0;
const winBuckets = { '0': 0, '0-1': 0, '1-5': 0, '5-10': 0, '10-50': 0, '50-100': 0, '100+': 0 };

const startedAt = Date.now();

for (let i = 0; i < SPINS; i++) {
  const result = executeSpin(BET);
  totalWagered += BET;
  totalReturned += result.totalWin;
  basePayouts += result.baseWin.total;
  if (result.bonus) {
    bonusCount++;
    bonusPayouts += result.bonus.payout;
    if (result.bonus.fullScreen) fullScreenCount++;
  }
  if (result.totalWin > 0) winCount++;
  if (result.totalWin > maxWin) {
    maxWin = result.totalWin;
    maxWinSpin = i + 1;
  }
  const w = result.totalWin / BET;
  if (w === 0) winBuckets['0']++;
  else if (w < 1) winBuckets['0-1']++;
  else if (w < 5) winBuckets['1-5']++;
  else if (w < 10) winBuckets['5-10']++;
  else if (w < 50) winBuckets['10-50']++;
  else if (w < 100) winBuckets['50-100']++;
  else winBuckets['100+']++;
}

const elapsed = (Date.now() - startedAt) / 1000;
const rtp = totalReturned / totalWagered;
const baseRtp = basePayouts / totalWagered;
const bonusRtp = bonusPayouts / totalWagered;

const pct = (v) => (v * 100).toFixed(3) + '%';
const num = (v) => v.toLocaleString('pt-BR');

console.log('');
console.log('=== Simulação Cat Fortune ===');
console.log(`Spins:             ${num(SPINS)}`);
console.log(`Aposta por spin:   ${BET}`);
console.log(`Tempo:             ${elapsed.toFixed(2)}s  (${Math.round(SPINS / elapsed)} spins/s)`);
console.log('');
console.log(`Total apostado:    ${num(totalWagered)}`);
console.log(`Total retornado:   ${totalReturned.toFixed(2)}`);
console.log('');
console.log(`RTP total:         ${pct(rtp)}   (alvo: 96.00%)`);
console.log(`  RTP linhas:      ${pct(baseRtp)}`);
console.log(`  RTP bônus:       ${pct(bonusRtp)}`);
console.log('');
console.log(`Hit rate (linhas+bônus): ${pct(winCount / SPINS)}`);
console.log(`Frequência bônus:  ${pct(bonusCount / SPINS)}   (alvo: ~1.20%)`);
console.log(`Bônus full screen: ${num(fullScreenCount)}   (${pct(fullScreenCount / Math.max(bonusCount, 1))} dos bônus)`);
console.log('');
console.log(`Ganho máximo:      ${maxWin.toFixed(2)}  (${(maxWin / BET).toFixed(1)}x bet)  no spin #${num(maxWinSpin)}`);
console.log('');
console.log('Distribuição de ganhos (x bet):');
for (const [bucket, count] of Object.entries(winBuckets)) {
  const p = (count / SPINS) * 100;
  const bar = '█'.repeat(Math.min(40, Math.round(p)));
  console.log(`  ${bucket.padEnd(8)} ${p.toFixed(3).padStart(7)}%  ${bar}`);
}
console.log('');
