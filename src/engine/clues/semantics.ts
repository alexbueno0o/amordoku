/**
 * Semántica de las pistas: qué significa que una pista sea cierta.
 *
 * Se divide en tres familias para que los solucionadores puedan usar la forma
 * más eficiente de cada una:
 *  - unarias: dependen solo de la celda de una persona → filtro de candidatos.
 *  - binarias: dependen de las celdas de dos personas → consistencia de arcos.
 *  - de grupo: dependen de quién comparte división / cuántos hay en algo.
 */
import { colOf, rowOf, type Board } from '../board';
import type { Clue, Direction, Gender, Placement } from '../types';

export type UnaryClue = Extract<
  Clue,
  {
    kind:
      | 'inRoom'
      | 'notInRoom'
      | 'inRoomOneOf'
      | 'onObject'
      | 'notOnObject'
      | 'besideObject'
      | 'notBesideObject'
      | 'besideEdge'
      | 'notBesideEdge'
      | 'onFloor'
      | 'row'
      | 'col'
      | 'gridCorner'
      | 'roomCorner'
      | 'lineWithObject'
      | 'roomEdgeLine';
  }
>;

export type BinaryClue = Extract<Clue, { kind: 'sameRoom' | 'differentRoom' | 'aloneWith' | 'direction' | 'offset' }>;

const UNARY_KINDS = new Set<Clue['kind']>([
  'inRoom',
  'notInRoom',
  'inRoomOneOf',
  'onObject',
  'notOnObject',
  'besideObject',
  'notBesideObject',
  'besideEdge',
  'notBesideEdge',
  'onFloor',
  'row',
  'col',
  'gridCorner',
  'roomCorner',
  'lineWithObject',
  'roomEdgeLine',
]);
const BINARY_KINDS = new Set<Clue['kind']>(['sameRoom', 'differentRoom', 'aloneWith', 'direction', 'offset']);

export const isUnary = (c: Clue): c is UnaryClue => UNARY_KINDS.has(c.kind);
export const isBinary = (c: Clue): c is BinaryClue => BINARY_KINDS.has(c.kind);

/** Persona sujeto de la pista (si la tiene). */
export function clueSubject(c: Clue): string | undefined {
  return 'p' in c ? c.p : undefined;
}

/** Personas mencionadas por la pista. */
export function cluePersons(c: Clue): string[] {
  const out: string[] = [];
  if ('p' in c && c.p) out.push(c.p);
  if ('q' in c && c.q) out.push(c.q);
  return out;
}

/** ¿La celda está en la misma fila/columna que una instancia del tipo, en la misma división? */
function lineWithObject(b: Board, cell: number, type: string, axis: 'row' | 'col'): boolean {
  const room = b.roomOf[cell];
  const r = rowOf(b, cell);
  const c = colOf(b, cell);
  for (const o of b.objects) {
    if (o.type !== type) continue;
    for (const oc of o.cells) {
      if (b.roomOf[oc] !== room) continue;
      if (oc === cell) continue;
      if (axis === 'row' ? rowOf(b, oc) === r : colOf(b, oc) === c) return true;
    }
  }
  return false;
}

/** Predicado de una pista unaria evaluado sobre una celda. */
export function unaryHolds(b: Board, clue: UnaryClue, cell: number): boolean {
  if (!b.active[cell]) return false;
  switch (clue.kind) {
    case 'inRoom':
      return b.roomOf[cell] === b.roomIndex.get(clue.room);
    case 'notInRoom':
      return b.roomOf[cell] !== b.roomIndex.get(clue.room);
    case 'inRoomOneOf':
      return clue.rooms.some((r) => b.roomOf[cell] === b.roomIndex.get(r));
    case 'onObject':
      return b.typesOn[cell].has(clue.type);
    case 'notOnObject':
      return !b.typesOn[cell].has(clue.type);
    case 'besideObject':
      return b.typesBeside[cell].has(clue.type);
    case 'notBesideObject':
      return !b.typesBeside[cell].has(clue.type);
    case 'besideEdge':
      return b.edgesBeside[cell].has(clue.type);
    case 'notBesideEdge':
      return !b.edgesBeside[cell].has(clue.type);
    case 'onFloor':
      return b.floorOf[cell] === clue.floor;
    case 'row':
      return rowOf(b, cell) === clue.index;
    case 'col':
      return colOf(b, cell) === clue.index;
    case 'gridCorner':
      return b.gridCorner[cell];
    case 'roomCorner':
      return b.roomCorner[cell];
    case 'lineWithObject':
      return lineWithObject(b, cell, clue.type, clue.axis);
    case 'roomEdgeLine': {
      const bounds = b.roomBounds[b.roomOf[cell]];
      const r = rowOf(b, cell);
      const c = colOf(b, cell);
      if (clue.which === 'firstRow') return r === bounds.minR;
      if (clue.which === 'lastRow') return r === bounds.maxR;
      if (clue.which === 'firstCol') return c === bounds.minC;
      return c === bounds.maxC;
    }
  }
}

/** ¿La celda `a` está en dirección `dir` respecto de `b`? (estricto, como en el glosario) */
export function directionHolds(b: Board, dir: Direction, a: number, ref: number): boolean {
  const ra = rowOf(b, a);
  const ca = colOf(b, a);
  const rb = rowOf(b, ref);
  const cb = colOf(b, ref);
  const n = ra < rb;
  const s = ra > rb;
  const e = ca > cb;
  const w = ca < cb;
  switch (dir) {
    case 'N':
      return n;
    case 'S':
      return s;
    case 'E':
      return e;
    case 'W':
      return w;
    case 'NE':
      return n && e;
    case 'NW':
      return n && w;
    case 'SE':
      return s && e;
    case 'SW':
      return s && w;
  }
}

/**
 * Relación binaria. Para `aloneWith` solo comprueba la parte binaria (misma
 * división); la parte "y nadie más" se valida como pista de grupo.
 */
export function binaryHolds(b: Board, clue: BinaryClue, cp: number, cq: number): boolean {
  switch (clue.kind) {
    case 'sameRoom':
    case 'aloneWith':
      return b.roomOf[cp] === b.roomOf[cq];
    case 'differentRoom':
      return b.roomOf[cp] !== b.roomOf[cq];
    case 'direction':
      return directionHolds(b, clue.dir, cp, cq);
    case 'offset':
      // delta > 0: p está `delta` filas al sur (o columnas al este) de q.
      return clue.axis === 'row'
        ? rowOf(b, cp) - rowOf(b, cq) === clue.delta
        : colOf(b, cp) - colOf(b, cq) === clue.delta;
  }
}

/** Contexto para evaluar pistas de grupo sobre una colocación completa. */
export interface GroupContext {
  board: Board;
  placement: Placement;
  genders: Record<string, Gender>;
  targetId: string;
}

function personsInRoom(ctx: GroupContext, room: number): string[] {
  return Object.keys(ctx.placement).filter((id) => ctx.board.roomOf[ctx.placement[id]] === room);
}

/** Evalúa cualquier pista sobre una colocación completa. */
export function clueHolds(clue: Clue, ctx: GroupContext): boolean {
  const { board: b, placement: pos } = ctx;
  if (isUnary(clue)) {
    const cell = pos[clue.p];
    if (cell === undefined || !unaryHolds(b, clue, cell)) return false;
    // "only": nadie más en ese tipo de objeto / junto a ese elemento.
    if ((clue.kind === 'onObject' || clue.kind === 'besideObject' || clue.kind === 'besideEdge') && clue.only) {
      for (const id of Object.keys(pos)) {
        if (id === clue.p) continue;
        if (unaryHolds(b, { ...clue, p: id, only: false } as UnaryClue, pos[id])) return false;
      }
    }
    return true;
  }
  if (isBinary(clue)) {
    const cp = pos[clue.p];
    const cq = pos[clue.q];
    if (cp === undefined || cq === undefined) return false;
    if (!binaryHolds(b, clue, cp, cq)) return false;
    if (clue.kind === 'aloneWith') return personsInRoom(ctx, b.roomOf[cp]).length === 2;
    return true;
  }
  switch (clue.kind) {
    case 'alone':
      return personsInRoom(ctx, b.roomOf[pos[clue.p]]).length === 1;
    case 'notAlone':
      return personsInRoom(ctx, b.roomOf[pos[clue.p]]).length > 1;
    case 'withCount': {
      const others = personsInRoom(ctx, b.roomOf[pos[clue.p]]).filter((id) => id !== clue.p);
      const counted = clue.gender ? others.filter((id) => ctx.genders[id] === clue.gender) : others;
      return counted.length === clue.count;
    }
    case 'targetAloneWithCulprit':
      return personsInRoom(ctx, b.roomOf[pos[clue.p]]).length === 2;
    case 'countOnObject':
      return Object.values(pos).filter((cell) => b.typesOn[cell].has(clue.type)).length === clue.count;
    case 'countBesideEdge':
      return Object.values(pos).filter((cell) => b.edgesBeside[cell].has(clue.type)).length === clue.count;
    case 'countInRoom': {
      const ri = b.roomIndex.get(clue.room);
      return ri !== undefined && personsInRoom(ctx, ri).length === clue.count;
    }
    case 'noEmptyRoom':
      return b.rooms.every((room) => room.cells.every((c) => !b.occupiable[c]) || personsInRoom(ctx, room.index).length > 0);
    case 'flavor':
      return true;
  }
  return true;
}

/**
 * Comprueba una colocación completa: reglas del juego + todas las pistas.
 * Devuelve el id del culpable (única persona a solas con el objetivo) o null.
 */
export function validatePlacement(
  b: Board,
  personIds: string[],
  genders: Record<string, Gender>,
  targetId: string,
  clues: Clue[],
  pos: Placement,
): { ok: boolean; culprit: string | null; errors: string[] } {
  const errors: string[] = [];
  const rows = new Set<number>();
  const cols = new Set<number>();
  for (const id of personIds) {
    const cell = pos[id];
    if (cell === undefined) {
      errors.push(`Falta la posición de ${id}`);
      continue;
    }
    if (!b.occupiable[cell]) errors.push(`${id} está en una celda no ocupable`);
    const r = rowOf(b, cell);
    const c = colOf(b, cell);
    if (rows.has(r)) errors.push(`Fila ${r + 1} repetida`);
    if (cols.has(c)) errors.push(`Columna ${c + 1} repetida`);
    rows.add(r);
    cols.add(c);
  }
  const ctx: GroupContext = { board: b, placement: pos, genders, targetId };
  clues.forEach((clue, i) => {
    if (!clueHolds(clue, ctx)) errors.push(`La pista #${i + 1} (${clue.kind}) no se cumple`);
  });
  let culprit: string | null = null;
  const tCell = pos[targetId];
  if (tCell !== undefined) {
    const mates = personIds.filter((id) => id !== targetId && b.roomOf[pos[id]] === b.roomOf[tCell]);
    if (mates.length === 1) culprit = mates[0];
    else errors.push(`El objetivo comparte división con ${mates.length} personas (debe ser exactamente 1)`);
  }
  return { ok: errors.length === 0, culprit, errors };
}
