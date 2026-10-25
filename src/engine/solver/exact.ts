/**
 * Solucionador exacto (backtracking con heurística MRV y comprobación hacia
 * delante). Sirve para garantizar que un caso tiene UNA sola solución.
 *
 * No intenta razonar "como una persona": eso lo hace human.ts. Este solo
 * cuenta soluciones lo más rápido posible.
 */
import { binaryHolds } from '../clues/semantics';
import type { Placement } from '../types';
import { unaryDomains, type Model } from './model';

export interface CountResult {
  count: number;
  solutions: Placement[];
  /** true si se cortó la búsqueda por el límite de nodos. */
  aborted: boolean;
  nodes: number;
}

interface SearchState {
  cellOf: Int32Array; // -1 = sin asignar
  rowUsed: Uint8Array;
  colUsed: Uint8Array;
  roomMembers: number[][]; // personas por división
}

/** Comprueba restricciones de grupo de forma parcial (cotas superiores). */
function partialGroupOk(m: Model, st: SearchState): boolean {
  const b = m.board;
  const roomOfP = (p: number) => (st.cellOf[p] >= 0 ? b.roomOf[st.cellOf[p]] : -1);
  // Regla del juego: el objetivo comparte división con exactamente 1 persona.
  const t = m.target;
  if (t >= 0 && st.cellOf[t] >= 0 && st.roomMembers[roomOfP(t)].length > 2) return false;
  for (const g of m.group) {
    switch (g.kind) {
      case 'alone': {
        const p = m.index.get(g.p)!;
        if (st.cellOf[p] >= 0 && st.roomMembers[roomOfP(p)].length > 1) return false;
        break;
      }
      case 'targetAloneWithCulprit': {
        const p = m.index.get(g.p)!;
        if (st.cellOf[p] >= 0 && st.roomMembers[roomOfP(p)].length > 2) return false;
        break;
      }
      case 'withCount': {
        const p = m.index.get(g.p)!;
        if (st.cellOf[p] < 0) break;
        const others = st.roomMembers[roomOfP(p)].filter((q) => q !== p && (!g.gender || m.genders[q] === g.gender));
        if (others.length > g.count) return false;
        break;
      }
      case 'countOnObject': {
        let k = 0;
        for (let p = 0; p < m.n; p++) if (st.cellOf[p] >= 0 && b.typesOn[st.cellOf[p]].has(g.type)) k++;
        if (k > g.count) return false;
        break;
      }
      case 'countBesideEdge': {
        let k = 0;
        for (let p = 0; p < m.n; p++) if (st.cellOf[p] >= 0 && b.edgesBeside[st.cellOf[p]].has(g.type)) k++;
        if (k > g.count) return false;
        break;
      }
      case 'countInRoom': {
        const ri = b.roomIndex.get(g.room);
        if (ri !== undefined && st.roomMembers[ri].length > g.count) return false;
        break;
      }
      default:
        break;
    }
  }
  // aloneWith (binaria + nadie más)
  for (const bc of m.binary) {
    if (bc.clue.kind !== 'aloneWith') continue;
    const ca = st.cellOf[bc.a];
    if (ca >= 0) {
      for (const q of st.roomMembers[b.roomOf[ca]]) if (q !== bc.a && q !== bc.b) return false;
    }
  }
  return true;
}

/** Comprobación final (igualdades exactas). */
function finalGroupOk(m: Model, st: SearchState): boolean {
  const b = m.board;
  const roomOfP = (p: number) => b.roomOf[st.cellOf[p]];
  if (m.target >= 0 && st.roomMembers[roomOfP(m.target)].length !== 2) return false;
  for (const g of m.group) {
    switch (g.kind) {
      case 'alone':
        if (st.roomMembers[roomOfP(m.index.get(g.p)!)].length !== 1) return false;
        break;
      case 'notAlone':
        if (st.roomMembers[roomOfP(m.index.get(g.p)!)].length < 2) return false;
        break;
      case 'targetAloneWithCulprit':
        if (st.roomMembers[roomOfP(m.index.get(g.p)!)].length !== 2) return false;
        break;
      case 'withCount': {
        const p = m.index.get(g.p)!;
        const others = st.roomMembers[roomOfP(p)].filter((q) => q !== p && (!g.gender || m.genders[q] === g.gender));
        if (others.length !== g.count) return false;
        break;
      }
      case 'countOnObject': {
        let k = 0;
        for (let p = 0; p < m.n; p++) if (b.typesOn[st.cellOf[p]].has(g.type)) k++;
        if (k !== g.count) return false;
        break;
      }
      case 'countBesideEdge': {
        let k = 0;
        for (let p = 0; p < m.n; p++) if (b.edgesBeside[st.cellOf[p]].has(g.type)) k++;
        if (k !== g.count) return false;
        break;
      }
      case 'countInRoom': {
        const ri = b.roomIndex.get(g.room);
        if (ri === undefined || st.roomMembers[ri].length !== g.count) return false;
        break;
      }
      case 'noEmptyRoom':
        for (const room of b.rooms) {
          if (room.cells.some((c) => b.occupiable[c]) && st.roomMembers[room.index].length === 0) return false;
        }
        break;
      default:
        break;
    }
  }
  return true;
}

export interface CountOptions {
  limit?: number;
  maxNodes?: number;
  /** Dominios iniciales ya filtrados (si no, se calculan con las pistas unarias). */
  domains?: number[][];
}

/** Cuenta soluciones hasta `limit`. */
export function countSolutions(m: Model, opts: CountOptions = {}): CountResult {
  const limit = opts.limit ?? 2;
  const maxNodes = opts.maxNodes ?? 2_000_000;
  const doms = opts.domains ?? unaryDomains(m);
  const b = m.board;
  const st: SearchState = {
    cellOf: new Int32Array(m.n).fill(-1),
    rowUsed: new Uint8Array(b.rows),
    colUsed: new Uint8Array(b.cols),
    roomMembers: b.rooms.map(() => []),
  };
  const solutions: Placement[] = [];
  let count = 0;
  let nodes = 0;
  let aborted = false;

  // Restricciones binarias por persona para comprobar al asignar.
  const binOf: { other: number; check: (mine: number, other: number) => boolean }[][] = Array.from(
    { length: m.n },
    () => [],
  );
  for (const bc of m.binary) {
    const clue = bc.clue;
    binOf[bc.a].push({ other: bc.b, check: (ca, cb) => binaryHolds(b, clue, ca, cb) });
    binOf[bc.b].push({ other: bc.a, check: (cb, ca) => binaryHolds(b, clue, ca, cb) });
  }

  const consistent = (p: number, cell: number): boolean => {
    if (st.rowUsed[m.rowOfCell[cell]] || st.colUsed[m.colOfCell[cell]]) return false;
    for (const { other, check } of binOf[p]) {
      const oc = st.cellOf[other];
      if (oc >= 0 && !check(cell, oc)) return false;
    }
    return true;
  };

  const recurse = (assigned: number): void => {
    if (count >= limit || aborted) return;
    if (++nodes > maxNodes) {
      aborted = true;
      return;
    }
    if (assigned === m.n) {
      if (!finalGroupOk(m, st)) return;
      count++;
      if (solutions.length < limit) {
        const pl: Placement = {};
        for (let p = 0; p < m.n; p++) pl[m.ids[p]] = st.cellOf[p];
        solutions.push(pl);
      }
      return;
    }
    // MRV: persona sin asignar con menos opciones válidas.
    let best = -1;
    let bestOpts: number[] | null = null;
    for (let p = 0; p < m.n; p++) {
      if (st.cellOf[p] >= 0) continue;
      const opts: number[] = [];
      for (const cell of doms[p]) if (consistent(p, cell)) opts.push(cell);
      if (opts.length === 0) return; // callejón sin salida
      if (!bestOpts || opts.length < bestOpts.length) {
        best = p;
        bestOpts = opts;
        if (opts.length === 1) break;
      }
    }
    if (best < 0 || !bestOpts) return;
    // Poda: cada fila/columna libre debe poder cubrirse (si N == filas == columnas).
    if (m.fullLines) {
      const rowCover = new Uint8Array(b.rows);
      const colCover = new Uint8Array(b.cols);
      for (let p = 0; p < m.n; p++) {
        if (st.cellOf[p] >= 0) continue;
        for (const cell of doms[p]) {
          if (st.rowUsed[m.rowOfCell[cell]] || st.colUsed[m.colOfCell[cell]]) continue;
          rowCover[m.rowOfCell[cell]] = 1;
          colCover[m.colOfCell[cell]] = 1;
        }
      }
      for (let r = 0; r < b.rows; r++) if (!st.rowUsed[r] && !rowCover[r]) return;
      for (let c = 0; c < b.cols; c++) if (!st.colUsed[c] && !colCover[c]) return;
    }
    for (const cell of bestOpts) {
      const room = b.roomOf[cell];
      st.cellOf[best] = cell;
      st.rowUsed[m.rowOfCell[cell]] = 1;
      st.colUsed[m.colOfCell[cell]] = 1;
      st.roomMembers[room].push(best);
      if (partialGroupOk(m, st)) recurse(assigned + 1);
      st.roomMembers[room].pop();
      st.rowUsed[m.rowOfCell[cell]] = 0;
      st.colUsed[m.colOfCell[cell]] = 0;
      st.cellOf[best] = -1;
      if (count >= limit || aborted) return;
    }
  };
  recurse(0);
  return { count, solutions, aborted, nodes };
}

/** Atajo: ¿tiene exactamente una solución? */
export function hasUniqueSolution(m: Model): { unique: boolean; solution?: Placement; count: number; aborted: boolean } {
  const res = countSolutions(m, { limit: 2 });
  return { unique: res.count === 1 && !res.aborted, solution: res.solutions[0], count: res.count, aborted: res.aborted };
}
