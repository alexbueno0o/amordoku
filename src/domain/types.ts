/**
 * Modelo de datos de la app: personajes, escenarios, casos y libro.
 * Todo el proyecto se guarda como un único JSON (Project).
 */
import type { AvatarSpec } from '../assets/avatar/types';
import type { BoardSpec, Clue, Gender, Placement } from '../engine/types';
import type { Pin } from '../engine/generator/generate';

export interface Character {
  id: string;
  /** Nombre que aparece en la foto. */
  name: string;
  gender: Gender;
  /** Grupo para organizarlos ("Amigos de Leo", "Familia de Ana"...). */
  group: string;
  /** Nota libre: "novia de Dani", "hermano"... */
  note?: string;
  /**
   * Artículo si el nombre es común ("Camarero" → «al norte del camarero»).
   * Si se omite se deduce solo para oficios y parentescos habituales.
   */
  article?: 'el' | 'la' | '';
  avatar: AvatarSpec;
}

export interface FloorStyle {
  /** Id del patrón (ver src/assets/floors.tsx). */
  pattern: string;
  colors: [string, string];
  /** Nombre para pistas ("en la arena"). Si se omite, el del patrón. */
  phrase?: string;
}

export interface RoomLabel {
  r: number;
  c: number;
  /** Dónde se ancla dentro de la celda. */
  anchor?: 'top' | 'center' | 'bottom';
  hidden?: boolean;
}

export interface Scenario {
  id: string;
  name: string;
  board: BoardSpec;
  /** Estilos de suelo usados por las celdas (cell.floor = clave). */
  floors: Record<string, FloorStyle>;
  /** Posición de la etiqueta de cada división (por defecto, abajo y centrada). */
  labels?: Record<string, RoomLabel>;
  /** Notas del autor (no se imprimen). */
  notes?: string;
}

export interface CasePerson {
  characterId: string;
  /** Cambios de aspecto solo para este caso (traje de fallera, casco...). */
  avatarOverride?: Partial<AvatarSpec>;
  /** Nombre distinto solo en este caso. */
  nameOverride?: string;
  /** Color de la tarjeta de pista. */
  cardColor?: string;
}

export interface CaseFile {
  id: string;
  title: string;
  /** Texto de ambiente bajo el título. */
  subtitle: string;
  scenarioId: string;
  people: CasePerson[];
  /** characterId del objetivo (víctima, croqueta, paloma...). */
  targetId: string;
  /** Rótulo del objetivo: "La víctima." */
  targetLabel: string;
  /** Texto del objetivo (si se omite, se genera). */
  targetText?: string;
  targetMode: 'lastCell' | 'aloneWithCulprit';
  /** Cómo se nombra al culpable en las pistas: "el asesino", "quien se la comió". */
  culpritRef: string;
  /** Pregunta del papelito: "El asesino es..." */
  question: string;
  /** Remate tras el nombre en la solución: "por exceso de besos". */
  answerNote?: string;
  clues: Clue[];
  postIt?: { text: string; signature: string };
  tip?: { title: string; text: string };
  /** Tipos de objeto a explicar en recuadros de leyenda. */
  legend?: string[];
  pageColor: string;
  boldKeywords: boolean;
  /** Solución verificada (se recalcula al guardar). */
  solution?: Placement;
  culpritId?: string;
  difficulty?: { score: number; level: number; label: string };
  /** Explicación de la solución (auto o editada a mano). */
  explanation?: string[];
  explanationEdited?: boolean;
  /** Parámetros del generador (para poder regenerar). */
  generator?: {
    tier: number;
    seed: number;
    pins?: Pin[];
    culpritId?: string;
    fixedClues?: Clue[];
  };
}

export interface BookSettings {
  title: string;
  /** Subtítulo; las palabras entre *asteriscos* se resaltan en rojo. */
  subtitle: string;
  author: string;
  publisher: string;
  coverColor: string;
  /** Escenario que ilustra la portada. */
  coverScenarioId?: string;
  /** Retratos que aparecen sobre el plano de la portada. */
  coverPortraits: { characterId: string; r: number; c: number }[];
  dedication: string;
  credits: string;
  /** Nombre con el que firma el narrador (pósits, instrucciones). */
  narratorName: string;
  /** Personaje que hace de narrador (se le pone gorra de policía). */
  narratorCharacterId?: string;
  /** Textos de instrucciones, glosario y agradecimientos (ver domain/bookTexts.ts). */
  texts: Partial<Record<string, string>>;
  backCover: {
    question: string;
    answer: string;
    characterIds: string[];
    blurb: string;
    /** Pósit clavado en el corcho de la contraportada. */
    note?: string;
  };
  caseOrder: string[];
  /** Mostrar números de página. */
  pageNumbers: boolean;
  /** Añadir 3 mm de sangrado para imprenta. */
  bleed: boolean;
}

export interface Project {
  version: 1;
  name: string;
  /** Cuándo se generó con los scripts (para avisar de versiones nuevas en la app). */
  builtAt?: number;
  characters: Character[];
  scenarios: Scenario[];
  cases: CaseFile[];
  book: BookSettings;
}
