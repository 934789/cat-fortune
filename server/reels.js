import { randInt } from './rng.js';
import { SYMBOLS } from './paytable.js';

export const REEL_COMPOSITION = {
  [SYMBOLS.WILD]: 4,
  [SYMBOLS.COIN]: 3,
  [SYMBOLS.ACAI]: 5,
  [SYMBOLS.COFFEE]: 8,
  [SYMBOLS.PITANGA]: 10,
  [SYMBOLS.LIMAO]: 10,
  [SYMBOLS.CARAMBOLA]: 10
};

function buildStrip(composition) {
  const order = [SYMBOLS.CARAMBOLA, SYMBOLS.LIMAO, SYMBOLS.PITANGA, SYMBOLS.COFFEE, SYMBOLS.ACAI, SYMBOLS.COIN, SYMBOLS.WILD];
  const counts = { ...composition };
  const strip = [];
  let remaining = Object.values(counts).reduce((a, b) => a + b, 0);
  let idx = 0;
  while (remaining > 0) {
    const sym = order[idx % order.length];
    if (counts[sym] > 0) {
      strip.push(sym);
      counts[sym]--;
      remaining--;
    }
    idx++;
  }
  return strip;
}

export const REELS = [buildStrip(REEL_COMPOSITION), buildStrip(REEL_COMPOSITION), buildStrip(REEL_COMPOSITION)];

export const STRIP_LENGTH = REELS[0].length;

export function spinReels() {
  const grid = [[], [], []];
  for (let col = 0; col < 3; col++) {
    const strip = REELS[col];
    const stop = randInt(strip.length);
    for (let row = 0; row < 3; row++) {
      grid[row].push(strip[(stop + row) % strip.length]);
    }
  }
  return grid;
}
