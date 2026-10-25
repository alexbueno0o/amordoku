/**
 * Nombres de personajes en las frases de las pistas.
 *
 * Los nombres propios van tal cual («al norte de Ana»), pero los oficios y
 * parentescos necesitan artículo («al norte del camarero», «de la abuela
 * Conchi»). Si el personaje no lo indica, se deduce con esta lista.
 */
import type { Gender } from '../engine/types';

const COMMON_WORDS = new Set(
  `abuela abuelo amona azafata bajista barman batería bailarín bailarina bañista cajera cajero camarera camarero cantante cantor cantora
  chef ciclista cocinera cocinero comensal conductor conductora cura dependienta dependiente director directora dj doctora doctor
  enfermera enfermero florista fotógrafa fotógrafo guarda guía guitarrista heladera heladero hermana hermano invitada invitado
  jardinero jardinera madre maître masajista monitora monitor músico música nadador nadadora niña niño novia novio operaria operario
  padre paloma gaviota hormiga perro gata gato pato pata pescador pescadora policía portero portera profesor profesora rapero rapera
  recepcionista repartidor repartidora sacerdote señor señora seguridad senderista socorrista sumiller sumillera sushiman taquillera
  taquillero taxista técnico técnica tía tío turista vecina vecino vendedor vendedora vigilante enóloga enólogo guitarrista cámara
  bajo pareja recién oficiante padrino madrina dama paje`
    .split(/\s+/)
    .filter(Boolean),
);

/** Artículo que necesita un nombre al usarse dentro de una frase. */
export function guessPersonArticle(name: string, gender: Gender, explicit?: string): string | undefined {
  if (explicit !== undefined) return explicit || undefined;
  if (/^(El|La|Los|Las)\s/.test(name)) return undefined; // ya lo trae
  const first = name.trim().split(/\s+/)[0].toLowerCase();
  if (COMMON_WORDS.has(first)) return gender === 'f' ? 'la' : 'el';
  return undefined;
}
