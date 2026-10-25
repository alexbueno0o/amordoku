/**
 * Construcción de casos "en código": a partir de una definición de alto nivel
 * (escenario, reparto, historia y restricciones), genera las pistas con el
 * motor y devuelve un CaseFile listo para el libro.
 *
 * La usan los scripts que crean el libro por defecto y el ejemplo público.
 */
import { withOverrides, type AvatarSpec } from '../assets/avatar/types';
import { typeLookup } from '../catalog/objectTypes';
import { buildBoard, generateCase, tierById, type Clue, type ClueKind, type DifficultyTarget, type Pin, type Placement } from '../engine';
import { analyzeCase } from './caseModel';
import { lintScenario } from './dsl';
import type { CaseFile, Character, Project, Scenario } from './types';

const GLOBAL_KINDS = new Set<ClueKind>(['countOnObject', 'countInRoom', 'noEmptyRoom', 'countBesideEdge']);

export interface CasePersonDef {
  id: string;
  /** Vestuario/complementos solo para este caso. */
  look?: Partial<AvatarSpec>;
  /** Nombre distinto en este caso. */
  name?: string;
}

/** Restricción de historia con nombres de división legibles. */
export interface StoryPin {
  p: string;
  rooms?: string[];
  cells?: [number, number][];
}

export interface CaseDef {
  id: string;
  title: string;
  subtitle: string;
  pageColor: string;
  scenario: Scenario;
  /** Personajes propios de este caso (extras, animales, objetos). */
  extras?: Character[];
  people: (string | CasePersonDef)[];
  target: string;
  culprit: string;
  targetLabel: string;
  targetText?: string;
  targetMode?: 'lastCell' | 'aloneWithCulprit';
  culpritRef: string;
  question: string;
  answerNote?: string;
  tier: number;
  pins?: StoryPin[];
  fixedClues?: Clue[];
  /** Frase narrativa (sin efecto lógico) que se añade a la tarjeta de alguien. */
  flavor?: Record<string, string>;
  postIt?: { text: string; signature?: string };
  tip?: { title: string; text: string };
  legend?: string[];
  difficulty?: Partial<DifficultyTarget>;
  allowedKinds?: ClueKind[];
  /** Tipos de pista que NO queremos en este caso. */
  avoidKinds?: ClueKind[];
  maxGlobal?: number;
  maxPerPerson?: number;
  boldKeywords?: boolean;
  /** Tipos de objeto que no deben salir en las pistas (decorado). */
  skipTypes?: string[];
  seeds?: number[];
  attempts?: number;
  timeBudgetMs?: number;
  /** Suelos con frase para pistas tipo "estaba en la arena". */
  clueFloors?: string[];
  /** Colocación fija (si se quiere decidir a mano). */
  placement?: Record<string, [number, number]>;
}

export function roomIdByName(s: Scenario, name: string): string {
  const r = s.board.rooms.find((x) => x.name.toLowerCase() === name.toLowerCase());
  if (!r) throw new Error(`Escenario ${s.id}: no existe la división "${name}"`);
  return r.id;
}

export interface BuildReport {
  id: string;
  ok: boolean;
  message: string;
  size: number;
  score: number;
  level: number;
  clues: number;
  culprit: string;
  problems: string[];
}

/** Genera un caso a partir de su definición. */
export function buildCase(project: Project, def: CaseDef, number: number): { file: CaseFile; report: BuildReport } {
  const scen = def.scenario;
  const problems = lintScenario(scen);
  const people: CasePersonDef[] = def.people.map((p) => (typeof p === 'string' ? { id: p } : p));
  const chars = new Map(project.characters.map((c) => [c.id, c]));
  for (const p of people) if (!chars.has(p.id)) problems.push(`Personaje desconocido: ${p.id}`);
  const n = people.length;
  if (n !== scen.board.rows || n !== scen.board.cols) problems.push(`${n} personajes en un plano ${scen.board.rows}×${scen.board.cols}`);
  const board = buildBoard(scen.board, typeLookup());
  const persons = people.map((p) => ({ id: p.id, name: p.name ?? chars.get(p.id)?.name ?? p.id, gender: chars.get(p.id)?.gender ?? ('m' as const) }));
  const tier = tierById(def.tier);
  const pins: Pin[] = (def.pins ?? []).map((pin) => ({
    p: pin.p,
    rooms: pin.rooms?.map((r) => roomIdByName(scen, r)),
    cells: pin.cells?.map(([r, c]) => r * scen.board.cols + c),
  }));
  let allowed = def.allowedKinds ?? tier.allowedKinds;
  if (def.avoidKinds) allowed = allowed.filter((k) => !def.avoidKinds!.includes(k));
  const difficulty = { ...tier.difficulty, ...def.difficulty };
  const fixedPlacement: Placement | undefined = def.placement
    ? Object.fromEntries(Object.entries(def.placement).map(([id, [r, c]]) => [id, r * scen.board.cols + c]))
    : undefined;
  const seeds = def.seeds ?? [number * 101 + 7, number * 101 + 13, number * 101 + 29, number * 101 + 47];
  // Si con los tipos de pista del nivel no sale un caso único, se amplía poco a
  // poco el repertorio (manteniendo la dificultad pedida).
  const ladder: ClueKind[][] = [allowed];
  if (!def.allowedKinds) {
    for (const t of [def.tier + 1, def.tier + 2]) {
      const extra = tierById(t).allowedKinds.filter((k) => !allowed.includes(k) && !def.avoidKinds?.includes(k) && !GLOBAL_KINDS.has(k));
      if (extra.length) ladder.push([...ladder[ladder.length - 1], ...extra.filter((k) => !ladder[ladder.length - 1].includes(k))]);
    }
  }
  let best: ReturnType<typeof generateCase> | null = null;
  let usedKinds = allowed;
  outer: for (const kinds of ladder) for (const seed of seeds) {
    const res = generateCase({
      board,
      persons,
      targetId: def.target,
      targetMode: def.targetMode ?? tier.targetMode,
      culpritId: def.culprit,
      pins,
      fixedClues: def.fixedClues,
      allowedKinds: kinds,
      maxGlobal: def.maxGlobal ?? tier.maxGlobal,
      maxPerPerson: def.maxPerPerson ?? tier.maxPerPerson,
      difficulty,
      seed,
      attempts: def.attempts ?? 40,
      timeBudgetMs: def.timeBudgetMs ?? 25000,
      skipTypes: [...(def.skipTypes ?? []), 'pond', 'railing', 'crowd', 'track'],
      clueFloors: def.clueFloors,
      fixedPlacement,
    });
    if (!best || (res.ok && !best.ok) || (res.clues.length && !best.clues.length)) {
      best = res;
      usedKinds = kinds;
    }
    if (res.ok) break outer;
  }
  const res = best!;
  if (usedKinds !== allowed) problems.push(`(aviso) se ampliaron los tipos de pista: ${usedKinds.filter((k) => !allowed.includes(k)).join(', ')}`);
  const flavor: Clue[] = Object.entries(def.flavor ?? {}).map(([p, text]) => ({ kind: 'flavor', p, text }));
  const file: CaseFile = {
    id: def.id,
    title: def.title,
    subtitle: def.subtitle,
    scenarioId: scen.id,
    people: people.map((p) => ({ characterId: p.id, avatarOverride: p.look, nameOverride: p.name })),
    targetId: def.target,
    targetLabel: def.targetLabel,
    targetText: def.targetText,
    targetMode: def.targetMode ?? tier.targetMode,
    culpritRef: def.culpritRef,
    question: def.question,
    answerNote: def.answerNote,
    clues: [...res.clues, ...flavor],
    postIt: def.postIt ? { text: def.postIt.text, signature: def.postIt.signature ?? project.book.narratorName } : undefined,
    tip: def.tip,
    legend: def.legend,
    pageColor: def.pageColor,
    boldKeywords: def.boldKeywords ?? def.tier <= 1,
    generator: { tier: def.tier, seed: seeds[0], pins, culpritId: def.culprit, fixedClues: def.fixedClues },
  };
  // Analizar con el proyecto que ya contiene el escenario.
  const tmp: Project = { ...project, scenarios: project.scenarios.some((s) => s.id === scen.id) ? project.scenarios : [...project.scenarios, scen] };
  const a = analyzeCase(tmp, file);
  if (a) {
    file.solution = a.human.placement ?? res.placement;
    file.culpritId = a.culpritId ?? undefined;
    file.explanation = a.explanation;
    file.difficulty = a.difficulty;
    problems.push(...a.errors);
    if (a.culpritId && a.culpritId !== def.culprit) problems.push(`El culpable salió ${a.culpritId} en vez de ${def.culprit}`);
  }
  return {
    file,
    report: {
      id: def.id,
      ok: res.ok && problems.every((p) => p.startsWith('(aviso)')),
      message: res.message,
      size: n,
      score: file.difficulty?.score ?? 0,
      level: file.difficulty?.level ?? 0,
      clues: res.clues.length,
      culprit: file.culpritId ?? '',
      problems,
    },
  };
}

/** Aplica el vestuario del caso a un personaje (para previsualizar). */
export function lookOf(base: Character, look?: Partial<AvatarSpec>): AvatarSpec {
  return withOverrides(base.avatar, look);
}
