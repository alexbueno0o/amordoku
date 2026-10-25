/**
 * Textos por defecto de las páginas fijas del libro (instrucciones, glosario,
 * agradecimientos...). Todos se pueden sobrescribir desde el editor del libro.
 */
export const DEFAULT_TEXTS = {
  welcomeTitle: '¡Bienvenida, inspectora!',
  welcomeText:
    'Ha pasado algo –sí, lo has adivinado– muy sospechoso. ¿La buena noticia? Tenemos la lista completa de sospechosos y lo que contaron. Déjame enseñarte cómo funciona.',
  goalTitle: 'Tu objetivo',
  goalText: 'Descubrir al culpable: la única persona que estaba a solas con la víctima en su misma división.',
  overviewTitle: 'Visión general',
  overviewIntro: 'Coloca a cada sospechoso usando sus pistas y estas reglas:',
  rule1: 'Cada personaje estaba en una fila y una columna diferentes.',
  rule2: 'Solo se puede estar sobre camas, sillas, alfombras y demás objetos ocupables.',
  rule3: 'Mesas, plantas, televisores y demás no se pueden ocupar.',
  rule4: 'La víctima está en la última casilla libre. Quien esté a solas con ella en la misma división es el culpable.',
  twistTitle: '¡OJO!',
  twistText:
    'En este libro no todo son asesinatos: a veces buscarás a quien se comió la última croqueta, a quien consoló a alguien o a quien robó un beso. El papelito de cada caso te dice qué buscas.',
  stepTitle: 'Paso a paso',
  stepIntro: 'Un ejemplo: 3 sospechosos y 1 víctima en una escena de 4 × 4 con dos divisiones.',
  noteBeside: '**NOTA:** «al lado de» significa justo encima, debajo, a la izquierda o a la derecha de algo, y en la misma división.',
  cluesTitle: 'Ahora, examinemos las pistas.',
  cluesStep1: '1. Según sus pistas, Paca, Toni y Lola pueden estar en estas celdas:',
  importantTitle: '¡IMPORTANTE!',
  importantText: 'Cada personaje estaba en una fila diferente y en una columna diferente.',
  importantA: 'Si L está aquí…',
  importantB: '…nadie más puede estar en estas celdas.',
  cluesStep2: '2. Lola solo puede estar en una celda: bloqueamos su fila y su columna.',
  cluesStep3: '3. Eso deja a Toni un único sitio en la tumbona.',
  step4: '4. Bloqueamos la fila y la columna de Toni: a Paca solo le queda una celda al lado de la mesa.',
  step5: '5. La víctima está en la última celda libre: la croqueta estaba en la cocina.',
  culpritTitle: 'Por fin, identifiquemos al culpable.',
  culpritText: 'El culpable estaba a solas con la víctima en su división.',
  culpritCaption: '¡Paca estaba a solas con la croqueta en la cocina! Paca es la culpable.',
  narratorBubble2: '¿Paca, eh? Ya me olía yo algo. ¡Que la detengan!',
  doubtsTitle: '¿Alguna duda?',
  doubtsText: 'Al final tienes un glosario y las soluciones explicadas paso a paso. ¡A investigar! Estos casos no se resuelven solos.',
  objectsTitle: 'Lista de objetos',
  canTitle: 'Se pueden ocupar',
  cannotTitle: 'No se pueden ocupar',
  windowTitle: 'Ventana',
  windowNote:
    '**Nota sobre las ventanas:** viven sobre las líneas gruesas (paredes). Si una ventana está entre dos celdas, cuenta como «delante» para las dos.',
  tipsTitle: 'Consejos avanzados',
  tip1Title: '1. Analiza fila a fila y columna a columna.',
  tip1: 'Hay exactamente una persona por fila y por columna. Si una fila solo tiene una celda disponible, alguien tiene que estar allí, aunque todavía no sepas quién.',
  tip2Title: '2. Analiza división a división.',
  tip2: 'En vez de buscar dónde está cada uno, piensa quién puede o no puede estar en cada división. Es muy útil cuando una pista dice «No había ninguna división vacía».',
  tip3Title: '3. Elimina las celdas que se cruzan.',
  tip3: 'Si alguien solo puede estar en dos celdas, imagina las esquinas de un rectángulo: nadie más puede ocupar las otras dos esquinas.',
  glossaryTitle: 'Glosario de palabras clave',
  ackTitle: 'Agradecimientos',
  acknowledgements:
    'Este libro no existiría sin…\n• Ti, por convertir cada plan en un recuerdo que merecía su propio acertijo.\n• Nuestras familias y amigos, sospechosos habituales de todas nuestras historias.\n• A ti, inspectora, por resolver el caso más difícil: aguantarme. ¡Nos vemos en la próxima!',
};

export type TextKey = keyof typeof DEFAULT_TEXTS;

export function bookText(texts: Partial<Record<string, string>> | undefined, key: TextKey): string {
  const v = texts?.[key];
  return v !== undefined && v !== '' ? v : DEFAULT_TEXTS[key];
}
