import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cx } from '../lib/format';

export default function Modal({
  label,
  onClose,
  children,
  size = 'md',
  dismissOnBackdrop = true,
}) {
  const ref = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const prev = document.activeElement;
    const ov = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const t = setTimeout(() => {
      // Si ya hay un elemento con foco dentro del modal (por ej. un input), no robar el foco
      if (
        document.activeElement &&
        ref.current &&
        ref.current.contains(document.activeElement) &&
        document.activeElement !== ref.current
      ) {
        return;
      }
      const el =
        ref.current &&
        (ref.current.querySelector('[data-autofocus]') || ref.current);
      el && el.focus();
    }, 40);

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current?.();
      }
      if (e.key === 'Tab' && ref.current) {
        const f = [
          ...ref.current.querySelectorAll(
            'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])'
          ),
        ].filter((x) => x.offsetParent !== null);
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKey);

    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = ov;
      if (prev && typeof prev.focus === 'function') {
        prev.focus();
      }
    };
  }, []);

  return (
    <div className="modal-root" role="presentation">
      <div
        className="modal-back"
        onClick={dismissOnBackdrop ? onClose : undefined}
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={cx('modal-panel', 'sz-' + size)}
      >
        <button
          type="button"
          className="modal-x"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}
