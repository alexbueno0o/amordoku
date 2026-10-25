/** Utilidades pequeñas de la app. */

/** Id legible y único: "nuevo-caso-x7k2". */
export function makeId(base: string, taken: Iterable<string> = []): string {
  const used = new Set(taken);
  const slug =
    base
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'item';
  if (!used.has(slug)) return slug;
  for (;;) {
    const id = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    if (!used.has(id)) return id;
  }
}

/** Descarga un texto como archivo. */
export function downloadText(filename: string, text: string, type = 'application/json') {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Abre el selector de archivos y devuelve el texto del elegido. */
export function pickTextFile(accept = '.json'): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = () => {
      const f = input.files?.[0];
      if (!f) return resolve(null);
      f.text().then(resolve, () => resolve(null));
    };
    input.click();
  });
}

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** Mueve un elemento de una lista (para reordenar). */
export function moveItem<T>(list: T[], from: number, to: number): T[] {
  const out = list.slice();
  const [it] = out.splice(from, 1);
  out.splice(clamp(to, 0, out.length), 0, it);
  return out;
}
