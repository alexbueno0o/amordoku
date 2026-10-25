/**
 * Esqueleto de la app: barra superior con las secciones y la página activa.
 */
import { Wordmark } from '../book/FrontMatter';
import { go, useRoute } from './lib/router';
import { BookPage } from './pages/BookPage';
import { CasesPage } from './pages/CasesPage';
import { CharactersPage } from './pages/CharactersPage';
import { HomePage } from './pages/HomePage';
import { ScenariosPage } from './pages/ScenariosPage';
import { PrintView } from './print/PrintView';
import { bundledBuiltAt } from './store/initialProject';
import { useProject } from './store/projectStore';

const TABS = [
  { id: 'personajes', label: 'Personajes', icon: '🧑‍🎨' },
  { id: 'escenarios', label: 'Escenarios', icon: '🏠' },
  { id: 'casos', label: 'Murdokus', icon: '🔍' },
  { id: 'libro', label: 'Libro', icon: '📖' },
];

export function App() {
  const route = useRoute();
  const [section, id] = route;
  const { project, resetProject } = useProject();
  const bundled = bundledBuiltAt();
  const newer = bundled !== undefined && bundled !== project.builtAt && (project.builtAt === undefined || bundled > project.builtAt);
  if (section === 'imprimir') return <PrintView what={id === 'caso' ? 'case' : 'book'} caseId={route[2]} />;
  return (
    <div className="app">
      <header className="topbar no-print">
        <button className="brand" onClick={() => go()} title="Inicio">
          <Wordmark title="Amordoku" color="#1d1b22" width="150px" />
          <span className="brand-sub">estudio</span>
        </button>
        <nav className="tabs">
          {TABS.map((t) => (
            <button key={t.id} className={`tab${section === t.id ? ' on' : ''}`} onClick={() => go(t.id)}>
              <span className="tab-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
      </header>
      {newer && (
        <div className="update-banner no-print">
          Hay una versión más nueva del proyecto generada con los scripts.{' '}
          <button
            onClick={() => {
              if (confirm('Se cargará la versión nueva y se perderán los cambios hechos en la app desde entonces. ¿Seguir?')) resetProject();
            }}
          >
            Cargarla
          </button>
        </div>
      )}
      <main className="main">
        {section === 'personajes' && <CharactersPage selectedId={id} />}
        {section === 'escenarios' && <ScenariosPage selectedId={id} />}
        {section === 'casos' && <CasesPage selectedId={id} />}
        {section === 'libro' && <BookPage />}
        {!section && <HomePage />}
      </main>
    </div>
  );
}
