/**
 * Tipos del motor lógico de Amordoku.
 *
 * El motor es TypeScript puro (sin React ni DOM) para poder usarse igual en la
 * app, en un Web Worker y en los scripts de Node (validación y generación).
 *
 * Convenciones:
 *  - Las celdas se indexan como `r * cols + c` (fila mayor).
 *  - Fila 0 = arriba (norte). Columna 0 = izquierda (oeste).
 */

export type Gender = 'm' | 'f';

/** Lado de una celda, usado para ventanas y puertas que viven en las paredes. */
export type Side = 'top' | 'right' | 'bottom' | 'left';

/** Una celda del plano. `null` en el array de celdas = fuera del tablero. */
export interface CellSpec {
  /** Id de la división (habitación/zona) a la que pertenece. */
  room: string;
  /** Id del suelo (solo estético, salvo en pistas `onFloor`). */
  floor: string;
}

export interface RoomSpec {
  id: string;
  /** Nombre visible, p. ej. "Salón principal". */
  name: string;
  /** Artículo para las pistas: "el", "la", "los", "las" o "" (sin artículo). */
  article: 'el' | 'la' | 'los' | 'las' | '';
  /** Nombre propio: no se pasa a minúscula en las pistas ("en Casa Pepe"). */
  proper?: boolean;
}

/** Objeto colocado en el plano. Ocupa un rectángulo w×h de celdas. */
export interface ObjectInstance {
  id: string;
  /** Id del tipo de objeto (ver ObjectTypeInfo). */
  type: string;
  r: number;
  c: number;
  w: number;
  h: number;
  /** Rotación visual (no afecta a la lógica salvo por w/h). */
  rot?: 0 | 90 | 180 | 270;
  /** Variante de dibujo (p. ej. "sillon", "taburete"). */
  variant?: string;
  /** Color principal opcional. */
  color?: string;
  /** Texto opcional pintado sobre el objeto (cartelitos). */
  label?: string;
}

/** Elemento que vive en una pared: ventana o puerta. */
export interface EdgeFeature {
  id: string;
  type: string;
  r: number;
  c: number;
  side: Side;
  variant?: string;
}

/** Plano lógico completo que necesita el motor. */
export interface BoardSpec {
  rows: number;
  cols: number;
  /** Longitud rows*cols. `null` = celda fuera del tablero. */
  cells: (CellSpec | null)[];
  rooms: RoomSpec[];
  objects: ObjectInstance[];
  edges: EdgeFeature[];
}

/** Sustantivo con género para construir frases en español. */
export interface Noun {
  sing: string;
  plural: string;
  gender: Gender;
}

/** Metadatos lógicos de un tipo de objeto (el dibujo vive en src/assets). */
export interface ObjectTypeInfo {
  id: string;
  noun: Noun;
  /** ¿Una persona puede estar encima? (camas, sillas, alfombras...) */
  occupiable: boolean;
  /** ¿Estar encima se describe como "sentado/a"? */
  seat?: boolean;
  /** Preposición al estar encima: "en" (cama), "sobre" (alfombra)... */
  onPrep?: 'en' | 'sobre' | 'dentro de' | 'subido a' | 'subida a';
  /** Si es un objeto de pared (ventana/puerta). */
  edge?: boolean;
}

/** Información lógica de un suelo (para pistas tipo "estaba en la arena"). */
export interface FloorTypeInfo {
  id: string;
  /** Frase tras "Estaba ...": p. ej. "en la arena", "en el agua". */
  phrase?: string;
}

/** Persona (o animal/objeto) que participa en un caso. */
export interface PersonSpec {
  id: string;
  name: string;
  gender: Gender;
}

/* ------------------------------------------------------------------------- */
/* Pistas                                                                     */
/* ------------------------------------------------------------------------- */

export type Direction = 'N' | 'S' | 'E' | 'W' | 'NE' | 'NW' | 'SE' | 'SW';
export type Axis = 'row' | 'col';

/**
 * Pistas estructuradas. El texto en español se genera automáticamente a partir
 * de la estructura (ver clues/text-es.ts), pero se puede sobrescribir con `text`.
 *
 * `p` = persona sujeto de la pista. `q` = otra persona.
 */
export type Clue =
  // --- Pistas de posición de una persona (unarias) ---
  | { kind: 'inRoom'; p: string; room: string; text?: string }
  | { kind: 'notInRoom'; p: string; room: string; text?: string }
  | { kind: 'inRoomOneOf'; p: string; rooms: string[]; text?: string }
  | { kind: 'onObject'; p: string; type: string; only?: boolean; text?: string }
  | { kind: 'notOnObject'; p: string; type: string; text?: string }
  | { kind: 'besideObject'; p: string; type: string; only?: boolean; text?: string }
  | { kind: 'notBesideObject'; p: string; type: string; text?: string }
  | { kind: 'besideEdge'; p: string; type: string; only?: boolean; text?: string }
  | { kind: 'notBesideEdge'; p: string; type: string; text?: string }
  | { kind: 'onFloor'; p: string; floor: string; text?: string }
  | { kind: 'row'; p: string; index: number; text?: string }
  | { kind: 'col'; p: string; index: number; text?: string }
  | { kind: 'gridCorner'; p: string; text?: string }
  | { kind: 'roomCorner'; p: string; text?: string }
  | { kind: 'lineWithObject'; p: string; type: string; axis: Axis; text?: string }
  | { kind: 'roomEdgeLine'; p: string; which: 'firstRow' | 'lastRow' | 'firstCol' | 'lastCol'; text?: string }
  // --- Pistas sobre compañía en la división ---
  | { kind: 'alone'; p: string; text?: string }
  | { kind: 'notAlone'; p: string; text?: string }
  | { kind: 'withCount'; p: string; count: number; gender?: Gender; text?: string }
  // --- Pistas relacionales (dos personas) ---
  | { kind: 'sameRoom'; p: string; q: string; text?: string }
  | { kind: 'differentRoom'; p: string; q: string; text?: string }
  | { kind: 'aloneWith'; p: string; q: string; text?: string }
  | { kind: 'direction'; p: string; q: string; dir: Direction; text?: string }
  | { kind: 'offset'; p: string; q: string; axis: Axis; delta: number; text?: string }
  // --- Pistas globales (lupa al pie de la página) ---
  | { kind: 'countOnObject'; type: string; count: number; text?: string }
  | { kind: 'countInRoom'; room: string; count: number; text?: string }
  | { kind: 'noEmptyRoom'; text?: string }
  | { kind: 'countBesideEdge'; type: string; count: number; text?: string }
  // --- Pista del objetivo (víctima) ---
  | { kind: 'targetAloneWithCulprit'; p: string; text?: string }
  // --- Pista narrativa sin efecto lógico (solo texto) ---
  | { kind: 'flavor'; p?: string; text: string };

export type ClueKind = Clue['kind'];

/** Un caso listo para resolver. */
export interface PuzzleSpec {
  board: BoardSpec;
  persons: PersonSpec[];
  /** Id de la persona/objeto objetivo ("la víctima"). */
  targetId: string;
  clues: Clue[];
}

/** Posición de cada persona: id → índice de celda. */
export type Placement = Record<string, number>;
