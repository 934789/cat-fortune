import { randomInt } from 'node:crypto';

export function randInt(maxExclusive) {
  if (maxExclusive <= 0) throw new Error('maxExclusive deve ser > 0');
  return randomInt(0, maxExclusive);
}

export function randFloat() {
  return randomInt(0, 2 ** 30) / 2 ** 30;
}

export function pickWeighted(items, weights) {
  if (items.length !== weights.length) throw new Error('items e weights de tamanhos diferentes');
  let total = 0;
  for (const w of weights) total += w;
  let roll = randomInt(0, total);
  for (let i = 0; i < items.length; i++) {
    roll -= weights[i];
    if (roll < 0) return items[i];
  }
  return items[items.length - 1];
}
