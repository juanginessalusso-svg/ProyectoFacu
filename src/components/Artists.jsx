import React, { useState, useEffect, useRef } from 'react';
import { ARTISTS } from '../data/content';

export default function Artists() {
  const [activeArtistIndex, setActiveArtistIndex] = useState(null);
  const [activeWorkIndex, setActiveWorkIndex] = useState(0);
  const openerRef = useRef(null);
  const panelRef = useRef(null);

  const activeArtist = activeArtistIndex !== null ? ARTISTS[activeArtistIndex] : null;
  const works = activeArtist
    ? (activeArtist.works && activeArtist.works.length > 0
        ? activeArtist.works
        : [activeArtist.artwork])
    : [];
  const currentWork = works[activeWorkIndex] || works[0];
  const hasMultipleWorks = works.length > 1;

  const handleOpen = (index, buttonEl) => {
    openerRef.current = buttonEl;
    setActiveArtistIndex(index);
    setActiveWorkIndex(0);
  };

  const handleClose = () => {
    setActiveArtistIndex(null);
    setActiveWorkIndex(0);
    if (openerRef.current) {
      openerRef.current.focus();
    }
  };

  const handleStep = (dir) => {
    if (!works.length) return;
    const n = works.length;
    setActiveWorkIndex((prev) => (prev + dir + n) % n);
  };

  useEffect(() => {
    if (activeArtistIndex === null) return;

    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowLeft' && hasMultipleWorks) {
        handleStep(-1);
      } else if (e.key === 'ArrowRight' && hasMultipleWorks) {
        handleStep(1);
      } else if (e.key === 'Tab' && panelRef.current) {
        const buttons = Array.from(
          panelRef.current.querySelectorAll('button:not([hidden])')
        );
        if (buttons.length === 0) return;
        const first = buttons[0];
        const last = buttons[buttons.length - 1];

        if (e.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeArtistIndex, hasMultipleWorks, works.length]);

  return (
    <>
      {/* ===== INICIO SECCIÓN ARTISTAS ===== */}
      <section className="artistas" id="artistas">
        <div className="artistas__inner">
          <div className="artistas__eyebrow">
            <span>REPARTO</span>
          </div>
          <h2 className="artistas__title">
            Artistas de la <em>colección</em>
          </h2>
          <div className="artistas__list" id="artistas-list">
            {ARTISTS.map((a, i) => {
              const artistWorks =
                a.works && a.works.length > 0 ? a.works : [a.artwork];
              const primaryWork = artistWorks[0];

              return (
                <article className="art-row" key={a.id || a.name}>
                  <div className="art-row__media">
                    {a.portrait ? (
                      <img
                        src={a.portrait}
                        alt={`Retrato de ${a.name}`}
                        style={{ objectPosition: a.portraitPosition || 'center top' }}
                        loading="lazy"
                      />
                    ) : (
                      <div className="ph">[RETRATO]</div>
                    )}
                  </div>
                  <div className="art-row__text">
                    <h3 className="art-row__name">{a.name}</h3>
                    <p className="art-row__meta">
                      {a.years} · {a.discipline}
                    </p>
                    <p className="art-row__bio">{a.bio}</p>
                    {primaryWork && (
                      <p className="art-row__work">
                        Obra destacada · {primaryWork.title}
                        {primaryWork.technique ? ` (${primaryWork.technique})` : ''}
                      </p>
                    )}
                    <button
                      type="button"
                      className="btn"
                      data-artist={i}
                      onClick={(e) => handleOpen(i, e.currentTarget)}
                    >
                      VER OBRA →
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Visor de la obra */}
      <div
        className="vo"
        id="vo"
        hidden={activeArtistIndex === null}
        onClick={(e) => {
          if (!e.target.closest('img, .ph, button, .vo__cap')) {
            handleClose();
          }
        }}
      >
        <div
          ref={panelRef}
          className="vo__panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="vo-title"
          aria-label={activeArtist ? `Obra de ${activeArtist.name}` : undefined}
          tabIndex={-1}
        >
          <button
            type="button"
            className="vo__close"
            id="vo-close"
            onClick={handleClose}
          >
            CERRAR ×
          </button>
          <div className="vo__stage">
            <button
              type="button"
              className="vo__nav"
              id="vo-prev"
              aria-label="Obra anterior"
              hidden={!hasMultipleWorks}
              onClick={() => handleStep(-1)}
            >
              ←
            </button>
            <figure className="vo__fig" id="vo-fig">
              {currentWork && (currentWork.img || currentWork.src) ? (
                <img
                  src={currentWork.img || currentWork.src}
                  alt={`${currentWork.title}${
                    currentWork.technique ? `, ${currentWork.technique}` : ''
                  }, de ${activeArtist?.name || ''}`}
                />
              ) : (
                <div className="ph">[OBRA]</div>
              )}
            </figure>
            <button
              type="button"
              className="vo__nav"
              id="vo-next"
              aria-label="Obra siguiente"
              hidden={!hasMultipleWorks}
              onClick={() => handleStep(1)}
            >
              →
            </button>
          </div>
          <div className="vo__cap">
            <div>
              <h3 className="vo__title" id="vo-title">
                {currentWork?.title || ''}
              </h3>
              <p className="vo__sub" id="vo-sub">
                {currentWork && currentWork.technique && activeArtist
                  ? `${currentWork.technique} · ${activeArtist.name}`
                  : activeArtist?.name || ''}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* ===== FIN SECCIÓN ARTISTAS ===== */}
    </>
  );
}
