/**
 * Enumeración de pistas verdaderas para una solución concreta.
 *
 * El generador elige entre estas pistas candidatas las justas para que el caso
 * tenga solución única y la dificultad buscada.
 */
import { colOf, rowOf, type Board } from '../board';
import { clueHolds, type GroupContext } from '../clues/semantics';
import type { Rng } from '../rng';
import type { Clue, ClueKind, Direction, Gender, Placement } from '../types';

/** "Naturalidad" de cada tipo de pista: cuanto más alto, más probable que se elija. */
export const KIND_WEIGHT: Partial<Record<ClueKind, number>> = {
  inRoom: 10,
  onObject: 10,
  besideObject: 9,
  besideEdge: 8,
  notInRoom: 4,
  notOnObject: 3,
  notBesideObject: 3,
  notBesideEdge: 3,
  row: 1.5,
  col: 1.5,
  gridCorner: 4,
  roomCorner: 4,
  lineWithObject: 6,
  roomEdgeLine: 4,
  alone: 7,
  notAlone: 4,
  withCount: 4,
  sameRoom: 6,
  differentRoom: 5,
  aloneWith: 7,
  direction: 7,
  offset: 4,
  inRoomOneOf: 3,
  onFloor: 5,
  countOnObject: 5,
  countInRoom: 4,
  noEmptyRoom: 4,
  countBesideEdge: 4,
};

export interface CandidateOptions {
  board: Board;
  ids: string[];
  genders: Record<string, Gender>;
  targetId: string;
  placement: Placement;
  allowed: Set<ClueKind>;
  rng: Rng;
  /** Suelos que admiten pista "onFloor". */
  clueFloors?: Set<string>;
  /** Tipos de objeto que no deben usarse en pistas (decorados). */
  skipTypes?: Set<string>;
}

/** Pistas candidatas por persona (no incluye al objetivo) y globales. */
export function candidateClues(o: CandidateOptions): { perPerson: Map<string, Clue[]>; globals: Clue[] } {
  const { board: b, placement: pos, allowed, ids, targetId } = o;
  const ctx: GroupContext = { board: b, placement: pos, genders: o.genders, targetId };
  const perPerson = new Map<string, Clue[]>();
  const typesInBoard = [...b.typeCount.keys()].filter((t) => !o.skipTypes?.has(t));
  const edgeTypes = [...b.edgeCount.keys()];
  const add = (list: Clue[], c: Clue) => {
    if (allowed.has(c.kind) && clueHolds(c, ctx)) list.push(c);
  };

  for (const p of ids) {
    if (p === targetId) continue;
    const list: Clue[] = [];
    const cell = pos[p];
    const room = b.rooms[b.roomOf[cell]];
    add(list, { kind: 'inRoom', p, room: room.id });
    for (const r of b.rooms) if (r.id !== room.id && r.cells.some((c) => b.occupiable[c])) add(list, { kind: 'notInRoom', p, room: r.id });
    const others = b.rooms.filter((r) => r.id !== room.id && r.cells.some((c) => b.occupiable[c]));
    if (others.length) {
      const alt = o.rng.pick(others);
      add(list, { kind: 'inRoomOneOf', p, rooms: o.rng.next() < 0.5 ? [room.id, alt.id] : [alt.id, room.id] });
    }
    for (const t of typesInBoard) {
      const info = b.typeInfo(t);
      if (b.typesOn[cell].has(t)) {
        add(list, { kind: 'onObject', p, type: t });
        add(list, { kind: 'onObject', p, type: t, only: true });
      } else if (info?.occupiable) add(list, { kind: 'notOnObject', p, type: t });
      if (b.typesBeside[cell].has(t)) {
        add(list, { kind: 'besideObject', p, type: t });
        add(list, { kind: 'besideObject', p, type: t, only: true });
        add(list, { kind: 'lineWithObject', p, type: t, axis: 'row' });
        add(list, { kind: 'lineWithObject', p, type: t, axis: 'col' });
      } else add(list, { kind: 'notBesideObject', p, type: t });
    }
    for (const t of edgeTypes) {
      if (b.edgesBeside[cell].has(t)) {
        add(list, { kind: 'besideEdge', p, type: t });
        add(list, { kind: 'besideEdge', p, type: t, only: true });
      } else add(list, { kind: 'notBesideEdge', p, type: t });
    }
    const fl = b.floorOf[cell];
    if (fl && o.clueFloors?.has(fl)) add(list, { kind: 'onFloor', p, floor: fl });
    add(list, { kind: 'row', p, index: rowOf(b, cell) });
    add(list, { kind: 'col', p, index: colOf(b, cell) });
    add(list, { kind: 'gridCorner', p });
    add(list, { kind: 'roomCorner', p });
    for (const which of ['firstRow', 'lastRow', 'firstCol', 'lastCol'] as const) add(list, { kind: 'roomEdgeLine', p, which });
    add(list, { kind: 'alone', p });
    add(list, { kind: 'notAlone', p });
    const mates = ids.filter((q) => q !== p && b.roomOf[pos[q]] === b.roomOf[cell]);
    if (mates.length > 0) {
      add(list, { kind: 'withCount', p, count: mates.length });
      for (const gg of ['m', 'f'] as const) {
        const k = mates.filter((q) => o.genders[q] === gg).length;
        if (k > 0) add(list, { kind: 'withCount', p, count: k, gender: gg });
      }
    }
    for (const q of ids) {
      if (q === p) continue;
      if (q === targetId) continue; // las relaciones con la víctima la delatarían
      if (b.roomOf[pos[q]] === b.roomOf[cell]) {
        add(list, { kind: 'sameRoom', p, q });
        add(list, { kind: 'aloneWith', p, q });
      } else add(list, { kind: 'differentRoom', p, q });
      const dr = rowOf(b, cell) - rowOf(b, pos[q]);
      const dc = colOf(b, cell) - colOf(b, pos[q]);
      const card: Direction[] = [];
      if (dr < 0) card.push('N');
      if (dr > 0) card.push('S');
      if (dc > 0) card.push('E');
      if (dc < 0) card.push('W');
      for (const d of card) add(list, { kind: 'direction', p, q, dir: d });
      if (card.length === 2) add(list, { kind: 'direction', p, q, dir: (card[0] + card[1]) as Direction });
      if (Math.abs(dr) >= 1 && Math.abs(dr) <= 5) add(list, { kind: 'offset', p, q, axis: 'row', delta: dr });
      if (Math.abs(dc) >= 1 && Math.abs(dc) <= 5) add(list, { kind: 'offset', p, q, axis: 'col', delta: dc });
    }
    perPerson.set(p, list);
  }

  const globals: Clue[] = [];
  const addG = (c: Clue) => {
    if (allowed.has(c.kind) && clueHolds(c, ctx)) globals.push(c);
  };
  for (const t of typesInBoard) {
    const info = b.typeInfo(t);
    if (!info?.occupiable) continue;
    const k = ids.filter((id) => b.typesOn[pos[id]].has(t)).length;
    addG({ kind: 'countOnObject', type: t, count: k });
  }
  for (const r of b.rooms) {
    if (!r.cells.some((c) => b.occupiable[c])) continue;
    const k = ids.filter((id) => b.roomOf[pos[id]] === r.index).length;
    addG({ kind: 'countInRoom', room: r.id, count: k });
  }
  addG({ kind: 'noEmptyRoom' });
  for (const t of edgeTypes) {
    const k = ids.filter((id) => b.edgesBeside[pos[id]].has(t)).length;
    addG({ kind: 'countBesideEdge', type: t, count: k });
  }
  return { perPerson, globals };
}

/** Clave estable para comparar pistas. */
export function clueKey(c: Clue): string {
  const { text: _t, ...rest } = c as Clue & { text?: string };
  void _t;
  return JSON.stringify(rest);
}
