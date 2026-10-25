/**
 * Generador de casos.
 *
 * 1. Elige una colocación válida (respetando las "chinchetas" de la historia:
 *    p. ej. Ana en la terraza, Leo junto a la paella).
 * 2. Calcula todas las pistas verdaderas para esa colocación.
 * 3. Elige pistas guiado por contraejemplos: mientras exista otra solución,
 *    añade una pista que la descarte.
 * 4. Poda pistas sobrantes y ajusta la dificultad con el solucionador humano.
 */
import type { Board } from '../board';
import { clueHolds, isUnary, unaryHolds, validatePlacement, type GroupContext } from '../clues/semantics';
import { Rng } from '../rng';
import { countSolutions } from '../solver/exact';
import { solveHuman, type HumanResult } from '../solver/human';
import { compileModel } from '../solver/model';
import type { Clue, ClueKind, Gender, PersonSpec, Placement } from '../types';
import { candidateClues, clueKey, KIND_WEIGHT } from './candidates';

/** Restricción de historia: dónde puede estar alguien. */
export interface Pin {
  p: string;
  cells?: number[];
  rooms?: string[];
}

export interface DifficultyTarget {
  minScore: number;
  maxScore: number;
  minLevel?: number;
  maxLevel: number;
}

export interface GenerateInput {
  board: Board;
  persons: PersonSpec[];
  targetId: string;
  targetMode: 'lastCell' | 'aloneWithCulprit';
  culpritId?: string;
  pins?: Pin[];
  /** Pistas que el autor quiere sí o sí (deben ser ciertas). */
  fixedClues?: Clue[];
  allowedKinds: ClueKind[];
  maxGlobal?: number;
  maxPerPerson?: number;
  difficulty: DifficultyTarget;
  seed?: number;
  attempts?: number;
  timeBudgetMs?: number;
  preferKinds?: Partial<Record<ClueKind, number>>;
  clueFloors?: string[];
  /** Colocación fija decidida por el autor (si no, se sortea). */
  fixedPlacement?: Placement;
  /** Personas a las que no se les puede poner pista posicional (solo texto narrativo). */
  skipTypes?: string[];
}

export interface GenerateResult {
  ok: boolean;
  clues: Clue[];
  placement: Placement;
  culprit: string;
  human: HumanResult;
  message: string;
  attemptsUsed: number;
}

/* ------------------------------------------------------------------------- */

function pinDomain(b: Board, p: string, pins: Pin[] | undefined): number[] {
  const pin = pins?.find((x) => x.p === p);
  const out: number[] = [];
  for (let i = 0; i < b.size; i++) {
    if (!b.occupiable[i]) continue;
    if (pin?.cells && !pin.cells.includes(i)) continue;
    if (pin?.rooms && !pin.rooms.some((r) => b.roomIndex.get(r) === b.roomOf[i])) continue;
    out.push(i);
  }
  return out;
}

/** Sortea una colocación válida. */
export function samplePlacement(
  b: Board,
  ids: string[],
  targetId: string,
  culpritId: string | undefined,
  pins: Pin[] | undefined,
  rng: Rng,
  check?: (pl: Placement) => boolean,
  tries = 400,
  featureBias = 1,
): Placement | null {
  const doms = new Map(ids.map((id) => [id, pinDomain(b, id, pins)]));
  // Sesgo hacia celdas "interesantes" (sobre/junto a objetos, ventanas...):
  // así las pistas salen más naturales, como en el libro original.
  const richness = (c: number) => 1 + featureBias * (b.typesOn[c].size * 2 + b.typesBeside[c].size + b.edgesBeside[c].size);
  const orderByBias = (cells: number[]) =>
    cells
      .map((c) => ({ c, k: Math.pow(rng.next(), 1 / richness(c)) }))
      .sort((x, y) => y.k - x.k)
      .map((x) => x.c);
  const rowOf = (c: number) => Math.floor(c / b.cols);
  const colOf = (c: number) => c % b.cols;
  for (let attempt = 0; attempt < tries; attempt++) {
    const pl: Placement = {};
    const usedR = new Set<number>();
    const usedC = new Set<number>();
    const tDom = doms.get(targetId)!;
    if (!tDom.length) return null;
    const t = orderByBias(tDom)[0];
    pl[targetId] = t;
    usedR.add(rowOf(t));
    usedC.add(colOf(t));
    const room = b.roomOf[t];
    // Culpable en la misma división
    const culpritOptions = (culpritId ? [culpritId] : ids.filter((id) => id !== targetId)).filter((id) =>
      doms.get(id)!.some((c) => b.roomOf[c] === room && !usedR.has(rowOf(c)) && !usedC.has(colOf(c))),
    );
    if (!culpritOptions.length) continue;
    const culprit = rng.pick(culpritOptions);
    const cc = orderByBias(doms.get(culprit)!.filter((c) => b.roomOf[c] === room && !usedR.has(rowOf(c)) && !usedC.has(colOf(c))))[0];
    pl[culprit] = cc;
    usedR.add(rowOf(cc));
    usedC.add(colOf(cc));
    // Resto: fuera de la división del objetivo, DFS aleatorio con MRV
    const rest = ids.filter((id) => id !== targetId && id !== culprit);
    let nodes = 0;
    const dfs = (left: string[]): boolean => {
      if (++nodes > 4000) return false;
      if (!left.length) return true;
      let best = -1;
      let bestOpts: number[] = [];
      for (let i = 0; i < left.length; i++) {
        const opts = doms.get(left[i])!.filter((c) => b.roomOf[c] !== room && !usedR.has(rowOf(c)) && !usedC.has(colOf(c)));
        if (!opts.length) return false;
        if (best < 0 || opts.length < bestOpts.length) {
          best = i;
          bestOpts = opts;
        }
      }
      const id = left[best];
      const nextLeft = left.filter((_, i) => i !== best);
      for (const c of orderByBias(bestOpts)) {
        pl[id] = c;
        usedR.add(rowOf(c));
        usedC.add(colOf(c));
        if (dfs(nextLeft)) return true;
        usedR.delete(rowOf(c));
        usedC.delete(colOf(c));
        delete pl[id];
      }
      return false;
    };
    if (!dfs(rest)) continue;
    if (check && !check(pl)) continue;
    return pl;
  }
  return null;
}

/* ------------------------------------------------------------------------- */

interface Evaluated {
  clues: Clue[];
  human: HumanResult;
  distance: number;
}

function distanceTo(h: HumanResult, d: DifficultyTarget): number {
  if (!h.solved) return 1e6;
  let dist = 0;
  if (h.maxLevel > d.maxLevel) dist += 1000 * (h.maxLevel - d.maxLevel);
  if (d.minLevel !== undefined && h.maxLevel < d.minLevel) dist += 200 * (d.minLevel - h.maxLevel);
  if (h.score < d.minScore) dist += d.minScore - h.score;
  if (h.score > d.maxScore) dist += h.score - d.maxScore;
  return dist;
}

/**
 * Genera las pistas de un caso.
 *
 * Idea clave: el solucionador humano solo hace deducciones correctas, así que
 * si consigue colocar a todo el mundo, la solución es única. Eso permite
 * generar rápido sin el solucionador exacto en el bucle (se usa solo al final
 * como comprobación independiente).
 */
export function generateCase(input: GenerateInput): GenerateResult {
  const rng = new Rng(input.seed ?? Date.now());
  const b = input.board;
  const ids = input.persons.map((p) => p.id);
  const genders: Record<string, Gender> = Object.fromEntries(input.persons.map((p) => [p.id, p.gender]));
  const allowed = new Set(input.allowedKinds);
  const maxPer = input.maxPerPerson ?? 2;
  const maxGlobal = input.maxGlobal ?? 0;
  const attempts = input.attempts ?? 60;
  const deadline = Date.now() + (input.timeBudgetMs ?? 15000);
  const fixed = input.fixedClues ?? [];
  const fixedKeys = new Set(fixed.map(clueKey));
  const diff = input.difficulty;
  const allowTrial = diff.maxLevel >= 6;
  const weight = (c: Clue) => (input.preferKinds?.[c.kind] ?? KIND_WEIGHT[c.kind] ?? 1) * ('only' in c && c.only ? 0.6 : 1);
  const targetClue: Clue[] = input.targetMode === 'aloneWithCulprit' ? [{ kind: 'targetAloneWithCulprit', p: input.targetId }] : [];

  const modelOf = (clues: Clue[]) => compileModel({ board: b, persons: input.persons, targetId: input.targetId, clues });
  const human = (clues: Clue[]) => solveHuman(modelOf(clues), { allowTrial });
  const okLevel = (h: HumanResult) => h.solved && h.maxLevel <= diff.maxLevel;
  const stylePenalty = (clues: Clue[]) =>
    ids.reduce((acc, p) => acc + Math.max(0, countFor(p, clues) - maxPer) * 25, 0) +
    Math.max(0, globalCount(clues) - maxGlobal) * 25;
  const evaluate = (clues: Clue[]): Evaluated => {
    const h = human(clues);
    return { clues, human: h, distance: distanceTo(h, diff) + stylePenalty(clues) };
  };
  const countFor = (p: string, cl: Clue[]) =>
    cl.filter((c) => 'p' in c && c.p === p && c.kind !== 'targetAloneWithCulprit').length;
  const globalCount = (cl: Clue[]) => cl.filter((c) => !('p' in c)).length;
  const isRemovable = (c: Clue) => !fixedKeys.has(clueKey(c)) && c.kind !== 'targetAloneWithCulprit';

  let best: (Evaluated & { placement: Placement; culprit: string }) | null = null;
  let used = 0;

  for (let attempt = 0; attempt < attempts && Date.now() < deadline; attempt++) {
    used++;
    const fixedCheck = (pl: Placement) => {
      const ctx: GroupContext = { board: b, placement: pl, genders, targetId: input.targetId };
      return fixed.every((c) => clueHolds(c, ctx));
    };
    const placement =
      input.fixedPlacement ?? samplePlacement(b, ids, input.targetId, input.culpritId, input.pins, rng, fixedCheck);
    if (!placement) continue;
    const val = validatePlacement(b, ids, genders, input.targetId, [], placement);
    if (!val.culprit) continue;

    const { perPerson, globals } = candidateClues({
      board: b,
      ids,
      genders,
      targetId: input.targetId,
      placement,
      allowed,
      rng,
      clueFloors: new Set(input.clueFloors ?? []),
      skipTypes: new Set(input.skipTypes ?? []),
    });

    // Fase A: una pista por sospechoso (si no tiene ya una fija).
    let clues: Clue[] = [...targetClue, ...fixed];
    for (const p of rng.shuffle(ids.filter((id) => id !== input.targetId))) {
      if (countFor(p, clues) > 0) continue;
      const opts = perPerson.get(p) ?? [];
      if (opts.length) clues.push(rng.weighted(opts, weight));
    }

    // Fase B: mientras el solucionador humano se atasque, probar varias pistas
    // candidatas (mirando hacia delante) y quedarse con la que más avanza.
    const progress = (hr: HumanResult) =>
      hr.solved ? -1 : hr.candidates.reduce((acc, c) => acc + Math.log2(Math.max(1, c.length)), 0);
    let h = human(clues);
    for (let guard = 0; guard < 60 && !okLevel(h); guard++) {
      if (h.contradiction) break;
      const have = new Set(clues.map(clueKey));
      const options: { clue: Clue; prior: number }[] = [];
      h.candidates.forEach((cands, i) => {
        const p = ids[i];
        if (cands.length <= 1 || p === input.targetId) return;
        if (countFor(p, clues) >= maxPer + 1) return;
        const crowd = countFor(p, clues) >= maxPer ? 0.15 : 1; // penaliza pasar de maxPer
        for (const c of perPerson.get(p) ?? []) {
          if (have.has(clueKey(c))) continue;
          let gain = 1.5;
          if (isUnary(c)) {
            const keep = cands.filter((cell) => unaryHolds(b, c, cell)).length;
            if (keep === cands.length) continue; // no aporta nada ahora mismo
            gain = cands.length / Math.max(1, keep);
          }
          options.push({ clue: c, prior: weight(c) * crowd * Math.sqrt(gain) });
        }
      });
      if (globalCount(clues) < maxGlobal) for (const c of globals) if (!have.has(clueKey(c))) options.push({ clue: c, prior: weight(c) * 1.2 });
      if (!options.length) break;
      // Muestra de opciones (las de más prior + algunas al azar) evaluadas de verdad.
      const sorted = options.slice().sort((a, b2) => b2.prior - a.prior);
      const sample = new Set(sorted.slice(0, 10));
      for (let k = 0; k < 8; k++) sample.add(rng.weighted(options, (o) => o.prior));
      const base = progress(h);
      const scored: { clue: Clue; h: HumanResult; score: number }[] = [];
      for (const o of sample) {
        const h2 = human([...clues, o.clue]);
        const gainReal = base - progress(h2);
        if (gainReal <= 0 && !okLevel(h2)) continue;
        scored.push({ clue: o.clue, h: h2, score: (okLevel(h2) ? base + 5 : gainReal) * Math.sqrt(o.prior) });
      }
      if (!scored.length) {
        // Nada mejora mirando hacia delante: añadimos la de más prior y seguimos.
        clues.push(sorted[0].clue);
        h = human(clues);
        continue;
      }
      scored.sort((a, b2) => b2.score - a.score);
      const top = scored.slice(0, 3);
      const chosen = rng.weighted(top, (x) => x.score);
      clues.push(chosen.clue);
      h = chosen.h;
    }
    if (!okLevel(h)) {
      if (process.env.DEBUG_GEN) console.log('fase B sin éxito', { solved: h.solved, level: h.maxLevel, contradiction: h.contradiction, cands: h.candidates.map((c, i) => `${ids[i]}:${c.length}`).join(' '), clues: clues.map((c) => JSON.stringify(c)) });
      continue;
    }

    // Fase C: quitar pistas sobrantes (sin dejar a nadie sin tarjeta).
    for (const c of rng.shuffle(clues.slice())) {
      if (!isRemovable(c)) continue;
      const p = 'p' in c ? c.p : undefined;
      if (p && countFor(p, clues) <= 1) continue;
      const without = clues.filter((x) => x !== c);
      const h2 = human(without);
      if (okLevel(h2)) {
        clues = without;
        h = h2;
      }
    }

    let ev: Evaluated = { clues, human: h, distance: distanceTo(h, diff) + stylePenalty(clues) };

    // Fase D: acercar la dificultad al objetivo sustituyendo pistas.
    for (let tune = 0; tune < 40 && ev.distance > 0 && Date.now() < deadline; tune++) {
      const tooEasy = ev.human.score < diff.minScore || (diff.minLevel !== undefined && ev.human.maxLevel < diff.minLevel);
      const replaceable = ev.clues.filter((c) => isRemovable(c) && 'p' in c && c.p) as (Clue & { p: string })[];
      if (!replaceable.length) break;
      const victim = rng.pick(replaceable);
      const alternatives = (perPerson.get(victim.p) ?? []).filter(
        (c) => !ev.clues.some((x) => clueKey(x) === clueKey(c)),
      );
      const variants: Clue[][] = [];
      if (alternatives.length) {
        const repl = rng.weighted(alternatives, weight);
        variants.push(ev.clues.map((c) => (c === victim ? repl : c)));
      }
      if (tooEasy && countFor(victim.p, ev.clues) > 1) variants.push(ev.clues.filter((c) => c !== victim));
      if (!tooEasy && alternatives.length && countFor(victim.p, ev.clues) < maxPer)
        variants.push([...ev.clues, rng.weighted(alternatives, weight)]);
      for (const cand of variants) {
        const ev2 = evaluate(cand);
        if (ev2.distance < ev.distance) {
          ev = ev2;
          break;
        }
      }
    }

    // Fase E: estilo. Las pistas «estaba en la fila 3» son poco naturales; se
    // intentan quitar o cambiar por otras (objetos, divisiones...) sin
    // empeorar la dificultad.
    const unnatural = (c: Clue) => c.kind === 'row' || c.kind === 'col';
    for (const c of ev.clues.filter(unnatural)) {
      if (!isRemovable(c) || !('p' in c) || !c.p || Date.now() > deadline) continue;
      const p = c.p;
      const alts = rng
        .shuffle((perPerson.get(p) ?? []).filter((a) => !unnatural(a) && !ev.clues.some((x) => clueKey(x) === clueKey(a))))
        .slice(0, 30);
      const variants: Clue[][] = [];
      if (countFor(p, ev.clues) > 1) variants.push(ev.clues.filter((x) => x !== c));
      for (const a of alts) variants.push(ev.clues.map((x) => (x === c ? a : x)));
      for (const cand of variants) {
        const ev2 = evaluate(cand);
        if (ev2.human.solved && ev2.distance <= ev.distance) {
          ev = ev2;
          break;
        }
      }
    }

    if (!best || ev.distance < best.distance) best = { ...ev, placement, culprit: val.culprit };
    if (best.distance === 0) break;
  }

  if (!best) {
    return {
      ok: false,
      clues: [],
      placement: {},
      culprit: '',
      human: { solved: false, placement: null, steps: [], score: 0, maxLevel: 0, usage: {}, contradiction: false, candidates: [] },
      message: 'No se encontró ninguna colocación/pistas válidas. Revisa las restricciones o el tamaño del plano.',
      attemptsUsed: used,
    };
  }
  // Comprobación independiente con el solucionador exacto.
  const exact = countSolutions(modelOf(best.clues), { limit: 2, maxNodes: 2_000_000 });
  const order = new Map(ids.map((id, i) => [id, i]));
  const sorted = best.clues.slice().sort((a, b2) => {
    const pa = 'p' in a && a.p ? order.get(a.p)! : 999;
    const pb = 'p' in b2 && b2.p ? order.get(b2.p)! : 999;
    return pa - pb;
  });
  const uniqueMsg = exact.aborted ? ' (verificación exacta interrumpida)' : exact.count === 1 ? '' : ' ¡ATENCIÓN: no es única!';
  return {
    ok: best.distance === 0 && exact.count === 1,
    clues: sorted,
    placement: best.placement,
    culprit: best.culprit,
    human: best.human,
    message:
      (best.distance === 0
        ? `Caso generado: dificultad ${best.human.score} (nivel ${best.human.maxLevel}).`
        : `Caso válido pero fuera del rango pedido (puntuación ${best.human.score}, nivel ${best.human.maxLevel}).`) + uniqueMsg,
    attemptsUsed: used,
  };
}
