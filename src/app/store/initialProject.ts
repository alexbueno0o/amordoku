/**
 * Proyecto con el que arranca la app la primera vez.
 *
 * Si existe la carpeta privada (private/*.project.json, que NO se sube a
 * GitHub) se usa ese libro; si no, el ejemplo público de examples/.
 */
import type { Project } from '../../domain/types';
import example from '../../../examples/example.project.json';

const privateProjects = import.meta.glob('../../../private/*.project.json', { eager: true, import: 'default' }) as Record<string, Project>;

export const HAS_PRIVATE_PROJECT = Object.keys(privateProjects).length > 0;

export function initialProject(): Project {
  const p = Object.values(privateProjects)[0] ?? (example as unknown as Project);
  return structuredClone(p);
}

/** Fecha de generación del proyecto incluido en la app (para detectar versiones nuevas). */
export function bundledBuiltAt(): number | undefined {
  const p = Object.values(privateProjects)[0] ?? (example as unknown as Project);
  return p.builtAt;
}
