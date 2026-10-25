/**
 * Modelo compilado de un caso para los solucionadores.
 *
 * Traduce personas a índices 0..N-1 y separa las pistas por familias:
 * unarias (filtran dominios), binarias (relaciones) y de grupo (conteos).
 */
import { buildBoard, colOf, occupiableCells, rowOf, type Board, type TypeLookup } from '../board';
import { isBinary, isUnary, unaryHolds, type BinaryClue, type UnaryClue } from '../clues/semantics';
import type { BoardSpec, Clue, Gender, PersonSpec } from '../types';

export interface BinaryConstraint {
  clue: BinaryClue;
  a: number;
  b: number;
}

export type GroupClue = Exclude<Clue, UnaryClue | BinaryClue>;

export interface Model {
  board: Board;
  persons: PersonSpec[];
  ids: string[];
  index: Map<string, number>;
  genders: Gender[];
  target: number;
  clues: Clue[];
  unary: { clue: UnaryClue; p: number }[];
  binary: BinaryConstraint[];
  group: GroupClue[];
  /** Dominio inicial de cada persona tras aplicar solo las reglas del tablero. */
  baseDomain: number[][];
  rowOfCell: number[];
  colOfCell: number[];
  n: number;
  /** ¿Cada fila y cada columna deben tener exactamente una persona? */
  fullLines: boolean;
}

export interface ModelInput {
  board: BoardSpec | Board;
  persons: PersonSpec[];
  targetId: string;
  clues: Clue[];
  typeInfo?: TypeLookup;
}

export function compileModel(input: ModelInput): Model {
  const board: Board =
    'occupiable' in input.board ? (input.board as Board) : buildBoard(input.board as BoardSpec, input.typeInfo!);
  const ids = input.persons.map((p) => p.id);
  const index = new Map(ids.map((id, i) => [id, i]));
  const target = index.get(input.targetId) ?? -1;
  const unary: Model['unary'] = [];
  const binary: BinaryConstraint[] = [];
  const group: GroupClue[] = [];
  for (const clue of input.clues) {
    if (clue.kind === 'flavor') continue;
    if (isUnary(clue)) {
      const p = index.get(clue.p);
      if (p !== undefined) unary.push({ clue, p });
    } else if (isBinary(clue)) {
      const a = index.get(clue.p);
      const b = index.get(clue.q);
      if (a !== undefined && b !== undefined) binary.push({ clue, a, b });
    } else {
      group.push(clue as GroupClue);
    }
  }
  const occ = occupiableCells(board);
  const rowOfCell = Array.from({ length: board.size }, (_, i) => rowOf(board, i));
  const colOfCell = Array.from({ length: board.size }, (_, i) => colOf(board, i));
  const n = ids.length;
  return {
    board,
    persons: input.persons,
    ids,
    index,
    genders: input.persons.map((p) => p.gender),
    target,
    clues: input.clues,
    unary,
    binary,
    group,
    baseDomain: ids.map(() => occ.slice()),
    rowOfCell,
    colOfCell,
    n,
    fullLines: n === board.rows && n === board.cols,
  };
}

/** Dominio de cada persona tras aplicar sus pistas unarias (y los "solo X" de otros). */
export function unaryDomains(m: Model): number[][] {
  const doms = m.baseDomain.map((d) => d.slice());
  for (const { clue, p } of m.unary) {
    doms[p] = doms[p].filter((cell) => unaryHolds(m.board, clue, cell));
  }
  // "Era la única persona en X": nadie más puede estar en X.
  for (const { clue, p } of m.unary) {
    if ((clue.kind === 'onObject' || clue.kind === 'besideObject' || clue.kind === 'besideEdge') && clue.only) {
      const plain = { ...clue, only: false } as UnaryClue;
      for (let q = 0; q < m.n; q++) {
        if (q === p) continue;
        doms[q] = doms[q].filter((cell) => !unaryHolds(m.board, plain, cell));
      }
    }
  }
  // Conteos globales a cero.
  for (const g of m.group) {
    if (g.kind === 'countOnObject' && g.count === 0) {
      for (let q = 0; q < m.n; q++) doms[q] = doms[q].filter((cell) => !m.board.typesOn[cell].has(g.type));
    }
    if (g.kind === 'countBesideEdge' && g.count === 0) {
      for (let q = 0; q < m.n; q++) doms[q] = doms[q].filter((cell) => !m.board.edgesBeside[cell].has(g.type));
    }
    if (g.kind === 'countInRoom' && g.count === 0) {
      const ri = m.board.roomIndex.get(g.room);
      for (let q = 0; q < m.n; q++) doms[q] = doms[q].filter((cell) => m.board.roomOf[cell] !== ri);
    }
  }
  return doms;
}
