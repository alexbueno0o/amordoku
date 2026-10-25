/**
 * Formas reutilizables para pelo y complementos (casquetes, nubes de rizos...).
 */
import { smoothOpen, type HeadGeom, type Pt } from './geometry';

const f = (n: number) => n.toFixed(2);

/**
 * Casquete de pelo que cubre la parte de arriba de la cabeza.
 * @param lift  cuánto sobresale por encima del cráneo (volumen)
 * @param hairY altura de la línea del pelo en la frente
 * @param sideY hasta dónde baja por los lados
 * @param dip   curvatura de la línea del pelo (positivo = flequillo que baja en el centro)
 */
export function capPath(g: HeadGeom, o: { lift: number; hairY?: number; sideY?: number; dip?: number; widen?: number }): string {
  const { cx, top, H, W, F } = g;
  const lift = o.lift;
  const widen = o.widen ?? 0;
  const hairY = o.hairY ?? g.hairline;
  const sideY = o.sideY ?? g.earY - 6;
  const dip = o.dip ?? -4;
  const outer: Pt[] = [
    [cx - W / 2 - 1.5 - widen, sideY],
    [cx - W / 2 - lift * 0.35 - widen, top + H * 0.26],
    [cx - F * 0.46 - lift * 0.45, top + H * 0.08 - lift * 0.35],
    [cx - F * 0.26, top - lift * 0.85],
    [cx + F * 0.04, top - lift * 1.0],
    [cx + F * 0.3, top - lift * 0.8],
    [cx + F * 0.46 + lift * 0.45, top + H * 0.08 - lift * 0.35],
    [cx + W / 2 + lift * 0.35 + widen, top + H * 0.26],
    [cx + W / 2 + 1.5 + widen, sideY],
  ];
  let d = smoothOpen(outer, 1);
  d += ` L${f(cx + W / 2 - 3)},${f(sideY)}`;
  d += ` C${f(cx + W / 2 - 4)},${f(sideY - 10)} ${f(cx + F / 2 - 2)},${f(hairY + 10)} ${f(cx + F / 2 - 6)},${f(hairY + 4)}`;
  d += ` Q${f(cx)},${f(hairY + dip * 2 - 4)} ${f(cx - F / 2 + 6)},${f(hairY + 4)}`;
  d += ` C${f(cx - F / 2 + 2)},${f(hairY + 10)} ${f(cx - W / 2 + 4)},${f(sideY - 10)} ${f(cx - W / 2 + 3)},${f(sideY)}`;
  return d + ' Z';
}

/** Contorno festoneado (nube) a partir de puntos en sentido horario. */
export function scallop(points: Pt[], bulge = 0.62, closed = true): string {
  let d = `M${f(points[0][0])},${f(points[0][1])}`;
  const n = points.length;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const a = points[i];
    const b = points[(i + 1) % n];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const r = Math.max(1, len * bulge);
    d += ` A${f(r)},${f(r)} 0 0 1 ${f(b[0])},${f(b[1])}`;
  }
  return closed ? d + ' Z' : d;
}

/** Puntos sobre una elipse entre dos ángulos (radianes, sentido horario en pantalla). */
export function ellipsePts(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n: number, jitter = 0, seed = 1): Pt[] {
  const out: Pt[] = [];
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = 0; i <= n; i++) {
    const t = a0 + ((a1 - a0) * i) / n;
    const j = 1 + (rnd() - 0.5) * jitter;
    out.push([cx + rx * Math.cos(t) * j, cy + ry * Math.sin(t) * j]);
  }
  return out;
}

/** Path de una elipse completa. */
export function ellipsePath(cx: number, cy: number, rx: number, ry: number): string {
  return `M${f(cx - rx)},${f(cy)} A${f(rx)},${f(ry)} 0 1 0 ${f(cx + rx)},${f(cy)} A${f(rx)},${f(ry)} 0 1 0 ${f(cx - rx)},${f(cy)} Z`;
}

/** Rizos decorativos (pequeños arcos) para dar textura. */
export function curlStrokes(cx: number, cy: number, rx: number, ry: number, count: number, seed = 3): string {
  let d = '';
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = 0; i < count; i++) {
    const a = rnd() * Math.PI * 2;
    const rr = Math.sqrt(rnd());
    const x = cx + Math.cos(a) * rx * rr;
    const y = cy + Math.sin(a) * ry * rr;
    const r = 3 + rnd() * 2.5;
    const start = rnd() * Math.PI * 2;
    const x1 = x + Math.cos(start) * r;
    const y1 = y + Math.sin(start) * r;
    const x2 = x + Math.cos(start + 3.6) * r;
    const y2 = y + Math.sin(start + 3.6) * r;
    d += ` M${f(x1)},${f(y1)} A${f(r)},${f(r)} 0 1 1 ${f(x2)},${f(y2)}`;
  }
  return d.trim();
}
