import React, { useState, useEffect, useRef } from 'react';
import Lightbox from './Lightbox';
import { cx } from '../lib/format';
import { getGalleryPhotos, getGalleryIntro } from '../lib/storage';
import { InsigniaMonogram } from './BrandLogo';

// Ratios aspect de diseño editorial por posición
const ASPECT_RATIOS = ['16/10', '4/5', '21/9', '4/5', '4/3', '3/2', '3/2', '4/3'];

function GalleryRowItem({ photo, index, onOpen }) {
  const [inView, setInView] = useState(false);
  const rowRef = useRef(null);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;

    if (!('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isEvenRow = index % 2 === 1; // en pares la imagen va a la derecha en desktop
  const ratio = ASPECT_RATIOS[index % ASPECT_RATIOS.length];

  // Efecto Cortina exclusivo: la foto se devela como telón y el texto se desliza
  const figAnimClass = inView
    ? (!isEvenRow ? 'fx-curtain-l' : 'fx-curtain-r')
    : 'opacity-0';

  const textAnimClass = inView
    ? (!isEvenRow ? 'fx-slide-right' : 'fx-slide-left')
    : 'opacity-0';

  return (
    <article ref={rowRef} className="m3g-row group">
      {/* IMAGEN DE LA OBRA / SALA CON EFECTO CORTINA */}
      <div
        className={cx('m3g-fig', figAnimClass)}
        style={{ '--a': ratio }}
        onClick={onOpen}
        title="Ampliar fotografía en pantalla completa"
      >
        <img
          src={photo.src}
          alt={photo.cap}
          loading="lazy"
          draggable="false"
        />
        <span className="stage-vig" aria-hidden="true" />
      </div>

      {/* TEXTO DESCRIPTIVO Y NUMERACIÓN EDITORIAL */}
      <div
        className={cx('flex flex-col justify-center', textAnimClass)}
        style={{ animationDelay: inView ? '0.15s' : undefined }}
      >
        <h3 className="m3g-title">{photo.cap}</h3>
      </div>
    </article>
  );
}

export default function Gallery() {
  const [photos, setPhotos] = useState(() => getGalleryPhotos());
  const [lb, setLb] = useState(null);
  const [intro, setIntro] = useState(() => getGalleryIntro());

  useEffect(() => {
    const handleDataChange = () => {
      setPhotos(getGalleryPhotos());
      setIntro(getGalleryIntro());
    };
    window.addEventListener('insignia-data-change', handleDataChange);
    return () => window.removeEventListener('insignia-data-change', handleDataChange);
  }, []);

  return (
    <section id="galeria" className="section spot-top overflow-hidden" style={{ paddingTop: '90px', paddingBottom: '90px' }}>
      <div className="wrap">
        {/* CABECERA EDITORIAL MODELO 3 */}
        <div className="pb-8 pt-4 border-b border-[var(--line-soft)]">
          <p className="eyebrow">Espacio de arte</p>
          <div className="flex items-center gap-3.5 sm:gap-5 mt-2">
            <InsigniaMonogram className="h-[46px] sm:h-[58px] md:h-[68px] w-auto text-[#e2d7c0] shrink-0" />
            <h1 className="m3g-h1 !mt-0">
              Galería <em>Insignia</em>
            </h1>
          </div>
          <p className="text-base sm:text-lg md:text-xl text-[var(--ivory-dim)] font-medium tracking-wide mt-3">
            Alberdi 355 · Río Cuarto, Córdoba
          </p>
          {(intro.title || intro.text) && (
            <div className="mt-6 max-w-3xl">
              {intro.title && (
                <h2 className="text-lg sm:text-xl text-[var(--ivory)] font-bold tracking-wide">
                  {intro.title}
                </h2>
              )}
              {intro.text && (
                <p className="text-sm sm:text-base text-[var(--ivory-dim)] leading-relaxed mt-2 whitespace-pre-line">
                  {intro.text}
                </p>
              )}
            </div>
          )}
        </div>

        {/* FILAS DE FOTOGRAMAS EDITORIALES CON EFECTO CORTINA */}
        <div id="rows">
          {photos.map((photo, index) => (
            <GalleryRowItem
              key={photo.id || index}
              photo={photo}
              index={index}
              onOpen={() => setLb(index)}
            />
          ))}
        </div>
      </div>

      {/* LIGHTBOX OFICIAL */}
      {lb !== null && (
        <Lightbox
          items={photos}
          index={lb}
          onClose={() => setLb(null)}
          onGo={setLb}
        />
      )}
    </section>
  );
}
