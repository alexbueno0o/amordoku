/**
 * Piezas reutilizables de las páginas del libro: fotos, tarjetas de pista,
 * pósits, papel rasgado, papelito de respuesta, leyendas...
 */
import type { CSSProperties, ReactNode } from 'react';
import { Avatar } from '../assets/avatar/Avatar';
import type { AvatarSpec } from '../assets/avatar/types';
import { mix, shade } from '../assets/color';
import { OBJECT_RENDERERS } from '../assets/objects';
import { objectType } from '../catalog/objectTypes';
import { parseBold } from '../engine/clues/text-es';

/** Texto con **negritas**. */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {parseBold(text).map((seg, i) => (seg.bold ? <b key={i}>{seg.text}</b> : <span key={i}>{seg.text}</span>))}
    </>
  );
}

/** Texto con **negritas** y saltos de línea. */
export function RichLines({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((l, i) => (
        <span key={i}>
          <Rich text={l} />
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </>
  );
}

export interface PolaroidProps {
  avatar: AvatarSpec;
  name: string;
  x: number;
  y: number;
  width: number;
  victim?: boolean;
  rotate?: number;
}

/** Foto tipo polaroid con nombre manuscrito (medidas en mm). */
export function Polaroid({ avatar, name, x, y, width, victim, rotate = 0 }: PolaroidProps) {
  // Tamaño del nombre en puntos: proporcional al ancho y reducido si el nombre es largo.
  const nameSize = Math.min(width * 0.5, (width * 3.8) / Math.max(5, name.length));
  return (
    <div
      className={`polaroid${victim ? ' victim' : ''}`}
      style={{ left: `${x}mm`, top: `${y}mm`, width: `${width}mm`, transform: rotate ? `rotate(${rotate}deg)` : undefined }}
    >
      <div className="photo">
        <Avatar spec={avatar} crossed={victim} size="100%" />
      </div>
      <div className="name" style={{ fontSize: `${nameSize}pt`, height: `${width * 0.22}mm`, lineHeight: `${width * 0.2}mm` }}>
        {name}
      </div>
    </div>
  );
}

/** Altura aproximada de una polaroid (mm) según su ancho. */
export const polaroidHeight = (width: number) => width + width * 0.22 + 0.5;

export interface ClueCardProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  children: ReactNode;
  fontSize: number;
  style?: CSSProperties;
  className?: string;
}

export function ClueCard({ x, y, width, height, color, children, fontSize, style, className }: ClueCardProps) {
  return (
    <div
      className={`clue-card ${className ?? ''}`}
      style={{
        left: `${x}mm`,
        top: `${y}mm`,
        width: `${width}mm`,
        minHeight: `${height}mm`,
        background: color,
        boxShadow: `0.9mm 0.9mm 0 ${shade(color, 0.16)}`,
        fontSize: `${fontSize}pt`,
        ...style,
      }}
    >
      <div>{children}</div>
    </div>
  );
}

/** Lupa (icono de la pista global). */
export function LensIcon() {
  return (
    <svg viewBox="0 0 40 40" className="lens">
      <circle cx={16} cy={16} r={11} fill="#ffffff" stroke="#111" strokeWidth={4} />
      <path d="M24,24 L36,36" stroke="#111" strokeWidth={6} strokeLinecap="round" />
    </svg>
  );
}

export function GlobalClue({ x, y, width, text, color }: { x: number; y: number; width: number; text: string; color: string }) {
  return (
    <div className="global-clue" style={{ left: `${x}mm`, top: `${y}mm`, width: `${width}mm`, background: color, boxShadow: `0 0.9mm 0 ${shade(color, 0.18)}` }}>
      <LensIcon />
      <div style={{ flex: 1 }}>
        <Rich text={text} />
      </div>
    </div>
  );
}

/** Altura aproximada (mm) de un pósit con ese texto. */
export function postItHeight(text: string, widthMm: number, fontPt = 12.5, signature = true): number {
  const charW = 0.4 * fontPt * 0.3528;
  const perLine = Math.max(8, Math.floor((widthMm - 7) / charW));
  const lines = text.split('\n').reduce((acc, l) => acc + Math.max(1, Math.ceil(l.length / perLine)), 0);
  return lines * fontPt * 0.3528 * 1.12 + 8 + (signature ? 6 : 0);
}

export function PostIt({ x, y, width, text, signature, rotate = -3, fontSize }: { x: number; y: number; width: number; text: string; signature?: string; rotate?: number; fontSize?: number }) {
  return (
    <div className="postit" style={{ left: `${x}mm`, top: `${y}mm`, width: `${width}mm`, transform: `rotate(${rotate}deg)`, fontSize: fontSize ? `${fontSize}pt` : undefined }}>
      <RichLines text={text} />
      {signature && <span className="sig">{signature}</span>}
    </div>
  );
}

export function TipBox({ x, y, width, title, text }: { x: number; y: number; width: number; title: string; text: string }) {
  return (
    <div className="tip-box" style={{ left: `${x}mm`, top: `${y}mm`, width: `${width}mm` }}>
      <span className="tip-title">{title}</span>
      <RichLines text={text} />
    </div>
  );
}

/** Borde rasgado (path SVG) para un rectángulo w×h en mm. */
function tornPath(w: number, h: number, seed = 3, edges: ('right' | 'bottom' | 'left' | 'top')[] = ['right', 'bottom']) {
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const pts: [number, number][] = [];
  const jag = (x1: number, y1: number, x2: number, y2: number, torn: boolean) => {
    const n = torn ? Math.max(6, Math.round(Math.hypot(x2 - x1, y2 - y1) / 2.2)) : 1;
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t;
      const nx = -(y2 - y1);
      const ny = x2 - x1;
      const len = Math.hypot(nx, ny) || 1;
      const amp = torn ? (rnd() - 0.5) * 1.6 + (rnd() < 0.08 ? 1.6 : 0) : 0;
      pts.push([x + (nx / len) * amp, y + (ny / len) * amp]);
    }
  };
  jag(0, 0, w, 0, edges.includes('top'));
  jag(w, 0, w, h, edges.includes('right'));
  jag(w, h, 0, h, edges.includes('bottom'));
  jag(0, h, 0, 0, edges.includes('left'));
  return 'M' + pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' L') + ' Z';
}

/** Tarjeta de papel rasgado (para la plantilla de borrador). */
export function TornCard({ x, y, width, height, children, color = '#ffffff', seed = 5 }: { x: number; y: number; width: number; height: number; children?: ReactNode; color?: string; seed?: number }) {
  return (
    <div className="torn" style={{ left: `${x}mm`, top: `${y}mm`, width: `${width}mm`, height: `${height}mm` }}>
      <svg viewBox={`-1 -1 ${width + 2} ${height + 2}`} style={{ position: 'absolute', inset: '-1mm', width: `${width + 2}mm`, height: `${height + 2}mm` }}>
        <path d={tornPath(width, height, seed, ['right', 'left'])} fill={color} />
      </svg>
      <div style={{ position: 'absolute', inset: 0 }}>{children}</div>
    </div>
  );
}

/** Papelito "El asesino es..." */
export function AnswerSlip({ x, y, width = 37, height = 17, question, answer }: { x: number; y: number; width?: number; height?: number; question: string; answer?: string }) {
  return (
    <div className="answer-slip" style={{ left: `${x}mm`, top: `${y}mm`, width: `${width}mm`, height: `${height}mm`, background: 'transparent', paddingTop: '2.2mm' }}>
      <svg viewBox={`-1 -1 ${width + 2} ${height + 2}`} style={{ position: 'absolute', inset: '-1mm', width: `${width + 2}mm`, height: `${height + 2}mm` }}>
        <path d={tornPath(width, height, 11, ['right', 'bottom', 'left'])} fill="#ececec" />
      </svg>
      <div style={{ position: 'relative' }}>{question}</div>
      {answer && (
        <div className="answer" style={{ fontSize: `${Math.min(15, (width * 4.2) / Math.max(6, answer.length))}pt` }}>
          {answer}
        </div>
      )}
      <div className="line" />
    </div>
  );
}

/** Recuadro de leyenda de un tipo de objeto ("Estatua — no puede ser ocupada"). */
export function LegendBox({ x, y, width, typeId, color, compact }: { x: number; y: number; width: number; typeId: string; color?: string; compact?: boolean }) {
  const def = objectType(typeId);
  const render = OBJECT_RENDERERS[typeId];
  if (!def) return null;
  const [w, h] = def.size;
  const name = def.noun.sing.charAt(0).toUpperCase() + def.noun.sing.slice(1);
  const note = def.legend ?? (def.occupiable ? `puede ser ocupad${def.noun.gender === 'f' ? 'a' : 'o'}` : `no puede ser ocupad${def.noun.gender === 'f' ? 'a' : 'o'}`);
  const bg = color ?? (def.occupiable ? '#d7ecd0' : '#f6d6d6');
  if (compact)
    return (
      <div className="legend-box compact" style={{ left: `${x}mm`, top: `${y}mm`, width: `${width}mm`, background: bg }}>
        <svg viewBox={`-10 -10 ${w * 100 + 20} ${h * 100 + 20}`} style={{ width: `${Math.min(11, 7 * Math.max(w, h))}mm`, flex: 'none' }}>
          {render?.({ w, h, W: w * 100, H: h * 100, color: def.color, variant: def.variants?.[0], uid: `lg-${typeId}` })}
        </svg>
        <div>
          <div className="lg-title">{name}</div>
          <div className="lg-note">{note}</div>
        </div>
      </div>
    );
  return (
    <div className="legend-box" style={{ left: `${x}mm`, top: `${y}mm`, width: `${width}mm`, background: bg }}>
      <div className="lg-title">{name}</div>
      <svg viewBox={`-10 -10 ${w * 100 + 20} ${h * 100 + 20}`} style={{ width: `${Math.min(width * 0.6, 14 * Math.max(w, h))}mm`, margin: '1mm auto', display: 'block' }}>
        {render?.({ w, h, W: w * 100, H: h * 100, color: def.color, variant: def.variants?.[0], uid: `lg-${typeId}` })}
      </svg>
      <div className="lg-note">{note}</div>
    </div>
  );
}

/** Nombre resaltado con el color de su ficha (en las soluciones). */
export function NameChip({ name, color }: { name: string; color: string }) {
  return (
    <span className="name-chip" style={{ background: mix(color, '#ffffff', 0.62), color: shade(color, 0.45) }}>
      {name}
    </span>
  );
}
