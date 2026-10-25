/**
 * Suelos: cada uno es un patrón SVG de 100×100 (una celda) con dos colores
 * personalizables. Algunos admiten pistas ("Estaba en la arena").
 */
import type { ReactNode } from 'react';
import { mix, shade } from './color';

export interface FloorDef {
  id: string;
  label: string;
  /** Colores por defecto [principal, secundario]. */
  colors: [string, string];
  /** Frase para pistas "onFloor" (si tiene sentido). */
  phrase?: string;
  render: (c1: string, c2: string) => ReactNode;
}

const planks = (c1: string, c2: string, vertical: boolean, n = 3) => {
  const line = shade(c1, 0.12);
  const w = 100 / n;
  const els: ReactNode[] = [<rect key="bg" width={100} height={100} fill={c1} />];
  for (let i = 0; i < n; i++) {
    const pos = i * w;
    const jo = [28, 72, 50][i % 3];
    if (vertical) {
      els.push(<line key={`l${i}`} x1={pos} y1={0} x2={pos} y2={100} stroke={line} strokeWidth={1.4} />);
      els.push(<line key={`j${i}`} x1={pos} y1={jo} x2={pos + w} y2={jo} stroke={line} strokeWidth={1.4} />);
      els.push(<rect key={`h${i}`} x={pos + 3} y={jo + 6} width={w - 6} height={2} fill={c2} opacity={0.35} />);
    } else {
      els.push(<line key={`l${i}`} x1={0} y1={pos} x2={100} y2={pos} stroke={line} strokeWidth={1.4} />);
      els.push(<line key={`j${i}`} x1={jo} y1={pos} x2={jo} y2={pos + w} stroke={line} strokeWidth={1.4} />);
      els.push(<rect key={`h${i}`} x={jo + 6} y={pos + 3} width={2} height={w - 6} fill={c2} opacity={0.35} />);
    }
  }
  return <g>{els}</g>;
};

export const FLOORS: FloorDef[] = [
  { id: 'wood', label: 'Madera', colors: ['#f2d9b8', '#e7c79f'], render: (a, b) => planks(a, b, true) },
  { id: 'woodH', label: 'Madera horizontal', colors: ['#f2d9b8', '#e7c79f'], render: (a, b) => planks(a, b, false) },
  { id: 'parquet', label: 'Parquet', colors: ['#d9b48a', '#c99c6c'], render: (a, b) => planks(a, b, true, 4) },
  { id: 'darkWood', label: 'Madera oscura', colors: ['#6e4b35', '#5b3c2a'], render: (a, b) => planks(a, b, true) },
  {
    id: 'tiles',
    label: 'Baldosa a cuadros',
    colors: ['#cfe8ea', '#b6dcdf'],
    render: (a, b) => (
      <g>
        <rect width={100} height={100} fill={a} />
        <rect width={50} height={50} fill={b} />
        <rect x={50} y={50} width={50} height={50} fill={b} />
      </g>
    ),
  },
  {
    id: 'bigTiles',
    label: 'Baldosa grande',
    colors: ['#eceae4', '#d8d4ca'],
    render: (a, b) => (
      <g>
        <rect width={100} height={100} fill={a} />
        <rect x={1} y={1} width={98} height={98} fill="none" stroke={b} strokeWidth={2} />
      </g>
    ),
  },
  {
    id: 'diamond',
    label: 'Rombos',
    colors: ['#c3e3e1', '#a9cbd6'],
    render: (a, b) => (
      <g>
        <rect width={100} height={100} fill={a} />
        <path d="M50,0 L100,50 L50,100 L0,50 Z" fill={b} />
      </g>
    ),
  },
  {
    id: 'checker',
    label: 'Ajedrez',
    colors: ['#f4f1ea', '#2b2b2b'],
    render: (a, b) => (
      <g>
        <rect width={100} height={100} fill={a} />
        <rect width={25} height={25} fill={b} />
        <rect x={50} width={25} height={25} fill={b} />
        <rect x={25} y={25} width={25} height={25} fill={b} />
        <rect x={75} y={25} width={25} height={25} fill={b} />
        <rect y={50} width={25} height={25} fill={b} />
        <rect x={50} y={50} width={25} height={25} fill={b} />
        <rect x={25} y={75} width={25} height={25} fill={b} />
        <rect x={75} y={75} width={25} height={25} fill={b} />
      </g>
    ),
  },
  {
    id: 'hydraulic',
    label: 'Baldosa hidráulica',
    colors: ['#f1e6d2', '#c96f4a'],
    render: (a, b) => (
      <g>
        <rect width={100} height={100} fill={a} />
        <circle cx={50} cy={50} r={18} fill="none" stroke={b} strokeWidth={5} />
        <path d="M50,0 Q60,25 50,32 Q40,25 50,0 M50,100 Q60,75 50,68 Q40,75 50,100 M0,50 Q25,60 32,50 Q25,40 0,50 M100,50 Q75,60 68,50 Q75,40 100,50" fill={b} />
        <circle cx={0} cy={0} r={10} fill={mix(b, '#2f5d8a', 0.6)} />
        <circle cx={100} cy={0} r={10} fill={mix(b, '#2f5d8a', 0.6)} />
        <circle cx={0} cy={100} r={10} fill={mix(b, '#2f5d8a', 0.6)} />
        <circle cx={100} cy={100} r={10} fill={mix(b, '#2f5d8a', 0.6)} />
      </g>
    ),
  },
  {
    id: 'marble',
    label: 'Mármol',
    colors: ['#f4f2ee', '#d9d5cf'],
    render: (a, b) => (
      <g>
        <rect width={100} height={100} fill={a} />
        <path d="M0,30 Q30,20 50,45 T100,60" stroke={b} strokeWidth={1.5} fill="none" />
        <path d="M20,100 Q40,70 70,80 T100,90" stroke={b} strokeWidth={1} fill="none" />
        <rect x={0.5} y={0.5} width={99} height={99} fill="none" stroke={b} strokeWidth={1} />
      </g>
    ),
  },
  {
    id: 'terracotta',
    label: 'Barro cocido',
    colors: ['#e5a07c', '#cf875f'],
    render: (a, b) => (
      <g>
        <rect width={100} height={100} fill={a} />
        <path d="M0,50 L100,50 M50,0 L50,100" stroke={b} strokeWidth={3} />
      </g>
    ),
  },
  {
    id: 'carpetFloor',
    label: 'Moqueta',
    colors: ['#d8cfe8', '#c9bedd'],
    render: (a, b) => (
      <g>
        <rect width={100} height={100} fill={a} />
        {[15, 45, 75].map((x) => [15, 45, 75].map((y) => <circle key={`${x}-${y}`} cx={x + (y % 2) * 15} cy={y} r={1.6} fill={b} />))}
      </g>
    ),
  },
  {
    id: 'mosaic',
    label: 'Gresite',
    colors: ['#a8dbe8', '#8ccbe0'],
    render: (a, b) => (
      <g>
        <rect width={100} height={100} fill={a} />
        {[...Array(25)].map((_, i) => (
          <rect key={i} x={(i % 5) * 20 + 1.5} y={Math.floor(i / 5) * 20 + 1.5} width={17} height={17} fill={i % 3 ? a : b} stroke={shade(a, 0.08)} strokeWidth={1} />
        ))}
      </g>
    ),
  },
  {
    id: 'grass',
    label: 'Césped',
    colors: ['#a8d58b', '#8cc26e'],
    phrase: 'en el césped',
    render: (a, b) => (
      <g>
        <rect width={100} height={100} fill={a} />
        {[
          [14, 22],
          [60, 14],
          [38, 52],
          [80, 46],
          [22, 80],
          [68, 82],
        ].map(([x, y], i) => (
          <path key={i} d={`M${x},${y} l3,-8 l3,8 m-3,0 l6,-6`} stroke={b} strokeWidth={2.2} fill="none" strokeLinecap="round" />
        ))}
      </g>
    ),
  },
  {
    id: 'sand',
    label: 'Arena',
    colors: ['#f6e3b4', '#e8cf95'],
    phrase: 'en la arena',
    render: (a, b) => (
      <g>
        <rect width={100} height={100} fill={a} />
        {[...Array(18)].map((_, i) => (
          <circle key={i} cx={(i * 37) % 100} cy={(i * 61) % 100} r={1.4 + (i % 3) * 0.5} fill={b} />
        ))}
        <path d="M5,70 q15,-6 30,0 M55,30 q15,-6 30,0" stroke={b} strokeWidth={1.5} fill="none" />
      </g>
    ),
  },
  {
    id: 'water',
    label: 'Agua (mar)',
    colors: ['#7ec8e3', '#a9dcef'],
    phrase: 'en el agua',
    render: (a, b) => (
      <g>
        <rect width={100} height={100} fill={a} />
        <path d="M8,25 q10,-7 20,0 t20,0 M52,62 q10,-7 20,0 t20,0 M10,85 q8,-5 16,0" stroke={b} strokeWidth={3} fill="none" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'deepWater',
    label: 'Agua profunda',
    colors: ['#3f8fbf', '#5fa9d3'],
    phrase: 'en el agua',
    render: (a, b) => (
      <g>
        <rect width={100} height={100} fill={a} />
        <path d="M8,30 q10,-7 20,0 t20,0 M50,70 q10,-7 20,0 t20,0" stroke={b} strokeWidth={3} fill="none" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'pool',
    label: 'Piscina',
    colors: ['#8fdcef', '#c4eef8'],
    phrase: 'dentro del agua',
    render: (a, b) => (
      <g>
        <rect width={100} height={100} fill={a} />
        <path d="M0,0 L100,0 M0,50 L100,50 M0,0 L0,100 M50,0 L50,100" stroke={shade(a, 0.08)} strokeWidth={1} />
        <path d="M10,30 q12,-10 24,0 t24,0 M40,78 q12,-10 24,0" stroke={b} strokeWidth={2.6} fill="none" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'cobble',
    label: 'Adoquines',
    colors: ['#cfc6b8', '#b3a998'],
    render: (a, b) => (
      <g>
        <rect width={100} height={100} fill={b} />
        {[0, 1, 2, 3].map((r) =>
          [0, 1, 2, 3].map((c) => <rect key={`${r}-${c}`} x={c * 25 + (r % 2) * 12 - 6} y={r * 25 + 2} width={22} height={21} rx={5} fill={a} />),
        )}
      </g>
    ),
  },
  {
    id: 'asphalt',
    label: 'Asfalto',
    colors: ['#5d6066', '#6f7379'],
    render: (a, b) => (
      <g>
        <rect width={100} height={100} fill={a} />
        {[...Array(14)].map((_, i) => (
          <circle key={i} cx={(i * 43) % 100} cy={(i * 71) % 100} r={1.2} fill={b} />
        ))}
      </g>
    ),
  },
  {
    id: 'roadLine',
    label: 'Asfalto con línea',
    colors: ['#5d6066', '#f4f4f4'],
    render: (a, b) => (
      <g>
        <rect width={100} height={100} fill={a} />
        <rect x={48} y={10} width={4} height={36} fill={b} />
        <rect x={48} y={60} width={4} height={30} fill={b} />
      </g>
    ),
  },
  {
    id: 'concrete',
    label: 'Hormigón',
    colors: ['#c9c9c4', '#b5b5af'],
    render: (a, b) => (
      <g>
        <rect width={100} height={100} fill={a} />
        <path d="M0,0 L100,0 L100,100" stroke={b} strokeWidth={2} fill="none" />
        <path d="M20,40 l12,8 l6,-4" stroke={b} strokeWidth={1.2} fill="none" />
      </g>
    ),
  },
  {
    id: 'dirt',
    label: 'Tierra',
    colors: ['#d9b98b', '#c19c6b'],
    phrase: 'en el camino de tierra',
    render: (a, b) => (
      <g>
        <rect width={100} height={100} fill={a} />
        {[...Array(10)].map((_, i) => (
          <ellipse key={i} cx={(i * 29) % 100} cy={(i * 53) % 100} rx={3} ry={2} fill={b} />
        ))}
      </g>
    ),
  },
  {
    id: 'rockFloor',
    label: 'Roca',
    colors: ['#b8b0a5', '#9e968a'],
    render: (a, b) => (
      <g>
        <rect width={100} height={100} fill={a} />
        <path d="M0,40 L30,30 L45,55 L80,42 L100,50 M20,100 L35,70 L60,78 L72,100" stroke={b} strokeWidth={2} fill="none" />
      </g>
    ),
  },
  {
    id: 'deck',
    label: 'Tarima exterior',
    colors: ['#c69c72', '#b08660'],
    render: (a, b) => planks(a, b, false, 4),
  },
  {
    id: 'brick',
    label: 'Ladrillo',
    colors: ['#c87a5a', '#e3d6c6'],
    render: (a, b) => (
      <g>
        <rect width={100} height={100} fill={b} />
        {[0, 1, 2, 3, 4].map((r) =>
          [0, 1, 2].map((c) => <rect key={`${r}-${c}`} x={c * 40 + (r % 2) * 20 - 20} y={r * 20 + 1} width={38} height={18} fill={a} />),
        )}
      </g>
    ),
  },
  {
    id: 'metal',
    label: 'Chapa industrial',
    colors: ['#9aa0a6', '#7d838a'],
    render: (a, b) => (
      <g>
        <rect width={100} height={100} fill={a} />
        {[...Array(16)].map((_, i) => (
          <rect key={i} x={(i % 4) * 25 + 6} y={Math.floor(i / 4) * 25 + 10} width={12} height={4} rx={2} fill={b} transform={`rotate(${i % 2 ? 45 : -45} ${(i % 4) * 25 + 12} ${Math.floor(i / 4) * 25 + 12})`} />
        ))}
      </g>
    ),
  },
  {
    id: 'dark',
    label: 'Oscuro elegante',
    colors: ['#2e2a33', '#3a3540'],
    render: (a, b) => (
      <g>
        <rect width={100} height={100} fill={a} />
        <rect x={2} y={2} width={96} height={96} fill="none" stroke={b} strokeWidth={2} />
      </g>
    ),
  },
  {
    id: 'dance',
    label: 'Pista de baile',
    colors: ['#b48be0', '#f08bd0'],
    render: (a, b) => (
      <g>
        <rect width={100} height={100} fill={a} />
        <rect x={2} y={2} width={46} height={46} fill={b} opacity={0.75} />
        <rect x={52} y={52} width={46} height={46} fill={b} opacity={0.75} />
        <rect x={52} y={2} width={46} height={46} fill={shade(a, -0.3)} opacity={0.6} />
        <rect x={2} y={52} width={46} height={46} fill={shade(a, -0.3)} opacity={0.6} />
      </g>
    ),
  },
  {
    id: 'redLight',
    label: 'Luz roja',
    colors: ['#6b1d22', '#8f262d'],
    render: (a, b) => (
      <g>
        <rect width={100} height={100} fill={a} />
        <circle cx={50} cy={50} r={36} fill={b} opacity={0.6} />
        <circle cx={50} cy={50} r={18} fill={shade(b, -0.2)} opacity={0.5} />
      </g>
    ),
  },
  {
    id: 'stageFloor',
    label: 'Escenario',
    colors: ['#3b3b44', '#4a4a55'],
    render: (a, b) => planks(a, b, false, 3),
  },
  {
    id: 'flowers',
    label: 'Alfombra de flores',
    colors: ['#f8c9d8', '#ffffff'],
    render: (a, b) => (
      <g>
        <rect width={100} height={100} fill={a} />
        {[...Array(12)].map((_, i) => (
          <circle key={i} cx={(i * 37) % 100} cy={(i * 59) % 100} r={6} fill={i % 2 ? b : shade(a, 0.15)} />
        ))}
      </g>
    ),
  },
  {
    id: 'plain',
    label: 'Liso',
    colors: ['#f1ece2', '#e2dccf'],
    render: (a) => <rect width={100} height={100} fill={a} />,
  },
];

const BY_ID = new Map(FLOORS.map((f) => [f.id, f]));
export const floorDef = (id: string) => BY_ID.get(id) ?? FLOORS[0];
/** Frases de suelo para el motor (pistas "onFloor"). */
export const floorPhrase = (id: string) => floorDef(id).phrase;
