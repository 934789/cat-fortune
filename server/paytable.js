export const SYMBOLS = {
  WILD: 'W',
  COIN: 'C',
  ACAI: 'A',
  COFFEE: 'F',
  PITANGA: 'P',
  LIMAO: 'L',
  CARAMBOLA: 'X'
};

export const SYMBOL_NAMES = {
  W: 'Gato',
  C: 'Yuanbao',
  A: 'Hongbao',
  F: 'Gema',
  P: 'Lanterna',
  L: 'Tangerina',
  X: 'Lichia'
};

export const PAYTABLE = {
  W: 165,
  C: 66,
  A: 25,
  F: 13,
  P: 8,
  L: 5,
  X: 3
};

export const PAYABLE_NON_WILD = ['C', 'A', 'F', 'P', 'L', 'X'];

export function payoutFor(symbol) {
  return PAYTABLE[symbol] ?? 0;
}
