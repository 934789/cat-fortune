import { randFloat, pickWeighted } from './rng.js';
import { SYMBOLS, payoutFor } from './paytable.js';

export const BONUS_TRIGGER_PROBABILITY = 0.018;
export const FULL_SCREEN_MULTIPLIER = 1;
export const MAX_RESPINS = 10;

const BONUS_CELL_WEIGHTS = { blank: 75, feature: 20, wild: 5 };

const FEATURE_PICK_WEIGHTS = {
  [SYMBOLS.COIN]: 1,
  [SYMBOLS.ACAI]: 2,
  [SYMBOLS.COFFEE]: 3,
  [SYMBOLS.PITANGA]: 4,
  [SYMBOLS.LIMAO]: 5,
  [SYMBOLS.CARAMBOLA]: 6
};

export function shouldTriggerBonus() {
  return randFloat() < BONUS_TRIGGER_PROBABILITY;
}

function pickFeature() {
  const items = Object.keys(FEATURE_PICK_WEIGHTS);
  const weights = Object.values(FEATURE_PICK_WEIGHTS);
  return pickWeighted(items, weights);
}

function rollBonusCell() {
  return pickWeighted(
    ['blank', 'feature', 'wild'],
    [BONUS_CELL_WEIGHTS.blank, BONUS_CELL_WEIGHTS.feature, BONUS_CELL_WEIGHTS.wild]
  );
}

function countFilled(grid) {
  let c = 0;
  for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) if (grid[r][k] !== '_') c++;
  return c;
}

export function runBonus(lineBet) {
  const feature = pickFeature();
  const grid = [['_', '_', '_'], ['_', '_', '_'], ['_', '_', '_']];
  const history = [];

  for (let respin = 0; respin < MAX_RESPINS; respin++) {
    let landedNew = false;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (grid[r][c] !== '_') continue;
        const roll = rollBonusCell();
        if (roll === 'feature') { grid[r][c] = feature; landedNew = true; }
        else if (roll === 'wild') { grid[r][c] = SYMBOLS.WILD; landedNew = true; }
      }
    }
    history.push({ respin: respin + 1, grid: grid.map(r => [...r]) });
    if (countFilled(grid) === 9) break;
    if (!landedNew) break;
  }

  const filled = countFilled(grid);
  const base = payoutFor(feature);
  let payout = 0;
  let fullScreen = false;

  if (filled >= 3) {
    payout = base * (filled / 3) * lineBet;
    if (filled === 9) {
      payout *= FULL_SCREEN_MULTIPLIER;
      fullScreen = true;
    }
  }

  return {
    feature,
    featureBasePayout: base,
    finalGrid: grid,
    respinHistory: history,
    cellsFilled: filled,
    fullScreen,
    payout
  };
}
