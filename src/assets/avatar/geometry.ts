/**
 * Geometría de la cabeza a partir de la especificación del avatar.
 * Todo el dibujo del avatar usa un lienzo de 200×200.
 */
import type { AvatarSpec } from './types';

export type Pt = [number, number];

/** Spline de Catmull-Rom cerrada → path SVG suave que pasa por todos los puntos. */
export function smoothClosed(points: Pt[], tension = 1): string {
  const n = points.length;
  let d = `M${points[0][0].toFixed(2)},${points[0][1].toFixed(2)}`;
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    const c1: Pt = [p1[0] + ((p2[0] - p0[0]) / 6) * tension, p1[1] + ((p2[1] - p0[1]) / 6) * tension];
    const c2: Pt = [p2[0] - ((p3[0] - p1[0]) / 6) * tension, p2[1] - ((p3[1] - p1[1]) / 6) * tension];
    d += ` C${c1[0].toFixed(2)},${c1[1].toFixed(2)} ${c2[0].toFixed(2)},${c2[1].toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`;
  }
  return d + ' Z';
}

/** Spline abierta (no cierra el trazo). */
export function smoothOpen(points: Pt[], tension = 1): string {
  const n = points.length;
  let d = `M${points[0][0].toFixed(2)},${points[0][1].toFixed(2)}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(n - 1, i + 2)];
    const c1: Pt = [p1[0] + ((p2[0] - p0[0]) / 6) * tension, p1[1] + ((p2[1] - p0[1]) / 6) * tension];
    const c2: Pt = [p2[0] - ((p3[0] - p1[0]) / 6) * tension, p2[1] - ((p3[1] - p1[1]) / 6) * tension];
    d += ` C${c1[0].toFixed(2)},${c1[1].toFixed(2)} ${c2[0].toFixed(2)},${c2[1].toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`;
  }
  return d;
}

/** Refleja puntos del lado derecho al izquierdo respecto a cx. */
export const mirror = (pts: Pt[], cx: number): Pt[] => pts.map(([x, y]) => [2 * cx - x, y] as Pt);

export interface HeadGeom {
  cx: number;
  /** y del punto más alto del cráneo. */
  top: number;
  /** y de la barbilla. */
  chin: number;
  /** Alto de la cara. */
  H: number;
  /** Ancho máximo (pómulos). */
  W: number;
  /** Ancho de la frente. */
  F: number;
  /** Ancho de la mandíbula. */
  J: number;
  /** Semiancho de la barbilla. */
  c: number;
  /** y de la línea del pelo en la frente. */
  hairline: number;
  /** y de los ojos (para gafas). */
  eyeY: number;
  /** y de las orejas (centro). */
  earY: number;
  earRx: number;
  earRy: number;
  /** Ancho del cuello. */
  neckW: number;
  /** Ancho de hombros. */
  bodyW: number;
  /** y del arranque de hombros. */
  shoulderY: number;
  /** Puntos del contorno de la cara (lado derecho, de arriba a abajo). */
  right: Pt[];
  facePath: string;
  /** Contorno de la mitad inferior (para barbas). */
  jawY: number;
}

export function headGeom(s: Pick<AvatarSpec, 'face' | 'weight' | 'jaw' | 'length'>): HeadGeom {
  const cx = 100;
  let W = 64 + s.weight * 16;
  let H = 84 + s.length * 12;
  let jawK = 0.6 + s.jaw * 0.3;
  let foreK = 0.9;
  let chinK = 0.15 + s.jaw * 0.06;
  let cheekY = 0.5;
  switch (s.face) {
    case 'round':
      W += 5;
      H -= 6;
      jawK += 0.08;
      chinK += 0.06;
      break;
    case 'square':
      W += 2;
      jawK = Math.max(jawK, 0.86);
      chinK += 0.08;
      cheekY = 0.55;
      break;
    case 'long':
      W -= 4;
      H += 9;
      break;
    case 'heart':
      foreK = 1.0;
      jawK = Math.min(jawK, 0.58);
      chinK = 0.07;
      cheekY = 0.42;
      break;
    case 'diamond':
      foreK = 0.78;
      jawK = Math.min(jawK, 0.62);
      chinK = 0.09;
      cheekY = 0.52;
      break;
    default:
      break;
  }
  const chin = 142;
  const top = chin - H;
  const F = W * foreK;
  const J = W * jawK;
  const c = W * chinK;
  const right: Pt[] = [
    [cx, top],
    [cx + F * 0.36, top + H * 0.06],
    [cx + F / 2, top + H * 0.24],
    [cx + W / 2, top + H * cheekY],
    [cx + J / 2, top + H * 0.82],
    [cx + c + 2, chin - 1.5],
    [cx, chin],
  ];
  const left = mirror(right.slice(1, -1), cx).reverse();
  const facePath = smoothClosed([...right, ...left], 1);
  const neckW = W * 0.44 + s.weight * 8;
  const bodyW = 150 + s.weight * 32;
  return {
    cx,
    top,
    chin,
    H,
    W,
    F,
    J,
    c,
    hairline: top + H * 0.2,
    eyeY: top + H * 0.5,
    earY: top + H * 0.52,
    earRx: 6.5 + s.weight * 1.5,
    earRy: 10.5,
    neckW,
    bodyW,
    shoulderY: 166,
    right,
    facePath,
    jawY: top + H * 0.62,
  };
}

/** Punto del contorno de la cara a una altura relativa t (0 arriba, 1 barbilla), lado derecho. */
export function faceXAt(g: HeadGeom, t: number): number {
  const y = g.top + g.H * t;
  const pts = g.right;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    if (y >= y1 && y <= y2) {
      const k = (y - y1) / Math.max(0.001, y2 - y1);
      return x1 + (x2 - x1) * k;
    }
  }
  return g.cx;
}
