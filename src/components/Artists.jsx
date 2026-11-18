import React, { useState } from 'react';
import { ZoomIn } from 'lucide-react';
import Lightbox from './Lightbox';
import { ARTISTS } from '../data/content';
import { pad2 } from '../lib/format';

export default function Artists() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedArtworkIndex, setSelectedArtworkIndex] = useState(null);

  const currentArtist = ARTISTS[selectedIndex] || ARTISTS[0];
  const totalCount = pad2(ARTISTS.length);

  // Array para el visor de obras en Lightbox
  const artworkSlides = ARTISTS.map((a) => ({
    src: a.artwork.src,
    cap: `${a.name} · ${a.artwork.title}`,
  }));

  return (
    <section id="artistas" className="artistas">
      <div className="artistas__head">
        <div className="artistas__eyebrow">REPARTO</div>
        <h2 className="artistas__title">
          Artistas de la <em>colección</em>
        </h2>
      </div>

      <div className="artistas__body">
        {/* Lista (columna izquierda) */}
        <nav className="artistas__list" aria-label="Artistas">
          {ARTISTS.map((a, i) => {
            const isCurrent = i === selectedIndex;
            return (
              <button
                key={a.id}
                type="button"
                className="artistas__item"
                aria-current={isCurrent ? 'true' : 'false'}
                onClick={() => setSelectedIndex(i)}
              >
                <span className="artistas__num">{pad2(i + 1)}</span>
                <span className="artistas__name">{a.name}</span>
                <span className="artistas__arrow" aria-hidden="true">
                  →
                </span>
              </button>
            );
          })}
        </nav>

        {/* Panel (columna derecha) */}
        <article className="artistas__panel" aria-live="polite">
          <div className="artistas__top">
            <img
              className="artistas__portrait"
              src={currentArtist.portrait}
              alt={`Retrato de ${currentArtist.name}`}
              style={{ objectPosition: currentArtist.portraitPosition || 'center' }}
              loading="lazy"
            />
            <div className="artistas__info">
              <p className="artistas__count">
                {pad2(selectedIndex + 1)} / {totalCount}
              </p>
              <h3 className="artistas__pname">{currentArtist.name}</h3>
              <p className="artistas__meta">
                {currentArtist.years} · {currentArtist.discipline}
              </p>
              <p className="artistas__bio">{currentArtist.bio}</p>
            </div>
          </div>

          <figure className="artistas__work">
            <button
              type="button"
              onClick={() => setSelectedArtworkIndex(selectedIndex)}
              className="relative block w-full text-left cursor-pointer group focus-visible:outline-2 focus-visible:outline-[var(--ivory)]"
              aria-label={`Ampliar obra: ${currentArtist.artwork.title} (haz clic para verla completa)`}
            >
              <div className="relative overflow-hidden">
                <img
                  src={currentArtist.artwork.src}
                  alt={currentArtist.artwork.title}
                  className="group-hover:opacity-95 transition-opacity"
                  loading="lazy"
                />
                <span className="absolute bottom-2.5 right-2.5 px-2.5 py-1 text-[11px] font-sans font-medium tracking-wide bg-black/80 text-white backdrop-blur-sm rounded flex items-center gap-1.5 opacity-85 group-hover:opacity-100 transition-opacity">
                  <ZoomIn size={13} />
                  Clic para ver completa
                </span>
              </div>
            </button>
            <figcaption className="mt-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <span className="font-semibold text-[11px] tracking-wider uppercase text-[var(--gold)]">
                {currentArtist.artwork.title}
              </span>
              <span className="text-[11px] text-[var(--gold)] font-medium flex items-center gap-1 opacity-90">
                <ZoomIn size={12} className="shrink-0" />
                Haz clic en la foto para verla completa (sin cortes)
              </span>
            </figcaption>
          </figure>
        </article>
      </div>

      {selectedArtworkIndex !== null && (
        <Lightbox
          items={artworkSlides}
          index={selectedArtworkIndex}
          onClose={() => setSelectedArtworkIndex(null)}
          onGo={setSelectedArtworkIndex}
        />
      )}
    </section>
  );
}
