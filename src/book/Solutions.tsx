/**
 * Páginas de soluciones: dos casos por página, con la explicación paso a
 * paso a la izquierda y el plano resuelto (con fichas) a la derecha.
 */
import { Avatar } from '../assets/avatar/Avatar';
import { mix } from '../assets/color';
import { caseAvatar, caseContext, displayName } from '../domain/caseModel';
import type { CaseFile, Project } from '../domain/types';
import { parseBold } from '../engine/clues/text-es';
import { BoardView, CELL } from '../render/BoardView';
import { estimateTextHeight } from './CaseSpread';
import { AnswerSlip, NameChip } from './parts';

/** Alto (mm) disponible para un bloque de solución: media página o página entera. */
export const HALF_BLOCK = 86;
export const FULL_BLOCK = 172;
const STEPS_TOP = 24;
const BOARD_W = 56;
const NARROW_W = 112 - BOARD_W - 3 - 3.4;
const WIDE_W = 112 - 3.4;

/** Alto del plano resuelto (mm) según su forma. */
function boardHeight(project: Project, c: CaseFile): number {
  const s = project.scenarios.find((x) => x.id === c.scenarioId);
  const rows = s?.board.rows ?? 8;
  const cols = s?.board.cols ?? 8;
  return 3 + (BOARD_W * (rows * 100 + 52 + 50)) / (cols * 100 + 52 + 50);
}

/**
 * Alto de la explicación: el texto rodea el plano (columna estrecha) y,
 * cuando lo sobrepasa, ocupa todo el ancho.
 */
function stepsHeight(project: Project, c: CaseFile, fontPt: number): number {
  const narrow = (c.explanation ?? []).reduce((acc, s) => acc + estimateTextHeight(s, NARROW_W, fontPt, 1.17) * 1.08 + 0.9, 0);
  const bh = boardHeight(project, c);
  if (narrow <= bh) return narrow;
  return bh + (narrow - bh) * (NARROW_W / WIDE_W);
}

/** ¿Cabe la solución en media página sin bajar de un tamaño de letra legible? */
export function fitsHalfPage(project: Project, c: CaseFile): boolean {
  return STEPS_TOP + stepsHeight(project, c, 5.5) <= HALF_BLOCK;
}

/** En página entera: plano grande arriba y explicación a dos columnas debajo. */
const FULL_BOARD_W = 84;
function fullHeight(project: Project, c: CaseFile, fontPt: number): number {
  const colW = (WIDE_W - 5) / 2;
  const text = (c.explanation ?? []).reduce((acc, s) => acc + estimateTextHeight(s, colW, fontPt, 1.17) * 1.08 + 0.9, 0);
  return boardHeight(project, c) * (FULL_BOARD_W / BOARD_W) + 3 + text / 2 + 4;
}

/** Letra más grande que cabe en el espacio disponible. */
function fitFont(project: Project, c: CaseFile, full: boolean): number {
  for (const f of [6.9, 6.7, 6.4, 6.1, 5.8, 5.5]) {
    const h = full ? fullHeight(project, c, f) : stepsHeight(project, c, f);
    if (STEPS_TOP + h <= (full ? FULL_BLOCK : HALF_BLOCK)) return f;
  }
  return 5.3;
}

export const TOKEN_COLORS = ['#3f7cc0', '#3f9a5b', '#c0832f', '#7d55b0', '#2a9d9d', '#c05a8c', '#5d6d7e', '#8a6d3b', '#3b5998', '#6a8f2f', '#b5651d', '#2f6f6f'];
export const TARGET_COLOR = '#c8323c';

export function tokenColor(c: CaseFile, id: string): string {
  if (id === c.targetId) return TARGET_COLOR;
  const idx = c.people.filter((p) => p.characterId !== c.targetId).findIndex((p) => p.characterId === id);
  return TOKEN_COLORS[(idx >= 0 ? idx : 0) % TOKEN_COLORS.length];
}

/** Ficha circular con la cara de la persona. */
export function Pawn({ project, c, id, cell, cols }: { project: Project; c: CaseFile; id: string; cell: number; cols: number }) {
  const av = caseAvatar(project, c, id);
  const x = (cell % cols) * CELL;
  const y = Math.floor(cell / cols) * CELL;
  const color = tokenColor(c, id);
  const r = 41;
  const clipId = `pawn-${c.id}-${id}`.replace(/[^a-zA-Z0-9-]/g, '');
  return (
    <g>
      <circle cx={x + 50 + 3} cy={y + 50 + 5} r={r} fill="#000" opacity={0.25} />
      <circle cx={x + 50} cy={y + 50} r={r} fill={color} />
      <clipPath id={clipId}>
        <circle cx={x + 50} cy={y + 50} r={r - 7} />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        {av && (
          <svg x={x + 50 - (r - 7)} y={y + 50 - (r - 7)} width={(r - 7) * 2} height={(r - 7) * 2} viewBox="38 28 124 124">
            <Avatar spec={av} size={200} />
          </svg>
        )}
      </g>
      {id === c.targetId && (
        <g stroke="#ffffff" strokeWidth={5} strokeLinecap="round" opacity={0.9}>
          <path d={`M${x + 28},${y + 28} L${x + 72},${y + 72}`} />
          <path d={`M${x + 72},${y + 28} L${x + 28},${y + 72}`} />
        </g>
      )}
    </g>
  );
}

/** Texto de un paso con los nombres coloreados. */
function StepText({ text, project, c }: { text: string; project: Project; c: CaseFile }) {
  const nameToId = new Map(c.people.map((p) => [displayName(project, c, p.characterId), p.characterId]));
  return (
    <>
      {parseBold(text).map((seg, i) => {
        if (!seg.bold) return <span key={i}>{seg.text}</span>;
        const id = nameToId.get(seg.text);
        return id ? <NameChip key={i} name={seg.text} color={tokenColor(c, id)} /> : <b key={i}>{seg.text}</b>;
      })}
    </>
  );
}

export function SolutionBlock({ project, c, number, top, full }: { project: Project; c: CaseFile; number: number; top: number; full?: boolean }) {
  const ctx = caseContext(project, c);
  if (!ctx) return null;
  const { cols } = ctx.scenario.board;
  const sol = c.solution ?? {};
  const culprit = c.culpritId ? displayName(project, c, c.culpritId) : '¿?';
  const steps = c.explanation ?? [];
  const fontPt = fitFont(project, c, !!full);
  return (
    <div className="solution-block" style={{ top: `${top}mm`, height: `${full ? FULL_BLOCK : HALF_BLOCK}mm` }}>
      <div className="sol-title">
        {number}. {c.title}
      </div>
      <AnswerSlip x={36} y={7} width={44} height={16} question={c.question} answer={culprit} />
      {c.answerNote && (
        <div style={{ position: 'absolute', left: '82mm', top: '15mm', width: '30mm', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '7.2pt', lineHeight: 1.1 }}>
          …{c.answerNote}
        </div>
      )}
      <div className="sol-body" style={{ fontSize: `${fontPt}pt` }}>
        <div className={`sol-board${full ? ' full' : ''}`} style={{ width: `${full ? FULL_BOARD_W : BOARD_W}mm` }}>
          <BoardView
            scenario={ctx.scenario}
            coords
            labelScale={0.95}
            overlay={
              <g>
                {Object.entries(sol).map(([id, cell]) => (
                  <Pawn key={id} project={project} c={c} id={id} cell={cell} cols={cols} />
                ))}
              </g>
            }
          />
        </div>
        <ol className={`sol-steps${full ? ' two-cols' : ''}`}>
          {steps.map((s, i) => (
            <li key={i}>
              <StepText text={s} project={project} c={c} />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function SolutionsPage({
  project,
  items,
  pageNumber,
  side,
  bleed,
}: {
  project: Project;
  items: { c: CaseFile; number: number }[];
  pageNumber?: number;
  side: 'left' | 'right';
  bleed?: boolean;
}) {
  return (
    <div className={`book-page ${side}${bleed ? ' bleed' : ''}`} style={{ background: '#ffffff' }}>
      {items[0] && <SolutionBlock project={project} c={items[0].c} number={items[0].number} top={7} full={items.length === 1} />}
      {items[1] && <SolutionBlock project={project} c={items[1].c} number={items[1].number} top={98} />}
      {items.length > 1 && <div style={{ position: 'absolute', left: '10mm', right: '10mm', top: '96mm', borderTop: `0.3mm dashed ${mix('#000000', '#ffffff', 0.7)}` }} />}
      {pageNumber !== undefined && <div className={`page-number ${side}`}>{pageNumber}</div>}
    </div>
  );
}
