/**
 * Creador de personajes: lista por grupos y editor detallado del avatar.
 */
import { useMemo, useState } from 'react';
import { Avatar } from '../../assets/avatar/Avatar';
import {
  ANIMALS,
  DEFAULT_AVATAR,
  EARRINGS,
  EXTRAS,
  EYEBROWS,
  FACE_SHAPES,
  FACIAL_HAIR,
  GLASSES,
  HAIR_COLORS,
  HAIR_STYLES,
  HATS,
  NECKLACES,
  OUTFITS,
  PORTRAIT_OBJECTS,
  SKIN_TONES,
  type AvatarSpec,
  type ExtraId,
} from '../../assets/avatar/types';
import type { Character } from '../../domain/types';
import { Button, ColorField, Empty, Field, OptionGrid, Section, Select, Slider, TextInput, Toggle, useToast } from '../components/ui';
import { go } from '../lib/router';
import { makeId } from '../lib/util';
import { useProject } from '../store/projectStore';

const BG_COLORS = ['#d4673f', '#5aa7b5', '#3f8f5a', '#5b7fc4', '#e89a3c', '#9a5aa8', '#c25b8f', '#a24c3f', '#f2c94c', '#cfd8c4', '#e8d6c7', '#2a9d8f', '#7b2a5a', '#1f1f1f'].map((id) => ({ id }));
const CLOTH_COLORS = ['#ffffff', '#1f1f1f', '#3e5a7a', '#1d3557', '#2a9d8f', '#3f6f5a', '#e63946', '#c0392b', '#f2c94c', '#e9c46a', '#f4a6c1', '#7b2a5a', '#8a5a33', '#d8e6f2'].map((id) => ({ id }));
const METAL_COLORS = [
  { id: '#c9ccd1', label: 'Plata' },
  { id: '#d4af37', label: 'Oro' },
  { id: '#b87333', label: 'Cobre' },
  { id: '#1f1f1f', label: 'Negro' },
  { id: '#e63946', label: 'Rojo' },
  { id: '#2a9d8f', label: 'Turquesa' },
];

export function CharactersPage({ selectedId }: { selectedId?: string }) {
  const { project, upsertCharacter, deleteCharacter } = useProject();
  const [query, setQuery] = useState('');
  const [toast, showToast] = useToast();
  const groups = useMemo(() => [...new Set(project.characters.map((c) => c.group || 'Sin grupo'))], [project.characters]);
  const selected = project.characters.find((c) => c.id === selectedId);

  const filtered = project.characters.filter((c) => !query || `${c.name} ${c.group} ${c.note ?? ''}`.toLowerCase().includes(query.toLowerCase()));
  const usedIn = (id: string) => project.cases.filter((c) => c.people.some((p) => p.characterId === id)).length;

  const create = (kind: AvatarSpec['kind']) => {
    const id = makeId(kind === 'person' ? 'personaje' : kind === 'animal' ? 'animal' : 'objeto', project.characters.map((c) => c.id));
    const ch: Character = {
      id,
      name: kind === 'person' ? 'Nuevo personaje' : kind === 'animal' ? 'Paloma' : 'La croqueta',
      gender: kind === 'object' ? 'f' : 'm',
      group: kind === 'person' ? 'Sin grupo' : kind === 'animal' ? 'Animales' : 'Objetos',
      avatar: { ...DEFAULT_AVATAR, kind, animal: kind === 'animal' ? 'pigeon' : undefined, animalColor: '#a7b0bb', object: kind === 'object' ? 'croqueta' : undefined },
    };
    upsertCharacter(ch);
    go('personajes', id);
  };

  const duplicate = (ch: Character) => {
    const id = makeId(ch.id + '-copia', project.characters.map((c) => c.id));
    upsertCharacter({ ...structuredClone(ch), id, name: ch.name + ' (copia)' });
    go('personajes', id);
  };

  const remove = (ch: Character) => {
    const n = usedIn(ch.id);
    if (n && !confirm(`${ch.name} sale en ${n} caso(s). Si lo borras, esos casos se quedarán sin él. ¿Borrar igualmente?`)) return;
    if (!n && !confirm(`¿Borrar a ${ch.name}?`)) return;
    deleteCharacter(ch.id);
    go('personajes');
    showToast('Personaje borrado.');
  };

  return (
    <div className="split">
      <aside className="sidebar">
        <div className="sidebar-actions">
          <Button kind="primary" small onClick={() => create('person')}>
            + Persona
          </Button>
          <Button small onClick={() => create('animal')}>
            + Animal
          </Button>
          <Button small onClick={() => create('object')}>
            + Objeto
          </Button>
        </div>
        <input className="input search" placeholder="Buscar…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="sidebar-list">
          {groups.map((g) => {
            const list = filtered.filter((c) => (c.group || 'Sin grupo') === g);
            if (!list.length) return null;
            return (
              <div key={g}>
                <div className="list-group">{g}</div>
                {list.map((c) => (
                  <button key={c.id} className={`list-item${c.id === selectedId ? ' on' : ''}`} onClick={() => go('personajes', c.id)}>
                    <span className="list-thumb">
                      <Avatar spec={c.avatar} size={34} />
                    </span>
                    <span className="list-text">
                      <b>{c.name}</b>
                      {c.note && <small>{c.note}</small>}
                    </span>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </aside>
      <section className="workspace">
        {selected ? (
          <CharacterEditor
            key={selected.id}
            character={selected}
            groups={groups}
            onChange={upsertCharacter}
            onDuplicate={() => duplicate(selected)}
            onDelete={() => remove(selected)}
            usedIn={usedIn(selected.id)}
          />
        ) : (
          <Empty>
            <h2>Elige un personaje de la lista o crea uno nuevo</h2>
            <p>Los personajes se usan en los murdokus. Puedes cambiar su aspecto solo para un caso (por ejemplo, traje de fallera) desde el editor del caso.</p>
          </Empty>
        )}
      </section>
      {toast}
    </div>
  );
}

function CharacterEditor({
  character: ch,
  groups,
  onChange,
  onDuplicate,
  onDelete,
  usedIn,
}: {
  character: Character;
  groups: string[];
  onChange: (c: Character) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  usedIn: number;
}) {
  const a = ch.avatar;
  const set = (patch: Partial<Character>) => onChange({ ...ch, ...patch });
  const av = (patch: Partial<AvatarSpec>) => onChange({ ...ch, avatar: { ...a, ...patch } });
  const thumb = (patch: Partial<AvatarSpec>) => <Avatar spec={{ ...a, ...patch }} size="100%" />;
  const toggleExtra = (id: ExtraId) => av({ extras: a.extras.includes(id) ? a.extras.filter((x) => x !== id) : [...a.extras, id] });

  return (
    <div className="editor">
      <div className="editor-preview">
        <div className="big-polaroid">
          <Avatar spec={a} size="100%" />
          <span className="polaroid-name">{ch.name}</span>
        </div>
        <div className="mini-row">
          <Avatar spec={a} size={56} />
          <Avatar spec={a} size={56} crossed />
          <Avatar spec={a} size={44} round noBackground />
        </div>
        <p className="muted small">Sale en {usedIn} caso(s).</p>
        <div className="row">
          <Button small onClick={onDuplicate}>
            Duplicar
          </Button>
          <Button small kind="danger" onClick={onDelete}>
            Borrar
          </Button>
        </div>
      </div>

      <div className="editor-form">
        <Section title="Identidad">
          <div className="grid2">
            <Field label="Nombre (como sale en la foto)">
              <TextInput value={ch.name} onChange={(name) => set({ name })} />
            </Field>
            <Field label="Grupo">
              <TextInput value={ch.group} onChange={(group) => set({ group })} list="groups" />
              <datalist id="groups">
                {groups.map((g) => (
                  <option key={g} value={g} />
                ))}
              </datalist>
            </Field>
            <Field label="Género (para «sentado/sentada»)">
              <Select
                value={ch.gender}
                onChange={(gender) => set({ gender })}
                options={[
                  { id: 'f', label: 'Femenino' },
                  { id: 'm', label: 'Masculino' },
                ]}
              />
            </Field>
            <Field label="¿Nombre común?" hint="«Camarero» → «al norte del camarero». En automático lo deduce.">
              <Select
                value={ch.article === undefined ? 'auto' : ch.article === '' ? 'none' : ch.article}
                onChange={(v) => set({ article: v === 'auto' ? undefined : v === 'none' ? '' : (v as 'el' | 'la') })}
                options={[
                  { id: 'auto', label: 'Automático' },
                  { id: 'none', label: 'Nombre propio (sin artículo)' },
                  { id: 'el', label: 'Con «el»' },
                  { id: 'la', label: 'Con «la»' },
                ]}
              />
            </Field>
            <Field label="Nota (no se imprime)" wide>
              <TextInput value={ch.note ?? ''} onChange={(note) => set({ note })} placeholder="Novia de…, hermano de…" />
            </Field>
          </div>
          <Field label="Tipo">
            <div className="row">
              {(['person', 'animal', 'object'] as const).map((k) => (
                <Button key={k} small kind={a.kind === k ? 'primary' : 'secondary'} onClick={() => av({ kind: k, animal: a.animal ?? 'pigeon', object: a.object ?? 'croqueta' })}>
                  {k === 'person' ? 'Persona' : k === 'animal' ? 'Animal' : 'Objeto'}
                </Button>
              ))}
            </div>
          </Field>
          <Field label="Color de fondo de la foto">
            <ColorField value={a.bg} onChange={(bg) => av({ bg })} swatches={BG_COLORS} />
          </Field>
        </Section>

        {a.kind === 'animal' && (
          <Section title="Animal">
            <OptionGrid options={ANIMALS} value={a.animal ?? 'pigeon'} onChange={(animal) => av({ animal })} render={(id) => thumb({ animal: id })} />
            <Field label="Color">
              <ColorField value={a.animalColor ?? '#a7b0bb'} onChange={(animalColor) => av({ animalColor })} swatches={[{ id: '#a7b0bb' }, { id: '#ffffff' }, { id: '#3b2519' }, { id: '#f2c94c' }, { id: '#1f1f1f' }, { id: '#c98f63' }]} />
            </Field>
          </Section>
        )}

        {a.kind === 'object' && (
          <Section title="Objeto">
            <OptionGrid options={PORTRAIT_OBJECTS} value={a.object ?? 'croqueta'} onChange={(object) => av({ object })} render={(id) => thumb({ object: id })} />
          </Section>
        )}

        {a.kind === 'person' && (
          <>
            <Section title="Cara">
              <Field label="Color de piel">
                <ColorField value={a.skin} onChange={(skin) => av({ skin })} swatches={SKIN_TONES} />
              </Field>
              <Field label="Forma de la cara">
                <OptionGrid options={FACE_SHAPES} value={a.face} onChange={(face) => av({ face })} render={(id) => thumb({ face: id })} size={58} />
              </Field>
              <div className="grid3">
                <Field label="Complexión">
                  <Slider value={a.weight} onChange={(weight) => av({ weight })} left="Delgada" right="Ancha" />
                </Field>
                <Field label="Mandíbula">
                  <Slider value={a.jaw} onChange={(jaw) => av({ jaw })} left="Suave" right="Marcada" />
                </Field>
                <Field label="Largo de cara">
                  <Slider value={a.length} onChange={(length) => av({ length })} left="Corta" right="Larga" />
                </Field>
              </div>
              <div className="row">
                <Toggle checked={a.freckles} onChange={(freckles) => av({ freckles })} label="Pecas" />
                <Toggle checked={a.blush} onChange={(blush) => av({ blush })} label="Colorete" />
              </div>
              <Field label="Cejas">
                <Select value={a.eyebrows} onChange={(eyebrows) => av({ eyebrows })} options={EYEBROWS} />
              </Field>
            </Section>

            <Section title="Pelo">
              <OptionGrid options={HAIR_STYLES} value={a.hair} onChange={(hair) => av({ hair })} render={(id) => thumb({ hair: id, hat: 'none' })} />
              <Field label="Color">
                <ColorField value={a.hairColor} onChange={(hairColor) => av({ hairColor })} swatches={HAIR_COLORS} />
              </Field>
              <Field label="Mechas (opcional)">
                <div className="row">
                  <ColorField value={a.hairHighlight ?? '#000000'} onChange={(hairHighlight) => av({ hairHighlight })} swatches={HAIR_COLORS.slice(3, 9)} />
                  {a.hairHighlight && (
                    <Button small kind="ghost" onClick={() => av({ hairHighlight: undefined })}>
                      Quitar mechas
                    </Button>
                  )}
                </div>
              </Field>
            </Section>

            <Section title="Barba y bigote" defaultOpen={ch.gender === 'm'}>
              <OptionGrid options={FACIAL_HAIR} value={a.facialHair} onChange={(facialHair) => av({ facialHair })} render={(id) => thumb({ facialHair: id })} />
              <Field label="Color">
                <ColorField value={a.facialHairColor} onChange={(facialHairColor) => av({ facialHairColor })} swatches={HAIR_COLORS} />
              </Field>
            </Section>

            <Section title="Gafas, pendientes y collares">
              <Field label="Gafas">
                <OptionGrid options={GLASSES} value={a.glasses} onChange={(glasses) => av({ glasses })} render={(id) => thumb({ glasses: id })} size={58} />
              </Field>
              <Field label="Color de las gafas">
                <ColorField value={a.glassesColor} onChange={(glassesColor) => av({ glassesColor })} swatches={[{ id: '#1a1a1a' }, { id: '#7b4a3a' }, { id: '#c0392b' }, { id: '#d4af37' }, { id: '#3b2a20' }]} />
              </Field>
              <Field label="Pendientes">
                <OptionGrid options={EARRINGS} value={a.earrings} onChange={(earrings) => av({ earrings })} render={(id) => thumb({ earrings: id })} size={58} />
              </Field>
              <Field label="Color de los pendientes">
                <ColorField value={a.earringColor} onChange={(earringColor) => av({ earringColor })} swatches={METAL_COLORS} />
              </Field>
              <Field label="Collar">
                <OptionGrid options={NECKLACES} value={a.necklace} onChange={(necklace) => av({ necklace })} render={(id) => thumb({ necklace: id })} size={58} />
              </Field>
              <Field label="Color del collar">
                <ColorField value={a.necklaceColor} onChange={(necklaceColor) => av({ necklaceColor })} swatches={METAL_COLORS} />
              </Field>
            </Section>

            <Section title="Gorros y sombreros" defaultOpen={false}>
              <OptionGrid options={HATS} value={a.hat} onChange={(hat) => av({ hat })} render={(id) => thumb({ hat: id })} />
              <Field label="Color">
                <ColorField value={a.hatColor} onChange={(hatColor) => av({ hatColor })} swatches={CLOTH_COLORS} />
              </Field>
            </Section>

            <Section title="Ropa">
              <OptionGrid options={OUTFITS} value={a.outfit} onChange={(outfit) => av({ outfit })} render={(id) => thumb({ outfit: id })} />
              <div className="grid2">
                <Field label="Color principal">
                  <ColorField value={a.outfitColor} onChange={(outfitColor) => av({ outfitColor })} swatches={CLOTH_COLORS} />
                </Field>
                <Field label="Color secundario">
                  <ColorField value={a.outfitAccent} onChange={(outfitAccent) => av({ outfitAccent })} swatches={CLOTH_COLORS} />
                </Field>
              </div>
            </Section>

            <Section title="Extras" defaultOpen={false}>
              <div className="option-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))' }}>
                {EXTRAS.map((o) => (
                  <button key={o.id} type="button" className={`option${a.extras.includes(o.id) ? ' on' : ''}`} onClick={() => toggleExtra(o.id)} title={o.label}>
                    <span className="option-thumb">{thumb({ extras: [o.id] })}</span>
                    <span className="option-label">{o.label}</span>
                  </button>
                ))}
              </div>
            </Section>
          </>
        )}
      </div>
    </div>
  );
}
