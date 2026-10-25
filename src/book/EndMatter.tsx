/**
 * Glosario + agradecimientos y contraportada (tablón de pruebas con hilo rojo).
 */
import { Avatar } from '../assets/avatar/Avatar';
import { shade } from '../assets/color';
import { bookText, type TextKey } from '../domain/bookTexts';
import { findCharacter } from '../domain/caseModel';
import type { Project } from '../domain/types';
import { PublisherLogo, Wordmark } from './FrontMatter';
import { MiniGrid, type MiniMark } from './MiniGrid';
import { Polaroid, PostIt, Rich, RichLines } from './parts';

interface GlossaryEntry {
  title: string;
  text: string;
  grid?: { rows: number; cols: number; rooms?: (string | null)[]; marks?: Record<number, MiniMark>; shaded?: number[]; window?: { cell: number; side: 'top' | 'bottom' | 'left' | 'right' } };
  span?: number;
}

const ROOM2 = ['a', 'a', 'b', 'a', 'a', 'b', 'a', 'a', 'b'];

export const GLOSSARY: GlossaryEntry[] = [
  { title: 'Solo / sola', text: 'Nadie más estaba en su división (ni siquiera la víctima).', grid: { rows: 3, cols: 3, rooms: ROOM2, marks: { 0: 'x', 1: 'x', 3: 'x', 4: { letter: 'a' }, 6: 'x', 7: 'x' }, shaded: [2, 5, 8] } },
  { title: 'A solas con (b)', text: 'Solo esas dos personas estaban en la división.', grid: { rows: 3, cols: 3, rooms: ROOM2, marks: { 0: 'x', 1: 'x', 3: 'x', 4: { letter: 'a' }, 6: { letter: 'b' }, 7: 'x' }, shaded: [2, 5, 8] } },
  { title: 'Vacía', text: 'Nadie estaba en la división (ni la víctima).', grid: { rows: 3, cols: 3, rooms: ROOM2, marks: { 0: 'x', 1: 'x', 3: 'x', 4: 'x', 6: 'x', 7: 'x' }, shaded: [2, 5, 8] } },
  { title: 'Al lado de', text: 'Justo encima, debajo, a la izquierda o a la derecha, y en la misma división.', grid: { rows: 3, cols: 3, rooms: ['a', 'a', 'b', 'a', 'a', 'b', 'a', 'a', 'b'], marks: { 4: 'dot', 1: 'check', 3: 'check', 7: 'check', 5: 'x', 0: 'x', 2: 'x', 6: 'x', 8: 'x' }, shaded: [1, 3, 7] } },
  { title: 'Esquina de su división', text: 'Celda donde se juntan dos paredes de su división.', grid: { rows: 3, cols: 3, rooms: ['a', 'a', 'a', null, 'a', null, null, 'a', null], marks: { 0: 'check', 2: 'check', 7: 'check' }, shaded: [0, 2, 7] } },
  { title: 'Delante de una ventana', text: 'Celdas que tocan la ventana (si está entre dos, las dos).', grid: { rows: 3, cols: 3, rooms: ['a', 'a', 'b', 'a', 'a', 'b', 'a', 'a', 'b'], marks: { 4: 'check', 5: 'check' }, shaded: [4, 5], window: { cell: 4, side: 'right' } } },
  { title: 'Fila', text: 'Línea horizontal de celdas.', grid: { rows: 3, cols: 3, marks: { 3: 'check', 4: 'check', 5: 'check' }, shaded: [3, 4, 5] } },
  { title: 'Columna', text: 'Línea vertical de celdas.', grid: { rows: 3, cols: 3, marks: { 1: 'check', 4: 'check', 7: 'check' }, shaded: [1, 4, 7] } },
  { title: 'Al oeste de (a)', text: 'En cualquier columna a su izquierda, en cualquier fila.', grid: { rows: 3, cols: 3, marks: { 5: { letter: 'a' }, 0: 'check', 1: 'check', 3: 'check', 4: 'check', 6: 'check', 7: 'check' }, shaded: [0, 1, 3, 4, 6, 7] } },
  { title: 'Al norte de (a)', text: 'En cualquier fila por encima, en cualquier columna.', grid: { rows: 3, cols: 3, marks: { 7: { letter: 'a' }, 0: 'check', 1: 'check', 2: 'check', 3: 'check', 4: 'check', 5: 'check' }, shaded: [0, 1, 2, 3, 4, 5] } },
  { title: 'Exactamente dos filas al sur de (a)', text: 'Dos filas más abajo, en cualquier columna.', grid: { rows: 3, cols: 3, marks: { 1: { letter: 'a' }, 6: 'check', 7: 'check', 8: 'check' }, shaded: [6, 7, 8] } },
  { title: 'La única persona en una silla', text: 'Nadie más estaba en una silla (ni siquiera la víctima). Lo mismo con «la única al lado de una mesa», etc.', span: 3 },
  { title: 'División', text: 'Cualquier espacio cerrado por paredes gruesas: habitaciones, pasillos, terrazas, piscinas, jacuzzis, gradas...', span: 3 },
];

export function GlossaryPage({ project, pageNumber, bleed, side = 'right' }: { project: Project; pageNumber?: number; bleed?: boolean; side?: 'left' | 'right' }) {
  const t = (k: TextKey) => bookText(project.book.texts, k);
  const cols = 3;
  const cardW = 36.5;
  const gap = 2.2;
  const cardH = 30;
  let x = 0;
  let y = 16;
  let rowH = 0;
  const placed: { e: GlossaryEntry; x: number; y: number; w: number; h: number }[] = [];
  for (const e of GLOSSARY) {
    const span = e.span ?? 1;
    if (x + span > cols) {
      x = 0;
      y += rowH + gap;
      rowH = 0;
    }
    const h = e.grid ? cardH : 13;
    placed.push({ e, x: 6 + x * (cardW + gap), y, w: cardW * span + gap * (span - 1), h });
    rowH = Math.max(rowH, h);
    x += span;
  }
  return (
    <div className={`book-page ${side}${bleed ? ' bleed' : ''}`}>
      <div style={{ position: 'absolute', top: '6mm', left: 0, right: 0, textAlign: 'center', fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '15pt' }}>{t('glossaryTitle')}</div>
      {placed.map(({ e, x: px, y: py, w, h }) => (
        <div key={e.title} className="panel" style={{ left: `${px}mm`, top: `${py}mm`, width: `${w}mm`, height: `${h}mm`, padding: '1.4mm 2mm', textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '8.4pt' }}>{e.title}</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '6.8pt', lineHeight: 1.08 }}>{e.text}</div>
          {e.grid && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.8mm', position: 'absolute', bottom: '1.6mm', left: 0, right: 0 }}>
              <MiniGrid {...e.grid} width="13mm" />
            </div>
          )}
        </div>
      ))}
      {pageNumber !== undefined && <div className={`page-number ${side}`}>{pageNumber}</div>}
    </div>
  );
}

/** Página de agradecimientos (va después del glosario). */
export function AcknowledgementsPage({ project, pageNumber, side, bleed }: { project: Project; pageNumber?: number; side: 'left' | 'right'; bleed?: boolean }) {
  const t = (k: TextKey) => bookText(project.book.texts, k);
  const pair = project.book.backCover.characterIds.slice(0, 2).map((id) => findCharacter(project, id)).filter(Boolean);
  return (
    <div className={`book-page ${side}${bleed ? ' bleed' : ''}`}>
      <div style={{ position: 'absolute', top: '22mm', left: '14mm', right: '14mm' }}>
        <div style={{ textAlign: 'center', fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '15pt' }}>{t('ackTitle')}</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '9.4pt', lineHeight: 1.3, marginTop: '4mm' }}>
          <RichLines text={t('acknowledgements')} />
        </div>
      </div>
      {pair.length === 2 ? (
        <>
          <Polaroid avatar={pair[0]!.avatar} name={pair[0]!.name} x={24} y={118} width={34} rotate={-5} />
          <Polaroid avatar={pair[1]!.avatar} name={pair[1]!.name} x={69} y={122} width={34} rotate={4} />
          <svg viewBox="0 0 24 22" style={{ position: 'absolute', left: '59mm', top: '138mm', width: '9mm' }}>
            <path d="M12,21 C4,15 1,10 3,6 C5,2 10,2 12,6 C14,2 19,2 21,6 C23,10 20,15 12,21 Z" fill="#e3263c" />
          </svg>
        </>
      ) : (
        <svg viewBox="0 0 24 22" style={{ position: 'absolute', left: '59mm', top: '120mm', width: '9mm' }}>
          <path d="M12,21 C4,15 1,10 3,6 C5,2 10,2 12,6 C14,2 19,2 21,6 C23,10 20,15 12,21 Z" fill="#e3263c" />
        </svg>
      )}
      {pageNumber !== undefined && <div className={`page-number ${side}`}>{pageNumber}</div>}
    </div>
  );
}

/** Contraportada: tablón de pruebas con fotos unidas por un hilo rojo. */
export function BackCoverPage({ project, bleed }: { project: Project; bleed?: boolean }) {
  const b = project.book;
  const chars = b.backCover.characterIds.map((id) => findCharacter(project, id)).filter(Boolean);
  // Con dos fotos quedan en la mitad de arriba del corcho y el pósit debajo.
  const spots =
    chars.length <= 2
      ? [
          { x: 15, y: 50, r: -6 },
          { x: 70, y: 60, r: 5 },
        ]
      : [
          { x: 14, y: 52, r: -6 },
          { x: 70, y: 66, r: 5 },
          { x: 20, y: 104, r: 4 },
          { x: 72, y: 116, r: -4 },
        ];
  const ink = '#ffffff';
  return (
    <div className={`book-page left${bleed ? ' bleed' : ''}`} style={{ background: b.coverColor }}>
      <div style={{ position: 'absolute', left: '18mm', right: '18mm', top: '9mm' }}>
        <Wordmark title={b.title} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: '8mm',
          right: '8mm',
          top: '40mm',
          height: '112mm',
          borderRadius: '2mm',
          background: 'radial-gradient(circle at 30% 30%, #d9b47e, #c2965c)',
          border: '2.4mm solid #7a5233',
          boxShadow: `0 1.4mm 0 ${shade(b.coverColor, 0.35)}`,
        }}
      />
      <svg viewBox="0 0 127 190.5" style={{ position: 'absolute', inset: 0, width: '127mm', height: '190.5mm' }}>
        {chars.length > 1 &&
          chars.slice(0, -1).map((_, i) => {
            const a = spots[i % spots.length];
            const c2 = spots[(i + 1) % spots.length];
            return <path key={i} d={`M${a.x + 17},${a.y + 2} Q${(a.x + c2.x) / 2 + 17},${(a.y + c2.y) / 2 + 14} ${c2.x + 17},${c2.y + 2}`} stroke="#c8202a" strokeWidth={0.7} fill="none" />;
          })}
      </svg>
      {chars.map((ch, i) => {
        const s = spots[i % spots.length];
        return (
          <div key={ch!.id} style={{ position: 'absolute', left: `${s.x}mm`, top: `${s.y}mm`, width: '34mm', transform: `rotate(${s.r}deg)`, background: '#fff', padding: '1.6mm 1.6mm 0', boxShadow: '0.8mm 1mm 0 rgba(0,0,0,.25)' }}>
            <div style={{ border: '0.25mm solid #2a2830' }}>
              <Avatar spec={ch!.avatar} size="100%" />
            </div>
            <div style={{ fontFamily: 'var(--font-script)', fontSize: '15pt', textAlign: 'center', lineHeight: '8mm' }}>{ch!.name}</div>
          </div>
        );
      })}
      <svg viewBox="0 0 127 190.5" style={{ position: 'absolute', inset: 0, width: '127mm', height: '190.5mm' }}>
        {chars.map((_, i) => {
          const s = spots[i % spots.length];
          return <circle key={i} cx={s.x + 17} cy={s.y + 2} r={1.6} fill="#c8202a" stroke="#7a1015" strokeWidth={0.3} />;
        })}
        {chars.length > 1 && (
          <path d="M63.5,94 C60,90 59,86 61.5,84.8 C62.6,84.3 63.5,85.2 63.5,86.2 C63.5,85.2 64.4,84.3 65.5,84.8 C68,86 67,90 63.5,94 Z" fill="#e3263c" stroke="#fff" strokeWidth={0.4} />
        )}
      </svg>
      {b.backCover.note && chars.length <= 2 && <PostIt x={38} y={110} width={52} text={b.backCover.note} rotate={-3} fontSize={13} />}
      <div style={{ position: 'absolute', left: '10mm', right: '10mm', top: '155mm', textAlign: 'center', color: ink }}>
        <div style={{ fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '12pt' }}>{b.backCover.question}</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '8.6pt', lineHeight: 1.2, marginTop: '1mm' }}>
          <Rich text={b.backCover.blurb} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: '8mm', bottom: '6mm' }}>
        <PublisherLogo name={b.publisher} />
      </div>
      <svg viewBox="0 0 60 26" style={{ position: 'absolute', right: '8mm', bottom: '5mm', width: '24mm', background: '#fff', padding: '1mm' }}>
        {[...Array(36)].map((_, i) => (
          <rect key={i} x={2 + i * 1.55} y={2} width={(i * 7) % 3 === 0 ? 1.1 : 0.55} height={16} fill="#111" />
        ))}
        <text x={30} y={24} textAnchor="middle" fontSize={4.4} fontFamily="Oswald">
          {b.backCover.answer}
        </text>
      </svg>
    </div>
  );
}
