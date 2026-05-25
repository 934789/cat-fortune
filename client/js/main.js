import { api } from './api.js';

const SYMBOL_NAME = {
  W: 'Gato', C: 'Lingote', A: 'Jade', F: 'Pote de Moedas', P: 'Hongbao', L: 'Foguete', X: 'Tangerina'
};
const ALL_NON_WILD = ['C', 'A', 'F', 'P', 'L', 'X'];
const ALL_SYMS = ['W', ...ALL_NON_WILD];

const BETS = [0.5, 1, 2, 5, 10, 20, 50];
let betIndex = 1;
let busy = false;

const $ = (id) => document.getElementById(id);
const reels = [
  document.querySelector('.reel[data-col="0"]'),
  document.querySelector('.reel[data-col="1"]'),
  document.querySelector('.reel[data-col="2"]')
];
const tapes = [
  document.querySelector('.reel-tape[data-col="0"]'),
  document.querySelector('.reel-tape[data-col="1"]'),
  document.querySelector('.reel-tape[data-col="2"]')
];

function randomSym() {
  return ALL_SYMS[Math.floor(Math.random() * ALL_SYMS.length)];
}

function cellHTML(sym, classes = '') {
  const cls = sym && sym !== '_' ? `cell sym-${sym} ${classes}`.trim() : `cell blank ${classes}`.trim();
  return `<div class="${cls}" data-sym="${sym ?? ''}"></div>`;
}

function fillTapeStatic(colIdx, columnSyms) {
  // columnSyms = [top, mid, bottom]
  tapes[colIdx].style.transition = 'none';
  tapes[colIdx].style.transform = 'translateY(0)';
  tapes[colIdx].innerHTML = columnSyms.map(s => cellHTML(s)).join('');
}

function fillAllStatic(grid) {
  for (let c = 0; c < 3; c++) {
    fillTapeStatic(c, [grid[0][c], grid[1][c], grid[2][c]]);
  }
}

function getCellHeight(colIdx) {
  return reels[colIdx].clientHeight / 3;
}

async function animateReelStop(colIdx, columnSyms, totalDurationMs, loopDurationMs) {
  // Phase 1: fast continuous loop (random symbols flying by)
  // Phase 2: deceleration to final result with overshoot
  const tape = tapes[colIdx];
  const cellH = getCellHeight(colIdx);

  // Build a long tape: [result(3), padding(LOOP_PAD)] — we'll position to start at bottom of padding
  const LOOP_PAD = 40;
  const padSyms = Array.from({ length: LOOP_PAD }, randomSym);
  const tapeSyms = [...columnSyms, ...padSyms];
  tape.innerHTML = tapeSyms.map(s => cellHTML(s)).join('');

  // Position so the bottom 3 of padding are visible (we'll scroll DOWN to reveal result at top)
  const startY = -(tapeSyms.length - 3) * cellH;
  tape.style.transition = 'none';
  tape.style.transform = `translateY(${startY}px)`;
  // eslint-disable-next-line no-unused-expressions
  tape.offsetHeight;

  // Phase 1: fast scroll (linear) for loopDurationMs — move halfway up
  tape.classList.add('spinning-fast');
  const midY = startY * 0.35; // scrolled 65% of the way down
  tape.style.transition = `transform ${loopDurationMs}ms linear`;
  tape.style.transform = `translateY(${midY}px)`;
  await sleep(loopDurationMs);

  // Phase 2: decelerate to result with slight overshoot
  tape.classList.remove('spinning-fast');
  tape.classList.add('spinning');
  const remainingMs = totalDurationMs - loopDurationMs;
  tape.style.transition = `transform ${remainingMs}ms cubic-bezier(0.18, 0.62, 0.32, 1.18)`;
  tape.style.transform = 'translateY(0)';
  await sleep(remainingMs);

  tape.classList.remove('spinning');
  // Settle: tape with just the 3 result cells
  tape.style.transition = 'none';
  tape.style.transform = 'translateY(0)';
  tape.innerHTML = columnSyms.map(s => cellHTML(s)).join('');
}

async function spinReelsAnimated(grid) {
  // Staggered stops with continuous loop phase for "real slot" feel
  // Each reel: loop fast for first part, then decelerate to final
  const stops = [
    animateReelStop(0, [grid[0][0], grid[1][0], grid[2][0]], 1400, 800),
    animateReelStop(1, [grid[0][1], grid[1][1], grid[2][1]], 1800, 1100),
    animateReelStop(2, [grid[0][2], grid[1][2], grid[2][2]], 2300, 1500)
  ];
  await Promise.all(stops);
}

function clearWinHighlights() {
  document.querySelectorAll('.cell').forEach(c => {
    c.classList.remove('win', 'sticky');
  });
  const overlay = document.getElementById('payline-overlay');
  if (overlay) overlay.innerHTML = '';
}

function applyWins(wins) {
  // Each win has positions: [[r,c],...]
  for (const w of wins) {
    for (const [r, c] of w.positions) {
      const cell = visibleCellAt(r, c);
      if (cell) cell.classList.add('win');
    }
  }
  drawPaylines(wins);
}

function drawPaylines(wins) {
  const overlay = document.getElementById('payline-overlay');
  if (!overlay) return;
  overlay.innerHTML = '';
  // viewBox is 100x100 (preserveAspectRatio=none), so we map cell centers as % of board
  // 3 columns: x centers at 16.7, 50, 83.3
  // 3 rows: y centers at 16.7, 50, 83.3
  const cx = (c) => 16.7 + c * 33.3;
  const cy = (r) => 16.7 + r * 33.3;
  for (let i = 0; i < wins.length; i++) {
    const w = wins[i];
    const points = w.positions.map(([r, c]) => `${cx(c)},${cy(r)}`);
    const d = `M ${points.join(' L ')}`;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.style.animationDelay = `${i * 0.12}s`;
    overlay.appendChild(path);
  }
}

function visibleCellAt(row, col) {
  // After settling, tape has just 3 cells [top, mid, bot]
  const tape = tapes[col];
  return tape.children[row];
}

function setBanner(text, level = 'normal') {
  const b = $('banner');
  b.textContent = text;
  b.classList.remove('big', 'huge');
  if (level === 'big') b.classList.add('big');
  if (level === 'huge') b.classList.add('huge');
}

function fireEffect(id, durationMs = 1600) {
  const el = document.getElementById(id);
  el.classList.remove('active');
  // eslint-disable-next-line no-unused-expressions
  el.offsetHeight;
  el.classList.add('active');
  setTimeout(() => el.classList.remove('active'), durationMs);
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function formatMoney(v) {
  return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function updateBet() {
  $('bet').textContent = formatMoney(BETS[betIndex]);
}

async function refreshBalance() {
  try {
    const { balance } = await api.balance();
    $('balance').textContent = formatMoney(balance);
  } catch (e) {
    $('balance').textContent = '—';
  }
}

async function showBonus(bonus) {
  setBanner(`BÔNUS! Símbolo: ${SYMBOL_NAME[bonus.feature]}`, 'big');
  // Clear board: tapes show 3 blanks
  for (let c = 0; c < 3; c++) {
    fillTapeStatic(c, ['_', '_', '_']);
  }
  await sleep(700);

  const previousFilled = new Set();
  for (const step of bonus.respinHistory) {
    // For each column, animate the unfilled cells with a quick spin
    const animations = [];
    for (let c = 0; c < 3; c++) {
      const columnAfter = [step.grid[0][c], step.grid[1][c], step.grid[2][c]];
      animations.push(animateBonusColumn(c, columnAfter, previousFilled, 500 + c * 100));
    }
    await Promise.all(animations);

    // Mark previously-filled as sticky
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (step.grid[r][c] !== '_') {
          const wasPrev = previousFilled.has(`${r},${c}`);
          const cell = visibleCellAt(r, c);
          if (cell && wasPrev) cell.classList.add('sticky');
          previousFilled.add(`${r},${c}`);
        }
      }
    }
    await sleep(300);
  }

  if (bonus.fullScreen) {
    fireEffect('fx-firework', 1600);
    setBanner(`TELA CHEIA! +${formatMoney(bonus.payout)}`, 'huge');
  } else if (bonus.payout > 0) {
    fireEffect('fx-coins', 1200);
    setBanner(`Bônus pagou ${formatMoney(bonus.payout)} (${bonus.cellsFilled}/9)`, 'big');
  } else {
    setBanner(`Bônus não rendeu (${bonus.cellsFilled}/9)`);
  }
  await sleep(1800);
}

async function animateBonusColumn(colIdx, columnAfter, previousFilled, durationMs) {
  // Quick spin animation for cells that are not yet sticky
  const PAD = 8;
  const padSyms = Array.from({ length: PAD }, randomSym);
  // Build tape: top 3 = result, then padding
  const tapeSyms = [...columnAfter, ...padSyms];
  const cellH = getCellHeight(colIdx);
  const tape = tapes[colIdx];
  tape.innerHTML = tapeSyms.map(s => cellHTML(s)).join('');
  tape.classList.add('spinning');
  const startY = -(tapeSyms.length - 3) * cellH;
  tape.style.transition = 'none';
  tape.style.transform = `translateY(${startY}px)`;
  // eslint-disable-next-line no-unused-expressions
  tape.offsetHeight;
  tape.style.transition = `transform ${durationMs}ms cubic-bezier(0.2, 0.8, 0.3, 1.05)`;
  tape.style.transform = 'translateY(0)';
  await sleep(durationMs);
  tape.classList.remove('spinning');
  tape.innerHTML = columnAfter.map(s => cellHTML(s)).join('');
}

function showWinTier(winX) {
  const el = $('win-tier');
  if (!el) return;
  let tier;
  if (winX >= 30) tier = 'tier-4';      // Super Ganho
  else if (winX >= 15) tier = 'tier-3'; // Mega Ganho
  else if (winX >= 5) tier = 'tier-2';  // Grande Ganho
  else tier = 'tier-1';                 // Ganho
  el.className = 'win-tier';
  // eslint-disable-next-line no-unused-expressions
  el.offsetHeight;
  el.classList.add(tier, 'show');
  setTimeout(() => el.classList.remove('show', tier), 1800);
}

async function spin() {
  if (busy) return;
  busy = true;
  const btn = $('spin');
  btn.disabled = true;
  btn.classList.add('spinning');
  setBanner('');
  clearWinHighlights();

  try {
    const bet = BETS[betIndex];
    const spinPromise = api.spin(bet);

    for (let c = 0; c < 3; c++) {
      const dummy = [randomSym(), randomSym(), randomSym()];
      fillTapeStatic(c, dummy);
    }

    const result = await spinPromise;
    await spinReelsAnimated(result.grid);

    if (result.baseWin.total > 0) {
      applyWins(result.baseWin.wins);
      const winX = result.baseWin.total / bet;
      const level = winX >= 10 ? 'big' : 'normal';
      setBanner(
        `+${formatMoney(result.baseWin.total)} em ${result.baseWin.wins.length} linha${result.baseWin.wins.length > 1 ? 's' : ''}`,
        level
      );
      if (winX >= 5) fireEffect('fx-coins', 1400);
      if (winX >= 20) fireEffect('fx-bigwin', 1600);
      showWinTier(winX);
    }

    $('balance').textContent = formatMoney(result.balance);
    $('last-win').textContent = formatMoney(result.totalWin);

    if (result.bonus) {
      await sleep(900);
      clearWinHighlights();
      await showBonus(result.bonus);
      $('last-win').textContent = formatMoney(result.totalWin);
      $('balance').textContent = formatMoney(result.balance);
    }
  } catch (e) {
    setBanner(e.message);
  } finally {
    busy = false;
    btn.disabled = false;
    btn.classList.remove('spinning');
  }
}

function initBoard() {
  // Fill all tapes with random symbols initially
  for (let c = 0; c < 3; c++) {
    fillTapeStatic(c, [randomSym(), randomSym(), randomSym()]);
  }
}

$('spin').addEventListener('click', spin);
$('bet-plus').addEventListener('click', () => {
  if (betIndex < BETS.length - 1) { betIndex++; updateBet(); }
});
$('bet-minus').addEventListener('click', () => {
  if (betIndex > 0) { betIndex--; updateBet(); }
});
$('reset').addEventListener('click', async () => {
  if (busy) return;
  try {
    const { balance } = await api.reset();
    $('balance').textContent = formatMoney(balance);
    $('last-win').textContent = '0,00';
    setBanner('Saldo resetado');
    clearWinHighlights();
  } catch (e) {
    setBanner(e.message);
  }
});

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'Enter') {
    e.preventDefault();
    spin();
  }
});

// Wait for cenário to load before initializing board (so cell heights are correct)
const cenarioImg = document.getElementById('cenario');
if (cenarioImg.complete) {
  initBoard();
} else {
  cenarioImg.addEventListener('load', initBoard);
}

updateBet();
refreshBalance();
