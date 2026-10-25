/**
 * Cuadrícula pequeña para diagramas (instrucciones, consejos y glosario).
 */
export type MiniMark = 'x' | 'check' | 'xgreen' | 'dot' | { letter: string; circle?: 'green' | 'red' | 'plain' };

export interface MiniGridProps {
  rows: number;
  cols: number;
  /** División de cada celda (para pintar paredes). null = fuera. */
  rooms?: (string | null)[];
  marks?: Record<number, MiniMark>;
  /** Celdas sombreadas en verde. */
  shaded?: number[];
  /** Ventana: celda y lado. */
  window?: { cell: number; side: 'top' | 'bottom' | 'left' | 'right' };
  width: string;
}

export function MiniGrid({ rows, cols, rooms, marks = {}, shaded = [], window: win, width }: MiniGridProps) {
  const S = 30;
  const W = cols * S;
  const H = rows * S;
  const room = (r: number, c: number) => (r < 0 || c < 0 || r >= rows || c >= cols ? null : rooms ? rooms[r * cols + c] : 'a');
  const walls: string[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const me = room(r, c);
      if (me === null) continue;
      const x = c * S;
      const y = r * S;
      if (room(r - 1, c) !== me) walls.push(`M${x},${y} L${x + S},${y}`);
      if (room(r + 1, c) !== me) walls.push(`M${x},${y + S} L${x + S},${y + S}`);
      if (room(r, c - 1) !== me) walls.push(`M${x},${y} L${x},${y + S}`);
      if (room(r, c + 1) !== me) walls.push(`M${x + S},${y} L${x + S},${y + S}`);
    }
  return (
    <svg viewBox={`-3 -3 ${W + 6} ${H + 6}`} style={{ width, display: 'block' }}>
      {[...Array(rows * cols)].map((_, i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        if (room(r, c) === null) return null;
        return <rect key={i} x={c * S} y={r * S} width={S} height={S} fill={shaded.includes(i) ? '#b9e4a6' : '#ffffff'} stroke="#3a3a3a" strokeWidth={0.8} />;
      })}
      <path d={walls.join(' ')} stroke="#111" strokeWidth={3} strokeLinecap="square" />
      {win && (() => {
        const r = Math.floor(win.cell / cols);
        const c = win.cell % cols;
        const horiz = win.side === 'top' || win.side === 'bottom';
        const cx = c * S + (win.side === 'right' ? S : win.side === 'left' ? 0 : S / 2);
        const cy = r * S + (win.side === 'bottom' ? S : win.side === 'top' ? 0 : S / 2);
        return <rect x={cx - (horiz ? 10 : 3)} y={cy - (horiz ? 3 : 10)} width={horiz ? 20 : 6} height={horiz ? 6 : 20} rx={2} fill="#f2e7a6" stroke="#333" strokeWidth={1} />;
      })()}
      {Object.entries(marks).map(([k, m]) => {
        const i = +k;
        const x = (i % cols) * S + S / 2;
        const y = Math.floor(i / cols) * S + S / 2;
        if (m === 'x' || m === 'xgreen')
          return (
            <g key={k} stroke={m === 'x' ? '#2f6db5' : '#2e8b3e'} strokeWidth={3.4} strokeLinecap="round">
              <path d={`M${x - 7},${y - 7} L${x + 7},${y + 7} M${x + 7},${y - 7} L${x - 7},${y + 7}`} />
            </g>
          );
        if (m === 'check') return <path key={k} d={`M${x - 8},${y} L${x - 2},${y + 7} L${x + 9},${y - 8}`} stroke="#2e8b3e" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
        if (m === 'dot') return <circle key={k} cx={x} cy={y} r={6} fill="#f2d33c" stroke="#333" strokeWidth={1} />;
        return (
          <g key={k}>
            {m.circle && <circle cx={x} cy={y} r={11} fill="#ffffff" stroke={m.circle === 'green' ? '#2e8b3e' : m.circle === 'red' ? '#c8323c' : '#333'} strokeWidth={2.4} />}
            <text x={x} y={y + 6} textAnchor="middle" fontFamily="Roboto Slab, serif" fontWeight={700} fontSize={17} fill="#16141a">
              {m.letter}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
