/**
 * Gestor del libro: orden de los casos, portada, contraportada, textos de
 * instrucciones y vista previa completa antes de imprimir.
 */
import { useState } from 'react';
import { Avatar } from '../../assets/avatar/Avatar';
import { allPages, spreads } from '../../book/Book';
import { DEFAULT_TEXTS, type TextKey } from '../../domain/bookTexts';
import { displayName } from '../../domain/caseModel';
import { CharacterPicker } from '../components/CharacterPicker';
import { SpreadPreview } from '../components/PagePreview';
import { Badge, Button, ColorField, Field, NumberInput, Section, Select, TextArea, TextInput, Toggle } from '../components/ui';
import { go } from '../lib/router';
import { fullCaseOrder, useProject } from '../store/projectStore';

type Tab = 'orden' | 'portada' | 'textos' | 'vista';

const TEXT_GROUPS: { title: string; keys: TextKey[] }[] = [
  { title: 'Bienvenida y reglas', keys: ['welcomeTitle', 'welcomeText', 'goalTitle', 'goalText', 'overviewTitle', 'overviewIntro', 'rule1', 'rule2', 'rule3', 'rule4', 'twistTitle', 'twistText'] },
  { title: 'Ejemplo paso a paso', keys: ['stepTitle', 'stepIntro', 'noteBeside', 'cluesTitle', 'cluesStep1', 'importantTitle', 'importantText', 'importantA', 'importantB', 'cluesStep2', 'cluesStep3', 'step4', 'step5', 'culpritTitle', 'culpritText', 'culpritCaption', 'narratorBubble2', 'doubtsTitle', 'doubtsText'] },
  { title: 'Objetos y consejos', keys: ['objectsTitle', 'canTitle', 'cannotTitle', 'windowTitle', 'windowNote', 'tipsTitle', 'tip1Title', 'tip1', 'tip2Title', 'tip2', 'tip3Title', 'tip3'] },
  { title: 'Glosario y agradecimientos', keys: ['glossaryTitle', 'ackTitle', 'acknowledgements'] },
];

export function BookPage() {
  const [tab, setTab] = useState<Tab>('orden');
  return (
    <div className="book-manager">
      <div className="subtabs">
        {(
          [
            ['orden', '📚 Orden de los casos'],
            ['portada', '🎀 Portada y contraportada'],
            ['textos', '✍️ Textos e instrucciones'],
            ['vista', '👀 Vista previa e impresión'],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button key={id} className={`subtab${tab === id ? ' on' : ''}`} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>
      {tab === 'orden' && <OrderTab />}
      {tab === 'portada' && <CoverTab />}
      {tab === 'textos' && <TextsTab />}
      {tab === 'vista' && <PreviewTab />}
    </div>
  );
}

function OrderTab() {
  const { project, moveCase } = useProject();
  const order = fullCaseOrder(project);
  const [drag, setDrag] = useState<string | null>(null);
  return (
    <div className="card">
      <p className="muted">Arrastra los casos (o usa las flechas) para cambiar el orden. Lo ideal es ir de menos a más difícil y dejar el más especial para el final.</p>
      <ol className="order-list">
        {order.map((id, i) => {
          const c = project.cases.find((x) => x.id === id)!;
          const scen = project.scenarios.find((s) => s.id === c.scenarioId);
          return (
            <li
              key={id}
              className={`order-item${drag === id ? ' dragging' : ''}`}
              draggable
              onDragStart={() => setDrag(id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (drag && drag !== id) moveCase(drag, i);
                setDrag(null);
              }}
              onDragEnd={() => setDrag(null)}
            >
              <span className="case-num" style={{ background: c.pageColor }}>
                {i + 1}
              </span>
              <span className="order-title">
                <b>{c.title}</b>
                <small>
                  {scen?.name ?? 'sin escenario'} · {scen ? `${scen.board.rows}×${scen.board.cols}` : ''} · culpable: {c.culpritId ? displayName(project, c, c.culpritId) : '¿?'}
                </small>
              </span>
              {c.difficulty ? <Badge>{c.difficulty.label} · {c.difficulty.score}</Badge> : <Badge color="#f6d6d6">sin pistas</Badge>}
              <Button small kind="ghost" onClick={() => moveCase(id, i - 1)} disabled={i === 0}>
                ▲
              </Button>
              <Button small kind="ghost" onClick={() => moveCase(id, i + 1)} disabled={i === order.length - 1}>
                ▼
              </Button>
              <Button small onClick={() => go('casos', id)}>
                Editar
              </Button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function CoverTab() {
  const { project, updateBook } = useProject();
  const b = project.book;
  const [picker, setPicker] = useState<'cover' | 'back' | null>(null);
  const cover = project.scenarios.find((s) => s.id === b.coverScenarioId);
  const name = (id: string) => project.characters.find((c) => c.id === id)?.name ?? id;
  const avatar = (id: string) => project.characters.find((c) => c.id === id)?.avatar;
  return (
    <div className="two-cols">
      <div>
        <Section title="Portada">
          <div className="grid2">
            <Field label="Título (el corazón sustituye a la primera «O»)">
              <TextInput value={b.title} onChange={(title) => updateBook({ title })} />
            </Field>
            <Field label="Subtítulo" hint="Las palabras entre *asteriscos* salen en rojo.">
              <TextInput value={b.subtitle} onChange={(subtitle) => updateBook({ subtitle })} />
            </Field>
            <Field label="Autor">
              <TextInput value={b.author} onChange={(author) => updateBook({ author })} />
            </Field>
            <Field label="Editorial (inventada)">
              <TextInput value={b.publisher} onChange={(publisher) => updateBook({ publisher })} />
            </Field>
            <Field label="Color de portada">
              <ColorField value={b.coverColor} onChange={(coverColor) => updateBook({ coverColor })} swatches={['#7b2a5a', '#1d3557', '#2a9d8f', '#c0392b', '#e76f51', '#3f6f5a', '#5b3a6b', '#1f1f1f'].map((id) => ({ id }))} />
            </Field>
            <Field label="Escenario de la portada">
              <Select value={b.coverScenarioId ?? ''} onChange={(v) => updateBook({ coverScenarioId: v || undefined })} options={[{ id: '', label: '— Ninguno —' }, ...project.scenarios.map((s) => ({ id: s.id, label: s.name }))]} />
            </Field>
          </div>
          <Field label="Retratos sobre el plano de la portada (fila y columna empiezan en 0)">
            <div className="portraits">
              {b.coverPortraits.map((cp, i) => (
                <div key={i} className="portrait-row">
                  {avatar(cp.characterId) && <Avatar spec={avatar(cp.characterId)!} size={36} />}
                  <b>{name(cp.characterId)}</b>
                  <span className="muted">fila</span>
                  <NumberInput value={cp.r} min={0} max={(cover?.board.rows ?? 12) - 1} onChange={(r) => updateBook({ coverPortraits: b.coverPortraits.map((x, k) => (k === i ? { ...x, r } : x)) })} />
                  <span className="muted">col.</span>
                  <NumberInput value={cp.c} min={0} max={(cover?.board.cols ?? 12) - 1} onChange={(c) => updateBook({ coverPortraits: b.coverPortraits.map((x, k) => (k === i ? { ...x, c } : x)) })} />
                  <button className="icon-btn" onClick={() => updateBook({ coverPortraits: b.coverPortraits.filter((_, k) => k !== i) })}>
                    ×
                  </button>
                </div>
              ))}
              <Button small onClick={() => setPicker('cover')}>
                + Añadir retrato
              </Button>
            </div>
          </Field>
        </Section>
        <Section title="Primeras páginas">
          <Field label="Dedicatoria" wide>
            <TextArea value={b.dedication} onChange={(dedication) => updateBook({ dedication })} rows={3} />
          </Field>
          <Field label="Créditos (página legal de broma)" wide>
            <TextArea value={b.credits} onChange={(credits) => updateBook({ credits })} rows={8} />
          </Field>
          <div className="grid2">
            <Field label="Firma del narrador (pósits)">
              <TextInput value={b.narratorName} onChange={(narratorName) => updateBook({ narratorName })} />
            </Field>
            <Field label="Personaje narrador (instrucciones)">
              <Select
                value={b.narratorCharacterId ?? ''}
                onChange={(v) => updateBook({ narratorCharacterId: v || undefined })}
                options={[{ id: '', label: '— Ninguno —' }, ...project.characters.filter((c) => c.avatar.kind === 'person').map((c) => ({ id: c.id, label: c.name }))]}
              />
            </Field>
          </div>
        </Section>
        <Section title="Contraportada">
          <div className="grid2">
            <Field label="Pregunta grande">
              <TextInput value={b.backCover.question} onChange={(question) => updateBook({ backCover: { ...b.backCover, question } })} />
            </Field>
            <Field label="Texto del código de barras">
              <TextInput value={b.backCover.answer} onChange={(answer) => updateBook({ backCover: { ...b.backCover, answer } })} />
            </Field>
            <Field label="Resumen" wide>
              <TextArea value={b.backCover.blurb} onChange={(blurb) => updateBook({ backCover: { ...b.backCover, blurb } })} />
            </Field>
            <Field label="Pósit del corcho" wide>
              <TextArea value={b.backCover.note ?? ''} onChange={(note) => updateBook({ backCover: { ...b.backCover, note: note || undefined } })} rows={2} />
            </Field>
          </div>
          <Field label="Fotos clavadas en el corcho">
            <div className="row">
              {b.backCover.characterIds.map((id) => (
                <span key={id} className="chip on" onClick={() => updateBook({ backCover: { ...b.backCover, characterIds: b.backCover.characterIds.filter((x) => x !== id) } })} title="Quitar">
                  {name(id)} ×
                </span>
              ))}
              <Button small onClick={() => setPicker('back')}>
                + Añadir foto
              </Button>
            </div>
          </Field>
        </Section>
        <Section title="Impresión">
          <Toggle checked={b.pageNumbers} onChange={(pageNumbers) => updateBook({ pageNumbers })} label="Números de página" />
          <Toggle checked={b.bleed} onChange={(bleed) => updateBook({ bleed })} label="Añadir 3 mm de sangrado (solo si la imprenta lo pide)" />
        </Section>
      </div>
      <div className="sticky-preview">
        <SpreadPreview width={560} left={allPages(project).find((p) => p.id === 'back')?.render()} right={allPages(project).find((p) => p.id === 'cover')?.render()} />
        <p className="muted small">Así quedan la contraportada (izquierda) y la portada (derecha).</p>
      </div>
      {picker && (
        <CharacterPicker
          characters={project.characters}
          onClose={() => setPicker(null)}
          onPick={(ids) => {
            if (picker === 'cover') updateBook({ coverPortraits: [...b.coverPortraits, ...ids.map((id, k) => ({ characterId: id, r: k, c: k }))] });
            else updateBook({ backCover: { ...b.backCover, characterIds: [...b.backCover.characterIds, ...ids.filter((id) => !b.backCover.characterIds.includes(id))] } });
            setPicker(null);
          }}
        />
      )}
    </div>
  );
}

function TextsTab() {
  const { project, setBookText } = useProject();
  const pages = allPages(project);
  const instr = ['instr1', 'instr2', 'instr3', 'instr4', 'glossary'].map((id) => pages.find((p) => p.id === id));
  return (
    <div className="two-cols">
      <div>
        <p className="muted">Cambia cualquier texto de las instrucciones, glosario y agradecimientos. Si dejas un campo vacío, vuelve el texto original.</p>
        {TEXT_GROUPS.map((g) => (
          <Section key={g.title} title={g.title} defaultOpen={false}>
            {g.keys.map((k) => (
              <Field key={k} label={k} wide>
                <TextArea value={project.book.texts[k] ?? ''} placeholder={DEFAULT_TEXTS[k]} onChange={(v) => setBookText(k, v)} rows={DEFAULT_TEXTS[k].length > 90 ? 3 : 1} />
              </Field>
            ))}
          </Section>
        ))}
      </div>
      <div className="sticky-preview">
        <SpreadPreview width={560} left={instr[0]?.render()} right={instr[1]?.render()} />
        <SpreadPreview width={560} left={instr[2]?.render()} right={instr[3]?.render()} lazy />
        <SpreadPreview width={560} left={instr[4]?.render()} lazy />
      </div>
    </div>
  );
}

function PreviewTab() {
  const { project } = useProject();
  const pages = allPages(project);
  const sp = spreads(pages);
  return (
    <div>
      <div className="card print-card">
        <div>
          <h2>Descargar el libro</h2>
          <p>
            El libro tiene <b>{pages.length}</b> páginas (contando portada y contraportada) en formato <b>12,7 × 19,05 cm</b>, como el original. Las soluciones van al final.
          </p>
          <ol className="small">
            <li>Pulsa «Abrir para imprimir».</li>
            <li>
              En la ventana de impresión elige <b>Guardar como PDF</b>, márgenes <b>Ninguno</b>, escala <b>100 %</b> y activa <b>Gráficos de fondo</b>.
            </li>
            <li>Lleva el PDF a la copistería (en el README tienes consejos de papel y encuadernación).</li>
          </ol>
        </div>
        <div className="col">
          <Button kind="primary" onClick={() => go('imprimir', 'libro')}>
            🖨️ Abrir para imprimir
          </Button>
          <span className="muted small">
            Para un PDF perfecto también puedes usar <code>npm run pdf</code> (ver README).
          </span>
        </div>
      </div>
      <div className="spreads-grid">
        {sp.map((pair, i) => (
          <div key={i} className="spread-cell">
            <SpreadPreview width={520} left={pair[0]?.render()} right={pair[1]?.render()} lazy />
            <span className="muted small">{pair.map((p) => (p?.number ? `p. ${p.number}` : p?.kind === 'cover' ? 'portada' : p?.kind === 'back' ? 'contraportada' : '')).filter(Boolean).join(' · ')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
