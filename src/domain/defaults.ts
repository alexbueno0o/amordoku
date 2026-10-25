/**
 * Valores por defecto para proyectos nuevos.
 */
import type { BookSettings, CaseFile, Project, Scenario } from './types';

export function defaultBook(): BookSettings {
  return {
    title: 'Amordoku',
    subtitle: '30 acertijos de *lógica* y *amor*',
    author: 'Tu nombre',
    publisher: 'ediciones besito',
    coverColor: '#7b2a5a',
    coverPortraits: [],
    dedication: 'Para ti,\nla mejor detective que conozco.',
    credits:
      'Título original: Amordoku: casos de lógica y amor\n\n© Tu nombre\nTodos los derechos reservados (salvo los besos, que son tuyos).\n\nIlustraciones y escenarios: hechos a mano, con cariño y con código.\nPersonajes: inspirados en personas reales que no han dado su permiso para salir en un libro de asesinatos.\n\nediciones besito, un sello inventado\n\nPrimera edición: la única\nISBN: TQM-0000-0001\nImpreso con amor\n\nQueda prohibida la reproducción total o parcial de esta obra sin un beso previo.',
    narratorName: 'Comisario',
    texts: {},
    backCover: {
      question: '¿Quién le robó el corazón a quién?',
      answer: 'TQM',
      characterIds: [],
      blurb: 'Casos inspirados en nuestras historias: viajes, cenas, fiestas y algún que otro beso sospechoso. ¿Serás capaz de resolverlos todos?',
      note: 'Caso abierto.\nSospechosos: tú y yo.',
    },
    caseOrder: [],
    pageNumbers: true,
    bleed: false,
  };
}

export function emptyProject(name = 'Mi Amordoku'): Project {
  return { version: 1, name, characters: [], scenarios: [], cases: [], book: defaultBook() };
}

export function newScenario(id: string, size = 6): Scenario {
  const cells = Array.from({ length: size * size }, () => ({ room: 'r1', floor: 'f1' }));
  return {
    id,
    name: 'Nuevo escenario',
    floors: { f1: { pattern: 'wood', colors: ['#f2d9b8', '#e7c79f'] } },
    board: { rows: size, cols: size, cells, rooms: [{ id: 'r1', name: 'Salón', article: 'el' }], objects: [], edges: [] },
  };
}

export function newCase(id: string, scenarioId: string): CaseFile {
  return {
    id,
    title: 'Nuevo caso',
    subtitle: 'Una frase misteriosa para empezar.',
    scenarioId,
    people: [],
    targetId: '',
    targetLabel: 'La víctima.',
    targetMode: 'lastCell',
    culpritRef: 'el asesino',
    question: 'El asesino es...',
    clues: [],
    pageColor: '#e7d3e4',
    boldKeywords: false,
  };
}

/** Colores de página parecidos a los del libro (pasteles). */
export const PAGE_COLORS = ['#e7d3e4', '#d9eaf6', '#f6e5d3', '#e6dcf1', '#f9eccd', '#dcefe2', '#f6dcdc', '#e3e8f3', '#efe9df', '#e9f2d7', '#f4e1ec', '#d8ecec'];
