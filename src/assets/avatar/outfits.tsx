/**
 * Ropa: torso con hombros y detalles de cada prenda.
 */
import type { ReactNode } from 'react';
import { mix, shade } from '../color';
import type { HeadGeom } from './geometry';
import type { AvatarSpec } from './types';

const f = (n: number) => n.toFixed(2);

/** Silueta de hombros y torso. */
export function torsoPath(g: HeadGeom, extraTop = 0): string {
  const { cx, bodyW, shoulderY } = g;
  const L = cx - bodyW / 2;
  const R = cx + bodyW / 2;
  const y = shoulderY - extraTop;
  const nw = g.neckW / 2 + 10;
  return `M${f(L - 6)},201 L${f(L - 2)},${f(y + 30)} C${f(L)},${f(y + 12)} ${f(L + 10)},${f(y + 6)} ${f(L + 28)},${f(y + 2)} C${f(cx - nw - 16)},${f(y - 3)} ${f(cx - nw)},${f(y - 6)} ${f(cx - nw + 4)},${f(y - 8)} L${f(cx + nw - 4)},${f(y - 8)} C${f(cx + nw)},${f(y - 6)} ${f(cx + nw + 16)},${f(y - 3)} ${f(R - 28)},${f(y + 2)} C${f(R - 10)},${f(y + 6)} ${f(R)},${f(y + 12)} ${f(R + 2)},${f(y + 30)} L${f(R + 6)},201 Z`;
}

/** Escote en U (piel del cuello visible). */
function uNeck(g: HeadGeom, depth: number, widthK = 1): string {
  const { cx } = g;
  const w = (g.neckW / 2 + 6) * widthK;
  const y = g.shoulderY - 6;
  return `M${f(cx - w)},${f(y)} Q${f(cx - w + 2)},${f(y + depth)} ${f(cx)},${f(y + depth)} Q${f(cx + w - 2)},${f(y + depth)} ${f(cx + w)},${f(y)} Z`;
}

function vNeck(g: HeadGeom, depth: number, widthK = 1): string {
  const { cx } = g;
  const w = (g.neckW / 2 + 5) * widthK;
  const y = g.shoulderY - 6;
  return `M${f(cx - w)},${f(y)} L${f(cx)},${f(y + depth)} L${f(cx + w)},${f(y)} Z`;
}

/** Patrón de brocado para fallera/fallero. */
function brocade(id: string, base: string, accent: string): ReactNode {
  return (
    <pattern id={id} width="14" height="14" patternUnits="userSpaceOnUse">
      <rect width="14" height="14" fill={base} />
      <path d="M7,1 C9,4 12,5 13,7 C12,9 9,10 7,13 C5,10 2,9 1,7 C2,5 5,4 7,1 Z" fill={accent} opacity={0.55} />
      <circle cx="7" cy="7" r="1.5" fill={shade(accent, -0.3)} opacity={0.8} />
    </pattern>
  );
}

export function renderOutfit(s: AvatarSpec, g: HeadGeom, uid: string): ReactNode {
  const col = s.outfitColor;
  const acc = s.outfitAccent;
  const dk = shade(col, 0.18);
  const lt = shade(col, -0.18);
  const skinN = shade(s.skin, 0.12);
  const { cx } = g;
  const y = g.shoulderY - 6;
  const torso = torsoPath(g);
  const shadowRight = (
    <path d={torso} fill="#000" opacity={0.06} clipPath={`url(#${uid}-right)`} />
  );
  const plain = (body: string, details: ReactNode, neckSkin?: string) => (
    <g>
      <path d={torso} fill={body} />
      {shadowRight}
      {neckSkin && <path d={neckSkin} fill={skinN} />}
      {details}
    </g>
  );

  switch (s.outfit) {
    case 'tshirt':
      return plain(col, <path d={uNeck(g, 12)} fill="none" stroke={dk} strokeWidth={3} />, uNeck(g, 12));
    case 'vneck':
      return plain(col, <path d={vNeck(g, 22)} fill="none" stroke={dk} strokeWidth={2.4} />, vNeck(g, 22));
    case 'polo':
    case 'poloContrast': {
      const collar = s.outfit === 'poloContrast' ? acc : lt;
      return plain(
        col,
        <g>
          <path d={`M${f(cx - 4)},${f(y + 4)} L${f(cx - 4)},${f(y + 28)} L${f(cx + 4)},${f(y + 28)} L${f(cx + 4)},${f(y + 4)}`} fill={dk} />
          <circle cx={cx} cy={y + 14} r={1.8} fill={shade(col, 0.4)} />
          <circle cx={cx} cy={y + 22} r={1.8} fill={shade(col, 0.4)} />
          <path d={`M${f(cx - g.neckW / 2 - 6)},${f(y - 2)} L${f(cx - g.neckW / 2 - 14)},${f(y + 14)} L${f(cx - 2)},${f(y + 10)} L${f(cx - g.neckW / 2 + 2)},${f(y - 6)} Z`} fill={collar} stroke={shade(collar, 0.2)} strokeWidth={1} />
          <path d={`M${f(cx + g.neckW / 2 + 6)},${f(y - 2)} L${f(cx + g.neckW / 2 + 14)},${f(y + 14)} L${f(cx + 2)},${f(y + 10)} L${f(cx + g.neckW / 2 - 2)},${f(y - 6)} Z`} fill={collar} stroke={shade(collar, 0.2)} strokeWidth={1} />
        </g>,
        vNeck(g, 10, 0.8),
      );
    }
    case 'shirt':
    case 'shirtOpen':
    case 'hawaiian': {
      const open = s.outfit !== 'shirt';
      const body = col;
      return (
        <g>
          {s.outfit === 'hawaiian' && (
            <defs>
              <pattern id={`${uid}-haw`} width="22" height="22" patternUnits="userSpaceOnUse">
                <rect width="22" height="22" fill={col} />
                <circle cx="6" cy="6" r="4" fill={acc} opacity={0.8} />
                <path d="M14,14 q6,-6 6,4 q-6,2 -6,-4 Z" fill={shade(col, 0.3)} />
              </pattern>
            </defs>
          )}
          <path d={torso} fill={s.outfit === 'hawaiian' ? `url(#${uid}-haw)` : body} />
          {shadowRight}
          <path d={vNeck(g, open ? 26 : 12, 0.85)} fill={skinN} />
          {!open && <path d={`M${f(cx)},${f(y + 12)} L${f(cx)},201`} stroke={dk} strokeWidth={1.4} />}
          {!open && [24, 36].map((k) => <circle key={k} cx={cx + 3} cy={y + k} r={1.6} fill={dk} />)}
          <path d={`M${f(cx - g.neckW / 2 - 4)},${f(y - 4)} L${f(cx - g.neckW / 2 - 12)},${f(y + 16)} L${f(cx - 1)},${f(y + (open ? 24 : 12))} Z`} fill={lt} stroke={dk} strokeWidth={1} />
          <path d={`M${f(cx + g.neckW / 2 + 4)},${f(y - 4)} L${f(cx + g.neckW / 2 + 12)},${f(y + 16)} L${f(cx + 1)},${f(y + (open ? 24 : 12))} Z`} fill={lt} stroke={dk} strokeWidth={1} />
        </g>
      );
    }
    case 'suit':
    case 'tux':
    case 'groom':
    case 'blazer': {
      const jacket = s.outfit === 'tux' ? '#1d1d22' : col;
      const shirt = s.outfit === 'blazer' ? acc : '#ffffff';
      const lap = shade(jacket, s.outfit === 'tux' ? -0.12 : 0.15);
      const tieCol = s.outfit === 'suit' || s.outfit === 'groom' ? acc : '#111';
      return (
        <g>
          <path d={torso} fill={jacket} />
          {shadowRight}
          <path d={`M${f(cx - g.neckW / 2 - 8)},${f(y - 4)} L${f(cx)},${f(y + 46)} L${f(cx + g.neckW / 2 + 8)},${f(y - 4)} Z`} fill={shirt} />
          {s.outfit === 'blazer' ? null : (
            <>
              <path d={`M${f(cx - g.neckW / 2 - 2)},${f(y - 4)} L${f(cx - g.neckW / 2 - 8)},${f(y + 6)} L${f(cx - 2)},${f(y + 10)} Z`} fill="#ffffff" stroke="#d9d9d9" strokeWidth={0.8} />
              <path d={`M${f(cx + g.neckW / 2 + 2)},${f(y - 4)} L${f(cx + g.neckW / 2 + 8)},${f(y + 6)} L${f(cx + 2)},${f(y + 10)} Z`} fill="#ffffff" stroke="#d9d9d9" strokeWidth={0.8} />
            </>
          )}
          {s.outfit === 'tux' ? (
            <path d={`M${f(cx - 11)},${f(y + 2)} L${f(cx - 11)},${f(y + 14)} L${f(cx)},${f(y + 9)} L${f(cx + 11)},${f(y + 14)} L${f(cx + 11)},${f(y + 2)} L${f(cx)},${f(y + 7)} Z`} fill={tieCol} />
          ) : s.outfit === 'blazer' ? (
            <path d={uNeck(g, 10, 0.8)} fill={shade(s.skin, 0.12)} />
          ) : (
            <path d={`M${f(cx - 4)},${f(y + 7)} L${f(cx + 4)},${f(y + 7)} L${f(cx + 6)},${f(y + 40)} L${f(cx)},${f(y + 48)} L${f(cx - 6)},${f(y + 40)} Z`} fill={tieCol} />
          )}
          <path d={`M${f(cx - g.neckW / 2 - 10)},${f(y - 4)} L${f(cx - 4)},${f(y + 56)} L${f(cx - 16)},${f(y + 22)} L${f(cx - g.neckW / 2 - 22)},${f(y + 10)} Z`} fill={lap} />
          <path d={`M${f(cx + g.neckW / 2 + 10)},${f(y - 4)} L${f(cx + 4)},${f(y + 56)} L${f(cx + 16)},${f(y + 22)} L${f(cx + g.neckW / 2 + 22)},${f(y + 10)} Z`} fill={lap} />
          {s.outfit === 'groom' && (
            <g>
              {[0, 72, 144, 216, 288].map((a) => (
                <circle key={a} cx={cx - 36 + 4 * Math.cos((a * Math.PI) / 180)} cy={y + 30 + 4 * Math.sin((a * Math.PI) / 180)} r={3.4} fill="#ffffff" stroke="#e7d7c1" strokeWidth={0.6} />
              ))}
              <circle cx={cx - 36} cy={y + 30} r={2} fill="#f2c94c" />
            </g>
          )}
        </g>
      );
    }
    case 'sweater':
      return plain(
        col,
        <g>
          <path d={uNeck(g, 14, 1.05)} fill="none" stroke={dk} strokeWidth={6} />
          {[...Array(8)].map((_, i) => (
            <line key={i} x1={cx - 70 + i * 20} y1={186} x2={cx - 70 + i * 20} y2={201} stroke={dk} strokeWidth={1} opacity={0.35} />
          ))}
        </g>,
        uNeck(g, 14, 1.05),
      );
    case 'turtleneck':
      return (
        <g>
          <path d={torso} fill={col} />
          {shadowRight}
          <rect x={cx - g.neckW / 2 - 3} y={g.chin + 2} width={g.neckW + 6} height={y - g.chin + 6} rx={5} fill={lt} />
          {[0.2, 0.45, 0.7].map((k) => (
            <line key={k} x1={cx - g.neckW / 2 - 2} y1={g.chin + 4 + (y - g.chin) * k} x2={cx + g.neckW / 2 + 2} y2={g.chin + 4 + (y - g.chin) * k} stroke={dk} strokeWidth={1} opacity={0.5} />
          ))}
        </g>
      );
    case 'highNeck': {
      // Top sin mangas de cuello alto (hombros al aire).
      const R = cx + g.bodyW / 2;
      const L = cx - g.bodyW / 2;
      return (
        <g>
          <path d={torso} fill={shade(s.skin, 0.04)} />
          <path d={torso} fill={shade(s.skin, 0.12)} clipPath={`url(#${uid}-right)`} opacity={0.6} />
          <path d={`M${f(cx - g.neckW / 2 - 4)},${f(g.chin + 10)} L${f(cx + g.neckW / 2 + 4)},${f(g.chin + 10)} L${f(cx + g.neckW / 2 + 8)},${f(y + 4)} Q${f(R - 40)},${f(y + 10)} ${f(R - 30)},201 L${f(L + 30)},201 Q${f(L + 40)},${f(y + 10)} ${f(cx - g.neckW / 2 - 8)},${f(y + 4)} Z`} fill={col} />
          <path d={`M${f(cx - g.neckW / 2 - 4)},${f(g.chin + 10)} L${f(cx + g.neckW / 2 + 4)},${f(g.chin + 10)}`} stroke={dk} strokeWidth={2} />
          <path d={`M${f(cx + 6)},${f(g.chin + 14)} L${f(cx + 10)},${f(201)}`} stroke={dk} strokeWidth={1} opacity={0.4} />
        </g>
      );
    }
    case 'hoodie':
      return (
        <g>
          <path d={`M${f(cx - g.neckW / 2 - 22)},${f(y + 10)} Q${f(cx - g.neckW / 2 - 26)},${f(g.chin - 10)} ${f(cx)},${f(g.chin - 2)} Q${f(cx + g.neckW / 2 + 26)},${f(g.chin - 10)} ${f(cx + g.neckW / 2 + 22)},${f(y + 10)} Z`} fill={dk} />
          <path d={torso} fill={col} />
          {shadowRight}
          <path d={uNeck(g, 14, 1.15)} fill={skinN} />
          <path d={uNeck(g, 14, 1.15)} fill="none" stroke={dk} strokeWidth={5} />
          <path d={`M${f(cx - 8)},${f(y + 12)} l-1,26 M${f(cx + 8)},${f(y + 12)} l1,26`} stroke={acc} strokeWidth={2.4} strokeLinecap="round" />
        </g>
      );
    case 'jacket':
    case 'leather':
    case 'coat': {
      const j = s.outfit === 'leather' ? '#2b2522' : col;
      const inner = s.outfit === 'coat' ? acc : acc;
      return (
        <g>
          <path d={torso} fill={j} />
          {shadowRight}
          <path d={`M${f(cx - g.neckW / 2 - 6)},${f(y - 4)} L${f(cx - 8)},201 L${f(cx + 8)},201 L${f(cx + g.neckW / 2 + 6)},${f(y - 4)} Z`} fill={inner} />
          <path d={uNeck(g, 10, 0.9)} fill={skinN} />
          <path d={`M${f(cx - g.neckW / 2 - 8)},${f(y - 6)} L${f(cx - g.neckW / 2 - 24)},${f(y + 18)} L${f(cx - 10)},${f(y + 40)} L${f(cx - 10)},201`} stroke={shade(j, -0.25)} strokeWidth={3} fill="none" />
          <path d={`M${f(cx + g.neckW / 2 + 8)},${f(y - 6)} L${f(cx + g.neckW / 2 + 24)},${f(y + 18)} L${f(cx + 10)},${f(y + 40)} L${f(cx + 10)},201`} stroke={shade(j, -0.25)} strokeWidth={3} fill="none" />
          {s.outfit === 'leather' && <path d={`M${f(cx + 12)},${f(y + 44)} l0,40`} stroke="#9e9e9e" strokeWidth={2} />}
        </g>
      );
    }
    case 'tank':
    case 'bareShoulders':
    case 'bikini':
    case 'dress':
    case 'strapless':
    case 'bride': {
      const skinBody = shade(s.skin, 0.05);
      const isBride = s.outfit === 'bride';
      const dress = isBride ? '#fbf8f2' : col;
      const L = cx - g.bodyW / 2;
      const R = cx + g.bodyW / 2;
      const top = y + 20;
      return (
        <g>
          <path d={torso} fill={skinBody} />
          <path d={torso} fill={shade(s.skin, 0.14)} clipPath={`url(#${uid}-right)`} opacity={0.5} />
          {s.outfit === 'tank' && (
            <path d={`M${f(cx - 36)},${f(y - 2)} L${f(cx - 26)},${f(y - 2)} Q${f(cx - 20)},${f(y + 26)} ${f(cx)},${f(y + 28)} Q${f(cx + 20)},${f(y + 26)} ${f(cx + 26)},${f(y - 2)} L${f(cx + 36)},${f(y - 2)} Q${f(cx + 44)},${f(y + 30)} ${f(R - 10)},201 L${f(L + 10)},201 Q${f(cx - 44)},${f(y + 30)} ${f(cx - 36)},${f(y - 2)} Z`} fill={col} />
          )}
          {s.outfit === 'bikini' && (
            <g fill={col}>
              <path d={`M${f(cx - 6)},${f(top + 10)} L${f(cx - 30)},${f(top + 14)} L${f(cx - 26)},${f(top - 8)} Z`} />
              <path d={`M${f(cx + 6)},${f(top + 10)} L${f(cx + 30)},${f(top + 14)} L${f(cx + 26)},${f(top - 8)} Z`} />
              <path d={`M${f(cx - 26)},${f(top - 8)} L${f(cx - g.neckW / 2)},${f(g.chin + 14)} M${f(cx + 26)},${f(top - 8)} L${f(cx + g.neckW / 2)},${f(g.chin + 14)}`} stroke={col} strokeWidth={2} />
            </g>
          )}
          {(s.outfit === 'dress' || s.outfit === 'strapless' || isBride) && (
            <g>
              <path d={`M${f(L + 8)},201 L${f(L + 22)},${f(top + 4)} Q${f(cx - 20)},${f(top - 6)} ${f(cx)},${f(top + 8)} Q${f(cx + 20)},${f(top - 6)} ${f(R - 22)},${f(top + 4)} L${f(R - 8)},201 Z`} fill={dress} />
              {s.outfit === 'dress' && (
                <path d={`M${f(cx - 34)},${f(top + 2)} L${f(cx - 30)},${f(y - 2)} M${f(cx + 34)},${f(top + 2)} L${f(cx + 30)},${f(y - 2)}`} stroke={dress} strokeWidth={4} />
              )}
              {isBride && (
                <g>
                  <path d={`M${f(L + 22)},${f(top + 4)} Q${f(cx - 20)},${f(top - 6)} ${f(cx)},${f(top + 8)} Q${f(cx + 20)},${f(top - 6)} ${f(R - 22)},${f(top + 4)}`} stroke="#e9dfcf" strokeWidth={2} fill="none" />
                  <path d={`M${f(cx - g.neckW / 2 - 14)},${f(y - 2)} Q${f(cx)},${f(y + 4)} ${f(cx + g.neckW / 2 + 14)},${f(y - 2)} L${f(R - 22)},${f(top + 4)} Q${f(cx + 20)},${f(top - 6)} ${f(cx)},${f(top + 8)} Q${f(cx - 20)},${f(top - 6)} ${f(L + 22)},${f(top + 4)} Z`} fill="#ffffff" opacity={0.5} />
                  {[...Array(10)].map((_, i) => (
                    <circle key={i} cx={L + 30 + i * ((R - L - 60) / 9)} cy={top + 18 + (i % 2) * 6} r={2.2} fill="none" stroke="#e9dfcf" strokeWidth={1} />
                  ))}
                </g>
              )}
            </g>
          )}
        </g>
      );
    }
    case 'blouse':
      return plain(
        col,
        <g>
          <path d={uNeck(g, 12)} fill="none" stroke={lt} strokeWidth={6} strokeDasharray="5 3" />
        </g>,
        uNeck(g, 12),
      );
    case 'apron':
      return plain(
        col,
        <g>
          <path d={`M${f(cx - 28)},${f(y + 18)} L${f(cx + 28)},${f(y + 18)} L${f(cx + 34)},201 L${f(cx - 34)},201 Z`} fill={acc} />
          <path d={`M${f(cx - 28)},${f(y + 18)} L${f(cx - g.neckW / 2 - 2)},${f(y - 4)} M${f(cx + 28)},${f(y + 18)} L${f(cx + g.neckW / 2 + 2)},${f(y - 4)}`} stroke={acc} strokeWidth={4} />
          <rect x={cx - 10} y={y + 26} width={20} height={10} rx={2} fill={shade(acc, 0.12)} />
        </g>,
        uNeck(g, 12),
      );
    case 'chefJacket':
      return (
        <g>
          <path d={torso} fill="#fbfbfb" />
          {shadowRight}
          <rect x={cx - g.neckW / 2 - 2} y={g.chin + 10} width={g.neckW + 4} height={y - g.chin} rx={3} fill="#f0f0f0" stroke="#ddd" />
          <path d={`M${f(cx - g.neckW / 2 - 2)},${f(y + 6)} L${f(cx + 26)},${f(y + 14)} L${f(cx + 26)},201`} stroke="#ddd" strokeWidth={2} fill="none" />
          {[16, 32, 48].map((k) => (
            <g key={k}>
              <circle cx={cx - 12} cy={y + k + 4} r={2.2} fill={acc} />
              <circle cx={cx + 16} cy={y + k + 4} r={2.2} fill={acc} />
            </g>
          ))}
        </g>
      );
    case 'scrubs':
      return plain(col, <path d={vNeck(g, 26)} fill="none" stroke={dk} strokeWidth={3} />, vNeck(g, 26));
    case 'wetsuit':
      return plain('#1f2329', <path d={`M${f(cx)},${f(y + 6)} L${f(cx)},201`} stroke="#5d6470" strokeWidth={2} />, uNeck(g, 6, 0.8));
    case 'sport':
      return plain(
        col,
        <g>
          <path d={`M${f(cx - g.bodyW / 2 + 6)},${f(y + 30)} L${f(cx + g.bodyW / 2 - 6)},${f(y + 30)}`} stroke={acc} strokeWidth={6} />
          <text x={cx + 26} y={y + 26} fontSize={16} fontWeight={700} fill={acc} fontFamily="Outfit, sans-serif">
            10
          </text>
        </g>,
        vNeck(g, 14),
      );
    case 'band':
      return plain(
        col,
        <g>
          <circle cx={cx} cy={y + 36} r={14} fill="none" stroke={acc} strokeWidth={3} />
          <path d={`M${f(cx - 8)},${f(y + 40)} l8,-12 l8,12`} stroke={acc} strokeWidth={3} fill="none" />
        </g>,
        uNeck(g, 12),
      );
    case 'robe':
      return (
        <g>
          <path d={torso} fill="#fbfbfb" />
          {shadowRight}
          <path d={vNeck(g, 40, 1.1)} fill={shade(s.skin, 0.06)} />
          <path d={`M${f(cx - g.neckW / 2 - 12)},${f(y - 8)} L${f(cx + 4)},${f(y + 46)} M${f(cx + g.neckW / 2 + 12)},${f(y - 8)} L${f(cx - 4)},${f(y + 46)}`} stroke="#e3e3e3" strokeWidth={8} />
        </g>
      );
    case 'priest':
      return plain('#1f1f24', <rect x={cx - 8} y={y + 2} width={16} height={6} rx={1} fill="#ffffff" />, uNeck(g, 8, 0.8));
    case 'fallero': {
      const pid = `${uid}-brocade`;
      return (
        <g>
          <defs>{brocade(pid, acc, mix(acc, '#ffffff', 0.5))}</defs>
          <path d={torso} fill={col} />
          {shadowRight}
          <path d={`M${f(cx - g.neckW / 2 - 6)},${f(y - 2)} L${f(cx - 30)},201 L${f(cx + 30)},201 L${f(cx + g.neckW / 2 + 6)},${f(y - 2)} Z`} fill={`url(#${pid})`} />
          <path d={`M${f(cx - g.neckW / 2 - 4)},${f(y - 4)} L${f(cx)},${f(y + 20)} L${f(cx + g.neckW / 2 + 4)},${f(y - 4)} Z`} fill="#ffffff" />
          <path d={`M${f(cx - 10)},${f(y + 2)} L${f(cx - 10)},${f(y + 12)} L${f(cx)},${f(y + 7)} L${f(cx + 10)},${f(y + 12)} L${f(cx + 10)},${f(y + 2)} L${f(cx)},${f(y + 7)} Z`} fill="#1d1d1d" />
          {[30, 44, 58].map((k) => (
            <circle key={k} cx={cx + 22} cy={y + k} r={2} fill="#d4af37" />
          ))}
          <rect x={cx - 40} y={192} width={80} height={9} fill={shade(col, -0.2)} opacity={0.7} />
        </g>
      );
    }
    case 'fallera': {
      const pid = `${uid}-brocade`;
      return (
        <g>
          <defs>{brocade(pid, col, acc)}</defs>
          <path d={torso} fill={`url(#${pid})`} />
          {shadowRight}
          <path d={uNeck(g, 10, 1.1)} fill={skinN} />
          {/* manteleta de encaje */}
          <path d={`M${f(cx - g.neckW / 2 - 18)},${f(y - 6)} Q${f(cx - 46)},${f(y + 10)} ${f(cx - 54)},${f(y + 28)} L${f(cx)},${f(y + 58)} L${f(cx + 54)},${f(y + 28)} Q${f(cx + 46)},${f(y + 10)} ${f(cx + g.neckW / 2 + 18)},${f(y - 6)} Q${f(cx)},${f(y + 18)} ${f(cx - g.neckW / 2 - 18)},${f(y - 6)} Z`} fill="#fbf4e4" opacity={0.92} />
          <path d={`M${f(cx - 54)},${f(y + 28)} L${f(cx)},${f(y + 58)} L${f(cx + 54)},${f(y + 28)}`} stroke="#d4af37" strokeWidth={2} fill="none" strokeDasharray="3 2" />
          {[-34, -18, 0, 18, 34].map((k) => (
            <circle key={k} cx={cx + k} cy={y + 24 + (34 - Math.abs(k)) * 0.5} r={2.2} fill="#e8c35a" />
          ))}
        </g>
      );
    }
    default:
      return plain(col, null, uNeck(g, 12));
  }
}
