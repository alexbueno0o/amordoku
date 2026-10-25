/**
 * Generador de planos aleatorios (para el botón "Escenario sorpresa" y para
 * los tests de estrés). Parte la cuadrícula en divisiones con cortes binarios
 * (BSP) y reparte objetos con una densidad parecida a la del libro.
 */
import { Rng } from '../rng';
import type { BoardSpec, CellSpec, EdgeFeature, ObjectInstance, RoomSpec } from '../types';

export interface RandomBoardOptions {
  size: number;
  seed: number;
  /** Número aproximado de divisiones. */
  rooms?: number;
  /** Proporción de celdas con objeto (0-1). */
  density?: number;
  roomNames?: { name: string; article: RoomSpec['article'] }[];
  floors?: string[];
}

const DEFAULT_NAMES: { name: string; article: RoomSpec['article'] }[] = [
  { name: 'Salón', article: 'el' },
  { name: 'Cocina', article: 'la' },
  { name: 'Dormitorio', article: 'el' },
  { name: 'Baño', article: 'el' },
  { name: 'Terraza', article: 'la' },
  { name: 'Comedor', article: 'el' },
  { name: 'Pasillo', article: 'el' },
  { name: 'Estudio', article: 'el' },
  { name: 'Jardín', article: 'el' },
  { name: 'Recibidor', article: 'el' },
  { name: 'Despacho', article: 'el' },
  { name: 'Galería', article: 'la' },
  { name: 'Biblioteca', article: 'la' },
  { name: 'Garaje', article: 'el' },
];

const DEFAULT_FLOORS = ['wood', 'tiles', 'diamond', 'parquet', 'marble', 'carpetFloor', 'terracotta'];

interface Rect {
  r: number;
  c: number;
  h: number;
  w: number;
}

export function randomBoard(o: RandomBoardOptions): BoardSpec {
  const rng = new Rng(o.seed);
  const n = o.size;
  const target = o.rooms ?? Math.max(3, n - 1);
  const rects: Rect[] = [{ r: 0, c: 0, h: n, w: n }];
  // Cortes binarios hasta tener `target` divisiones
  let guard = 0;
  while (rects.length < target && guard++ < 200) {
    rects.sort((a, b) => b.w * b.h - a.w * a.h);
    const big = rects.shift()!;
    const vertical = big.w > big.h ? true : big.h > big.w ? false : rng.next() < 0.5;
    const len = vertical ? big.w : big.h;
    if (len < 3) {
      rects.push(big);
      if (rects.every((x) => Math.max(x.w, x.h) < 3)) break;
      continue;
    }
    const cut = 1 + rng.int(len - 1) || 1;
    const k = Math.min(Math.max(cut, 1), len - 1);
    if (vertical) {
      rects.push({ ...big, w: k }, { ...big, c: big.c + k, w: big.w - k });
    } else {
      rects.push({ ...big, h: k }, { ...big, r: big.r + k, h: big.h - k });
    }
  }
  const names = rng.shuffle((o.roomNames ?? DEFAULT_NAMES).slice());
  const floors = o.floors ?? DEFAULT_FLOORS;
  const rooms: RoomSpec[] = rects.map((_, i) => {
    const nm = names[i % names.length];
    return { id: `room${i + 1}`, name: i < names.length ? nm.name : `${nm.name} ${Math.floor(i / names.length) + 1}`, article: nm.article };
  });
  const cells: (CellSpec | null)[] = new Array(n * n).fill(null);
  rects.forEach((rect, i) => {
    const floor = rng.pick(floors);
    for (let r = rect.r; r < rect.r + rect.h; r++) for (let c = rect.c; c < rect.c + rect.w; c++) cells[r * n + c] = { room: rooms[i].id, floor };
  });

  // Objetos
  const density = o.density ?? 0.36;
  const objects: ObjectInstance[] = [];
  const taken = new Set<number>();
  const blockers = ['table', 'plant', 'tv', 'shelf', 'box', 'lamp'];
  const seats = ['chair', 'carpet', 'bed', 'sofa'];
  let id = 0;
  const tryPlace = (type: string, w: number, h: number) => {
    for (let k = 0; k < 30; k++) {
      const r = rng.int(n - h + 1);
      const c = rng.int(n - w + 1);
      const room = cells[r * n + c]!.room;
      let ok = true;
      for (let rr = r; rr < r + h && ok; rr++)
        for (let cc = c; cc < c + w && ok; cc++) {
          const idx = rr * n + cc;
          if (taken.has(idx) || cells[idx]!.room !== room) ok = false;
        }
      if (!ok) continue;
      for (let rr = r; rr < r + h; rr++) for (let cc = c; cc < c + w; cc++) taken.add(rr * n + cc);
      objects.push({ id: `o${++id}`, type, r, c, w, h });
      return true;
    }
    return false;
  };
  const goal = Math.round(n * n * density);
  let filled = 0;
  for (let i = 0; i < goal * 3 && filled < goal; i++) {
    const seat = rng.next() < 0.45;
    const type = seat ? rng.pick(seats) : rng.pick(blockers);
    const [w, h] = type === 'bed' ? (rng.next() < 0.5 ? [1, 2] : [2, 1]) : type === 'sofa' ? [2, 1] : type === 'carpet' && rng.next() < 0.4 ? [2, 2] : [1, 1];
    if (tryPlace(type, w, h)) filled += w * h;
  }
  // Ventanas en paredes exteriores
  const edges: EdgeFeature[] = [];
  const nWin = Math.max(1, Math.round(n / 3));
  for (let i = 0; i < nWin; i++) {
    const side = rng.pick(['top', 'bottom', 'left', 'right'] as const);
    const k = rng.int(n);
    const r = side === 'top' ? 0 : side === 'bottom' ? n - 1 : k;
    const c = side === 'left' ? 0 : side === 'right' ? n - 1 : k;
    if (!edges.some((e) => e.r === r && e.c === c && e.side === side)) edges.push({ id: `w${i}`, type: 'window', r, c, side });
  }
  return { rows: n, cols: n, cells, rooms, objects, edges };
}
