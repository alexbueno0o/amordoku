/**
 * Enrutado mínimo por "hash" (#/personajes/leo): no necesita servidor y
 * funciona abriendo la app como archivo estático.
 */
import { useEffect, useState } from 'react';

export function useRoute(): string[] {
  const read = () => window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  const [parts, setParts] = useState(read);
  useEffect(() => {
    const on = () => setParts(read());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return parts;
}

export function go(...parts: string[]) {
  window.location.hash = '/' + parts.map(encodeURIComponent).join('/');
}
