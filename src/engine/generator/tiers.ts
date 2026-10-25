/**
 * Niveles de dificultad predefinidos, calibrados para imitar la progresión
 * del libro original: primero pistas de división/objeto, luego relaciones,
 * conteos y razonamientos más profundos.
 */
import type { ClueKind } from '../types';
import type { DifficultyTarget } from './generate';

export interface Tier {
  id: number;
  name: string;
  description: string;
  allowedKinds: ClueKind[];
  difficulty: DifficultyTarget;
  maxGlobal: number;
  maxPerPerson: number;
  targetMode: 'lastCell' | 'aloneWithCulprit';
  /** Tamaño recomendado de la cuadrícula (= nº de personajes incluido el objetivo). */
  sizes: number[];
}

const BASIC: ClueKind[] = ['inRoom', 'onObject', 'besideObject', 'besideEdge'];
const PLUS: ClueKind[] = [...BASIC, 'notInRoom', 'lineWithObject', 'notOnObject', 'onFloor', 'row', 'col'];
const REL: ClueKind[] = [...PLUS, 'alone', 'sameRoom', 'differentRoom', 'direction', 'notBesideObject', 'gridCorner'];
const ADV: ClueKind[] = [...REL, 'aloneWith', 'withCount', 'offset', 'roomCorner', 'notAlone', 'notBesideEdge', 'inRoomOneOf', 'roomEdgeLine'];
const GLOBAL: ClueKind[] = ['countOnObject', 'countInRoom', 'noEmptyRoom', 'countBesideEdge'];

export const TIERS: Tier[] = [
  {
    id: 1,
    name: 'Aprendiz',
    description: 'Pistas directas de división y objetos. La víctima está en la última casilla libre.',
    allowedKinds: BASIC,
    difficulty: { minScore: 6, maxScore: 22, maxLevel: 2 },
    maxGlobal: 0,
    maxPerPerson: 2,
    targetMode: 'lastCell',
    sizes: [6],
  },
  {
    id: 2,
    name: 'Detective',
    description: 'Aparecen negaciones, filas y columnas.',
    allowedKinds: PLUS,
    difficulty: { minScore: 14, maxScore: 34, maxLevel: 2 },
    maxGlobal: 0,
    maxPerPerson: 2,
    targetMode: 'lastCell',
    sizes: [7],
  },
  {
    id: 3,
    name: 'Inspectora',
    description: 'Relaciones entre personas (al norte de, a solas...).',
    allowedKinds: REL,
    difficulty: { minScore: 20, maxScore: 48, minLevel: 3, maxLevel: 3 },
    maxGlobal: 0,
    maxPerPerson: 2,
    targetMode: 'aloneWithCulprit',
    sizes: [8, 9],
  },
  {
    id: 4,
    name: 'Comisaria',
    description: 'Pistas globales, conteos y celdas intersectadas.',
    allowedKinds: [...ADV, ...GLOBAL],
    difficulty: { minScore: 34, maxScore: 70, minLevel: 3, maxLevel: 4 },
    maxGlobal: 1,
    maxPerPerson: 2,
    targetMode: 'aloneWithCulprit',
    sizes: [9, 10],
  },
  {
    id: 5,
    name: 'Leyenda',
    description: 'Todo vale: parejas de filas y algún razonamiento por hipótesis.',
    allowedKinds: [...ADV, ...GLOBAL],
    difficulty: { minScore: 50, maxScore: 120, minLevel: 4, maxLevel: 6 },
    maxGlobal: 1,
    maxPerPerson: 2,
    targetMode: 'aloneWithCulprit',
    sizes: [10, 11, 12],
  },
];

export function tierById(id: number): Tier {
  return TIERS.find((t) => t.id === id) ?? TIERS[0];
}
