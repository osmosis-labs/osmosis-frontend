export function normalize(
  val: number,
  max: number,
  min: number,
  a: number = 0,
  b: number = 1
) {
  return a + ((val - min) * (b - a)) / (max - min);
}

export function getPriceAtTick(tick: number): number {
  return 1.0001 ** tick;
}
export function findNearestTick(price: number): number {
  return Math.round(Math.log(Math.max(price, 0.000000001)) / Math.log(1.0001));
}
