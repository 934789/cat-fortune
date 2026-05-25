import { spinReels } from './reels.js';
import { evaluateGrid } from './paylines.js';
import { shouldTriggerBonus, runBonus } from './bonus.js';

const LINES_COUNT = 5;

export function executeSpin(totalBet) {
  const lineBet = totalBet / LINES_COUNT;
  const grid = spinReels();
  const baseWin = evaluateGrid(grid, lineBet);

  let bonus = null;
  if (shouldTriggerBonus()) {
    bonus = runBonus(lineBet);
  }

  const totalWin = baseWin.total + (bonus?.payout ?? 0);

  return {
    bet: totalBet,
    lineBet,
    grid,
    baseWin,
    bonus,
    totalWin
  };
}
