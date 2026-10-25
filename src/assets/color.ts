/** Utilidades de color para los dibujos (sombras planas tipo ilustración). */

export function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const c = (x: number) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Mezcla dos colores (t=0 → a, t=1 → b). */
export function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}

/** Oscurece (amount > 0) o aclara (amount < 0). */
export function shade(hex: string, amount: number): string {
  return amount >= 0 ? mix(hex, '#000000', amount) : mix(hex, '#ffffff', -amount);
}

/** Luminancia relativa (0 oscuro – 1 claro). */
export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Color de tinta legible sobre un fondo. */
export function inkOn(bg: string): string {
  return luminance(bg) > 0.45 ? '#1d1b22' : '#ffffff';
}

/** Versión pastel de un color (para tarjetas de pista). */
export function pastel(hex: string, t = 0.78): string {
  return mix(hex, '#ffffff', t);
}
