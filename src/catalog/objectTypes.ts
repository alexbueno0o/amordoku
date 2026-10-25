/**
 * Catálogo de tipos de objeto: metadatos lógicos y de editor.
 *
 * - `occupiable`: si una persona puede estar encima (regla clave del juego).
 * - `seat`: si estar encima se dice "sentado/a en ...".
 * - El dibujo de cada tipo vive en src/assets/objects (por id).
 *
 * Añadir un objeto nuevo = añadir una entrada aquí + su dibujo.
 */
import type { ObjectTypeInfo } from '../engine/types';

export type ObjectCategory =
  | 'asientos'
  | 'camas'
  | 'mesas'
  | 'cocina'
  | 'baño'
  | 'salón'
  | 'naturaleza'
  | 'agua'
  | 'fiesta'
  | 'música'
  | 'calle'
  | 'vehículos'
  | 'ocio'
  | 'especial'
  | 'pared';

export interface ObjectTypeDef extends ObjectTypeInfo {
  category: ObjectCategory;
  /** Tamaño por defecto en celdas [ancho, alto]. */
  size: [number, number];
  /** Color principal por defecto. */
  color: string;
  /** Variantes de dibujo disponibles (la primera es la de por defecto). */
  variants?: string[];
  /** Se dibuja bajo las paredes y otros objetos (alfombras, agua...). */
  flat?: boolean;
  /** Descripción corta para la leyenda del libro ("puede ser ocupada"). */
  legend?: string;
}

const T = (d: ObjectTypeDef) => d;

export const OBJECT_TYPES: ObjectTypeDef[] = [
  // ---------------------------------------------------------------- asientos
  T({ id: 'chair', noun: { sing: 'silla', plural: 'sillas', gender: 'f' }, occupiable: true, seat: true, category: 'asientos', size: [1, 1], color: '#c9b8e8', variants: ['sillon', 'comedor', 'plastico', 'oficina', 'terraza', 'boda', 'plegable'] }),
  T({ id: 'stool', noun: { sing: 'taburete', plural: 'taburetes', gender: 'm' }, occupiable: true, seat: true, category: 'asientos', size: [1, 1], color: '#e0b25c' }),
  T({ id: 'sofa', noun: { sing: 'sofá', plural: 'sofás', gender: 'm' }, occupiable: true, seat: true, category: 'asientos', size: [2, 1], color: '#8fa7c9', variants: ['normal', 'chaise', 'chill'] }),
  T({ id: 'bench', noun: { sing: 'banco', plural: 'bancos', gender: 'm' }, occupiable: true, seat: true, category: 'asientos', size: [3, 1], color: '#b98a5a', variants: ['madera', 'iglesia', 'piedra', 'grada'] }),
  T({ id: 'pouf', noun: { sing: 'puf', plural: 'pufs', gender: 'm' }, occupiable: true, seat: true, category: 'asientos', size: [1, 1], color: '#e57b6a' }),
  T({ id: 'wheelchair', noun: { sing: 'silla de ruedas', plural: 'sillas de ruedas', gender: 'f' }, occupiable: true, seat: true, category: 'asientos', size: [1, 1], color: '#6b7a8f' }),
  T({ id: 'lounger', noun: { sing: 'tumbona', plural: 'tumbonas', gender: 'f' }, occupiable: true, onPrep: 'en', category: 'asientos', size: [1, 2], color: '#f2f2f2' }),
  T({ id: 'seat', noun: { sing: 'butaca', plural: 'butacas', gender: 'f' }, occupiable: true, seat: true, category: 'asientos', size: [1, 1], color: '#c2403a' }),
  T({ id: 'toilet', noun: { sing: 'váter', plural: 'váteres', gender: 'm' }, occupiable: true, seat: true, category: 'baño', size: [1, 1], color: '#ffffff' }),
  // ---------------------------------------------------------------- camas
  T({ id: 'bed', noun: { sing: 'cama', plural: 'camas', gender: 'f' }, occupiable: true, onPrep: 'en', category: 'camas', size: [1, 2], color: '#a9c6e8', variants: ['individual', 'doble'] }),
  T({ id: 'carpet', noun: { sing: 'alfombra', plural: 'alfombras', gender: 'f' }, occupiable: true, onPrep: 'sobre', category: 'salón', size: [2, 2], color: '#f3d98b', flat: true, variants: ['rect', 'redonda', 'persa'] }),
  T({ id: 'towel', noun: { sing: 'toalla', plural: 'toallas', gender: 'f' }, occupiable: true, onPrep: 'sobre', category: 'agua', size: [1, 2], color: '#ef8a8a', flat: true }),
  T({ id: 'hammock', noun: { sing: 'hamaca', plural: 'hamacas', gender: 'f' }, occupiable: true, onPrep: 'en', category: 'asientos', size: [1, 2], color: '#f0c36a' }),
  // ---------------------------------------------------------------- mesas
  T({ id: 'table', noun: { sing: 'mesa', plural: 'mesas', gender: 'f' }, occupiable: false, category: 'mesas', size: [1, 1], color: '#b7a3d6', variants: ['cuadrada', 'redonda', 'larga', 'plastico', 'ajedrez', 'negra', 'mantel', 'alta', 'cristal', 'bingo', 'platos', 'trofeo'] }),
  T({ id: 'desk', noun: { sing: 'escritorio', plural: 'escritorios', gender: 'm' }, occupiable: false, category: 'mesas', size: [2, 1], color: '#a07850' }),
  T({ id: 'counter', noun: { sing: 'barra', plural: 'barras', gender: 'f' }, occupiable: false, category: 'mesas', size: [3, 1], color: '#7d5a44', variants: ['bar', 'sushi', 'madera', 'neon'] }),
  T({ id: 'stall', noun: { sing: 'puesto', plural: 'puestos', gender: 'm' }, occupiable: false, category: 'calle', size: [2, 1], color: '#e2574c', variants: ['toldo', 'flores', 'comida', 'ropa', 'helados', 'aperol'] }),
  T({ id: 'reception', noun: { sing: 'mostrador', plural: 'mostradores', gender: 'm' }, occupiable: false, category: 'mesas', size: [2, 1], color: '#8a7f73' }),
  // ---------------------------------------------------------------- cocina
  T({ id: 'kitchen', noun: { sing: 'encimera', plural: 'encimeras', gender: 'f' }, occupiable: false, category: 'cocina', size: [2, 1], color: '#e8e8e8', variants: ['lisa', 'fregadero', 'horno', 'fuegos'] }),
  T({ id: 'island', noun: { sing: 'isla de cocina', plural: 'islas de cocina', gender: 'f' }, occupiable: false, category: 'cocina', size: [2, 1], color: '#f4f4f4' }),
  T({ id: 'fridge', noun: { sing: 'nevera', plural: 'neveras', gender: 'f' }, occupiable: false, category: 'cocina', size: [1, 1], color: '#dfe6ec' }),
  T({ id: 'paella', noun: { sing: 'paella', plural: 'paellas', gender: 'f' }, occupiable: false, category: 'cocina', size: [1, 1], color: '#f2b233', variants: ['fuego', 'paellero', 'mesa'] }),
  T({ id: 'cooler', noun: { sing: 'nevera portátil', plural: 'neveras portátiles', gender: 'f' }, occupiable: false, category: 'fiesta', size: [1, 1], color: '#3d8fd1' }),
  T({ id: 'bbq', noun: { sing: 'barbacoa', plural: 'barbacoas', gender: 'f' }, occupiable: false, category: 'cocina', size: [1, 1], color: '#555' }),
  // ---------------------------------------------------------------- baño
  T({ id: 'sink', noun: { sing: 'lavabo', plural: 'lavabos', gender: 'm' }, occupiable: false, category: 'baño', size: [1, 1], color: '#ffffff' }),
  T({ id: 'shower', noun: { sing: 'ducha', plural: 'duchas', gender: 'f' }, occupiable: true, onPrep: 'en', category: 'baño', size: [1, 1], color: '#bfe3f2' }),
  T({ id: 'bathtub', noun: { sing: 'bañera', plural: 'bañeras', gender: 'f' }, occupiable: true, onPrep: 'en', category: 'baño', size: [1, 2], color: '#ffffff' }),
  T({ id: 'locker', noun: { sing: 'taquilla', plural: 'taquillas', gender: 'f' }, occupiable: false, category: 'baño', size: [1, 1], color: '#7aa0c4' }),
  // ---------------------------------------------------------------- salón
  T({ id: 'tv', noun: { sing: 'televisor', plural: 'televisores', gender: 'm' }, occupiable: false, category: 'salón', size: [1, 1], color: '#5a5470' }),
  T({ id: 'shelf', noun: { sing: 'estantería', plural: 'estanterías', gender: 'f' }, occupiable: false, category: 'salón', size: [1, 1], color: '#6b4f3a' }),
  T({ id: 'wardrobe', noun: { sing: 'armario', plural: 'armarios', gender: 'm' }, occupiable: false, category: 'salón', size: [1, 1], color: '#c79a6b' }),
  T({ id: 'nightstand', noun: { sing: 'mesita', plural: 'mesitas', gender: 'f' }, occupiable: false, category: 'camas', size: [1, 1], color: '#c79a6b' }),
  T({ id: 'box', noun: { sing: 'caja', plural: 'cajas', gender: 'f' }, occupiable: false, category: 'salón', size: [1, 1], color: '#c9a36b' }),
  T({ id: 'lamp', noun: { sing: 'lámpara', plural: 'lámparas', gender: 'f' }, occupiable: false, category: 'salón', size: [1, 1], color: '#f6d365' }),
  T({ id: 'piano', noun: { sing: 'piano', plural: 'pianos', gender: 'm' }, occupiable: false, category: 'música', size: [2, 1], color: '#222' }),
  // ---------------------------------------------------------------- naturaleza
  T({ id: 'plant', noun: { sing: 'planta', plural: 'plantas', gender: 'f' }, occupiable: false, category: 'naturaleza', size: [1, 1], color: '#5aa469', variants: ['maceta', 'flores', 'cactus', 'olivo'] }),
  T({ id: 'tree', noun: { sing: 'árbol', plural: 'árboles', gender: 'm' }, occupiable: false, category: 'naturaleza', size: [1, 1], color: '#3f8f4f', variants: ['pino', 'frondoso', 'palmera', 'naranjo'] }),
  T({ id: 'rock', noun: { sing: 'roca', plural: 'rocas', gender: 'f' }, occupiable: false, category: 'naturaleza', size: [1, 1], color: '#9a9187' }),
  T({ id: 'bush', noun: { sing: 'arbusto', plural: 'arbustos', gender: 'm' }, occupiable: false, category: 'naturaleza', size: [1, 1], color: '#4e9a5a' }),
  T({ id: 'flowers', noun: { sing: 'centro de flores', plural: 'centros de flores', gender: 'm' }, occupiable: false, category: 'naturaleza', size: [1, 1], color: '#f4a6c1' }),
  T({ id: 'bonfire', noun: { sing: 'hoguera', plural: 'hogueras', gender: 'f' }, occupiable: false, category: 'fiesta', size: [1, 1], color: '#ff8c2b' }),
  T({ id: 'cross', noun: { sing: 'cruz', plural: 'cruces', gender: 'f' }, occupiable: true, onPrep: 'en', category: 'especial', size: [1, 1], color: '#c9c3b6' }),
  T({ id: 'umbrella', noun: { sing: 'sombrilla', plural: 'sombrillas', gender: 'f' }, occupiable: false, category: 'agua', size: [1, 1], color: '#e9524a' }),
  // ---------------------------------------------------------------- agua
  T({ id: 'kayak', noun: { sing: 'kayak', plural: 'kayaks', gender: 'm' }, occupiable: true, onPrep: 'en', category: 'agua', size: [1, 2], color: '#f2c12e', variants: ['recto', 'diagonal'] }),
  T({ id: 'paddle', noun: { sing: 'tabla de pádel surf', plural: 'tablas de pádel surf', gender: 'f' }, occupiable: true, onPrep: 'sobre', category: 'agua', size: [1, 1], color: '#4bb3c8' }),
  T({ id: 'float', noun: { sing: 'flotador', plural: 'flotadores', gender: 'm' }, occupiable: true, onPrep: 'en', category: 'agua', size: [1, 1], color: '#ff6f91' }),
  T({ id: 'jet', noun: { sing: 'chorro de masaje', plural: 'chorros de masaje', gender: 'm' }, occupiable: true, onPrep: 'en', category: 'agua', size: [1, 1], color: '#bfe8ff', flat: true }),
  T({ id: 'pond', noun: { sing: 'estanque', plural: 'estanques', gender: 'm' }, occupiable: false, category: 'agua', size: [1, 1], color: '#7ec8e3', flat: true, legend: 'Agua: no se puede ocupar' }),
  T({ id: 'railing', noun: { sing: 'barandilla', plural: 'barandillas', gender: 'f' }, occupiable: false, category: 'calle', size: [1, 1], color: '#8d8d8d' }),
  T({ id: 'buoy', noun: { sing: 'boya', plural: 'boyas', gender: 'f' }, occupiable: false, category: 'agua', size: [1, 1], color: '#ff7a2f' }),
  // ---------------------------------------------------------------- fiesta y música
  T({ id: 'speaker', noun: { sing: 'altavoz', plural: 'altavoces', gender: 'm' }, occupiable: false, category: 'música', size: [1, 1], color: '#333' }),
  T({ id: 'dj', noun: { sing: 'mesa de DJ', plural: 'mesas de DJ', gender: 'f' }, occupiable: false, category: 'música', size: [2, 1], color: '#2b2b3a' }),
  T({ id: 'drums', noun: { sing: 'batería', plural: 'baterías', gender: 'f' }, occupiable: false, category: 'música', size: [1, 1], color: '#c0392b' }),
  T({ id: 'amp', noun: { sing: 'amplificador', plural: 'amplificadores', gender: 'm' }, occupiable: false, category: 'música', size: [1, 1], color: '#2d2d2d' }),
  T({ id: 'mic', noun: { sing: 'micrófono', plural: 'micrófonos', gender: 'm' }, occupiable: false, category: 'música', size: [1, 1], color: '#444' }),
  T({ id: 'camera', noun: { sing: 'cámara', plural: 'cámaras', gender: 'f' }, occupiable: false, category: 'música', size: [1, 1], color: '#333' }),
  T({ id: 'stage', noun: { sing: 'escenario', plural: 'escenarios', gender: 'm' }, occupiable: true, onPrep: 'sobre', category: 'música', size: [3, 2], color: '#5b4636', flat: true }),
  T({ id: 'balloon', noun: { sing: 'globo', plural: 'globos', gender: 'm' }, occupiable: false, category: 'fiesta', size: [1, 1], color: '#ff6b81' }),
  T({ id: 'cake', noun: { sing: 'tarta', plural: 'tartas', gender: 'f' }, occupiable: false, category: 'fiesta', size: [1, 1], color: '#f7c6d9' }),
  T({ id: 'barrel', noun: { sing: 'barrica', plural: 'barricas', gender: 'f' }, occupiable: false, category: 'fiesta', size: [1, 1], color: '#8b5a2b' }),
  T({ id: 'bingo', noun: { sing: 'bombo', plural: 'bombos', gender: 'm' }, occupiable: false, category: 'ocio', size: [1, 1], color: '#d4a017' }),
  T({ id: 'screen', noun: { sing: 'pantalla', plural: 'pantallas', gender: 'f' }, occupiable: false, category: 'ocio', size: [3, 1], color: '#f5f5f5', variants: ['cine', 'concierto', 'juego'] }),
  T({ id: 'arcade', noun: { sing: 'diana', plural: 'dianas', gender: 'f' }, occupiable: false, category: 'ocio', size: [1, 1], color: '#c98d4a' }),
  T({ id: 'belt', noun: { sing: 'cinta de sushi', plural: 'cintas de sushi', gender: 'f' }, occupiable: false, category: 'mesas', size: [3, 1], color: '#9aa3ad' }),
  // ---------------------------------------------------------------- calle y vehículos
  T({ id: 'car', noun: { sing: 'coche', plural: 'coches', gender: 'm' }, occupiable: true, onPrep: 'en', category: 'vehículos', size: [1, 2], color: '#e2574c', variants: ['turismo', 'taxi', 'furgo', 'descapotable', 'taxi4', 'grande'] }),
  T({ id: 'scooter', noun: { sing: 'moto', plural: 'motos', gender: 'f' }, occupiable: true, onPrep: 'subido a', category: 'vehículos', size: [1, 1], color: '#5cb85c', variants: ['normal', 'diagonal'] }),
  T({ id: 'wagon', noun: { sing: 'vagón', plural: 'vagones', gender: 'm' }, occupiable: true, onPrep: 'en', category: 'vehículos', size: [1, 1], color: '#d9534f', variants: ['montaña', 'taxi', 'teleferico'] }),
  T({ id: 'track', noun: { sing: 'vía', plural: 'vías', gender: 'f' }, occupiable: false, category: 'vehículos', size: [1, 1], color: '#a0714f', flat: true }),
  T({ id: 'streetlamp', noun: { sing: 'farola', plural: 'farolas', gender: 'f' }, occupiable: false, category: 'calle', size: [1, 1], color: '#3b3b3b' }),
  T({ id: 'trafficlight', noun: { sing: 'semáforo', plural: 'semáforos', gender: 'm' }, occupiable: false, category: 'calle', size: [1, 1], color: '#333' }),
  T({ id: 'bin', noun: { sing: 'papelera', plural: 'papeleras', gender: 'f' }, occupiable: false, category: 'calle', size: [1, 1], color: '#6a8f4e' }),
  T({ id: 'crowd', noun: { sing: 'grupo de gente', plural: 'grupos de gente', gender: 'm' }, occupiable: false, category: 'calle', size: [1, 1], color: '#8d6e63', legend: 'Público: no se puede ocupar' }),
  T({ id: 'statue', noun: { sing: 'estatua', plural: 'estatuas', gender: 'f' }, occupiable: false, category: 'especial', size: [1, 1], color: '#cfc8bb' }),
  T({ id: 'fountain', noun: { sing: 'fuente', plural: 'fuentes', gender: 'f' }, occupiable: false, category: 'especial', size: [2, 1], color: '#d8d1c3' }),
  T({ id: 'altar', noun: { sing: 'altar', plural: 'altares', gender: 'm' }, occupiable: true, onPrep: 'en', category: 'especial', size: [2, 1], color: '#f7efe3', flat: true }),
  T({ id: 'arch', noun: { sing: 'arco de flores', plural: 'arcos de flores', gender: 'm' }, occupiable: false, category: 'especial', size: [1, 1], color: '#f4c2d7' }),
  T({ id: 'virgin', noun: { sing: 'Virgen', plural: 'Vírgenes', gender: 'f' }, occupiable: false, category: 'especial', size: [2, 2], color: '#f7b2c4' }),
  T({ id: 'nest', noun: { sing: 'nido', plural: 'nidos', gender: 'm' }, occupiable: false, category: 'naturaleza', size: [1, 1], color: '#a7814f' }),
  T({ id: 'house', noun: { sing: 'casa', plural: 'casas', gender: 'f' }, occupiable: false, category: 'especial', size: [2, 2], color: '#7a8a6a', variants: ['dragon', 'casal', 'caseta'] }),
  T({ id: 'sign', noun: { sing: 'cartel', plural: 'carteles', gender: 'm' }, occupiable: false, category: 'calle', size: [1, 1], color: '#f2e2b8' }),
  T({ id: 'trophy', noun: { sing: 'trofeo', plural: 'trofeos', gender: 'm' }, occupiable: false, category: 'ocio', size: [1, 1], color: '#d4af37' }),
  // ---------------------------------------------------------------- pared
  T({ id: 'window', noun: { sing: 'ventana', plural: 'ventanas', gender: 'f' }, occupiable: false, edge: true, category: 'pared', size: [1, 1], color: '#dfe7ec' }),
  T({ id: 'door', noun: { sing: 'puerta', plural: 'puertas', gender: 'f' }, occupiable: false, edge: true, category: 'pared', size: [1, 1], color: '#a0703c' }),
];

const BY_ID = new Map(OBJECT_TYPES.map((t) => [t.id, t]));

/** Búsqueda de tipo por id (con soporte para tipos personalizados del proyecto). */
export function objectType(id: string, custom?: ObjectTypeDef[]): ObjectTypeDef | undefined {
  return custom?.find((t) => t.id === id) ?? BY_ID.get(id);
}

/** Crea un `TypeLookup` para el motor combinando catálogo y tipos personalizados. */
export function typeLookup(custom?: ObjectTypeDef[]) {
  return (id: string) => objectType(id, custom);
}
