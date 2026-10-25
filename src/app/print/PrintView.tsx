/**
 * Vista de impresión: las páginas a tamaño real, una tras otra. El navegador
 * las convierte en PDF con "Imprimir → Guardar como PDF".
 */
import { useEffect, useState } from 'react';
import { allPages, singleCasePages } from '../../book/Book';
import { Button } from '../components/ui';
import { useProject } from '../store/projectStore';

export function PrintView({ what, caseId }: { what: 'book' | 'case'; caseId?: string }) {
  const { project } = useProject();
  const [ready, setReady] = useState(false);
  const pages = what === 'case' && caseId ? singleCasePages(project, caseId) : allPages(project);

  useEffect(() => {
    // Esperar a que carguen las fuentes antes de dejar imprimir.
    document.fonts.ready.then(() => setReady(true));
  }, []);

  return (
    <div className="print-page">
      <div className="print-bar no-print">
        <Button onClick={() => history.back()}>← Volver</Button>
        <div>
          <b>{what === 'case' ? 'Caso + solución' : 'Libro completo'}</b> · {pages.length} páginas de 12,7 × 19,05 cm
          <div className="muted small">Destino: «Guardar como PDF» · Márgenes: ninguno · Escala: 100 % · Gráficos de fondo: activado</div>
        </div>
        <Button kind="primary" disabled={!ready} onClick={() => window.print()}>
          {ready ? '🖨️ Imprimir / Guardar PDF' : 'Cargando fuentes…'}
        </Button>
      </div>
      <div className="print-root">
        {pages.map((p) => (
          <div key={p.id} className="print-sheet">
            {p.render()}
          </div>
        ))}
      </div>
    </div>
  );
}
