/**
 * Editor de escenarios: divisiones, suelos, objetos, ventanas y puertas.
 *
 * Se trabaja con herramientas como en un programa de dibujo: eliges qué
 * pintar a la izquierda y haces clic (o arrastras) sobre el plano.
 */
import { useMemo, useRef, useState } from 'react';
import { FLOORS, floorDef } from '../../assets/floors';
import { OBJECT_RENDERERS } from '../../assets/objects';
import { OBJECT_TYPES, objectType, type ObjectCategory } from '../../catalog/objectTypes';
import { lintScenario } from '../../domain/dsl';
import { newScenario } from '../../domain/defaults';
import type { Scenario } from '../../domain/types';
import type { EdgeFeature, ObjectInstance, RoomSpec, Side } from '../../engine/types';
import { BoardView, CELL } from '../../render/BoardView';
import { Button, ColorField, Empty, Field, NumberInput, Section, Select, TextInput, Toggle, useToast } from '../components/ui';
import { go } from '../lib/router';
import { makeId } from '../lib/util';
import { useProject } from '../store/projectStore';

type Tool = 'room' | 'floor' | 'object' | 'edge' | 'label' | 'select' | 'erase';

const TOOLS: { id: Tool; label: string; icon: string; help: string }[] = [
  { id: 'room', label: 'Divisiones', icon: '🧱', help: 'Pinta las celdas de la división elegida (arrastra para pintar varias).' },
  { id: 'floor', label: 'Suelos', icon: '🎨', help: 'Pinta el suelo elegido (madera, agua, arena…).' },
  { id: 'object', label: 'Objetos', icon: '🛋️', help: 'Elige un objeto y haz clic donde quieras su esquina superior izquierda.' },
  { id: 'edge', label: 'Ventanas y puertas', icon: '🪟', help: 'Haz clic cerca de una pared para poner o quitar una ventana o puerta.' },
  { id: 'select', label: 'Mover / editar', icon: '✋', help: 'Haz clic en un objeto para cambiar su color, tamaño, giro o moverlo.' },
  { id: 'label', label: 'Etiquetas', icon: '🏷️', help: 'Haz clic en la celda donde quieres la etiqueta de la división elegida.' },
  { id: 'erase', label: 'Borrar', icon: '🧽', help: 'Haz clic en un objeto, ventana o puerta para quitarlo.' },
];

const ROOM_TINTS = ['#e63946', '#2a9d8f', '#e9c46a', '#5b7fc4', '#9a5aa8', '#f4a261', '#3f8f5a', '#c25b8f', '#264653', '#8a5a33', '#7fb3d5', '#b5452b'];
const CATEGORY_LABEL: Record<ObjectCategory, string> = {
  asientos: 'Asientos',
  camas: 'Camas',
  mesas: 'Mesas y barras',
  cocina: 'Cocina',
  baño: 'Baño',
  salón: 'Salón',
  naturaleza: 'Naturaleza',
  agua: 'Agua y playa',
  fiesta: 'Fiesta',
  música: 'Música',
  calle: 'Calle',
  vehículos: 'Vehículos',
  ocio: 'Ocio',
  especial: 'Especiales',
  pared: 'Pared',
};

export function ScenariosPage({ selectedId }: { selectedId?: string }) {
  const { project, upsertScenario, deleteScenario } = useProject();
  const [toast, showToast] = useToast();
  const [size, setSize] = useState(7);
  const selected = project.scenarios.find((s) => s.id === selectedId);
  const usedIn = (id: string) => project.cases.filter((c) => c.scenarioId === id).length;

  const create = () => {
    const id = makeId('escenario', project.scenarios.map((s) => s.id));
    upsertScenario({ ...newScenario(id, size), name: `Escenario ${size}×${size}` });
    go('escenarios', id);
  };
  const duplicate = (s: Scenario) => {
    const id = makeId(s.id + '-copia', project.scenarios.map((x) => x.id));
    upsertScenario({ ...structuredClone(s), id, name: s.name + ' (copia)' });
    go('escenarios', id);
  };
  const remove = (s: Scenario) => {
    if (usedIn(s.id)) return showToast(`No se puede borrar: lo usan ${usedIn(s.id)} caso(s).`);
    if (!confirm(`¿Borrar el escenario «${s.name}»?`)) return;
    deleteScenario(s.id);
    go('escenarios');
  };

  return (
    <div className="split">
      <aside className="sidebar">
        <div className="sidebar-actions">
          <Button kind="primary" small onClick={create}>
            + Nuevo
          </Button>
          <Select
            value={String(size)}
            onChange={(v) => setSize(Number(v))}
            options={[5, 6, 7, 8, 9, 10, 11, 12].map((n) => ({ id: String(n), label: `${n}×${n} (${n} personajes)` }))}
          />
        </div>
        <div className="sidebar-list">
          {project.scenarios.map((s) => (
            <button key={s.id} className={`list-item scen${s.id === selectedId ? ' on' : ''}`} onClick={() => go('escenarios', s.id)}>
              <span className="list-board">
                <BoardView scenario={s} width={64} showLabels={false} pad={6} />
              </span>
              <span className="list-text">
                <b>{s.name}</b>
                <small>
                  {s.board.rows}×{s.board.cols} · {usedIn(s.id)} caso(s)
                </small>
              </span>
            </button>
          ))}
        </div>
      </aside>
      <section className="workspace">
        {selected ? (
          <ScenarioEditor key={selected.id} scenario={selected} onChange={upsertScenario} onDuplicate={() => duplicate(selected)} onDelete={() => remove(selected)} />
        ) : (
          <Empty>
            <h2>Elige un escenario o crea uno nuevo</h2>
            <p>El tamaño del plano marca cuántos personajes tendrá el murdoku: en un plano de 7×7 caben 7 personas (contando a la víctima).</p>
          </Empty>
        )}
      </section>
      {toast}
    </div>
  );
}

function ScenarioEditor({ scenario: s, onChange, onDuplicate, onDelete }: { scenario: Scenario; onChange: (s: Scenario) => void; onDuplicate: () => void; onDelete: () => void }) {
  const { rows, cols, cells, rooms, objects, edges } = s.board;
  const [tool, setTool] = useState<Tool>('room');
  const [room, setRoom] = useState(rooms[0]?.id ?? '');
  const [floor, setFloor] = useState(Object.keys(s.floors)[0] ?? '');
  const [cat, setCat] = useState<ObjectCategory>('asientos');
  const [objType, setObjType] = useState('chair');
  const [objVariant, setObjVariant] = useState<string | undefined>(undefined);
  const [objColor, setObjColor] = useState<string | undefined>(undefined);
  const [objRot, setObjRot] = useState<0 | 90 | 180 | 270>(0);
  const [objSize, setObjSize] = useState<[number, number] | null>(null);
  const [edgeType, setEdgeType] = useState<'window' | 'door'>('window');
  const [sel, setSel] = useState<string | null>(null);
  const painting = useRef(false);
  const problems = useMemo(() => lintScenario(s), [s]);
  const tint = (roomId: string) => ROOM_TINTS[Math.max(0, rooms.findIndex((r) => r.id === roomId)) % ROOM_TINTS.length];
  const def = objectType(objType);
  const size = objSize ?? def?.size ?? [1, 1];

  const setBoard = (patch: Partial<Scenario['board']>) => onChange({ ...s, board: { ...s.board, ...patch } });

  /* ------------------------------------------------------------ acciones */
  const paintCell = (r: number, c: number) => {
    const i = r * cols + c;
    const cur = cells[i];
    if (tool === 'room') {
      if (room === '__void') {
        if (cur === null) return;
        const next = cells.slice();
        next[i] = null;
        return setBoard({ cells: next, objects: objects.filter((o) => !covers(o, r, c)) });
      }
      if (cur?.room === room) return;
      const next = cells.slice();
      next[i] = { room, floor: cur?.floor ?? floor };
      setBoard({ cells: next });
    } else if (tool === 'floor') {
      if (!cur || cur.floor === floor) return;
      const next = cells.slice();
      next[i] = { ...cur, floor };
      setBoard({ cells: next });
    }
  };

  const covers = (o: ObjectInstance, r: number, c: number) => r >= o.r && r < o.r + o.h && c >= o.c && c < o.c + o.w;

  const placeObject = (r: number, c: number) => {
    const [w, h] = objRot === 90 || objRot === 270 ? [size[1], size[0]] : size;
    if (r + h > rows || c + w > cols) return;
    for (let rr = r; rr < r + h; rr++) for (let cc = c; cc < c + w; cc++) if (!cells[rr * cols + cc] || objects.some((o) => covers(o, rr, cc))) return;
    const id = makeId(`${s.id}-o`, objects.map((o) => o.id));
    const o: ObjectInstance = { id, type: objType, r, c, w, h, rot: objRot || undefined, variant: objVariant, color: objColor };
    setBoard({ objects: [...objects, o] });
  };

  const clickCell = (r: number, c: number) => {
    if (tool === 'object') return placeObject(r, c);
    if (tool === 'label') {
      if (!room || room === '__void') return;
      return onChange({ ...s, labels: { ...(s.labels ?? {}), [room]: { r, c, anchor: s.labels?.[room]?.anchor ?? 'bottom' } } });
    }
    const hit = objects.find((o) => covers(o, r, c));
    if (tool === 'select') return setSel(hit?.id ?? null);
    if (tool === 'erase' && hit) return setBoard({ objects: objects.filter((o) => o.id !== hit.id) });
  };

  const sameEdge = (e: EdgeFeature, r: number, c: number, side: Side) => {
    if (e.r === r && e.c === c && e.side === side) return true;
    const opp: Record<Side, [number, number, Side]> = { top: [r - 1, c, 'bottom'], bottom: [r + 1, c, 'top'], left: [r, c - 1, 'right'], right: [r, c + 1, 'left'] };
    const [r2, c2, s2] = opp[side];
    return e.r === r2 && e.c === c2 && e.side === s2;
  };
  const clickEdge = (r: number, c: number, side: Side) => {
    const existing = edges.find((e) => sameEdge(e, r, c, side));
    if (existing && (tool === 'erase' || existing.type === edgeType)) return setBoard({ edges: edges.filter((e) => e !== existing) });
    if (tool === 'erase') return;
    const id = makeId(`${s.id}-e`, edges.map((e) => e.id));
    setBoard({ edges: [...edges.filter((e) => e !== existing), { id, type: edgeType, r, c, side }] });
  };

  const resize = (nr: number, nc: number) => {
    nr = Math.max(4, Math.min(14, nr));
    nc = Math.max(4, Math.min(14, nc));
    const fill = { room: rooms[0]?.id ?? 'r1', floor: Object.keys(s.floors)[0] ?? 'f1' };
    const next: Scenario['board']['cells'] = [];
    for (let r = 0; r < nr; r++) for (let c = 0; c < nc; c++) next.push(r < rows && c < cols ? cells[r * cols + c] : { ...fill });
    setBoard({ rows: nr, cols: nc, cells: next, objects: objects.filter((o) => o.r + o.h <= nr && o.c + o.w <= nc), edges: edges.filter((e) => e.r < nr && e.c < nc) });
  };

  const updateRoom = (id: string, patch: Partial<RoomSpec>) => setBoard({ rooms: rooms.map((r) => (r.id === id ? { ...r, ...patch } : r)) });
  const addRoom = () => {
    const id = makeId(`${s.id}-division`, rooms.map((r) => r.id));
    setBoard({ rooms: [...rooms, { id, name: `División ${rooms.length + 1}`, article: 'la' }] });
    setRoom(id);
    setTool('room');
  };
  const deleteRoom = (id: string) => {
    if (rooms.length <= 1) return;
    const fallback = rooms.find((r) => r.id !== id)!.id;
    const labels = { ...(s.labels ?? {}) };
    delete labels[id];
    onChange({
      ...s,
      labels,
      board: { ...s.board, rooms: rooms.filter((r) => r.id !== id), cells: cells.map((cell) => (cell && cell.room === id ? { ...cell, room: fallback } : cell)) },
    });
    setRoom(fallback);
  };

  const addFloor = () => {
    const key = makeId('suelo', Object.keys(s.floors));
    onChange({ ...s, floors: { ...s.floors, [key]: { pattern: 'tiles', colors: floorDef('tiles').colors } } });
    setFloor(key);
    setTool('floor');
  };

  const selected = objects.find((o) => o.id === sel);
  const updateObj = (patch: Partial<ObjectInstance>) => selected && setBoard({ objects: objects.map((o) => (o.id === selected.id ? { ...o, ...patch } : o)) });

  /* ------------------------------------------------------- capa interactiva */
  const overlay = (
    <g>
      {tool === 'room' &&
        cells.map((cell, i) =>
          cell ? <rect key={`t${i}`} x={(i % cols) * CELL} y={Math.floor(i / cols) * CELL} width={CELL} height={CELL} fill={tint(cell.room)} opacity={cell.room === room ? 0.32 : 0.12} pointerEvents="none" /> : null,
        )}
      {selected && <rect x={selected.c * CELL + 3} y={selected.r * CELL + 3} width={selected.w * CELL - 6} height={selected.h * CELL - 6} fill="none" stroke="#e63946" strokeWidth={6} strokeDasharray="14 8" pointerEvents="none" />}
      {Array.from({ length: rows * cols }, (_, i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        return (
          <rect
            key={i}
            x={c * CELL}
            y={r * CELL}
            width={CELL}
            height={CELL}
            fill="transparent"
            className="cell-hit"
            onMouseDown={(e) => {
              e.preventDefault();
              painting.current = true;
              paintCell(r, c);
              clickCell(r, c);
            }}
            onMouseEnter={() => painting.current && paintCell(r, c)}
          />
        );
      })}
      {(tool === 'edge' || tool === 'erase') &&
        Array.from({ length: rows * cols }, (_, i) => {
          const r = Math.floor(i / cols);
          const c = i % cols;
          if (!cells[i]) return null;
          const t = 22;
          const sides: [Side, number, number, number, number][] = [
            ['top', c * CELL + t, r * CELL - t / 2, CELL - 2 * t, t],
            ['bottom', c * CELL + t, (r + 1) * CELL - t / 2, CELL - 2 * t, t],
            ['left', c * CELL - t / 2, r * CELL + t, t, CELL - 2 * t],
            ['right', (c + 1) * CELL - t / 2, r * CELL + t, t, CELL - 2 * t],
          ];
          return sides.map(([side, x, y, w, h]) => (
            <rect key={`${i}${side}`} x={x} y={y} width={w} height={h} className="edge-hit" onMouseDown={(e) => (e.stopPropagation(), clickEdge(r, c, side))} />
          ));
        })}
    </g>
  );

  const objectsInCat = OBJECT_TYPES.filter((t) => t.category === cat && t.id !== 'window' && t.id !== 'door');
  const categories = [...new Set(OBJECT_TYPES.map((t) => t.category))].filter((c) => c !== 'pared');

  return (
    <div className="scen-editor" onMouseUp={() => (painting.current = false)} onMouseLeave={() => (painting.current = false)}>
      <div className="scen-head">
        <input className="input title-input" value={s.name} onChange={(e) => onChange({ ...s, name: e.target.value })} />
        <div className="row">
          <span className="muted">Tamaño</span>
          <NumberInput value={rows} min={4} max={14} onChange={(v) => resize(v, v)} />
          <span className="muted">×</span>
          <NumberInput value={cols} min={4} max={14} onChange={(v) => resize(v, v)} />
          <Button small onClick={onDuplicate}>
            Duplicar
          </Button>
          <Button small kind="danger" onClick={onDelete}>
            Borrar
          </Button>
        </div>
      </div>

      <div className="scen-body">
        <div className="scen-tools">
          <div className="toolbar">
            {TOOLS.map((t) => (
              <button key={t.id} className={`tool${tool === t.id ? ' on' : ''}`} onClick={() => setTool(t.id)} title={t.help}>
                <span>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
          <p className="muted small">{TOOLS.find((t) => t.id === tool)?.help}</p>

          {(tool === 'room' || tool === 'label') && (
            <Section title="Divisiones" right={<Button small onClick={addRoom}>+ Añadir</Button>}>
              {rooms.map((r) => (
                <div key={r.id} className={`room-row${room === r.id ? ' on' : ''}`} onClick={() => setRoom(r.id)}>
                  <span className="room-chip" style={{ background: tint(r.id) }} />
                  <input className="input" value={r.name} onChange={(e) => updateRoom(r.id, { name: e.target.value })} />
                  <select className="input select mini" value={r.article} onChange={(e) => updateRoom(r.id, { article: e.target.value as RoomSpec['article'] })} title="Artículo en las pistas">
                    {['el', 'la', 'los', 'las', ''].map((a) => (
                      <option key={a} value={a}>
                        {a || '—'}
                      </option>
                    ))}
                  </select>
                  <button className="icon-btn" title="Borrar división" onClick={(e) => (e.stopPropagation(), deleteRoom(r.id))}>
                    ×
                  </button>
                </div>
              ))}
              <div className={`room-row${room === '__void' ? ' on' : ''}`} onClick={() => setRoom('__void')}>
                <span className="room-chip void" />
                <span className="muted">Fuera del plano (hueco)</span>
              </div>
              {room && room !== '__void' && (
                <div className="row">
                  <Toggle checked={!!rooms.find((r) => r.id === room)?.proper} onChange={(proper) => updateRoom(room, { proper })} label="Nombre propio (no se pone en minúscula)" />
                  <Toggle
                    checked={!!s.labels?.[room]?.hidden}
                    onChange={(hidden) => onChange({ ...s, labels: { ...(s.labels ?? {}), [room]: { ...(s.labels?.[room] ?? { r: 0, c: 0 }), hidden } } })}
                    label="Ocultar etiqueta"
                  />
                </div>
              )}
              {tool === 'label' && room && s.labels?.[room] && (
                <Field label="Posición de la etiqueta en la celda">
                  <Select
                    value={s.labels[room].anchor ?? 'bottom'}
                    onChange={(anchor) => onChange({ ...s, labels: { ...(s.labels ?? {}), [room]: { ...s.labels![room], anchor } } })}
                    options={[
                      { id: 'top', label: 'Arriba' },
                      { id: 'center', label: 'Centro' },
                      { id: 'bottom', label: 'Abajo' },
                    ]}
                  />
                </Field>
              )}
            </Section>
          )}

          {tool === 'floor' && (
            <Section title="Suelos" right={<Button small onClick={addFloor}>+ Añadir</Button>}>
              {Object.entries(s.floors).map(([key, f]) => (
                <div key={key} className={`floor-row${floor === key ? ' on' : ''}`} onClick={() => setFloor(key)}>
                  <svg viewBox="0 0 100 100" className="floor-swatch">
                    {floorDef(f.pattern).render(f.colors[0], f.colors[1])}
                  </svg>
                  <div className="floor-fields">
                    <select
                      className="input select"
                      value={f.pattern}
                      onChange={(e) => onChange({ ...s, floors: { ...s.floors, [key]: { ...f, pattern: e.target.value, colors: floorDef(e.target.value).colors } } })}
                    >
                      {FLOORS.map((fl) => (
                        <option key={fl.id} value={fl.id}>
                          {fl.label}
                        </option>
                      ))}
                    </select>
                    {floor === key && (
                      <>
                        <ColorField value={f.colors[0]} onChange={(v) => onChange({ ...s, floors: { ...s.floors, [key]: { ...f, colors: [v, f.colors[1]] } } })} />
                        <ColorField value={f.colors[1]} onChange={(v) => onChange({ ...s, floors: { ...s.floors, [key]: { ...f, colors: [f.colors[0], v] } } })} />
                        <input
                          className="input"
                          placeholder="Frase para pistas (opcional): «en la arena»"
                          value={f.phrase ?? ''}
                          onChange={(e) => onChange({ ...s, floors: { ...s.floors, [key]: { ...f, phrase: e.target.value || undefined } } })}
                        />
                      </>
                    )}
                  </div>
                </div>
              ))}
            </Section>
          )}

          {tool === 'object' && (
            <Section title="Catálogo de objetos">
              <div className="chips">
                {categories.map((c) => (
                  <button key={c} className={`chip${cat === c ? ' on' : ''}`} onClick={() => setCat(c)}>
                    {CATEGORY_LABEL[c]}
                  </button>
                ))}
              </div>
              <div className="obj-grid">
                {objectsInCat.map((t) => (
                  <button
                    key={t.id}
                    className={`obj-tile${objType === t.id ? ' on' : ''}`}
                    onClick={() => {
                      setObjType(t.id);
                      setObjVariant(undefined);
                      setObjColor(undefined);
                      setObjSize(null);
                      setObjRot(0);
                    }}
                    title={`${t.noun.sing} (${t.occupiable ? 'se puede ocupar' : 'no se puede ocupar'})`}
                  >
                    <svg viewBox={`-6 -6 ${t.size[0] * 100 + 12} ${t.size[1] * 100 + 12}`}>
                      {OBJECT_RENDERERS[t.id]?.({ w: t.size[0], h: t.size[1], W: t.size[0] * 100, H: t.size[1] * 100, color: t.color, variant: t.variants?.[0], uid: `cat-${t.id}` })}
                    </svg>
                    <span>{t.noun.sing}</span>
                    <i className={t.occupiable ? 'occ yes' : 'occ no'}>{t.occupiable ? 'ocupable' : 'bloquea'}</i>
                  </button>
                ))}
              </div>
              {def && (
                <div className="grid2">
                  {def.variants && (
                    <Field label="Variante">
                      <Select value={objVariant ?? def.variants[0]} onChange={setObjVariant} options={def.variants.map((v) => ({ id: v, label: v }))} />
                    </Field>
                  )}
                  <Field label="Giro">
                    <Select value={String(objRot)} onChange={(v) => setObjRot(Number(v) as 0 | 90 | 180 | 270)} options={['0', '90', '180', '270'].map((v) => ({ id: v, label: `${v}°` }))} />
                  </Field>
                  <Field label="Ancho × alto (celdas)">
                    <div className="row">
                      <NumberInput value={size[0]} min={1} max={6} onChange={(w) => setObjSize([w, size[1]])} />
                      <NumberInput value={size[1]} min={1} max={6} onChange={(h) => setObjSize([size[0], h])} />
                    </div>
                  </Field>
                  <Field label="Color">
                    <ColorField value={objColor ?? def.color} onChange={setObjColor} />
                  </Field>
                </div>
              )}
            </Section>
          )}

          {tool === 'edge' && (
            <Section title="Pared">
              <div className="row">
                <Button small kind={edgeType === 'window' ? 'primary' : 'secondary'} onClick={() => setEdgeType('window')}>
                  🪟 Ventana
                </Button>
                <Button small kind={edgeType === 'door' ? 'primary' : 'secondary'} onClick={() => setEdgeType('door')}>
                  🚪 Puerta
                </Button>
              </div>
              <p className="muted small">Las ventanas cuentan para las pistas «delante de una ventana». Las puertas son decorativas salvo que tú las uses en una pista.</p>
            </Section>
          )}

          {tool === 'select' && (
            <Section title="Objeto seleccionado">
              {selected ? (
                <>
                  <p>
                    <b>{objectType(selected.type)?.noun.sing ?? selected.type}</b> en fila {selected.r + 1}, columna {selected.c + 1}
                  </p>
                  <div className="grid2">
                    {objectType(selected.type)?.variants && (
                      <Field label="Variante">
                        <Select
                          value={selected.variant ?? objectType(selected.type)!.variants![0]}
                          onChange={(variant) => updateObj({ variant })}
                          options={objectType(selected.type)!.variants!.map((v) => ({ id: v, label: v }))}
                        />
                      </Field>
                    )}
                    <Field label="Giro">
                      <Select
                        value={String(selected.rot ?? 0)}
                        onChange={(v) => {
                          const rot = Number(v) as 0 | 90 | 180 | 270;
                          const swapNow = (selected.rot ?? 0) % 180 !== rot % 180;
                          updateObj({ rot: rot || undefined, ...(swapNow ? { w: selected.h, h: selected.w } : {}) });
                        }}
                        options={['0', '90', '180', '270'].map((v) => ({ id: v, label: `${v}°` }))}
                      />
                    </Field>
                    <Field label="Ancho × alto">
                      <div className="row">
                        <NumberInput value={selected.w} min={1} max={8} onChange={(w) => updateObj({ w })} />
                        <NumberInput value={selected.h} min={1} max={8} onChange={(h) => updateObj({ h })} />
                      </div>
                    </Field>
                    <Field label="Color">
                      <ColorField value={selected.color ?? objectType(selected.type)?.color ?? '#cccccc'} onChange={(color) => updateObj({ color })} />
                    </Field>
                    {selected.type === 'sign' && (
                      <Field label="Texto del cartel">
                        <TextInput value={selected.label ?? ''} onChange={(label) => updateObj({ label })} />
                      </Field>
                    )}
                  </div>
                  <div className="row">
                    <Button small onClick={() => updateObj({ r: Math.max(0, selected.r - 1) })}>⬆️</Button>
                    <Button small onClick={() => updateObj({ r: Math.min(rows - selected.h, selected.r + 1) })}>⬇️</Button>
                    <Button small onClick={() => updateObj({ c: Math.max(0, selected.c - 1) })}>⬅️</Button>
                    <Button small onClick={() => updateObj({ c: Math.min(cols - selected.w, selected.c + 1) })}>➡️</Button>
                    <Button
                      small
                      kind="danger"
                      onClick={() => {
                        setBoard({ objects: objects.filter((o) => o.id !== selected.id) });
                        setSel(null);
                      }}
                    >
                      Quitar
                    </Button>
                  </div>
                </>
              ) : (
                <p className="muted">Haz clic en un objeto del plano.</p>
              )}
            </Section>
          )}

          <Section title="Notas" defaultOpen={false}>
            <textarea className="input textarea" rows={3} value={s.notes ?? ''} placeholder="Notas para ti (no se imprimen)" onChange={(e) => onChange({ ...s, notes: e.target.value })} />
          </Section>
        </div>

        <div className="scen-canvas">
          <div className="board-wrap">
            <BoardView scenario={s} width="100%" overlay={overlay} pad={30} />
          </div>
          <div className={`lint${problems.length ? ' bad' : ''}`}>
            {problems.length ? (
              problems.map((p) => <div key={p}>⚠️ {p}</div>)
            ) : (
              <div>
                ✅ Plano válido: cada fila y columna tiene sitio. Este escenario es para <b>{rows}</b> personajes.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
