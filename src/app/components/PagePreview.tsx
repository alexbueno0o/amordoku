/**
 * Muestra una página del libro (127 × 190,5 mm) reducida a un ancho en
 * píxeles, tal cual se imprimirá. Con `lazy` solo se dibuja al aparecer en
 * pantalla (útil para previsualizar el libro entero sin bloquear la app).
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';

const PAGE_W_PX = 480; // 127 mm a 96 ppp
const PAGE_H_PX = 720; // 190,5 mm a 96 ppp

export function PagePreview({ width, children, lazy, shadow = true }: { width: number; children: ReactNode; lazy?: boolean; shadow?: boolean }) {
  const k = width / PAGE_W_PX;
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(!lazy);
  useEffect(() => {
    if (!lazy || visible || !ref.current) return;
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && setVisible(true), { rootMargin: '400px' });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [lazy, visible]);
  return (
    <div ref={ref} className={`page-preview${shadow ? ' shadow' : ''}`} style={{ width, height: PAGE_H_PX * k }}>
      {visible ? (
        <div style={{ transform: `scale(${k})`, transformOrigin: 'top left', width: PAGE_W_PX, height: PAGE_H_PX }}>{children}</div>
      ) : (
        <div className="page-placeholder" />
      )}
    </div>
  );
}

/** Doble página (izquierda + derecha). */
export function SpreadPreview({ width, left, right, lazy }: { width: number; left?: ReactNode; right?: ReactNode; lazy?: boolean }) {
  const pw = width / 2;
  return (
    <div className="spread-preview" style={{ width }}>
      {left ? (
        <PagePreview width={pw} lazy={lazy} shadow={false}>
          {left}
        </PagePreview>
      ) : (
        <div className="page-empty" style={{ width: pw, height: (pw * PAGE_H_PX) / PAGE_W_PX }} />
      )}
      {right ? (
        <PagePreview width={pw} lazy={lazy} shadow={false}>
          {right}
        </PagePreview>
      ) : (
        <div className="page-empty" style={{ width: pw, height: (pw * PAGE_H_PX) / PAGE_W_PX }} />
      )}
    </div>
  );
}
