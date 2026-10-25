/**
 * Instrucciones (4 páginas) con un caso de ejemplo propio: tres palomas y la
 * última croqueta. Los textos salen de book.texts (editables).
 */
import type { ReactNode } from 'react';
import { Avatar } from '../assets/avatar/Avatar';
import { DEFAULT_AVATAR, withOverrides, type AvatarSpec } from '../assets/avatar/types';
import { OBJECT_RENDERERS } from '../assets/objects';
import { objectType } from '../catalog/objectTypes';
import { bookText, type TextKey } from '../domain/bookTexts';
import { findCharacter } from '../domain/caseModel';
import type { Project, Scenario } from '../domain/types';
import { BoardView, CELL } from '../render/BoardView';
import { MiniGrid } from './MiniGrid';
import { ClueCard, Polaroid, Rich, RichLines } from './parts';

/* ---------------------------------------------------- escenario de ejemplo */
const cellsEx = Array.from({ length: 16 }, (_, i) => (i < 8 ? { room: 'cocina', floor: 'k' } : { room: 'terraza', floor: 't' }));
export const EXAMPLE_SCENARIO: Scenario = {
  id: '__example',
  name: 'Ejemplo',
  floors: { k: { pattern: 'hydraulic', colors: ['#f4ead8', '#d98b62'] }, t: { pattern: 'deck', colors: ['#d8b48c', '#c49d74'] } },
  board: {
    rows: 4,
    cols: 4,
    cells: cellsEx,
    rooms: [
      { id: 'cocina', name: 'Cocina', article: 'la' },
      { id: 'terraza', name: 'Terraza', article: 'la' },
    ],
    objects: [
      { id: 'e1', type: 'fridge', r: 0, c: 2, w: 1, h: 1 },
      { id: 'e2', type: 'table', r: 1, c: 1, w: 1, h: 1, color: '#9fc3d8' },
      { id: 'e3', type: 'lounger', r: 2, c: 0, w: 2, h: 1, rot: 90, color: '#ffffff' },
      { id: 'e4', type: 'plant', r: 3, c: 2, w: 1, h: 1 },
    ],
    edges: [{ id: 'ew', type: 'window', r: 3, c: 0, side: 'left' }],
  },
};

const pigeon = (bg: string, color: string): AvatarSpec => ({ ...DEFAULT_AVATAR, kind: 'animal', animal: 'pigeon', animalColor: color, bg });
export const EXAMPLE_PEOPLE = [
  { id: 'P', name: 'Paca', avatar: pigeon('#e8a33c', '#a7b0bb'), clue: 'Estaba al lado de la **mesa**.' },
  { id: 'T', name: 'Toni', avatar: pigeon('#5aa7b5', '#8d96a3'), clue: 'Estaba en la **tumbona**.' },
  { id: 'L', name: 'Lola', avatar: pigeon('#9a5aa8', '#c3c9d1'), clue: 'Estaba delante de una **ventana**.' },
];
const CROQUETA: AvatarSpec = { ...DEFAULT_AVATAR, kind: 'object', object: 'croqueta', bg: '#c25b8f' };

/* ----------------------------------------------------------- superposiciones */
const cx = (cell: number) => (cell % 4) * CELL;
const cy = (cell: number) => Math.floor(cell / 4) * CELL;
const Letter = ({ cell, l }: { cell: number; l: string }) => (
  <text x={cx(cell) + 16} y={cy(cell) + 34} fontFamily="Roboto Slab" fontWeight={700} fontSize={30} fill="#16141a" stroke="#ffffff" strokeWidth={6} paintOrder="stroke">
    {l}
  </text>
);
const Cross = ({ cell, color = '#16141a' }: { cell: number; color?: string }) => (
  <g stroke={color} strokeWidth={13} strokeLinecap="round">
    <path d={`M${cx(cell) + 28},${cy(cell) + 28} L${cx(cell) + 72},${cy(cell) + 72} M${cx(cell) + 72},${cy(cell) + 28} L${cx(cell) + 28},${cy(cell) + 72}`} />
  </g>
);
const Circle = ({ cell, l, color = '#2e8b3e' }: { cell: number; l: string; color?: string }) => (
  <g>
    <circle cx={cx(cell) + 50} cy={cy(cell) + 50} r={32} fill="#ffffff" stroke={color} strokeWidth={8} />
    <text x={cx(cell) + 50} y={cy(cell) + 63} textAnchor="middle" fontFamily="Roboto Slab" fontWeight={700} fontSize={38} fill="#16141a">
      {l}
    </text>
  </g>
);

function ExampleBoard({ overlay, width, labels = true }: { overlay?: ReactNode; width: string; labels?: boolean }) {
  return (
    <div style={{ width }}>
      <BoardView scenario={EXAMPLE_SCENARIO} pad={16} overlay={overlay} labelScale={0.95} showLabels={labels} />
    </div>
  );
}

/** Narrador con gorra de policía. */
function narratorAvatar(project: Project): AvatarSpec {
  const ch = project.book.narratorCharacterId ? findCharacter(project, project.book.narratorCharacterId) : undefined;
  const base = ch?.avatar ?? { ...DEFAULT_AVATAR, facialHair: 'chevron', hair: 'short' };
  return withOverrides(base, { hat: 'police', hatColor: '#26324a', outfit: 'shirt', outfitColor: '#3b5a8c', bg: '#00000000' });
}

const Panel = ({ x, y, w, h, color = '#d5e4f5', shadow = '#b3c6df', children }: { x: number; y: number; w: number; h: number; color?: string; shadow?: string; children: ReactNode }) => (
  <div className="panel" style={{ left: `${x}mm`, top: `${y}mm`, width: `${w}mm`, height: `${h}mm`, background: color, boxShadow: `0 0.9mm 0 ${shadow}` }}>
    {children}
  </div>
);

/* --------------------------------------------------------------- páginas */
export function InstructionsPage1({ project, bleed }: { project: Project; bleed?: boolean }) {
  const t = (k: TextKey) => bookText(project.book.texts, k);
  const nav = narratorAvatar(project);
  return (
    <div className={`book-page left${bleed ? ' bleed' : ''}`}>
      <Panel x={6} y={6} w={115} h={88}>
        <div style={{ position: 'absolute', left: '-2mm', top: '1mm', width: '24mm', height: '24mm' }}>
          <Avatar spec={nav} size="100%" noBackground />
        </div>
        <div style={{ position: 'absolute', left: '22mm', top: '2mm', right: '3mm', background: '#ffffff', borderRadius: '6mm', padding: '2mm 4mm', boxShadow: '0 0.7mm 0 #b3c6df', textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '12.5pt' }}>{t('welcomeTitle')}</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '8.6pt', lineHeight: 1.15 }}>
            <Rich text={t('welcomeText')} />
          </div>
        </div>
        <div style={{ position: 'absolute', top: '27mm', left: '4mm', right: '4mm', textAlign: 'center' }}>
          <h2>{t('goalTitle')}</h2>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '8.8pt', lineHeight: 1.15 }}>
            <Rich text={t('goalText')} />
          </p>
          <h2 style={{ marginTop: '1.5mm' }}>{t('overviewTitle')}</h2>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '8.4pt', textAlign: 'left' }}>
            <Rich text={t('overviewIntro')} />
          </p>
          <ul style={{ margin: '0.6mm 0 0', paddingLeft: '5mm', textAlign: 'left', fontFamily: 'var(--font-serif)', fontSize: '8.4pt', lineHeight: 1.16 }}>
            {(['rule1', 'rule2', 'rule3', 'rule4'] as TextKey[]).map((k) => (
              <li key={k}>
                <Rich text={t(k)} />
              </li>
            ))}
          </ul>
          <div style={{ marginTop: '1.4mm', background: '#fbe3a3', borderRadius: '3mm', padding: '1.2mm 2.5mm', fontFamily: 'var(--font-serif)', fontSize: '8pt', lineHeight: 1.15, textAlign: 'left' }}>
            <b style={{ fontFamily: 'var(--font-slab)' }}>{t('twistTitle')} </b>
            <Rich text={t('twistText')} />
          </div>
        </div>
      </Panel>
      <Panel x={6} y={98} w={115} h={86}>
        <div style={{ position: 'absolute', top: '2mm', left: '3mm', right: '3mm', textAlign: 'center' }}>
          <h2>{t('stepTitle')}</h2>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '8.4pt', lineHeight: 1.12 }}>
            <Rich text={t('stepIntro')} />
          </p>
        </div>
        {[...EXAMPLE_PEOPLE, { id: 'V', name: 'La croqueta', avatar: CROQUETA, clue: '' }].map((p, i) => {
          const col = i % 2;
          const row = Math.floor(i / 2);
          const x = 3 + col * 24;
          const y = 17 + row * 33 + (col ? 4 : 0);
          const victim = p.id === 'V';
          return (
            <div key={p.id}>
              <ClueCard x={x} y={y + 17.6} width={22} height={7} color={victim ? '#f7d3d6' : '#ffffff'} fontSize={6.3}>
                {victim ? (
                  <>
                    <b>La víctima.</b> Estaba en la última casilla libre.
                  </>
                ) : (
                  <Rich text={p.clue} />
                )}
              </ClueCard>
              <Polaroid avatar={p.avatar} name={p.name} x={x + 3.5} y={y} width={15} victim={victim} />
            </div>
          );
        })}
        <div style={{ position: 'absolute', left: '52mm', top: '15mm' }}>
          <ExampleBoard width="60mm" />
        </div>
        <div style={{ position: 'absolute', left: '50mm', right: '3mm', top: '73mm', background: '#fbe3a3', borderRadius: '3mm', padding: '1.2mm 2mm', fontFamily: 'var(--font-serif)', fontSize: '7.4pt', lineHeight: 1.12 }}>
          <Rich text={t('noteBeside')} />
        </div>
      </Panel>
      <div className="page-number left">4</div>
    </div>
  );
}

export function InstructionsPage2({ project, bleed }: { project: Project; bleed?: boolean }) {
  const t = (k: TextKey) => bookText(project.book.texts, k);
  return (
    <div className={`book-page right${bleed ? ' bleed' : ''}`}>
      <Panel x={6} y={6} w={115} h={84}>
        <div style={{ position: 'absolute', top: '2mm', left: '3mm', right: '3mm', textAlign: 'center' }}>
          <h2>{t('cluesTitle')}</h2>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '8.6pt', lineHeight: 1.12 }}>
            <Rich text={t('cluesStep1')} />
          </p>
        </div>
        <div style={{ position: 'absolute', left: '22mm', top: '17mm' }}>
          <ExampleBoard
            width="64mm"
            overlay={
              <g>
                <Letter cell={1} l="P" />
                <Letter cell={4} l="P" />
                <Letter cell={6} l="P" />
                <Letter cell={8} l="T" />
                <Letter cell={9} l="T" />
                <Letter cell={12} l="L" />
              </g>
            }
          />
        </div>
        <div style={{ position: 'absolute', left: '88mm', top: '24mm', width: '25mm', fontFamily: 'var(--font-hand)', fontSize: '10pt', color: '#2f5f9e', lineHeight: 1.05 }}>
          P = Paca
          <br />T = Toni
          <br />L = Lola
        </div>
      </Panel>
      <Panel x={6} y={94} w={115} h={36} color="#f8d98c" shadow="#dfbd6a">
        <div style={{ position: 'absolute', left: '4mm', top: '4mm', width: '44mm', textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '15pt' }}>{t('importantTitle')}</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '8.6pt', lineHeight: 1.12 }}>
            <Rich text={t('importantText')} />
          </div>
        </div>
        <div style={{ position: 'absolute', left: '52mm', top: '3mm', width: '26mm' }}>
          <MiniGrid rows={4} cols={4} width="24mm" marks={{ 3: { letter: 'L', circle: 'plain' } }} shaded={[0, 1, 2, 7, 11, 15]} />
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '7pt', textAlign: 'center' }}>{t('importantA')}</div>
        </div>
        <div style={{ position: 'absolute', left: '84mm', top: '3mm', width: '28mm' }}>
          <MiniGrid rows={4} cols={4} width="24mm" marks={{ 3: { letter: 'L', circle: 'plain' }, 0: 'x', 1: 'x', 2: 'x', 7: 'x', 11: 'x', 15: 'x' }} shaded={[0, 1, 2, 7, 11, 15]} />
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '7pt', textAlign: 'center' }}>{t('importantB')}</div>
        </div>
      </Panel>
      <Panel x={6} y={134} w={115} h={51}>
        <div style={{ position: 'absolute', left: '4mm', top: '3mm', width: '52mm' }}>
          <ExampleBoard
            width="38mm"
            labels={false}
            overlay={
              <g>
                <Letter cell={1} l="P" />
                <Letter cell={6} l="P" />
                <Letter cell={9} l="T" />
                <Cross cell={4} color="#2e8b3e" />
                <Cross cell={8} color="#2e8b3e" />
                <Cross cell={0} color="#2e8b3e" />
                <Cross cell={13} color="#2e8b3e" />
                <Cross cell={15} color="#2e8b3e" />
                <Circle cell={12} l="L" />
              </g>
            }
          />
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '7.4pt', lineHeight: 1.1, marginTop: '1mm' }}>
            <Rich text={t('cluesStep2')} />
          </div>
        </div>
        <div style={{ position: 'absolute', left: '60mm', top: '3mm', width: '52mm' }}>
          <ExampleBoard
            width="38mm"
            labels={false}
            overlay={
              <g>
                <Letter cell={1} l="P" />
                <Letter cell={6} l="P" />
                <Cross cell={4} />
                <Cross cell={8} />
                <Cross cell={0} />
                <Cross cell={13} />
                <Cross cell={15} />
                <Circle cell={12} l="L" color="#16141a" />
                <Circle cell={9} l="T" />
              </g>
            }
          />
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '7.4pt', lineHeight: 1.1, marginTop: '1mm' }}>
            <Rich text={t('cluesStep3')} />
          </div>
        </div>
      </Panel>
      <div className="page-number right">5</div>
    </div>
  );
}

export function InstructionsPage3({ project, bleed }: { project: Project; bleed?: boolean }) {
  const t = (k: TextKey) => bookText(project.book.texts, k);
  const nav = narratorAvatar(project);
  const jail: AvatarSpec = EXAMPLE_PEOPLE[0].avatar;
  return (
    <div className={`book-page left${bleed ? ' bleed' : ''}`}>
      <Panel x={6} y={6} w={115} h={58}>
        <div style={{ position: 'absolute', left: '4mm', top: '3mm', width: '52mm' }}>
          <ExampleBoard
            width="38mm"
            labels={false}
            overlay={
              <g>
                <Cross cell={1} color="#2e8b3e" />
                <Cross cell={4} />
                <Cross cell={8} />
                <Cross cell={0} />
                <Cross cell={13} />
                <Cross cell={15} />
                <Cross cell={5} />
                <Circle cell={12} l="L" color="#16141a" />
                <Circle cell={9} l="T" color="#16141a" />
                <Circle cell={6} l="P" />
              </g>
            }
          />
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '7.4pt', lineHeight: 1.1, marginTop: '1mm' }}>
            <Rich text={t('step4')} />
          </div>
        </div>
        <div style={{ position: 'absolute', left: '60mm', top: '3mm', width: '52mm' }}>
          <ExampleBoard
            width="38mm"
            labels={false}
            overlay={
              <g>
                <Cross cell={1} />
                <Cross cell={4} />
                <Cross cell={8} />
                <Cross cell={0} />
                <Cross cell={13} />
                <Cross cell={15} />
                <Cross cell={5} />
                <Cross cell={7} />
                <Circle cell={12} l="L" color="#16141a" />
                <Circle cell={9} l="T" color="#16141a" />
                <Circle cell={6} l="P" color="#16141a" />
                <Circle cell={3} l="V" color="#c8323c" />
              </g>
            }
          />
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '7.4pt', lineHeight: 1.1, marginTop: '1mm' }}>
            <Rich text={t('step5')} />
          </div>
        </div>
      </Panel>
      <Panel x={6} y={68} w={115} h={74}>
        <div style={{ position: 'absolute', top: '2mm', left: '3mm', right: '3mm', textAlign: 'center' }}>
          <h2>{t('culpritTitle')}</h2>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '8.4pt' }}>
            <Rich text={t('culpritText')} />
          </p>
        </div>
        <div style={{ position: 'absolute', left: '4mm', top: '16mm' }}>
          <ExampleBoard
            width="54mm"
            overlay={
              <g>
                <rect x={-4} y={-4} width={408} height={208} fill="none" stroke="#e0282e" strokeWidth={14} />
                <Circle cell={12} l="L" color="#16141a" />
                <Circle cell={9} l="T" color="#16141a" />
                <Circle cell={6} l="P" color="#e0282e" />
                <Circle cell={3} l="V" color="#c8323c" />
              </g>
            }
          />
        </div>
        <div style={{ position: 'absolute', left: '62mm', top: '18mm', width: '48mm', textAlign: 'center', fontFamily: 'var(--font-serif)', fontSize: '8.4pt', lineHeight: 1.15 }}>
          <Rich text={t('culpritCaption')} />
        </div>
        <div style={{ position: 'absolute', left: '72mm', top: '36mm', width: '30mm', height: '34mm', borderRadius: '50%', border: '0.8mm solid #6b3a3a' }} />
        <Polaroid avatar={jail} name="Paca" x={78} y={41} width={18} />
        <svg viewBox="0 0 100 100" style={{ position: 'absolute', left: '79.6mm', top: '42.6mm', width: '14.8mm', height: '14.8mm' }}>
          {[12, 30, 48, 66, 84].map((x) => (
            <rect key={x} x={x - 4} y={0} width={8} height={100} fill="#6d4c41" />
          ))}
          <rect x={0} y={0} width={100} height={8} fill="#5d4037" />
        </svg>
      </Panel>
      <div style={{ position: 'absolute', left: '4mm', top: '147mm', width: '26mm', height: '30mm' }}>
        <Avatar spec={nav} size="100%" noBackground />
      </div>
      <div className="panel" style={{ left: '28mm', top: '147mm', width: '38mm', background: '#d5e4f5', padding: '2mm', fontFamily: 'var(--font-serif)', fontSize: '8.4pt', textAlign: 'center' }}>
        <Rich text={t('narratorBubble2')} />
      </div>
      <div className="panel" style={{ left: '70mm', top: '153mm', width: '51mm', background: '#c9d9f0', padding: '2mm 3mm', textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: '10pt' }}>{t('doubtsTitle')}</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '7.8pt', lineHeight: 1.12 }}>
          <Rich text={t('doubtsText')} />
        </div>
      </div>
      <div className="page-number left">6</div>
    </div>
  );
}

function ObjIcon({ type, variant, label }: { type: string; variant?: string; label: string }) {
  const def = objectType(type);
  const r = OBJECT_RENDERERS[type];
  if (!def || !r) return null;
  const [w, h] = def.size;
  return (
    <div style={{ textAlign: 'center', width: '19mm' }}>
      <svg viewBox={`-6 -6 ${w * 100 + 12} ${h * 100 + 12}`} style={{ height: '11mm', maxWidth: '18mm', display: 'block', margin: '0 auto' }}>
        {r({ w, h, W: w * 100, H: h * 100, color: def.color, variant: variant ?? def.variants?.[0], uid: `ic-${type}` })}
      </svg>
      <div style={{ fontFamily: 'var(--font-slab)', fontSize: '7.4pt' }}>{label}</div>
    </div>
  );
}

export function InstructionsPage4({ project, bleed }: { project: Project; bleed?: boolean }) {
  const t = (k: TextKey) => bookText(project.book.texts, k);
  return (
    <div className={`book-page right${bleed ? ' bleed' : ''}`}>
      <div style={{ position: 'absolute', top: '6mm', left: 0, right: 0, textAlign: 'center', fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '15pt' }}>{t('objectsTitle')}</div>
      <Panel x={6} y={16} w={85} h={26} color="#c9ecb6" shadow="#9fcb8a">
        <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '10pt', marginTop: '1mm' }}>{t('canTitle')}</div>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '0.5mm' }}>
          <ObjIcon type="chair" label="Silla" />
          <ObjIcon type="carpet" label="Alfombra" />
          <ObjIcon type="bed" label="Cama" />
          <ObjIcon type="sofa" label="Sofá" />
        </div>
      </Panel>
      <Panel x={94} y={16} w={27} h={26} color="#cfe3f5" shadow="#a9c3dc">
        <div style={{ textAlign: 'center', marginTop: '3mm' }}>
          <svg viewBox="-50 -20 100 40" style={{ width: '16mm' }}>
            <rect x={-37} y={-11} width={74} height={22} rx={8} fill="#dfe7ec" stroke="#2f2b38" strokeWidth={3} />
            <rect x={-28} y={-5} width={56} height={10} rx={5} fill="#ffffff" stroke="#2f2b38" strokeWidth={1.8} />
          </svg>
          <div style={{ fontFamily: 'var(--font-slab)', fontSize: '8pt' }}>{t('windowTitle')}</div>
        </div>
      </Panel>
      <Panel x={6} y={45} w={115} h={26} color="#f6c3c3" shadow="#d89a9a">
        <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '10pt', marginTop: '1mm' }}>{t('cannotTitle')}</div>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '0.5mm' }}>
          <ObjIcon type="table" label="Mesa" />
          <ObjIcon type="tv" label="Televisor" />
          <ObjIcon type="plant" label="Planta" />
          <ObjIcon type="shelf" label="Estantería" />
          <ObjIcon type="box" label="Caja" />
        </div>
      </Panel>
      <Panel x={6} y={74} w={115} h={13} color="#cfe3f5" shadow="#a9c3dc">
        <div style={{ padding: '1.4mm 3mm', fontFamily: 'var(--font-serif)', fontSize: '7.8pt', lineHeight: 1.12, textAlign: 'center' }}>
          <Rich text={t('windowNote')} />
        </div>
      </Panel>
      <div style={{ position: 'absolute', top: '91mm', left: 0, right: 0, textAlign: 'center', fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '15pt' }}>{t('tipsTitle')}</div>
      {(
        [
          ['tip1Title', 'tip1', 101, 19],
          ['tip2Title', 'tip2', 124, 19],
        ] as [TextKey, TextKey, number, number][]
      ).map(([tk, k, y, h]) => (
        <Panel key={k} x={6} y={y} w={115} h={h} color="#fbe6bf" shadow="#e2c48c">
          <div style={{ padding: '1.6mm 3mm', textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '9.4pt' }}>{t(tk)}</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '7.8pt', lineHeight: 1.12 }}>
              <Rich text={t(k)} />
            </div>
          </div>
        </Panel>
      ))}
      <Panel x={6} y={147} w={115} h={38} color="#fbe6bf" shadow="#e2c48c">
        <div style={{ padding: '1.6mm 3mm', textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '9.4pt' }}>{t('tip3Title')}</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '7.8pt', lineHeight: 1.12 }}>
            <RichLines text={t('tip3')} />
          </div>
        </div>
        <div style={{ position: 'absolute', left: '14mm', top: '17mm' }}>
          <MiniGrid rows={3} cols={3} width="18mm" marks={{ 0: { letter: 'A' }, 4: { letter: 'A' }, 1: 'x', 3: 'x' }} shaded={[1, 3]} />
        </div>
        <div style={{ position: 'absolute', left: '34mm', top: '20mm', width: '22mm', fontFamily: 'var(--font-serif)', fontSize: '7pt', lineHeight: 1.1 }}>A está en una de estas dos celdas: nadie puede estar en las marcadas.</div>
        <div style={{ position: 'absolute', left: '62mm', top: '17mm' }}>
          <MiniGrid rows={3} cols={3} width="18mm" marks={{ 2: { letter: 'B' }, 5: { letter: 'B' }, 8: 'x' }} shaded={[2, 5, 8]} />
        </div>
        <div style={{ position: 'absolute', left: '82mm', top: '20mm', width: '30mm', fontFamily: 'var(--font-serif)', fontSize: '7pt', lineHeight: 1.1 }}>B solo puede estar en la columna 3: nadie más puede usar esa columna.</div>
      </Panel>
      <div className="page-number right">7</div>
    </div>
  );
}
