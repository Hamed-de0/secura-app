/**
 * Scale integer weights to sum to 100 using Largest Remainder Method.
 * @param {Array<{id:number, weight:number}>} items
 * @returns {Array<{id:number, weight:number}>} new array with adjusted weights
 */
export function normalizeTo100(items) {
  const total = items.reduce((s, x) => s + (Number.isFinite(x.weight) ? x.weight : 0), 0);
  if (total === 100 || total === 0) return items.slice();

  const scale = 100 / total;
  const scaled = items.map(it => ({
    id: it.id,
    raw: it.weight * scale,
    floor: Math.floor(it.weight * scale),
  }));

  let sumFloor = scaled.reduce((s, x) => s + x.floor, 0);
  let remainder = 100 - sumFloor;

  // sort by largest fractional part desc
  const byFrac = scaled
    .map(x => ({ ...x, frac: x.raw - x.floor }))
    .sort((a, b) => b.frac - a.frac);

  for (let k = 0; k < byFrac.length && remainder > 0; k++) {
    byFrac[k].floor += 1;
    remainder -= 1;
  }

  const result = byFrac
    .sort((a, b) => 0) // no-op; we’ll map back by id anyway
    .map(x => ({ id: x.id, weight: x.floor }));

  // restore original order
  const order = new Map(items.map((it, idx) => [it.id, idx]));
  result.sort((a, b) => order.get(a.id) - order.get(b.id));
  return result;
}
