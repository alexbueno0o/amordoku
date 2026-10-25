# Arquitectura de Amordoku

Documento técnico para quien quiera entender, mantener o ampliar el proyecto.

## Visión general

```
┌──────────────┐   Project (JSON)   ┌───────────────┐   ReactNode   ┌─────────────┐
│  App (React) │ ─────────────────▶ │  book/ (maq.) │ ────────────▶ │ PDF / print │
│  src/app     │                    └───────────────┘               └─────────────┘
│              │  caso + opciones   ┌───────────────┐
│  web worker  │ ─────────────────▶ │ engine/ (TS)  │  pistas, solución, dificultad
└──────────────┘                    └───────────────┘
```

- **Sin servidor**: todo corre en el navegador (Vite + React 18 + TypeScript estricto). El estado se guarda en `localStorage` con Zustand y se exporta/importa como JSON.
- **El motor es TypeScript puro** (sin React ni DOM), así que lo usan igual la app, el web worker, los scripts de Node y los tests.
- **El libro es un conjunto de componentes React medidos en milímetros** (127 × 190,5 mm). La misma salida sirve para la vista previa, la impresión del navegador y el PDF de Playwright.

## Carpetas

| Carpeta | Contenido |
| --- | --- |
| `src/engine/` | Modelo lógico, semántica de pistas, textos en español, solucionadores y generador. |
| `src/domain/` | Modelo de datos de la app (`Project`), valores por defecto, DSL de escenarios, construcción de casos y regeneración. |
| `src/catalog/` | Catálogo de tipos de objeto (sustantivo con género, ocupable o no, tamaño, variantes). |
| `src/assets/` | Ilustración vectorial: avatares paramétricos, suelos y objetos (SVG en JSX). |
| `src/render/` | `BoardView` (plano) y `ScratchGrid` (plantilla para tachar). |
| `src/book/` | Maquetación del libro: portada, instrucciones, dobles páginas, soluciones, glosario, contraportada. |
| `src/app/` | La app: páginas, componentes de interfaz, store, router por hash, web worker y vista de impresión. |
| `scripts/pdf.tsx` | Exportación a PDF con Playwright (renderiza con `react-dom/server`). |
| `examples/` | Proyecto público de ejemplo escrito con el DSL. |
| `private/` | Libro personal (ignorado por git). |
| `tests/` | Vitest: motor, solucionadores, ejemplo y generación. |

## Modelo de datos (`src/domain/types.ts`)

- `Character`: nombre, género (para la concordancia), grupo, artículo opcional y `AvatarSpec`.
- `Scenario`: `BoardSpec` (celdas con división y suelo, divisiones, objetos con rectángulo y giro, elementos de pared) + estilos de suelo + posición de etiquetas.
- `CaseFile`: escenario, reparto (con vestuario por caso), objetivo, pistas estructuradas (`Clue`), textos (pregunta, remate, pósit, consejo, leyendas), y datos derivados (solución, culpable, dificultad, explicación).
- `BookSettings`: portada, contraportada, créditos, textos de instrucciones y orden de casos.

Las pistas se guardan **estructuradas** (`{ kind: 'besideObject', p: 'leo', type: 'stool' }`), no como texto. El texto en español se genera al maquetar (`engine/clues/text-es.ts`): concordancia de género («sentado/sentada»), artículos según cuántos objetos de ese tipo hay («la cama» / «una cama»), contracciones («del», «al»), nombres comunes con artículo («al norte del camarero») y negritas en los primeros casos.

## Motor (`src/engine`)

### Tablero y semántica

`buildBoard` precalcula por celda: si es ocupable, su división, qué tipos de objeto tiene encima y al lado (misma división, adyacencia ortogonal), qué ventanas toca, esquinas, etc. Cada tipo de pista tiene una semántica (`clues/semantics.ts`):

- **Unarias** (dependen de una persona): en división, sobre/junto a objeto, delante de ventana, fila/columna, esquina, suelo…
- **Binarias**: al norte/sur/este/oeste de, en la misma división, a solas con, a N columnas de…
- **Globales**: «nadie estaba sobre una alfombra», «ninguna división vacía», conteos.
- **Del objetivo**: «última casilla libre» o «a solas con el culpable».

### Dos solucionadores

1. **Exacto** (`solver/exact.ts`): backtracking con dominios por persona, restricción fila/columna, propagación de pistas binarias y poda; cuenta soluciones hasta 2 → garantiza unicidad.
2. **Humano** (`solver/human.ts`): aplica técnicas deductivas por niveles, de más fácil a más difícil, y puntúa la dificultad:

| Nivel | Técnica |
| --- | --- |
| 0 | Lectura de pistas (dominios iniciales) |
| 1 | Única celda posible |
| 2 | Único candidato de fila/columna, fila con una sola celda, persona confinada a una fila |
| 3 | Relaciones entre personas, razonamiento por divisiones, conteos |
| 4 | Celdas intersectadas (esquinas de rectángulo) |
| 5 | Parejas y tríos de filas/columnas |
| 6 | Prueba y error (hipótesis con propagación) |

Todas las eliminaciones son **lógicamente correctas**: si el solucionador humano coloca a todo el mundo, la solución es única por construcción. Los tests comprueban en tableros aleatorios que nunca elimina la solución real y que coincide con el exacto.

`solver/explain-es.ts` convierte los pasos en la explicación de la página de soluciones.

### Generador (`generator/generate.ts`)

1. **Colocación**: sortea una solución que respeta las «chinchetas» de la historia (`Pin`: divisiones o celdas permitidas), el culpable fijado y la regla del objetivo, con sesgo hacia celdas «interesantes» (junto a objetos y ventanas).
2. **Candidatas**: calcula todas las pistas verdaderas para esa colocación (`candidates.ts`) con pesos de naturalidad.
3. **Fase A**: una pista por sospechoso.
4. **Fase B** (guiada por el solucionador humano): mientras quede ambigüedad, evalúa una muestra de pistas candidatas mirando hacia delante y añade la que más reduce la entropía de candidatos (`Σ log₂|dominio|`) sin pasarse del nivel de dificultad.
5. **Fase C**: elimina pistas redundantes.
6. **Fase D**: sustituye pistas para acercar la puntuación al rango del nivel elegido.
7. **Fase E (estilo)**: intenta cambiar las pistas «poco naturales» (fila/columna numéricas) por otras equivalentes.
8. **Verificación** independiente con el solucionador exacto.

`tiers.ts` define los 5 niveles (tipos de pista permitidos, rango de puntuación, nivel máximo de técnica, tamaño recomendado y modo del objetivo). Si con los tipos de un nivel no sale un caso único, `regenerate.ts`/`caseBuilder.ts` amplían el repertorio de forma gradual.

## Ilustración (`src/assets`)

- **Avatares** sin rasgos faciales (como los libros originales): cara bicolor partida, geometría paramétrica (complexión, mandíbula, largo) y capas independientes (pelo de atrás, ropa, cara, barba, pelo de delante, gafas, gorros, joyas, extras). Los gorros que cubren la cabeza recortan el pelo con un `clipPath`.
- **Suelos**: patrones SVG por celda de 100 unidades.
- **Objetos**: un renderizador por tipo; reciben ancho/alto en unidades y variante/color; el plano aplica el giro.

## Maquetación (`src/book`)

- `Book.tsx` ensambla el libro: portada, portadilla, créditos, instrucciones (4 páginas), casos (doble página, izquierda par), soluciones (2 por página), glosario y contraportada, rellenando con blancas hasta un múltiplo de 4.
- `CaseSpread.tsx` coloca polaroids y tarjetas en columnas escalonadas con un algoritmo de empaquetado que mide el texto, y en la página derecha el plano, la plantilla, las leyendas, el pósit y el papelito con la pregunta (ajustando tamaños si no caben).
- Todo en milímetros en `book.css`, con `@page { size: 127mm 190.5mm }` para imprimir.

## App (`src/app`)

- **Router por hash** (`#/casos/c01`) para funcionar como archivo estático.
- **Store Zustand** con `persist` en `localStorage`; acciones inmutables por entidad.
- **Web worker** (`workers/generate.worker.ts`) para generar y analizar casos sin bloquear la interfaz; se le envía solo el subconjunto del proyecto que necesita.
- **Vista previa** de páginas escaladas (`PagePreview`) con renderizado perezoso por `IntersectionObserver`.
- El proyecto inicial se carga con `import.meta.glob` desde `private/` si existe; si no, desde `examples/`. Un sello `builtAt` permite avisar cuando hay una versión regenerada.

## Tests

```bash
npm test
```

- Hechos del tablero, textos en español, acuerdo entre solucionador humano y exacto, detección de soluciones múltiples, corrección de las deducciones en tableros aleatorios y explicación.
- Proyecto de ejemplo: unicidad y culpable de cada caso, paginación del libro, regeneración con otra semilla y artículos de los nombres.

## Ideas para ampliar

- Exportar a imagen cada página (redes sociales).
- Undo/redo en los editores.
- Más idiomas (los textos de pistas están aislados en `text-es.ts` y `bookTexts.ts`).
- Publicar la app en GitHub Pages con `npm run build` (base relativa ya configurada).
