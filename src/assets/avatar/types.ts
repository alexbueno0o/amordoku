/**
 * Especificación de un avatar (retrato plano sin rasgos, estilo libro de
 * acertijos). Cada opción tiene una etiqueta en español para el editor.
 */

export type AvatarKind = 'person' | 'animal' | 'object';

export interface Option<T extends string = string> {
  id: T;
  label: string;
}

const opts = <T extends string>(list: [T, string][]): Option<T>[] => list.map(([id, label]) => ({ id, label }));

export const FACE_SHAPES = opts([
  ['oval', 'Ovalada'],
  ['round', 'Redonda'],
  ['square', 'Cuadrada'],
  ['long', 'Alargada'],
  ['heart', 'Corazón'],
  ['diamond', 'Diamante'],
] as const);
export type FaceShape = (typeof FACE_SHAPES)[number]['id'];

export const HAIR_STYLES = opts([
  ['bald', 'Calvo'],
  ['buzz', 'Rapado'],
  ['short', 'Corto clásico'],
  ['sidePart', 'Raya al lado'],
  ['quiff', 'Tupé'],
  ['messy', 'Despeinado'],
  ['slick', 'Engominado atrás'],
  ['receding', 'Entradas'],
  ['curlyShort', 'Rizos cortos'],
  ['curlyMedium', 'Rizos medios (melena)'],
  ['curlyLong', 'Rizos largos'],
  ['afro', 'Afro'],
  ['wavyMedium', 'Ondulado medio'],
  ['mullet', 'Mullet'],
  ['manBun', 'Moño masculino'],
  ['rocker', 'Melena rockera'],
  ['spiky', 'De punta'],
  ['longStraight', 'Largo liso (raya al medio)'],
  ['longSide', 'Largo con raya al lado'],
  ['longWavy', 'Largo ondulado'],
  ['longCurly', 'Largo rizado'],
  ['bangsLong', 'Largo con flequillo'],
  ['bob', 'Bob'],
  ['lob', 'Media melena'],
  ['pixie', 'Pixie'],
  ['ponytail', 'Coleta'],
  ['highBun', 'Moño alto'],
  ['lowBun', 'Moño bajo'],
  ['braid', 'Trenza'],
  ['twoBuns', 'Dos moños'],
  ['halfUp', 'Semirrecogido'],
  ['granny', 'Rizado corto (abuela)'],
  ['grandpa', 'Canoso con entradas'],
  ['fallera', 'Moños de fallera'],
  ['bridal', 'Recogido de novia'],
] as const);
export type HairStyle = (typeof HAIR_STYLES)[number]['id'];

export const EYEBROWS = opts([
  ['none', 'Sin cejas (estilo libro)'],
  ['thin', 'Finas'],
  ['natural', 'Naturales'],
  ['thick', 'Pobladas'],
  ['arched', 'Arqueadas'],
] as const);
export type EyebrowStyle = (typeof EYEBROWS)[number]['id'];

export const FACIAL_HAIR = opts([
  ['none', 'Sin barba'],
  ['stubble', 'Barba de tres días'],
  ['short', 'Barba corta'],
  ['fade', 'Barba degradada desde las patillas'],
  ['full', 'Barba poblada'],
  ['long', 'Barba larga'],
  ['goatee', 'Perilla'],
  ['mustache', 'Bigote'],
  ['mustacheGoatee', 'Bigote y perilla'],
  ['chevron', 'Bigote grueso'],
  ['handlebar', 'Bigote manillar'],
  ['sideburns', 'Patillas'],
] as const);
export type FacialHairStyle = (typeof FACIAL_HAIR)[number]['id'];

export const GLASSES = opts([
  ['none', 'Sin gafas'],
  ['round', 'Redondas'],
  ['square', 'Cuadradas'],
  ['rect', 'Rectangulares finas'],
  ['cat', 'Ojo de gato'],
  ['aviator', 'Aviador'],
  ['sunSquare', 'De sol cuadradas'],
  ['sunOval', 'De sol alargadas'],
  ['sunRound', 'De sol redondas'],
  ['threeD', '3D (rojo/azul)'],
  ['goggles', 'Gafas de protección'],
  ['ski', 'Máscara de esquí'],
] as const);
export type GlassesStyle = (typeof GLASSES)[number]['id'];

export const EARRINGS = opts([
  ['none', 'Sin pendientes'],
  ['stud', 'Botón'],
  ['hoop', 'Aro'],
  ['doubleHoop', 'Dos aros'],
  ['drop', 'Colgante'],
  ['statement', 'Llamativos'],
  ['pearl', 'Perla'],
  ['fallera', 'De fallera'],
] as const);
export type EarringStyle = (typeof EARRINGS)[number]['id'];

export const NECKLACES = opts([
  ['none', 'Sin collar'],
  ['chain', 'Cadena'],
  ['pearls', 'Perlas'],
  ['pendant', 'Colgante'],
  ['cord', 'Cordón con colgante'],
  ['choker', 'Gargantilla'],
  ['statement', 'Llamativo'],
  ['beads', 'Cuentas de colores (doble)'],
  ['fallera', 'Aderezo fallero'],
] as const);
export type NecklaceStyle = (typeof NECKLACES)[number]['id'];

export const HATS = opts([
  ['none', 'Sin gorro'],
  ['beanie', 'Gorro de lana'],
  ['cap', 'Gorra'],
  ['capBack', 'Gorra hacia atrás'],
  ['helmet', 'Casco de moto'],
  ['bucket', 'Gorro de pescador'],
  ['beret', 'Boina'],
  ['chef', 'Gorro de cocinero'],
  ['party', 'Gorro de fiesta'],
  ['headband', 'Diadema'],
  ['flowerCrown', 'Corona de flores'],
  ['veil', 'Velo de novia'],
  ['peineta', 'Peineta de fallera'],
  ['bandana', 'Pañuelo'],
  ['hardhat', 'Casco de obra'],
  ['top', 'Chistera'],
  ['sunhat', 'Pamela'],
  ['crown', 'Corona'],
  ['police', 'Gorra de policía'],
] as const);
export type HatStyle = (typeof HATS)[number]['id'];

export const OUTFITS = opts([
  ['tshirt', 'Camiseta'],
  ['vneck', 'Camiseta de pico'],
  ['polo', 'Polo'],
  ['poloContrast', 'Polo cuello contraste'],
  ['shirt', 'Camisa'],
  ['shirtOpen', 'Camisa abierta'],
  ['hawaiian', 'Camisa estampada'],
  ['suit', 'Traje y corbata'],
  ['tux', 'Esmoquin y pajarita'],
  ['blazer', 'Americana'],
  ['sweater', 'Jersey'],
  ['turtleneck', 'Cuello alto'],
  ['highNeck', 'Top cuello alto sin mangas'],
  ['hoodie', 'Sudadera'],
  ['jacket', 'Chaqueta'],
  ['leather', 'Cazadora de cuero'],
  ['coat', 'Abrigo'],
  ['tank', 'Camiseta de tirantes'],
  ['dress', 'Vestido'],
  ['strapless', 'Vestido palabra de honor'],
  ['blouse', 'Blusa'],
  ['apron', 'Delantal'],
  ['chefJacket', 'Chaquetilla de cocinero'],
  ['scrubs', 'Pijama de médico'],
  ['bareShoulders', 'Hombros al aire (bañador)'],
  ['bikini', 'Bikini'],
  ['wetsuit', 'Neopreno'],
  ['sport', 'Camiseta deportiva'],
  ['fallero', 'Traje de fallero'],
  ['fallera', 'Traje de fallera'],
  ['bride', 'Vestido de novia'],
  ['groom', 'Traje de novio'],
  ['priest', 'Sotana'],
  ['band', 'Camiseta de grupo'],
  ['robe', 'Albornoz'],
] as const);
export type OutfitStyle = (typeof OUTFITS)[number]['id'];

export const EXTRAS = opts([
  ['headphones', 'Cascos'],
  ['camera', 'Cámara colgada'],
  ['scarf', 'Bufanda'],
  ['mask', 'Mascarilla'],
  ['microphone', 'Micrófono de diadema'],
  ['flowerEar', 'Flor en el pelo'],
  ['tears', 'Lágrimas'],
  ['blushHearts', 'Corazones'],
  ['badge', 'Acreditación'],
  ['towelNeck', 'Toalla al cuello'],
  ['bouquet', 'Ramo de flores'],
  ['guitar', 'Guitarra'],
  ['drink', 'Copa en la mano'],
] as const);
export type ExtraId = (typeof EXTRAS)[number]['id'];

export const ANIMALS = opts([
  ['pigeon', 'Paloma'],
  ['ant', 'Hormiga'],
  ['duck', 'Pato'],
  ['dog', 'Perro'],
  ['cat', 'Gato'],
  ['seagull', 'Gaviota'],
  ['fish', 'Pez'],
  ['bull', 'Toro'],
] as const);
export type AnimalSpecies = (typeof ANIMALS)[number]['id'];

export const PORTRAIT_OBJECTS = opts([
  ['croqueta', 'Croqueta'],
  ['paella', 'Paella'],
  ['crochetFlower', 'Flor de ganchillo'],
  ['cake', 'Tarta'],
  ['trophy', 'Trofeo'],
  ['mojito', 'Mojito'],
  ['margarita', 'Margarita picante'],
  ['wine', 'Copa de vino'],
  ['beer', 'Cerveza'],
  ['sushi', 'Sushi'],
  ['cookie', 'Galleta'],
  ['heart', 'Corazón'],
  ['rings', 'Anillos'],
  ['exam', 'Examen'],
  ['cards', 'Cartas'],
  ['chess', 'Rey de ajedrez'],
  ['coin', 'Moneda'],
  ['ticket', 'Entrada'],
  ['bocadillo', 'Bocadillo'],
  ['camera', 'Cámara'],
  ['speaker', 'Altavoz'],
  ['scooter', 'Moto'],
  ['helmet', 'Casco'],
  ['bingoCard', 'Cartón de bingo'],
  ['flowerOffering', 'Ramo de flores'],
  ['tintoVerano', 'Tinto de verano'],
  ['popcorn', 'Palomitas'],
  ['toiletPaper', 'Papel higiénico'],
  ['gelato', 'Helado'],
  ['spritz', 'Hugo spritz'],
  ['guitar', 'Guitarra'],
  ['pick', 'Púa'],
  ['kayak', 'Kayak'],
  ['sunscreen', 'Crema solar'],
  ['couscous', 'Cuscús'],
  ['mic', 'Micrófono'],
  ['peineta', 'Peineta'],
  ['tissues', 'Pañuelos'],
  ['ice', 'Bolsa de hielo'],
  ['cubata', 'Cubata'],
  ['chorizo', 'Chorizo y salchichón'],
] as const);
export type PortraitObject = (typeof PORTRAIT_OBJECTS)[number]['id'];

export interface AvatarSpec {
  kind: AvatarKind;
  /** Color de fondo del retrato. */
  bg: string;
  skin: string;
  face: FaceShape;
  /** 0 = delgado, 1 = corpulento. Ensancha cara, cuello y hombros. */
  weight: number;
  /** 0 = mandíbula suave, 1 = muy marcada. */
  jaw: number;
  /** 0 = cara corta, 1 = cara larga. */
  length: number;
  hair: HairStyle;
  hairColor: string;
  /** Color de mechas/reflejos (opcional). */
  hairHighlight?: string;
  eyebrows: EyebrowStyle;
  facialHair: FacialHairStyle;
  facialHairColor: string;
  freckles: boolean;
  blush: boolean;
  glasses: GlassesStyle;
  glassesColor: string;
  earrings: EarringStyle;
  earringColor: string;
  necklace: NecklaceStyle;
  necklaceColor: string;
  hat: HatStyle;
  hatColor: string;
  outfit: OutfitStyle;
  outfitColor: string;
  outfitAccent: string;
  extras: ExtraId[];
  animal?: AnimalSpecies;
  animalColor?: string;
  object?: PortraitObject;
}

export const SKIN_TONES = [
  { id: '#f7dcc8', label: 'Muy clara' },
  { id: '#efc7a7', label: 'Clara' },
  { id: '#e8b791', label: 'Clara cálida' },
  { id: '#dba27a', label: 'Media' },
  { id: '#c98f63', label: 'Morena clara' },
  { id: '#b07548', label: 'Morena' },
  { id: '#8d5a36', label: 'Oscura' },
  { id: '#6a4127', label: 'Muy oscura' },
  { id: '#4a2c1b', label: 'Ébano' },
];

export const HAIR_COLORS = [
  { id: '#1f1712', label: 'Negro' },
  { id: '#3b2519', label: 'Castaño oscuro' },
  { id: '#5a3a24', label: 'Castaño' },
  { id: '#8a5a33', label: 'Castaño claro' },
  { id: '#b07a3f', label: 'Avellana' },
  { id: '#d9a85b', label: 'Rubio oscuro' },
  { id: '#f2cf6b', label: 'Rubio' },
  { id: '#f5e3a1', label: 'Rubio platino' },
  { id: '#b5452b', label: 'Pelirrojo' },
  { id: '#e07b2e', label: 'Naranja' },
  { id: '#9a9a9a', label: 'Canoso' },
  { id: '#e6e6e6', label: 'Blanco' },
  { id: '#7a4fb5', label: 'Morado' },
  { id: '#d7568f', label: 'Rosa' },
];

export const BG_COLORS = [
  '#a24c3f',
  '#d4673f',
  '#e89a3c',
  '#f2c94c',
  '#3f8f5a',
  '#5aa08f',
  '#5aa7b5',
  '#5b7fc4',
  '#4a5fa8',
  '#6a4c9c',
  '#9a5aa8',
  '#c25b8f',
  '#d8d0e8',
  '#c7dfe8',
  '#e8d6c7',
  '#cfd8c4',
];

export const DEFAULT_AVATAR: AvatarSpec = {
  kind: 'person',
  bg: '#5b7fc4',
  skin: '#e8b791',
  face: 'oval',
  weight: 0.35,
  jaw: 0.4,
  length: 0.5,
  hair: 'short',
  hairColor: '#3b2519',
  eyebrows: 'none',
  facialHair: 'none',
  facialHairColor: '#3b2519',
  freckles: false,
  blush: false,
  glasses: 'none',
  glassesColor: '#222222',
  earrings: 'none',
  earringColor: '#d4af37',
  necklace: 'none',
  necklaceColor: '#d4af37',
  hat: 'none',
  hatColor: '#3d5a9e',
  outfit: 'tshirt',
  outfitColor: '#4a6fa5',
  outfitAccent: '#ffffff',
  extras: [],
};

/** Mezcla un avatar base con cambios (p. ej. el traje de fallera de un caso). */
export function withOverrides(base: AvatarSpec, over?: Partial<AvatarSpec>): AvatarSpec {
  if (!over) return base;
  return { ...base, ...over, extras: over.extras ?? base.extras };
}
