/**
 * Convierte la traza del solucionador humano en una explicación numerada en
 * español, como la sección de soluciones del libro.
 *
 * Agrupa las deducciones hasta cada colocación y resume para que quepa en
 * media página (máximo `maxItems` puntos).
 */
import { colOf, rowOf } from '../board';
import { autoClueText, capitalize, contract, personPhrase, roomRef, type TextContext } from '../clues/text-es';
import type { HumanResult, Step } from './human';
import type { Model } from './model';

export interface ExplainOptions {
  text: TextContext;
  maxItems?: number;
  /** Nombre del culpable en la frase final: "el asesino", "quien se la comió"... */
  culpritRef?: string;
  culpritId?: string;
}

const cellTag = (m: Model, cell: number) => `F${rowOf(m.board, cell) + 1}·C${colOf(m.board, cell) + 1}`;

function nm(o: ExplainOptions, m: Model, p: number): string {
  const id = m.ids[p];
  return personPhrase(o.text.name(id), o.text.article?.(id));
}

function roomOfCell(o: ExplainOptions, m: Model, cell: number): string {
  const room = m.board.rooms[m.board.roomOf[cell]];
  return roomRef({ ...o.text, bold: false }, room.id);
}

function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/** Frase que explica un paso (sin las colocaciones). */
function reason(step: Step, m: Model, o: ExplainOptions): string | null {
  const P = (i: number) => nm(o, m, step.persons[i]);
  const clue = step.info.clueIndex !== undefined ? m.clues[step.info.clueIndex] : undefined;
  const clueTxt = clue ? lowerFirst(autoClueText(clue, { ...o.text, bold: false })).replace(/\.$/, '') : '';
  switch (step.tech) {
    case 'hiddenLine':
      return step.info.row !== undefined
        ? `Solo ${P(0)} puede ocupar la fila ${step.info.row + 1}.`
        : `Solo ${P(0)} puede ocupar la columna ${step.info.col! + 1}.`;
    case 'lineCell': {
      const cell = step.info.cells![0];
      return step.info.row !== undefined
        ? `En la fila ${step.info.row + 1} solo queda libre ${cellTag(m, cell)}: alguien está ahí, así que se bloquea su columna.`
        : `En la columna ${step.info.col! + 1} solo queda libre ${cellTag(m, cell)}: alguien está ahí, así que se bloquea su fila.`;
    }
    case 'pointing':
      return step.info.row !== undefined
        ? `${P(0)} tiene que estar en la fila ${step.info.row + 1}: nadie más puede usarla.`
        : `${P(0)} tiene que estar en la columna ${step.info.col! + 1}: nadie más puede usarla.`;
    case 'relation': {
      if (!clue || !('q' in clue)) return null;
      return contract(`Como ${nm(o, m, m.index.get(clue.p)!)} ${clueTxt.replace(/^estaba/, 'estaba')}, se descartan varias celdas.`);
    }
    case 'room': {
      const room = step.info.room !== undefined ? roomRef({ ...o.text, bold: false }, m.board.rooms[step.info.room].id) : 'esa división';
      switch (step.info.because) {
        case 'aloneOthers':
          return `${P(0)} estaba en ${room} sin compañía: nadie más puede entrar ahí.`;
        case 'alone':
          return `${P(0)} estaba sin compañía, así que no puede ir donde ya hay alguien seguro.`;
        case 'aloneWith':
        case 'aloneWithOthers':
          return `${P(0)} y ${P(1)} estaban a solas en ${room}: nadie más puede entrar.`;
        case 'targetAlone':
          return `${P(0)} estaba a solas con una sola persona: se descartan las divisiones con demasiada gente.`;
        case 'targetPairFull':
          return `${P(0)} y ${P(1)} comparten ${room}: ya no cabe nadie más ahí.`;
        case 'noEmptyRoom':
          return `Ninguna división estaba vacía y solo ${P(0)} puede ocupar ${room}.`;
        case 'withCount':
          return `Por su pista (${clueTxt}), ${P(0)} no puede estar en algunas divisiones.`;
        case 'notAlone':
          return `${P(0)} no estaba sin compañía: se descartan las divisiones donde no podría haber nadie más.`;
        default:
          return null;
      }
    }
    case 'count':
      return clue ? `Por la pista «${autoClueText(clue, { ...o.text, bold: false }).replace(/\.$/, '')}», se descartan varias celdas.` : null;
    case 'intersection': {
      const cells = step.info.cells ?? [];
      return `${P(0)} solo puede estar en ${cells.map((c) => cellTag(m, c)).join(' o ')}; cualquiera de ellas bloquea las celdas que se cruzan.`;
    }
    case 'subset': {
      const names = step.persons.map((p) => nm(o, m, p));
      const who = names.length === 2 ? `${names[0]} y ${names[1]}` : `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`;
      if (step.info.rows) return `${who} se reparten las filas ${step.info.rows.map((r) => r + 1).join(' y ')}: nadie más puede usarlas.`;
      return `${who} se reparten las columnas ${step.info.cols!.map((c) => c + 1).join(' y ')}: nadie más puede usarlas.`;
    }
    case 'trial': {
      const a = step.info.assumed!;
      return `Si ${nm(o, m, a.p)} estuviera en ${cellTag(m, a.cell)}, alguien se quedaría sin sitio: no está ahí.`;
    }
    default:
      return null;
  }
}

/** Explicación completa (lista de puntos con **negritas**). */
export function explainSolution(m: Model, h: HumanResult, o: ExplainOptions): string[] {
  const maxItems = o.maxItems ?? 7;
  interface Item {
    reasons: string[];
    placed: { p: number; cell: number }[];
  }
  const items: Item[] = [];
  let cur: Item = { reasons: [], placed: [] };
  const firstPlacement = new Set<number>();
  for (const step of h.steps) {
    if (step.tech === 'clue') continue;
    const r = reason(step, m, o);
    if (r && !cur.reasons.includes(r)) cur.reasons.push(r);
    for (const pl of step.placed) {
      if (firstPlacement.has(pl.p)) continue;
      firstPlacement.add(pl.p);
      cur.placed.push(pl);
    }
    if (step.placed.length && (cur.reasons.length > 0 || cur.placed.length >= 2)) {
      items.push(cur);
      cur = { reasons: [], placed: [] };
    }
  }
  if (cur.reasons.length || cur.placed.length) items.push(cur);

  // Fusionar puntos hasta caber en maxItems (se unen los más cortos con el siguiente).
  while (items.length > maxItems) {
    let bestIdx = 0;
    let bestLen = Infinity;
    for (let i = 0; i < items.length - 1; i++) {
      const len = items[i].reasons.length + items[i + 1].reasons.length;
      if (len < bestLen) {
        bestLen = len;
        bestIdx = i;
      }
    }
    const a = items[bestIdx];
    const b = items[bestIdx + 1];
    items.splice(bestIdx, 2, { reasons: [...a.reasons, ...b.reasons].slice(0, 3), placed: [...a.placed, ...b.placed] });
  }

  const target = m.target;
  const lines = items.map((it, idx) => {
    const placedTxt = it.placed
      .map((pl) => (pl.p === target ? `${nm(o, m, pl.p)} en la última celda libre (${cellTag(m, pl.cell)})` : `${nm(o, m, pl.p)} en ${cellTag(m, pl.cell)}`))
      .join(', ');
    const reasons = it.reasons.slice(0, 2).join(' ');
    if (!reasons) {
      // Colocaciones directas por sus pistas.
      const first = it.placed[0];
      if (idx === 0 && first && it.placed.length === 1) {
        return `${nm(o, m, first.p)} solo puede estar en ${roomOfCell(o, m, first.cell)}, en ${cellTag(m, first.cell)}.`;
      }
      return `Con lo anterior quedan colocados: ${placedTxt}.`;
    }
    return placedTxt ? `${reasons} Esto coloca a ${placedTxt}.` : reasons;
  });

  if (o.culpritId && target >= 0 && h.placement) {
    const tCell = h.placement[m.ids[target]];
    const room = roomOfCell(o, m, tCell);
    const cName = personPhrase(o.text.name(o.culpritId), o.text.article?.(o.culpritId));
    lines.push(`Solo ${cName} estaba a solas con ${nm(o, m, target)}, en ${room}. ¡${capitalize(cName)} es ${o.culpritRef ?? 'el asesino'}!`);
  }
  return lines.map(contract).map(capitalizeLine);
}

/** Mayúscula en la primera letra aunque vaya detrás de «**» o «¡». */
function capitalizeLine(line: string): string {
  return line.replace(/^([*¡¿\s]*)(\p{Ll})/u, (_, pre: string, ch: string) => pre + ch.toUpperCase());
}
