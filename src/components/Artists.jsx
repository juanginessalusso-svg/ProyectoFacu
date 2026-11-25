import React, { useState, useEffect, useRef } from 'react';
import { ARTISTS } from '../data/content';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getHome } from '../lib/storage';

const getArtistNameParts = (fullName) => {
  if (fullName === 'Alicia Díaz Rinaldi') {
    return { first: 'ALICIA', last: 'DÍAZ RINALDI' };
  }
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return { first: '', last: parts[0].toUpperCase() };
  const first = parts.slice(0, -1).join(' ').toUpperCase();
  const last = parts[parts.length - 1].toUpperCase();
  return { first, last };
};

export default function Artists() {
  const [activeArtistIndex, setActiveArtistIndex] = useState(null);
  const [activeWorkIndex, setActiveWorkIndex] = useState(0);
  const openerRef = useRef(null);
  const modalPanelRef = useRef(null);

  const activeArtist = activeArtistIndex !== null ? ARTISTS[activeArtistIndex] : null;
  const [home, setHome] = useState(() => getHome());
  useEffect(() => {
    const onChange = () => setHome(getHome());
    window.addEventListener('insignia-data-change', onChange);
    return () => window.removeEventListener('insignia-data-change', onChange);
  }, []);

  const works = activeArtist
    ? (activeArtist.works && activeArtist.works.length > 0
        ? activeArtist.works
        : [activeArtist.artwork]
      ).filter(Boolean)
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

  const handlePrevArtist = () => {
    setActiveArtistIndex((prev) => (prev > 0 ? prev - 1 : ARTISTS.length - 1));
    setActiveWorkIndex(0);
  };

  const handleNextArtist = () => {
    setActiveArtistIndex((prev) => (prev < ARTISTS.length - 1 ? prev + 1 : 0));
    setActiveWorkIndex(0);
  };

  const handleWorkStep = (dir) => {
    if (!works.length) return;
    const n = works.length;
    setActiveWorkIndex((prev) => (prev + dir + n) % n);
  };

  useEffect(() => {
    if (activeArtistIndex === null) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    modalPanelRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowLeft') {
        if (hasMultipleWorks && e.altKey) {
          handleWorkStep(-1);
        } else {
          handlePrevArtist();
        }
      } else if (e.key === 'ArrowRight') {
        if (hasMultipleWorks && e.altKey) {
          handleWorkStep(1);
        } else {
          handleNextArtist();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeArtistIndex, hasMultipleWorks, works.length]);

  // Duplicamos la lista para crear un bucle infinito continuo y suave (Marquee)
  const displayArtists = [...ARTISTS, ...ARTISTS];

  return (
    <>
      {/* ===== SECCIÓN ARTISTAS CON SCROLL AUTOMÁTICO INFINITO ===== */}
      <section className="artistas" id="artistas">
        <div className="artistas__inner">
          <div className="artistas__eyebrow">
            <span>REPARTO</span>
          </div>
          <h2 className="artistas__title">{home.artistsTitle}</h2>
          <p className="artistas__intro">{home.artistsIntro}</p>
        </div>

        {/* Carrusel Marquee infinito (se desplaza solo de forma continua y se pausa al hacer hover) */}
        <div className="art-marquee-container">
          <div className="art-marquee-track">
            {displayArtists.map((artist, i) => {
              const originalIndex = i % ARTISTS.length;
              const { first, last } = getArtistNameParts(artist.name);
              const primaryWork =
                artist.works && artist.works.length > 0
                  ? artist.works[0]
                  : artist.artwork;
              const artworkImg = primaryWork ? primaryWork.img || primaryWork.src : artist.portrait;
              const previewTitle = primaryWork ? primaryWork.title : artist.name;

              return (
                <div
                  key={`${artist.id || artist.name}-${i}`}
                  className="art-card-wrapper"
                  onClick={(e) => handleOpen(originalIndex, e.currentTarget)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOpen(originalIndex, e.currentTarget);
                    }
                  }}
                  aria-label={`Ver biografía y obras de ${artist.name}`}
                >
                  {/* Tarjeta rectangular */}
                  <div className="art-box">
                    {/* Estado 1 (Default): Fondo oscuro elegante con nombre */}
                    <div className="art-box__front">
                      <div className="art-box__text">
                        {first && <span className="art-box__first">{first}</span>}
                        <span className="art-box__last">{last}</span>
                      </div>
                    </div>

                    {/* Estado 2 (Hover): Ficha catálogo clara con la obra */}
                    <div className="art-box__back">
                      <span className="art-box__watermark">OBRAS DE SU AUTORÍA</span>
                      <div className="art-box__artwork-wrap">
                        {artworkImg ? (
                          <img
                            src={artworkImg}
                            alt={previewTitle}
                            className="art-box__artwork-img"
                            loading="lazy"
                          />
                        ) : (
                          <div className="art-box__artwork-ph">[OBRA]</div>
                        )}
                      </div>
                      <div className="art-box__preview-caption">
                        <span className="art-box__preview-title">{previewTitle}</span>
                      </div>
                    </div>
                  </div>

                  {/* Texto debajo de la tarjeta */}
                  <div className="art-card-caption">
                    Colección {artist.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== MODAL / PANTALLITA DE DETALLE DEL ARTISTA ===== */}
      {activeArtist && (
        <div
          className="art-modal-overlay"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleClose();
            }
          }}
        >
          <div
            ref={modalPanelRef}
            className="art-modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="art-modal-title"
            tabIndex={-1}
          >
            {/* Barra superior de controles */}
            <div className="art-modal-topbar">
              <div className="art-modal-topbar__eyebrow">
                <span>COLECCIÓN INSIGNIA</span>
              </div>

              {/* Botón Cerrar */}
              <button
                type="button"
                className="art-modal-close-btn"
                onClick={handleClose}
                aria-label="Cerrar ventana de artista"
              >
                <span>CERRAR</span>
                <X size={16} />
              </button>
            </div>

            {/* Contenido en 2 columnas: Artista & Obra */}
            <div className={`art-modal-body${currentWork ? '' : ' art-modal-body--solo'}`}>
              {/* Columna Izquierda: Información y foto del Artista */}
              <div className="art-modal-col art-modal-col--bio">
                <div className="art-modal-portrait-wrap">
                  {activeArtist.portrait ? (
                    <img
                      src={activeArtist.portrait}
                      alt={`Retrato de ${activeArtist.name}`}
                      className="art-modal-portrait"
                      style={{ objectPosition: activeArtist.portraitPosition || 'center top' }}
                    />
                  ) : (
                    <div className="art-modal-ph">[RETRATO]</div>
                  )}
                </div>

                <div className="art-modal-info">
                  <h3 id="art-modal-title" className="art-modal-name">
                    {activeArtist.name}
                  </h3>
                  <p className="art-modal-meta">
                    {activeArtist.years} · {activeArtist.discipline}
                  </p>
                  <p className="art-modal-bio-text">{activeArtist.bio}</p>
                </div>
              </div>

              {/* Columna Derecha: Obra Destacada de la Colección */}
              {currentWork && (
              <div className="art-modal-col art-modal-col--work">
                <div className="art-modal-work-badge">
                  <span>OBRA DESTACADA EN SALA</span>
                </div>

                <div className="art-modal-work-frame">
                  {currentWork && (currentWork.img || currentWork.src) ? (
                    <img
                      src={currentWork.img || currentWork.src}
                      alt={`${currentWork.title}${
                        currentWork.technique ? `, ${currentWork.technique}` : ''
                      }`}
                      className="art-modal-work-img"
                    />
                  ) : (
                    <div className="art-modal-ph">[OBRA]</div>
                  )}

                  {hasMultipleWorks && (
                    <div className="art-modal-work-nav">
                      <button
                        type="button"
                        onClick={() => handleWorkStep(-1)}
                        className="art-modal-work-arrow"
                        aria-label="Obra anterior"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleWorkStep(1)}
                        className="art-modal-work-arrow"
                        aria-label="Obra siguiente"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="art-modal-work-details">
                  <h4 className="art-modal-work-title">
                    {currentWork?.title || 'Obra destacada'}
                  </h4>
                  {currentWork?.technique && (
                    <p className="art-modal-work-technique">
                      {currentWork.technique}
                    </p>
                  )}
                  {currentWork?.desc && (
                    <p className="art-modal-work-desc">{currentWork.desc}</p>
                  )}
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
