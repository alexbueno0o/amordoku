/** Generador pseudoaleatorio con semilla (mulberry32): mismos resultados con la misma semilla. */
export class Rng {
  private state: number;
  constructor(seed: number) {
    this.state = seed >>> 0 || 0x9e3779b9;
  }
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  int(max: number): number {
    return Math.floor(this.next() * max);
  }
  pick<T>(arr: readonly T[]): T {
    return arr[this.int(arr.length)];
  }
  shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.int(i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  /** Elige con pesos. */
  weighted<T>(items: readonly T[], weight: (t: T) => number): T {
    const total = items.reduce((s, it) => s + Math.max(0, weight(it)), 0);
    let x = this.next() * total;
    for (const it of items) {
      x -= Math.max(0, weight(it));
      if (x <= 0) return it;
    }
    return items[items.length - 1];
  }
}
