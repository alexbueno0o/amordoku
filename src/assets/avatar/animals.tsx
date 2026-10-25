/**
 * Animales en formato retrato (palomas, hormigas, pato...).
 */
import type { ReactNode } from 'react';
import { shade } from '../color';
import type { AvatarSpec } from './types';

export function renderAnimal(s: AvatarSpec): ReactNode {
  const col = s.animalColor ?? '#9aa3ad';
  const dk = shade(col, 0.2);
  const lt = shade(col, -0.25);
  switch (s.animal) {
    case 'pigeon':
      return (
        <g>
          <path d="M30,201 C34,150 60,128 100,128 C140,128 168,150 172,201 Z" fill={dk} />
          <path d="M60,201 C64,160 80,142 100,142 C120,142 136,160 140,201 Z" fill={col} />
          <path d="M70,150 C68,120 78,104 100,104 C122,104 132,120 130,150 C120,162 80,162 70,150 Z" fill="#6d8f7c" />
          <path d="M72,148 C76,160 124,160 128,148 C124,140 76,140 72,148 Z" fill="#8d6aa8" opacity={0.7} />
          <circle cx={100} cy={82} r={34} fill={col} />
          <path d="M100,48 A34,34 0 0 1 134,82 L100,82 Z" fill={dk} opacity={0.18} />
          <circle cx={88} cy={76} r={6.5} fill="#f28c28" />
          <circle cx={88} cy={76} r={3.2} fill="#1b1b1b" />
          <circle cx={112} cy={76} r={6.5} fill="#f28c28" />
          <circle cx={112} cy={76} r={3.2} fill="#1b1b1b" />
          <path d="M94,88 L106,88 L100,104 Z" fill="#3a3a3a" />
          <ellipse cx={100} cy={88} rx={8} ry={4} fill="#f2efe8" />
        </g>
      );
    case 'ant':
      return (
        <g>
          <ellipse cx={100} cy={196} rx={56} ry={34} fill={dk} />
          <ellipse cx={100} cy={150} rx={24} ry={18} fill={col} />
          <path d="M70,40 C60,20 50,18 44,24 M130,40 C140,20 150,18 156,24" stroke={col} strokeWidth={5} fill="none" strokeLinecap="round" />
          <circle cx={44} cy={24} r={6} fill={col} />
          <circle cx={156} cy={24} r={6} fill={col} />
          <ellipse cx={100} cy={88} rx={44} ry={46} fill={col} />
          <path d="M100,42 A44,46 0 0 1 144,88 L100,88 Z" fill="#000" opacity={0.12} />
          <ellipse cx={80} cy={82} rx={10} ry={13} fill="#ffffff" />
          <ellipse cx={120} cy={82} rx={10} ry={13} fill="#ffffff" />
          <circle cx={82} cy={85} r={5.5} fill="#111" />
          <circle cx={118} cy={85} r={5.5} fill="#111" />
          <path d="M86,118 Q92,128 98,118 M102,118 Q108,128 114,118" stroke={lt} strokeWidth={4} fill="none" strokeLinecap="round" />
        </g>
      );
    case 'duck':
      return (
        <g>
          <path d="M28,201 C32,150 62,132 100,132 C138,132 168,150 172,201 Z" fill="#8a5a3c" />
          <path d="M66,140 C70,130 130,130 134,140 C120,148 80,148 66,140 Z" fill="#ffffff" />
          <circle cx={100} cy={86} r={42} fill="#2f7d4f" />
          <path d="M100,44 A42,42 0 0 1 142,86 L100,86 Z" fill="#1f5d3a" opacity={0.5} />
          <circle cx={84} cy={76} r={5} fill="#111" />
          <circle cx={116} cy={76} r={5} fill="#111" />
          <ellipse cx={100} cy={100} rx={22} ry={10} fill="#f2c12e" />
          <ellipse cx={100} cy={96} rx={18} ry={6} fill="#f7d35c" />
        </g>
      );
    case 'seagull':
      return (
        <g>
          <path d="M28,201 C32,150 62,132 100,132 C138,132 168,150 172,201 Z" fill="#b8c2cc" />
          <path d="M70,201 C72,160 86,140 100,140 C114,140 128,160 130,201 Z" fill="#ffffff" />
          <circle cx={100} cy={86} r={40} fill="#ffffff" />
          <path d="M100,46 A40,40 0 0 1 140,86 L100,86 Z" fill="#000" opacity={0.06} />
          <circle cx={86} cy={78} r={4.5} fill="#111" />
          <circle cx={114} cy={78} r={4.5} fill="#111" />
          <path d="M84,94 L116,94 L110,106 L90,106 Z" fill="#f2c12e" />
          <circle cx={108} cy={102} r={3} fill="#e53935" />
        </g>
      );
    case 'dog':
      return (
        <g>
          <path d="M30,201 C34,154 64,136 100,136 C136,136 166,154 170,201 Z" fill={dk} />
          <ellipse cx={58} cy={84} rx={16} ry={32} fill={dk} transform="rotate(18 58 84)" />
          <ellipse cx={142} cy={84} rx={16} ry={32} fill={dk} transform="rotate(-18 142 84)" />
          <ellipse cx={100} cy={88} rx={40} ry={44} fill={col} />
          <ellipse cx={100} cy={112} rx={22} ry={16} fill={lt} />
          <ellipse cx={100} cy={102} rx={9} ry={6} fill="#222" />
          <circle cx={84} cy={80} r={5} fill="#222" />
          <circle cx={116} cy={80} r={5} fill="#222" />
        </g>
      );
    case 'cat':
      return (
        <g>
          <path d="M30,201 C34,154 64,136 100,136 C136,136 166,154 170,201 Z" fill={dk} />
          <path d="M62,70 L68,30 L92,54 Z M138,70 L132,30 L108,54 Z" fill={col} />
          <ellipse cx={100} cy={90} rx={42} ry={40} fill={col} />
          <path d="M100,50 A42,40 0 0 1 142,90 L100,90 Z" fill="#000" opacity={0.08} />
          <ellipse cx={84} cy={84} rx={6} ry={8} fill="#a3c74f" />
          <ellipse cx={116} cy={84} rx={6} ry={8} fill="#a3c74f" />
          <path d="M96,100 L104,100 L100,106 Z" fill="#e88a9b" />
          <path d="M70,104 L50,100 M70,108 L50,112 M130,104 L150,100 M130,108 L150,112" stroke="#555" strokeWidth={1.4} />
        </g>
      );
    case 'fish':
      return (
        <g>
          <path d="M40,100 C60,50 140,50 160,100 C140,150 60,150 40,100 Z" fill={col} />
          <path d="M160,100 L190,70 L190,130 Z" fill={dk} />
          <circle cx={70} cy={92} r={7} fill="#fff" />
          <circle cx={70} cy={92} r={3.5} fill="#111" />
          <path d="M100,64 Q110,100 100,136" stroke={dk} strokeWidth={3} fill="none" />
        </g>
      );
    case 'bull':
      return (
        <g>
          <path d="M26,201 C30,150 62,130 100,130 C138,130 170,150 174,201 Z" fill="#2b211c" />
          <path d="M58,62 C40,56 30,40 34,26 C44,40 56,46 70,50 Z M142,62 C160,56 170,40 166,26 C156,40 144,46 130,50 Z" fill="#efe6d2" />
          <ellipse cx={100} cy={88} rx={40} ry={46} fill="#3a2c25" />
          <ellipse cx={100} cy={118} rx={24} ry={16} fill="#5a463b" />
          <circle cx={92} cy={118} r={3} fill="#1b1411" />
          <circle cx={108} cy={118} r={3} fill="#1b1411" />
          <circle cx={84} cy={80} r={4.5} fill="#111" />
          <circle cx={116} cy={80} r={4.5} fill="#111" />
          <circle cx={100} cy={132} r={7} fill="none" stroke="#c9b36b" strokeWidth={2.4} />
        </g>
      );
    default:
      return <circle cx={100} cy={100} r={50} fill={col} />;
  }
}
