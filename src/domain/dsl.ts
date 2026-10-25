/**
 * Mini-lenguaje para escribir escenarios en código de forma compacta:
 * un mapa ASCII de divisiones + listas de objetos. Lo usan los scripts que
 * generan los casos (y es útil para crear escenarios a mano).
 *
 * Ejemplo:
 *   scenario({
 *     id: 'piso', name: 'Piso',
 *     map: ['SSDD', 'SSDD', 'CCCC', 'CCCC'],
 *     rooms: { S: { name: 'Salón', floor: 'w' }, D: { name: 'Dormitorio', floor: 'p' }, C: { name: 'Cocina', floor: 't' } },
 *     floors: { w: ['wood', '#f2d9b8', '#e7c79f'], p: ['parquet', ...], t: ['tiles', ...] },
 *     objects: [['bed', 0, 2, 1, 2], ['table', 2, 1]],
 *     edges: [['window', 0, 0, 'top']],
 *   })
 */
import { floorDef } from '../assets/floors';
import { objectType } from '../catalog/objectTypes';
import type { CellSpec, EdgeFeature, ObjectInstance, RoomSpec, Side } from '../engine/types';
import type { FloorStyle, RoomLabel, Scenario } from './types';

export interface DslRoom {
  name: string;
  floor: string;
  article?: RoomSpec['article'];
  proper?: boolean;
  label?: RoomLabel | 'hidden';
}

export type DslObject = [type: string, r: number, c: number, w?: number, h?: number, opts?: Partial<ObjectInstance>];
export type DslEdge = [type: string, r: number, c: number, side: Side, variant?: string];

export interface DslSpec {
  id: string;
  name: string;
  /** Una cadena por fila; cada carácter es una división. '.' = fuera del tablero. */
  map: string[];
  rooms: Record<string, DslRoom>;
  floors: Record<string, FloorStyle | [pattern: string, c1?: string, c2?: string, phrase?: string]>;
  /** Mapa opcional de suelos por celda (mismo tamaño que map); '-' = el de la división. */
  floorMap?: string[];
  objects?: DslObject[];
  edges?: DslEdge[];
  notes?: string;
}

/** Artículo por defecto deducido del nombre. */
export function guessArticle(name: string): RoomSpec['article'] {
  const n = name.trim().toLowerCase();
  const first = n.split(/\s+/)[0];
  if (/(as)$/.test(first)) return 'las';
  if (/(os|es)$/.test(first) && !/^(mes|res)$/.test(first)) return 'los';
  if (/(a|ión|dad|tud)$/.test(first) && !['día', 'mapa', 'sofá'].includes(first)) return 'la';
  return 'el';
}

export function scenario(spec: DslSpec): Scenario {
  const rows = spec.map.length;
  const cols = Math.max(...spec.map.map((l) => l.length));
  const floors: Record<string, FloorStyle> = {};
  for (const [k, v] of Object.entries(spec.floors)) {
    if (Array.isArray(v)) {
      const def = floorDef(v[0]);
      floors[k] = { pattern: v[0], colors: [v[1] ?? def.colors[0], v[2] ?? def.colors[1]], phrase: v[3] };
    } else floors[k] = v;
  }
  const roomIds = new Map<string, string>();
  const rooms: RoomSpec[] = [];
  const labels: Record<string, RoomLabel> = {};
  for (const [ch, r] of Object.entries(spec.rooms)) {
    const id = `${spec.id}-${r.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-')}`;
    roomIds.set(ch, id);
    rooms.push({ id, name: r.name, article: r.article ?? guessArticle(r.name), proper: r.proper });
    if (r.label === 'hidden') labels[id] = { r: 0, c: 0, hidden: true };
    else if (r.label) labels[id] = r.label;
  }
  const cells: (CellSpec | null)[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const ch = spec.map[r][c] ?? '.';
      if (ch === '.' || ch === ' ') {
        cells.push(null);
        continue;
      }
      const room = spec.rooms[ch];
      if (!room) throw new Error(`Escenario ${spec.id}: división '${ch}' sin definir`);
      const fch = spec.floorMap?.[r]?.[c];
      const floor = fch && fch !== '-' && fch !== '.' ? fch : room.floor;
      if (!floors[floor]) throw new Error(`Escenario ${spec.id}: suelo '${floor}' sin definir`);
      cells.push({ room: roomIds.get(ch)!, floor });
    }
  }
  const objects: ObjectInstance[] = (spec.objects ?? []).map(([type, r, c, w, h, opts], i) => {
    const def = objectType(type);
    if (!def) throw new Error(`Escenario ${spec.id}: objeto desconocido '${type}'`);
    return { id: `${spec.id}-o${i + 1}`, type, r, c, w: w ?? def.size[0], h: h ?? def.size[1], ...opts };
  });
  const edges: EdgeFeature[] = (spec.edges ?? []).map(([type, r, c, side, variant], i) => ({ id: `${spec.id}-e${i + 1}`, type, r, c, side, variant }));
  return {
    id: spec.id,
    name: spec.name,
    floors,
    labels: Object.keys(labels).length ? labels : undefined,
    notes: spec.notes,
    board: { rows, cols, cells, rooms, objects, edges },
  };
}

/** Comprueba que cada fila y columna tenga celdas ocupables y que no haya objetos solapados. */
export function lintScenario(s: Scenario, typeInfo = objectType): string[] {
  const { rows, cols, cells, objects } = s.board;
  const problems: string[] = [];
  const blocked = new Set<number>();
  const taken = new Map<number, string>();
  for (const o of objects) {
    const occ = typeInfo(o.type)?.occupiable;
    for (let r = o.r; r < o.r + o.h; r++)
      for (let c = o.c; c < o.c + o.w; c++) {
        const i = r * cols + c;
        if (r >= rows || c >= cols || !cells[i]) problems.push(`${o.type} en (${r},${c}) fuera del tablero`);
        if (taken.has(i)) problems.push(`${o.type} solapa con ${taken.get(i)} en (${r},${c})`);
        taken.set(i, o.type);
        if (!occ) blocked.add(i);
        // objeto que cruza paredes
        if (cells[i] && cells[o.r * cols + o.c] && cells[i]!.room !== cells[o.r * cols + o.c]!.room) problems.push(`${o.type} en (${o.r},${o.c}) cruza divisiones`);
      }
  }
  for (let r = 0; r < rows; r++) {
    let ok = false;
    for (let c = 0; c < cols; c++) if (cells[r * cols + c] && !blocked.has(r * cols + c)) ok = true;
    if (!ok) problems.push(`La fila ${r + 1} no tiene celdas ocupables`);
  }
  for (let c = 0; c < cols; c++) {
    let ok = false;
    for (let r = 0; r < rows; r++) if (cells[r * cols + c] && !blocked.has(r * cols + c)) ok = true;
    if (!ok) problems.push(`La columna ${c + 1} no tiene celdas ocupables`);
  }
  return problems;
}
