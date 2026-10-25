/**
 * Detalles de la cara: barbas, cejas, pecas, rubor, lágrimas.
 * (El estilo del libro no dibuja ojos ni boca: solo volúmenes.)
 */
import type { ReactNode } from 'react';
import { shade } from '../color';
import { faceXAt, smoothClosed, type HeadGeom, type Pt } from './geometry';
import type { AvatarSpec } from './types';

const f = (n: number) => n.toFixed(2);

/** Contorno de barba que sigue la mandíbula. `drop` = cuánto baja por debajo de la barbilla. */
function beardPath(g: HeadGeom, o: { from: number; drop: number; cheek: number; mouthY: number; widen?: number }): string {
  const { cx, top, H, W } = g;
  const w = o.widen ?? 1.5;
  const outerR: Pt[] = [];
  const steps = 6;
  for (let i = 0; i < steps; i++) {
    const t = o.from + ((0.97 - o.from) * i) / (steps - 1);
    const k = i / (steps - 1);
    outerR.push([faceXAt(g, t) + w * (1 - k * 0.5) + o.drop * 0.25 * k, top + H * t + o.drop * Math.pow(k, 2)]);
  }
  const bottom: Pt = [cx, g.chin + o.drop + 1];
  // barbilla redondeada: un punto intermedio a cada lado
  outerR.push([cx + g.c + o.drop * 0.6, g.chin + o.drop * 0.85]);
  const outerL = outerR.map(([x, y]) => [2 * cx - x, y] as Pt).reverse();
  const inner: Pt[] = [
    [cx - W * o.cheek, top + H * (o.from + 0.06)],
    [cx - W * 0.27, o.mouthY - 4],
    [cx - W * 0.2, o.mouthY - 1],
    [cx - W * 0.08, o.mouthY + 2],
    [cx, o.mouthY + 3],
    [cx + W * 0.08, o.mouthY + 2],
    [cx + W * 0.2, o.mouthY - 1],
    [cx + W * 0.27, o.mouthY - 4],
    [cx + W * o.cheek, top + H * (o.from + 0.06)],
  ];
  return smoothClosed([...outerR, bottom, ...outerL, ...inner], 0.85);
}

function mustache(g: HeadGeom, kind: 'normal' | 'thick' | 'handlebar'): string {
  const { cx, top, H, W } = g;
  const y = top + H * 0.69;
  if (kind === 'handlebar') {
    return `M${f(cx)},${f(y - 3)} C${f(cx + W * 0.1)},${f(y - 6)} ${f(cx + W * 0.24)},${f(y - 3)} ${f(cx + W * 0.3)},${f(y + 2)} C${f(cx + W * 0.36)},${f(y + 4)} ${f(cx + W * 0.38)},${f(y - 4)} ${f(cx + W * 0.34)},${f(y - 6)} C${f(cx + W * 0.36)},${f(y + 2)} ${f(cx + W * 0.3)},${f(y + 6)} ${f(cx + W * 0.2)},${f(y + 4)} C${f(cx + W * 0.12)},${f(y + 3)} ${f(cx + W * 0.04)},${f(y + 2)} ${f(cx)},${f(y + 3)} C${f(cx - W * 0.04)},${f(y + 2)} ${f(cx - W * 0.12)},${f(y + 3)} ${f(cx - W * 0.2)},${f(y + 4)} C${f(cx - W * 0.3)},${f(y + 6)} ${f(cx - W * 0.36)},${f(y + 2)} ${f(cx - W * 0.34)},${f(y - 6)} C${f(cx - W * 0.38)},${f(y - 4)} ${f(cx - W * 0.36)},${f(y + 4)} ${f(cx - W * 0.3)},${f(y + 2)} C${f(cx - W * 0.24)},${f(y - 3)} ${f(cx - W * 0.1)},${f(y - 6)} ${f(cx)},${f(y - 3)} Z`;
  }
  const t = kind === 'thick' ? 1.5 : 1;
  return `M${f(cx)},${f(y - 4 * t)} C${f(cx + W * 0.12)},${f(y - 6 * t)} ${f(cx + W * 0.22)},${f(y - 3 * t)} ${f(cx + W * 0.25)},${f(y + 5 * t)} C${f(cx + W * 0.16)},${f(y + 3 * t)} ${f(cx + W * 0.08)},${f(y + 2)} ${f(cx)},${f(y + 2.5)} C${f(cx - W * 0.08)},${f(y + 2)} ${f(cx - W * 0.16)},${f(y + 3 * t)} ${f(cx - W * 0.25)},${f(y + 5 * t)} C${f(cx - W * 0.22)},${f(y - 3 * t)} ${f(cx - W * 0.12)},${f(y - 6 * t)} ${f(cx)},${f(y - 4 * t)} Z`;
}

export function renderFacialHair(s: AvatarSpec, g: HeadGeom, uid = 'av'): ReactNode {
  const col = s.facialHairColor;
  const darker = shade(col, 0.2);
  const mouthY = g.top + g.H * 0.74;
  switch (s.facialHair) {
    case 'none':
      return null;
    case 'stubble':
      return (
        <g opacity={0.32}>
          <path d={beardPath(g, { from: 0.56, drop: 0, cheek: 0.36, mouthY, widen: 0 })} fill={col} />
          <path d={mustache(g, 'normal')} fill={col} />
        </g>
      );
    case 'fade': {
      // Barba degradada: suave en patillas y mejillas; bigote y perilla (candado) más densos.
      const gid = `${uid}-beardfade`;
      const outline = beardPath(g, { from: 0.5, drop: 3, cheek: 0.4, mouthY, widen: 0.6 });
      const { cx, W, top, H, chin } = g;
      const my = top + H * 0.69;
      const candado =
        `M${f(cx)},${f(my - 4.5)} C${f(cx + W * 0.13)},${f(my - 6.5)} ${f(cx + W * 0.22)},${f(my - 3)} ${f(cx + W * 0.24)},${f(my + 4)} ` +
        `C${f(cx + W * 0.25)},${f(my + 12)} ${f(cx + W * 0.2)},${f(chin - 2)} ${f(cx + W * 0.1)},${f(chin + 3)} ` +
        `Q${f(cx)},${f(chin + 6)} ${f(cx - W * 0.1)},${f(chin + 3)} ` +
        `C${f(cx - W * 0.2)},${f(chin - 2)} ${f(cx - W * 0.25)},${f(my + 12)} ${f(cx - W * 0.24)},${f(my + 4)} ` +
        `C${f(cx - W * 0.22)},${f(my - 3)} ${f(cx - W * 0.13)},${f(my - 6.5)} ${f(cx)},${f(my - 4.5)} Z ` +
        // hueco de la boca
        `M${f(cx - W * 0.16)},${f(my + 3.5)} Q${f(cx)},${f(my + 1)} ${f(cx + W * 0.16)},${f(my + 3.5)} Q${f(cx + W * 0.1)},${f(my + 9)} ${f(cx)},${f(my + 9.5)} Q${f(cx - W * 0.1)},${f(my + 9)} ${f(cx - W * 0.16)},${f(my + 3.5)} Z`;
      return (
        <g>
          <defs>
            <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1="0" y1={top + H * 0.5} x2="0" y2={chin + 3}>
              <stop offset="0" stopColor={col} stopOpacity={0.1} />
              <stop offset="0.5" stopColor={col} stopOpacity={0.36} />
              <stop offset="1" stopColor={col} stopOpacity={0.6} />
            </linearGradient>
          </defs>
          <path d={outline} fill={`url(#${gid})`} />
          <path d={candado} fill={col} fillRule="evenodd" opacity={0.86} />
        </g>
      );
    }
    case 'short':
    case 'full':
    case 'long': {
      const drop = s.facialHair === 'short' ? 2 : s.facialHair === 'full' ? 6 : 24;
      return (
        <g>
          <path d={beardPath(g, { from: 0.55, drop, cheek: 0.38, mouthY, widen: 0.8 })} fill={col} />
          <path d={mustache(g, 'normal')} fill={col} />
          {/* sombra en el lado derecho, como la cara */}
          <path d={beardPath(g, { from: 0.55, drop, cheek: 0.38, mouthY, widen: 0.8 })} fill={darker} clipPath="url(#avatar-right-half)" opacity={0.35} />
        </g>
      );
    }
    case 'goatee':
      return (
        <path
          d={`M${f(g.cx - g.W * 0.12)},${f(mouthY + 3)} Q${f(g.cx)},${f(mouthY - 1)} ${f(g.cx + g.W * 0.12)},${f(mouthY + 3)} Q${f(g.cx + g.W * 0.13)},${f(g.chin + 4)} ${f(g.cx)},${f(g.chin + 6)} Q${f(g.cx - g.W * 0.13)},${f(g.chin + 4)} ${f(g.cx - g.W * 0.12)},${f(mouthY + 3)} Z`}
          fill={col}
        />
      );
    case 'mustache':
      return <path d={mustache(g, 'normal')} fill={col} />;
    case 'chevron':
      return <path d={mustache(g, 'thick')} fill={col} />;
    case 'handlebar':
      return <path d={mustache(g, 'handlebar')} fill={col} />;
    case 'mustacheGoatee':
      return (
        <g>
          <path d={mustache(g, 'normal')} fill={col} />
          <path
            d={`M${f(g.cx - g.W * 0.1)},${f(mouthY + 4)} Q${f(g.cx)},${f(mouthY + 1)} ${f(g.cx + g.W * 0.1)},${f(mouthY + 4)} Q${f(g.cx + g.W * 0.11)},${f(g.chin + 4)} ${f(g.cx)},${f(g.chin + 5)} Q${f(g.cx - g.W * 0.11)},${f(g.chin + 4)} ${f(g.cx - g.W * 0.1)},${f(mouthY + 4)} Z`}
            fill={col}
          />
        </g>
      );
    case 'sideburns':
      return (
        <g>
          {[-1, 1].map((sgn) => {
            const x = g.cx + sgn * (faceXAt(g, 0.5) - g.cx);
            return <path key={sgn} d={`M${f(x)},${f(g.earY - 10)} L${f(x)},${f(g.top + g.H * 0.72)} L${f(x - sgn * 6)},${f(g.top + g.H * 0.7)} L${f(x - sgn * 5)},${f(g.earY - 10)} Z`} fill={col} />;
          })}
        </g>
      );
  }
}

export function renderBrows(s: AvatarSpec, g: HeadGeom): ReactNode {
  if (s.eyebrows === 'none') return null;
  const y = g.top + g.H * 0.4;
  const dx = g.W * 0.2;
  const w = g.W * 0.2;
  const col = s.hairColor === '#e6e6e6' ? '#9a9a9a' : shade(s.hairColor, 0.1);
  const thick = s.eyebrows === 'thick' ? 4.2 : s.eyebrows === 'natural' ? 3 : 2;
  const arch = s.eyebrows === 'arched' ? 4 : 2;
  return (
    <g stroke={col} strokeWidth={thick} strokeLinecap="round" fill="none">
      <path d={`M${f(g.cx - dx - w / 2)},${f(y + 1.5)} Q${f(g.cx - dx)},${f(y - arch)} ${f(g.cx - dx + w / 2)},${f(y)}`} />
      <path d={`M${f(g.cx + dx - w / 2)},${f(y)} Q${f(g.cx + dx)},${f(y - arch)} ${f(g.cx + dx + w / 2)},${f(y + 1.5)}`} />
    </g>
  );
}

export function renderCheeks(s: AvatarSpec, g: HeadGeom): ReactNode {
  const items: ReactNode[] = [];
  const y = g.top + g.H * 0.6;
  if (s.blush) {
    items.push(
      <g key="blush" fill="#e8737a" opacity={0.16}>
        <ellipse cx={g.cx - g.W * 0.28} cy={g.top + g.H * 0.66} rx={g.W * 0.13} ry={g.W * 0.07} />
        <ellipse cx={g.cx + g.W * 0.28} cy={g.top + g.H * 0.66} rx={g.W * 0.13} ry={g.W * 0.07} />
      </g>,
    );
  }
  if (s.freckles) {
    const dots: [number, number][] = [
      [-0.3, -0.03],
      [-0.22, 0.0],
      [-0.27, 0.04],
      [-0.16, -0.02],
      [-0.2, 0.05],
      [0.3, -0.03],
      [0.22, 0.0],
      [0.27, 0.04],
      [0.16, -0.02],
      [0.2, 0.05],
      [-0.05, -0.05],
      [0.05, -0.05],
    ];
    items.push(
      <g key="freckles" fill={shade(s.skin, 0.38)} opacity={0.75}>
        {dots.map(([dx, dy], i) => (
          <circle key={i} cx={g.cx + dx * g.W} cy={y - 4 + dy * g.H} r={1.15} />
        ))}
      </g>,
    );
  }
  if (s.extras.includes('tears')) {
    items.push(
      <g key="tears" fill="#6ec3f0" stroke="#3b8fc2" strokeWidth={0.8}>
        <path d={`M${f(g.cx - g.W * 0.2)},${f(g.eyeY + 2)} q-4,9 0,12 q4,-3 0,-12 Z`} />
        <path d={`M${f(g.cx + g.W * 0.21)},${f(g.eyeY + 4)} q-4,9 0,12 q4,-3 0,-12 Z`} />
      </g>,
    );
  }
  return items.length ? <g>{items}</g> : null;
}
