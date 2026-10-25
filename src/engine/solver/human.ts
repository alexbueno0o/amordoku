/**
 * Solucionador "humano": resuelve el caso aplicando técnicas de deducción en
 * orden de dificultad, igual que lo haría una persona con lápiz.
 *
 * Cada vez que una técnica avanza, se registra un `Step` y se vuelve a empezar
 * por la técnica más fácil. La traza resultante sirve para:
 *  - Medir la dificultad (qué técnicas hicieron falta y cuántas veces).
 *  - Generar la explicación de la solución en español.
 */
import { binaryHolds, unaryHolds, type UnaryClue } from '../clues/semantics';
import type { Placement } from '../types';
import { unaryDomains, type Model } from './model';

export type TechniqueId =
  | 'clue'
  | 'single'
  | 'hiddenLine'
  | 'lineCell'
  | 'pointing'
  | 'relation'
  | 'room'
  | 'count'
  | 'intersection'
  | 'subset'
  | 'trial';

/** Nivel de dificultad y peso de cada técnica. */
export const TECHNIQUES: Record<TechniqueId, { level: number; weight: number; label: string }> = {
  clue: { level: 0, weight: 0, label: 'Lectura de pistas' },
  single: { level: 1, weight: 1, label: 'Única celda posible' },
  hiddenLine: { level: 2, weight: 2, label: 'Único candidato de una fila/columna' },
  lineCell: { level: 2, weight: 2, label: 'Fila/columna con una sola celda' },
  pointing: { level: 2, weight: 1, label: 'Persona confinada a una fila/columna' },
  relation: { level: 3, weight: 1, label: 'Relación entre personas' },
  room: { level: 3, weight: 2, label: 'Razonamiento por divisiones' },
  count: { level: 3, weight: 2, label: 'Conteo global' },
  intersection: { level: 4, weight: 4, label: 'Celdas intersectadas' },
  subset: { level: 5, weight: 6, label: 'Parejas y tríos de filas/columnas' },
  trial: { level: 6, weight: 12, label: 'Prueba y error' },
};

export interface Elim {
  p: number;
  cell: number;
}

export interface Step {
  tech: TechniqueId;
  /** Personas protagonistas del paso. */
  persons: number[];
  placed: Elim[];
  eliminated: Elim[];
  /** Datos para la explicación (fila, columna, división, pista...). */
  info: {
    row?: number;
    col?: number;
    rows?: number[];
    cols?: number[];
    room?: number;
    clueIndex?: number;
    cells?: number[];
    assumed?: Elim;
    because?: string;
  };
}

export interface HumanResult {
  solved: boolean;
  /** Solución encontrada (si se resolvió). */
  placement: Placement | null;
  steps: Step[];
  /** Puntuación de dificultad (suma de pesos). */
  score: number;
  /** Nivel máximo de técnica necesario. */
  maxLevel: number;
  /** Uso de cada técnica. */
  usage: Partial<Record<TechniqueId, number>>;
  contradiction: boolean;
  /** Candidatas finales de cada persona (útil si se atasca). */
  candidates: number[][];
}

/** Estado de candidatos: cand[p][cell] = 1 si p aún puede estar en cell. */
class State {
  cand: Uint8Array[];
  count: number[];
  placed: Int32Array;
  constructor(public m: Model, domains?: number[][]) {
    const size = m.board.size;
    this.cand = Array.from({ length: m.n }, () => new Uint8Array(size));
    this.count = new Array(m.n).fill(0);
    this.placed = new Int32Array(m.n).fill(-1);
    if (domains) {
      domains.forEach((dom, p) => {
        for (const c of dom) this.cand[p][c] = 1;
        this.count[p] = dom.length;
      });
    }
  }
  clone(): State {
    const s = new State(this.m);
    s.cand = this.cand.map((a) => a.slice());
    s.count = this.count.slice();
    s.placed = this.placed.slice();
    return s;
  }
  cells(p: number): number[] {
    const out: number[] = [];
    const a = this.cand[p];
    for (let i = 0; i < a.length; i++) if (a[i]) out.push(i);
    return out;
  }
  remove(p: number, cell: number, log: Elim[]): void {
    if (!this.cand[p][cell]) return;
    this.cand[p][cell] = 0;
    this.count[p]--;
    log.push({ p, cell });
  }
  restrictTo(p: number, keep: (cell: number) => boolean, log: Elim[]): void {
    const a = this.cand[p];
    for (let i = 0; i < a.length; i++) if (a[i] && !keep(i)) this.remove(p, i, log);
  }
  get unplaced(): number[] {
    const out: number[] = [];
    for (let p = 0; p < this.m.n; p++) if (this.placed[p] < 0) out.push(p);
    return out;
  }
}

/* ------------------------------------------------------------------------- */
/* Técnicas                                                                   */
/* ------------------------------------------------------------------------- */

type Technique = (s: State) => Step | null;

const emptyStep = (tech: TechniqueId, persons: number[] = []): Step => ({
  tech,
  persons,
  placed: [],
  eliminated: [],
  info: {},
});

/** Coloca a p en la celda y bloquea su fila y columna para los demás. */
function place(s: State, p: number, cell: number, step: Step): void {
  const m = s.m;
  s.placed[p] = cell;
  step.placed.push({ p, cell });
  // p queda con una sola candidata
  s.restrictTo(p, (c) => c === cell, step.eliminated);
  const r = m.rowOfCell[cell];
  const c = m.colOfCell[cell];
  for (let q = 0; q < m.n; q++) {
    if (q === p) continue;
    s.restrictTo(q, (x) => m.rowOfCell[x] !== r && m.colOfCell[x] !== c, step.eliminated);
  }
}

/** T1: persona con una única celda posible. */
const single: Technique = (s) => {
  for (const p of s.unplaced) {
    if (s.count[p] === 1) {
      const cell = s.cells(p)[0];
      const step = emptyStep('single', [p]);
      place(s, p, cell, step);
      return step;
    }
  }
  return null;
};

/** T2a: una fila/columna libre que solo puede ocupar una persona. */
const hiddenLine: Technique = (s) => {
  const m = s.m;
  if (!m.fullLines) return null;
  for (const axis of ['row', 'col'] as const) {
    const lines = axis === 'row' ? m.board.rows : m.board.cols;
    const lineOf = axis === 'row' ? m.rowOfCell : m.colOfCell;
    for (let L = 0; L < lines; L++) {
      // ¿ya ocupada?
      let taken = false;
      for (let p = 0; p < m.n; p++) if (s.placed[p] >= 0 && lineOf[s.placed[p]] === L) taken = true;
      if (taken) continue;
      const who: number[] = [];
      for (const p of s.unplaced) {
        if (s.cells(p).some((c) => lineOf[c] === L)) who.push(p);
      }
      if (who.length === 1) {
        const p = who[0];
        if (s.cells(p).every((c) => lineOf[c] === L)) continue; // nada nuevo
        const step = emptyStep('hiddenLine', [p]);
        step.info[axis] = L;
        s.restrictTo(p, (c) => lineOf[c] === L, step.eliminated);
        return step;
      }
    }
  }
  return null;
};

/** T2b: una fila/columna libre con una sola celda candidata → alguien está ahí. */
const lineCell: Technique = (s) => {
  const m = s.m;
  if (!m.fullLines) return null;
  for (const axis of ['row', 'col'] as const) {
    const lines = axis === 'row' ? m.board.rows : m.board.cols;
    const lineOf = axis === 'row' ? m.rowOfCell : m.colOfCell;
    const otherOf = axis === 'row' ? m.colOfCell : m.rowOfCell;
    for (let L = 0; L < lines; L++) {
      let taken = false;
      for (let p = 0; p < m.n; p++) if (s.placed[p] >= 0 && lineOf[s.placed[p]] === L) taken = true;
      if (taken) continue;
      const cellsInLine = new Set<number>();
      for (const p of s.unplaced) for (const c of s.cells(p)) if (lineOf[c] === L) cellsInLine.add(c);
      if (cellsInLine.size !== 1) continue;
      const cell = [...cellsInLine][0];
      const cross = otherOf[cell];
      const step = emptyStep('lineCell', []);
      step.info[axis] = L;
      step.info.cells = [cell];
      for (const p of s.unplaced) s.restrictTo(p, (c) => otherOf[c] !== cross || c === cell, step.eliminated);
      if (step.eliminated.length) return step;
    }
  }
  return null;
};

/** T3: una persona confinada a una fila/columna la bloquea para los demás. */
const pointing: Technique = (s) => {
  const m = s.m;
  for (const p of s.unplaced) {
    const cells = s.cells(p);
    if (cells.length < 2) continue;
    for (const axis of ['row', 'col'] as const) {
      const lineOf = axis === 'row' ? m.rowOfCell : m.colOfCell;
      const L = lineOf[cells[0]];
      if (!cells.every((c) => lineOf[c] === L)) continue;
      const step = emptyStep('pointing', [p]);
      step.info[axis] = L;
      for (const q of s.unplaced) if (q !== p) s.restrictTo(q, (c) => lineOf[c] !== L, step.eliminated);
      if (step.eliminated.length) return step;
    }
  }
  return null;
};

/** T4: consistencia de relaciones entre dos personas (norte de, misma división...). */
const relation: Technique = (s) => {
  const m = s.m;
  for (const bc of m.binary) {
    for (const [x, y, forward] of [
      [bc.a, bc.b, true],
      [bc.b, bc.a, false],
    ] as const) {
      const ys = s.cells(y);
      const step = emptyStep('relation', [x, y]);
      step.info.clueIndex = m.clues.indexOf(bc.clue);
      for (const cx of s.cells(x)) {
        const supported = ys.some(
          (cy) =>
            m.rowOfCell[cy] !== m.rowOfCell[cx] &&
            m.colOfCell[cy] !== m.colOfCell[cx] &&
            (forward ? binaryHolds(m.board, bc.clue, cx, cy) : binaryHolds(m.board, bc.clue, cy, cx)),
        );
        if (!supported) s.remove(x, cx, step.eliminated);
      }
      if (step.eliminated.length) return step;
    }
  }
  return null;
};

/** Personas que seguro están en la división / que pueden estar. */
function roomSets(s: State, room: number): { must: number[]; may: number[] } {
  const b = s.m.board;
  const must: number[] = [];
  const may: number[] = [];
  for (let p = 0; p < s.m.n; p++) {
    const cells = s.cells(p);
    const inRoom = cells.filter((c) => b.roomOf[c] === room).length;
    if (inRoom > 0) may.push(p);
    if (inRoom > 0 && inRoom === cells.length) must.push(p);
  }
  return { must, may };
}

/** T5: razonamiento por divisiones (sola, a solas con, con N personas, víctima...). */
const roomTech: Technique = (s) => {
  const m = s.m;
  const b = m.board;
  const roomCache = new Map<number, { must: number[]; may: number[] }>();
  const sets = (room: number) => {
    let v = roomCache.get(room);
    if (!v) {
      v = roomSets(s, room);
      roomCache.set(room, v);
    }
    return v;
  };

  // Reglas por persona: (persona, función que dice si su celda es válida en esa división)
  type Rule = { p: number; ok: (room: number) => boolean; because: string; clueIndex: number };
  const rules: Rule[] = [];
  // La regla "el objetivo está a solas con el culpable" solo se usa para
  // deducir si el caso la declara como pista explícita (targetAloneWithCulprit).
  for (const g of m.group) {
    const ci = m.clues.indexOf(g);
    if (g.kind === 'alone') {
      const p = m.index.get(g.p)!;
      rules.push({ p, ok: (room) => sets(room).must.every((q) => q === p), because: 'alone', clueIndex: ci });
    } else if (g.kind === 'notAlone') {
      const p = m.index.get(g.p)!;
      rules.push({ p, ok: (room) => sets(room).may.some((q) => q !== p), because: 'notAlone', clueIndex: ci });
    } else if (g.kind === 'targetAloneWithCulprit') {
      const p = m.index.get(g.p)!;
      rules.push({
        p,
        ok: (room) => {
          const { must, may } = sets(room);
          return must.filter((q) => q !== p).length <= 1 && may.some((q) => q !== p);
        },
        because: 'targetAlone',
        clueIndex: ci,
      });
    } else if (g.kind === 'withCount') {
      const p = m.index.get(g.p)!;
      const match = (q: number) => q !== p && (!g.gender || m.genders[q] === g.gender);
      rules.push({
        p,
        ok: (room) => {
          const { must, may } = sets(room);
          return must.filter(match).length <= g.count && may.filter(match).length >= g.count;
        },
        because: 'withCount',
        clueIndex: ci,
      });
    }
  }
  for (const bc of m.binary) {
    if (bc.clue.kind !== 'aloneWith') continue;
    const ci = m.clues.indexOf(bc.clue);
    for (const [x, y] of [
      [bc.a, bc.b],
      [bc.b, bc.a],
    ]) {
      rules.push({
        p: x,
        ok: (room) => sets(room).must.every((q) => q === x || q === y),
        because: 'aloneWith',
        clueIndex: ci,
      });
    }
  }

  for (const rule of rules) {
    const step = emptyStep('room', [rule.p]);
    step.info.because = rule.because;
    step.info.clueIndex = rule.clueIndex;
    for (const cell of s.cells(rule.p)) {
      if (!rule.ok(b.roomOf[cell])) s.remove(rule.p, cell, step.eliminated);
    }
    if (step.eliminated.length) {
      step.info.room = b.roomOf[step.eliminated[0].cell];
      return step;
    }
  }

  // Efecto sobre los demás: si p (sola) seguro está en R, nadie más entra en R.
  for (const g of m.group) {
    const ci = m.clues.indexOf(g);
    if (g.kind === 'alone' || g.kind === 'targetAloneWithCulprit') {
      const p = m.index.get(g.p)!;
      const cells = s.cells(p);
      const room = b.roomOf[cells[0]];
      if (!cells.every((c) => b.roomOf[c] === room)) continue;
      const { must } = sets(room);
      if (g.kind === 'alone') {
        const step = emptyStep('room', [p]);
        step.info = { room, because: 'aloneOthers', clueIndex: ci };
        for (const q of s.unplaced) if (q !== p) s.restrictTo(q, (c) => b.roomOf[c] !== room, step.eliminated);
        if (step.eliminated.length) return step;
      } else {
        const others = must.filter((q) => q !== p);
        if (others.length === 1) {
          const step = emptyStep('room', [p, others[0]]);
          step.info = { room, because: 'targetPairFull', clueIndex: ci };
          for (const q of s.unplaced) {
            if (q === p || q === others[0]) continue;
            s.restrictTo(q, (c) => b.roomOf[c] !== room, step.eliminated);
          }
          if (step.eliminated.length) return step;
        }
      }
    }
  }
  for (const bc of m.binary) {
    if (bc.clue.kind !== 'aloneWith') continue;
    const ca = s.cells(bc.a);
    const room = b.roomOf[ca[0]];
    if (!ca.every((c) => b.roomOf[c] === room)) continue;
    const step = emptyStep('room', [bc.a, bc.b]);
    step.info = { room, because: 'aloneWithOthers', clueIndex: m.clues.indexOf(bc.clue) };
    for (const q of s.unplaced) {
      if (q === bc.a || q === bc.b) continue;
      s.restrictTo(q, (c) => b.roomOf[c] !== room, step.eliminated);
    }
    if (step.eliminated.length) return step;
  }
  // División que debe estar ocupada (noEmptyRoom) y solo una persona puede.
  if (m.group.some((g) => g.kind === 'noEmptyRoom')) {
    const ci = m.clues.findIndex((g) => g.kind === 'noEmptyRoom');
    for (const room of b.rooms) {
      if (!room.cells.some((c) => b.occupiable[c])) continue;
      const { may, must } = sets(room.index);
      if (may.length === 1 && must.length === 0) {
        const p = may[0];
        const step = emptyStep('room', [p]);
        step.info = { room: room.index, because: 'noEmptyRoom', clueIndex: ci };
        s.restrictTo(p, (c) => b.roomOf[c] === room.index, step.eliminated);
        if (step.eliminated.length) return step;
      }
    }
  }
  return null;
};

/** T6: conteos globales ("había exactamente N personas en...", "la única persona en..."). */
const countTech: Technique = (s) => {
  const m = s.m;
  const b = m.board;
  type Counter = { pred: (cell: number) => boolean; count: number; clueIndex: number };
  const counters: Counter[] = [];
  for (const g of m.group) {
    const ci = m.clues.indexOf(g);
    if (g.kind === 'countOnObject') counters.push({ pred: (c) => b.typesOn[c].has(g.type), count: g.count, clueIndex: ci });
    if (g.kind === 'countBesideEdge')
      counters.push({ pred: (c) => b.edgesBeside[c].has(g.type), count: g.count, clueIndex: ci });
    if (g.kind === 'countInRoom') {
      const ri = b.roomIndex.get(g.room);
      counters.push({ pred: (c) => b.roomOf[c] === ri, count: g.count, clueIndex: ci });
    }
  }
  for (const { clue, p } of m.unary) {
    if ((clue.kind === 'onObject' || clue.kind === 'besideObject' || clue.kind === 'besideEdge') && clue.only) {
      const plain = { ...clue, only: false } as UnaryClue;
      void p;
      counters.push({ pred: (c) => unaryHolds(b, plain, c), count: 1, clueIndex: m.clues.indexOf(clue) });
    }
  }
  for (const ctr of counters) {
    const must: number[] = [];
    const may: number[] = [];
    for (let p = 0; p < m.n; p++) {
      const cells = s.cells(p);
      const k = cells.filter(ctr.pred).length;
      if (k > 0) may.push(p);
      if (k > 0 && k === cells.length) must.push(p);
    }
    if (must.length === ctr.count) {
      const step = emptyStep('count', must);
      step.info.clueIndex = ctr.clueIndex;
      for (const q of may) if (!must.includes(q)) s.restrictTo(q, (c) => !ctr.pred(c), step.eliminated);
      if (step.eliminated.length) return step;
    }
    if (may.length === ctr.count) {
      const step = emptyStep('count', may);
      step.info.clueIndex = ctr.clueIndex;
      for (const q of may) s.restrictTo(q, ctr.pred, step.eliminated);
      if (step.eliminated.length) return step;
    }
  }
  return null;
};

/** T7: "celdas intersectadas": celdas atacadas por todas las opciones de una persona. */
const intersection: Technique = (s) => {
  const m = s.m;
  const b = m.board;
  for (const p of s.unplaced) {
    const cells = s.cells(p);
    if (cells.length < 2 || cells.length > 4) continue;
    const step = emptyStep('intersection', [p]);
    step.info.cells = cells;
    for (let x = 0; x < b.size; x++) {
      if (!b.occupiable[x] || s.cand[p][x]) continue;
      const attacked = cells.every((c) => m.rowOfCell[c] === m.rowOfCell[x] || m.colOfCell[c] === m.colOfCell[x]);
      if (!attacked) continue;
      for (const q of s.unplaced) if (q !== p) s.remove(q, x, step.eliminated);
    }
    if (step.eliminated.length) return step;
  }
  return null;
};

/** T8: parejas/tríos: k personas encerradas en k filas (o columnas). */
const subset: Technique = (s) => {
  const m = s.m;
  const un = s.unplaced;
  for (const axis of ['row', 'col'] as const) {
    const lineOf = axis === 'row' ? m.rowOfCell : m.colOfCell;
    const linesOf = (p: number) => new Set(s.cells(p).map((c) => lineOf[c]));
    const pl = un.map((p) => ({ p, lines: linesOf(p) })).filter((x) => x.lines.size >= 2 && x.lines.size <= 3);
    for (let k = 2; k <= 3; k++) {
      const combos = (start: number, acc: typeof pl): (typeof pl)[] => {
        if (acc.length === k) return [acc];
        const out: (typeof pl)[] = [];
        for (let i = start; i < pl.length; i++) out.push(...combos(i + 1, [...acc, pl[i]]));
        return out;
      };
      for (const combo of combos(0, [])) {
        const union = new Set<number>();
        combo.forEach((x) => x.lines.forEach((l) => union.add(l)));
        if (union.size !== k) continue;
        const members = combo.map((x) => x.p);
        const step = emptyStep('subset', members);
        step.info[axis === 'row' ? 'rows' : 'cols'] = [...union].sort((a, b2) => a - b2);
        for (const q of un) if (!members.includes(q)) s.restrictTo(q, (c) => !union.has(lineOf[c]), step.eliminated);
        if (step.eliminated.length) return step;
      }
    }
    // Versión "oculta": k filas que solo pueden ocupar k personas.
    if (m.fullLines) {
      const lines = axis === 'row' ? m.board.rows : m.board.cols;
      const free: number[] = [];
      for (let L = 0; L < lines; L++) {
        if (![...Array(m.n).keys()].some((p) => s.placed[p] >= 0 && lineOf[s.placed[p]] === L)) free.push(L);
      }
      const whoIn = (L: number) => un.filter((p) => s.cells(p).some((c) => lineOf[c] === L));
      for (let k = 2; k <= 3; k++) {
        const combos = (start: number, acc: number[]): number[][] => {
          if (acc.length === k) return [acc];
          const out: number[][] = [];
          for (let i = start; i < free.length; i++) out.push(...combos(i + 1, [...acc, free[i]]));
          return out;
        };
        for (const linesCombo of combos(0, [])) {
          const who = new Set<number>();
          linesCombo.forEach((L) => whoIn(L).forEach((p) => who.add(p)));
          if (who.size !== k) continue;
          const set = new Set(linesCombo);
          const step = emptyStep('subset', [...who]);
          step.info[axis === 'row' ? 'rows' : 'cols'] = linesCombo;
          for (const p of who) s.restrictTo(p, (c) => set.has(lineOf[c]), step.eliminated);
          if (step.eliminated.length) return step;
        }
      }
    }
  }
  return null;
};

const BASIC: Technique[] = [single, hiddenLine, lineCell, pointing, relation, roomTech, countTech, intersection, subset];

/** ¿El estado es contradictorio? */
function contradiction(s: State): boolean {
  const m = s.m;
  for (let p = 0; p < m.n; p++) if (s.count[p] === 0) return true;
  if (m.fullLines) {
    const rowOk = new Uint8Array(m.board.rows);
    const colOk = new Uint8Array(m.board.cols);
    for (let p = 0; p < m.n; p++) {
      for (const c of s.cells(p)) {
        rowOk[m.rowOfCell[c]] = 1;
        colOk[m.colOfCell[c]] = 1;
      }
    }
    for (let r = 0; r < m.board.rows; r++) if (!rowOk[r]) return true;
    for (let c = 0; c < m.board.cols; c++) if (!colOk[c]) return true;
  }
  // Dos personas colocadas en la misma fila/columna
  const rows = new Set<number>();
  const cols = new Set<number>();
  for (let p = 0; p < m.n; p++) {
    const c = s.placed[p];
    if (c < 0) continue;
    if (rows.has(m.rowOfCell[c]) || cols.has(m.colOfCell[c])) return true;
    rows.add(m.rowOfCell[c]);
    cols.add(m.colOfCell[c]);
  }
  return false;
}

/** Comprobación final de pistas de grupo cuando todo está colocado. */
function fullyValid(s: State): boolean {
  const m = s.m;
  const b = m.board;
  const members = new Map<number, number[]>();
  for (let p = 0; p < m.n; p++) {
    const room = b.roomOf[s.placed[p]];
    members.set(room, [...(members.get(room) ?? []), p]);
  }
  const roomOfP = (p: number) => b.roomOf[s.placed[p]];
  if (m.target >= 0 && (members.get(roomOfP(m.target))?.length ?? 0) !== 2) return false;
  for (const g of m.group) {
    switch (g.kind) {
      case 'alone':
        if (members.get(roomOfP(m.index.get(g.p)!))!.length !== 1) return false;
        break;
      case 'notAlone':
        if (members.get(roomOfP(m.index.get(g.p)!))!.length < 2) return false;
        break;
      case 'targetAloneWithCulprit':
        if (members.get(roomOfP(m.index.get(g.p)!))!.length !== 2) return false;
        break;
      case 'withCount': {
        const p = m.index.get(g.p)!;
        const k = members.get(roomOfP(p))!.filter((q) => q !== p && (!g.gender || m.genders[q] === g.gender)).length;
        if (k !== g.count) return false;
        break;
      }
      case 'countOnObject':
        if ([...s.placed].filter((c) => b.typesOn[c].has(g.type)).length !== g.count) return false;
        break;
      case 'countBesideEdge':
        if ([...s.placed].filter((c) => b.edgesBeside[c].has(g.type)).length !== g.count) return false;
        break;
      case 'countInRoom':
        if ((members.get(b.roomIndex.get(g.room)!)?.length ?? 0) !== g.count) return false;
        break;
      case 'noEmptyRoom':
        for (const room of b.rooms) {
          if (room.cells.some((c) => b.occupiable[c]) && !members.has(room.index)) return false;
        }
        break;
      default:
        break;
    }
  }
  for (const bc of m.binary) {
    if (!binaryHolds(b, bc.clue, s.placed[bc.a], s.placed[bc.b])) return false;
    if (bc.clue.kind === 'aloneWith' && members.get(roomOfP(bc.a))!.length !== 2) return false;
  }
  return true;
}

/** Propaga con las técnicas básicas hasta punto fijo. Devuelve false si hay contradicción. */
function propagate(s: State, steps: Step[] | null, techniques: Technique[]): boolean {
  for (;;) {
    if (contradiction(s)) return false;
    if (s.unplaced.length === 0) return fullyValid(s);
    let progressed = false;
    for (const tech of techniques) {
      const step = tech(s);
      if (step) {
        steps?.push(step);
        progressed = true;
        break;
      }
    }
    if (!progressed) return true;
  }
}

/** Prueba y error de un nivel: suponer y ver si se llega a contradicción. */
function trial(s: State, techniques: Technique[]): Step | null {
  const un = s.unplaced.slice().sort((a, b) => s.count[a] - s.count[b]);
  for (const p of un) {
    if (s.count[p] > 4) continue;
    for (const cell of s.cells(p)) {
      const copy = s.clone();
      const tmp = emptyStep('single', [p]);
      place(copy, p, cell, tmp);
      const ok = propagate(copy, null, techniques);
      if (!ok) {
        const step = emptyStep('trial', [p]);
        step.info.assumed = { p, cell };
        s.remove(p, cell, step.eliminated);
        return step;
      }
    }
  }
  return null;
}

export interface HumanOptions {
  /** Permitir prueba y error. */
  allowTrial?: boolean;
  /** Límite de pasos de seguridad. */
  maxSteps?: number;
}

/** Resuelve como una persona y devuelve la traza. */
export function solveHuman(m: Model, opts: HumanOptions = {}): HumanResult {
  const allowTrial = opts.allowTrial ?? true;
  const maxSteps = opts.maxSteps ?? 500;
  const steps: Step[] = [];

  // Paso 0: lectura de pistas unarias (cada pista que reduce algo es un paso).
  const base = m.baseDomain;
  const doms = unaryDomains(m);
  const s = new State(m, doms);
  m.unary.forEach(({ p, clue }) => {
    const step = emptyStep('clue', [p]);
    step.info.clueIndex = m.clues.indexOf(clue);
    step.info.cells = doms[p];
    // eliminaciones informativas (no se re-aplican)
    for (const c of base[p]) if (!doms[p].includes(c)) step.eliminated.push({ p, cell: c });
    steps.push(step);
  });

  let contradictionFound = false;
  for (let guard = 0; guard < maxSteps; guard++) {
    if (contradiction(s)) {
      contradictionFound = true;
      break;
    }
    if (s.unplaced.length === 0) break;
    let step: Step | null = null;
    for (const tech of BASIC) {
      step = tech(s);
      if (step) break;
    }
    if (!step && allowTrial) step = trial(s, BASIC);
    if (!step) break;
    steps.push(step);
  }

  const solved = !contradictionFound && s.unplaced.length === 0 && fullyValid(s);
  const usage: HumanResult['usage'] = {};
  let score = 0;
  let maxLevel = 0;
  for (const st of steps) {
    usage[st.tech] = (usage[st.tech] ?? 0) + 1;
    score += TECHNIQUES[st.tech].weight;
    maxLevel = Math.max(maxLevel, TECHNIQUES[st.tech].level);
  }
  let placement: Placement | null = null;
  if (solved) {
    placement = {};
    for (let p = 0; p < m.n; p++) placement[m.ids[p]] = s.placed[p];
  }
  const candidates = Array.from({ length: m.n }, (_, p) => s.cells(p));
  return { solved, placement, steps, score, maxLevel, usage, contradiction: contradictionFound, candidates };
}

export type DifficultyLabel = 'Fácil' | 'Media' | 'Difícil' | 'Experta';

export function difficultyLabel(r: Pick<HumanResult, 'maxLevel' | 'score'>): DifficultyLabel {
  if (r.maxLevel <= 2) return 'Fácil';
  if (r.maxLevel <= 3) return 'Media';
  if (r.maxLevel <= 5) return 'Difícil';
  return 'Experta';
}
