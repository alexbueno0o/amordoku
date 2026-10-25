/**
 * Ventana para elegir personajes del catálogo (con buscador y grupos).
 */
import { useMemo, useState } from 'react';
import { Avatar } from '../../assets/avatar/Avatar';
import type { Character } from '../../domain/types';
import { Button, Modal } from './ui';

export function CharacterPicker({
  characters,
  exclude = [],
  onPick,
  onClose,
  title = 'Añadir personajes',
}: {
  characters: Character[];
  exclude?: string[];
  onPick: (ids: string[]) => void;
  onClose: () => void;
  title?: string;
}) {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('');
  const [chosen, setChosen] = useState<string[]>([]);
  const groups = useMemo(() => [...new Set(characters.map((c) => c.group || 'Sin grupo'))], [characters]);
  const list = characters.filter(
    (c) =>
      !exclude.includes(c.id) &&
      (!group || (c.group || 'Sin grupo') === group) &&
      (!query || `${c.name} ${c.note ?? ''}`.toLowerCase().includes(query.toLowerCase())),
  );
  const toggle = (id: string) => setChosen((x) => (x.includes(id) ? x.filter((y) => y !== id) : [...x, id]));
  return (
    <Modal title={title} onClose={onClose} wide>
      <div className="row">
        <input className="input search" autoFocus placeholder="Buscar por nombre…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className="input select" value={group} onChange={(e) => setGroup(e.target.value)}>
          <option value="">Todos los grupos</option>
          {groups.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>
      <div className="picker-grid">
        {list.map((c) => (
          <button key={c.id} className={`picker-item${chosen.includes(c.id) ? ' on' : ''}`} onClick={() => toggle(c.id)}>
            <Avatar spec={c.avatar} size="100%" />
            <span>{c.name}</span>
            {c.note && <small>{c.note}</small>}
          </button>
        ))}
      </div>
      <div className="modal-foot">
        <span className="muted">{chosen.length} seleccionado(s)</span>
        <Button kind="primary" disabled={!chosen.length} onClick={() => onPick(chosen)}>
          Añadir
        </Button>
      </div>
    </Modal>
  );
}
