/**
 * Doble página de un caso: izquierda (título, sospechosos y pistas) y
 * derecha (escena del crimen, plantilla de borrador y "El asesino es...").
 */
import { DEFAULT_AVATAR } from '../assets/avatar/types';
import { mix } from '../assets/color';
import { caseAvatar, caseClueText, caseContext, displayName } from '../domain/caseModel';
import type { CaseFile, Project } from '../domain/types';
import type { Clue } from '../engine/types';
import { BoardView, CELL, ScratchGrid } from '../render/BoardView';
import { AnswerSlip, ClueCard, GlobalClue, LegendBox, Polaroid, polaroidHeight, PostIt, postItHeight, Rich, TipBox, TornCard } from './parts';

export const PAGE_W = 127;
export const PAGE_H = 190.5;

/** Estima la altura (mm) de un texto en una tarjeta. */
export function estimateTextHeight(text: string, widthMm: number, fontPt: number, lineH = 1.22): number {
  const charW = fontPt * 0.3528 * 0.5;
  const perLine = Math.max(8, Math.floor(widthMm / charW));
  const words = text.replace(/\*\*/g, '').split(/\s+/);
  let lines = 1;
  let cur = 0;
  for (const w of words) {
    if (cur + w.length + (cur ? 1 : 0) > perLine) {
      lines++;
      cur = w.length;
    } else cur += w.length + (cur ? 1 : 0);
  }
  lines += (text.match(/\n/g) ?? []).length;
  return lines * fontPt * 0.3528 * lineH;
}

export interface CaseLayout {
  cols: number;
  polW: number;
  cardW: number;
  fontPt: number;
  items: { id: string; x: number; y: number; cardY: number; cardH: number; texts: string[]; victim: boolean }[];
  bottom: number;
}

/** Calcula posiciones de fotos y tarjetas (mm). */
export function layoutCase(entries: { id: string; texts: string[]; victim: boolean }[], top: number, maxBottom: number): CaseLayout {
  const n = entries.length;
  const cols = n <= 9 ? 3 : 4;
  const rows = Math.ceil(n / cols);
  const margin = 5;
  const colW = (PAGE_W - 2 * margin) / cols;
  let polW = cols === 3 ? 27 : 22;
  const fontPt = cols === 3 ? 8 : 7.1;
  const cardW = colW - (cols === 3 ? 3 : 1.6);
  const stagger = cols === 3 ? 7 : 5;
  const build = (pw: number): CaseLayout => {
    const items: CaseLayout['items'] = [];
    const pH = polaroidHeight(pw);
    const rowCardH: number[] = [];
    for (let r = 0; r < rows; r++) {
      let mh = 0;
      for (let c = 0; c < cols; c++) {
        const e = entries[r * cols + c];
        if (!e) continue;
        const h = estimateTextHeight(e.texts.join(' '), cardW - 4, fontPt) + 3.4;
        mh = Math.max(mh, h);
      }
      rowCardH.push(Math.max(mh, cols === 3 ? 10 : 9));
    }
    let y = top;
    let bottom = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const e = entries[i];
        if (!e) continue;
        const off = c % 2 === 1 ? stagger : 0;
        const x = margin + c * colW + (colW - pw) / 2;
        const py = y + off;
        const cardY = py + pH - 2.2;
        const cardH = rowCardH[r];
        items.push({ id: e.id, x, y: py, cardY, cardH, texts: e.texts, victim: e.victim });
        bottom = Math.max(bottom, cardY + cardH);
      }
      y += pH - 2.2 + rowCardH[r] + 3.2;
    }
    return { cols, polW: pw, cardW, fontPt, items, bottom };
  };
  let lay = build(polW);
  while (lay.bottom > maxBottom && polW > 17) {
    polW -= 0.6;
    lay = build(polW);
  }
  return lay;
}

export interface CaseSpreadProps {
  project: Project;
  caseFile: CaseFile;
  number: number;
  /** Número de la página izquierda (la derecha es +1). */
  leftPageNumber?: number;
  showAnswer?: boolean;
  bleed?: boolean;
}

function targetText(c: CaseFile): string {
  if (c.targetText) return c.targetText;
  return c.targetMode === 'aloneWithCulprit' ? `Estaba a solas con ${c.culpritRef}.` : 'Estaba en la última casilla libre.';
}

/** Datos de maquetación de la página izquierda (compartidos con la derecha). */
export function leftPageLayout(project: Project, c: CaseFile) {
  const ctx = caseContext(project, c);
  if (!ctx) return null;
  const subjectClues = (id: string) => c.clues.filter((cl) => 'p' in cl && cl.p === id && cl.kind !== 'targetAloneWithCulprit');
  const globals = c.clues.filter((cl) => !('p' in cl) || (cl.kind === 'flavor' && !cl.p));
  const order = [...c.people.filter((p) => p.characterId !== c.targetId), ...c.people.filter((p) => p.characterId === c.targetId)];
  const entries = order.map((p) => {
    const victim = p.characterId === c.targetId;
    const texts = victim ? [`**${c.targetLabel}**`, targetText(c)] : subjectClues(p.characterId).map((cl) => caseClueText(ctx, cl as Clue));
    return { id: p.characterId, texts, victim };
  });
  const hasBottom = globals.length > 0 || !!c.tip;
  const subtitleLines = Math.ceil(estimateTextHeight(c.subtitle, PAGE_W - 16, 9.6, 1.18) / (9.6 * 0.3528 * 1.18));
  const top = 19 + subtitleLines * 4.2 + 3;
  const lay = layoutCase(entries, top, PAGE_H - (hasBottom ? 24 : 12));
  const postItLeft = !!c.postIt && lay.bottom < PAGE_H - (hasBottom ? 66 : 52);
  return { ctx, globals, lay, postItLeft };
}

export function CaseLeftPage({ project, caseFile: c, number, leftPageNumber, bleed }: CaseSpreadProps) {
  const L = leftPageLayout(project, c);
  if (!L) return <div className="book-page left">Escenario no encontrado</div>;
  const { ctx, globals, lay, postItLeft } = L;
  return (
    <div className={`book-page left${bleed ? ' bleed' : ''}`} style={{ background: c.pageColor }}>
      <div className="case-title">
        {number}. {c.title}
      </div>
      <div className="case-subtitle">
        <Rich text={c.subtitle} />
      </div>
      {lay.items.map((it) => {
        const person = c.people.find((p) => p.characterId === it.id)!;
        const av = caseAvatar(project, c, it.id) ?? DEFAULT_AVATAR;
        const color = it.victim ? '#f2cdd0' : person.cardColor ?? mix(av.bg, '#ffffff', 0.8);
        return (
          <div key={it.id}>
            <ClueCard
              x={it.x + lay.polW / 2 - lay.cardW / 2}
              y={it.cardY}
              width={lay.cardW}
              height={it.cardH}
              color={color}
              fontSize={lay.fontPt}
              className={it.victim ? 'victim-card' : ''}
            >
              {it.texts.map((t, i) => (
                <span key={i}>
                  <Rich text={t} />
                  {i < it.texts.length - 1 && (it.victim ? <br /> : ' ')}
                </span>
              ))}
            </ClueCard>
            <Polaroid avatar={av} name={displayName(project, c, it.id)} x={it.x} y={it.y} width={lay.polW} victim={it.victim} />
          </div>
        );
      })}
      {postItLeft && c.postIt && <PostIt x={36} y={Math.max(lay.bottom + 7, 118)} width={46} text={c.postIt.text} signature={c.postIt.signature} />}
      {c.tip && <TipBox x={10} y={PAGE_H - 52} width={52} title={c.tip.title} text={c.tip.text} />}
      {globals.length > 0 && (
        <GlobalClue
          x={9}
          y={PAGE_H - 21}
          width={78}
          color={mix(c.pageColor, '#5b4b8a', 0.18)}
          text={globals.map((g) => caseClueText(ctx, g as Clue)).join(' ')}
        />
      )}
      {leftPageNumber !== undefined && <div className="page-number left">{leftPageNumber}</div>}
    </div>
  );
}

export function CaseRightPage({ project, caseFile: c, leftPageNumber, showAnswer, bleed }: CaseSpreadProps) {
  const ctx = caseContext(project, c);
  if (!ctx) return <div className="book-page right" />;
  const { rows, cols } = ctx.scenario.board;
  const pad = 26;
  const boardW = 106;
  const boardH = (boardW * (rows * CELL + 2 * pad)) / (cols * CELL + 2 * pad);
  const boardX = (PAGE_W - boardW) / 2;
  const boardY = 8;
  const scratchW = 61;
  const scratchH = scratchW * (rows / cols) + 5;
  const sy = boardY + boardH + 3;
  const leftPostIt = leftPageLayout(project, c)?.postItLeft;
  const legend = c.legend ?? [];
  // Columna derecha bajo el plano: leyendas + pósit (si no cupo a la izquierda) + papelito.
  const colTop = sy + 2;
  const colBottom = PAGE_H - 32;
  const showPostIt = !!c.postIt && !leftPostIt;
  let postFont = 11.5;
  let postW = 38;
  const postH = () => (showPostIt ? postItHeight(c.postIt!.text, postW, postFont) : 0);
  let compactLegend = false;
  const legendStep = () => (compactLegend ? 15 : 26);
  if (showPostIt && colTop + legend.length * legendStep() + postH() > colBottom) compactLegend = true;
  if (showPostIt && colTop + legend.length * legendStep() + postH() > colBottom) {
    postFont = 10;
    postW = 40;
  }
  const culpritName = showAnswer && c.culpritId ? displayName(project, c, c.culpritId) : undefined;
  return (
    <div className={`book-page right${bleed ? ' bleed' : ''}`} style={{ background: c.pageColor }}>
      <div style={{ position: 'absolute', left: `${boardX}mm`, top: `${boardY}mm`, width: `${boardW}mm` }}>
        <BoardView scenario={ctx.scenario} width="100%" pad={pad} />
      </div>
      <TornCard x={8} y={sy} width={scratchW + 4} height={scratchH}>
        <div style={{ padding: '2.5mm 2mm' }}>
          <ScratchGrid scenario={ctx.scenario} width={`${scratchW}mm`} />
        </div>
      </TornCard>
      {legend.map((t, i) => (
        <LegendBox key={t} x={compactLegend ? 80 : 82} y={colTop + i * legendStep()} width={compactLegend ? 38 : 35} typeId={t} compact={compactLegend} />
      ))}
      {showPostIt && (
        <PostIt x={80} y={colTop + legend.length * legendStep()} width={postW} text={c.postIt!.text} signature={c.postIt!.signature} rotate={2} fontSize={postFont} />
      )}
      <AnswerSlip x={PAGE_W - 9 - 38} y={PAGE_H - 30} width={38} height={18} question={c.question} answer={culpritName} />
      {leftPageNumber !== undefined && <div className="page-number right">{leftPageNumber + 1}</div>}
    </div>
  );
}

export function CaseSpread(props: CaseSpreadProps) {
  return (
    <div className="spread">
      <CaseLeftPage {...props} />
      <CaseRightPage {...props} />
    </div>
  );
}
