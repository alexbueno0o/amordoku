/**
 * Board: versión "precalculada" del plano para que las pistas y los
 * solucionadores consulten hechos geométricos en O(1).
 *
 * Todo lo que depende solo del plano (qué hay en cada celda, qué tiene al lado,
 * esquinas, división...) se calcula una vez aquí.
 */
import type { BoardSpec, EdgeFeature, ObjectInstance, ObjectTypeInfo, RoomSpec, Side } from './types';

export type TypeLookup = (typeId: string) => ObjectTypeInfo | undefined;

export interface PlacedObject extends ObjectInstance {
  info: ObjectTypeInfo;
  cells: number[];
}

export interface RoomInfo extends RoomSpec {
  index: number;
  cells: number[];
}

export interface Board {
  spec: BoardSpec;
  rows: number;
  cols: number;
  size: number;
  /** Celda dentro del tablero. */
  active: boolean[];
  /** Una persona puede estar en la celda. */
  occupiable: boolean[];
  /** Índice de división o -1. */
  roomOf: number[];
  rooms: RoomInfo[];
  roomIndex: Map<string, number>;
  floorOf: (string | null)[];
  objects: PlacedObject[];
  /** Tipos de objeto que cubren cada celda. */
  typesOn: Set<string>[];
  /** Instancias (índices en `objects`) que cubren cada celda. */
  instancesOn: number[][];
  /** Tipos de objeto "al lado" (ortogonal, misma división, otra instancia). */
  typesBeside: Set<string>[];
  /** Tipos de elementos de pared (ventana/puerta) adyacentes a la celda. */
  edgesBeside: Set<string>[];
  gridCorner: boolean[];
  roomCorner: boolean[];
  /** Cuántas instancias hay de cada tipo (para "la cama" vs "una cama"). */
  typeCount: Map<string, number>;
  edgeCount: Map<string, number>;
  /** Filas/columnas mín. y máx. de cada división. */
  roomBounds: { minR: number; maxR: number; minC: number; maxC: number }[];
  typeInfo: TypeLookup;
}

export const rowOf = (b: { cols: number }, cell: number) => Math.floor(cell / b.cols);
export const colOf = (b: { cols: number }, cell: number) => cell % b.cols;

const SIDES: Record<Side, [number, number]> = {
  top: [-1, 0],
  bottom: [1, 0],
  left: [0, -1],
  right: [0, 1],
};

/** Las dos celdas a ambos lados de un elemento de pared (la de fuera puede no existir). */
export function edgeCells(spec: BoardSpec, e: EdgeFeature): number[] {
  const out: number[] = [];
  const inside = (r: number, c: number) =>
    r >= 0 && c >= 0 && r < spec.rows && c < spec.cols && spec.cells[r * spec.cols + c] !== null;
  if (inside(e.r, e.c)) out.push(e.r * spec.cols + e.c);
  const [dr, dc] = SIDES[e.side];
  const r2 = e.r + dr;
  const c2 = e.c + dc;
  if (inside(r2, c2)) out.push(r2 * spec.cols + c2);
  return out;
}

export function buildBoard(spec: BoardSpec, typeInfo: TypeLookup): Board {
  const { rows, cols } = spec;
  const size = rows * cols;
  const roomIndex = new Map<string, number>();
  const rooms: RoomInfo[] = spec.rooms.map((r, i) => {
    roomIndex.set(r.id, i);
    return { ...r, index: i, cells: [] };
  });

  const active = new Array<boolean>(size).fill(false);
  const roomOf = new Array<number>(size).fill(-1);
  const floorOf = new Array<string | null>(size).fill(null);
  for (let i = 0; i < size; i++) {
    const cell = spec.cells[i];
    if (!cell) continue;
    active[i] = true;
    floorOf[i] = cell.floor;
    let ri = roomIndex.get(cell.room);
    if (ri === undefined) {
      // División no declarada: la creamos para no romper el motor.
      ri = rooms.length;
      roomIndex.set(cell.room, ri);
      rooms.push({ id: cell.room, name: cell.room, article: '', index: ri, cells: [] });
    }
    roomOf[i] = ri;
    rooms[ri].cells.push(i);
  }

  // Objetos
  const typesOn = Array.from({ length: size }, () => new Set<string>());
  const instancesOn = Array.from({ length: size }, () => [] as number[]);
  const objects: PlacedObject[] = [];
  const typeCount = new Map<string, number>();
  for (const o of spec.objects) {
    const info = typeInfo(o.type);
    if (!info) continue; // Tipo puramente decorativo desconocido
    const cells: number[] = [];
    for (let r = o.r; r < o.r + o.h; r++) {
      for (let c = o.c; c < o.c + o.w; c++) {
        if (r < 0 || c < 0 || r >= rows || c >= cols) continue;
        const idx = r * cols + c;
        if (!active[idx]) continue;
        cells.push(idx);
      }
    }
    if (!cells.length) continue;
    const oi = objects.length;
    objects.push({ ...o, info, cells });
    for (const idx of cells) {
      typesOn[idx].add(o.type);
      instancesOn[idx].push(oi);
    }
    typeCount.set(o.type, (typeCount.get(o.type) ?? 0) + 1);
  }

  // Ocupable: activa y sin objetos que bloqueen
  const occupiable = active.map((a, i) => {
    if (!a) return false;
    for (const oi of instancesOn[i]) if (!objects[oi].info.occupiable) return false;
    return true;
  });

  // "Al lado de": vecinos ortogonales en la misma división, otra instancia
  const typesBeside = Array.from({ length: size }, () => new Set<string>());
  for (let i = 0; i < size; i++) {
    if (!active[i]) continue;
    const r = Math.floor(i / cols);
    const c = i % cols;
    const mine = new Set(instancesOn[i]);
    for (const [dr, dc] of Object.values(SIDES)) {
      const r2 = r + dr;
      const c2 = c + dc;
      if (r2 < 0 || c2 < 0 || r2 >= rows || c2 >= cols) continue;
      const j = r2 * cols + c2;
      if (!active[j] || roomOf[j] !== roomOf[i]) continue;
      for (const oi of instancesOn[j]) {
        if (mine.has(oi)) continue;
        typesBeside[i].add(objects[oi].type);
      }
    }
  }

  // Ventanas y puertas
  const edgesBeside = Array.from({ length: size }, () => new Set<string>());
  const edgeCount = new Map<string, number>();
  for (const e of spec.edges) {
    edgeCount.set(e.type, (edgeCount.get(e.type) ?? 0) + 1);
    for (const idx of edgeCells(spec, e)) edgesBeside[idx].add(e.type);
  }

  // Esquinas
  const isActive = (r: number, c: number) => r >= 0 && c >= 0 && r < rows && c < cols && active[r * cols + c];
  const gridCorner = new Array<boolean>(size).fill(false);
  for (const [r, c] of [
    [0, 0],
    [0, cols - 1],
    [rows - 1, 0],
    [rows - 1, cols - 1],
  ]) {
    if (isActive(r, c)) gridCorner[r * cols + c] = true;
  }
  const wallAt = (i: number, dr: number, dc: number) => {
    const r = Math.floor(i / cols) + dr;
    const c = (i % cols) + dc;
    if (!isActive(r, c)) return true;
    return roomOf[r * cols + c] !== roomOf[i];
  };
  const roomCorner = active.map((a, i) => {
    if (!a) return false;
    const vertical = wallAt(i, -1, 0) || wallAt(i, 1, 0);
    const horizontal = wallAt(i, 0, -1) || wallAt(i, 0, 1);
    return vertical && horizontal;
  });

  const roomBounds = rooms.map((room) => {
    let minR = Infinity;
    let maxR = -Infinity;
    let minC = Infinity;
    let maxC = -Infinity;
    for (const i of room.cells) {
      const r = Math.floor(i / cols);
      const c = i % cols;
      minR = Math.min(minR, r);
      maxR = Math.max(maxR, r);
      minC = Math.min(minC, c);
      maxC = Math.max(maxC, c);
    }
    return { minR, maxR, minC, maxC };
  });

  return {
    spec,
    rows,
    cols,
    size,
    active,
    occupiable,
    roomOf,
    rooms,
    roomIndex,
    floorOf,
    objects,
    typesOn,
    instancesOn,
    typesBeside,
    edgesBeside,
    gridCorner,
    roomCorner,
    typeCount,
    edgeCount,
    roomBounds,
    typeInfo,
  };
}

/** Lista de celdas ocupables. */
export function occupiableCells(b: Board): number[] {
  const out: number[] = [];
  for (let i = 0; i < b.size; i++) if (b.occupiable[i]) out.push(i);
  return out;
}

/** Filas que contienen al menos una celda ocupable (deben tener a alguien si N == filas). */
export function cellName(b: Board, cell: number): string {
  return `F${rowOf(b, cell) + 1}·C${colOf(b, cell) + 1}`;
}
