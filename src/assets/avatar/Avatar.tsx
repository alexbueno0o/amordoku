/**
 * Avatar: retrato plano sin rasgos faciales, al estilo de los libros de
 * acertijos (cara partida en dos tonos, pelo plano, fondo de color liso).
 *
 * Orden de capas: fondo → pelo trasero → cuello → torso/ropa → collar →
 * pelo sobre hombros → orejas → cara → mejillas/cejas → barba → pendientes →
 * pelo delantero → gorro → gafas → extras.
 */
import { memo, useId, type ReactNode } from 'react';
import { shade } from '../color';
import { renderEarrings, renderExtrasBody, renderExtrasFront, renderGlasses, renderHat, renderNecklace, hatBehind } from './accessories';
import { renderAnimal } from './animals';
import { renderBrows, renderCheeks, renderFacialHair } from './face';
import { headGeom } from './geometry';
import { renderHair } from './hair';
import { renderPortraitObject } from './objects';
import { renderOutfit } from './outfits';
import type { AvatarSpec } from './types';

/** Gorros altos: se reduce un poco el zoom para que no se corten. */
/** Gorros que tapan el pelo de arriba. */
const COVERING_HATS = new Set(['beanie', 'cap', 'capBack', 'bucket', 'police', 'chef', 'bandana', 'hardhat', 'beret']);
const TALL_HATS = new Set(['peineta', 'chef', 'party', 'top', 'crown', 'veil', 'helmet', 'police']);

export interface AvatarProps {
  spec: AvatarSpec;
  size?: number | string;
  /** Tachar con una X roja (la víctima). */
  crossed?: boolean;
  /** Sin fondo (para fichas/peones). */
  noBackground?: boolean;
  className?: string;
  /** Recorte circular (para fichas de la solución). */
  round?: boolean;
}

function AvatarInner({ spec, size = 200, crossed, noBackground, className, round }: AvatarProps) {
  const rawId = useId();
  const uid = `av${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const g = headGeom(spec);
  const skinShade = shade(spec.skin, 0.1);
  const neckShade = shade(spec.skin, 0.2);

  let content: JSX.Element;
  if (spec.kind === 'animal') {
    content = <g>{renderAnimal(spec)}</g>;
  } else if (spec.kind === 'object') {
    content = <g>{renderPortraitObject(spec)}</g>;
  } else {
    const hair = renderHair(spec, g);
    const helmet = spec.hat === 'helmet';
    // Con gorro, el pelo de arriba queda dentro: solo asoma por debajo del puño.
    const covered = COVERING_HATS.has(spec.hat);
    const underHat = (node: ReactNode) => (covered ? <g clipPath={`url(#${uid}-underhat)`}>{node}</g> : node);
    content = (
      <g>
        {hatBehind(spec, g)}
        {!helmet && underHat(hair.behind)}
        {/* cuello */}
        <path
          d={`M${g.cx - g.neckW / 2},${g.chin - 24} L${g.cx - g.neckW / 2 - 1},${g.shoulderY + 2} L${g.cx + g.neckW / 2 + 1},${g.shoulderY + 2} L${g.cx + g.neckW / 2},${g.chin - 24} Z`}
          fill={skinShade}
        />
        <path d={`M${g.cx - g.neckW / 2},${g.chin - 6} Q${g.cx},${g.chin + 12} ${g.cx + g.neckW / 2},${g.chin - 6} L${g.cx + g.neckW / 2},${g.chin - 24} L${g.cx - g.neckW / 2},${g.chin - 24} Z`} fill={neckShade} />
        {renderOutfit(spec, g, uid)}
        {renderNecklace(spec, g)}
        {renderExtrasBody(spec, g)}
        {!helmet && hair.over}
        {/* orejas */}
        <ellipse cx={g.cx - g.W / 2 + 1} cy={g.earY} rx={g.earRx} ry={g.earRy} fill={spec.skin} />
        <ellipse cx={g.cx + g.W / 2 - 1} cy={g.earY} rx={g.earRx} ry={g.earRy} fill={skinShade} />
        <ellipse cx={g.cx - g.W / 2 - 1} cy={g.earY + 1} rx={g.earRx * 0.45} ry={g.earRy * 0.55} fill={shade(spec.skin, 0.12)} />
        <ellipse cx={g.cx + g.W / 2 + 1} cy={g.earY + 1} rx={g.earRx * 0.45} ry={g.earRy * 0.55} fill={shade(spec.skin, 0.2)} />
        {/* cara partida en dos tonos */}
        <path d={g.facePath} fill={spec.skin} />
        <path d={g.facePath} fill={skinShade} clipPath={`url(#${uid}-right)`} />
        {renderCheeks(spec, g)}
        {renderBrows(spec, g)}
        {renderFacialHair(spec, g, uid)}
        {renderEarrings(spec, g)}
        {!helmet && underHat(hair.front)}
        {renderHat(spec, g)}
        {renderGlasses(spec, g)}
        {renderExtrasFront(spec, g)}
      </g>
    );
  }

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <defs>
        <clipPath id={`${uid}-right`}>
          <rect x={100} y={0} width={100} height={200} />
        </clipPath>
        {/* alias usado por algunas piezas (barbas) */}
        <clipPath id="avatar-right-half">
          <rect x={100} y={0} width={100} height={200} />
        </clipPath>
        <clipPath id={`${uid}-underhat`}>
          <rect x={0} y={g.top + g.H * (spec.hat === 'beanie' ? 0.4 : 0.33)} width={200} height={200} />
        </clipPath>
        <clipPath id={`${uid}-frame`}>{round ? <circle cx={100} cy={100} r={100} /> : <rect width={200} height={200} />}</clipPath>
        <linearGradient id="ski-lens" x1="0" x2="1">
          <stop offset="0" stopColor="#ff9f43" />
          <stop offset="1" stopColor="#c56cf0" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${uid}-frame)`}>
        {!noBackground && <rect width={200} height={200} fill={spec.bg} />}
        <g transform={spec.kind === 'person' ? `translate(100 206) scale(${TALL_HATS.has(spec.hat) ? 1.04 : 1.16}) translate(-100 -206)` : undefined}>{content}</g>
      </g>
      {crossed && (
        <g stroke="#e0282e" strokeWidth={4} strokeLinecap="round" opacity={0.9}>
          <path d="M58,96 L148,178" />
          <path d="M150,92 L56,182" />
        </g>
      )}
    </svg>
  );
}

export const Avatar = memo(AvatarInner);
