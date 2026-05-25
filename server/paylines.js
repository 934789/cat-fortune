import { SYMBOLS, payoutFor } from './paytable.js';

export const LINES = [
  [[1, 0], [1, 1], [1, 2]],
  [[0, 0], [0, 1], [0, 2]],
  [[2, 0], [2, 1], [2, 2]],
  [[0, 0], [1, 1], [2, 2]],
  [[2, 0], [1, 1], [0, 2]]
];

function evaluateLine(grid, line) {
  const symbols = line.map(([r, c]) => grid[r][c]);
  const nonWild = symbols.filter(s => s !== SYMBOLS.WILD);
  if (nonWild.length === 0) {
    return { symbol: SYMBOLS.WILD, multiplier: payoutFor(SYMBOLS.WILD) };
  }
  const first = nonWild[0];
  if (!nonWild.every(s => s === first)) return null;
  return { symbol: first, multiplier: payoutFor(first) };
}

export function evaluateGrid(grid, lineBet) {
  const wins = [];
  let total = 0;
  for (let i = 0; i < LINES.length; i++) {
    const win = evaluateLine(grid, LINES[i]);
    if (win && win.multiplier > 0) {
      const amount = win.multiplier * lineBet;
      wins.push({
        line: i + 1,
        positions: LINES[i],
        symbol: win.symbol,
        multiplier: win.multiplier,
        amount
      });
      total += amount;
    }
  }
  return { wins, total };
}
