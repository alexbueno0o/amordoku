/**
 * Genera examples/example.project.json a partir de examples/example.ts.
 *   npm run example
 */
import { writeFileSync } from 'fs';
import { buildCase } from '../src/domain/caseBuilder';
import { defaultBook } from '../src/domain/defaults';
import type { Project } from '../src/domain/types';
import { EXAMPLE_BOOK, EXAMPLE_CASES, EXAMPLE_CHARACTERS } from './example';

const OUT = new URL('./example.project.json', import.meta.url).pathname;

const project: Project = {
  version: 1,
  builtAt: Date.now(),
  name: 'Amordoku de ejemplo (Ana y Leo)',
  characters: EXAMPLE_CHARACTERS,
  scenarios: EXAMPLE_CASES.map((d) => d.scenario),
  cases: [],
  book: { ...defaultBook(), ...EXAMPLE_BOOK, caseOrder: EXAMPLE_CASES.map((d) => d.id) },
};

EXAMPLE_CASES.forEach((def, i) => {
  const { file, report } = buildCase(project, def, i + 1);
  project.cases.push(file);
  console.log(`${report.ok ? 'OK ' : '!! '} ${def.id}  ${report.size}×${report.size}  dificultad=${report.score}  culpable=${report.culprit} ${report.problems.join(' | ')}`);
});

writeFileSync(OUT, JSON.stringify(project, null, 1));
console.log(`Guardado en ${OUT}`);
