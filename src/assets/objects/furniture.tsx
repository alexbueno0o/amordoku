/**
 * Muebles: sillas, sofás, camas, mesas, alfombras, televisores, estanterías...
 * Todos se dibujan en su orientación "canónica" (mirando hacia abajo/sur).
 */
import { shade } from '../color';
import { OUT, softShadow, SW, type ObjRenderer } from './common';

/* ---------------------------------------------------------------- asientos */
export const chair: ObjRenderer = ({ W, H, color, variant }) => {
  const cx = W / 2;
  const cy = H / 2;
  const dk = shade(color, 0.18);
  const lt = shade(color, -0.25);
  switch (variant) {
    case 'comedor':
      return (
        <g>
          {softShadow(cx - 30, cy - 30, 60, 62)}
          <rect x={cx - 30} y={cy - 34} width={60} height={20} rx={6} fill={dk} stroke={OUT} strokeWidth={SW} />
          <rect x={cx - 28} y={cy - 16} width={56} height={46} rx={7} fill={color} stroke={OUT} strokeWidth={SW} />
          <rect x={cx - 20} y={cy - 8} width={40} height={6} rx={3} fill={lt} opacity={0.6} />
        </g>
      );
    case 'plastico':
    case 'terraza':
    case 'plegable': {
      const c = variant === 'plastico' ? '#f7f7f5' : color;
      return (
        <g>
          {softShadow(cx - 28, cy - 28, 56, 58)}
          <path d={`M${cx - 30},${cy - 18} Q${cx},${cy - 44} ${cx + 30},${cy - 18} L${cx + 26},${cy - 8} Q${cx},${cy - 30} ${cx - 26},${cy - 8} Z`} fill={shade(c, 0.08)} stroke={OUT} strokeWidth={SW} />
          <rect x={cx - 26} y={cy - 10} width={52} height={40} rx={10} fill={c} stroke={OUT} strokeWidth={SW} />
          {variant === 'terraza' && <path d={`M${cx - 18},${cy} L${cx + 18},${cy} M${cx - 18},${cy + 10} L${cx + 18},${cy + 10} M${cx - 18},${cy + 20} L${cx + 18},${cy + 20}`} stroke={dk} strokeWidth={2} />}
        </g>
      );
    }
    case 'oficina':
      return (
        <g>
          {softShadow(cx - 28, cy - 28, 56, 58)}
          <rect x={cx - 26} y={cy - 36} width={52} height={22} rx={10} fill={dk} stroke={OUT} strokeWidth={SW} />
          <circle cx={cx} cy={cy + 6} r={26} fill={color} stroke={OUT} strokeWidth={SW} />
        </g>
      );
    case 'boda':
      return (
        <g>
          {softShadow(cx - 28, cy - 28, 56, 58)}
          <rect x={cx - 28} y={cy - 34} width={56} height={16} rx={6} fill="#ffffff" stroke={OUT} strokeWidth={SW} />
          <rect x={cx - 26} y={cy - 18} width={52} height={46} rx={8} fill="#fbfaf7" stroke={OUT} strokeWidth={SW} />
          <path d={`M${cx - 10},${cy - 26} l10,6 l10,-6 l0,12 l-10,-6 l-10,6 Z`} fill={color} />
        </g>
      );
    default:
      // sillón (como el del libro)
      return (
        <g>
          {softShadow(cx - 32, cy - 32, 64, 66, 14)}
          <path d={`M${cx - 30},${cy + 30} L${cx - 30},${cy - 18} Q${cx - 30},${cy - 38} ${cx - 12},${cy - 38} L${cx + 12},${cy - 38} Q${cx + 30},${cy - 38} ${cx + 30},${cy - 18} L${cx + 30},${cy + 30} Q${cx},${cy + 36} ${cx - 30},${cy + 30} Z`} fill={color} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
          <path d={`M${cx - 20},${cy - 22} Q${cx},${cy - 30} ${cx + 20},${cy - 22}`} stroke={lt} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.7} />
          <rect x={cx - 34} y={cy - 6} width={14} height={36} rx={7} fill={dk} stroke={OUT} strokeWidth={SW} />
          <rect x={cx + 20} y={cy - 6} width={14} height={36} rx={7} fill={dk} stroke={OUT} strokeWidth={SW} />
          <rect x={cx - 19} y={cy + 2} width={38} height={26} rx={7} fill={lt} stroke={OUT} strokeWidth={2} />
        </g>
      );
  }
};

export const stool: ObjRenderer = ({ W, H, color }) => (
  <g>
    <ellipse cx={W / 2 + 3} cy={H / 2 + 6} rx={26} ry={26} fill="#000" opacity={0.12} />
    <circle cx={W / 2} cy={H / 2} r={25} fill={color} stroke={OUT} strokeWidth={SW} />
    <circle cx={W / 2} cy={H / 2} r={15} fill={shade(color, -0.2)} opacity={0.6} />
  </g>
);

export const pouf: ObjRenderer = ({ W, H, color }) => (
  <g>
    <circle cx={W / 2 + 3} cy={H / 2 + 5} r={30} fill="#000" opacity={0.12} />
    <circle cx={W / 2} cy={H / 2} r={30} fill={color} stroke={OUT} strokeWidth={SW} />
    <path d={`M${W / 2 - 20},${H / 2} L${W / 2 + 20},${H / 2} M${W / 2},${H / 2 - 20} L${W / 2},${H / 2 + 20}`} stroke={shade(color, 0.2)} strokeWidth={2} />
  </g>
);

export const sofa: ObjRenderer = ({ W, H, color, variant }) => {
  const dk = shade(color, 0.16);
  const lt = shade(color, -0.2);
  const m = 8;
  const n = Math.max(1, Math.round(W / 100));
  return (
    <g>
      {softShadow(m, m, W - 2 * m, H - 2 * m, 14)}
      <rect x={m} y={m} width={W - 2 * m} height={H * 0.42} rx={14} fill={dk} stroke={OUT} strokeWidth={SW} />
      <rect x={m} y={H * 0.3} width={W - 2 * m} height={H * 0.62} rx={14} fill={color} stroke={OUT} strokeWidth={SW} />
      {[...Array(n)].map((_, i) => (
        <rect key={i} x={m + 18 + (i * (W - 2 * m - 36)) / n + 2} y={H * 0.36} width={(W - 2 * m - 36) / n - 4} height={H * 0.46} rx={9} fill={lt} stroke={OUT} strokeWidth={2} />
      ))}
      <rect x={m - 2} y={H * 0.26} width={20} height={H * 0.66} rx={9} fill={dk} stroke={OUT} strokeWidth={SW} />
      <rect x={W - m - 18} y={H * 0.26} width={20} height={H * 0.66} rx={9} fill={dk} stroke={OUT} strokeWidth={SW} />
      {variant === 'chill' && <rect x={W * 0.3} y={H * 0.4} width={16} height={16} rx={4} fill="#f2c94c" stroke={OUT} strokeWidth={2} />}
    </g>
  );
};

export const bench: ObjRenderer = ({ W, H, color, variant }) => {
  const dk = shade(color, 0.2);
  if (variant === 'iglesia') {
    return (
      <g>
        {softShadow(6, 14, W - 12, H - 28)}
        <rect x={6} y={14} width={W - 12} height={20} rx={4} fill={dk} stroke={OUT} strokeWidth={SW} />
        <rect x={6} y={34} width={W - 12} height={H - 52} rx={4} fill={color} stroke={OUT} strokeWidth={SW} />
        {[...Array(Math.round(W / 100))].map((_, i) => (
          <path key={i} d={`M${i * 100 + 50},${40} l0,${H - 64}`} stroke={dk} strokeWidth={1.5} opacity={0.5} />
        ))}
      </g>
    );
  }
  if (variant === 'grada') {
    return (
      <g>
        <rect x={0} y={10} width={W} height={H - 20} fill={shade(color, 0.3)} />
        {[...Array(Math.round(W / 100))].map((_, i) => (
          <g key={i}>
            <rect x={i * 100 + 14} y={18} width={72} height={18} rx={6} fill={dk} stroke={OUT} strokeWidth={2} />
            <rect x={i * 100 + 12} y={34} width={76} height={44} rx={8} fill={color} stroke={OUT} strokeWidth={2} />
          </g>
        ))}
      </g>
    );
  }
  const stone = variant === 'piedra';
  return (
    <g>
      {softShadow(6, H * 0.25, W - 12, H * 0.5)}
      <rect x={6} y={H * 0.25} width={W - 12} height={H * 0.5} rx={stone ? 10 : 4} fill={stone ? '#cfc8bb' : color} stroke={OUT} strokeWidth={SW} />
      {!stone && [0.38, 0.5, 0.62].map((k) => <line key={k} x1={10} y1={H * k} x2={W - 10} y2={H * k} stroke={dk} strokeWidth={1.6} />)}
    </g>
  );
};

export const wheelchair: ObjRenderer = ({ W, H, color }) => (
  <g>
    {softShadow(18, 18, W - 36, H - 30)}
    <circle cx={22} cy={H / 2 + 6} r={20} fill="none" stroke={OUT} strokeWidth={5} />
    <circle cx={W - 22} cy={H / 2 + 6} r={20} fill="none" stroke={OUT} strokeWidth={5} />
    <rect x={26} y={18} width={W - 52} height={18} rx={5} fill={shade(color, 0.2)} stroke={OUT} strokeWidth={SW} />
    <rect x={24} y={34} width={W - 48} height={44} rx={8} fill={color} stroke={OUT} strokeWidth={SW} />
  </g>
);

export const lounger: ObjRenderer = ({ W, H, color }) => (
  <g>
    {softShadow(18, 10, W - 36, H - 20)}
    <rect x={18} y={10} width={W - 36} height={H - 20} rx={10} fill={color} stroke={OUT} strokeWidth={SW} />
    <rect x={18} y={10} width={W - 36} height={H * 0.3} rx={10} fill={shade(color, 0.1)} stroke={OUT} strokeWidth={SW} />
    {[...Array(Math.round(H / 25))].map((_, i) => (
      <line key={i} x1={24} y1={H * 0.3 + 10 + i * 22} x2={W - 24} y2={H * 0.3 + 10 + i * 22} stroke={shade(color, 0.2)} strokeWidth={2} />
    ))}
  </g>
);

export const seat: ObjRenderer = ({ W, H, color }) => (
  <g>
    {softShadow(16, 16, W - 32, H - 30)}
    <rect x={16} y={14} width={W - 32} height={26} rx={10} fill={shade(color, 0.2)} stroke={OUT} strokeWidth={SW} />
    <rect x={18} y={38} width={W - 36} height={40} rx={8} fill={color} stroke={OUT} strokeWidth={SW} />
    <rect x={10} y={36} width={10} height={40} rx={4} fill="#3b3b3b" />
    <rect x={W - 20} y={36} width={10} height={40} rx={4} fill="#3b3b3b" />
  </g>
);

export const toilet: ObjRenderer = ({ W, H }) => (
  <g>
    {softShadow(24, 12, W - 48, H - 24)}
    <rect x={26} y={10} width={W - 52} height={24} rx={6} fill="#ffffff" stroke={OUT} strokeWidth={SW} />
    <ellipse cx={W / 2} cy={H / 2 + 12} rx={(W - 52) / 2} ry={30} fill="#ffffff" stroke={OUT} strokeWidth={SW} />
    <ellipse cx={W / 2} cy={H / 2 + 14} rx={(W - 52) / 2 - 9} ry={19} fill="#dceef5" stroke={OUT} strokeWidth={2} />
  </g>
);

/* ------------------------------------------------------------------- camas */
export const bed: ObjRenderer = ({ W, H, color }) => {
  const m = 8;
  const double = W >= 180;
  return (
    <g>
      {softShadow(m, m, W - 2 * m, H - 2 * m, 10)}
      <rect x={m} y={m} width={W - 2 * m} height={H - 2 * m} rx={10} fill="#eef2f4" stroke={OUT} strokeWidth={SW} />
      {double ? (
        <>
          <rect x={m + 10} y={m + 8} width={(W - 2 * m) / 2 - 16} height={H * 0.17} rx={9} fill="#f9fbfc" stroke={OUT} strokeWidth={2.4} />
          <rect x={W / 2 + 6} y={m + 8} width={(W - 2 * m) / 2 - 16} height={H * 0.17} rx={9} fill="#f9fbfc" stroke={OUT} strokeWidth={2.4} />
        </>
      ) : (
        <rect x={m + 10} y={m + 8} width={W - 2 * m - 20} height={H * 0.16} rx={9} fill="#f9fbfc" stroke={OUT} strokeWidth={2.4} />
      )}
      <rect x={m} y={H * 0.36} width={W - 2 * m} height={H - H * 0.36 - m} rx={8} fill={color} stroke={OUT} strokeWidth={SW} />
      <rect x={m} y={H * 0.36} width={W - 2 * m} height={14} rx={6} fill={shade(color, -0.25)} stroke={OUT} strokeWidth={2} />
    </g>
  );
};

export const carpet: ObjRenderer = ({ W, H, color, variant }) => {
  const m = 10;
  const dk = shade(color, 0.22);
  if (variant === 'redonda') {
    return (
      <g>
        <ellipse cx={W / 2} cy={H / 2} rx={W / 2 - m} ry={H / 2 - m} fill={color} stroke={dk} strokeWidth={4} />
        <ellipse cx={W / 2} cy={H / 2} rx={W / 2 - m - 12} ry={H / 2 - m - 12} fill="none" stroke={dk} strokeWidth={2.5} />
      </g>
    );
  }
  return (
    <g>
      <rect x={m} y={m} width={W - 2 * m} height={H - 2 * m} fill={color} stroke={dk} strokeWidth={4} />
      <rect x={m + 10} y={m + 10} width={W - 2 * m - 20} height={H - 2 * m - 20} fill="none" stroke={dk} strokeWidth={2.5} />
      {variant === 'persa' && (
        <g>
          <path d={`M${W / 2},${m + 22} L${W - m - 22},${H / 2} L${W / 2},${H - m - 22} L${m + 22},${H / 2} Z`} fill={shade(color, 0.12)} stroke={dk} strokeWidth={2} />
          <circle cx={W / 2} cy={H / 2} r={8} fill={dk} />
        </g>
      )}
    </g>
  );
};

export const towel: ObjRenderer = ({ W, H, color }) => (
  <g>
    <rect x={14} y={8} width={W - 28} height={H - 16} rx={4} fill="#ffffff" stroke={shade(color, 0.2)} strokeWidth={2} />
    {[...Array(Math.round(H / 24))].map((_, i) => (
      <rect key={i} x={14} y={14 + i * 24} width={W - 28} height={10} fill={color} />
    ))}
  </g>
);

export const hammock: ObjRenderer = ({ W, H, color }) => (
  <g>
    <line x1={W / 2} y1={4} x2={W / 2} y2={H - 4} stroke="#7a5a3a" strokeWidth={3} />
    <path d={`M${W / 2 - 22},${18} Q${W / 2 - 34},${H / 2} ${W / 2 - 22},${H - 18} L${W / 2 + 22},${H - 18} Q${W / 2 + 34},${H / 2} ${W / 2 + 22},${18} Z`} fill={color} stroke={OUT} strokeWidth={SW} />
    {[...Array(4)].map((_, i) => (
      <line key={i} x1={W / 2 - 22} y1={30 + i * ((H - 60) / 3)} x2={W / 2 + 22} y2={30 + i * ((H - 60) / 3)} stroke={shade(color, 0.25)} strokeWidth={3} />
    ))}
  </g>
);

/* ------------------------------------------------------------------- mesas */
export const table: ObjRenderer = ({ W, H, color, variant }) => {
  const m = 10;
  const dk = shade(color, 0.22);
  const legs = (y: number) => (
    <g>
      <rect x={m + 6} y={y} width={8} height={12} fill={dk} stroke={OUT} strokeWidth={2} />
      <rect x={W - m - 14} y={y} width={8} height={12} fill={dk} stroke={OUT} strokeWidth={2} />
    </g>
  );
  switch (variant) {
    case 'redonda':
    case 'bingo':
    case 'trofeo':
      return (
        <g>
          <ellipse cx={W / 2 + 3} cy={H / 2 + 6} rx={W / 2 - m} ry={H / 2 - m} fill="#000" opacity={0.13} />
          <ellipse cx={W / 2} cy={H / 2} rx={W / 2 - m} ry={H / 2 - m} fill={color} stroke={OUT} strokeWidth={SW} />
          <ellipse cx={W / 2} cy={H / 2} rx={W / 2 - m - 8} ry={H / 2 - m - 8} fill="none" stroke={shade(color, -0.25)} strokeWidth={2} />
          {(variant === 'bingo' || variant === 'trofeo') && (
            <g>
              <rect x={W / 2 - 24} y={H / 2 - 16} width={22} height={14} fill="#fff8e1" stroke="#c9a227" strokeWidth={1.4} />
              <rect x={W / 2 + 2} y={H / 2 + 2} width={22} height={14} fill="#fff8e1" stroke="#c9a227" strokeWidth={1.4} />
            </g>
          )}
          {variant === 'trofeo' && (
            <g>
              {/* Pivote metálico de «línea» y dos copas */}
              <rect x={W / 2 + 4} y={H / 2 - 30} width={10} height={26} rx={2} fill="#c9ccd1" stroke={OUT} strokeWidth={1.6} />
              <ellipse cx={W / 2 + 9} cy={H / 2 - 30} rx={9} ry={4} fill="#e6e8eb" stroke={OUT} strokeWidth={1.4} />
              <ellipse cx={W / 2 + 9} cy={H / 2 - 4} rx={11} ry={4} fill="#a9adb3" stroke={OUT} strokeWidth={1.4} />
              <circle cx={W / 2 - 18} cy={H / 2 + 14} r={7} fill="#e8f7e0" stroke={OUT} strokeWidth={1.4} />
              <circle cx={W / 2 - 4} cy={H / 2 + 20} r={7} fill="#8b1e2d" stroke={OUT} strokeWidth={1.4} />
            </g>
          )}
        </g>
      );
    case 'larga':
    case 'mantel': {
      const cloth = variant === 'mantel';
      return (
        <g>
          {softShadow(m, m, W - 2 * m, H - 2 * m - 10)}
          <rect x={m} y={m} width={W - 2 * m} height={H - 2 * m - 10} rx={4} fill={cloth ? '#ffffff' : color} stroke={OUT} strokeWidth={SW} />
          {cloth && <rect x={m + 6} y={m + 6} width={W - 2 * m - 12} height={H - 2 * m - 22} rx={3} fill="none" stroke={color} strokeWidth={3} strokeDasharray="8 5" />}
          <rect x={m} y={H - m - 12} width={W - 2 * m} height={8} fill={cloth ? '#e8e3da' : dk} stroke={OUT} strokeWidth={2} />
          {cloth &&
            [...Array(Math.max(1, Math.round(W / 100)))].map((_, i) =>
              [...Array(Math.max(1, Math.round(H / 100)))].map((__, j) => (
                <g key={`${i}-${j}`}>
                  <circle cx={i * 100 + 50} cy={j * 100 + 44} r={11} fill="#f7f7f7" stroke="#cfcfcf" strokeWidth={1.5} />
                  <circle cx={i * 100 + 50} cy={j * 100 + 44} r={6} fill="#eae6df" />
                </g>
              )),
            )}
        </g>
      );
    }
    case 'plastico':
      return (
        <g>
          {softShadow(m, m, W - 2 * m, H - 2 * m)}
          <rect x={m} y={m} width={W - 2 * m} height={H - 2 * m - 8} rx={6} fill="#f6f6f4" stroke={OUT} strokeWidth={SW} />
          <rect x={m} y={H - m - 10} width={W - 2 * m} height={6} fill="#dcdcd8" stroke={OUT} strokeWidth={1.5} />
        </g>
      );
    case 'ajedrez': {
      const size = Math.min(W, H) - 2 * m;
      const x0 = (W - size) / 2;
      const y0 = (H - size) / 2;
      const cell = size / 4;
      return (
        <g>
          {softShadow(x0, y0, size, size, 3)}
          <rect x={x0} y={y0} width={size} height={size} fill="#f4efe4" stroke={OUT} strokeWidth={SW} />
          {[...Array(16)].map((_, i) =>
            (Math.floor(i / 4) + (i % 4)) % 2 ? <rect key={i} x={x0 + (i % 4) * cell} y={y0 + Math.floor(i / 4) * cell} width={cell} height={cell} fill="#2b2b2b" /> : null,
          )}
          <rect x={x0} y={y0} width={size} height={size} fill="none" stroke={OUT} strokeWidth={SW} />
        </g>
      );
    }
    case 'negra':
      return (
        <g>
          {softShadow(m, m, W - 2 * m, H - 2 * m)}
          <rect x={m} y={m} width={W - 2 * m} height={H - 2 * m - 10} rx={3} fill="#1e1c22" stroke="#0e0d10" strokeWidth={SW} />
          <rect x={m + 4} y={m + 4} width={W - 2 * m - 8} height={4} fill="#3a3640" />
          <rect x={m} y={H - m - 12} width={W - 2 * m} height={8} fill="#111" />
        </g>
      );
    case 'platos': {
      const pl = ['#e53935', '#fdd835', '#43a047', '#1e88e5', '#ab47bc', '#fb8c00', '#e53935', '#1e88e5'];
      return (
        <g>
          {softShadow(m, m, W - 2 * m, H - 2 * m)}
          <rect x={m} y={m} width={W - 2 * m} height={H - 2 * m - 12} rx={3} fill={color} stroke={OUT} strokeWidth={SW} />
          <rect x={m} y={H - m - 14} width={W - 2 * m} height={8} fill={dk} stroke={OUT} strokeWidth={2} />
          {pl.map((c, i) => (
            <ellipse key={i} cx={W / 2} cy={H / 2 - 4 - i * 4} rx={20} ry={7} fill={c} stroke={OUT} strokeWidth={1.4} />
          ))}
        </g>
      );
    }
    case 'alta':
      return (
        <g>
          <circle cx={W / 2 + 3} cy={H / 2 + 6} r={26} fill="#000" opacity={0.13} />
          <circle cx={W / 2} cy={H / 2} r={26} fill={color} stroke={OUT} strokeWidth={SW} />
          <circle cx={W / 2} cy={H / 2} r={6} fill={dk} />
        </g>
      );
    case 'cristal':
      return (
        <g>
          <rect x={m} y={m} width={W - 2 * m} height={H - 2 * m} rx={4} fill="#d8eef5" fillOpacity={0.7} stroke={OUT} strokeWidth={SW} />
          <path d={`M${m + 10},${m + 30} L${m + 30},${m + 10}`} stroke="#ffffff" strokeWidth={4} />
        </g>
      );
    default:
      return (
        <g>
          {softShadow(m, m, W - 2 * m, H - 2 * m)}
          <rect x={m} y={m} width={W - 2 * m} height={H - 2 * m - 12} rx={3} fill={color} stroke={OUT} strokeWidth={SW} />
          <rect x={m} y={H - m - 14} width={W - 2 * m} height={8} fill={dk} stroke={OUT} strokeWidth={2} />
          {legs(H - m - 7)}
        </g>
      );
  }
};

export const desk: ObjRenderer = ({ W, H, color }) => (
  <g>
    {softShadow(8, 12, W - 16, H - 24)}
    <rect x={8} y={12} width={W - 16} height={H - 30} rx={3} fill={color} stroke={OUT} strokeWidth={SW} />
    <rect x={8} y={H - 20} width={W - 16} height={8} fill={shade(color, 0.22)} stroke={OUT} strokeWidth={2} />
    <rect x={W / 2 - 20} y={22} width={40} height={24} rx={2} fill="#3b3b44" stroke={OUT} strokeWidth={2} />
    <rect x={20} y={30} width={22} height={28} fill="#ffffff" stroke="#bbb" strokeWidth={1} transform={`rotate(-8 30 44)`} />
  </g>
);

export const counter: ObjRenderer = ({ W, H, color, variant }) => {
  const dk = shade(color, 0.2);
  const neon = variant === 'neon';
  return (
    <g>
      {softShadow(4, 8, W - 8, H - 16)}
      <rect x={4} y={8} width={W - 8} height={H - 16} rx={4} fill={color} stroke={OUT} strokeWidth={SW} />
      <rect x={4} y={8} width={W - 8} height={14} rx={4} fill={neon ? '#ff3b6b' : shade(color, -0.2)} stroke={OUT} strokeWidth={2} />
      {variant === 'sushi' &&
        [...Array(Math.round(W / 50))].map((_, i) => (
          <g key={i}>
            <rect x={14 + i * 50} y={H / 2 - 4} width={30} height={14} rx={4} fill="#fafafa" stroke="#ccc" />
            <circle cx={22 + i * 50} cy={H / 2 + 3} r={4} fill="#f4845f" />
            <circle cx={34 + i * 50} cy={H / 2 + 3} r={4} fill="#1f3b2b" />
          </g>
        ))}
      {variant === 'bar' &&
        [...Array(Math.round(W / 60))].map((_, i) => (
          <g key={i}>
            <rect x={18 + i * 60} y={H / 2 - 6} width={10} height={18} rx={2} fill="#9ccc65" fillOpacity={0.8} stroke={OUT} strokeWidth={1.4} />
            <rect x={36 + i * 60} y={H / 2 - 2} width={8} height={14} rx={2} fill="#f6c453" fillOpacity={0.9} stroke={OUT} strokeWidth={1.4} />
          </g>
        ))}
      <line x1={8} y1={H - 14} x2={W - 8} y2={H - 14} stroke={dk} strokeWidth={2} />
    </g>
  );
};

export const reception: ObjRenderer = ({ W, H, color }) => (
  <g>
    {softShadow(6, 18, W - 12, H - 34)}
    <path d={`M6,${H - 16} L6,30 Q${W / 2},10 ${W - 6},30 L${W - 6},${H - 16} Z`} fill={color} stroke={OUT} strokeWidth={SW} />
    <path d={`M14,36 Q${W / 2},18 ${W - 14},36`} stroke={shade(color, -0.25)} strokeWidth={6} fill="none" />
    <circle cx={W - 30} cy={H / 2 + 6} r={6} fill="#f2c94c" stroke={OUT} strokeWidth={1.5} />
  </g>
);

export const stall: ObjRenderer = ({ W, H, color, variant }) => {
  const stripes = Math.round(W / 22);
  const goods: Record<string, string[]> = {
    flores: ['#f06292', '#ffffff', '#ffb74d', '#ba68c8'],
    comida: ['#ff8a65', '#ffd54f', '#81c784', '#a1887f'],
    ropa: ['#64b5f6', '#e57373', '#fff176', '#4db6ac'],
    helados: ['#f8bbd0', '#c5e1a5', '#fff3c4', '#d7ccc8'],
    aperol: ['#ff7043', '#ffab40', '#ff7043', '#ffd180'],
  };
  const g = goods[variant ?? ''] ?? goods.comida;
  return (
    <g>
      {softShadow(6, 20, W - 12, H - 26)}
      <rect x={10} y={H * 0.36} width={W - 20} height={H * 0.56} rx={4} fill="#c9a36b" stroke={OUT} strokeWidth={SW} />
      {[...Array(Math.round(W / 26))].map((_, i) => (
        <circle key={i} cx={22 + i * 26} cy={H * 0.62} r={9} fill={g[i % g.length]} stroke={OUT} strokeWidth={1.4} />
      ))}
      <path d={`M4,${H * 0.36} L${W - 4},${H * 0.36} L${W - 10},8 L10,8 Z`} fill="#ffffff" stroke={OUT} strokeWidth={SW} />
      {[...Array(stripes)].map((_, i) => (i % 2 ? null : <path key={i} d={`M${10 + (i * (W - 20)) / stripes},8 L${4 + (i * (W - 8)) / stripes},${H * 0.36} L${4 + ((i + 1) * (W - 8)) / stripes},${H * 0.36} L${10 + ((i + 1) * (W - 20)) / stripes},8 Z`} fill={color} />))}
      <path d={`M4,${H * 0.36} L${W - 4},${H * 0.36}`} stroke={OUT} strokeWidth={SW} />
    </g>
  );
};

/* ------------------------------------------------------------------- salón */
export const tv: ObjRenderer = ({ W, H, color }) => {
  const cx = W / 2;
  const cy = H / 2;
  return (
    <g>
      {softShadow(cx - 32, cy - 24, 64, 52, 6)}
      <rect x={cx - 34} y={cy + 12} width={68} height={16} rx={4} fill={shade(color, 0.25)} stroke={OUT} strokeWidth={SW} />
      <rect x={cx - 32} y={cy - 28} width={64} height={44} rx={7} fill={color} stroke={OUT} strokeWidth={SW} />
      <rect x={cx - 24} y={cy - 21} width={48} height={30} rx={3} fill="#f7f7fb" stroke={OUT} strokeWidth={2} />
      <path d={`M${cx - 4},${cy - 14} l0,14 m0,-14 l8,-2 l0,4`} stroke={OUT} strokeWidth={2.5} fill="none" />
      <circle cx={cx - 7} cy={cy} r={3.6} fill={OUT} />
    </g>
  );
};

export const shelf: ObjRenderer = ({ W, H, color }) => {
  const m = 10;
  const books = ['#e57373', '#64b5f6', '#ffd54f', '#81c784', '#ba68c8', '#ffffff'];
  return (
    <g>
      {softShadow(m, m, W - 2 * m, H - 2 * m, 3)}
      <rect x={m} y={m} width={W - 2 * m} height={H - 2 * m} rx={2} fill={color} stroke={OUT} strokeWidth={SW} />
      {[0, 1, 2].map((row) => (
        <g key={row}>
          <rect x={m + 5} y={m + 5 + row * ((H - 2 * m - 10) / 3)} width={W - 2 * m - 10} height={(H - 2 * m - 10) / 3 - 4} fill={shade(color, 0.3)} />
          {[...Array(Math.floor((W - 2 * m - 12) / 9))].map((_, i) => (
            <rect key={i} x={m + 7 + i * 9} y={m + 9 + row * ((H - 2 * m - 10) / 3) + (i % 3)} width={6} height={(H - 2 * m - 10) / 3 - 10 - (i % 3)} fill={books[(i + row) % books.length]} />
          ))}
        </g>
      ))}
    </g>
  );
};

export const wardrobe: ObjRenderer = ({ W, H, color }) => (
  <g>
    {softShadow(8, 8, W - 16, H - 16, 3)}
    <rect x={8} y={8} width={W - 16} height={H - 16} rx={3} fill={color} stroke={OUT} strokeWidth={SW} />
    <line x1={W / 2} y1={10} x2={W / 2} y2={H - 10} stroke={OUT} strokeWidth={2} />
    <circle cx={W / 2 - 7} cy={H / 2} r={3} fill={OUT} />
    <circle cx={W / 2 + 7} cy={H / 2} r={3} fill={OUT} />
  </g>
);

export const nightstand: ObjRenderer = ({ W, H, color }) => (
  <g>
    {softShadow(20, 20, W - 40, H - 40, 3)}
    <rect x={20} y={20} width={W - 40} height={H - 40} rx={4} fill={color} stroke={OUT} strokeWidth={SW} />
    <circle cx={W / 2} cy={H / 2} r={12} fill="#fff3c4" stroke={OUT} strokeWidth={2} />
  </g>
);

export const box: ObjRenderer = ({ W, H, color }) => (
  <g>
    {softShadow(14, 14, W - 28, H - 28, 3)}
    <rect x={14} y={14} width={W - 28} height={H - 28} rx={2} fill={color} stroke={OUT} strokeWidth={SW} />
    <path d={`M${W / 2},14 L${W / 2},${H - 14}`} stroke={shade(color, 0.25)} strokeWidth={6} />
    <path d={`M14,${H / 2 - 6} L${W - 14},${H / 2 - 6}`} stroke={shade(color, 0.15)} strokeWidth={2} />
  </g>
);

export const lamp: ObjRenderer = ({ W, H, color }) => (
  <g>
    <circle cx={W / 2 + 3} cy={H / 2 + 5} r={24} fill="#000" opacity={0.1} />
    <circle cx={W / 2} cy={H / 2} r={24} fill={color} stroke={OUT} strokeWidth={SW} />
    <circle cx={W / 2} cy={H / 2} r={10} fill="#fffbe6" stroke={OUT} strokeWidth={2} />
  </g>
);

export const piano: ObjRenderer = ({ W, H }) => (
  <g>
    {softShadow(8, 10, W - 16, H - 20)}
    <rect x={8} y={10} width={W - 16} height={H - 20} rx={6} fill="#1f1f22" stroke={OUT} strokeWidth={SW} />
    <rect x={14} y={H - 34} width={W - 28} height={18} fill="#ffffff" stroke={OUT} strokeWidth={1.5} />
    {[...Array(Math.floor((W - 28) / 8))].map((_, i) => (i % 7 === 2 || i % 7 === 6 ? null : <rect key={i} x={18 + i * 8} y={H - 34} width={4} height={10} fill="#111" />))}
  </g>
);

export const fridge: ObjRenderer = ({ W, H, color }) => (
  <g>
    {softShadow(14, 8, W - 28, H - 16, 4)}
    <rect x={14} y={8} width={W - 28} height={H - 16} rx={6} fill={color} stroke={OUT} strokeWidth={SW} />
    <line x1={14} y1={H * 0.38} x2={W - 14} y2={H * 0.38} stroke={OUT} strokeWidth={2} />
    <rect x={W - 30} y={20} width={5} height={14} rx={2} fill={OUT} />
    <rect x={W - 30} y={H * 0.45} width={5} height={20} rx={2} fill={OUT} />
  </g>
);

export const kitchen: ObjRenderer = ({ W, H, color, variant }) => {
  const n = Math.max(1, Math.round(W / 100));
  return (
    <g>
      {softShadow(2, 8, W - 4, H - 16)}
      <rect x={2} y={8} width={W - 4} height={H - 16} rx={3} fill={color} stroke={OUT} strokeWidth={SW} />
      <rect x={2} y={8} width={W - 4} height={12} fill={shade(color, -0.15)} stroke={OUT} strokeWidth={2} />
      {[...Array(n)].map((_, i) => {
        const x = i * 100;
        if (variant === 'fregadero' && i === 0)
          return (
            <g key={i}>
              <rect x={x + 20} y={30} width={60} height={42} rx={8} fill="#cfd8dc" stroke={OUT} strokeWidth={2} />
              <circle cx={x + 50} cy={52} r={4} fill={OUT} />
              <path d={`M${x + 50},26 l0,10`} stroke={OUT} strokeWidth={4} />
            </g>
          );
        if (variant === 'fuegos' && i === 0)
          return (
            <g key={i}>
              <rect x={x + 14} y={28} width={72} height={52} rx={4} fill="#2b2b2b" stroke={OUT} strokeWidth={2} />
              {[
                [32, 42],
                [68, 42],
                [32, 66],
                [68, 66],
              ].map(([cx, cy], k) => (
                <circle key={k} cx={x + cx} cy={cy} r={8} fill="none" stroke="#ef6c00" strokeWidth={2.5} />
              ))}
            </g>
          );
        if (variant === 'horno' && i === 0)
          return (
            <g key={i}>
              <rect x={x + 16} y={30} width={68} height={50} rx={4} fill="#3b3b3b" stroke={OUT} strokeWidth={2} />
              <rect x={x + 24} y={40} width={52} height={30} rx={3} fill="#5d4037" opacity={0.8} />
            </g>
          );
        return <rect key={i} x={x + 18} y={34} width={64} height={40} rx={3} fill={shade(color, 0.04)} stroke={shade(color, 0.15)} strokeWidth={1.5} />;
      })}
    </g>
  );
};

export const island: ObjRenderer = ({ W, H, color }) => (
  <g>
    {softShadow(8, 10, W - 16, H - 20)}
    <rect x={8} y={10} width={W - 16} height={H - 20} rx={6} fill={color} stroke={OUT} strokeWidth={SW} />
    <rect x={W / 2 - 40} y={H / 2 - 22} width={80} height={44} rx={4} fill="#1d1d1f" stroke={OUT} strokeWidth={2} />
    {[
      [-20, -10],
      [20, -10],
      [-20, 10],
      [20, 10],
    ].map(([dx, dy], k) => (
      <circle key={k} cx={W / 2 + dx} cy={H / 2 + dy} r={7} fill="none" stroke="#e05a2a" strokeWidth={2.2} />
    ))}
  </g>
);

export const sink: ObjRenderer = ({ W, H }) => (
  <g>
    {/* Espejo en la pared, encimera y lavabo (vista cenital) */}
    <rect x={16} y={6} width={W - 32} height={9} rx={3} fill="#cfe8f3" stroke={OUT} strokeWidth={2} />
    {softShadow(10, 18, W - 20, H * 0.5, 8)}
    <rect x={10} y={18} width={W - 20} height={H * 0.5} rx={8} fill="#e9e3d8" stroke={OUT} strokeWidth={SW} />
    <rect x={W / 2 - 26} y={28} width={52} height={H * 0.5 - 20} rx={12} fill="#ffffff" stroke={OUT} strokeWidth={2} />
    <ellipse cx={W / 2} cy={28 + (H * 0.5 - 20) / 2 + 2} rx={18} ry={(H * 0.5 - 20) / 2 - 6} fill="#d3ecf6" />
    <circle cx={W / 2} cy={28 + (H * 0.5 - 20) / 2 + 2} r={3} fill={OUT} />
    <rect x={W / 2 - 3} y={18} width={6} height={14} rx={2} fill="#b0bec5" stroke={OUT} strokeWidth={1.5} />
    <circle cx={W / 2 - 12} cy={24} r={3.5} fill="#b0bec5" stroke={OUT} strokeWidth={1.2} />
    <circle cx={W / 2 + 12} cy={24} r={3.5} fill="#b0bec5" stroke={OUT} strokeWidth={1.2} />
  </g>
);

export const shower: ObjRenderer = ({ W, H, color }) => (
  <g>
    <rect x={8} y={8} width={W - 16} height={H - 16} rx={4} fill={color} stroke={OUT} strokeWidth={SW} />
    {[...Array(4)].map((_, i) => [...Array(4)].map((__, j) => <circle key={`${i}${j}`} cx={22 + i * ((W - 44) / 3)} cy={22 + j * ((H - 44) / 3)} r={2} fill={shade(color, 0.3)} />))}
    <circle cx={W / 2} cy={H / 2} r={8} fill="#b0bec5" stroke={OUT} strokeWidth={2} />
  </g>
);

export const bathtub: ObjRenderer = ({ W, H }) => (
  <g>
    {softShadow(10, 8, W - 20, H - 16, 18)}
    <rect x={10} y={8} width={W - 20} height={H - 16} rx={20} fill="#ffffff" stroke={OUT} strokeWidth={SW} />
    <rect x={20} y={18} width={W - 40} height={H - 36} rx={16} fill="#bfe8f5" stroke={OUT} strokeWidth={2} />
    <circle cx={W / 2} cy={H - 34} r={5} fill={OUT} />
  </g>
);

export const locker: ObjRenderer = ({ W, H, color }) => (
  <g>
    <rect x={10} y={8} width={W - 20} height={H - 16} rx={2} fill={color} stroke={OUT} strokeWidth={SW} />
    <line x1={W / 2} y1={8} x2={W / 2} y2={H - 8} stroke={OUT} strokeWidth={2} />
    {[0.3, 0.7].map((k) => (
      <rect key={k} x={W * k - 8} y={22} width={16} height={4} fill={OUT} />
    ))}
    <circle cx={W / 2 - 8} cy={H / 2} r={3} fill="#f2c94c" />
  </g>
);
