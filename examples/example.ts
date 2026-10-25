/**
 * Proyecto de ejemplo PÚBLICO (se sube a GitHub). Personajes inventados
 * —Ana y Leo— para que cualquiera pueda probar la app y ver cómo se define
 * un caso en código. Tu libro de verdad va en la carpeta private/.
 *
 *   npm run example     → regenera examples/example.project.json
 */
import { DEFAULT_AVATAR, type AvatarSpec } from '../src/assets/avatar/types';
import type { CaseDef } from '../src/domain/caseBuilder';
import { defaultBook } from '../src/domain/defaults';
import { scenario } from '../src/domain/dsl';
import type { BookSettings, Character } from '../src/domain/types';
import type { Gender } from '../src/engine/types';

const av = (o: Partial<AvatarSpec>): AvatarSpec => ({ ...DEFAULT_AVATAR, ...o });
const ch = (id: string, name: string, gender: Gender, group: string, a: Partial<AvatarSpec>, note?: string): Character => ({ id, name, gender, group, note, avatar: av(a) });

export const EXAMPLE_CHARACTERS: Character[] = [
  ch('ana', 'Ana', 'f', 'Protagonistas', { bg: '#5aa7b5', skin: '#efc7a7', hair: 'longWavy', hairColor: '#5a3a24', earrings: 'hoop', earringColor: '#d4af37', outfit: 'blouse', outfitColor: '#f2e8cf', blush: true, jaw: 0.5 }),
  ch('leo', 'Leo', 'm', 'Protagonistas', { bg: '#d4673f', skin: '#dba27a', hair: 'curlyShort', hairColor: '#1f1712', facialHair: 'short', facialHairColor: '#1f1712', outfit: 'polo', outfitColor: '#1d3557' }),
  ch('abuela', 'Abuela Rosa', 'f', 'Familia', { bg: '#f2c94c', skin: '#e8b791', hair: 'granny', hairColor: '#e6e6e6', glasses: 'round', glassesColor: '#7b4a3a', necklace: 'pearls', outfit: 'sweater', outfitColor: '#7b2a5a', weight: 0.55, face: 'round' }),
  ch('primo', 'Primo Dani', 'm', 'Familia', { bg: '#3f8f5a', skin: '#efc7a7', hair: 'messy', hairColor: '#8a5a33', outfit: 'hoodie', outfitColor: '#e76f51', outfitAccent: '#ffffff', freckles: true }),
  ch('tia', 'Tía Marta', 'f', 'Familia', { bg: '#9a5aa8', skin: '#f7dcc8', hair: 'bob', hairColor: '#b5452b', earrings: 'drop', outfit: 'vneck', outfitColor: '#2a9d8f' }),
  ch('perro', 'Toby', 'm', 'Animales', { kind: 'animal', animal: 'dog', animalColor: '#c98f63', bg: '#cfd8c4' }),
  ch('croqueta', 'La croqueta', 'f', 'Objetos', { kind: 'object', object: 'croqueta', bg: '#e89a3c' }),
  ch('camarero', 'Camarero', 'm', 'Extras', { bg: '#e8d6c7', skin: '#c98f63', hair: 'slick', hairColor: '#1f1712', facialHair: 'mustache', facialHairColor: '#1f1712', outfit: 'tux' }),
  ch('cocinera', 'Cocinera', 'f', 'Extras', { bg: '#7a2f3b', skin: '#efc7a7', hair: 'lowBun', hairColor: '#3b2519', hat: 'chef', hatColor: '#ffffff', outfit: 'chefJacket', outfitAccent: '#1f1f1f' }),
  ch('musico', 'Músico', 'm', 'Extras', { bg: '#2a9d8f', skin: '#b07548', hair: 'afro', hairColor: '#1f1712', outfit: 'shirtOpen', outfitColor: '#f2c94c', extras: ['guitar'] }),
  ch('pareja', 'Señora', 'f', 'Extras', { bg: '#c7dfe8', skin: '#efc7a7', hair: 'lob', hairColor: '#d9a85b', necklace: 'chain', outfit: 'dress', outfitColor: '#e63946' }),
  ch('anillo', 'El anillo', 'm', 'Objetos', { kind: 'object', object: 'rings', bg: '#f4a6c1' }),
];

/* ------------------------------------------------------------------ caso 1 */
const casaAbuela = scenario({
  id: 'casa-abuela',
  name: 'Casa de la abuela',
  map: ['KKKSSS', 'KKKSSS', 'KKKSSS', 'CCCTTT', 'CCCTTT', 'CCCTTT'],
  rooms: {
    K: { name: 'Cocina', floor: 'k' },
    S: { name: 'Salón', floor: 's' },
    C: { name: 'Comedor', floor: 'c' },
    T: { name: 'Terraza', floor: 't' },
  },
  floors: { k: ['hydraulic', '#fbefdc', '#e98a5b'], s: ['wood', '#e9cfa8', '#dcbd92'], c: ['tiles', '#e7e1f2', '#d6cde9'], t: ['terracotta', '#ebb08a', '#d9966c'] },
  objects: [
    ['kitchen', 0, 0, 2, 1, { variant: 'fuegos' }],
    ['fridge', 2, 0],
    ['sofa', 1, 4, 2, 1, { color: '#8fa7c9' }],
    ['tv', 0, 5],
    ['table', 4, 1, 1, 1, { variant: 'mantel', color: '#e63946' }],
    ['chair', 4, 0, 1, 1, { variant: 'comedor', color: '#c9a36b' }],
    ['chair', 5, 1, 1, 1, { variant: 'comedor', color: '#c9a36b' }],
    ['plant', 3, 5, 1, 1, { variant: 'flores' }],
    ['hammock', 4, 3, 1, 2, { color: '#e9c46a' }],
  ],
  edges: [
    ['window', 0, 3, 'top'],
    ['window', 5, 5, 'right'],
  ],
});

const CASE_1: CaseDef = {
  id: 'ej1-croqueta',
  title: 'La última croqueta',
  subtitle: 'Domingo en casa de la abuela. Nunca sobra comida… salvo hoy: alguien se ha comido la última croqueta.',
  pageColor: '#e7d3e4',
  scenario: casaAbuela,
  people: ['ana', 'leo', 'abuela', 'primo', 'perro', 'croqueta'],
  target: 'croqueta',
  culprit: 'perro',
  targetLabel: 'La croqueta.',
  culpritRef: 'quien se la comió',
  question: 'Se la comió...',
  answerNote: 'y luego puso cara de bueno',
  tier: 1,
  pins: [{ p: 'abuela', rooms: ['Cocina', 'Comedor'] }],
  postIt: { text: 'Dicen que nunca olvidas tu primer caso.\nYo no olvido la primera croqueta.' },
};

/* ------------------------------------------------------------------ caso 2 */
const restaurante = scenario({
  id: 'restaurante',
  name: 'Restaurante italiano',
  map: ['KKKMMMM', 'KKKMMMM', 'BBBMMMM', 'BBBMMMM', 'WWTTTTT', 'WWTTTTT', 'WWTTTTT'],
  rooms: {
    K: { name: 'Cocina', floor: 'k' },
    M: { name: 'Comedor', floor: 'm' },
    B: { name: 'Barra', floor: 'b' },
    W: { name: 'Aseos', floor: 'w', article: 'los' },
    T: { name: 'Terraza', floor: 't' },
  },
  floors: { k: ['bigTiles', '#f3efe6', '#e2dccf'], m: ['parquet', '#d9b48a', '#c99c6c'], b: ['darkWood', '#6e4b35', '#5b3c2a'], w: ['mosaic', '#d6ecef', '#c0e0e6'], t: ['cobble', '#d6cfc2', '#bdb3a2'] },
  objects: [
    ['kitchen', 0, 0, 2, 1, { variant: 'horno' }],
    ['fridge', 1, 2],
    ['table', 1, 4, 1, 1, { variant: 'mantel', color: '#2a9d8f' }],
    ['chair', 0, 4, 1, 1, { variant: 'comedor', color: '#8a5a33' }],
    ['chair', 1, 5, 1, 1, { variant: 'comedor', color: '#8a5a33' }],
    ['table', 3, 6, 1, 1, { variant: 'mantel', color: '#2a9d8f' }],
    ['chair', 2, 6, 1, 1, { variant: 'comedor', color: '#8a5a33' }],
    ['piano', 3, 3, 2, 1, { color: '#2b2b2b' }],
    ['counter', 2, 0, 1, 2, { variant: 'bar', rot: 90, color: '#4b3a33' }],
    ['stool', 2, 1, 1, 1, { color: '#c49a5a' }],
    ['toilet', 6, 0],
    ['sink', 4, 0],
    ['table', 5, 4, 1, 1, { variant: 'redonda', color: '#ffffff' }],
    ['chair', 5, 3, 1, 1, { variant: 'terraza', color: '#e63946' }],
    ['umbrella', 4, 6, 1, 1, { color: '#e63946' }],
    ['plant', 6, 6, 1, 1, { variant: 'olivo' }],
  ],
  edges: [['window', 0, 6, 'right']],
});

const CASE_2: CaseDef = {
  id: 'ej2-anillo',
  title: 'El anillo en el tiramisú',
  subtitle: 'Leo escondió un anillo en el postre para pedirle matrimonio a Ana. Cuando llegó el tiramisú, el anillo ya no estaba.',
  pageColor: '#d9eaf6',
  scenario: restaurante,
  people: ['ana', 'leo', 'camarero', 'cocinera', 'musico', 'pareja', 'anillo'],
  target: 'anillo',
  culprit: 'cocinera',
  targetLabel: 'El anillo.',
  culpritRef: 'quien lo encontró',
  question: 'Lo encontró...',
  answerNote: 'probando el tiramisú (y lo devolvió, tranquilos)',
  tier: 2,
  pins: [
    { p: 'ana', rooms: ['Comedor'] },
    { p: 'leo', rooms: ['Comedor'] },
    { p: 'anillo', rooms: ['Cocina'] },
    { p: 'cocinera', rooms: ['Cocina'] },
  ],
};

export const EXAMPLE_CASES: CaseDef[] = [CASE_1, CASE_2];

export const EXAMPLE_BOOK: Partial<BookSettings> = {
  ...defaultBook(),
  title: 'Amordoku',
  subtitle: 'Acertijos de *lógica* y *amor*',
  author: 'Leo',
  dedication: 'Para Ana,\nmi caso favorito.',
  narratorName: 'Comisario Leo',
  narratorCharacterId: 'leo',
  coverScenarioId: 'casa-abuela',
  coverPortraits: [
    { characterId: 'leo', r: 1, c: 3 },
    { characterId: 'ana', r: 4, c: 1 },
  ],
  backCover: { ...defaultBook().backCover, characterIds: ['leo', 'ana'] },
};
