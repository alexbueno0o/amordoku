/**
 * Objetos en formato retrato: cuando el "objetivo" del caso no es una persona
 * (la última croqueta, la paella, la flor de ganchillo, los anillos...).
 */
import type { ReactNode } from 'react';
import type { AvatarSpec } from './types';

const plate = (y = 150, rx = 70, ry = 22) => (
  <g>
    <ellipse cx={100} cy={y + 4} rx={rx} ry={ry} fill="#000" opacity={0.12} />
    <ellipse cx={100} cy={y} rx={rx} ry={ry} fill="#f7f7f7" />
    <ellipse cx={100} cy={y} rx={rx * 0.72} ry={ry * 0.66} fill="#ececec" />
  </g>
);

export function renderPortraitObject(s: AvatarSpec): ReactNode {
  switch (s.object) {
    case 'croqueta':
      return (
        <g>
          {plate(150)}
          <ellipse cx={100} cy={128} rx={46} ry={26} fill="#c9822f" />
          <ellipse cx={100} cy={122} rx={44} ry={22} fill="#dd9a3e" />
          {[...Array(26)].map((_, i) => (
            <circle key={i} cx={64 + ((i * 37) % 72)} cy={110 + ((i * 13) % 26)} r={1.8} fill="#a8621f" opacity={0.7} />
          ))}
          <path d="M70,112 Q100,100 128,110" stroke="#f0bd6a" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.7} />
        </g>
      );
    case 'paella':
      return (
        <g>
          <ellipse cx={100} cy={112} rx={86} ry={52} fill="#2b2b2b" />
          <rect x={4} y={104} width={20} height={10} rx={4} fill="#2b2b2b" />
          <rect x={176} y={104} width={20} height={10} rx={4} fill="#2b2b2b" />
          <ellipse cx={100} cy={108} rx={78} ry={46} fill="#f2b233" />
          {[...Array(70)].map((_, i) => (
            <ellipse key={i} cx={34 + ((i * 53) % 132)} cy={74 + ((i * 29) % 70)} rx={2.4} ry={1.3} fill="#f7cf6a" />
          ))}
          {[
            [70, 96],
            [124, 92],
            [96, 128],
            [140, 120],
            [58, 122],
          ].map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx={10} ry={7} fill="#d07a3a" />
          ))}
          {[
            [86, 82],
            [112, 118],
            [64, 108],
            [134, 104],
          ].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width={14} height={4} rx={2} fill="#5fa043" transform={`rotate(${i * 40} ${x} ${y})`} />
          ))}
          <path d="M150,70 A16,16 0 0 1 166,90 L150,90 Z" fill="#f4e04d" stroke="#e6c22a" />
          <path d="M80,74 l30,8 M100,140 l26,-4" stroke="#d63b2a" strokeWidth={4} strokeLinecap="round" />
        </g>
      );
    case 'crochetFlower':
      return (
        <g>
          <path d="M100,120 C98,150 104,170 100,200" stroke="#3f8f4f" strokeWidth={6} fill="none" />
          <path d="M100,160 C80,150 70,160 64,170 C80,172 92,168 100,160 Z" fill="#4fa35f" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <g key={a} transform={`rotate(${a} 100 84)`}>
              <ellipse cx={100} cy={52} rx={15} ry={28} fill="#ef6f9a" />
              {[0, 1, 2, 3, 4].map((k) => (
                <path key={k} d={`M${92 + k * 4},${36 + k * 2} q4,4 0,8`} stroke="#c94f78" strokeWidth={1.4} fill="none" />
              ))}
            </g>
          ))}
          <circle cx={100} cy={84} r={18} fill="#f7d35c" />
          {[...Array(10)].map((_, i) => (
            <circle key={i} cx={100 + 10 * Math.cos(i * 0.63)} cy={84 + 10 * Math.sin(i * 0.63)} r={2.2} fill="#e0b03a" />
          ))}
        </g>
      );
    case 'cake':
      return (
        <g>
          {plate(170, 80, 18)}
          <rect x={40} y={100} width={120} height={66} rx={8} fill="#f7c6d9" />
          <path d="M40,112 Q50,124 60,112 T80,112 T100,112 T120,112 T140,112 T160,112 L160,100 L40,100 Z" fill="#ffffff" />
          {[60, 84, 108, 132].map((x, i) => (
            <g key={x}>
              <rect x={x} y={70} width={8} height={30} rx={2} fill={['#5aa7b5', '#f2c94c', '#9a5aa8', '#3f8f5a'][i]} />
              <path d={`M${x + 4},56 q6,8 0,14 q-6,-6 0,-14 Z`} fill="#ff9f1c" />
            </g>
          ))}
        </g>
      );
    case 'trophy':
      return (
        <g>
          <rect x={64} y={164} width={72} height={14} rx={3} fill="#5d4037" />
          <rect x={84} y={140} width={32} height={26} fill="#b8b8b8" />
          <path d="M70,40 L130,40 L118,140 L82,140 Z" fill="#d6d6d6" />
          <path d="M100,40 L130,40 L118,140 L100,140 Z" fill="#b8b8b8" />
          <path d="M80,60 L92,60 L88,130 L84,130 Z" fill="#ffffff" opacity={0.6} />
          <text x={100} y={100} textAnchor="middle" fontFamily="Oswald, sans-serif" fontSize={16} fill="#555">
            LÍNEA
          </text>
        </g>
      );
    case 'mojito':
    case 'margarita':
    case 'spritz':
    case 'tintoVerano':
    case 'cubata':
    case 'beer':
    case 'wine': {
      const o = s.object;
      if (o === 'margarita')
        return (
          <g>
            <path d="M44,60 L156,60 L108,120 L92,120 Z" fill="#e9f5c8" opacity={0.9} stroke="#c9dc96" strokeWidth={2} />
            <path d="M44,60 L156,60" stroke="#e53935" strokeWidth={6} strokeDasharray="3 3" />
            <rect x={96} y={120} width={8} height={50} fill="#dfe6e9" />
            <ellipse cx={100} cy={172} rx={30} ry={7} fill="#dfe6e9" />
            <path d="M140,52 q14,-14 22,-4 q-10,4 -16,18 Z" fill="#c62828" />
            <circle cx={60} cy={60} r={14} fill="#9ccc65" stroke="#7cb342" strokeWidth={2} />
          </g>
        );
      if (o === 'wine')
        return (
          <g>
            <path d="M64,40 L136,40 Q140,110 100,118 Q60,110 64,40 Z" fill="#f5f5f5" opacity={0.6} stroke="#ccc" />
            <path d="M66,70 L134,70 Q134,110 100,114 Q66,110 66,70 Z" fill="#8e1b3a" />
            <rect x={96} y={116} width={8} height={50} fill="#e0e0e0" />
            <ellipse cx={100} cy={168} rx={32} ry={7} fill="#e0e0e0" />
          </g>
        );
      if (o === 'beer')
        return (
          <g>
            <rect x={56} y={50} width={80} height={120} rx={10} fill="#f5b041" opacity={0.95} />
            <path d="M136,76 q30,0 30,30 q0,30 -30,30" stroke="#f0f0f0" strokeWidth={10} fill="none" />
            <path d="M50,56 Q60,32 80,44 Q92,26 110,40 Q128,28 142,52 Z" fill="#ffffff" />
          </g>
        );
      const liquid = o === 'mojito' ? '#e8f7e0' : o === 'spritz' ? '#f6efc6' : o === 'cubata' ? '#4a2614' : '#8b1e2d';
      return (
        <g>
          <path d="M56,46 L144,46 L134,176 L66,176 Z" fill="#ffffff" opacity={0.35} stroke="#c9d6dd" strokeWidth={2} />
          <path d="M60,74 L140,74 L133,172 L67,172 Z" fill={liquid} />
          {[...Array(6)].map((_, i) => (
            <rect key={i} x={70 + (i % 3) * 20} y={86 + Math.floor(i / 3) * 30} width={16} height={16} rx={3} fill="#ffffff" opacity={0.6} transform={`rotate(${i * 12} ${78 + (i % 3) * 20} ${94 + Math.floor(i / 3) * 30})`} />
          ))}
          {o === 'mojito' &&
            [...Array(5)].map((_, i) => <ellipse key={i} cx={76 + i * 12} cy={70 + (i % 2) * 6} rx={9} ry={5} fill="#43a047" transform={`rotate(${i * 30 - 40} ${76 + i * 12} ${70})`} />)}
          {o === 'spritz' && [0, 1].map((i) => <circle key={i} cx={84 + i * 30} cy={110 + i * 20} r={9} fill="none" stroke="#9ccc65" strokeWidth={3} />)}
          {o === 'tintoVerano' && <circle cx={128} cy={48} r={16} fill="#fdd835" stroke="#f9a825" strokeWidth={3} />}
          {o === 'cubata' && (
            <g>
              <path d="M112,62 a22,22 0 0 1 44,0 Z" fill="#c5e1a5" stroke="#7cb342" strokeWidth={3} />
              <path d="M134,62 L134,44 M134,62 L120,48 M134,62 L148,48" stroke="#7cb342" strokeWidth={2} />
              {[0, 1, 2].map((i) => <circle key={i} cx={84 + i * 16} cy={150 - i * 22} r={3} fill="#ffffff" opacity={0.5} />)}
            </g>
          )}
          <path d="M118,30 L106,170" stroke={o === 'mojito' ? '#2e7d32' : '#e53935'} strokeWidth={5} strokeLinecap="round" />
        </g>
      );
    }
    case 'chorizo':
      return (
        <g>
          <ellipse cx={100} cy={150} rx={78} ry={18} fill="#d7b98e" stroke="#a9875a" strokeWidth={3} />
          <path d="M34,118 Q40,70 96,74 Q120,76 122,100 Q118,124 70,128 Q40,130 34,118 Z" fill="#b2322b" stroke="#7a1d18" strokeWidth={3} />
          {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={52 + i * 14} cy={100 + (i % 2) * 10} r={4} fill="#f3d2b5" />)}
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <circle cx={128 + i * 22} cy={132 - i * 4} r={17} fill="#8e2a2a" stroke="#5e1717" strokeWidth={3} />
              {[0, 1, 2, 3].map((k) => <circle key={k} cx={122 + i * 22 + (k % 2) * 10} cy={126 - i * 4 + Math.floor(k / 2) * 10} r={2.6} fill="#f6e2cf" />)}
            </g>
          ))}
        </g>
      );
    case 'sushi':
      return (
        <g>
          <path d="M60,170 L140,60 L160,80 Z" fill="#1f3b2b" />
          <path d="M140,60 Q150,40 168,52 Q176,70 160,80 Z" fill="#fbfbfb" />
          <circle cx={152} cy={60} r={8} fill="#f4845f" />
          <circle cx={160} cy={70} r={6} fill="#81c784" />
          <path d="M150,48 l10,-14 M156,52 l12,-10" stroke="#81c784" strokeWidth={3} strokeLinecap="round" />
        </g>
      );
    case 'cookie':
      return (
        <g>
          <circle cx={100} cy={100} r={64} fill="#d9a35b" />
          <circle cx={100} cy={100} r={64} fill="none" stroke="#b67f3a" strokeWidth={4} />
          {[
            [76, 76],
            [120, 70],
            [130, 110],
            [90, 126],
            [64, 108],
            [104, 98],
          ].map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx={7} ry={5.5} fill="#4e2c1a" />
          ))}
        </g>
      );
    case 'heart':
      return <path d="M100,170 C30,120 30,60 70,52 C90,48 100,64 100,72 C100,64 110,48 130,52 C170,60 170,120 100,170 Z" fill="#e63950" stroke="#b8243a" strokeWidth={3} />;
    case 'rings':
      return (
        <g>
          <rect x={44} y={120} width={112} height={56} rx={10} fill="#7b2742" />
          <rect x={52} y={128} width={96} height={34} rx={6} fill="#5c1a30" />
          <circle cx={84} cy={100} r={30} fill="none" stroke="#e0b84a" strokeWidth={9} />
          <circle cx={118} cy={104} r={28} fill="none" stroke="#cfd4da" strokeWidth={9} />
          <path d="M118,72 l-8,-10 l16,0 Z" fill="#bfe9ff" stroke="#8fc8e8" />
        </g>
      );
    case 'exam':
      return (
        <g transform="rotate(-6 100 100)">
          <rect x={46} y={30} width={108} height={146} rx={4} fill="#ffffff" stroke="#c9c9c9" strokeWidth={2} />
          <text x={100} y={62} textAnchor="middle" fontFamily="Oswald, sans-serif" fontSize={22} fill="#1d3557">
            MIR
          </text>
          {[...Array(6)].map((_, i) => (
            <g key={i}>
              <rect x={60} y={78 + i * 15} width={10} height={10} fill="none" stroke="#666" />
              <path d={`M60,${88 + i * 15} l5,-8 l3,4`} stroke="#e63946" strokeWidth={2} fill="none" opacity={i % 2 ? 0 : 1} />
              <rect x={76} y={81 + i * 15} width={64} height={4} fill="#dcdcdc" />
            </g>
          ))}
        </g>
      );
    case 'cards':
      return (
        <g>
          {[-18, 0, 18].map((a, i) => (
            <g key={a} transform={`rotate(${a} 100 170)`}>
              <rect x={70} y={50} width={60} height={88} rx={6} fill="#ffffff" stroke="#bbb" strokeWidth={1.5} />
              <text x={80} y={72} fontFamily="Roboto Slab, serif" fontSize={16} fill={i === 1 ? '#c62828' : '#222'}>
                {['7', 'A', 'K'][i]}
              </text>
              <path d={i === 1 ? 'M100,92 C90,84 90,104 100,112 C110,104 110,84 100,92 Z' : 'M100,88 L110,104 L100,118 L90,104 Z'} fill={i === 1 ? '#c62828' : '#222'} />
            </g>
          ))}
        </g>
      );
    case 'chess':
      return (
        <g>
          <rect x={60} y={156} width={80} height={16} rx={4} fill="#222" />
          <path d="M72,156 Q78,120 88,96 L112,96 Q122,120 128,156 Z" fill="#2b2b2b" />
          <rect x={80} y={84} width={40} height={14} rx={3} fill="#2b2b2b" />
          <circle cx={100} cy={70} r={14} fill="#2b2b2b" />
          <path d="M96,38 l8,0 l0,10 l10,0 l0,8 l-10,0 l0,8 l-8,0 l0,-8 l-10,0 l0,-8 l10,0 Z" fill="#2b2b2b" />
          <path d="M84,110 Q88,140 84,150" stroke="#555" strokeWidth={3} fill="none" />
        </g>
      );
    case 'coin':
      return (
        <g>
          <circle cx={100} cy={100} r={60} fill="#e0b84a" stroke="#b8902c" strokeWidth={6} />
          <text x={100} y={118} textAnchor="middle" fontFamily="Oswald, sans-serif" fontSize={52} fill="#9c7a22">
            €
          </text>
        </g>
      );
    case 'ticket':
      return (
        <g transform="rotate(-10 100 100)">
          <path d="M30,70 L170,70 L170,90 A10,10 0 0 0 170,110 L170,130 L30,130 L30,110 A10,10 0 0 0 30,90 Z" fill="#f2c94c" stroke="#c99a1b" strokeWidth={2} />
          <path d="M130,72 L130,128" stroke="#c99a1b" strokeWidth={2} strokeDasharray="4 4" />
          <text x={80} y={108} textAnchor="middle" fontFamily="Oswald, sans-serif" fontSize={22} fill="#7a5a10">
            ENTRADA
          </text>
        </g>
      );
    case 'bocadillo':
      return (
        <g>
          <path d="M24,120 Q100,60 176,120 Q176,140 100,140 Q24,140 24,120 Z" fill="#e3a35a" />
          <path d="M28,124 Q100,150 172,124 L172,130 Q100,160 28,130 Z" fill="#c0392b" />
          <path d="M28,130 Q100,160 172,130 Q176,150 100,156 Q24,150 28,130 Z" fill="#e3a35a" />
          {[50, 80, 110, 140].map((x) => (
            <path key={x} d={`M${x},96 l10,-6`} stroke="#c47f35" strokeWidth={3} strokeLinecap="round" />
          ))}
        </g>
      );
    case 'camera':
      return (
        <g>
          <rect x={36} y={64} width={128} height={86} rx={10} fill="#222" />
          <rect x={52} y={52} width={34} height={16} rx={3} fill="#333" />
          <circle cx={110} cy={108} r={34} fill="#333" stroke="#111" strokeWidth={5} />
          <circle cx={110} cy={108} r={20} fill="#3b4a6b" />
          <circle cx={104} cy={102} r={6} fill="#9fb3d9" />
          <rect x={44} y={78} width={18} height={8} fill="#c0392b" />
        </g>
      );
    case 'speaker':
      return (
        <g>
          <rect x={56} y={36} width={88} height={130} rx={10} fill="#2b2b2b" />
          <circle cx={100} cy={128} r={26} fill="#444" stroke="#111" strokeWidth={4} />
          <circle cx={100} cy={70} r={14} fill="#444" stroke="#111" strokeWidth={3} />
          <path d="M150,70 q14,30 0,60 M160,60 q22,40 0,80" stroke="#f2c94c" strokeWidth={4} fill="none" />
        </g>
      );
    case 'scooter':
      return (
        <g>
          <circle cx={56} cy={150} r={20} fill="#222" />
          <circle cx={150} cy={150} r={20} fill="#222" />
          <path d="M40,140 Q50,100 100,104 L150,104 Q166,110 168,140 Z" fill="#5cb85c" />
          <path d="M140,104 L150,50 L168,46" stroke="#333" strokeWidth={6} fill="none" strokeLinecap="round" />
          <rect x={70} y={90} width={50} height={14} rx={6} fill="#2e7d32" />
        </g>
      );
    case 'helmet':
      return (
        <g>
          <path d="M40,140 C30,40 170,40 160,140 L132,140 C130,108 70,108 68,140 Z" fill="#fafafa" stroke="#d0d0d0" strokeWidth={2} />
          <path d="M60,70 Q100,46 140,70" stroke="#ffffff" strokeWidth={8} fill="none" strokeLinecap="round" />
        </g>
      );
    case 'bingoCard':
      return (
        <g transform="rotate(-5 100 100)">
          <rect x={26} y={54} width={148} height={96} rx={4} fill="#fff8e1" stroke="#c9a227" strokeWidth={2} />
          {[...Array(27)].map((_, i) => {
            const x = 30 + (i % 9) * 16;
            const y = 58 + Math.floor(i / 9) * 30;
            const filled = (i * 7) % 3 === 0;
            return (
              <g key={i}>
                <rect x={x} y={y} width={14} height={28} fill={filled ? '#ffffff' : '#c62828'} stroke="#c9a227" strokeWidth={0.6} />
                {filled && (
                  <text x={x + 7} y={y + 19} textAnchor="middle" fontSize={9} fontFamily="Oswald" fill="#333">
                    {(i * 3) % 90}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      );
    case 'flowerOffering':
      return (
        <g>
          <path d="M100,200 L80,120 L120,120 Z" fill="#f5f5f5" stroke="#ddd" />
          {[...Array(14)].map((_, i) => (
            <circle key={i} cx={70 + (i % 5) * 15} cy={70 + Math.floor(i / 5) * 18} r={11} fill={['#ffffff', '#f48fb1', '#f8bbd0', '#ff8a80'][i % 4]} stroke="#e7c9d1" />
          ))}
          <path d="M80,124 Q100,140 120,124" stroke="#d81b60" strokeWidth={6} fill="none" />
        </g>
      );
    case 'popcorn':
      return (
        <g>
          <path d="M56,80 L144,80 L132,180 L68,180 Z" fill="#ffffff" />
          {[70, 94, 118].map((x) => (
            <path key={x} d={`M${x},80 L${x + 4},180 L${x + 14},180 L${x + 14},80 Z`} fill="#e53935" />
          ))}
          {[...Array(14)].map((_, i) => (
            <circle key={i} cx={62 + (i % 7) * 13} cy={72 - Math.floor(i / 7) * 14 + (i % 2) * 4} r={10} fill="#fff6d5" stroke="#f2d27a" />
          ))}
        </g>
      );
    case 'toiletPaper':
      return (
        <g>
          <path d="M60,150 L60,80 L140,80 L140,150 Q140,170 100,170 Q60,170 60,150 Z" fill="#ffffff" stroke="#ddd" strokeWidth={2} />
          <ellipse cx={100} cy={80} rx={40} ry={16} fill="#f5f5f5" stroke="#ddd" strokeWidth={2} />
          <ellipse cx={100} cy={80} rx={12} ry={5} fill="#c9a36b" />
          <path d="M140,120 L162,170 L130,180 L120,160" fill="#ffffff" stroke="#ddd" />
        </g>
      );
    case 'gelato':
      return (
        <g>
          <path d="M70,100 L100,186 L130,100 Z" fill="#e3a35a" />
          <path d="M76,112 l40,0 M82,128 l30,0 M88,144 l20,0" stroke="#c0843d" strokeWidth={2} />
          <circle cx={84} cy={86} r={22} fill="#f8bbd0" />
          <circle cx={116} cy={86} r={22} fill="#c5e1a5" />
          <circle cx={100} cy={64} r={22} fill="#fff3c4" />
        </g>
      );
    case 'guitar':
      return (
        <g transform="rotate(-30 100 110)">
          <rect x={94} y={10} width={12} height={90} fill="#5d4037" />
          <rect x={90} y={4} width={20} height={16} rx={3} fill="#3e2723" />
          <path d="M100,92 C60,92 56,124 70,140 C54,160 66,196 100,196 C134,196 146,160 130,140 C144,124 140,92 100,92 Z" fill="#c0392b" />
          <circle cx={100} cy={140} r={12} fill="#2b1b17" />
        </g>
      );
    case 'pick':
      return <path d="M100,170 C60,120 50,60 100,50 C150,60 140,120 100,170 Z" fill="#7b1fa2" stroke="#4a148c" strokeWidth={3} />;
    case 'kayak':
      return (
        <g transform="rotate(-20 100 100)">
          <path d="M10,100 Q100,60 190,100 Q100,140 10,100 Z" fill="#f2c12e" stroke="#c99a1b" strokeWidth={2} />
          <ellipse cx={100} cy={100} rx={28} ry={10} fill="#333" />
          <path d="M40,150 L160,50" stroke="#555" strokeWidth={5} />
          <ellipse cx={40} cy={150} rx={10} ry={6} fill="#e53935" transform="rotate(-40 40 150)" />
          <ellipse cx={160} cy={50} rx={10} ry={6} fill="#e53935" transform="rotate(-40 160 50)" />
        </g>
      );
    case 'sunscreen':
      return (
        <g>
          <rect x={70} y={40} width={60} height={130} rx={14} fill="#ff9f43" />
          <rect x={84} y={20} width={32} height={24} rx={4} fill="#ffffff" />
          <circle cx={100} cy={100} r={18} fill="#ffd166" />
          <text x={100} y={146} textAnchor="middle" fontFamily="Oswald" fontSize={16} fill="#fff">
            SPF 50
          </text>
        </g>
      );
    case 'couscous':
      return (
        <g>
          <ellipse cx={100} cy={150} rx={80} ry={22} fill="#b5532f" />
          <path d="M40,148 Q100,40 160,148 Z" fill="#c2643b" />
          <circle cx={100} cy={70} r={8} fill="#8f3f22" />
          <path d="M60,130 Q100,110 140,130" stroke="#e8a26b" strokeWidth={4} fill="none" />
        </g>
      );
    case 'mic':
      return (
        <g>
          <rect x={92} y={90} width={16} height={90} rx={6} fill="#333" />
          <circle cx={100} cy={70} r={30} fill="#9e9e9e" />
          {[...Array(5)].map((_, i) => (
            <line key={i} x1={74} y1={58 + i * 6} x2={126} y2={58 + i * 6} stroke="#777" strokeWidth={1.5} />
          ))}
        </g>
      );
    case 'peineta':
      return (
        <g>
          <path d="M30,140 Q30,40 100,30 Q170,40 170,140 Z" fill="#d4af37" stroke="#9c7a22" strokeWidth={4} />
          <path d="M50,130 Q52,60 100,50 Q148,60 150,130" fill="none" stroke="#9c7a22" strokeWidth={3} />
          {[...Array(9)].map((_, i) => (
            <circle key={i} cx={56 + i * 11} cy={92 - Math.sin((i / 8) * Math.PI) * 28} r={4} fill="#fff3c4" stroke="#9c7a22" />
          ))}
          {[...Array(12)].map((_, i) => (
            <rect key={i} x={36 + i * 11} y={140} width={5} height={34} rx={2} fill="#c9a227" />
          ))}
        </g>
      );
    case 'tissues':
      return (
        <g>
          <rect x={40} y={80} width={120} height={70} rx={10} fill="#8ecae6" stroke="#5a9ab8" strokeWidth={3} />
          <rect x={70} y={74} width={60} height={14} rx={6} fill="#5a9ab8" />
          <path d="M80,80 Q90,40 100,60 Q112,30 122,78" fill="#ffffff" stroke="#d0d0d0" strokeWidth={2} />
          <path d="M60,120 l20,0 M120,120 l20,0" stroke="#ffffff" strokeWidth={4} />
        </g>
      );
    case 'ice':
      return (
        <g>
          <path d="M50,60 L150,60 L160,170 L40,170 Z" fill="#e3f4fb" fillOpacity={0.9} stroke="#9ccbe0" strokeWidth={3} />
          {[...Array(9)].map((_, i) => (
            <rect key={i} x={58 + (i % 3) * 30} y={80 + Math.floor(i / 3) * 28} width={22} height={22} rx={4} fill="#ffffff" stroke="#b7dcec" strokeWidth={2} transform={`rotate(${i * 9} ${69 + (i % 3) * 30} ${91 + Math.floor(i / 3) * 28})`} />
          ))}
          <path d="M70,60 Q100,40 130,60" stroke="#e63946" strokeWidth={5} fill="none" />
        </g>
      );
    default:
      return <circle cx={100} cy={100} r={50} fill="#f2c94c" />;
  }
}
