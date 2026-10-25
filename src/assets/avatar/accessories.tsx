/**
 * Complementos: gafas, pendientes, collares, gorros y extras.
 */
import type { ReactNode } from 'react';
import { mix, shade } from '../color';
import { smoothClosed, type HeadGeom } from './geometry';
import { capPath } from './shapes';
import type { AvatarSpec } from './types';

const f = (n: number) => n.toFixed(2);

/* ----------------------------------------------------------------- gafas */
export function renderGlasses(s: AvatarSpec, g: HeadGeom): ReactNode {
  if (s.glasses === 'none') return null;
  const y = g.eyeY;
  const dx = g.W * 0.205;
  const lw = g.W * 0.27;
  const lh = g.W * 0.19;
  const col = s.glassesColor;
  const sw = 2.4;
  const lens = (cx: number, shape: 'round' | 'rect' | 'cat' | 'aviator' | 'oval', fill: string, fillOpacity: number) => {
    if (shape === 'round') return <circle cx={cx} cy={y} r={lh * 0.62} fill={fill} fillOpacity={fillOpacity} stroke={col} strokeWidth={sw} />;
    if (shape === 'rect') return <rect x={cx - lw / 2} y={y - lh / 2} width={lw} height={lh} rx={3.5} fill={fill} fillOpacity={fillOpacity} stroke={col} strokeWidth={sw} />;
    if (shape === 'oval')
      return <ellipse cx={cx} cy={y} rx={lw * 0.56} ry={lh * 0.42} fill={fill} fillOpacity={fillOpacity} stroke={col} strokeWidth={sw} />;
    if (shape === 'cat') {
      const sgn = cx < g.cx ? -1 : 1;
      return (
        <path
          d={`M${f(cx - lw / 2)},${f(y - lh * 0.35)} Q${f(cx)},${f(y - lh * 0.55)} ${f(cx + lw / 2)},${f(y - lh * 0.35)} L${f(cx + sgn * lw * 0.62)},${f(y - lh * 0.65)} Q${f(cx + lw * 0.45)},${f(y + lh * 0.55)} ${f(cx)},${f(y + lh * 0.45)} Q${f(cx - lw * 0.45)},${f(y + lh * 0.55)} ${f(cx - lw / 2)},${f(y - lh * 0.35)} Z`}
          fill={fill}
          fillOpacity={fillOpacity}
          stroke={col}
          strokeWidth={sw}
          strokeLinejoin="round"
        />
      );
    }
    // aviador
    return (
      <path
        d={`M${f(cx - lw / 2)},${f(y - lh * 0.45)} L${f(cx + lw / 2)},${f(y - lh * 0.45)} Q${f(cx + lw * 0.55)},${f(y + lh * 0.6)} ${f(cx)},${f(y + lh * 0.55)} Q${f(cx - lw * 0.55)},${f(y + lh * 0.5)} ${f(cx - lw / 2)},${f(y - lh * 0.45)} Z`}
        fill={fill}
        fillOpacity={fillOpacity}
        stroke={col}
        strokeWidth={sw * 0.8}
      />
    );
  };
  const temples = (
    <path d={`M${f(g.cx - dx - lw / 2)},${f(y - 2)} L${f(g.cx - g.W / 2 + 1)},${f(y - 4)} M${f(g.cx + dx + lw / 2)},${f(y - 2)} L${f(g.cx + g.W / 2 - 1)},${f(y - 4)}`} stroke={col} strokeWidth={sw} />
  );
  const bridge = <path d={`M${f(g.cx - dx + lw / 2 - 1)},${f(y - 1)} Q${f(g.cx)},${f(y - 5)} ${f(g.cx + dx - lw / 2 + 1)},${f(y - 1)}`} stroke={col} strokeWidth={sw} fill="none" />;
  const pair = (shape: Parameters<typeof lens>[1], fill: string, op: number) => (
    <g>
      {temples}
      {lens(g.cx - dx, shape, fill, op)}
      {lens(g.cx + dx, shape, fill, op)}
      {bridge}
    </g>
  );
  switch (s.glasses) {
    case 'round':
      return pair('round', '#ffffff', 0.12);
    case 'square':
      return pair('rect', '#ffffff', 0.12);
    case 'rect':
      return (
        <g>
          {temples}
          <rect x={g.cx - dx - lw / 2} y={y - lh * 0.38} width={lw} height={lh * 0.76} rx={2} fill="#fff" fillOpacity={0.1} stroke={col} strokeWidth={1.6} />
          <rect x={g.cx + dx - lw / 2} y={y - lh * 0.38} width={lw} height={lh * 0.76} rx={2} fill="#fff" fillOpacity={0.1} stroke={col} strokeWidth={1.6} />
          {bridge}
        </g>
      );
    case 'cat':
      return pair('cat', '#ffffff', 0.12);
    case 'aviator':
      return pair('aviator', '#6d6250', 0.5);
    case 'sunSquare':
      return pair('rect', '#15151a', 0.92);
    case 'sunOval':
      return pair('oval', '#1d1a1a', 0.9);
    case 'sunRound':
      return pair('round', '#1d1a1a', 0.9);
    case 'threeD':
      return (
        <g>
          <path d={`M${f(g.cx - g.W / 2 + 1)},${f(y - 4)} L${f(g.cx - dx - lw / 2)},${f(y - 3)} M${f(g.cx + g.W / 2 - 1)},${f(y - 4)} L${f(g.cx + dx + lw / 2)},${f(y - 3)}`} stroke="#f4f4f4" strokeWidth={3} />
          <rect x={g.cx - dx - lw / 2 - 3} y={y - lh / 2 - 3} width={dx * 2 + lw + 6} height={lh + 6} rx={4} fill="#f4f4f4" stroke="#bdbdbd" strokeWidth={1} />
          <rect x={g.cx - dx - lw / 2 + 1} y={y - lh / 2 + 1} width={lw - 2} height={lh - 2} rx={2} fill="#e8364b" opacity={0.85} />
          <rect x={g.cx + dx - lw / 2 + 1} y={y - lh / 2 + 1} width={lw - 2} height={lh - 2} rx={2} fill="#2fb8e6" opacity={0.85} />
        </g>
      );
    case 'goggles':
      return (
        <g>
          <path d={`M${f(g.cx - g.W / 2)},${f(y - 3)} L${f(g.cx + g.W / 2)},${f(y - 3)}`} stroke="#555" strokeWidth={4} />
          <rect x={g.cx - g.W * 0.44} y={y - lh * 0.62} width={g.W * 0.88} height={lh * 1.24} rx={lh * 0.5} fill="#ffe36b" fillOpacity={0.6} stroke="#d6c34a" strokeWidth={2.4} />
        </g>
      );
    case 'ski':
      return (
        <g>
          <path d={`M${f(g.cx - g.W / 2 - 2)},${f(y - 2)} L${f(g.cx + g.W / 2 + 2)},${f(y - 2)}`} stroke={col} strokeWidth={6} />
          <rect x={g.cx - g.W * 0.46} y={y - lh * 0.7} width={g.W * 0.92} height={lh * 1.4} rx={lh * 0.6} fill="url(#ski-lens)" stroke="#333" strokeWidth={2} />
        </g>
      );
    default:
      return null;
  }
}

/* ------------------------------------------------------------ pendientes */
export function renderEarrings(s: AvatarSpec, g: HeadGeom): ReactNode {
  if (s.earrings === 'none') return null;
  const col = s.earringColor;
  const hi = shade(col, -0.35);
  const lo = shade(col, 0.25);
  const ys = g.earY + g.earRy - 3;
  const ear = (sgn: number) => {
    const x = g.cx + sgn * (g.W / 2 + 1);
    switch (s.earrings) {
      case 'stud':
        return <circle cx={x} cy={ys} r={2.4} fill={col} />;
      case 'pearl':
        return <circle cx={x} cy={ys + 1} r={3} fill="#f6f1e7" stroke="#d9cfbd" strokeWidth={0.6} />;
      case 'hoop':
        return <circle cx={x} cy={ys + 5} r={5.5} fill="none" stroke={col} strokeWidth={2} />;
      case 'doubleHoop':
        // Aro grande en el lóbulo y otro pequeñito justo detrás.
        return (
          <g fill="none" strokeLinecap="round">
            <circle cx={x + sgn * 2.4} cy={ys + 0.5} r={3.1} stroke={shade(col, 0.18)} strokeWidth={1.4} />
            <circle cx={x - sgn * 0.4} cy={ys + 6} r={6.4} stroke={col} strokeWidth={2.1} />
            <path d={`M${x - sgn * 0.4 - 4.5},${ys + 3} a6.4,6.4 0 0,1 4,-3.3`} stroke={hi} strokeWidth={1} />
          </g>
        );
      case 'drop':
        return (
          <g>
            <line x1={x} y1={ys} x2={x} y2={ys + 7} stroke={col} strokeWidth={1.4} />
            <path d={`M${x},${ys + 6} q-4,6 0,10 q4,-4 0,-10 Z`} fill={col} />
          </g>
        );
      case 'statement':
        return (
          <g>
            <circle cx={x} cy={ys + 1} r={2.8} fill={col} />
            <path d={`M${x - 6},${ys + 6} Q${x},${ys + 2} ${x + 6},${ys + 6} L${x + 4},${ys + 15} Q${x},${ys + 22} ${x - 4},${ys + 15} Z`} fill={col} stroke={lo} strokeWidth={0.8} />
            <circle cx={x} cy={ys + 11} r={2.2} fill={hi} />
            <path d={`M${x - 4},${ys + 16} l-1,4 M${x},${ys + 19} l0,5 M${x + 4},${ys + 16} l1,4`} stroke={col} strokeWidth={1.3} strokeLinecap="round" />
          </g>
        );
      case 'fallera':
        return (
          <g>
            <circle cx={x} cy={ys + 1} r={3} fill={col} />
            <path d={`M${x - 4},${ys + 5} L${x + 4},${ys + 5} L${x + 2.5},${ys + 16} L${x - 2.5},${ys + 16} Z`} fill={col} stroke={lo} strokeWidth={0.6} />
            <circle cx={x} cy={ys + 19} r={2.6} fill="#f6f1e7" />
          </g>
        );
      default:
        return null;
    }
  };
  return (
    <g>
      {ear(-1)}
      {ear(1)}
    </g>
  );
}

/* --------------------------------------------------------------- collares */
export function renderNecklace(s: AvatarSpec, g: HeadGeom): ReactNode {
  if (s.necklace === 'none') return null;
  const col = s.necklaceColor;
  const cx = g.cx;
  const y0 = g.chin + 18;
  const w = g.neckW / 2 + 6;
  const curve = (depth: number) => `M${f(cx - w)},${f(y0)} Q${f(cx)},${f(y0 + depth)} ${f(cx + w)},${f(y0)}`;
  switch (s.necklace) {
    case 'chain':
      return <path d={curve(22)} stroke={col} strokeWidth={1.6} fill="none" />;
    case 'pearls': {
      const beads = [];
      for (let i = 0; i <= 12; i++) {
        const t = i / 12;
        const x = cx - w + 2 * w * t;
        const y = y0 + 4 * 22 * t * (1 - t) * 0.92;
        beads.push(<circle key={i} cx={x} cy={y} r={2.2} fill="#f7f2e8" stroke="#d6ccb9" strokeWidth={0.5} />);
      }
      return <g>{beads}</g>;
    }
    case 'pendant':
      return (
        <g>
          <path d={curve(26)} stroke={col} strokeWidth={1.3} fill="none" />
          <path d={`M${cx},${y0 + 13} l-4,5 l4,6 l4,-6 Z`} fill={col} />
        </g>
      );
    case 'cord':
      return (
        <g>
          <path d={curve(30)} stroke="#1c1c1c" strokeWidth={1.8} fill="none" />
          <circle cx={cx} cy={y0 + 17} r={3.6} fill={col} stroke="#1c1c1c" strokeWidth={1} />
        </g>
      );
    case 'choker':
      return <rect x={cx - g.neckW / 2} y={g.chin + 8} width={g.neckW} height={4.5} rx={2} fill={col} />;
    case 'statement':
      return (
        <g>
          <path d={curve(20)} stroke={col} strokeWidth={4} fill="none" />
          {[-0.6, -0.3, 0, 0.3, 0.6].map((k) => (
            <circle key={k} cx={cx + k * w} cy={y0 + 9 * (1 - k * k) + 2} r={3.4} fill={shade(col, -0.2)} stroke={shade(col, 0.3)} strokeWidth={0.8} />
          ))}
        </g>
      );
    case 'beads': {
      // Collar doble de cuentas de cristal de colores (con florecitas).
      const palette = ['#e05a73', '#f2c94c', '#5aa7b5', '#f7f2ea', '#8e6bbf', '#4f9a6a', '#f28c28', '#e9a3c0', '#3f6fb3'];
      const strand = (depth: number, n: number, r: number, wk: number, seed: number) => {
        const out = [];
        const ww = w * wk;
        for (let i = 0; i <= n; i++) {
          const t = i / n;
          const x = cx - ww + 2 * ww * t;
          const y = y0 - 4 + 4 * depth * t * (1 - t);
          const c = palette[(i * 5 + seed) % palette.length];
          out.push(
            <g key={`${seed}-${i}`}>
              {i % 3 === 1 ? (
                <circle cx={x} cy={y} r={r * 0.55} fill="#c9ccd1" stroke="#8a8f96" strokeWidth={0.4} />
              ) : (
                <>
                  <circle cx={x} cy={y} r={r} fill={c} stroke={shade(c, 0.25)} strokeWidth={0.5} />
                  <circle cx={x - r * 0.25} cy={y - r * 0.2} r={r * 0.35} fill="#ffffff" opacity={0.75} />
                  <circle cx={x + r * 0.3} cy={y + r * 0.25} r={r * 0.22} fill={palette[(i + seed + 2) % palette.length]} />
                </>
              )}
            </g>,
          );
        }
        return out;
      };
      return (
        <g>
          {strand(24, 16, 3.3, 1.12, 1)}
          {strand(36, 18, 3.6, 1.38, 4)}
        </g>
      );
    }
    case 'fallera':
      return (
        <g>
          <path d={curve(16)} stroke={col} strokeWidth={2.4} fill="none" />
          <path d={curve(26)} stroke={col} strokeWidth={1.6} fill="none" />
          <path d={`M${cx - 6},${y0 + 12} L${cx + 6},${y0 + 12} L${cx},${y0 + 24} Z`} fill={col} stroke={shade(col, 0.3)} strokeWidth={0.8} />
          <circle cx={cx} cy={y0 + 26} r={2.6} fill="#f6f1e7" />
        </g>
      );
    default:
      return null;
  }
}

/* ----------------------------------------------------------------- gorros */
export function renderHat(s: AvatarSpec, g: HeadGeom): ReactNode {
  if (s.hat === 'none') return null;
  const { cx, top, H, W } = g;
  const col = s.hatColor;
  const dk = shade(col, 0.22);
  const lt = shade(col, -0.25);
  switch (s.hat) {
    case 'beanie': {
      // Gorro ajustado (cubre la frente) con puño de canalé y letras manuscritas.
      const bandTop = top + H * 0.25;
      const bandBot = top + H * 0.41;
      const ink = mix(col, '#ffffff', 0.6);
      const X = (k: number) => f(cx + k * W);
      const Y = (k: number) => f(top + k * H);
      // Firma en cursiva: una línea continua con bucles (no es ningún logotipo real).
      const script =
        `M${X(-0.5)},${Y(0.13)} C${X(-0.44)},${Y(0.02)} ${X(-0.38)},${Y(-0.02)} ${X(-0.36)},${Y(0.04)} ` +
        `C${X(-0.34)},${Y(0.12)} ${X(-0.42)},${Y(0.16)} ${X(-0.38)},${Y(0.08)} ` +
        `C${X(-0.32)},${Y(-0.04)} ${X(-0.22)},${Y(-0.06)} ${X(-0.22)},${Y(0.02)} ` +
        `C${X(-0.22)},${Y(0.12)} ${X(-0.3)},${Y(0.14)} ${X(-0.26)},${Y(0.06)} ` +
        `C${X(-0.2)},${Y(-0.03)} ${X(-0.1)},${Y(0.0)} ${X(-0.1)},${Y(0.08)} ` +
        `C${X(-0.1)},${Y(0.15)} ${X(-0.16)},${Y(0.15)} ${X(-0.12)},${Y(0.07)} ` +
        `C${X(-0.06)},${Y(-0.04)} ${X(0.06)},${Y(-0.04)} ${X(0.04)},${Y(0.06)} ` +
        `C${X(0.02)},${Y(0.15)} ${X(-0.04)},${Y(0.12)} ${X(0.02)},${Y(0.05)} ` +
        `C${X(0.1)},${Y(-0.04)} ${X(0.18)},${Y(0.0)} ${X(0.18)},${Y(0.08)} ` +
        `C${X(0.18)},${Y(0.14)} ${X(0.24)},${Y(0.12)} ${X(0.28)},${Y(0.02)} ` +
        `C${X(0.3)},${Y(-0.05)} ${X(0.36)},${Y(-0.03)} ${X(0.34)},${Y(0.06)} ` +
        `C${X(0.32)},${Y(0.14)} ${X(0.42)},${Y(0.14)} ${X(0.52)},${Y(0.04)}`;
      return (
        <g>
          <path d={`M${f(cx - W / 2 - 4)},${f(bandBot)} L${f(cx - W / 2 - 5)},${f(top + H * 0.14)} C${f(cx - W / 2 - 4)},${f(top - 12)} ${f(cx + W / 2 + 4)},${f(top - 12)} ${f(cx + W / 2 + 5)},${f(top + H * 0.14)} L${f(cx + W / 2 + 4)},${f(bandBot)} Z`} fill={col} />
          <path d={script} stroke={ink} strokeWidth={1.9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d={`M${X(-0.3)},${Y(0.19)} C${X(-0.1)},${Y(0.13)} ${X(0.14)},${Y(0.23)} ${X(0.42)},${Y(0.15)}`} stroke={ink} strokeWidth={1.4} fill="none" strokeLinecap="round" />
          <path d={`M${X(-0.06)},${Y(-0.08)} L${X(0.02)},${Y(0.22)}`} stroke={ink} strokeWidth={1.2} strokeLinecap="round" />
          <rect x={cx - W / 2 - 5} y={bandTop} width={W + 10} height={bandBot - bandTop} rx={4} fill={col} />
          <rect x={cx - W / 2 - 5} y={bandTop} width={W + 10} height={bandBot - bandTop} rx={4} fill="#000" opacity={0.07} />
          {[...Array(15)].map((_, i) => (
            <line key={i} x1={cx - W / 2 - 2 + i * ((W + 4) / 14)} y1={bandTop + 2} x2={cx - W / 2 - 2 + i * ((W + 4) / 14)} y2={bandBot - 2} stroke={dk} strokeWidth={1.1} opacity={0.5} />
          ))}
        </g>
      );
    }
    case 'cap':
    case 'capBack':
      return s.hat === 'cap' ? (
        <g>
          <path d={`M${f(cx - W / 2 - 3)},${f(top + H * 0.28)} C${f(cx - W / 2 - 4)},${f(top - 14)} ${f(cx + W / 2 + 4)},${f(top - 14)} ${f(cx + W / 2 + 3)},${f(top + H * 0.28)} Z`} fill={col} />
          <path d={`M${f(cx - W / 2 - 4)},${f(top + H * 0.27)} Q${f(cx)},${f(top + H * 0.2)} ${f(cx + W / 2 + 4)},${f(top + H * 0.27)} Q${f(cx + W * 0.3)},${f(top + H * 0.38)} ${f(cx)},${f(top + H * 0.37)} Q${f(cx - W * 0.3)},${f(top + H * 0.38)} ${f(cx - W / 2 - 4)},${f(top + H * 0.27)} Z`} fill={dk} />
          <circle cx={cx} cy={top - 6} r={2.4} fill={dk} />
          <path d={`M${f(cx)},${f(top - 6)} L${f(cx)},${f(top + H * 0.22)}`} stroke={dk} strokeWidth={1} opacity={0.6} />
        </g>
      ) : (
        <g>
          <path d={`M${f(cx - W / 2 - 3)},${f(top + H * 0.28)} C${f(cx - W / 2 - 4)},${f(top - 14)} ${f(cx + W / 2 + 4)},${f(top - 14)} ${f(cx + W / 2 + 3)},${f(top + H * 0.28)} Z`} fill={col} />
          <path d={`M${f(cx - W * 0.2)},${f(top + H * 0.22)} Q${f(cx)},${f(top + H * 0.12)} ${f(cx + W * 0.2)},${f(top + H * 0.22)}`} stroke={dk} strokeWidth={3} fill="none" />
        </g>
      );
    case 'helmet':
      return (
        <g>
          <path d={`M${f(cx - W / 2 - 10)},${f(g.earY + 16)} C${f(cx - W / 2 - 16)},${f(top - 26)} ${f(cx + W / 2 + 16)},${f(top - 26)} ${f(cx + W / 2 + 10)},${f(g.earY + 16)} L${f(cx + W / 2 + 2)},${f(g.earY + 18)} C${f(cx + W / 2)},${f(top + H * 0.3)} ${f(cx + W * 0.3)},${f(top + H * 0.26)} ${f(cx)},${f(top + H * 0.26)} C${f(cx - W * 0.3)},${f(top + H * 0.26)} ${f(cx - W / 2)},${f(top + H * 0.3)} ${f(cx - W / 2 - 2)},${f(g.earY + 18)} Z`} fill={col} stroke={shade(col, 0.15)} strokeWidth={1} />
          <path d={`M${f(cx - W * 0.35)},${f(top - 6)} Q${f(cx)},${f(top - 18)} ${f(cx + W * 0.25)},${f(top - 10)}`} stroke="#ffffff" strokeOpacity={0.7} strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d={`M${f(cx - W / 2 - 1)},${f(top + H * 0.28)} Q${f(cx)},${f(top + H * 0.18)} ${f(cx + W / 2 + 1)},${f(top + H * 0.28)}`} stroke={shade(col, 0.2)} strokeWidth={3} fill="none" />
          <path d={`M${f(cx - W / 2 + 1)},${f(g.earY + 16)} Q${f(cx)},${f(g.chin + 16)} ${f(cx + W / 2 - 1)},${f(g.earY + 16)}`} stroke="#333" strokeWidth={1.6} fill="none" />
        </g>
      );
    case 'bucket':
      return (
        <g>
          <path d={`M${f(cx - W / 2 - 14)},${f(top + H * 0.3)} L${f(cx + W / 2 + 14)},${f(top + H * 0.3)} L${f(cx + W / 2 + 4)},${f(top + H * 0.18)} L${f(cx - W / 2 - 4)},${f(top + H * 0.18)} Z`} fill={dk} />
          <path d={`M${f(cx - W / 2 - 2)},${f(top + H * 0.22)} C${f(cx - W / 2)},${f(top - 16)} ${f(cx + W / 2)},${f(top - 16)} ${f(cx + W / 2 + 2)},${f(top + H * 0.22)} Z`} fill={col} />
        </g>
      );
    case 'beret':
      return (
        <g>
          <ellipse cx={cx - 6} cy={top + 2} rx={W / 2 + 8} ry={12} fill={col} />
          <circle cx={cx - 4} cy={top - 10} r={2.5} fill={dk} />
        </g>
      );
    case 'chef':
      return (
        <g>
          <rect x={cx - W / 2 - 1} y={top + H * 0.06} width={W + 2} height={H * 0.18} fill="#ffffff" stroke="#d5d5d5" />
          <path d={`M${f(cx - W / 2)},${f(top + H * 0.08)} C${f(cx - W / 2 - 18)},${f(top - 18)} ${f(cx - 14)},${f(top - 40)} ${f(cx)},${f(top - 24)} C${f(cx + 14)},${f(top - 40)} ${f(cx + W / 2 + 18)},${f(top - 18)} ${f(cx + W / 2)},${f(top + H * 0.08)} Z`} fill="#ffffff" stroke="#d5d5d5" />
        </g>
      );
    case 'party':
      return (
        <g transform={`rotate(-12 ${cx} ${top})`}>
          <path d={`M${f(cx - 16)},${f(top + 2)} L${f(cx)},${f(top - 40)} L${f(cx + 16)},${f(top + 2)} Z`} fill={col} />
          <path d={`M${f(cx - 10)},${f(top - 14)} L${f(cx + 10)},${f(top - 14)} M${f(cx - 6)},${f(top - 26)} L${f(cx + 6)},${f(top - 26)}`} stroke={lt} strokeWidth={3} />
          <circle cx={cx} cy={top - 41} r={4} fill={lt} />
        </g>
      );
    case 'headband':
      return <path d={`M${f(cx - W / 2 - 1)},${f(g.earY - 8)} C${f(cx - W / 2 - 4)},${f(top - 8)} ${f(cx + W / 2 + 4)},${f(top - 8)} ${f(cx + W / 2 + 1)},${f(g.earY - 8)}`} stroke={col} strokeWidth={5} fill="none" strokeLinecap="round" />;
    case 'flowerCrown': {
      const flowers = [];
      for (let i = 0; i < 7; i++) {
        const t = Math.PI * (1.08 + (0.84 * i) / 6);
        const x = cx + (W / 2 + 2) * Math.cos(t);
        const y = top + H * 0.26 + (H * 0.32) * Math.sin(t);
        const c = [col, '#ffffff', shade(col, -0.3)][i % 3];
        flowers.push(
          <g key={i}>
            {[0, 72, 144, 216, 288].map((a) => (
              <circle key={a} cx={x + 4 * Math.cos((a * Math.PI) / 180)} cy={y + 4 * Math.sin((a * Math.PI) / 180)} r={3.4} fill={c} />
            ))}
            <circle cx={x} cy={y} r={2.2} fill="#f2c94c" />
          </g>,
        );
      }
      return <g>{flowers}</g>;
    }
    case 'veil':
      return (
        <g>
          <path d={`M${f(cx - W / 2 - 6)},${f(top + 6)} C${f(cx - W / 2 - 26)},${f(g.chin)} ${f(cx - W / 2 - 30)},${f(190)} ${f(cx - W / 2 - 20)},${f(201)} L${f(cx + W / 2 + 20)},${f(201)} C${f(cx + W / 2 + 30)},${f(190)} ${f(cx + W / 2 + 26)},${f(g.chin)} ${f(cx + W / 2 + 6)},${f(top + 6)} Q${f(cx)},${f(top - 12)} ${f(cx - W / 2 - 6)},${f(top + 6)} Z`} fill="#ffffff" opacity={0.45} />
          <path d={`M${f(cx - W * 0.42)},${f(top - 2)} Q${f(cx)},${f(top - 14)} ${f(cx + W * 0.42)},${f(top - 2)}`} stroke="#f3e7c8" strokeWidth={4} fill="none" strokeLinecap="round" />
          {[-0.3, -0.1, 0.1, 0.3].map((k) => (
            <circle key={k} cx={cx + k * W} cy={top - 7 - (0.1 - Math.abs(k) * 0.2) * 20} r={2} fill="#ffffff" />
          ))}
        </g>
      );
    case 'peineta':
      return (
        <g>
          <path d={`M${f(cx - W * 0.42)},${f(top + 4)} Q${f(cx - W * 0.46)},${f(top - 30)} ${f(cx)},${f(top - 36)} Q${f(cx + W * 0.46)},${f(top - 30)} ${f(cx + W * 0.42)},${f(top + 4)} Z`} fill={col} stroke={shade(col, 0.3)} strokeWidth={1.2} />
          <path d={`M${f(cx - W * 0.32)},${f(top - 2)} Q${f(cx)},${f(top - 30)} ${f(cx + W * 0.32)},${f(top - 2)}`} stroke={shade(col, 0.35)} strokeWidth={1.4} fill="none" />
          {[-0.25, -0.12, 0, 0.12, 0.25].map((k) => (
            <circle key={k} cx={cx + k * W} cy={top - 18 + Math.abs(k) * 30} r={2} fill={shade(col, -0.4)} />
          ))}
          <path d={`M${f(cx)},${f(top - 34)} l0,12`} stroke={shade(col, 0.3)} strokeWidth={1.2} />
        </g>
      );
    case 'bandana':
      return (
        <g>
          <path d={capPath(g, { lift: 4, hairY: g.hairline - 2, sideY: g.earY - 10, dip: -1 })} fill={col} />
          {[...Array(8)].map((_, i) => (
            <circle key={i} cx={cx - W * 0.35 + (i % 4) * W * 0.23} cy={top + 6 + Math.floor(i / 4) * 10} r={1.6} fill="#ffffff" opacity={0.85} />
          ))}
          <path d={`M${f(cx + W / 2 - 2)},${f(g.earY - 10)} l10,8 l-2,-12 Z`} fill={dk} />
        </g>
      );
    case 'hardhat':
      return (
        <g>
          <path d={`M${f(cx - W / 2 - 2)},${f(top + H * 0.2)} C${f(cx - W / 2 - 2)},${f(top - 20)} ${f(cx + W / 2 + 2)},${f(top - 20)} ${f(cx + W / 2 + 2)},${f(top + H * 0.2)} Z`} fill={col} />
          <rect x={cx - W / 2 - 8} y={top + H * 0.18} width={W + 16} height={6} rx={3} fill={dk} />
          <rect x={cx - 4} y={top - 14} width={8} height={H * 0.3} rx={3} fill={lt} />
        </g>
      );
    case 'top':
      return (
        <g>
          <rect x={cx - W * 0.36} y={top - 34} width={W * 0.72} height={40} rx={3} fill={col} />
          <rect x={cx - W * 0.36} y={top - 6} width={W * 0.72} height={7} fill={lt} />
          <ellipse cx={cx} cy={top + 4} rx={W / 2 + 8} ry={5} fill={col} />
        </g>
      );
    case 'sunhat':
      return (
        <g>
          <ellipse cx={cx} cy={top + H * 0.18} rx={W / 2 + 30} ry={12} fill={col} />
          <path d={`M${f(cx - W / 2 + 2)},${f(top + H * 0.18)} C${f(cx - W / 2)},${f(top - 20)} ${f(cx + W / 2)},${f(top - 20)} ${f(cx + W / 2 - 2)},${f(top + H * 0.18)} Z`} fill={col} />
          <rect x={cx - W / 2 + 1} y={top + H * 0.08} width={W - 2} height={7} fill={dk} />
        </g>
      );
    case 'police':
      return (
        <g>
          <path d={`M${f(cx - W / 2 - 6)},${f(top + H * 0.2)} C${f(cx - W / 2 - 8)},${f(top - 22)} ${f(cx + W / 2 + 8)},${f(top - 22)} ${f(cx + W / 2 + 6)},${f(top + H * 0.2)} Z`} fill={col} />
          <rect x={cx - W / 2 - 4} y={top + H * 0.12} width={W + 8} height={H * 0.11} rx={3} fill={dk} />
          <path d={`M${f(cx - W / 2)},${f(top + H * 0.23)} Q${f(cx)},${f(top + H * 0.36)} ${f(cx + W / 2)},${f(top + H * 0.23)} Z`} fill="#1a1a1a" />
          <path d={`M${f(cx)},${f(top - 6)} l6,4 l-1,7 l-5,3 l-5,-3 l-1,-7 Z`} fill="#e0b84a" stroke={shade('#e0b84a', 0.3)} strokeWidth={0.8} />
        </g>
      );
    case 'crown':
      return (
        <path d={`M${f(cx - W * 0.36)},${f(top + 4)} L${f(cx - W * 0.4)},${f(top - 22)} L${f(cx - W * 0.18)},${f(top - 8)} L${f(cx)},${f(top - 28)} L${f(cx + W * 0.18)},${f(top - 8)} L${f(cx + W * 0.4)},${f(top - 22)} L${f(cx + W * 0.36)},${f(top + 4)} Z`} fill="#f2c94c" stroke="#c99a1b" strokeWidth={1.5} />
      );
    default:
      return null;
  }
}

/** Gorros que se pintan detrás del pelo (p. ej. el velo cae por detrás). */
export function hatBehind(s: AvatarSpec, g: HeadGeom): ReactNode {
  if (s.hat !== 'veil') return null;
  const { cx, top, W } = g;
  return (
    <path
      d={`M${f(cx - W / 2 - 4)},${f(top + 2)} C${f(cx - W - 6)},${f(g.chin)} ${f(cx - W - 10)},${f(190)} ${f(cx - W)},${f(201)} L${f(cx + W)},${f(201)} C${f(cx + W + 10)},${f(190)} ${f(cx + W + 6)},${f(g.chin)} ${f(cx + W / 2 + 4)},${f(top + 2)} Z`}
      fill="#ffffff"
      opacity={0.7}
    />
  );
}

/* ----------------------------------------------------------------- extras */
export function renderExtrasFront(s: AvatarSpec, g: HeadGeom): ReactNode {
  const items: ReactNode[] = [];
  const { cx, top, W } = g;
  if (s.extras.includes('headphones')) {
    items.push(
      <g key="hp">
        <path d={`M${f(cx - W / 2 - 4)},${f(g.earY)} C${f(cx - W / 2 - 8)},${f(top - 24)} ${f(cx + W / 2 + 8)},${f(top - 24)} ${f(cx + W / 2 + 4)},${f(g.earY)}`} stroke="#2a2a2a" strokeWidth={5} fill="none" />
        <rect x={cx - W / 2 - 10} y={g.earY - 12} width={12} height={22} rx={5} fill="#2a2a2a" />
        <rect x={cx + W / 2 - 2} y={g.earY - 12} width={12} height={22} rx={5} fill="#2a2a2a" />
        <rect x={cx - W / 2 - 8} y={g.earY - 9} width={5} height={16} rx={2.5} fill="#e05a73" />
        <rect x={cx + W / 2 + 3} y={g.earY - 9} width={5} height={16} rx={2.5} fill="#e05a73" />
      </g>,
    );
  }
  if (s.extras.includes('microphone')) {
    items.push(
      <path key="mic" d={`M${f(cx + W / 2)},${f(g.earY + 4)} Q${f(cx + W * 0.35)},${f(g.chin - 6)} ${f(cx + W * 0.12)},${f(g.top + g.H * 0.76)}`} stroke="#333" strokeWidth={2.2} fill="none" />,
      <circle key="mic2" cx={cx + W * 0.1} cy={g.top + g.H * 0.76} r={3.4} fill="#333" />,
    );
  }
  if (s.extras.includes('flowerEar')) {
    const x = cx + W / 2 + 2;
    const y = g.earY - 14;
    items.push(
      <g key="fl">
        {[0, 72, 144, 216, 288].map((a) => (
          <circle key={a} cx={x + 6 * Math.cos((a * Math.PI) / 180)} cy={y + 6 * Math.sin((a * Math.PI) / 180)} r={5} fill="#f06292" />
        ))}
        <circle cx={x} cy={y} r={3.5} fill="#f2c94c" />
      </g>,
    );
  }
  if (s.extras.includes('mask')) {
    items.push(
      <g key="mask">
        <path d={`M${f(cx - W * 0.44)},${f(g.top + g.H * 0.58)} Q${f(cx)},${f(g.top + g.H * 0.52)} ${f(cx + W * 0.44)},${f(g.top + g.H * 0.58)} L${f(cx + W * 0.38)},${f(g.chin - 4)} Q${f(cx)},${f(g.chin + 6)} ${f(cx - W * 0.38)},${f(g.chin - 4)} Z`} fill="#f4f7fa" stroke="#c9d3dc" strokeWidth={1} />
        <path d={`M${f(cx - W * 0.44)},${f(g.top + g.H * 0.6)} L${f(cx - W / 2)},${f(g.earY - 2)} M${f(cx + W * 0.44)},${f(g.top + g.H * 0.6)} L${f(cx + W / 2)},${f(g.earY - 2)}`} stroke="#c9d3dc" strokeWidth={1.4} />
      </g>,
    );
  }
  if (s.extras.includes('blushHearts')) {
    const heart = (x: number, y: number, r: number, k: string) => (
      <path key={k} d={`M${x},${y + r * 0.9} C${x - r * 1.6},${y - r * 0.2} ${x - r * 0.6},${y - r * 1.4} ${x},${y - r * 0.4} C${x + r * 0.6},${y - r * 1.4} ${x + r * 1.6},${y - r * 0.2} ${x},${y + r * 0.9} Z`} fill="#ff4d6d" />
    );
    items.push(heart(30, 40, 9, 'h1'), heart(172, 58, 7, 'h2'), heart(160, 26, 5, 'h3'));
  }
  return items.length ? <g>{items}</g> : null;
}

/** Extras sobre el torso (cámara, bufanda, acreditación, ramo...). */
export function renderExtrasBody(s: AvatarSpec, g: HeadGeom): ReactNode {
  const items: ReactNode[] = [];
  const { cx } = g;
  if (s.extras.includes('scarf')) {
    const col = mix(s.hatColor, '#ffffff', 0.1);
    items.push(
      <g key="scarf">
        <path d={`M${f(cx - g.neckW / 2 - 8)},${f(g.chin + 14)} Q${f(cx)},${f(g.chin + 30)} ${f(cx + g.neckW / 2 + 8)},${f(g.chin + 14)} L${f(cx + g.neckW / 2 + 10)},${f(g.chin + 26)} Q${f(cx)},${f(g.chin + 42)} ${f(cx - g.neckW / 2 - 10)},${f(g.chin + 26)} Z`} fill={col} />
        <path d={`M${f(cx + 6)},${f(g.chin + 30)} l4,40 l12,0 l-6,-42 Z`} fill={shade(col, 0.15)} />
      </g>,
    );
  }
  if (s.extras.includes('towelNeck')) {
    items.push(
      <path key="towel" d={`M${f(cx - g.neckW / 2 - 14)},${f(g.chin + 18)} Q${f(cx)},${f(g.chin + 36)} ${f(cx + g.neckW / 2 + 14)},${f(g.chin + 18)} L${f(cx + g.neckW / 2 + 12)},${f(201)} L${f(cx + g.neckW / 2 - 2)},${f(201)} L${f(cx + g.neckW / 2 - 2)},${f(g.chin + 34)} Q${f(cx)},${f(g.chin + 44)} ${f(cx - g.neckW / 2 + 2)},${f(g.chin + 34)} L${f(cx - g.neckW / 2 + 2)},${f(201)} L${f(cx - g.neckW / 2 - 12)},${f(201)} Z`} fill="#ffffff" stroke="#dadada" strokeWidth={1} />,
    );
  }
  if (s.extras.includes('camera')) {
    items.push(
      <g key="cam">
        <path d={`M${f(cx - g.neckW / 2 - 2)},${f(g.chin + 14)} L${f(cx - 22)},${f(184)} M${f(cx + g.neckW / 2 + 2)},${f(g.chin + 14)} L${f(cx + 22)},${f(184)}`} stroke="#1c1c1c" strokeWidth={3} />
        <rect x={cx - 26} y={178} width={52} height={26} rx={4} fill="#222" />
        <rect x={cx - 22} y={174} width={14} height={6} rx={2} fill="#333" />
        <circle cx={cx + 4} cy={191} r={11} fill="#333" stroke="#111" strokeWidth={2} />
        <circle cx={cx + 4} cy={191} r={6} fill="#3b4a6b" />
        <circle cx={cx + 2} cy={189} r={2} fill="#9fb3d9" />
        <rect x={cx - 23} y={183} width={8} height={4} fill="#c0392b" />
      </g>,
    );
  }
  if (s.extras.includes('badge')) {
    items.push(
      <g key="badge">
        <path d={`M${f(cx - g.neckW / 2)},${f(g.chin + 14)} L${f(cx - 8)},${f(184)} M${f(cx + g.neckW / 2)},${f(g.chin + 14)} L${f(cx + 8)},${f(184)}`} stroke="#c0392b" strokeWidth={3} />
        <rect x={cx - 12} y={182} width={24} height={18} rx={2} fill="#ffffff" stroke="#999" />
        <rect x={cx - 8} y={186} width={16} height={4} fill="#c0392b" />
      </g>,
    );
  }
  if (s.extras.includes('bouquet')) {
    items.push(
      <g key="bq">
        <path d={`M${cx + 30},${200} l-6,-18 l12,0 Z`} fill="#6a994e" />
        {[
          [cx + 22, 176, '#ffffff'],
          [cx + 36, 174, '#f8bbd0'],
          [cx + 29, 166, '#ffffff'],
          [cx + 42, 184, '#f8bbd0'],
          [cx + 16, 186, '#f8bbd0'],
        ].map(([x, y, c], i) => (
          <circle key={i} cx={x as number} cy={y as number} r={7} fill={c as string} stroke="#e3c4cf" strokeWidth={0.8} />
        ))}
      </g>,
    );
  }
  if (s.extras.includes('guitar')) {
    items.push(
      <g key="gt" transform={`rotate(-35 ${cx} 185)`}>
        <rect x={cx - 70} y={182} width={80} height={6} fill="#5d4037" />
        <ellipse cx={cx + 28} cy={185} rx={24} ry={18} fill="#c0392b" />
        <circle cx={cx + 24} cy={185} r={5} fill="#2b1b17" />
      </g>,
    );
  }
  if (s.extras.includes('drink')) {
    items.push(
      <g key="dr">
        <path d={`M${cx + 38},${172} l20,0 l-4,22 l-12,0 Z`} fill="#bfe8d6" fillOpacity={0.8} stroke="#7fb89f" strokeWidth={1} />
        <circle cx={cx + 52} cy={170} r={4} fill="#9ccc65" />
        <path d={`M${cx + 46},${168} l6,-10`} stroke="#ef5350" strokeWidth={2} />
      </g>,
    );
  }
  return items.length ? <g>{items}</g> : null;
}

/** Utilidad usada por la gorra/casco: silueta de cabeza. */
export function headSilhouette(g: HeadGeom): string {
  return smoothClosed(g.right);
}
