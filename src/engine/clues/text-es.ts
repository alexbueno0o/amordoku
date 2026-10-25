/**
 * Generación del texto en español de cada pista.
 *
 * Tiene en cuenta el género de la persona (sentado/sentada, solo/sola), el
 * artículo de cada objeto ("la cama" si solo hay una, "una cama" si hay
 * varias) y las contracciones (del, al). Las palabras clave pueden ir en
 * **negrita** (los primeros casos del libro las resaltan).
 */
import type { Board } from '../board';
import type { Clue, Gender, Noun } from '../types';

export interface TextContext {
  board: Board;
  name: (personId: string) => string;
  gender: (personId: string) => Gender;
  /** Resaltar palabras clave con **negrita**. */
  bold?: boolean;
  /** Frase de un suelo: "en la arena". */
  floorPhrase?: (floorId: string) => string;
  /** Cómo se llama al culpable en la tarjeta del objetivo: "el asesino". */
  culpritRef?: string;
  /** Artículo para nombres comunes ("el camarero", "la abuela Conchi"). */
  article?: (personId: string) => string | undefined;
}

const NUM_F = ['ninguna', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce'];
const NUM_M = ['ningún', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce'];
const ORD_F = [
  'primera',
  'segunda',
  'tercera',
  'cuarta',
  'quinta',
  'sexta',
  'séptima',
  'octava',
  'novena',
  'décima',
  'undécima',
  'duodécima',
  'decimotercera',
  'decimocuarta',
  'decimoquinta',
];

export const numF = (n: number) => NUM_F[n] ?? String(n);
export const numM = (n: number) => NUM_M[n] ?? String(n);
export const ordF = (i: number) => ORD_F[i] ?? `${i + 1}.ª`;

/** Termina en -o / -a según el género. */
export const g = (gender: Gender, masc: string, fem: string) => (gender === 'f' ? fem : masc);

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Aplica contracciones del español: "de el" → "del", "a el" → "al". */
export function contract(s: string): string {
  return s.replace(/\bde el\b/g, 'del').replace(/\ba el\b/g, 'al').replace(/\bDe el\b/g, 'Del').replace(/\bA el\b/g, 'Al');
}

const B = (ctx: TextContext, s: string) => (ctx.bold ? `**${s}**` : s);

/**
 * Cómo se nombra a una persona en una frase: «**Ana**», «el **camarero**»,
 * «la **abuela Conchi**», «la **foto**» (si el nombre ya trae artículo).
 */
export function personPhrase(name: string, article?: string): string {
  const m = name.match(/^(El|La|Los|Las)\s+(.+)$/);
  if (m) return `${m[1].toLowerCase()} **${m[2]}**`;
  if (article) {
    const lower = name.length > 1 && name[1] === name[1].toLowerCase() ? name.charAt(0).toLowerCase() + name.slice(1) : name;
    return `${article} **${lower}**`;
  }
  return `**${name}**`;
}

/** Nombre de una persona (siempre en negrita en las pistas relacionales). */
const P = (ctx: TextContext, id: string) => personPhrase(ctx.name(id), ctx.article?.(id));

function indefinite(noun: Noun): string {
  return noun.gender === 'f' ? 'una' : 'un';
}
function definite(noun: Noun): string {
  return noun.gender === 'f' ? 'la' : 'el';
}

/** "una cama" / "la cama" según cuántas haya en el plano. */
function objectRef(ctx: TextContext, typeId: string, edge = false): string {
  const info = ctx.board.typeInfo(typeId);
  const noun = info?.noun ?? { sing: typeId, plural: typeId + 's', gender: 'm' as Gender };
  const count = edge ? ctx.board.edgeCount.get(typeId) ?? 0 : ctx.board.typeCount.get(typeId) ?? 0;
  const art = count === 1 ? definite(noun) : indefinite(noun);
  return `${art} ${B(ctx, noun.sing)}`;
}

/** "ninguna planta" / "ningún televisor". */
function noneRef(ctx: TextContext, typeId: string): string {
  const info = ctx.board.typeInfo(typeId);
  const noun = info?.noun ?? { sing: typeId, plural: typeId + 's', gender: 'm' as Gender };
  return `${noun.gender === 'f' ? 'ninguna' : 'ningún'} ${B(ctx, noun.sing)}`;
}

/** "el salón principal" / "la terraza" / "Casa Pepe". */
export function roomRef(ctx: TextContext, roomId: string): string {
  const idx = ctx.board.roomIndex.get(roomId);
  const room = idx !== undefined ? ctx.board.rooms[idx] : undefined;
  if (!room) return roomId;
  const name = room.proper ? room.name : room.name.charAt(0).toLowerCase() + room.name.slice(1);
  return room.article ? `${room.article} ${B(ctx, name)}` : B(ctx, name);
}

/** Frase de "estar encima": "sentado en una silla", "en una cama", "sobre la alfombra". */
function onPhrase(ctx: TextContext, typeId: string, gender: Gender, ref?: string): string {
  const info = ctx.board.typeInfo(typeId);
  const r = ref ?? objectRef(ctx, typeId);
  if (info?.seat) return `${g(gender, 'sentado', 'sentada')} en ${r}`;
  const prep = info?.onPrep ?? 'en';
  if (prep === 'subido a' || prep === 'subida a') return `${g(gender, 'subido', 'subida')} a ${r}`;
  return `${prep} ${r}`;
}

/** Frase de "junto a un elemento de pared": "delante de una ventana", "al lado de una puerta". */
function edgePhrase(ctx: TextContext, typeId: string, ref?: string): string {
  const r = ref ?? objectRef(ctx, typeId, true);
  if (typeId === 'window') return `delante de ${r}`;
  return `al lado de ${r}`;
}

const DIRS: Record<string, string> = {
  N: 'al norte',
  S: 'al sur',
  E: 'al este',
  W: 'al oeste',
  NE: 'al noreste',
  NW: 'al noroeste',
  SE: 'al sureste',
  SW: 'al suroeste',
};

function lineName(ctx: TextContext, axis: 'row' | 'col', index: number): string {
  const total = axis === 'row' ? ctx.board.rows : ctx.board.cols;
  const word = axis === 'row' ? 'fila' : 'columna';
  if (index === total - 1) return `la última ${word}`;
  return `la ${ordF(index)} ${word}`;
}

/** Texto automático de una pista. */
export function autoClueText(clue: Clue, ctx: TextContext): string {
  const gen = 'p' in clue && clue.p ? ctx.gender(clue.p) : 'm';
  let s: string;
  switch (clue.kind) {
    case 'inRoom':
      s = `Estaba en ${roomRef(ctx, clue.room)}.`;
      break;
    case 'notInRoom':
      s = `No estaba en ${roomRef(ctx, clue.room)}.`;
      break;
    case 'inRoomOneOf':
      s = `Estaba en ${clue.rooms.map((r) => roomRef(ctx, r)).join(' o en ')}.`;
      break;
    case 'onObject':
      if (clue.only) {
        const info = ctx.board.typeInfo(clue.type);
        s = info?.seat
          ? `Era la única persona sentada en ${objectRef(ctx, clue.type)}.`
          : `Era la única persona ${onPhrase(ctx, clue.type, 'f')}.`;
      } else s = `Estaba ${onPhrase(ctx, clue.type, gen)}.`;
      break;
    case 'notOnObject': {
      const info = ctx.board.typeInfo(clue.type);
      s = info?.seat
        ? `No estaba ${g(gen, 'sentado', 'sentada')} en ${noneRef(ctx, clue.type)}.`
        : `No estaba ${onPhrase(ctx, clue.type, gen, noneRef(ctx, clue.type))}.`;
      break;
    }
    case 'besideObject':
      s = clue.only
        ? `Era la única persona al lado de ${objectRef(ctx, clue.type)}.`
        : `Estaba al lado de ${objectRef(ctx, clue.type)}.`;
      break;
    case 'notBesideObject':
      s = `No estaba al lado de ${noneRef(ctx, clue.type)}.`;
      break;
    case 'besideEdge':
      s = clue.only
        ? `Era la única persona ${edgePhrase(ctx, clue.type)}.`
        : `Estaba ${edgePhrase(ctx, clue.type)}.`;
      break;
    case 'notBesideEdge':
      s = `No estaba ${edgePhrase(ctx, clue.type, noneRef(ctx, clue.type))}.`;
      break;
    case 'onFloor':
      s = `Estaba ${ctx.floorPhrase?.(clue.floor) ?? 'en ' + clue.floor}.`;
      break;
    case 'row':
      s = `Estaba en ${lineName(ctx, 'row', clue.index)}.`;
      break;
    case 'col':
      s = `Estaba en ${lineName(ctx, 'col', clue.index)}.`;
      break;
    case 'gridCorner':
      s = 'Estaba en una de las cuatro esquinas de la cuadrícula.';
      break;
    case 'roomCorner':
      s = 'Estaba en una esquina de su división.';
      break;
    case 'lineWithObject':
      s = `Estaba en la misma ${clue.axis === 'row' ? 'fila' : 'columna'} que ${objectRef(ctx, clue.type)}, en su división.`;
      break;
    case 'roomEdgeLine': {
      const map = {
        firstRow: 'la primera fila',
        lastRow: 'la última fila',
        firstCol: 'la primera columna',
        lastCol: 'la última columna',
      } as const;
      s = `Estaba en ${map[clue.which]} de su división.`;
      break;
    }
    case 'alone':
      s = `Estaba ${g(gen, 'solo', 'sola')}.`;
      break;
    case 'notAlone':
      s = `No estaba ${g(gen, 'solo', 'sola')}.`;
      break;
    case 'withCount': {
      if (!clue.gender) {
        s =
          clue.count === 0
            ? `Estaba ${g(gen, 'solo', 'sola')}.`
            : clue.count === 1
              ? 'Estaba en una división con otra persona.'
              : `Estaba en una división con otras ${numF(clue.count)} personas.`;
      } else {
        const who = clue.gender === 'f' ? (clue.count === 1 ? 'mujer' : 'mujeres') : clue.count === 1 ? 'hombre' : 'hombres';
        s =
          clue.count === 0
            ? `No había ${clue.gender === 'f' ? 'ninguna mujer' : 'ningún hombre'} más en su división.`
            : `Estaba en una división con ${clue.gender === 'f' ? numF(clue.count) : numM(clue.count)} ${who}.`;
      }
      break;
    }
    case 'sameRoom':
      s = `Estaba en la misma división que ${P(ctx, clue.q)}.`;
      break;
    case 'differentRoom':
      s = `No estaba con ${P(ctx, clue.q)}.`;
      break;
    case 'aloneWith':
      s = `Estaba a solas con ${P(ctx, clue.q)}.`;
      break;
    case 'direction':
      s = `Estaba ${DIRS[clue.dir]} de ${P(ctx, clue.q)}.`;
      break;
    case 'offset': {
      const n = Math.abs(clue.delta);
      const unit = clue.axis === 'row' ? (n === 1 ? 'fila' : 'filas') : n === 1 ? 'columna' : 'columnas';
      const dir = clue.axis === 'row' ? (clue.delta > 0 ? 'al sur' : 'al norte') : clue.delta > 0 ? 'al este' : 'al oeste';
      s = `Estaba exactamente ${numF(n)} ${unit} ${dir} de ${P(ctx, clue.q)}.`;
      break;
    }
    case 'countOnObject': {
      const info = ctx.board.typeInfo(clue.type);
      const noun = info?.noun;
      const art = noun ? indefinite(noun) : 'un';
      const what = noun ? `${art} ${B(ctx, noun.sing)}` : clue.type;
      if (clue.count === 0)
        s = info?.seat ? `Nadie estaba sentado en ${what}.` : `Nadie estaba ${info?.onPrep ?? 'en'} ${what}.`;
      else if (info?.seat)
        s = `Había exactamente ${numF(clue.count)} ${clue.count === 1 ? 'persona sentada' : 'personas sentadas'} en ${what}.`;
      else
        s = `Había exactamente ${numF(clue.count)} ${clue.count === 1 ? 'persona' : 'personas'} ${info?.onPrep ?? 'en'} ${what}.`;
      break;
    }
    case 'countInRoom':
      s =
        clue.count === 0
          ? `No había nadie en ${roomRef(ctx, clue.room)}.`
          : `Había exactamente ${numF(clue.count)} ${clue.count === 1 ? 'persona' : 'personas'} en ${roomRef(ctx, clue.room)}.`;
      break;
    case 'noEmptyRoom':
      s = 'No había ninguna división vacía.';
      break;
    case 'countBesideEdge':
      s =
        clue.count === 0
          ? `Nadie estaba ${edgePhrase(ctx, clue.type, objectRef(ctx, clue.type, true))}.`
          : `Había exactamente ${numF(clue.count)} ${clue.count === 1 ? 'persona' : 'personas'} ${edgePhrase(ctx, clue.type)}.`;
      break;
    case 'targetAloneWithCulprit':
      s = `Estaba a solas con ${ctx.culpritRef ?? 'el asesino'}.`;
      break;
    case 'flavor':
      s = clue.text;
      break;
  }
  return contract(s);
}

/** Texto final (respeta el texto personalizado si lo hay). */
export function clueText(clue: Clue, ctx: TextContext): string {
  if (clue.text && clue.text.trim()) return clue.text;
  return autoClueText(clue, ctx);
}

/** Convierte "**negrita**" en segmentos para pintarlo. */
export function parseBold(text: string): { text: string; bold: boolean }[] {
  const out: { text: string; bold: boolean }[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ text: text.slice(last, m.index), bold: false });
    out.push({ text: m[1], bold: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), bold: false });
  return out;
}
