/**
 * Ensamblado del libro completo: portada, páginas fijas, casos en el orden
 * elegido, soluciones al final, glosario y contraportada.
 */
import type { ReactNode } from 'react';
import type { CaseFile, Project } from '../domain/types';
import { CaseLeftPage, CaseRightPage } from './CaseSpread';
import { AcknowledgementsPage, BackCoverPage, GlossaryPage } from './EndMatter';
import { BlankPage, CoverPage, CreditsPage, TitlePage } from './FrontMatter';
import { InstructionsPage1, InstructionsPage2, InstructionsPage3, InstructionsPage4 } from './Instructions';
import { fitsHalfPage, SolutionsPage } from './Solutions';

export interface PageDesc {
  id: string;
  side: 'left' | 'right';
  /** Número de página impreso (interior). */
  number?: number;
  kind: 'cover' | 'back' | 'front' | 'instructions' | 'case' | 'solutions' | 'glossary' | 'blank';
  caseId?: string;
  render: () => ReactNode;
}

export function orderedCases(p: Project): CaseFile[] {
  const byId = new Map(p.cases.map((c) => [c.id, c]));
  const ordered = p.book.caseOrder.map((id) => byId.get(id)).filter(Boolean) as CaseFile[];
  const rest = p.cases.filter((c) => !p.book.caseOrder.includes(c.id));
  return [...ordered, ...rest];
}

/** Páginas interiores en orden de impresión (la 1 es la portadilla, a la derecha). */
export function interiorPages(p: Project): PageDesc[] {
  const bleed = p.book.bleed;
  const pages: PageDesc[] = [];
  const side = (n: number): 'left' | 'right' => (n % 2 === 0 ? 'left' : 'right');
  pages.push({ id: 'title', side: 'right', number: 1, kind: 'front', render: () => <TitlePage project={p} bleed={bleed} /> });
  pages.push({ id: 'credits', side: 'left', number: 2, kind: 'front', render: () => <CreditsPage project={p} bleed={bleed} /> });
  pages.push({ id: 'blank3', side: 'right', number: 3, kind: 'blank', render: () => <BlankPage side="right" bleed={bleed} /> });
  pages.push({ id: 'instr1', side: 'left', number: 4, kind: 'instructions', render: () => <InstructionsPage1 project={p} bleed={bleed} /> });
  pages.push({ id: 'instr2', side: 'right', number: 5, kind: 'instructions', render: () => <InstructionsPage2 project={p} bleed={bleed} /> });
  pages.push({ id: 'instr3', side: 'left', number: 6, kind: 'instructions', render: () => <InstructionsPage3 project={p} bleed={bleed} /> });
  pages.push({ id: 'instr4', side: 'right', number: 7, kind: 'instructions', render: () => <InstructionsPage4 project={p} bleed={bleed} /> });
  const cases = orderedCases(p);
  let n = 8;
  cases.forEach((c, i) => {
    const left = n;
    pages.push({
      id: `case-${c.id}-L`,
      side: 'left',
      number: left,
      kind: 'case',
      caseId: c.id,
      render: () => <CaseLeftPage project={p} caseFile={c} number={i + 1} leftPageNumber={p.book.pageNumbers ? left : undefined} bleed={bleed} />,
    });
    pages.push({
      id: `case-${c.id}-R`,
      side: 'right',
      number: left + 1,
      kind: 'case',
      caseId: c.id,
      render: () => <CaseRightPage project={p} caseFile={c} number={i + 1} leftPageNumber={p.book.pageNumbers ? left : undefined} bleed={bleed} />,
    });
    n += 2;
  });
  // Dos soluciones por página si caben; las explicaciones largas van solas.
  const groups: { c: CaseFile; number: number }[][] = [];
  for (let i = 0; i < cases.length; ) {
    const a = { c: cases[i], number: i + 1 };
    const b = cases[i + 1] ? { c: cases[i + 1], number: i + 2 } : null;
    if (b && fitsHalfPage(p, a.c) && fitsHalfPage(p, b.c)) {
      groups.push([a, b]);
      i += 2;
    } else {
      groups.push([a]);
      i += 1;
    }
  }
  groups.forEach((items, i) => {
    const num = n;
    pages.push({
      id: `sol-${i}`,
      side: side(num),
      number: num,
      kind: 'solutions',
      render: () => <SolutionsPage project={p} items={items} pageNumber={p.book.pageNumbers ? num : undefined} side={side(num)} bleed={bleed} />,
    });
    n++;
  });
  const gNum = n;
  pages.push({ id: 'glossary', side: side(gNum), number: gNum, kind: 'glossary', render: () => <GlossaryPage project={p} pageNumber={p.book.pageNumbers ? gNum : undefined} side={side(gNum)} bleed={bleed} /> });
  n++;
  const aNum = n;
  pages.push({ id: 'ack', side: side(aNum), number: aNum, kind: 'glossary', render: () => <AcknowledgementsPage project={p} pageNumber={p.book.pageNumbers ? aNum : undefined} side={side(aNum)} bleed={bleed} /> });
  n++;
  // Completar hasta múltiplo de 4 (cuadernillos de imprenta).
  while ((n - 1) % 4 !== 0) {
    const num = n;
    pages.push({ id: `blank-${num}`, side: side(num), number: num, kind: 'blank', render: () => <BlankPage side={side(num)} bleed={bleed} /> });
    n++;
  }
  return pages;
}

export function coverPages(p: Project): { front: PageDesc; back: PageDesc } {
  return {
    front: { id: 'cover', side: 'right', kind: 'cover', render: () => <CoverPage project={p} bleed={p.book.bleed} /> },
    back: { id: 'back', side: 'left', kind: 'back', render: () => <BackCoverPage project={p} bleed={p.book.bleed} /> },
  };
}

/** Todas las páginas para exportar: portada, interior y contraportada. */
export function allPages(p: Project, opts: { cover?: boolean; interior?: boolean } = {}): PageDesc[] {
  const { front, back } = coverPages(p);
  const out: PageDesc[] = [];
  if (opts.cover !== false) out.push(front);
  if (opts.interior !== false) out.push(...interiorPages(p));
  if (opts.cover !== false) out.push(back);
  return out;
}

/** Agrupa páginas en dobles páginas para la vista previa. */
export function spreads(pages: PageDesc[]): (PageDesc | null)[][] {
  const out: (PageDesc | null)[][] = [];
  let i = 0;
  while (i < pages.length) {
    const pg = pages[i];
    if (pg.side === 'right') {
      out.push([null, pg]);
      i++;
    } else {
      const next = pages[i + 1];
      if (next && next.side === 'right') {
        out.push([pg, next]);
        i += 2;
      } else {
        out.push([pg, null]);
        i++;
      }
    }
  }
  return out;
}

/** Páginas para imprimir un solo caso con su solución. */
export function singleCasePages(p: Project, caseId: string): PageDesc[] {
  const cases = orderedCases(p);
  const idx = cases.findIndex((c) => c.id === caseId);
  const c = cases[idx];
  if (!c) return [];
  const number = idx + 1;
  return [
    { id: 'L', side: 'left', kind: 'case', render: () => <CaseLeftPage project={p} caseFile={c} number={number} /> },
    { id: 'R', side: 'right', kind: 'case', render: () => <CaseRightPage project={p} caseFile={c} number={number} /> },
    { id: 'S', side: 'left', kind: 'solutions', render: () => <SolutionsPage project={p} items={[{ c, number }]} side="left" /> },
  ];
}
