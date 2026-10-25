/**
 * Peinados. Cada estilo devuelve hasta tres capas:
 *  - behind: detrás del torso (coletas, moños traseros...)
 *  - over:   delante del torso pero detrás de la cara (melenas que caen por los hombros)
 *  - front:  delante de la cara (flequillos, casquetes...)
 */
import type { ReactNode } from 'react';
import { shade } from '../color';
import { smoothClosed, smoothOpen, type HeadGeom, type Pt } from './geometry';
import { capPath, curlStrokes, ellipsePath, ellipsePts, scallop } from './shapes';
import type { AvatarSpec } from './types';

export interface HairLayers {
  behind?: ReactNode;
  over?: ReactNode;
  front?: ReactNode;
}

const f = (n: number) => n.toFixed(2);

/** Melena larga que cae por los lados (capa "over"). */
function longCurtain(g: HeadGeom, o: { bottom: number; spread: number; wave?: number; innerGap?: number }): string {
  const { cx, top, H, W } = g;
  const sp = o.spread;
  const wave = o.wave ?? 0;
  const gap = o.innerGap ?? 8;
  const outerR: Pt[] = [
    [cx, top - 5],
    [cx + W * 0.36 + 4, top + H * 0.02],
    [cx + W / 2 + sp * 0.6, top + H * 0.3],
    [cx + W / 2 + sp * 0.75 + wave, top + H * 0.62],
    [cx + W / 2 + sp - wave, top + H * 0.95],
    [cx + W / 2 + sp + 2 + wave, o.bottom - 18],
    [cx + W / 2 + sp - 4, o.bottom],
  ];
  const innerR: Pt[] = [
    [cx + W / 2 - gap, o.bottom],
    [cx + W / 2 - gap + 1 + wave * 0.5, g.chin + 18],
    [cx + W / 2 - 10, g.chin - 6],
    [cx + W / 4, top + H * 0.5],
  ];
  const outerL = outerR.slice(1).map(([x, y]) => [2 * cx - x, y] as Pt).reverse();
  const innerL = innerR.map(([x, y]) => [2 * cx - x, y] as Pt).reverse();
  // Contorno: arriba → derecha exterior → abajo → derecha interior → izquierda interior → abajo → izquierda exterior
  let d = smoothOpen(outerR, 1);
  d += ' ' + smoothOpen(innerR, 1).replace(/^M/, 'L');
  d += ' ' + smoothOpen(innerL, 1).replace(/^M/, 'L');
  d += ' ' + smoothOpen([[2 * cx - (cx + W / 2 + sp - 4), o.bottom], ...outerL.slice(1)], 1).replace(/^M/, 'L');
  return d + ' Z';
}

/** Mechón de flequillo lateral. */
function sweep(g: HeadGeom, side: 1 | -1, depth = 0.3): string {
  const { cx, top, H, F } = g;
  const p: Pt[] = [
    [cx - side * F * 0.1, top - 4],
    [cx + side * F * 0.25, top + H * 0.06],
    [cx + side * (F / 2 + 2), top + H * (0.2 + depth * 0.25)],
    [cx + side * (F / 2 - 6), top + H * (0.24 + depth * 0.2)],
    [cx + side * F * 0.12, top + H * (0.16 + depth * 0.1)],
    [cx - side * F * 0.2, top + H * 0.14],
  ];
  return smoothClosed(p, 1);
}


/** Racimo de rizos: círculos con un trazo interior en forma de "C". */
function curls(points: Pt[], r: number, fill: string, ink: string, seed = 1, inkOpacity = 0.55): ReactNode {
  let st = seed;
  const rnd = () => {
    st = (st * 9301 + 49297) % 233280;
    return st / 233280;
  };
  return (
    <g>
      {points.map(([x, y], i) => {
        const rr = r * (0.85 + rnd() * 0.3);
        const a = rnd() * Math.PI * 2;
        const ir = rr * 0.55;
        const x1 = x + Math.cos(a) * ir;
        const y1 = y + Math.sin(a) * ir;
        const x2 = x + Math.cos(a + 3.8) * ir;
        const y2 = y + Math.sin(a + 3.8) * ir;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={rr} fill={fill} />
            <path d={`M${f(x1)},${f(y1)} A${f(ir)},${f(ir)} 0 1 1 ${f(x2)},${f(y2)}`} stroke={ink} strokeWidth={1.3} fill="none" opacity={inkOpacity} strokeLinecap="round" />
          </g>
        );
      })}
    </g>
  );
}

/** Puntos repartidos dentro de una elipse (filas al tresbolillo), de atrás hacia delante. */
function fillEllipse(cx: number, cy: number, rx: number, ry: number, step: number, yMax = Infinity): Pt[] {
  const out: Pt[] = [];
  let row = 0;
  for (let y = cy - ry; y <= Math.min(cy + ry, yMax); y += step * 0.8, row++) {
    const k = 1 - ((y - cy) / ry) ** 2;
    if (k <= 0) continue;
    const half = rx * Math.sqrt(k);
    const off = row % 2 ? step / 2 : 0;
    for (let x = cx - half + off; x <= cx + half; x += step) out.push([x, y]);
  }
  return out;
}

/** Estilos "de casquete": se añade pelo por detrás de la cabeza (nuca y sienes). */
const CAP_STYLES = new Set([
  'short', 'sidePart', 'quiff', 'messy', 'slick', 'curlyShort', 'mullet', 'manBun', 'spiky', 'pixie', 'ponytail',
  'highBun', 'lowBun', 'braid', 'twoBuns', 'fallera', 'bridal', 'wavyMedium',
]);

export function renderHair(s: AvatarSpec, g: HeadGeom): HairLayers {
  const layers = renderHairInner(s, g);
  if (CAP_STYLES.has(s.hair)) {
    const nape = <ellipse cx={g.cx} cy={g.top + g.H * 0.36} rx={g.W / 2 + 4} ry={g.H * 0.44} fill={shade(s.hairColor, 0.3)} />;
    layers.behind = (
      <g>
        {nape}
        {layers.behind}
      </g>
    );
  }
  return layers;
}

function renderHairInner(s: AvatarSpec, g: HeadGeom): HairLayers {
  const base = s.hairColor;
  const dark = shade(base, 0.28);
  const light = shade(base, -0.22);
  const tex = shade(base, 0.4);
  const { cx, top, H, W, F } = g;
  const hl = s.hairHighlight;

  switch (s.hair) {
    case 'bald':
      return {
        front: <path d={`M${f(cx - W * 0.22)},${f(top + 10)} q${f(W * 0.12)},-6 ${f(W * 0.24)},-2`} stroke="#ffffff" strokeOpacity={0.35} strokeWidth={3} fill="none" strokeLinecap="round" />,
      };
    case 'buzz':
      return { front: <path d={capPath(g, { lift: 1.5, hairY: g.hairline + 3, sideY: g.earY - 10 })} fill={base} opacity={0.82} /> };
    case 'short':
      return {
        front: (
          <g>
            <path d={capPath(g, { lift: 7, sideY: g.earY - 8, dip: 1 })} fill={base} />
            <path d={`M${f(cx - F * 0.3)},${f(top + 2)} Q${f(cx)},${f(top - 8)} ${f(cx + F * 0.32)},${f(top + 4)}`} stroke={light} strokeWidth={2} fill="none" opacity={0.5} />
          </g>
        ),
      };
    case 'sidePart':
      return {
        front: (
          <g>
            <path d={capPath(g, { lift: 9, sideY: g.earY - 8, dip: 0 })} fill={base} />
            <path d={sweep(g, 1, 0.4)} fill={light} opacity={0.55} />
            <path d={`M${f(cx - F * 0.22)},${f(top - 6)} L${f(cx - F * 0.3)},${f(top + H * 0.17)}`} stroke={dark} strokeWidth={2.2} strokeLinecap="round" />
          </g>
        ),
      };
    case 'quiff':
      return {
        front: (
          <g>
            <path d={capPath(g, { lift: 6, sideY: g.earY - 8, hairY: g.hairline - 2 })} fill={base} />
            <path
              d={smoothClosed([
                [cx - F * 0.42, top + H * 0.14],
                [cx - F * 0.25, top - 14],
                [cx + F * 0.1, top - 22],
                [cx + F * 0.42, top - 12],
                [cx + F * 0.45, top + H * 0.1],
                [cx, top + H * 0.08],
              ])}
              fill={base}
            />
            <path d={`M${f(cx - F * 0.2)},${f(top - 8)} Q${f(cx + F * 0.1)},${f(top - 20)} ${f(cx + F * 0.36)},${f(top - 8)}`} stroke={light} strokeWidth={2.5} fill="none" opacity={0.6} />
          </g>
        ),
      };
    case 'messy': {
      const spikes: Pt[] = [];
      const n = 11;
      for (let i = 0; i <= n; i++) {
        const t = Math.PI + (Math.PI * i) / n;
        const r = i % 2 === 0 ? 1.18 : 1.02;
        spikes.push([cx + (W / 2 + 4) * Math.cos(t) * r, top + H * 0.26 + (H * 0.36 + 4) * Math.sin(t) * r]);
      }
      return {
        front: (
          <g>
            <path d={capPath(g, { lift: 6, sideY: g.earY - 8, dip: 2 })} fill={base} />
            <path d={`M${spikes.map(([x, y]) => `${f(x)},${f(y)}`).join(' L')} Z`} fill={base} strokeLinejoin="round" />
            <path d={`M${f(cx - F * 0.45)},${f(top + H * 0.22)} l8,-10 l6,9 l7,-11 l6,10 l7,-9 l6,11 l7,-10 l6,9`} fill={base} />
          </g>
        ),
      };
    }
    case 'slick':
      return {
        front: (
          <g>
            <path d={capPath(g, { lift: 5, hairY: g.hairline - 3, sideY: g.earY - 7, dip: -2 })} fill={base} />
            {[-0.25, -0.08, 0.1, 0.27].map((k) => (
              <path key={k} d={`M${f(cx + F * k)},${f(top + H * 0.14)} Q${f(cx + F * k * 1.1)},${f(top + 2)} ${f(cx + F * k * 0.6)},${f(top - 3)}`} stroke={light} strokeWidth={1.6} fill="none" opacity={0.55} />
            ))}
          </g>
        ),
      };
    case 'receding':
      return {
        front: (
          <g>
            <path d={capPath(g, { lift: 4, hairY: g.hairline - 6, sideY: g.earY - 8, dip: 4 })} fill={base} />
            <ellipse cx={cx - F * 0.3} cy={top + H * 0.12} rx={F * 0.16} ry={H * 0.1} fill={s.skin} />
            <ellipse cx={cx + F * 0.3} cy={top + H * 0.12} rx={F * 0.16} ry={H * 0.1} fill={shade(s.skin, 0.08)} />
          </g>
        ),
      };
    case 'grandpa':
      return {
        front: (
          <g>
            <path d={`M${f(cx - W / 2 - 2)},${f(g.earY - 2)} Q${f(cx - W / 2 - 3)},${f(top + H * 0.2)} ${f(cx - F * 0.3)},${f(top + H * 0.12)} L${f(cx - F * 0.32)},${f(top + H * 0.2)} Q${f(cx - W / 2 + 6)},${f(top + H * 0.3)} ${f(cx - W / 2 + 4)},${f(g.earY - 2)} Z`} fill={base} />
            <path d={`M${f(cx + W / 2 + 2)},${f(g.earY - 2)} Q${f(cx + W / 2 + 3)},${f(top + H * 0.2)} ${f(cx + F * 0.3)},${f(top + H * 0.12)} L${f(cx + F * 0.32)},${f(top + H * 0.2)} Q${f(cx + W / 2 - 6)},${f(top + H * 0.3)} ${f(cx + W / 2 - 4)},${f(g.earY - 2)} Z`} fill={base} />
            <path d={`M${f(cx - F * 0.18)},${f(top + 3)} q${f(F * 0.18)},-5 ${f(F * 0.36)},0`} stroke={base} strokeWidth={3} fill="none" opacity={0.6} strokeLinecap="round" />
          </g>
        ),
      };
    case 'spiky': {
      const pts: Pt[] = [];
      const n = 13;
      for (let i = 0; i <= n; i++) {
        const t = Math.PI * 1.05 + (Math.PI * 0.9 * i) / n;
        const r = i % 2 === 0 ? 1.0 : 1.32;
        pts.push([cx + (W / 2 + 2) * Math.cos(t) * r, top + H * 0.3 + H * 0.34 * Math.sin(t) * r]);
      }
      return {
        front: (
          <g>
            <path d={capPath(g, { lift: 5, sideY: g.earY - 8 })} fill={base} />
            <path d={`M${pts.map(([x, y]) => `${f(x)},${f(y)}`).join(' L')} Z`} fill={base} />
          </g>
        ),
      };
    }
    case 'curlyShort': {
      const topMass = fillEllipse(cx, top + H * 0.06, W / 2 + 4, H * 0.24 + 3, 11, top + H * 0.18);
      const fringe: Pt[] = [];
      for (let i = 0; i < 6; i++) fringe.push([cx - F * 0.42 + (i * F * 0.84) / 5, top + H * 0.2 + (i % 2 ? 2 : -1)]);
      return {
        front: (
          <g>
            <path d={capPath(g, { lift: 4, sideY: g.earY - 8 })} fill={base} />
            {curls(topMass, 7, base, tex, 9)}
            {curls(fringe, 6.5, base, tex, 2)}
          </g>
        ),
      };
    }
    case 'curlyMedium':
    case 'curlyLong': {
      const long = s.hair === 'curlyLong';
      // Silueta trasera (sienes, orejas y nuca)
      const back = ellipsePts(cx, top + H * (long ? 0.55 : 0.4), W / 2 + (long ? 16 : 9), H * (long ? 0.8 : 0.5), -Math.PI * 0.5, Math.PI * 1.5, long ? 22 : 18, 0.1, 11);
      // Volumen de arriba con flequillo rizado que cae sobre la frente
      const topArc = ellipsePts(cx, top + H * 0.17, W / 2 + 9, H * 0.3 + 4, Math.PI * 0.97, Math.PI * 2.03, 12, 0.12, 5);
      const fringe: Pt[] = [
        [cx + W / 2 + 2, top + H * 0.36],
        [cx + F / 2 - 4, top + H * 0.28],
        [cx + F * 0.28, top + H * 0.27],
        [cx + F * 0.08, top + H * 0.3],
        [cx - F * 0.12, top + H * 0.27],
        [cx - F * 0.32, top + H * 0.28],
        [cx - F / 2 + 3, top + H * 0.27],
        [cx - W / 2 - 2, top + H * 0.36],
      ];
      const marks = (cxm: number, cym: number, rx: number, ry: number, n: number, seed: number, col: string, op: number) => {
        let st = seed;
        const rnd = () => {
          st = (st * 9301 + 49297) % 233280;
          return st / 233280;
        };
        const out: ReactNode[] = [];
        for (let i = 0; i < n; i++) {
          const a = rnd() * Math.PI * 2;
          const rr = Math.sqrt(rnd());
          const x = cxm + Math.cos(a) * rx * rr;
          const y = cym + Math.sin(a) * ry * rr;
          const r = 4 + rnd() * 2;
          const s0 = rnd() * Math.PI * 2;
          out.push(
            <path key={i} d={`M${f(x + Math.cos(s0) * r)},${f(y + Math.sin(s0) * r)} A${f(r)},${f(r)} 0 1 1 ${f(x + Math.cos(s0 + 3.4) * r)},${f(y + Math.sin(s0 + 3.4) * r)}`} stroke={col} strokeWidth={1.6} fill="none" opacity={op} strokeLinecap="round" />,
          );
        }
        return out;
      };
      return {
        behind: (
          <g>
            <path d={scallop(back, 0.6)} fill={dark} />
            {marks(cx, top + H * 0.45, W * 0.55, H * 0.4, 10, 3, light, 0.25)}
          </g>
        ),
        front: (
          <g>
            <path d={scallop([...topArc, ...fringe], 0.62)} fill={base} />
            {marks(cx, top + H * 0.04, W * 0.38, H * 0.14, 9, 7, light, 0.3)}
            {marks(cx, top + H * 0.14, W * 0.36, H * 0.08, 5, 19, dark, 0.4)}
            {hl && marks(cx, top + H * 0.04, W * 0.36, H * 0.12, 8, 31, hl, 0.6)}
          </g>
        ),
      };
    }
    case 'afro': {
      const big = ellipsePts(cx, top + H * 0.3, W / 2 + 28, H * 0.58, -Math.PI * 0.5, Math.PI * 1.5, 26, 0.06, 2);
      return {
        behind: (
          <g>
            <path d={scallop(big, 0.6)} fill={base} />
            <path d={curlStrokes(cx, top + H * 0.2, W * 0.6, H * 0.4, 22, 8)} stroke={tex} strokeWidth={1.3} fill="none" opacity={0.5} />
          </g>
        ),
        front: <path d={scallop([...ellipsePts(cx, top + H * 0.22, W / 2 + 4, H * 0.3, Math.PI, Math.PI * 2, 10, 0.05, 1), [cx + F / 2 - 4, top + H * 0.24], [cx, top + H * 0.2], [cx - F / 2 + 4, top + H * 0.24]], 0.55)} fill={base} />,
      };
    }
    case 'wavyMedium':
      return {
        over: <path d={longCurtain(g, { bottom: g.chin + 12, spread: 10, wave: 3, innerGap: 12 })} fill={dark} />,
        front: (
          <g>
            <path d={capPath(g, { lift: 8, sideY: g.earY - 4, dip: 1 })} fill={base} />
            <path d={sweep(g, -1, 0.5)} fill={light} opacity={0.45} />
          </g>
        ),
      };
    case 'mullet':
      return {
        behind: (
          <path
            d={`M${f(cx - W / 2 - 4)},${f(g.earY - 6)} Q${f(cx - W / 2 - 10)},${f(g.chin + 6)} ${f(cx - W / 2 - 6)},${f(g.chin + 26)} L${f(cx + W / 2 + 6)},${f(g.chin + 26)} Q${f(cx + W / 2 + 10)},${f(g.chin + 6)} ${f(cx + W / 2 + 4)},${f(g.earY - 6)} Z`}
            fill={dark}
          />
        ),
        front: <path d={capPath(g, { lift: 7, sideY: g.earY - 6 })} fill={base} />,
      };
    case 'manBun':
      return {
        front: (
          <g>
            <path d={capPath(g, { lift: 4, hairY: g.hairline - 2, sideY: g.earY - 8 })} fill={base} />
            <circle cx={cx} cy={top - 9} r={11} fill={base} />
            <path d={`M${f(cx - 7)},${f(top - 12)} q7,-5 14,0`} stroke={light} strokeWidth={1.6} fill="none" opacity={0.6} />
            <rect x={cx - 6} y={top - 1} width={12} height={3} rx={1.5} fill={dark} />
          </g>
        ),
      };
    case 'rocker':
      return {
        over: <path d={longCurtain(g, { bottom: 200, spread: 9, innerGap: 9 })} fill={dark} />,
        front: <path d={capPath(g, { lift: 5, sideY: g.earY - 3, dip: 2 })} fill={base} />,
      };
    case 'longStraight':
    case 'longSide':
    case 'longWavy':
    case 'bangsLong':
    case 'halfUp': {
      const wave = s.hair === 'longWavy' ? 4 : 0;
      const sideFront =
        s.hair === 'bangsLong' ? (
          <path
            d={`${capPath(g, { lift: 5, hairY: top + H * 0.36, sideY: g.earY - 6, dip: -1 })}`}
            fill={base}
          />
        ) : (
          <path d={capPath(g, { lift: 5, hairY: g.hairline - 1, sideY: g.earY - 9, dip: s.hair === 'longSide' ? 0 : -2 })} fill={base} />
        );
      return {
        over: (
          <g>
            <path d={longCurtain(g, { bottom: 201, spread: 12, wave, innerGap: 8 })} fill={dark} />
            {hl && <path d={longCurtain(g, { bottom: 201, spread: 6, wave, innerGap: 2 })} fill={hl} opacity={0.35} />}
          </g>
        ),
        front: (
          <g>
            {sideFront}
            {s.hair === 'longStraight' && (
              <path d={`M${f(cx)},${f(top - 4)} L${f(cx)},${f(top + H * 0.17)}`} stroke={dark} strokeWidth={2} strokeLinecap="round" />
            )}
            {s.hair === 'longSide' && <path d={sweep(g, 1, 0.55)} fill={light} opacity={0.5} />}
            {s.hair === 'halfUp' && <circle cx={cx} cy={top - 5} r={7} fill={dark} />}
            {s.hair !== 'bangsLong' && (
              <path d={`M${f(cx - F * 0.12)},${f(top + 3)} Q${f(cx - F * 0.3)},${f(top + 6)} ${f(cx - F * 0.42)},${f(top + H * 0.18)}`} stroke={light} strokeWidth={1.8} fill="none" opacity={0.45} />
            )}
          </g>
        ),
      };
    }
    case 'longCurly': {
      const back = ellipsePts(cx, top + H * 0.7, W / 2 + 22, H * 0.95, -Math.PI * 0.5, Math.PI * 1.5, 22, 0.12, 5);
      return {
        behind: <path d={scallop(back, 0.6)} fill={dark} />,
        front: (
          <g>
            <path d={scallop([...ellipsePts(cx, top + H * 0.22, W / 2 + 9, H * 0.32, Math.PI, Math.PI * 2, 11, 0.08, 6), [cx + F / 2 - 2, top + H * 0.3], [cx, top + H * 0.2], [cx - F / 2 + 2, top + H * 0.3]], 0.58)} fill={base} />
            <path d={curlStrokes(cx, top + H * 0.08, W * 0.4, H * 0.14, 12, 8)} stroke={tex} strokeWidth={1.4} fill="none" opacity={0.6} />
          </g>
        ),
      };
    }
    case 'bob':
    case 'lob': {
      const bottom = s.hair === 'bob' ? g.chin + 2 : g.chin + 30;
      const side = (sgn: 1 | -1) =>
        smoothClosed([
          [cx + sgn * (F / 2 - 6), top + H * 0.2],
          [cx + sgn * (W / 2 + 8), top + H * 0.36],
          [cx + sgn * (W / 2 + 10), top + H * 0.7],
          [cx + sgn * (W / 2 + 12), bottom],
          [cx + sgn * (W / 2 - 4), bottom + 2],
          [cx + sgn * (W / 2 - 6), top + H * 0.6],
          [cx + sgn * (W / 2 - 8), top + H * 0.32],
        ]);
      return {
        over: <path d={longCurtain(g, { bottom: bottom + 1, spread: 11, innerGap: 14 })} fill={dark} />,
        front: (
          <g>
            <path d={capPath(g, { lift: 7, hairY: g.hairline, sideY: g.earY - 4, dip: 0 })} fill={base} />
            <path d={side(1)} fill={base} />
            <path d={side(-1)} fill={base} />
            <path d={sweep(g, 1, 0.45)} fill={light} opacity={0.4} />
          </g>
        ),
      };
    }
    case 'pixie':
      return {
        front: (
          <g>
            <path d={capPath(g, { lift: 7, sideY: g.earY - 8, dip: 2 })} fill={base} />
            <path d={sweep(g, -1, 0.75)} fill={base} />
            <path d={sweep(g, -1, 0.4)} fill={light} opacity={0.45} />
          </g>
        ),
      };
    case 'ponytail':
      return {
        behind: (
          <path
            d={smoothClosed([
              [cx + W * 0.3, top + 6],
              [cx + W / 2 + 18, top + H * 0.3],
              [cx + W / 2 + 22, g.chin + 10],
              [cx + W / 2 + 12, g.chin + 40],
              [cx + W / 2 + 4, g.chin + 4],
              [cx + W * 0.4, top + H * 0.3],
            ])}
            fill={dark}
          />
        ),
        front: (
          <g>
            <path d={capPath(g, { lift: 4, hairY: g.hairline - 3, sideY: g.earY - 9, dip: -2 })} fill={base} />
            <circle cx={cx + W * 0.4} cy={top + 8} r={4} fill={shade(base, 0.5)} />
          </g>
        ),
      };
    case 'highBun':
    case 'twoBuns':
    case 'lowBun':
    case 'bridal': {
      const buns =
        s.hair === 'highBun' ? (
          <circle cx={cx} cy={top - 12} r={15} fill={base} />
        ) : s.hair === 'twoBuns' ? (
          <g>
            <circle cx={cx - W * 0.34} cy={top - 2} r={12} fill={base} />
            <circle cx={cx + W * 0.34} cy={top - 2} r={12} fill={base} />
          </g>
        ) : s.hair === 'bridal' ? (
          <g>
            <ellipse cx={cx} cy={top - 6} rx={W * 0.42} ry={13} fill={base} />
            <path d={curlStrokes(cx, top - 6, W * 0.32, 8, 7, 3)} stroke={dark} strokeWidth={1.5} fill="none" />
          </g>
        ) : null;
      return {
        behind: s.hair === 'lowBun' ? <circle cx={cx + W * 0.45} cy={g.earY + 12} r={13} fill={dark} /> : undefined,
        front: (
          <g>
            {buns}
            <path d={capPath(g, { lift: 4, hairY: g.hairline - 3, sideY: g.earY - 8, dip: -2 })} fill={base} />
            <path d={`M${f(cx)},${f(top - 3)} L${f(cx)},${f(top + H * 0.15)}`} stroke={dark} strokeWidth={1.6} opacity={s.hair === 'bridal' ? 0 : 0.8} />
            {s.hair === 'bridal' && (
              <path d={`M${f(cx - W / 2 + 3)},${f(g.earY - 4)} q-4,14 2,26 M${f(cx + W / 2 - 3)},${f(g.earY - 4)} q4,14 -2,26`} stroke={base} strokeWidth={2.4} fill="none" strokeLinecap="round" />
            )}
          </g>
        ),
      };
    }
    case 'braid': {
      const beads: ReactNode[] = [];
      for (let i = 0; i < 7; i++) {
        const y = g.earY + 4 + i * 11;
        beads.push(<ellipse key={i} cx={cx - W / 2 - 4 + (i % 2 ? 2 : -2)} cy={y} rx={8 - i * 0.4} ry={7} fill={i % 2 ? base : dark} />);
      }
      return {
        over: <g>{beads}</g>,
        front: <path d={capPath(g, { lift: 4, hairY: g.hairline - 3, sideY: g.earY - 7, dip: -2 })} fill={base} />,
      };
    }
    case 'granny': {
      const arc = ellipsePts(cx, top + H * 0.3, W / 2 + 12, H * 0.42, Math.PI * 0.86, Math.PI * 2.14, 14, 0.06, 4);
      const fr: Pt[] = [
        [cx + W / 2 - 2, g.earY - 4],
        [cx + F * 0.3, top + H * 0.22],
        [cx, top + H * 0.2],
        [cx - F * 0.3, top + H * 0.22],
        [cx - W / 2 + 2, g.earY - 4],
      ];
      return {
        front: (
          <g>
            <path d={scallop([...arc, ...fr], 0.6)} fill={base} />
            <path d={curlStrokes(cx, top + H * 0.1, W * 0.45, H * 0.2, 16, 6)} stroke={dark} strokeWidth={1.3} fill="none" opacity={0.55} />
          </g>
        ),
      };
    }
    case 'fallera': {
      const pin = shade('#d4af37', -0.1);
      const rodete = (sgn: 1 | -1) => {
        const x = cx + sgn * (W / 2 + 5);
        const y = g.earY - 1;
        return (
          <g key={sgn}>
            <circle cx={x} cy={y} r={13.5} fill={base} />
            <path d={`M${x},${y} m-9,0 a9,9 0 1,1 18,0 a7,7 0 1,1 -14,0 a5,5 0 1,1 10,0 a3,3 0 1,1 -6,0`} stroke={dark} strokeWidth={1.6} fill="none" />
            <path d={`M${x - sgn * 4},${y - 15} l${sgn * 10},30`} stroke={pin} strokeWidth={2} strokeLinecap="round" />
            <circle cx={x - sgn * 4} cy={y - 15} r={2.6} fill={pin} />
            <circle cx={x + sgn * 6} cy={y + 15} r={2.6} fill={pin} />
          </g>
        );
      };
      return {
        behind: <ellipse cx={cx} cy={top + H * 0.3} rx={W / 2 + 4} ry={H * 0.38} fill={dark} />,
        front: (
          <g>
            <path d={capPath(g, { lift: 3, hairY: g.hairline - 3, sideY: g.earY - 6, dip: -3 })} fill={base} />
            <path d={`M${f(cx)},${f(top - 2)} L${f(cx)},${f(top + H * 0.16)}`} stroke={dark} strokeWidth={1.8} />
            {rodete(-1)}
            {rodete(1)}
          </g>
        ),
      };
    }
    default:
      return { front: <path d={capPath(g, { lift: 6 })} fill={base} /> };
  }
}

export { ellipsePath };
