/**
 * Piezas de interfaz reutilizables (botones, campos, selectores de color...).
 * Todas comparten el estilo de app.css.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';

type BtnKind = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({
  children,
  onClick,
  kind = 'secondary',
  disabled,
  title,
  small,
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  kind?: BtnKind;
  disabled?: boolean;
  title?: string;
  small?: boolean;
  type?: 'button' | 'submit';
}) {
  return (
    <button type={type} className={`btn btn-${kind}${small ? ' btn-small' : ''}`} onClick={onClick} disabled={disabled} title={title}>
      {children}
    </button>
  );
}

export function Field({ label, hint, children, wide }: { label: string; hint?: string; children: ReactNode; wide?: boolean }) {
  return (
    <label className={`field${wide ? ' field-wide' : ''}`}>
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

export function TextInput({ value, onChange, placeholder, list }: { value: string; onChange: (v: string) => void; placeholder?: string; list?: string }) {
  return <input className="input" value={value} placeholder={placeholder} list={list} onChange={(e) => onChange(e.target.value)} />;
}

export function NumberInput({ value, onChange, min, max, step = 1 }: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <input
      className="input input-num"
      type="number"
      value={Number.isFinite(value) ? value : 0}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}

export function TextArea({ value, onChange, rows = 3, placeholder }: { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return <textarea className="input textarea" rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />;
}

export function Select<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { id: T; label: string }[] }) {
  return (
    <select className="input select" value={value} onChange={(e) => onChange(e.target.value as T)}>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-track">
        <span className="toggle-dot" />
      </span>
      <span>{label}</span>
    </label>
  );
}

export function Slider({ value, onChange, min = 0, max = 1, step = 0.01, left, right }: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; left?: string; right?: string }) {
  return (
    <div className="slider">
      {left && <span className="slider-end">{left}</span>}
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      {right && <span className="slider-end">{right}</span>}
    </div>
  );
}

/** Muestras de color + selector libre. */
export function ColorField({ value, onChange, swatches }: { value: string; onChange: (v: string) => void; swatches?: { id: string; label?: string }[] }) {
  return (
    <div className="color-field">
      {swatches?.map((s) => (
        <button
          key={s.id}
          type="button"
          className={`swatch${s.id.toLowerCase() === value?.toLowerCase() ? ' on' : ''}`}
          style={{ background: s.id }}
          title={s.label ?? s.id}
          onClick={() => onChange(s.id)}
        />
      ))}
      <input className="swatch-input" type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#cccccc'} onChange={(e) => onChange(e.target.value)} title="Otro color" />
    </div>
  );
}

export function Section({ title, children, defaultOpen = true, right }: { title: string; children: ReactNode; defaultOpen?: boolean; right?: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={`section${open ? ' open' : ''}`}>
      <header className="section-head" onClick={() => setOpen(!open)}>
        <span className="section-caret">{open ? '▾' : '▸'}</span>
        <h3>{title}</h3>
        <span className="section-right" onClick={(e) => e.stopPropagation()}>
          {right}
        </span>
      </header>
      {open && <div className="section-body">{children}</div>}
    </section>
  );
}

export function Badge({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span className="badge" style={color ? { background: color } : undefined}>
      {children}
    </span>
  );
}

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const on = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [onClose]);
  return (
    <div className="modal-back" onClick={onClose}>
      <div className={`modal${wide ? ' modal-wide' : ''}`} onClick={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <h2>{title}</h2>
          <button className="modal-x" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>;
}

/** Aviso temporal ("¡Guardado!"). */
export function useToast(): [ReactNode, (msg: string) => void] {
  const [msg, setMsg] = useState<string | null>(null);
  const t = useRef<number>();
  const show = (m: string) => {
    setMsg(m);
    window.clearTimeout(t.current);
    t.current = window.setTimeout(() => setMsg(null), 2600);
  };
  return [msg ? <div className="toast">{msg}</div> : null, show];
}

/** Rejilla de opciones con miniatura (estilo selector de videojuego). */
export function OptionGrid<T extends string>({
  options,
  value,
  onChange,
  render,
  size = 64,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  render: (id: T) => ReactNode;
  size?: number;
}) {
  return (
    <div className="option-grid" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${size}px, 1fr))` }}>
      {options.map((o) => (
        <button key={o.id} type="button" className={`option${o.id === value ? ' on' : ''}`} onClick={() => onChange(o.id)} title={o.label}>
          <span className="option-thumb">{render(o.id)}</span>
          <span className="option-label">{o.label}</span>
        </button>
      ))}
    </div>
  );
}
