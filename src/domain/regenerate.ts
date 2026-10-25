/**
 * Generación de pistas para un caso creado desde la app.
 *
 * Recibe el caso tal como lo ha montado el usuario (escenario, reparto,
 * objetivo, "chinchetas" de la historia...) y devuelve el caso con pistas
 * nuevas, solución, explicación y dificultad. Se ejecuta dentro de un web
 * worker para que la interfaz no se congele.
 */
import { typeLookup } from '../catalog/objectTypes';
import { buildBoard, generateCase, tierById, type Clue, type ClueKind, type GenerateResult, type Pin } from '../engine';
import { analyzeCase, findCharacter } from './caseModel';
import type { CaseFile, Project } from './types';

export interface RegenerateOptions {
  tier: number;
  seed: number;
  /** Culpable elegido por el autor (si se omite, lo decide el generador). */
  culpritId?: string;
  /** Restricciones de historia (divisiones o celdas permitidas por persona). */
  pins?: Pin[];
  /** Pistas que deben aparecer sí o sí. */
  fixedClues?: Clue[];
  attempts?: number;
  timeBudgetMs?: number;
}

export interface RegenerateResult {
  ok: boolean;
  message: string;
  caseFile: CaseFile;
}

const GLOBAL_KINDS = new Set<ClueKind>(['countOnObject', 'countInRoom', 'noEmptyRoom', 'countBesideEdge']);

/** Comprueba que el caso se puede generar y explica qué falta si no. */
export function caseReadiness(project: Project, c: CaseFile): string[] {
  const problems: string[] = [];
  const scen = project.scenarios.find((s) => s.id === c.scenarioId);
  if (!scen) return ['Elige un escenario.'];
  const n = c.people.length;
  const { rows, cols } = scen.board;
  if (rows !== cols) problems.push(`El plano es de ${rows}×${cols}: tiene que ser cuadrado.`);
  if (n !== rows) problems.push(`El plano es de ${rows}×${cols}: necesitas ${rows} personajes contando el objetivo (ahora hay ${n}).`);
  if (!c.targetId || !c.people.some((p) => p.characterId === c.targetId)) problems.push('Marca quién es el objetivo (víctima, croqueta...).');
  return problems;
}

/** Genera pistas nuevas para el caso. */
export function regenerateCase(project: Project, c: CaseFile, opts: RegenerateOptions): RegenerateResult {
  const problems = caseReadiness(project, c);
  if (problems.length) return { ok: false, message: problems.join(' '), caseFile: c };
  const scen = project.scenarios.find((s) => s.id === c.scenarioId)!;
  const board = buildBoard(scen.board, typeLookup());
  const persons = c.people.map((cp) => {
    const ch = findCharacter(project, cp.characterId);
    return { id: cp.characterId, name: cp.nameOverride || ch?.name || cp.characterId, gender: ch?.gender ?? ('m' as const) };
  });
  const tier = tierById(opts.tier);
  const targetMode = tier.targetMode;

  // Si con los tipos de pista del nivel no sale, se amplía el repertorio.
  const ladder: ClueKind[][] = [tier.allowedKinds];
  for (const t of [opts.tier + 1, opts.tier + 2]) {
    const prev = ladder[ladder.length - 1];
    const extra = tierById(t).allowedKinds.filter((k) => !prev.includes(k) && !GLOBAL_KINDS.has(k));
    if (extra.length) ladder.push([...prev, ...extra]);
  }
  const seeds = [opts.seed, opts.seed + 7919, opts.seed + 104729];
  let best: GenerateResult | null = null;
  outer: for (const kinds of ladder)
    for (const seed of seeds) {
      const res = generateCase({
        board,
        persons,
        targetId: c.targetId,
        targetMode,
        culpritId: opts.culpritId || undefined,
        pins: opts.pins,
        fixedClues: opts.fixedClues,
        allowedKinds: kinds,
        maxGlobal: tier.maxGlobal,
        maxPerPerson: tier.maxPerPerson,
        difficulty: tier.difficulty,
        seed,
        attempts: opts.attempts ?? 40,
        timeBudgetMs: opts.timeBudgetMs ?? 20000,
        skipTypes: ['pond', 'railing', 'crowd', 'track'],
        clueFloors: Object.entries(scen.floors)
          .filter(([, f]) => !!f.phrase)
          .map(([k]) => k),
      });
      if (!best || (res.ok && !best.ok) || (res.clues.length && !best.clues.length)) best = res;
      if (res.ok) break outer;
    }
  const res = best!;
  if (!res.clues.length) return { ok: false, message: res.message, caseFile: c };

  const flavor = c.clues.filter((cl) => cl.kind === 'flavor');
  const next: CaseFile = {
    ...c,
    targetMode,
    clues: [...res.clues, ...flavor],
    boldKeywords: opts.tier <= 1 ? true : c.boldKeywords,
    generator: { tier: opts.tier, seed: opts.seed, pins: opts.pins, culpritId: opts.culpritId, fixedClues: opts.fixedClues },
  };
  const analyzed = refreshAnalysis(project, next);
  return { ok: res.ok, message: res.message, caseFile: analyzed };
}

/** Recalcula solución, culpable, dificultad y explicación de un caso. */
export function refreshAnalysis(project: Project, c: CaseFile): CaseFile {
  const a = analyzeCase(project, c);
  if (!a) return c;
  return {
    ...c,
    solution: a.human.placement ?? undefined,
    culpritId: a.culpritId ?? undefined,
    difficulty: a.difficulty,
    explanation: c.explanationEdited ? c.explanation : a.explanation,
  };
}
