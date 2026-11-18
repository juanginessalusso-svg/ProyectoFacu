import React, { useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from './Modal';
import { pad2 } from '../lib/format';

export default function Lightbox({ items, index, onClose, onGo }) {
  const it = items[index];

  useEffect(() => {
    const f = (e) => {
      if (e.key === 'ArrowRight') onGo((index + 1) % items.length);
      if (e.key === 'ArrowLeft') onGo((index - 1 + items.length) % items.length);
    };
    document.addEventListener('keydown', f);
    return () => document.removeEventListener('keydown', f);
  }, [index, items.length, onGo]);

  if (!it) return null;

  return (
    <Modal
      label={`Fotografía ${index + 1} de ${items.length}: ${it.cap}`}
      onClose={onClose}
      size="photo"
    >
      <figure className="lb">
        <div className="lb-img">
          <img src={it.src} alt={it.cap} />
          <span className="stage-vig" aria-hidden="true" />
        </div>
        <figcaption>
          <span>
            {pad2(index + 1)} / {pad2(items.length)}
          </span>{' '}
          {it.cap}
        </figcaption>
        <button
          type="button"
          className="lb-nav l"
          onClick={() => onGo((index - 1 + items.length) % items.length)}
          aria-label="Anterior"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          type="button"
          className="lb-nav r"
          onClick={() => onGo((index + 1) % items.length)}
          aria-label="Siguiente"
        >
          <ChevronRight size={22} />
        </button>
      </figure>
    </Modal>
  );
}
