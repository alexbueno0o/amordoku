/**
 * Exporta el libro a PDF con calidad de imprenta (mismo tamaño que el
 * original: 127 × 190,5 mm), sin pasar por el diálogo de impresión.
 *
 *   npm run pdf                                → libro completo
 *   npm run pdf -- --proyecto mi-libro.json    → otro proyecto exportado desde la app
 *   npm run pdf -- --caso ej1-croqueta         → solo un caso + su solución
 *   npm run pdf -- --salida libro.pdf          → nombre del archivo
 *
 * Usa el proyecto privado (private/*.project.json) si existe; si no, el ejemplo.
 * La primera vez necesita el navegador de Playwright: npx playwright install chromium
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join, relative, resolve } from 'path';
import { Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { chromium } from 'playwright';
import { allPages, singleCasePages } from '../src/book/Book';
import type { Project } from '../src/domain/types';

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '..');
const arg = (name: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

function findProject(): string {
  const explicit = arg('proyecto');
  if (explicit) return resolve(explicit);
  const priv = join(ROOT, 'private');
  if (existsSync(priv)) {
    const f = readdirSync(priv).find((x) => x.endsWith('.project.json'));
    if (f) return join(priv, f);
  }
  return join(ROOT, 'examples', 'example.project.json');
}

const projectPath = findProject();
const raw = JSON.parse(readFileSync(projectPath, 'utf8'));
// Un JSON exportado desde la app puede venir envuelto por el guardado del navegador.
const project: Project = raw.state?.project ?? raw;
const caseId = arg('caso');
const out = resolve(arg('salida') ?? join(ROOT, 'out', caseId ? `${caseId}.pdf` : 'amordoku.pdf'));

const pages = caseId ? singleCasePages(project, caseId) : allPages(project);
if (!pages.length) {
  console.error(`No hay páginas que exportar${caseId ? ` (¿existe el caso «${caseId}»?)` : ''}.`);
  process.exit(1);
}

const tmpDir = join(ROOT, '.out');
mkdirSync(tmpDir, { recursive: true });
mkdirSync(dirname(out), { recursive: true });
const rel = (p: string) => relative(tmpDir, join(ROOT, p)).split('\\').join('/');
const fonts = [
  'kaushan-script/index.css',
  'oswald/500.css',
  'roboto-slab/400.css',
  'roboto-slab/700.css',
  'crimson-pro/400.css',
  'crimson-pro/400-italic.css',
  'outfit/400.css',
  'outfit/600.css',
  'outfit/700.css',
  'outfit/800.css',
  'caveat/400.css',
  'anton/index.css',
].map((f) => `<link rel="stylesheet" href="${rel(`node_modules/@fontsource/${f}`)}">`);

// Todo en una sola pasada de React: así los identificadores internos de los
// SVG (patrones de suelo, recortes de avatares) no se repiten entre páginas.
const body = renderToStaticMarkup(
  <>
    {pages.map((p) => (
      <Fragment key={p.id}>{p.render()}</Fragment>
    ))}
  </>,
);
const html = `<!doctype html><html lang="es"><head><meta charset="utf-8">${fonts.join('')}
<link rel="stylesheet" href="${rel('src/book/book.css')}">
<style>@page{size:${project.book.bleed ? '133mm 196.5mm' : '127mm 190.5mm'};margin:0}html,body{margin:0;padding:0}
.book-page{break-after:page;page-break-after:always}.book-page::after{display:none!important}
*{-webkit-print-color-adjust:exact;print-color-adjust:exact}</style></head>
<body class="print-root">${body}</body></html>`;
const htmlPath = join(tmpDir, 'libro.html');
writeFileSync(htmlPath, html);

console.log(`Proyecto: ${relative(ROOT, projectPath)} · ${pages.length} páginas`);
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('file://' + htmlPath, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.pdf({
  path: out,
  width: project.book.bleed ? '133mm' : '127mm',
  height: project.book.bleed ? '196.5mm' : '190.5mm',
  printBackground: true,
  margin: { top: '0', right: '0', bottom: '0', left: '0' },
});
await browser.close();
console.log(`PDF listo: ${out}`);
