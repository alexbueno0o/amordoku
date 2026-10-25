/**
 * Puente entre el modelo de la app (Project/CaseFile) y el motor lógico.
 */
import { withOverrides, type AvatarSpec } from '../assets/avatar/types';
import { floorDef } from '../assets/floors';
import { typeLookup } from '../catalog/objectTypes';
import {
  buildBoard,
  clueText,
  compileModel,
  countSolutions,
  difficultyLabel,
  explainSolution,
  solveHuman,
  validatePlacement,
  type Board,
  type Clue,
  type HumanResult,
  type Model,
  type PersonSpec,
  type TextContext,
} from '../engine';
import { guessPersonArticle } from './names';
import type { CaseFile, Character, Project, Scenario } from './types';

export interface CaseContext {
  scenario: Scenario;
  board: Board;
  persons: PersonSpec[];
  characters: Character[];
  text: TextContext;
  model: Model;
}

const boardCache = new WeakMap<Scenario, Board>();

export function boardOf(s: Scenario): Board {
  let b = boardCache.get(s);
  if (!b) {
    b = buildBoard(s.board, typeLookup());
    boardCache.set(s, b);
  }
  return b;
}

export function findCharacter(p: Project, id: string): Character | undefined {
  return p.characters.find((c) => c.id === id);
}

/** Nombre visible de una persona en un caso (respeta el cambio de nombre del caso). */
export function displayName(p: Project, c: CaseFile, id: string): string {
  const cp = c.people.find((x) => x.characterId === id);
  return cp?.nameOverride || findCharacter(p, id)?.name || id;
}

/** Avatar final de una persona en un caso (con su vestuario del caso). */
export function caseAvatar(p: Project, c: CaseFile, id: string): AvatarSpec | undefined {
  const ch = findCharacter(p, id);
  if (!ch) return undefined;
  const cp = c.people.find((x) => x.characterId === id);
  return withOverrides(ch.avatar, cp?.avatarOverride);
}

export function caseContext(p: Project, c: CaseFile, clues: Clue[] = c.clues): CaseContext | null {
  const scenario = p.scenarios.find((s) => s.id === c.scenarioId);
  if (!scenario) return null;
  const board = boardOf(scenario);
  const characters = c.people.map((cp) => findCharacter(p, cp.characterId)).filter(Boolean) as Character[];
  const persons: PersonSpec[] = c.people.map((cp) => {
    const ch = findCharacter(p, cp.characterId);
    return { id: cp.characterId, name: cp.nameOverride || ch?.name || cp.characterId, gender: ch?.gender ?? 'm' };
  });
  const text: TextContext = {
    board,
    name: (id) => persons.find((x) => x.id === id)?.name ?? id,
    gender: (id) => persons.find((x) => x.id === id)?.gender ?? 'm',
    bold: c.boldKeywords,
    floorPhrase: (key) => scenario.floors[key]?.phrase ?? floorDef(scenario.floors[key]?.pattern ?? key).phrase ?? `en ${key}`,
    culpritRef: c.culpritRef,
    article: (id) => {
      const ch = findCharacter(p, id);
      const ps = persons.find((x) => x.id === id);
      return guessPersonArticle(ps?.name ?? id, ps?.gender ?? 'm', ch?.article);
    },
  };
  const model = compileModel({ board, persons, targetId: c.targetId, clues });
  return { scenario, board, persons, characters, text, model };
}

/** Texto final de una pista en un caso. */
export function caseClueText(ctx: CaseContext, clue: Clue): string {
  return clueText(clue, ctx.text);
}

export interface CaseAnalysis {
  human: HumanResult;
  /** Número de soluciones (hasta 2). */
  solutions: number;
  aborted: boolean;
  culpritId: string | null;
  errors: string[];
  explanation: string[];
  difficulty: { score: number; level: number; label: string };
}

/** Resuelve un caso, comprueba unicidad y genera explicación. */
export function analyzeCase(p: Project, c: CaseFile): CaseAnalysis | null {
  const ctx = caseContext(p, c);
  if (!ctx) return null;
  const human = solveHuman(ctx.model, { allowTrial: true });
  const exact = countSolutions(ctx.model, { limit: 2, maxNodes: 3_000_000 });
  const errors: string[] = [];
  const n = ctx.persons.length;
  if (n !== ctx.board.rows || n !== ctx.board.cols)
    errors.push(`Hay ${n} personajes pero el plano es de ${ctx.board.rows}×${ctx.board.cols}: deben coincidir.`);
  let culpritId: string | null = null;
  const placement = human.placement ?? exact.solutions[0];
  if (placement) {
    const genders = Object.fromEntries(ctx.persons.map((x) => [x.id, x.gender]));
    const v = validatePlacement(ctx.board, ctx.persons.map((x) => x.id), genders, c.targetId, c.clues, placement);
    culpritId = v.culprit;
    errors.push(...v.errors);
  }
  if (exact.count === 0) errors.push('El caso no tiene solución: alguna pista es contradictoria.');
  if (exact.count > 1) errors.push('El caso tiene varias soluciones: añade o cambia pistas.');
  const explanation =
    human.solved && culpritId
      ? explainSolution(ctx.model, human, { text: ctx.text, culpritId, culpritRef: c.culpritRef })
      : [];
  return {
    human,
    solutions: exact.count,
    aborted: exact.aborted,
    culpritId,
    errors,
    explanation,
    difficulty: { score: human.score, level: human.maxLevel, label: difficultyLabel(human) },
  };
}
