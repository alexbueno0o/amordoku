/**
 * Dibujo del plano (escena del crimen): suelos, rejilla, objetos, paredes,
 * ventanas/puertas y etiquetas de las divisiones. Se usa en el libro, en la
 * portada, en las soluciones (con fichas) y en el editor de escenarios.
 */
import { useId, type ReactNode } from 'react';
import { floorDef } from '../assets/floors';
import { OBJECT_RENDERERS } from '../assets/objects';
import { OUT } from '../assets/objects/common';
import { objectType } from '../catalog/objectTypes';
import type { EdgeFeature, ObjectInstance } from '../engine/types';
import type { Scenario } from '../domain/types';

export const CELL = 100;

export interface BoardViewProps {
  scenario: Scenario;
  /** Ancho CSS del SVG. */
  width?: number | string;
  showLabels?: boolean;
  showObjects?: boolean;
  /** Elementos extra dentro de la cuadrícula (fichas, marcas...), en unidades de celda (100). */
  overlay?: ReactNode;
  /** Etiquetas F1..Fn / C1..Cn alrededor (soluciones). */
  coords?: boolean;
  /** Margen alrededor (para ventanas y etiquetas que sobresalen). */
  pad?: number;
  className?: string;
  /** Grosor de paredes. */
  wall?: number;
  /** Escala de letra de las etiquetas. */
  labelScale?: number;
}

/** Segmentos de pared: bordes entre divisiones distintas o con el exterior. */
export function wallSegments(s: Scenario): { x1: number; y1: number; x2: number; y2: number; outer: boolean }[] {
  const { rows, cols, cells } = s.board;
  const at = (r: number, c: number) => (r < 0 || c < 0 || r >= rows || c >= cols ? null : cells[r * cols + c]);
  const segs: { x1: number; y1: number; x2: number; y2: number; outer: boolean }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const me = at(r, c);
      if (!me) continue;
      const x = c * CELL;
      const y = r * CELL;
      const check = (n: ReturnType<typeof at>) => (!n ? 'outer' : n.room !== me.room ? 'inner' : null);
      // Solo arriba e izquierda (y derecha/abajo si es exterior) para no duplicar.
      const top = check(at(r - 1, c));
      if (top) segs.push({ x1: x, y1: y, x2: x + CELL, y2: y, outer: top === 'outer' });
      const left = check(at(r, c - 1));
      if (left) segs.push({ x1: x, y1: y, x2: x, y2: y + CELL, outer: left === 'outer' });
      if (!at(r + 1, c)) segs.push({ x1: x, y1: y + CELL, x2: x + CELL, y2: y + CELL, outer: true });
      if (!at(r, c + 1)) segs.push({ x1: x + CELL, y1: y, x2: x + CELL, y2: y + CELL, outer: true });
    }
  }
  return segs;
}

/** Une segmentos colineales contiguos para que las paredes queden limpias. */
function mergeSegments<T extends { x1: number; y1: number; x2: number; y2: number }>(segs: T[]): T[] {
  const horiz = segs.filter((s) => s.y1 === s.y2).sort((a, b) => a.y1 - b.y1 || a.x1 - b.x1);
  const vert = segs.filter((s) => s.x1 === s.x2).sort((a, b) => a.x1 - b.x1 || a.y1 - b.y1);
  const out: T[] = [];
  for (const list of [horiz, vert]) {
    let cur: T | null = null;
    for (const s of list) {
      if (cur && cur.x2 === s.x1 && cur.y2 === s.y1 && (cur.y1 === cur.y2 ? s.y1 === s.y2 : s.x1 === s.x2)) {
        cur = Object.assign({}, cur, { x2: s.x2, y2: s.y2 });
      } else {
        if (cur) out.push(cur);
        cur = Object.assign({}, s);
      }
    }
    if (cur) out.push(cur);
  }
  return out;
}

function edgeGeometry(e: EdgeFeature) {
  const x = e.c * CELL;
  const y = e.r * CELL;
  switch (e.side) {
    case 'top':
      return { cx: x + CELL / 2, cy: y, horizontal: true };
    case 'bottom':
      return { cx: x + CELL / 2, cy: y + CELL, horizontal: true };
    case 'left':
      return { cx: x, cy: y + CELL / 2, horizontal: false };
    case 'right':
      return { cx: x + CELL, cy: y + CELL / 2, horizontal: false };
  }
}

export function EdgeGlyph({ e }: { e: EdgeFeature }) {
  const { cx, cy, horizontal } = edgeGeometry(e);
  const L = 74;
  const T = 22;
  const w = horizontal ? L : T;
  const h = horizontal ? T : L;
  if (e.type === 'door') {
    return (
      <g>
        <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={6} fill="#b07a45" stroke={OUT} strokeWidth={3} />
        <rect x={cx - w / 2 + (horizontal ? 8 : 6)} y={cy - h / 2 + (horizontal ? 6 : 8)} width={w - (horizontal ? 16 : 12)} height={h - (horizontal ? 12 : 16)} rx={4} fill="#8a5a2e" />
      </g>
    );
  }
  return (
    <g>
      <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={8} fill="#dfe7ec" stroke={OUT} strokeWidth={3} />
      <rect x={cx - w / 2 + (horizontal ? 9 : 6)} y={cy - h / 2 + (horizontal ? 6 : 9)} width={w - (horizontal ? 18 : 12)} height={h - (horizontal ? 12 : 18)} rx={5} fill="#ffffff" stroke={OUT} strokeWidth={1.8} />
    </g>
  );
}

export function ObjectGlyph({ o, uid }: { o: ObjectInstance; uid: string }) {
  const render = OBJECT_RENDERERS[o.type];
  const def = objectType(o.type);
  if (!render) return null;
  const rot = o.rot ?? 0;
  const swap = rot === 90 || rot === 270;
  // Dimensiones canónicas (antes de girar)
  const cw = swap ? o.h : o.w;
  const ch = swap ? o.w : o.h;
  const W = cw * CELL;
  const H = ch * CELL;
  const x = o.c * CELL;
  const y = o.r * CELL;
  const bw = o.w * CELL;
  const bh = o.h * CELL;
  const transform = rot ? `translate(${x + bw / 2} ${y + bh / 2}) rotate(${rot}) translate(${-W / 2} ${-H / 2})` : `translate(${x} ${y})`;
  return (
    <g transform={transform}>
      {render({ w: cw, h: ch, W, H, color: o.color ?? def?.color ?? '#cccccc', variant: o.variant ?? def?.variants?.[0], label: o.label, uid: `${uid}-${o.id}` })}
    </g>
  );
}

/** Píldora blanca con borde negro y texto en mayúsculas (etiqueta de división). */
export function RoomPill({ x, y, text, scale = 1 }: { x: number; y: number; text: string; scale?: number }) {
  const lines = text.toUpperCase().split('\n');
  const fs = 26 * scale;
  const widest = Math.max(...lines.map((l) => l.length));
  const w = widest * fs * 0.47 + 26 * scale;
  const h = lines.length * fs * 1.02 + 12 * scale;
  return (
    <g>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h / 2 > 24 ? 22 : h / 2} fill="#ffffff" stroke="#16141a" strokeWidth={3.2 * scale} />
      {lines.map((l, i) => (
        <text
          key={i}
          x={x}
          y={y - h / 2 + 6 * scale + fs * (i + 0.84)}
          textAnchor="middle"
          fontFamily="Oswald, 'Roboto Condensed', sans-serif"
          fontWeight={500}
          fontSize={fs}
          fill="#16141a"
        >
          {l}
        </text>
      ))}
    </g>
  );
}

/** Posición por defecto de la etiqueta: fila inferior de la división, centrada. */
export function defaultLabelPos(s: Scenario, roomId: string): { x: number; y: number } {
  const { rows, cols, cells } = s.board;
  let maxR = -1;
  const colsAtMax: number[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (cells[r * cols + c]?.room !== roomId) continue;
      if (r > maxR) {
        maxR = r;
        colsAtMax.length = 0;
      }
      if (r === maxR) colsAtMax.push(c);
    }
  if (maxR < 0) return { x: 0, y: 0 };
  const cMid = (Math.min(...colsAtMax) + Math.max(...colsAtMax) + 1) / 2;
  return { x: cMid * CELL, y: (maxR + 1) * CELL - 26 };
}

export function BoardView({
  scenario,
  width = '100%',
  showLabels = true,
  showObjects = true,
  overlay,
  coords = false,
  pad = 26,
  className,
  wall = 9,
  labelScale = 1,
}: BoardViewProps) {
  const rid = useId();
  const uid = `bv${rid.replace(/[^a-zA-Z0-9]/g, '')}`;
  const { rows, cols, cells, objects, edges, rooms } = scenario.board;
  const W = cols * CELL;
  const H = rows * CELL;
  const coordPad = coords ? 50 : 0;
  const floorsUsed = new Set(cells.filter(Boolean).map((c) => c!.floor));
  const segs = mergeSegments(wallSegments(scenario));
  const flat = objects.filter((o) => objectType(o.type)?.flat);
  const solid = objects.filter((o) => !objectType(o.type)?.flat).sort((a, b) => a.r - b.r || a.c - b.c);

  return (
    <svg
      className={className}
      width={width}
      viewBox={`${-pad - coordPad} ${-pad} ${W + 2 * pad + coordPad} ${H + 2 * pad + coordPad}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <defs>
        {[...floorsUsed].map((key) => {
          const st = scenario.floors[key] ?? { pattern: key, colors: floorDef(key).colors };
          const def = floorDef(st.pattern);
          return (
            <pattern key={key} id={`${uid}-fl-${key}`} width={CELL} height={CELL} patternUnits="userSpaceOnUse">
              {def.render(st.colors[0], st.colors[1])}
            </pattern>
          );
        })}
      </defs>
      {/* suelos: un solo trazado por tipo de suelo (el PDF queda mucho más ligero) */}
      {[...floorsUsed].map((key) => {
        let d = '';
        cells.forEach((cell, i) => {
          if (cell?.floor === key) d += `M${(i % cols) * CELL},${Math.floor(i / cols) * CELL}h${CELL}v${CELL}h${-CELL}Z`;
        });
        return <path key={key} d={d} fill={`url(#${uid}-fl-${key})`} />;
      })}
      {/* rejilla fina */}
      <path
        d={cells.map((cell, i) => (cell ? `M${(i % cols) * CELL},${Math.floor(i / cols) * CELL}h${CELL}v${CELL}h${-CELL}Z` : '')).join('')}
        fill="none"
        stroke="#1b1a20"
        strokeWidth={1.6}
        opacity={0.85}
      />
      {showObjects && flat.map((o) => <ObjectGlyph key={o.id} o={o} uid={uid} />)}
      {showObjects && solid.map((o) => <ObjectGlyph key={o.id} o={o} uid={uid} />)}
      {/* paredes */}
      <g stroke="#0d0c10" strokeLinecap="square">
        {segs.map((s, i) => (
          <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} strokeWidth={s.outer ? wall * 1.25 : wall} />
        ))}
      </g>
      {edges.map((e) => (
        <EdgeGlyph key={e.id} e={e} />
      ))}
      {showLabels &&
        rooms.map((room) => {
          const lab = scenario.labels?.[room.id];
          if (lab?.hidden) return null;
          const pos = lab
            ? { x: (lab.c + 0.5) * CELL, y: lab.r * CELL + (lab.anchor === 'top' ? 24 : lab.anchor === 'center' ? CELL / 2 : CELL - 26) }
            : defaultLabelPos(scenario, room.id);
          // Que la píldora no se salga del tablero.
          const fs = 26 * labelScale;
          const pw = Math.max(...room.name.toUpperCase().split('\n').map((l) => l.length)) * fs * 0.47 + 26 * labelScale;
          const maxX = scenario.board.cols * CELL - pw / 2 - 4;
          const x = Math.min(Math.max(pos.x, pw / 2 + 4), maxX);
          return <RoomPill key={room.id} x={x} y={pos.y} text={room.name} scale={labelScale} />;
        })}
      {overlay}
      {coords && (
        <g fontFamily="Crimson Pro, Georgia, serif" fontSize={30} fill="#333">
          {[...Array(rows)].map((_, r) => (
            <text key={`r${r}`} x={-pad - 8} y={r * CELL + CELL / 2 + 10} textAnchor="end">
              F{r + 1}
            </text>
          ))}
          {[...Array(cols)].map((_, c) => (
            <text key={`c${c}`} x={c * CELL + CELL / 2} y={H + pad + 34} textAnchor="middle">
              C{c + 1}
            </text>
          ))}
        </g>
      )}
    </svg>
  );
}

/** Plantilla de borrador: la misma forma, sin dibujos, para tachar a lápiz. */
export function ScratchGrid({ scenario, width = '100%' }: { scenario: Scenario; width?: number | string }) {
  const { rows, cols, cells } = scenario.board;
  const W = cols * CELL;
  const H = rows * CELL;
  const segs = mergeSegments(wallSegments(scenario));
  return (
    <svg width={width} viewBox={`-12 -12 ${W + 24} ${H + 24}`} xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      {cells.map((cell, i) =>
        cell ? <rect key={i} x={(i % cols) * CELL} y={Math.floor(i / cols) * CELL} width={CELL} height={CELL} fill="#ffffff" stroke="#b9b6bf" strokeWidth={3} /> : null,
      )}
      <g stroke="#55525c" strokeLinecap="square">
        {segs.map((s, i) => (
          <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} strokeWidth={s.outer ? 9 : 7} />
        ))}
      </g>
    </svg>
  );
}
