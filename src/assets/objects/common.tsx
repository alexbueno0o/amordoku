/** Utilidades comunes de los dibujos de objetos del plano. */
import type { ReactNode } from 'react';

/** Color del contorno de los objetos (gris muy oscuro, como en el libro). */
export const OUT = '#2f2b38';
export const SW = 3;

export interface ObjProps {
  /** Ancho y alto del objeto en celdas (ya orientado). */
  w: number;
  h: number;
  /** Ancho y alto en unidades de dibujo (1 celda = 100). */
  W: number;
  H: number;
  color: string;
  variant?: string;
  label?: string;
  uid: string;
}

export type ObjRenderer = (p: ObjProps) => ReactNode;

export const f = (n: number) => Number(n.toFixed(2));

/** Sombra suave bajo un objeto. */
export const softShadow = (x: number, y: number, w: number, h: number, rx = 8) => (
  <rect x={x + 3} y={y + 5} width={w} height={h} rx={rx} fill="#000" opacity={0.12} />
);
