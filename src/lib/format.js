/**
 * Utilidades de formato y soporte de accesibilidad
 */

export const cx = (...args) => args.filter(Boolean).join(' ');

export const pad2 = (n) => String(n).padStart(2, '0');

export const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
