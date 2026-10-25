/**
 * Portada de la app: resumen del proyecto, pasos y copias de seguridad.
 */
import { Avatar } from '../../assets/avatar/Avatar';
import type { Project } from '../../domain/types';
import { Button, useToast } from '../components/ui';
import { go } from '../lib/router';
import { downloadText, pickTextFile } from '../lib/util';
import { HAS_PRIVATE_PROJECT } from '../store/initialProject';
import { useProject } from '../store/projectStore';

export function HomePage() {
  const { project, setProject, resetProject } = useProject();
  const [toast, showToast] = useToast();
  const stars = project.characters.slice(0, 2);

  const exportJson = () => {
    downloadText(`${project.name.replace(/\s+/g, '-').toLowerCase() || 'amordoku'}.json`, JSON.stringify(project, null, 1));
    showToast('Proyecto exportado. Guárdalo bien: es tu copia de seguridad.');
  };
  const importJson = async () => {
    const text = await pickTextFile();
    if (!text) return;
    try {
      const p = JSON.parse(text) as Project;
      if (!p.characters || !p.scenarios || !p.cases || !p.book) throw new Error('formato');
      setProject(p);
      showToast('Proyecto importado.');
    } catch {
      showToast('Ese archivo no parece un proyecto de Amordoku.');
    }
  };
  const reset = () => {
    if (confirm('Se perderán los cambios hechos en este navegador y se cargará el proyecto original. ¿Seguro?')) {
      resetProject();
      showToast('Proyecto original restaurado.');
    }
  };

  const steps = [
    { n: 1, title: 'Crea a los personajes', text: 'Pelo, barba, pendientes, gafas, ropa… y su nombre. También animales y objetos.', to: 'personajes' },
    { n: 2, title: 'Dibuja los escenarios', text: 'Pinta las divisiones y los suelos, coloca muebles, ventanas y puertas.', to: 'escenarios' },
    { n: 3, title: 'Monta cada murdoku', text: 'Elige reparto, objetivo y culpable, cuenta tu recuerdo y genera las pistas.', to: 'casos' },
    { n: 4, title: 'Imprime el libro', text: 'Ordena los casos, personaliza portada e instrucciones y descárgalo en PDF.', to: 'libro' },
  ];

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-text">
          <h1>{project.name}</h1>
          <p>
            Tu libro tiene <b>{project.cases.length}</b> casos, <b>{project.scenarios.length}</b> escenarios y <b>{project.characters.length}</b> personajes.
          </p>
          <p className="muted">
            {HAS_PRIVATE_PROJECT
              ? 'Cargado desde tu carpeta privada (no se sube a GitHub).'
              : 'Estás viendo el proyecto de ejemplo. Cámbialo todo a tu gusto o importa el tuyo.'}{' '}
            Los cambios se guardan solos en este navegador.
          </p>
          <div className="row">
            <Button kind="primary" onClick={() => go('casos')}>
              Abrir mis murdokus
            </Button>
            <Button onClick={() => go('libro')}>Ver el libro</Button>
          </div>
        </div>
        <div className="hero-polaroids">
          {stars.map((ch, i) => (
            <div key={ch.id} className="hero-polaroid" style={{ transform: `rotate(${i ? 5 : -6}deg)` }}>
              <Avatar spec={ch.avatar} size="100%" />
              <span>{ch.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="steps">
        {steps.map((s) => (
          <button key={s.n} className="step" onClick={() => go(s.to)}>
            <span className="step-n">{s.n}</span>
            <b>{s.title}</b>
            <span>{s.text}</span>
          </button>
        ))}
      </section>

      <section className="card backup">
        <h2>Copias de seguridad</h2>
        <p>
          Todo se guarda en este navegador. Exporta el proyecto de vez en cuando (un archivo <code>.json</code>) para no perder nada y para pasarlo a otro ordenador.
        </p>
        <div className="row">
          <Button onClick={exportJson}>⬇️ Exportar proyecto</Button>
          <Button onClick={importJson}>⬆️ Importar proyecto</Button>
          <Button kind="ghost" onClick={reset}>
            Restaurar el original
          </Button>
        </div>
      </section>
      <footer className="muted small" style={{ textAlign: 'center', marginTop: 24 }}>
        © 2026 Alejandro Bueno · <a href="https://github.com/alexbueno0o/amordoku">github.com/alexbueno0o</a> · Todos los derechos reservados
      </footer>
      {toast}
    </div>
  );
}
