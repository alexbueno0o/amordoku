/**
 * Tests del motor lógico: semántica de pistas, solucionadores y generador.
 */
import { describe, expect, it } from 'vitest';
import { typeLookup } from '../src/catalog/objectTypes';
import {
  autoClueText,
  buildBoard,
  compileModel,
  countSolutions,
  explainSolution,
  generateCase,
  randomBoard,
  solveHuman,
  TIERS,
  validatePlacement,
  type BoardSpec,
  type Clue,
  type PersonSpec,
} from '../src/engine';

/** Plano 6x6 con cuatro divisiones de 3x3, parecido al primer caso del libro. */
function smallBoard(): BoardSpec {
  const cells = [];
  for (let r = 0; r < 6; r++)
    for (let c = 0; c < 6; c++)
      cells.push({ room: r < 3 ? (c < 3 ? 'sala' : 'dorm') : c < 3 ? 'salon' : 'comedor', floor: 'wood' });
  return {
    rows: 6,
    cols: 6,
    cells,
    rooms: [
      { id: 'sala', name: 'Sala', article: 'la' },
      { id: 'dorm', name: 'Dormitorio', article: 'el' },
      { id: 'salon', name: 'Salón principal', article: 'el' },
      { id: 'comedor', name: 'Comedor', article: 'el' },
    ],
    objects: [
      { id: 'o1', type: 'carpet', r: 1, c: 2, w: 1, h: 1 },
      { id: 'o2', type: 'bed', r: 1, c: 4, w: 1, h: 2 },
      { id: 'o3', type: 'table', r: 3, c: 0, w: 1, h: 1 },
      { id: 'o4', type: 'table', r: 5, c: 0, w: 1, h: 1 },
      { id: 'o5', type: 'plant', r: 4, c: 2, w: 1, h: 1 },
      { id: 'o6', type: 'table', r: 3, c: 5, w: 1, h: 1 },
      { id: 'o7', type: 'plant', r: 4, c: 5, w: 1, h: 1 },
    ],
    edges: [
      { id: 'w1', type: 'window', r: 0, c: 1, side: 'top' },
      { id: 'w2', type: 'window', r: 0, c: 4, side: 'top' },
    ],
  };
}

const PEOPLE: PersonSpec[] = [
  { id: 'A', name: 'Leo', gender: 'm' },
  { id: 'V', name: 'Ana', gender: 'f' },
  { id: 'C', name: 'Carlos', gender: 'm' },
  { id: 'M', name: 'Mauro', gender: 'm' },
  { id: 'P', name: 'Pilar', gender: 'f' },
  { id: 'T', name: 'La croqueta', gender: 'f' },
];

describe('board', () => {
  it('calcula ocupables, al lado y esquinas', () => {
    const b = buildBoard(smallBoard(), typeLookup());
    expect(b.occupiable[3 * 6 + 0]).toBe(false); // mesa
    expect(b.occupiable[1 * 6 + 4]).toBe(true); // cama
    expect(b.typesBeside[2 * 6 + 0].has('table')).toBe(false); // otra división
    expect(b.typesBeside[4 * 6 + 0].has('table')).toBe(true);
    expect(b.edgesBeside[0 * 6 + 1].has('window')).toBe(true);
    expect(b.gridCorner[0]).toBe(true);
    expect(b.roomCorner[0]).toBe(true);
    expect(b.roomCorner[1]).toBe(false);
  });
});

describe('textos en español', () => {
  it('concuerda género, artículo y contracciones', () => {
    const b = buildBoard(smallBoard(), typeLookup());
    const ctx = {
      board: b,
      name: (id: string) => PEOPLE.find((p) => p.id === id)!.name,
      gender: (id: string) => PEOPLE.find((p) => p.id === id)!.gender,
    };
    expect(autoClueText({ kind: 'onObject', p: 'V', type: 'bed' }, ctx)).toBe('Estaba en la cama.');
    expect(autoClueText({ kind: 'besideObject', p: 'A', type: 'plant' }, ctx)).toBe('Estaba al lado de una planta.');
    expect(autoClueText({ kind: 'alone', p: 'V' }, ctx)).toBe('Estaba sola.');
    expect(autoClueText({ kind: 'inRoom', p: 'A', room: 'salon' }, ctx)).toBe('Estaba en el salón principal.');
    expect(autoClueText({ kind: 'direction', p: 'A', q: 'V', dir: 'N' }, ctx)).toBe('Estaba al norte de **Ana**.');
    expect(autoClueText({ kind: 'notBesideObject', p: 'A', type: 'table' }, ctx)).toBe('No estaba al lado de ninguna mesa.');
  });
});

describe('solucionadores', () => {
  it('el exacto y el humano coinciden en un caso pequeño', () => {
    const spec = smallBoard();
    const b = buildBoard(spec, typeLookup());
    const res = generateCase({
      board: b,
      persons: PEOPLE,
      targetId: 'T',
      targetMode: 'lastCell',
      allowedKinds: TIERS[0].allowedKinds,
      difficulty: TIERS[0].difficulty,
      maxPerPerson: 2,
      seed: 7,
      attempts: 80,
    });
    expect(res.clues.length).toBeGreaterThan(0);
    const m = compileModel({ board: b, persons: PEOPLE, targetId: 'T', clues: res.clues });
    const exact = countSolutions(m, { limit: 3 });
    expect(exact.count).toBe(1);
    const h = solveHuman(m);
    expect(h.solved).toBe(true);
    expect(h.placement).toEqual(exact.solutions[0]);
    const genders = Object.fromEntries(PEOPLE.map((p) => [p.id, p.gender]));
    const v = validatePlacement(b, PEOPLE.map((p) => p.id), genders, 'T', res.clues, h.placement!);
    expect(v.ok).toBe(true);
    expect(v.culprit).toBe(res.culprit);
  });

  it('detecta casos con varias soluciones', () => {
    const b = buildBoard(smallBoard(), typeLookup());
    const clues: Clue[] = [{ kind: 'inRoom', p: 'A', room: 'sala' }];
    const m = compileModel({ board: b, persons: PEOPLE, targetId: 'T', clues });
    expect(countSolutions(m, { limit: 2 }).count).toBe(2);
    expect(solveHuman(m).solved).toBe(false);
  });

  it('las deducciones humanas nunca eliminan la solución real', () => {
    for (let seed = 1; seed <= 4; seed++) {
      const spec = randomBoard({ size: 8, seed });
      const b = buildBoard(spec, typeLookup());
      const persons = 'ABCDEFGH'.split('').map((id, i) => ({ id, name: id, gender: (i % 2 ? 'f' : 'm') as 'm' | 'f' }));
      const res = generateCase({
        board: b,
        persons,
        targetId: 'H',
        targetMode: 'aloneWithCulprit',
        allowedKinds: TIERS[3].allowedKinds,
        difficulty: TIERS[3].difficulty,
        maxGlobal: 1,
        seed,
        attempts: 20,
      });
      if (!res.clues.length) continue;
      const m = compileModel({ board: b, persons, targetId: 'H', clues: res.clues });
      const h = solveHuman(m);
      for (const st of h.steps) {
        if (st.tech === 'clue') continue;
        for (const e of st.eliminated) expect(res.placement[m.ids[e.p]]).not.toBe(e.cell);
      }
      expect(countSolutions(m, { limit: 2 }).count).toBe(1);
    }
  });

  it('genera una explicación legible', () => {
    const b = buildBoard(smallBoard(), typeLookup());
    const res = generateCase({
      board: b,
      persons: PEOPLE,
      targetId: 'T',
      targetMode: 'lastCell',
      allowedKinds: TIERS[0].allowedKinds,
      difficulty: TIERS[0].difficulty,
      maxPerPerson: 2,
      seed: 3,
      attempts: 80,
    });
    const m = compileModel({ board: b, persons: PEOPLE, targetId: 'T', clues: res.clues });
    const h = solveHuman(m);
    const lines = explainSolution(m, h, {
      text: { board: b, name: (id) => PEOPLE.find((p) => p.id === id)!.name, gender: (id) => PEOPLE.find((p) => p.id === id)!.gender },
      culpritId: res.culprit,
      culpritRef: 'quien se comió la croqueta',
    });
    expect(lines.length).toBeGreaterThan(1);
    expect(lines[lines.length - 1]).toContain('quien se comió la croqueta');
  });
});
