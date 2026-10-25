/**
 * Pruebas del proyecto de ejemplo y de la generación desde la app.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { allPages } from '../src/book/Book';
import { analyzeCase } from '../src/domain/caseModel';
import { caseReadiness, regenerateCase } from '../src/domain/regenerate';
import { personPhrase } from '../src/engine/clues/text-es';
import { guessPersonArticle } from '../src/domain/names';
import type { Project } from '../src/domain/types';

const example: Project = JSON.parse(readFileSync(new URL('../examples/example.project.json', import.meta.url), 'utf8'));

describe('proyecto de ejemplo', () => {
  it('cada caso tiene solución única y su culpable', () => {
    for (const c of example.cases) {
      const a = analyzeCase(example, c)!;
      expect(a.solutions, c.id).toBe(1);
      expect(a.errors, c.id).toEqual([]);
      expect(a.culpritId, c.id).toBe(c.culpritId);
    }
  });

  it('el libro se pagina en múltiplos de 4 con portada y contraportada', () => {
    const pages = allPages(example);
    expect(pages[0].kind).toBe('cover');
    expect(pages[pages.length - 1].kind).toBe('back');
    expect((pages.length - 2) % 4).toBe(0);
  });
});

describe('generación desde la app', () => {
  it('regenera un caso con otra semilla y sigue siendo único', () => {
    const c = example.cases[0];
    const res = regenerateCase(example, c, { tier: 1, seed: 999, culpritId: c.culpritId });
    expect(res.caseFile.clues.length).toBeGreaterThan(0);
    const a = analyzeCase(example, res.caseFile)!;
    expect(a.solutions).toBe(1);
    expect(res.caseFile.culpritId).toBe(c.culpritId);
  });

  it('avisa si faltan personajes para el tamaño del plano', () => {
    const c = { ...example.cases[0], people: example.cases[0].people.slice(1) };
    expect(caseReadiness(example, c).join(' ')).toMatch(/necesitas/);
  });
});

describe('nombres en las pistas', () => {
  it('pone artículo a los oficios y respeta los nombres propios', () => {
    expect(personPhrase('Camarero', guessPersonArticle('Camarero', 'm'))).toBe('el **camarero**');
    expect(personPhrase('Abuela Conchi', guessPersonArticle('Abuela Conchi', 'f'))).toBe('la **abuela Conchi**');
    expect(personPhrase('La croqueta')).toBe('la **croqueta**');
    expect(personPhrase('Leo', guessPersonArticle('Leo', 'm'))).toBe('**Leo**');
    expect(personPhrase('DJ', guessPersonArticle('DJ', 'm'))).toBe('el **DJ**');
  });
});
