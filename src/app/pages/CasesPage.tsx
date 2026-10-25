/**
 * Constructor de murdokus: reparto, objetivo, historia, generador de pistas,
 * textos de la página y vista previa con su solución.
 */
import { useMemo, useState } from 'react';
import { Avatar } from '../../assets/avatar/Avatar';
import { HATS, OUTFITS, GLASSES, type AvatarSpec } from '../../assets/avatar/types';
import { OBJECT_TYPES } from '../../catalog/objectTypes';
import { CaseLeftPage, CaseRightPage } from '../../book/CaseSpread';
import { orderedCases } from '../../book/Book';
import { SolutionsPage } from '../../book/Solutions';
import { caseAvatar, caseClueText, caseContext, displayName } from '../../domain/caseModel';
import { newCase, PAGE_COLORS } from '../../domain/defaults';
import { caseReadiness } from '../../domain/regenerate';
import type { CaseFile, CasePerson } from '../../domain/types';
import { TIERS, type Clue, type Pin } from '../../engine';
import { BoardView } from '../../render/BoardView';
import { CharacterPicker } from '../components/CharacterPicker';
import { PagePreview } from '../components/PagePreview';
import { Badge, Button, ColorField, Empty, Field, NumberInput, Section, Select, TextArea, TextInput, Toggle, useToast } from '../components/ui';
import { analyzeInWorker, generateInWorker } from '../lib/generator';
import { go } from '../lib/router';
import { makeId } from '../lib/util';
import { fullCaseOrder, useProject } from '../store/projectStore';

const TIER_COLORS = ['#9cd3a8', '#a9cbe8', '#f2d27a', '#f2a679', '#e58a9b'];

export function CasesPage({ selectedId }: { selectedId?: string }) {
  const { project, upsertCase, deleteCase } = useProject();
  const [toast, showToast] = useToast();
  const cases = orderedCases(project);
  const selected = project.cases.find((c) => c.id === selectedId);

  const create = () => {
    const id = makeId('caso', project.cases.map((c) => c.id));
    const scen = project.scenarios[0];
    upsertCase({ ...newCase(id, scen?.id ?? ''), pageColor: PAGE_COLORS[project.cases.length % PAGE_COLORS.length] });
    go('casos', id);
  };
  const duplicate = (c: CaseFile) => {
    const id = makeId(c.id + '-copia', project.cases.map((x) => x.id));
    upsertCase({ ...structuredClone(c), id, title: c.title + ' (copia)' });
    go('casos', id);
  };
  const remove = (c: CaseFile) => {
    if (!confirm(`¿Borrar el caso «${c.title}»?`)) return;
    deleteCase(c.id);
    go('casos');
    showToast('Caso borrado.');
  };

  return (
    <div className="split">
      <aside className="sidebar">
        <div className="sidebar-actions">
          <Button kind="primary" small onClick={create}>
            + Nuevo murdoku
          </Button>
        </div>
        <div className="sidebar-list">
          {cases.map((c, i) => {
            const scen = project.scenarios.find((s) => s.id === c.scenarioId);
            return (
              <button key={c.id} className={`list-item${c.id === selectedId ? ' on' : ''}`} onClick={() => go('casos', c.id)}>
                <span className="case-num" style={{ background: c.pageColor }}>
                  {i + 1}
                </span>
                <span className="list-text">
                  <b>{c.title}</b>
                  <small>
                    {scen ? `${scen.board.rows}×${scen.board.cols}` : 'sin escenario'}
                    {c.difficulty ? ` · ${c.difficulty.label}` : ' · sin pistas'}
                  </small>
                </span>
              </button>
            );
          })}
        </div>
      </aside>
      <section className="workspace">
        {selected ? (
          <CaseEditor key={selected.id} caseFile={selected} number={fullCaseOrder(project).indexOf(selected.id) + 1} onDuplicate={() => duplicate(selected)} onDelete={() => remove(selected)} />
        ) : (
          <Empty>
            <h2>Elige un murdoku o crea uno nuevo</h2>
            <p>Cada murdoku es una doble página: a la izquierda los sospechosos y sus pistas; a la derecha el plano, la plantilla para tachar y el papelito con la pregunta.</p>
          </Empty>
        )}
      </section>
      {toast}
    </div>
  );
}

function CaseEditor({ caseFile: c, number, onDuplicate, onDelete }: { caseFile: CaseFile; number: number; onDuplicate: () => void; onDelete: () => void }) {
  const { project, upsertCase } = useProject();
  const [picker, setPicker] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [lookFor, setLookFor] = useState<string | null>(null);
  const scen = project.scenarios.find((s) => s.id === c.scenarioId);
  const set = (patch: Partial<CaseFile>) => upsertCase({ ...c, ...patch });
  const gen = c.generator ?? { tier: suggestedTier(scen?.board.rows ?? 6), seed: 1 };
  const setGen = (patch: Partial<NonNullable<CaseFile['generator']>>) => set({ generator: { ...gen, ...patch } });
  const pins = gen.pins ?? [];
  const ctx = useMemo(() => caseContext(project, c), [project, c]);
  const readiness = caseReadiness(project, c);

  const addPeople = (ids: string[]) => {
    set({ people: [...c.people, ...ids.map((id) => ({ characterId: id }))] });
    setPicker(false);
  };
  const removePerson = (id: string) =>
    set({
      people: c.people.filter((p) => p.characterId !== id),
      targetId: c.targetId === id ? '' : c.targetId,
      clues: c.clues.filter((cl) => !('p' in cl) || cl.p !== id),
      generator: { ...gen, pins: pins.filter((p) => p.p !== id), culpritId: gen.culpritId === id ? undefined : gen.culpritId },
    });
  const updatePerson = (id: string, patch: Partial<CasePerson>) => set({ people: c.people.map((p) => (p.characterId === id ? { ...p, ...patch } : p)) });

  const pinRooms = (id: string) => pins.find((p) => p.p === id)?.rooms ?? [];
  const togglePinRoom = (id: string, roomId: string) => {
    const cur = pinRooms(id);
    const rooms = cur.includes(roomId) ? cur.filter((r) => r !== roomId) : [...cur, roomId];
    const others = pins.filter((p) => p.p !== id);
    setGen({ pins: rooms.length ? [...others, { p: id, rooms } as Pin] : others });
  };

  const generate = async () => {
    setBusy(true);
    setStatus({ ok: true, text: 'Pensando pistas… (puede tardar unos segundos en planos grandes)' });
    const res = await generateInWorker(project, c, { tier: gen.tier, seed: gen.seed, culpritId: gen.culpritId, pins, fixedClues: gen.fixedClues });
    setBusy(false);
    if (!res.ok) return setStatus({ ok: false, text: res.error });
    upsertCase(res.caseFile);
    setStatus({ ok: res.success, text: res.success ? `¡Listo! ${res.message}` : `Atención: ${res.message}` });
  };

  const recheck = async (next: CaseFile) => {
    upsertCase(next);
    setBusy(true);
    const res = await analyzeInWorker(project, next);
    setBusy(false);
    if (res.ok) {
      upsertCase(res.caseFile);
      const a = res.caseFile;
      setStatus(a.solution && a.culpritId ? { ok: true, text: `Solución única · ${a.difficulty?.label} (${a.difficulty?.score} puntos).` } : { ok: false, text: 'Con estas pistas el caso no tiene solución única.' });
    }
  };

  const removeClue = (i: number) => recheck({ ...c, clues: c.clues.filter((_, k) => k !== i) });
  const addFlavor = (p: string, text: string) => text.trim() && set({ clues: [...c.clues, { kind: 'flavor', p, text: text.trim() } as Clue] });

  const roomsOf = scen?.board.rooms ?? [];
  const legendOptions = useMemo(() => [...new Set((scen?.board.objects ?? []).map((o) => o.type))], [scen]);
  const culprit = c.culpritId ? displayName(project, c, c.culpritId) : null;

  return (
    <div className="case-editor">
      <div className="case-form">
        <div className="scen-head">
          <input className="input title-input" value={c.title} onChange={(e) => set({ title: e.target.value })} />
          <div className="row">
            <Button small onClick={() => go('imprimir', 'caso', c.id)}>
              🖨️ Imprimir caso + solución
            </Button>
            <Button small onClick={onDuplicate}>
              Duplicar
            </Button>
            <Button small kind="danger" onClick={onDelete}>
              Borrar
            </Button>
          </div>
        </div>

        <Section title="1 · La historia">
          <Field label="Texto bajo el título" wide>
            <TextArea value={c.subtitle} onChange={(subtitle) => set({ subtitle })} rows={2} />
          </Field>
          <Field label="Color de la página">
            <ColorField value={c.pageColor} onChange={(pageColor) => set({ pageColor })} swatches={PAGE_COLORS.map((id) => ({ id }))} />
          </Field>
        </Section>

        <Section title="2 · Escenario">
          <div className="row">
            <Select
              value={c.scenarioId}
              onChange={(scenarioId) => set({ scenarioId, generator: { ...gen, pins: [] } })}
              options={[{ id: '', label: '— Elige un escenario —' }, ...project.scenarios.map((s) => ({ id: s.id, label: `${s.name} (${s.board.rows}×${s.board.cols})` }))]}
            />
            {scen && (
              <Button small kind="ghost" onClick={() => go('escenarios', scen.id)}>
                Editar escenario
              </Button>
            )}
          </div>
          {scen && (
            <div className="scen-thumb">
              <BoardView scenario={scen} width={220} />
              <p className="muted small">
                Necesita <b>{scen.board.rows}</b> personajes (contando el objetivo). Ahora hay <b>{c.people.length}</b>.
              </p>
            </div>
          )}
        </Section>

        <Section title="3 · Reparto" right={<Button small onClick={() => setPicker(true)}>+ Añadir</Button>}>
          {c.people.length === 0 && <p className="muted">Añade a los sospechosos y al objetivo (la víctima, la croqueta, el corazón…).</p>}
          <div className="cast">
            {c.people.map((p) => {
              const av = caseAvatar(project, c, p.characterId);
              const isTarget = c.targetId === p.characterId;
              return (
                <div key={p.characterId} className={`cast-item${isTarget ? ' target' : ''}`}>
                  <div className="cast-photo">{av && <Avatar spec={av} size="100%" crossed={isTarget} />}</div>
                  <input className="input mini-name" value={p.nameOverride ?? displayName(project, c, p.characterId)} onChange={(e) => updatePerson(p.characterId, { nameOverride: e.target.value || undefined })} title="Nombre en este caso" />
                  <div className="cast-actions">
                    <button className={`chip${isTarget ? ' on' : ''}`} onClick={() => set({ targetId: p.characterId })} title="Marcar como objetivo">
                      🎯 Objetivo
                    </button>
                    <button className="chip" onClick={() => setLookFor(lookFor === p.characterId ? null : p.characterId)} title="Vestuario solo en este caso">
                      👕
                    </button>
                    <button className="chip" onClick={() => removePerson(p.characterId)} title="Quitar del caso">
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {lookFor && <LookEditor person={c.people.find((p) => p.characterId === lookFor)!} onChange={(avatarOverride) => updatePerson(lookFor, { avatarOverride })} />}
        </Section>

        <Section title="4 · Objetivo y pregunta">
          <div className="grid2">
            <Field label="Rótulo del objetivo" hint="«La víctima.», «La croqueta.»">
              <TextInput value={c.targetLabel} onChange={(targetLabel) => set({ targetLabel })} />
            </Field>
            <Field label="Pregunta del papelito" hint="«El asesino es...», «Se la comió...»">
              <TextInput value={c.question} onChange={(question) => set({ question })} />
            </Field>
            <Field label="Cómo se llama al culpable" hint="«el asesino», «quien se la comió»">
              <TextInput value={c.culpritRef} onChange={(culpritRef) => set({ culpritRef })} />
            </Field>
            <Field label="Remate de la solución" hint="«por exceso de besos»">
              <TextInput value={c.answerNote ?? ''} onChange={(answerNote) => set({ answerNote: answerNote || undefined })} />
            </Field>
            <Field label="Texto del objetivo (opcional)" hint="Si lo dejas vacío se escribe solo." wide>
              <TextInput value={c.targetText ?? ''} onChange={(targetText) => set({ targetText: targetText || undefined })} />
            </Field>
          </div>
        </Section>

        <Section title="5 · ¿Dónde estaba cada uno en tu recuerdo?" defaultOpen={false}>
          <p className="muted small">Opcional. Marca las divisiones en las que puede estar cada persona y el generador lo respetará (por ejemplo: Ana en el jacuzzi). Sin marcas, puede estar en cualquier sitio.</p>
          {c.people.map((p) => (
            <div key={p.characterId} className="pin-row">
              <b>{displayName(project, c, p.characterId)}</b>
              <div className="chips">
                {roomsOf.map((r) => (
                  <button key={r.id} className={`chip${pinRooms(p.characterId).includes(r.id) ? ' on' : ''}`} onClick={() => togglePinRoom(p.characterId, r.id)}>
                    {r.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </Section>

        <Section title="6 · Generar pistas">
          <div className="grid2">
            <Field label="Dificultad">
              <Select value={String(gen.tier)} onChange={(v) => setGen({ tier: Number(v) })} options={TIERS.map((t) => ({ id: String(t.id), label: `${t.id}. ${t.name} — ${t.description}` }))} />
            </Field>
            <Field label="Culpable">
              <Select
                value={gen.culpritId ?? ''}
                onChange={(v) => setGen({ culpritId: v || undefined })}
                options={[{ id: '', label: 'Que lo decida el generador' }, ...c.people.filter((p) => p.characterId !== c.targetId).map((p) => ({ id: p.characterId, label: displayName(project, c, p.characterId) }))]}
              />
            </Field>
            <Field label="Semilla" hint="Cambia el número para obtener otro reparto de pistas.">
              <div className="row">
                <NumberInput value={gen.seed} onChange={(seed) => setGen({ seed })} />
                <Button small onClick={() => setGen({ seed: Math.floor(Math.random() * 100000) })}>
                  🎲
                </Button>
              </div>
            </Field>
          </div>
          {readiness.length > 0 && <div className="lint bad">{readiness.map((r) => <div key={r}>⚠️ {r}</div>)}</div>}
          <div className="row">
            <Button kind="primary" onClick={generate} disabled={busy || readiness.length > 0}>
              {busy ? 'Generando…' : c.clues.length ? '✨ Generar otras pistas' : '✨ Generar pistas'}
            </Button>
            {c.difficulty && (
              <Badge color={TIER_COLORS[Math.min(4, Math.max(0, c.difficulty.level - 1))]}>
                {c.difficulty.label} · {c.difficulty.score} pts
              </Badge>
            )}
            {culprit && <span className="muted">Respuesta: <b>{culprit}</b></span>}
          </div>
          {status && <div className={`status${status.ok ? ' ok' : ' bad'}`}>{status.text}</div>}
        </Section>

        <Section title={`7 · Pistas (${c.clues.length})`} defaultOpen={c.clues.length > 0}>
          {ctx &&
            c.clues.map((cl, i) => {
              const who = 'p' in cl && cl.p ? displayName(project, c, cl.p) : 'Pista general';
              return (
                <div key={i} className="clue-row">
                  <span className="clue-who">{who}</span>
                  <span className="clue-text">{cl.kind === 'flavor' ? <i>{(cl as { text: string }).text}</i> : caseClueText(ctx, cl).replace(/\*\*/g, '')}</span>
                  {cl.kind !== 'targetAloneWithCulprit' && (
                    <button className="icon-btn" title="Quitar pista y comprobar" onClick={() => removeClue(i)}>
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          <FlavorAdder people={c.people.filter((p) => p.characterId !== c.targetId).map((p) => ({ id: p.characterId, name: displayName(project, c, p.characterId) }))} onAdd={addFlavor} />
          <div className="row">
            <Button small onClick={() => recheck(c)} disabled={busy || !c.clues.length}>
              🔎 Comprobar solución
            </Button>
            <Toggle checked={c.boldKeywords} onChange={(boldKeywords) => set({ boldKeywords })} label="Palabras clave en negrita (casos fáciles)" />
          </div>
        </Section>

        <Section title="8 · Pósit, consejo y leyenda" defaultOpen={false}>
          <Field label="Pósit (nota del comisario)" wide>
            <TextArea
              value={c.postIt?.text ?? ''}
              onChange={(text) => set({ postIt: text ? { text, signature: c.postIt?.signature ?? project.book.narratorName } : undefined })}
              placeholder="Dicen que nunca olvidas tu primer caso…"
            />
          </Field>
          {c.postIt && (
            <Field label="Firma del pósit">
              <TextInput value={c.postIt.signature} onChange={(signature) => set({ postIt: { ...c.postIt!, signature } })} />
            </Field>
          )}
          <div className="grid2">
            <Field label="Consejo (título)">
              <TextInput value={c.tip?.title ?? ''} onChange={(title) => set({ tip: title || c.tip?.text ? { title, text: c.tip?.text ?? '' } : undefined })} placeholder="Consejo:" />
            </Field>
            <Field label="Consejo (texto)">
              <TextInput value={c.tip?.text ?? ''} onChange={(text) => set({ tip: text || c.tip?.title ? { title: c.tip?.title ?? 'Consejo:', text } : undefined })} />
            </Field>
          </div>
          <Field label="Recuadros de leyenda (explican objetos especiales)">
            <div className="chips">
              {legendOptions.map((t) => {
                const on = (c.legend ?? []).includes(t);
                return (
                  <button key={t} className={`chip${on ? ' on' : ''}`} onClick={() => set({ legend: on ? (c.legend ?? []).filter((x) => x !== t) : [...(c.legend ?? []), t] })}>
                    {OBJECT_TYPES.find((o) => o.id === t)?.noun.sing ?? t}
                  </button>
                );
              })}
            </div>
          </Field>
        </Section>
      </div>

      <div className="case-preview">
        <div className="row">
          <Button small kind={showSolution ? 'secondary' : 'primary'} onClick={() => setShowSolution(false)}>
            Doble página
          </Button>
          <Button small kind={showSolution ? 'primary' : 'secondary'} onClick={() => setShowSolution(true)}>
            Solución
          </Button>
        </div>
        {showSolution ? (
          <PagePreview width={420}>
            <SolutionsPage project={project} items={[{ c, number }]} side="left" />
          </PagePreview>
        ) : (
          <div className="preview-stack">
            <PagePreview width={420}>
              <CaseLeftPage project={project} caseFile={c} number={number} />
            </PagePreview>
            <PagePreview width={420}>
              <CaseRightPage project={project} caseFile={c} number={number} />
            </PagePreview>
          </div>
        )}
      </div>
      {picker && <CharacterPicker characters={project.characters} exclude={c.people.map((p) => p.characterId)} onPick={addPeople} onClose={() => setPicker(false)} />}
    </div>
  );
}

function suggestedTier(size: number): number {
  return size <= 6 ? 1 : size === 7 ? 2 : size <= 9 ? 3 : size === 10 ? 4 : 5;
}

/** Cambios de aspecto solo para este caso. */
function LookEditor({ person, onChange }: { person: CasePerson; onChange: (o: Partial<AvatarSpec> | undefined) => void }) {
  const o = person.avatarOverride ?? {};
  const set = (patch: Partial<AvatarSpec>) => {
    const next = { ...o, ...patch };
    Object.keys(next).forEach((k) => (next as Record<string, unknown>)[k] === undefined && delete (next as Record<string, unknown>)[k]);
    onChange(Object.keys(next).length ? next : undefined);
  };
  const none = { id: '', label: '— Como siempre —' };
  return (
    <div className="look-editor">
      <b>Vestuario solo para este caso</b>
      <div className="grid3">
        <Field label="Ropa">
          <Select value={(o.outfit ?? '') as string} onChange={(v) => set({ outfit: (v || undefined) as AvatarSpec['outfit'] })} options={[none, ...OUTFITS]} />
        </Field>
        <Field label="Gorro">
          <Select value={(o.hat ?? '') as string} onChange={(v) => set({ hat: (v || undefined) as AvatarSpec['hat'] })} options={[none, ...HATS]} />
        </Field>
        <Field label="Gafas">
          <Select value={(o.glasses ?? '') as string} onChange={(v) => set({ glasses: (v || undefined) as AvatarSpec['glasses'] })} options={[none, ...GLASSES]} />
        </Field>
        <Field label="Color de la ropa">
          <ColorField value={o.outfitColor ?? '#ffffff'} onChange={(outfitColor) => set({ outfitColor })} />
        </Field>
        <Field label="Color del gorro">
          <ColorField value={o.hatColor ?? '#ffffff'} onChange={(hatColor) => set({ hatColor })} />
        </Field>
      </div>
      <Button small kind="ghost" onClick={() => onChange(undefined)}>
        Quitar cambios
      </Button>
    </div>
  );
}

function FlavorAdder({ people, onAdd }: { people: { id: string; name: string }[]; onAdd: (p: string, text: string) => void }) {
  const [p, setP] = useState(people[0]?.id ?? '');
  const [text, setText] = useState('');
  if (!people.length) return null;
  return (
    <div className="flavor-adder">
      <span className="muted small">Frase extra sin efecto en el acertijo (para darle gracia):</span>
      <div className="row">
        <Select value={p} onChange={setP} options={people.map((x) => ({ id: x.id, label: x.name }))} />
        <input className="input" value={text} placeholder="Juraba que solo había bebido agua." onChange={(e) => setText(e.target.value)} />
        <Button
          small
          onClick={() => {
            onAdd(p, text);
            setText('');
          }}
        >
          Añadir
        </Button>
      </div>
    </div>
  );
}
