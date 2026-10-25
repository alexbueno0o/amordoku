/**
 * Portada, portadilla, créditos y página en blanco.
 * El diseño es propio (logotipo con corazón, editorial inventada) pero sigue
 * el lenguaje visual de los libros de acertijos: plano + retratos.
 */
import { Avatar } from '../assets/avatar/Avatar';
import { shade } from '../assets/color';
import { findCharacter } from '../domain/caseModel';
import type { Project } from '../domain/types';
import { BoardView, CELL } from '../render/BoardView';
import { RichLines } from './parts';

/** Logotipo: el título con un corazón en lugar de la "O" (si la tiene). */
export function Wordmark({ title, color = '#ffffff', heart = '#e3263c', width = '100%' }: { title: string; color?: string; heart?: string; width?: string }) {
  const T = title.toUpperCase();
  const idx = T.indexOf('O');
  const charW = 56;
  const heartW = 64;
  const left = idx >= 0 ? T.slice(0, idx) : T;
  const right = idx >= 0 ? T.slice(idx + 1) : '';
  const lw = left.length * charW;
  const rw = right.length * charW;
  const total = lw + (idx >= 0 ? heartW + 8 : 0) + rw;
  const hx = lw + 4;
  return (
    <svg viewBox={`-4 -6 ${total + 8} 150`} width={width} style={{ display: 'block' }}>
      <text x={0} y={128} fontFamily="Anton, 'League Gothic', Impact, sans-serif" fontSize={148} fill={color} textLength={lw} lengthAdjust="spacingAndGlyphs">
        {left}
      </text>
      {idx >= 0 && (
        <g transform={`translate(${hx} 18)`}>
          <path
            d={`M${heartW / 2},106 C${heartW / 2},106 0,78 0,40 C0,18 12,6 25,6 C32,6 ${heartW / 2},12 ${heartW / 2},18 C${heartW / 2},12 ${heartW - 32 + 7},6 ${heartW - 25},6 C${heartW - 12},6 ${heartW},18 ${heartW},40 C${heartW},78 ${heartW / 2},106 ${heartW / 2},106 Z`}
            fill={heart}
            stroke={color}
            strokeWidth={6}
            strokeLinejoin="round"
          />
          <path d={`M12,36 Q14,20 26,16`} stroke="#ffffff" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.6} />
        </g>
      )}
      {right && (
        <text x={hx + heartW + 4} y={128} fontFamily="Anton, 'League Gothic', Impact, sans-serif" fontSize={148} fill={color} textLength={rw} lengthAdjust="spacingAndGlyphs">
          {right}
        </text>
      )}
    </svg>
  );
}

/** Píldora del subtítulo; las palabras entre *asteriscos* van en rojo. */
export function SubtitlePill({ text, style }: { text: string; style?: React.CSSProperties }) {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  return (
    <div
      style={{
        background: '#ffffff',
        border: '0.7mm solid #16141a',
        borderRadius: '8mm',
        padding: '1.6mm 4mm 2mm',
        textAlign: 'center',
        fontFamily: 'var(--font-title)',
        fontWeight: 600,
        color: '#16141a',
        ...style,
      }}
    >
      {parts.map((p, i) =>
        p.startsWith('*') ? (
          <span key={i} style={{ color: '#d6262b' }}>
            {p.slice(1, -1)}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </div>
  );
}

/** Logotipo de la editorial inventada. */
export function PublisherLogo({ name, color = '#ffffff', size = 8 }: { name: string; color?: string; size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.6mm', fontFamily: 'var(--font-title)', fontWeight: 600, fontSize: `${size}pt`, color }}>
      <svg viewBox="0 0 40 40" style={{ width: `${size * 0.75}mm`, height: `${size * 0.75}mm` }}>
        <circle cx={20} cy={20} r={19} fill="#e3263c" />
        <path d="M20,30 C8,22 9,12 15,11 C18,10.5 20,13 20,15 C20,13 22,10.5 25,11 C31,12 32,22 20,30 Z" fill="#ffffff" />
      </svg>
      <span>{name}</span>
    </div>
  );
}

export function CoverPage({ project, bleed }: { project: Project; bleed?: boolean }) {
  const b = project.book;
  const scenario = project.scenarios.find((s) => s.id === b.coverScenarioId) ?? project.scenarios[0];
  return (
    <div className={`book-page right${bleed ? ' bleed' : ''}`} style={{ background: b.coverColor }}>
      <div style={{ position: 'absolute', left: '7mm', right: '7mm', top: '8mm' }}>
        <Wordmark title={b.title} />
      </div>
      <SubtitlePill text={b.subtitle} style={{ position: 'absolute', left: '6mm', right: '6mm', top: '43mm', fontSize: '15pt' }} />
      {scenario && (
        <div style={{ position: 'absolute', left: '5mm', right: '5mm', top: '58mm' }}>
          <BoardView
            scenario={scenario}
            pad={14}
            overlay={
              <g>
                {b.coverPortraits.map((cp, i) => {
                  const ch = findCharacter(project, cp.characterId);
                  if (!ch) return null;
                  return (
                    <g key={i}>
                      <svg x={cp.c * CELL} y={cp.r * CELL} width={CELL} height={CELL} viewBox="0 0 200 200">
                        <Avatar spec={ch.avatar} size={200} />
                      </svg>
                      <rect x={cp.c * CELL} y={cp.r * CELL} width={CELL} height={CELL} fill="none" stroke="#16141a" strokeWidth={5} />
                    </g>
                  );
                })}
              </g>
            }
          />
        </div>
      )}
      <div style={{ position: 'absolute', left: '8mm', bottom: '6mm' }}>
        <PublisherLogo name={b.publisher} />
      </div>
      <div style={{ position: 'absolute', right: '8mm', bottom: '5.5mm', fontFamily: 'var(--font-title)', fontWeight: 600, fontSize: '12pt', color: '#ffffff' }}>{b.author}</div>
    </div>
  );
}

export function TitlePage({ project, bleed }: { project: Project; bleed?: boolean }) {
  const b = project.book;
  return (
    <div className={`book-page right${bleed ? ' bleed' : ''}`}>
      <div style={{ position: 'absolute', left: '12mm', right: '12mm', top: '50mm' }}>
        <Wordmark title={b.title} color="#16141a" />
      </div>
      <SubtitlePill text={b.subtitle} style={{ position: 'absolute', left: '22mm', right: '22mm', top: '86mm', fontSize: '13pt' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: '16mm', display: 'flex', justifyContent: 'center' }}>
        <PublisherLogo name={b.publisher} color="#16141a" />
      </div>
    </div>
  );
}

export function CreditsPage({ project, bleed }: { project: Project; bleed?: boolean }) {
  const b = project.book;
  return (
    <div className={`book-page left${bleed ? ' bleed' : ''}`}>
      <div style={{ position: 'absolute', left: '14mm', right: '14mm', top: '12mm', textAlign: 'center', fontFamily: 'var(--font-serif)', fontSize: '10.5pt', lineHeight: 1.25 }}>
        <RichLines text={b.dedication} />
      </div>
      <div style={{ position: 'absolute', left: '10mm', right: '10mm', top: '58mm', textAlign: 'center', fontFamily: 'var(--font-serif)', fontSize: '8pt', lineHeight: 1.28 }}>
        <RichLines text={b.credits} />
      </div>
    </div>
  );
}

export function BlankPage({ side, bleed }: { side: 'left' | 'right'; bleed?: boolean }) {
  return <div className={`book-page ${side}${bleed ? ' bleed' : ''}`} />;
}

/** Portada "abierta" para la vista previa: contraportada + portada. */
export const coverInk = (bg: string) => shade(bg, 0.3);
