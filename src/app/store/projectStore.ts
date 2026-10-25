/**
 * Estado global de la app: el proyecto completo (personajes, escenarios,
 * casos y ajustes del libro). Se guarda solo en el navegador (localStorage)
 * y se puede exportar/importar como JSON.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { BookSettings, CaseFile, Character, Project, Scenario } from '../../domain/types';
import { moveItem } from '../lib/util';
import { initialProject } from './initialProject';

interface ProjectState {
  project: Project;
  /** Fecha del último guardado (para mostrar "guardado hace..."). */
  savedAt: number;
  setProject: (p: Project) => void;
  resetProject: () => void;

  upsertCharacter: (ch: Character) => void;
  deleteCharacter: (id: string) => void;

  upsertScenario: (s: Scenario) => void;
  deleteScenario: (id: string) => void;

  upsertCase: (c: CaseFile) => void;
  deleteCase: (id: string) => void;
  moveCase: (id: string, to: number) => void;

  updateBook: (patch: Partial<BookSettings>) => void;
  setBookText: (key: string, value: string | undefined) => void;
}

const upsert = <T extends { id: string }>(list: T[], item: T): T[] => {
  const i = list.findIndex((x) => x.id === item.id);
  if (i < 0) return [...list, item];
  const out = list.slice();
  out[i] = item;
  return out;
};

/** Orden de casos completo (los que no estén en caseOrder van al final). */
export function fullCaseOrder(p: Project): string[] {
  const known = p.book.caseOrder.filter((id) => p.cases.some((c) => c.id === id));
  return [...known, ...p.cases.map((c) => c.id).filter((id) => !known.includes(id))];
}

export const useProject = create<ProjectState>()(
  persist(
    (set) => {
      const touch = (fn: (p: Project) => Project) => set((s) => ({ project: fn(s.project), savedAt: Date.now() }));
      return {
        project: initialProject(),
        savedAt: Date.now(),
        setProject: (p) => set({ project: p, savedAt: Date.now() }),
        resetProject: () => set({ project: initialProject(), savedAt: Date.now() }),

        upsertCharacter: (ch) => touch((p) => ({ ...p, characters: upsert(p.characters, ch) })),
        deleteCharacter: (id) => touch((p) => ({ ...p, characters: p.characters.filter((c) => c.id !== id) })),

        upsertScenario: (sc) => touch((p) => ({ ...p, scenarios: upsert(p.scenarios, sc) })),
        deleteScenario: (id) => touch((p) => ({ ...p, scenarios: p.scenarios.filter((x) => x.id !== id) })),

        upsertCase: (c) =>
          touch((p) => {
            const exists = p.cases.some((x) => x.id === c.id);
            return {
              ...p,
              cases: upsert(p.cases, c),
              book: exists ? p.book : { ...p.book, caseOrder: [...fullCaseOrder(p), c.id] },
            };
          }),
        deleteCase: (id) =>
          touch((p) => ({ ...p, cases: p.cases.filter((c) => c.id !== id), book: { ...p.book, caseOrder: p.book.caseOrder.filter((x) => x !== id) } })),
        moveCase: (id, to) =>
          touch((p) => {
            const order = fullCaseOrder(p);
            return { ...p, book: { ...p.book, caseOrder: moveItem(order, order.indexOf(id), to) } };
          }),

        updateBook: (patch) => touch((p) => ({ ...p, book: { ...p.book, ...patch } })),
        setBookText: (key, value) =>
          touch((p) => {
            const texts = { ...p.book.texts };
            if (value === undefined || value === '') delete texts[key];
            else texts[key] = value;
            return { ...p, book: { ...p.book, texts } };
          }),
      };
    },
    {
      name: 'amordoku-proyecto',
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
