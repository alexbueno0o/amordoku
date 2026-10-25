/**
 * Naturaleza, agua, calle, música, fiesta, vehículos y objetos especiales.
 */
import { mix, shade } from '../color';
import { OUT, softShadow, SW, type ObjRenderer } from './common';

/* -------------------------------------------------------------- naturaleza */
export const plant: ObjRenderer = ({ W, H, color, variant }) => {
  const cx = W / 2;
  const cy = H / 2;
  const leaf = color;
  const leafDk = shade(color, 0.25);
  if (variant === 'cactus')
    return (
      <g>
        <ellipse cx={cx + 3} cy={cy + 8} rx={24} ry={24} fill="#000" opacity={0.12} />
        <circle cx={cx} cy={cy + 6} r={22} fill="#c96f3c" stroke={OUT} strokeWidth={SW} />
        <circle cx={cx} cy={cy} r={16} fill={leaf} stroke={OUT} strokeWidth={SW} />
        <circle cx={cx - 14} cy={cy - 10} r={8} fill={leaf} stroke={OUT} strokeWidth={2} />
        <circle cx={cx + 14} cy={cy - 14} r={7} fill={leaf} stroke={OUT} strokeWidth={2} />
        <circle cx={cx + 2} cy={cy - 20} r={4} fill="#f06292" />
      </g>
    );
  if (variant === 'flores')
    return (
      <g>
        <ellipse cx={cx + 3} cy={cy + 8} rx={26} ry={24} fill="#000" opacity={0.12} />
        <circle cx={cx} cy={cy + 8} r={22} fill="#c96f3c" stroke={OUT} strokeWidth={SW} />
        {[...Array(7)].map((_, i) => (
          <circle key={i} cx={cx + 18 * Math.cos(i * 0.9)} cy={cy - 4 + 14 * Math.sin(i * 0.9)} r={9} fill={['#f06292', '#ffffff', '#ffd54f'][i % 3]} stroke={OUT} strokeWidth={1.6} />
        ))}
        <circle cx={cx} cy={cy - 4} r={9} fill={leaf} stroke={OUT} strokeWidth={1.6} />
      </g>
    );
  // maceta con hojas (como en el libro)
  const leaves = [-62, -38, -14, 10, 34, 58, -50, 46, -2];
  return (
    <g>
      <ellipse cx={cx + 3} cy={cy + 22} rx={22} ry={10} fill="#000" opacity={0.15} />
      <path d={`M${cx - 20},${cy + 6} L${cx + 20},${cy + 6} L${cx + 15},${cy + 30} L${cx - 15},${cy + 30} Z`} fill={variant === 'olivo' ? '#b0743f' : '#5a7fc4'} stroke={OUT} strokeWidth={SW} />
      <ellipse cx={cx} cy={cy + 6} rx={21} ry={6} fill={shade(variant === 'olivo' ? '#b0743f' : '#5a7fc4', 0.2)} stroke={OUT} strokeWidth={2} />
      {leaves.map((a, i) => {
        const len = i > 5 ? 26 : 36;
        const rad = ((a - 90) * Math.PI) / 180;
        const x2 = cx + Math.cos(rad) * len;
        const y2 = cy + 4 + Math.sin(rad) * len;
        const nx = Math.cos(rad + Math.PI / 2) * 7;
        const ny = Math.sin(rad + Math.PI / 2) * 7;
        return (
          <path
            key={i}
            d={`M${cx},${cy + 4} Q${(cx + x2) / 2 + nx},${(cy + 4 + y2) / 2 + ny} ${x2},${y2} Q${(cx + x2) / 2 - nx},${(cy + 4 + y2) / 2 - ny} ${cx},${cy + 4} Z`}
            fill={i % 2 ? leaf : leafDk}
            stroke={OUT}
            strokeWidth={1.8}
          />
        );
      })}
    </g>
  );
};

export const tree: ObjRenderer = ({ W, H, color, variant }) => {
  const cx = W / 2;
  const cy = H / 2;
  const r = Math.min(W, H) / 2 - 8;
  if (variant === 'palmera')
    return (
      <g>
        <circle cx={cx + 4} cy={cy + 6} r={r * 0.7} fill="#000" opacity={0.12} />
        {[...Array(7)].map((_, i) => {
          const a = (i / 7) * Math.PI * 2;
          return (
            <path
              key={i}
              d={`M${cx},${cy} Q${cx + Math.cos(a + 0.4) * r * 0.6},${cy + Math.sin(a + 0.4) * r * 0.6} ${cx + Math.cos(a) * r},${cy + Math.sin(a) * r} Q${cx + Math.cos(a - 0.4) * r * 0.5},${cy + Math.sin(a - 0.4) * r * 0.5} ${cx},${cy} Z`}
              fill={i % 2 ? color : shade(color, 0.2)}
              stroke={OUT}
              strokeWidth={1.8}
            />
          );
        })}
        <circle cx={cx} cy={cy} r={7} fill="#8d6e63" stroke={OUT} strokeWidth={2} />
      </g>
    );
  if (variant === 'pino')
    return (
      <g>
        <circle cx={cx + 4} cy={cy + 6} r={r} fill="#000" opacity={0.12} />
        {[1, 0.72, 0.44].map((k, i) => (
          <path key={i} d={`M${cx},${cy - r * k} L${cx + r * k},${cy + r * k * 0.6} L${cx - r * k},${cy + r * k * 0.6} Z`} fill={shade(color, i * 0.08)} stroke={OUT} strokeWidth={2} />
        ))}
      </g>
    );
  const dots = variant === 'naranjo';
  return (
    <g>
      <circle cx={cx + 4} cy={cy + 6} r={r} fill="#000" opacity={0.12} />
      {[...Array(7)].map((_, i) => {
        const a = (i / 7) * Math.PI * 2;
        return <circle key={i} cx={cx + Math.cos(a) * r * 0.45} cy={cy + Math.sin(a) * r * 0.45} r={r * 0.55} fill={color} stroke={OUT} strokeWidth={2} />;
      })}
      <circle cx={cx} cy={cy} r={r * 0.55} fill={shade(color, -0.12)} />
      {dots && [...Array(6)].map((_, i) => <circle key={i} cx={cx + Math.cos(i) * r * 0.55} cy={cy + Math.sin(i * 1.7) * r * 0.5} r={4.5} fill="#ff9800" stroke={OUT} strokeWidth={1} />)}
    </g>
  );
};

export const bush: ObjRenderer = ({ W, H, color }) => {
  const cx = W / 2;
  const cy = H / 2;
  return (
    <g>
      {[[-14, 6], [14, 6], [0, -10], [0, 10]].map(([dx, dy], i) => (
        <circle key={i} cx={cx + dx} cy={cy + dy} r={20} fill={i % 2 ? color : shade(color, 0.12)} stroke={OUT} strokeWidth={2} />
      ))}
    </g>
  );
};

export const rock: ObjRenderer = ({ W, H, color }) => (
  <g>
    <ellipse cx={W / 2 + 4} cy={H / 2 + 8} rx={W / 2 - 14} ry={H / 2 - 18} fill="#000" opacity={0.14} />
    <path d={`M${W * 0.18},${H * 0.62} L${W * 0.26},${H * 0.3} L${W * 0.5},${H * 0.18} L${W * 0.76},${H * 0.3} L${W * 0.84},${H * 0.6} L${W * 0.62},${H * 0.8} L${W * 0.34},${H * 0.8} Z`} fill={color} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
    <path d={`M${W * 0.5},${H * 0.18} L${W * 0.46},${H * 0.5} L${W * 0.84},${H * 0.6} M${W * 0.46},${H * 0.5} L${W * 0.34},${H * 0.8}`} stroke={shade(color, 0.25)} strokeWidth={2} fill="none" />
  </g>
);

export const flowers: ObjRenderer = ({ W, H, color }) => (
  <g>
    {[...Array(9)].map((_, i) => (
      <circle key={i} cx={W / 2 + 16 * Math.cos(i * 0.7)} cy={H / 2 + 16 * Math.sin(i * 0.7)} r={9} fill={i % 2 ? color : '#ffffff'} stroke={OUT} strokeWidth={1.5} />
    ))}
    <circle cx={W / 2} cy={H / 2} r={9} fill="#7cb342" stroke={OUT} strokeWidth={1.5} />
  </g>
);

export const bonfire: ObjRenderer = ({ W, H }) => {
  const cx = W / 2;
  const cy = H / 2;
  return (
    <g>
      <circle cx={cx} cy={cy + 6} r={36} fill="#ffb74d" opacity={0.25} />
      {[[-24, 14, 30], [24, 14, -30], [0, 22, 90]].map(([dx, dy, a], i) => (
        <rect key={i} x={cx + dx - 22} y={cy + dy - 6} width={44} height={11} rx={5} fill="#6d4c41" stroke={OUT} strokeWidth={2} transform={`rotate(${a} ${cx + dx} ${cy + dy})`} />
      ))}
      <path d={`M${cx},${cy - 34} Q${cx + 26},${cy - 4} ${cx + 14},${cy + 14} Q${cx},${cy + 22} ${cx - 14},${cy + 14} Q${cx - 26},${cy - 4} ${cx},${cy - 34} Z`} fill="#ff7a1a" stroke={OUT} strokeWidth={2.4} />
      <path d={`M${cx},${cy - 14} Q${cx + 12},${cy + 2} ${cx + 6},${cy + 12} Q${cx},${cy + 16} ${cx - 6},${cy + 12} Q${cx - 12},${cy + 2} ${cx},${cy - 14} Z`} fill="#ffd54f" />
    </g>
  );
};

export const cross: ObjRenderer = ({ W, H, color }) => (
  <g>
    <rect x={W / 2 - 28} y={H - 30} width={56} height={20} rx={4} fill="#9e968a" stroke={OUT} strokeWidth={SW} />
    <rect x={W / 2 - 7} y={8} width={14} height={H - 34} fill={color} stroke={OUT} strokeWidth={SW} />
    <rect x={W / 2 - 28} y={26} width={56} height={13} fill={color} stroke={OUT} strokeWidth={SW} />
  </g>
);

export const umbrella: ObjRenderer = ({ W, H, color }) => {
  const cx = W / 2;
  const cy = H / 2;
  return (
    <g>
      <circle cx={cx + 6} cy={cy + 8} r={38} fill="#000" opacity={0.12} />
      {[...Array(8)].map((_, i) => {
        const a1 = (i / 8) * Math.PI * 2;
        const a2 = ((i + 1) / 8) * Math.PI * 2;
        return <path key={i} d={`M${cx},${cy} L${cx + Math.cos(a1) * 38},${cy + Math.sin(a1) * 38} L${cx + Math.cos(a2) * 38},${cy + Math.sin(a2) * 38} Z`} fill={i % 2 ? color : '#ffffff'} stroke={OUT} strokeWidth={1.6} />;
      })}
      <circle cx={cx} cy={cy} r={4} fill={OUT} />
    </g>
  );
};

/* ------------------------------------------------------------------- agua */
export const kayak: ObjRenderer = ({ W, H, color, variant }) =>
  variant === 'diagonal' ? (
    <g>
      {/* Kayak en diagonal: ocupa un cuadrado 2x2 (dos plazas en filas y columnas distintas) */}
      <path d={`M${W * 0.08},${H * 0.08} Q${W * 0.62},${H * 0.22} ${W * 0.92},${H * 0.92} Q${W * 0.22},${H * 0.62} ${W * 0.08},${H * 0.08} Z`} fill={color} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
      <ellipse cx={W * 0.29} cy={H * 0.29} rx={14} ry={20} transform={`rotate(-45 ${W * 0.29} ${H * 0.29})`} fill="#2b2b2b" stroke={OUT} strokeWidth={2} />
      <ellipse cx={W * 0.71} cy={H * 0.71} rx={14} ry={20} transform={`rotate(-45 ${W * 0.71} ${H * 0.71})`} fill="#2b2b2b" stroke={OUT} strokeWidth={2} />
      <path d={`M${W * 0.15},${H * 0.85} L${W * 0.85},${H * 0.15}`} stroke="#555" strokeWidth={5} />
      <ellipse cx={W * 0.15} cy={H * 0.85} rx={12} ry={7} transform={`rotate(-45 ${W * 0.15} ${H * 0.85})`} fill="#e53935" />
      <ellipse cx={W * 0.85} cy={H * 0.15} rx={12} ry={7} transform={`rotate(-45 ${W * 0.85} ${H * 0.15})`} fill="#e53935" />
    </g>
  ) : (
  <g>
    <path d={`M${W / 2},6 Q${W - 16},${H / 2} ${W / 2},${H - 6} Q16,${H / 2} ${W / 2},6 Z`} fill={color} stroke={OUT} strokeWidth={SW} />
    <ellipse cx={W / 2} cy={H / 2 - 18} rx={14} ry={22} fill="#2b2b2b" stroke={OUT} strokeWidth={2} />
    <ellipse cx={W / 2} cy={H / 2 + 34} rx={14} ry={22} fill="#2b2b2b" stroke={OUT} strokeWidth={2} />
    <line x1={W / 2} y1={10} x2={W / 2} y2={H - 10} stroke={shade(color, 0.2)} strokeWidth={2} />
  </g>
  );

export const paddle: ObjRenderer = ({ W, H, color }) => (
  <g>
    <ellipse cx={W / 2} cy={H / 2} rx={W / 2 - 22} ry={H / 2 - 8} fill={color} stroke={OUT} strokeWidth={SW} />
    <line x1={W / 2} y1={14} x2={W / 2} y2={H - 14} stroke="#ffffff" strokeWidth={3} />
  </g>
);

export const float: ObjRenderer = ({ W, H, color }) => (
  <g>
    <circle cx={W / 2} cy={H / 2} r={30} fill={color} stroke={OUT} strokeWidth={SW} />
    <circle cx={W / 2} cy={H / 2} r={13} fill="#7ec8e3" stroke={OUT} strokeWidth={2} />
    {[0, 1, 2, 3].map((i) => (
      <path key={i} d={`M${W / 2 + Math.cos(i * 1.57) * 14},${H / 2 + Math.sin(i * 1.57) * 14} L${W / 2 + Math.cos(i * 1.57) * 29},${H / 2 + Math.sin(i * 1.57) * 29}`} stroke="#ffffff" strokeWidth={8} />
    ))}
  </g>
);

export const jet: ObjRenderer = ({ W, H }) => (
  <g>
    {[[-14, -10, 9], [12, -6, 7], [-4, 12, 10], [16, 16, 6], [-18, 14, 5]].map(([dx, dy, r], i) => (
      <circle key={i} cx={W / 2 + dx} cy={H / 2 + dy} r={r} fill="#ffffff" opacity={0.75} stroke="#9fd6ec" strokeWidth={1.5} />
    ))}
  </g>
);

export const pond: ObjRenderer = ({ W, H, color }) => (
  <g>
    <rect x={0} y={0} width={W} height={H} fill={color} />
    {[...Array(Math.max(1, Math.round((W * H) / 9000)))].map((_, i) => (
      <path key={i} d={`M${((i * 37) % Math.max(1, W - 40)) + 10},${((i * 53) % Math.max(1, H - 20)) + 14} q8,-6 16,0 t16,0`} stroke={shade(color, -0.35)} strokeWidth={3} fill="none" strokeLinecap="round" />
    ))}
  </g>
);

export const railing: ObjRenderer = ({ W, H, color }) => (
  <g>
    <rect x={2} y={H / 2 - 5} width={W - 4} height={10} rx={4} fill={color} stroke={OUT} strokeWidth={2} />
    {[...Array(Math.max(2, Math.round(W / 25)))].map((_, i) => (
      <circle key={i} cx={10 + i * ((W - 20) / Math.max(1, Math.round(W / 25) - 1))} cy={H / 2} r={4} fill={shade(color, 0.3)} />
    ))}
  </g>
);

export const buoy: ObjRenderer = ({ W, H, color }) => (
  <g>
    <circle cx={W / 2} cy={H / 2} r={16} fill={color} stroke={OUT} strokeWidth={SW} />
    <path d={`M${W / 2 - 16},${H / 2} L${W / 2 + 16},${H / 2}`} stroke="#ffffff" strokeWidth={5} />
  </g>
);

/* ------------------------------------------------------------- música/fiesta */
export const speaker: ObjRenderer = ({ W, H, color }) => (
  <g>
    {softShadow(24, 14, W - 48, H - 28, 4)}
    <rect x={24} y={12} width={W - 48} height={H - 24} rx={6} fill={color} stroke={OUT} strokeWidth={SW} />
    <circle cx={W / 2} cy={H / 2 + 12} r={16} fill="#555" stroke={OUT} strokeWidth={2} />
    <circle cx={W / 2} cy={H / 2 + 12} r={6} fill="#222" />
    <circle cx={W / 2} cy={H / 2 - 20} r={7} fill="#555" stroke={OUT} strokeWidth={2} />
  </g>
);

export const dj: ObjRenderer = ({ W, H, color }) => (
  <g>
    {softShadow(6, 14, W - 12, H - 28)}
    <rect x={6} y={14} width={W - 12} height={H - 28} rx={6} fill={color} stroke={OUT} strokeWidth={SW} />
    <circle cx={W * 0.25} cy={H / 2} r={22} fill="#111" stroke="#666" strokeWidth={2} />
    <circle cx={W * 0.75} cy={H / 2} r={22} fill="#111" stroke="#666" strokeWidth={2} />
    <circle cx={W * 0.25} cy={H / 2} r={5} fill="#e91e63" />
    <circle cx={W * 0.75} cy={H / 2} r={5} fill="#00bcd4" />
    {[...Array(4)].map((_, i) => (
      <rect key={i} x={W / 2 - 16 + i * 9} y={H / 2 - 14} width={4} height={28} fill="#444" />
    ))}
  </g>
);

export const drums: ObjRenderer = ({ W, H, color }) => {
  const cx = W / 2;
  const cy = H / 2;
  return (
    <g>
      <circle cx={cx} cy={cy + 8} r={24} fill={color} stroke={OUT} strokeWidth={SW} />
      <circle cx={cx} cy={cy + 8} r={17} fill="#f5f5f5" stroke={OUT} strokeWidth={2} />
      <circle cx={cx - 26} cy={cy - 20} r={13} fill="#f5f5f5" stroke={OUT} strokeWidth={2} />
      <circle cx={cx + 26} cy={cy - 20} r={13} fill="#f5f5f5" stroke={OUT} strokeWidth={2} />
      <circle cx={cx - 34} cy={cy + 20} r={12} fill="#e0b84a" stroke={OUT} strokeWidth={2} />
      <circle cx={cx + 34} cy={cy + 20} r={12} fill="#e0b84a" stroke={OUT} strokeWidth={2} />
    </g>
  );
};

export const amp: ObjRenderer = ({ W, H, color }) => (
  <g>
    {softShadow(18, 22, W - 36, H - 40, 4)}
    <rect x={18} y={20} width={W - 36} height={H - 40} rx={5} fill={color} stroke={OUT} strokeWidth={SW} />
    <rect x={24} y={30} width={W - 48} height={H - 66} rx={3} fill="#4a4a4a" />
    {[...Array(5)].map((_, i) => (
      <circle key={i} cx={30 + i * ((W - 60) / 4)} cy={H - 30} r={3.5} fill="#e0b84a" />
    ))}
  </g>
);

export const mic: ObjRenderer = ({ W, H }) => (
  <g>
    <circle cx={W / 2} cy={H / 2 + 20} r={14} fill="#444" stroke={OUT} strokeWidth={2} />
    <line x1={W / 2} y1={H / 2 + 20} x2={W / 2} y2={H / 2 - 18} stroke="#444" strokeWidth={4} />
    <circle cx={W / 2} cy={H / 2 - 22} r={9} fill="#9e9e9e" stroke={OUT} strokeWidth={2} />
  </g>
);

export const camera: ObjRenderer = ({ W, H }) => (
  <g>
    {[[-20, 26], [20, 26], [0, -26]].map(([dx, dy], i) => (
      <line key={i} x1={W / 2} y1={H / 2} x2={W / 2 + dx} y2={H / 2 + dy} stroke="#555" strokeWidth={4} />
    ))}
    <rect x={W / 2 - 22} y={H / 2 - 18} width={44} height={30} rx={5} fill="#2b2b2b" stroke={OUT} strokeWidth={2} />
    <rect x={W / 2 + 18} y={H / 2 - 12} width={16} height={18} rx={3} fill="#444" stroke={OUT} strokeWidth={2} />
    <circle cx={W / 2 - 12} cy={H / 2 - 22} r={4} fill="#e53935" />
  </g>
);

export const stage: ObjRenderer = ({ W, H, color }) => (
  <g>
    <rect x={4} y={4} width={W - 8} height={H - 8} rx={4} fill={color} stroke={OUT} strokeWidth={SW} />
    {[...Array(Math.round(H / 34))].map((_, i) => (
      <line key={i} x1={6} y1={20 + i * 34} x2={W - 6} y2={20 + i * 34} stroke={shade(color, 0.2)} strokeWidth={2} />
    ))}
    <rect x={4} y={H - 16} width={W - 8} height={12} fill={shade(color, 0.3)} />
    {[...Array(Math.round(W / 70))].map((_, i) => (
      <circle key={i} cx={30 + i * 70} cy={H - 10} r={4} fill="#ffeb3b" />
    ))}
  </g>
);

export const balloon: ObjRenderer = ({ W, H, color }) => (
  <g>
    {[[-14, -6, color], [10, -12, shade(color, -0.3)], [2, 12, mix(color, '#7e57c2', 0.5)]].map(([dx, dy, c], i) => (
      <g key={i}>
        <path d={`M${W / 2 + (dx as number)},${H / 2 + (dy as number) + 16} q-4,14 4,26`} stroke="#777" strokeWidth={1.5} fill="none" />
        <ellipse cx={W / 2 + (dx as number)} cy={H / 2 + (dy as number)} rx={14} ry={17} fill={c as string} stroke={OUT} strokeWidth={2} />
      </g>
    ))}
  </g>
);

export const cake: ObjRenderer = ({ W, H, color }) => (
  <g>
    <circle cx={W / 2 + 3} cy={H / 2 + 5} r={30} fill="#000" opacity={0.12} />
    <circle cx={W / 2} cy={H / 2} r={30} fill="#ffffff" stroke={OUT} strokeWidth={2} />
    <circle cx={W / 2} cy={H / 2} r={24} fill={color} stroke={OUT} strokeWidth={2} />
    {[0, 1, 2, 3, 4].map((i) => (
      <g key={i}>
        <circle cx={W / 2 + Math.cos(i * 1.26) * 12} cy={H / 2 + Math.sin(i * 1.26) * 12} r={3} fill="#ffeb3b" stroke={OUT} strokeWidth={1} />
      </g>
    ))}
  </g>
);

export const barrel: ObjRenderer = ({ W, H, color }) => (
  <g>
    <circle cx={W / 2 + 3} cy={H / 2 + 5} r={32} fill="#000" opacity={0.14} />
    <circle cx={W / 2} cy={H / 2} r={32} fill={color} stroke={OUT} strokeWidth={SW} />
    <circle cx={W / 2} cy={H / 2} r={24} fill="none" stroke="#5d4037" strokeWidth={3} />
    <circle cx={W / 2} cy={H / 2} r={14} fill={shade(color, -0.15)} stroke={OUT} strokeWidth={1.5} />
    <circle cx={W / 2} cy={H / 2} r={4} fill="#3e2723" />
  </g>
);

export const bingo: ObjRenderer = ({ W, H, color }) => (
  <g>
    <rect x={W / 2 - 24} y={H / 2 + 14} width={48} height={14} rx={3} fill="#5d4037" stroke={OUT} strokeWidth={2} />
    <circle cx={W / 2} cy={H / 2 - 4} r={26} fill="#fff8e1" fillOpacity={0.7} stroke={color} strokeWidth={4} />
    {[...Array(7)].map((_, i) => (
      <circle key={i} cx={W / 2 + Math.cos(i) * 12} cy={H / 2 - 4 + Math.sin(i * 1.3) * 12} r={5} fill={['#e53935', '#1e88e5', '#43a047', '#fdd835'][i % 4]} />
    ))}
  </g>
);

export const screen: ObjRenderer = ({ W, H, variant }) =>
  variant === 'cine' ? (
    <g>
      {/* Pantalla grande de autocine con su estructura y el haz de luz */}
      <path d={`M${W * 0.12},${H / 2 + 20} L${W * 0.02},${H} L${W * 0.98},${H} L${W * 0.88},${H / 2 + 20} Z`} fill="#fff8c4" opacity={0.35} />
      {[0.12, 0.5, 0.88].map((k) => (
        <rect key={k} x={W * k - 5} y={H / 2 + 14} width={10} height={H / 2 - 16} fill="#5d6168" stroke={OUT} strokeWidth={1.5} />
      ))}
      <rect x={4} y={H / 2 - 30} width={W - 8} height={50} rx={4} fill="#2b2b2b" stroke={OUT} strokeWidth={SW} />
      <rect x={14} y={H / 2 - 22} width={W - 28} height={34} rx={2} fill="#fdfdf8" />
      <path d={`M${W * 0.35},${H / 2 + 4} q${W * 0.06},-22 ${W * 0.14},-6 q${W * 0.05},-14 ${W * 0.12},2 l-${W * 0.04},6 Z`} fill="#3b4a5a" opacity={0.75} />
    </g>
  ) : (
  <g>
    <rect x={4} y={H / 2 - 14} width={W - 8} height={28} rx={3} fill="#2b2b2b" stroke={OUT} strokeWidth={SW} />
    <rect x={10} y={H / 2 - 9} width={W - 20} height={14} fill={variant === 'concierto' ? '#7e57c2' : '#fafafa'} />
    {variant === 'juego' && [...Array(Math.round(W / 40))].map((_, i) => <circle key={i} cx={24 + i * 40} cy={H / 2 - 2} r={5} fill="#c98d4a" stroke="#6d4c41" strokeWidth={1} />)}
    {[0.15, 0.85].map((k) => (
      <rect key={k} x={W * k - 4} y={H / 2 + 14} width={8} height={H / 2 - 18} fill="#555" />
    ))}
  </g>
  );

export const arcade: ObjRenderer = ({ W, H, color }) => (
  <g>
    <circle cx={W / 2} cy={H / 2} r={30} fill={color} stroke={OUT} strokeWidth={SW} />
    {[[-10, -8], [8, -12], [12, 8], [-8, 12], [0, 0]].map(([dx, dy], i) => (
      <circle key={i} cx={W / 2 + dx} cy={H / 2 + dy} r={4.5} fill="#4e2c1a" />
    ))}
  </g>
);

export const belt: ObjRenderer = ({ W, H, color }) => {
  const plates = ['#e53935', '#fdd835', '#43a047', '#1e88e5', '#ab47bc', '#fb8c00'];
  return (
    <g>
      <rect x={2} y={H / 2 - 26} width={W - 4} height={52} rx={6} fill={color} stroke={OUT} strokeWidth={SW} />
      <rect x={6} y={H / 2 - 20} width={W - 12} height={40} rx={4} fill={shade(color, -0.2)} />
      {[...Array(Math.round(W / 34))].map((_, i) => (
        <g key={i}>
          <circle cx={20 + i * 34} cy={H / 2} r={13} fill={plates[i % plates.length]} stroke={OUT} strokeWidth={1.5} />
          <circle cx={20 + i * 34} cy={H / 2} r={7} fill="#ffffff" />
          <circle cx={20 + i * 34} cy={H / 2} r={3.5} fill={i % 2 ? '#f4845f' : '#1f3b2b'} />
        </g>
      ))}
    </g>
  );
};

/* -------------------------------------------------------------- vehículos */
export const car: ObjRenderer = ({ W, H, color, variant }) => {
  const m = 10;
  if (variant === 'grande') {
    // Coche visto desde arriba con cuatro asientos (ocupa 2×2 casillas).
    const body = color;
    return (
      <g>
        {softShadow(m, m, W - 2 * m, H - 2 * m, 30)}
        <rect x={m} y={m} width={W - 2 * m} height={H - 2 * m} rx={34} fill={body} stroke={OUT} strokeWidth={SW} />
        <rect x={m + 16} y={m + 8} width={W - 2 * m - 32} height={26} rx={10} fill="#bfe3f2" stroke={OUT} strokeWidth={2} />
        <rect x={m + 20} y={H - m - 30} width={W - 2 * m - 40} height={20} rx={8} fill="#bfe3f2" stroke={OUT} strokeWidth={2} />
        <rect x={m + 10} y={m + 42} width={W - 2 * m - 20} height={H - 2 * m - 82} rx={18} fill={shade(body, 0.12)} stroke={OUT} strokeWidth={2} />
        {[
          [W * 0.3, H * 0.4],
          [W * 0.7, H * 0.4],
          [W * 0.3, H * 0.68],
          [W * 0.7, H * 0.68],
        ].map(([x, y], i) => (
          <rect key={i} x={x - 24} y={y - 20} width={48} height={40} rx={10} fill={shade(body, 0.35)} stroke={OUT} strokeWidth={2} />
        ))}
        <circle cx={W * 0.3} cy={H * 0.3} r={11} fill="none" stroke="#2b2b2b" strokeWidth={4} />
        {[m - 4, W - m - 4].map((x) => [H * 0.18, H * 0.74].map((y) => <rect key={`${x}-${y}`} x={x} y={y} width={8} height={20} rx={3} fill="#2b2b2b" />))}
      </g>
    );
  }
  if (variant === 'taxi4') {
    return (
      <g>
        {softShadow(m, m, W - 2 * m, H - 2 * m, 30)}
        <rect x={m} y={m} width={W - 2 * m} height={H - 2 * m} rx={34} fill="#f2c12e" stroke={OUT} strokeWidth={SW} />
        <rect x={m + 14} y={m + 6} width={W - 2 * m - 28} height={18} rx={8} fill="#bfe3f2" stroke={OUT} strokeWidth={2} />
        {[
          [W * 0.28, H * 0.34],
          [W * 0.72, H * 0.34],
          [W * 0.28, H * 0.7],
          [W * 0.72, H * 0.7],
        ].map(([x, y], i) => (
          <rect key={i} x={x - 26} y={y - 22} width={52} height={44} rx={10} fill="#3b3b3b" stroke={OUT} strokeWidth={2} />
        ))}
        {[...Array(8)].map((_, i) => (
          <rect key={i} x={m + 6 + i * ((W - 2 * m - 12) / 8)} y={H / 2 - 4} width={(W - 2 * m - 12) / 16} height={8} fill="#2b2b2b" />
        ))}
        <path d={`M${W * 0.22},${H * 0.52} l14,-10 M${W * 0.66},${H * 0.52} l14,-10`} stroke="#e53935" strokeWidth={5} strokeLinecap="round" />
      </g>
    );
  }
  const taxi = variant === 'taxi';
  const body = taxi ? '#f2c12e' : color;
  return (
    <g>
      {softShadow(m, m, W - 2 * m, H - 2 * m, 16)}
      <rect x={m} y={m} width={W - 2 * m} height={H - 2 * m} rx={18} fill={body} stroke={OUT} strokeWidth={SW} />
      <rect x={m + 10} y={H * 0.2} width={W - 2 * m - 20} height={H * 0.16} rx={8} fill="#bfe3f2" stroke={OUT} strokeWidth={2} />
      <rect x={m + 10} y={H * 0.66} width={W - 2 * m - 20} height={H * 0.12} rx={8} fill="#bfe3f2" stroke={OUT} strokeWidth={2} />
      {variant !== 'descapotable' && <rect x={m + 8} y={H * 0.38} width={W - 2 * m - 16} height={H * 0.26} rx={8} fill={shade(body, 0.1)} stroke={OUT} strokeWidth={2} />}
      {variant === 'descapotable' && <rect x={m + 10} y={H * 0.38} width={W - 2 * m - 20} height={H * 0.26} rx={6} fill="#5d4037" />}
      {taxi && <rect x={W / 2 - 14} y={H * 0.46} width={28} height={10} rx={3} fill="#2b2b2b" />}
      {taxi && [...Array(5)].map((_, i) => <rect key={i} x={m + 2 + i * ((W - 2 * m) / 5)} y={H * 0.82} width={(W - 2 * m) / 10} height={6} fill="#2b2b2b" />)}
      <rect x={m - 3} y={H * 0.12} width={6} height={14} rx={2} fill="#2b2b2b" />
      <rect x={W - m - 3} y={H * 0.12} width={6} height={14} rx={2} fill="#2b2b2b" />
      <rect x={m - 3} y={H * 0.78} width={6} height={14} rx={2} fill="#2b2b2b" />
      <rect x={W - m - 3} y={H * 0.78} width={6} height={14} rx={2} fill="#2b2b2b" />
    </g>
  );
};

export const scooter: ObjRenderer = ({ W, H, color, variant }) =>
  variant === 'diagonal' ? (
    <g transform={`rotate(-45 ${W / 2} ${H / 2})`}>
      {/* Moto aparcada en diagonal (2x2): dos plazas, piloto y pasajera */}
      <ellipse cx={W / 2 + 4} cy={H / 2 + 6} rx={30} ry={H * 0.55} fill="#000" opacity={0.12} />
      <rect x={W / 2 - 7} y={H / 2 - H * 0.6} width={14} height={20} rx={5} fill="#2b2b2b" />
      <rect x={W / 2 - 7} y={H / 2 + H * 0.6 - 20} width={14} height={20} rx={5} fill="#2b2b2b" />
      <path d={`M${W / 2 - 24},${H / 2 + H * 0.5} L${W / 2 - 28},${H / 2 - H * 0.2} Q${W / 2},${H / 2 - H * 0.55} ${W / 2 + 28},${H / 2 - H * 0.2} L${W / 2 + 24},${H / 2 + H * 0.5} Z`} fill={color} stroke={OUT} strokeWidth={SW} />
      <rect x={W / 2 - 15} y={H / 2 - 18} width={30} height={H * 0.55} rx={12} fill="#3b3b3b" stroke={OUT} strokeWidth={2} />
      <path d={`M${W / 2 - 40},${H / 2 - H * 0.4} L${W / 2 + 40},${H / 2 - H * 0.4}`} stroke="#2b2b2b" strokeWidth={7} strokeLinecap="round" />
      <circle cx={W / 2} cy={H / 2 - H * 0.5} r={7} fill="#fff8c4" stroke={OUT} strokeWidth={1.5} />
    </g>
  ) : (
  <g>
    <ellipse cx={W / 2 + 3} cy={H / 2 + 6} rx={22} ry={38} fill="#000" opacity={0.13} />
    <rect x={W / 2 - 5} y={H / 2 - 44} width={10} height={14} rx={4} fill="#2b2b2b" />
    <rect x={W / 2 - 5} y={H / 2 + 30} width={10} height={14} rx={4} fill="#2b2b2b" />
    <path d={`M${W / 2 - 18},${H / 2 + 34} L${W / 2 - 20},${H / 2 - 10} Q${W / 2},${H / 2 - 40} ${W / 2 + 20},${H / 2 - 10} L${W / 2 + 18},${H / 2 + 34} Z`} fill={color} stroke={OUT} strokeWidth={SW} />
    <rect x={W / 2 - 11} y={H / 2 - 2} width={22} height={28} rx={8} fill="#3b3b3b" stroke={OUT} strokeWidth={2} />
    <path d={`M${W / 2 - 28},${H / 2 - 28} L${W / 2 + 28},${H / 2 - 28}`} stroke="#2b2b2b" strokeWidth={5} strokeLinecap="round" />
    <circle cx={W / 2} cy={H / 2 - 34} r={5} fill="#fff8c4" stroke={OUT} strokeWidth={1.5} />
  </g>
  );

export const wagon: ObjRenderer = ({ W, H, color, variant }) => {
  if (variant === 'teleferico')
    return (
      <g>
        <line x1={0} y1={14} x2={W} y2={14} stroke="#555" strokeWidth={3} />
        <line x1={W / 2} y1={14} x2={W / 2} y2={28} stroke="#555" strokeWidth={3} />
        <rect x={W / 2 - 28} y={28} width={56} height={52} rx={8} fill={color} stroke={OUT} strokeWidth={SW} />
        <rect x={W / 2 - 22} y={34} width={44} height={18} rx={4} fill="#bfe3f2" stroke={OUT} strokeWidth={2} />
      </g>
    );
  return (
    <g>
      {softShadow(14, 12, W - 28, H - 24, 12)}
      <rect x={14} y={12} width={W - 28} height={H - 24} rx={14} fill={variant === 'taxi' ? '#f2c12e' : color} stroke={OUT} strokeWidth={SW} />
      <rect x={22} y={22} width={W - 44} height={(H - 44) / 2 - 2} rx={6} fill="#3b3b3b" stroke={OUT} strokeWidth={2} />
      <rect x={22} y={H / 2 + 2} width={W - 44} height={(H - 44) / 2 - 2} rx={6} fill="#3b3b3b" stroke={OUT} strokeWidth={2} />
      <rect x={14} y={H / 2 - 3} width={W - 28} height={6} fill={shade(color, 0.25)} />
    </g>
  );
};

export const track: ObjRenderer = ({ W, H, color }) => (
  <g>
    <rect x={0} y={H / 2 - 22} width={W} height={44} fill={shade(color, -0.25)} opacity={0.6} />
    {[...Array(Math.round(W / 20))].map((_, i) => (
      <rect key={i} x={i * 20 + 4} y={H / 2 - 24} width={10} height={48} fill={color} stroke={OUT} strokeWidth={1.2} />
    ))}
    <line x1={0} y1={H / 2 - 14} x2={W} y2={H / 2 - 14} stroke="#6d6d6d" strokeWidth={4} />
    <line x1={0} y1={H / 2 + 14} x2={W} y2={H / 2 + 14} stroke="#6d6d6d" strokeWidth={4} />
  </g>
);

/* ------------------------------------------------------------------- calle */
export const streetlamp: ObjRenderer = ({ W, H, color }) => (
  <g>
    <circle cx={W / 2} cy={H / 2} r={10} fill={color} stroke={OUT} strokeWidth={2} />
    <circle cx={W / 2} cy={H / 2} r={22} fill="#fff59d" opacity={0.35} />
    <circle cx={W / 2} cy={H / 2} r={6} fill="#fff59d" />
  </g>
);

export const trafficlight: ObjRenderer = ({ W, H }) => (
  <g>
    <rect x={W / 2 - 11} y={H / 2 - 28} width={22} height={56} rx={6} fill="#2b2b2b" stroke={OUT} strokeWidth={2} />
    <circle cx={W / 2} cy={H / 2 - 16} r={6} fill="#e53935" />
    <circle cx={W / 2} cy={H / 2} r={6} fill="#fdd835" opacity={0.4} />
    <circle cx={W / 2} cy={H / 2 + 16} r={6} fill="#43a047" opacity={0.4} />
  </g>
);

export const bin: ObjRenderer = ({ W, H, color }) => (
  <g>
    <circle cx={W / 2 + 2} cy={H / 2 + 4} r={20} fill="#000" opacity={0.12} />
    <circle cx={W / 2} cy={H / 2} r={20} fill={color} stroke={OUT} strokeWidth={SW} />
    <circle cx={W / 2} cy={H / 2} r={13} fill={shade(color, 0.3)} />
  </g>
);

/** Público: grupo de cabezas vistas desde arriba (no se puede ocupar). */
export const crowd: ObjRenderer = ({ W, H, color, label }) => {
  const heads: [number, number, string, string][] = [];
  const hair = ['#3b2519', '#1f1712', '#d9a85b', '#5a3a24', '#9a9a9a', '#b5452b'];
  const shirts = ['#e57373', '#64b5f6', '#81c784', '#ffd54f', '#ba68c8', '#4db6ac', color];
  const nx = Math.max(1, Math.round(W / 50));
  const ny = Math.max(1, Math.round(H / 50));
  for (let i = 0; i < nx; i++)
    for (let j = 0; j < ny; j++) {
      const k = i * 7 + j * 3;
      heads.push([25 + i * 50 + ((j % 2) * 10 - 5), 25 + j * 50 + ((i % 2) * 8 - 4), hair[k % hair.length], shirts[k % shirts.length]]);
    }
  return (
    <g>
      {heads.map(([x, y, hc, sc], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y + 4} rx={20} ry={14} fill={sc} stroke={OUT} strokeWidth={1.8} />
          <circle cx={x} cy={y} r={11} fill={hc} stroke={OUT} strokeWidth={1.8} />
        </g>
      ))}
      {label && (
        <text x={W / 2} y={H - 6} textAnchor="middle" fontSize={14} fontFamily="Oswald" fill="#fff">
          {label}
        </text>
      )}
    </g>
  );
};

export const statue: ObjRenderer = ({ W, H, color }) => (
  <g>
    <rect x={W / 2 - 26} y={H - 34} width={52} height={22} fill={shade(color, 0.15)} stroke={OUT} strokeWidth={SW} />
    <path d={`M${W / 2 - 10},${H - 34} Q${W / 2 - 16},${H / 2} ${W / 2 - 6},${H * 0.3} Q${W / 2 + 12},${H * 0.22} ${W / 2 + 8},${H * 0.4} Q${W / 2 + 18},${H * 0.6} ${W / 2 + 10},${H - 34} Z`} fill={color} stroke={OUT} strokeWidth={SW} />
    <circle cx={W / 2} cy={H * 0.24} r={9} fill={color} stroke={OUT} strokeWidth={2} />
  </g>
);

export const fountain: ObjRenderer = ({ W, H, color }) => (
  <g>
    <rect x={4} y={H * 0.15} width={W - 8} height={H * 0.75} rx={10} fill={color} stroke={OUT} strokeWidth={SW} />
    <rect x={14} y={H * 0.28} width={W - 28} height={H * 0.5} rx={8} fill="#7ec8e3" stroke={OUT} strokeWidth={2} />
    {[...Array(4)].map((_, i) => (
      <path key={i} d={`M${20 + i * ((W - 40) / 3)},${H * 0.55} q8,-6 16,0`} stroke="#ffffff" strokeWidth={2.5} fill="none" />
    ))}
    <circle cx={W / 2} cy={H * 0.5} r={10} fill={shade(color, 0.1)} stroke={OUT} strokeWidth={2} />
  </g>
);

export const altar: ObjRenderer = ({ W, H, color }) => (
  <g>
    <rect x={4} y={4} width={W - 8} height={H - 8} rx={4} fill={color} stroke={shade(color, 0.25)} strokeWidth={3} />
    <rect x={14} y={14} width={W - 28} height={H - 28} rx={3} fill="none" stroke="#e0c27a" strokeWidth={2} strokeDasharray="6 4" />
  </g>
);

export const arch: ObjRenderer = ({ W, H, color }) => (
  <g>
    {[...Array(14)].map((_, i) => {
      const a = Math.PI + (i / 13) * Math.PI;
      return <circle key={i} cx={W / 2 + Math.cos(a) * (W / 2 - 14)} cy={H - 16 + Math.sin(a) * (H - 30)} r={9} fill={i % 3 === 0 ? '#ffffff' : color} stroke={OUT} strokeWidth={1.4} />;
    })}
  </g>
);

export const virgin: ObjRenderer = ({ W, H, color }) => {
  const cx = W / 2;
  return (
    <g>
      {/* manto de flores en forma de triángulo, con la cara arriba */}
      <path d={`M${cx},${H * 0.12} L${W - 12},${H - 10} L12,${H - 10} Z`} fill={color} stroke={OUT} strokeWidth={SW} />
      {[...Array(40)].map((_, i) => {
        const t = (i * 0.618) % 1;
        const y = H * 0.25 + ((i * 37) % 100) / 100 * (H * 0.62);
        const half = ((y - H * 0.12) / (H * 0.88)) * (W / 2 - 14);
        const x = cx - half + t * half * 2;
        return <circle key={i} cx={x} cy={y} r={5} fill={['#ffffff', '#f06292', '#f8bbd0', '#ff8a80'][i % 4]} />;
      })}
      <circle cx={cx} cy={H * 0.18} r={14} fill="#f1cdb5" stroke={OUT} strokeWidth={2} />
      <path d={`M${cx - 18},${H * 0.12} Q${cx},${H * 0.02} ${cx + 18},${H * 0.12}`} fill="#d4af37" stroke={OUT} strokeWidth={1.5} />
    </g>
  );
};

export const nest: ObjRenderer = ({ W, H, color }) => (
  <g>
    <ellipse cx={W / 2} cy={H / 2} rx={28} ry={20} fill={color} stroke={OUT} strokeWidth={2} />
    <ellipse cx={W / 2} cy={H / 2} rx={18} ry={11} fill={shade(color, 0.3)} />
    {[[-6, 0], [4, -2], [8, 4]].map(([dx, dy], i) => (
      <ellipse key={i} cx={W / 2 + dx} cy={H / 2 + dy} rx={5} ry={6} fill="#f5f5f5" stroke={OUT} strokeWidth={1} />
    ))}
  </g>
);

export const house: ObjRenderer = ({ W, H, color, variant }) => {
  if (variant === 'dragon')
    return (
      <g>
        {softShadow(8, 8, W - 16, H - 16)}
        <path d={`M8,${H - 8} L8,${H * 0.4} Q${W / 2},${-H * 0.1} ${W - 8},${H * 0.4} L${W - 8},${H - 8} Z`} fill={color} stroke={OUT} strokeWidth={SW} />
        {[...Array(6)].map((_, i) => (
          <path key={i} d={`M${20 + i * ((W - 40) / 5)},${H * 0.42 - Math.sin((i / 5) * Math.PI) * H * 0.25} l8,-16 l8,16 Z`} fill="#c0392b" stroke={OUT} strokeWidth={1.5} />
        ))}
        <circle cx={W * 0.25} cy={H * 0.55} r={8} fill="#f2c94c" stroke={OUT} strokeWidth={2} />
        <rect x={W / 2 - 16} y={H - 50} width={32} height={42} rx={14} fill="#4e342e" stroke={OUT} strokeWidth={2} />
      </g>
    );
  return (
    <g>
      {softShadow(8, 8, W - 16, H - 16)}
      <rect x={8} y={8} width={W - 16} height={H - 16} rx={4} fill={color} stroke={OUT} strokeWidth={SW} />
      <path d={`M8,8 L${W / 2},${H / 2} L${W - 8},8 M8,${H - 8} L${W / 2},${H / 2} L${W - 8},${H - 8}`} stroke={shade(color, 0.2)} strokeWidth={2} />
      {variant === 'casal' && (
        <text x={W / 2} y={H / 2 + 6} textAnchor="middle" fontFamily="Oswald" fontSize={18} fill="#fff" stroke={OUT} strokeWidth={0.6}>
          CASAL
        </text>
      )}
    </g>
  );
};

export const sign: ObjRenderer = ({ W, H, color, label }) => (
  <g>
    <rect x={8} y={H / 2 - 20} width={W - 16} height={40} rx={6} fill={color} stroke={OUT} strokeWidth={SW} />
    <text x={W / 2} y={H / 2 + 6} textAnchor="middle" fontFamily="Oswald" fontSize={Math.min(18, (W - 24) / Math.max(4, (label ?? 'CARTEL').length) * 1.8)} fill={OUT}>
      {label ?? 'CARTEL'}
    </text>
  </g>
);

export const trophy: ObjRenderer = ({ W, H, color }) => (
  <g>
    <rect x={W / 2 - 14} y={H / 2 + 14} width={28} height={8} rx={2} fill="#5d4037" />
    <path d={`M${W / 2 - 14},${H / 2 - 26} L${W / 2 + 14},${H / 2 - 26} L${W / 2 + 6},${H / 2 + 14} L${W / 2 - 6},${H / 2 + 14} Z`} fill={color} stroke={OUT} strokeWidth={2} />
  </g>
);

export const paella: ObjRenderer = ({ W, H, variant }) => {
  const cx = W / 2;
  const cy = H / 2;
  const r = Math.min(W, H) / 2 - 10;
  return (
    <g>
      {variant === 'fuego' && (
        <g>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={cx - 8} y={cy - r - 4} width={16} height={12} rx={4} fill="#6d4c41" transform={`rotate(${i * 60} ${cx} ${cy})`} />
          ))}
          <circle cx={cx} cy={cy} r={r + 4} fill="#ff7a1a" opacity={0.35} />
        </g>
      )}
      {variant === 'paellero' && <circle cx={cx} cy={cy} r={r + 6} fill="#3b3b3b" stroke={OUT} strokeWidth={2} />}
      <rect x={cx - r - 12} y={cy - 5} width={14} height={10} rx={3} fill="#2b2b2b" />
      <rect x={cx + r - 2} y={cy - 5} width={14} height={10} rx={3} fill="#2b2b2b" />
      <circle cx={cx} cy={cy} r={r} fill="#2b2b2b" stroke={OUT} strokeWidth={2} />
      <circle cx={cx} cy={cy} r={r - 5} fill="#f2b233" />
      {[...Array(12)].map((_, i) => (
        <circle key={i} cx={cx + Math.cos(i * 1.7) * (r - 14) * ((i % 3) / 3 + 0.3)} cy={cy + Math.sin(i * 1.7) * (r - 14) * ((i % 3) / 3 + 0.3)} r={4} fill={['#d07a3a', '#5fa043', '#d63b2a'][i % 3]} />
      ))}
    </g>
  );
};

export const cooler: ObjRenderer = ({ W, H, color }) => (
  <g>
    {softShadow(20, 22, W - 40, H - 44, 6)}
    <rect x={20} y={22} width={W - 40} height={H - 44} rx={6} fill={color} stroke={OUT} strokeWidth={SW} />
    <rect x={20} y={22} width={W - 40} height={16} rx={6} fill="#ffffff" stroke={OUT} strokeWidth={2} />
    <rect x={W / 2 - 14} y={26} width={28} height={6} rx={3} fill={shade(color, 0.3)} />
  </g>
);

export const bbq: ObjRenderer = ({ W, H }) => (
  <g>
    <circle cx={W / 2} cy={H / 2} r={28} fill="#2b2b2b" stroke={OUT} strokeWidth={SW} />
    {[-14, -5, 4, 13].map((d) => (
      <line key={d} x1={W / 2 - 22} y1={H / 2 + d} x2={W / 2 + 22} y2={H / 2 + d} stroke="#777" strokeWidth={2} />
    ))}
  </g>
);
