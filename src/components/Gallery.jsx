import React, { useState, useEffect, useRef } from 'react';
import Lightbox from './Lightbox';
import { cx } from '../lib/format';
import { getGalleryPhotos, getGalleryIntro, DEFAULT_GALLERY } from '../lib/storage';
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

  const fallbackText = DEFAULT_GALLERY[index]?.text || '';
  const displayText = photo.text || photo.desc || photo.description || fallbackText;

  // Si no tiene imagen (solo título y/o texto editorial)
  if (!photo.src) {
    return (
      <article
        ref={rowRef}
        className={cx(
          'py-12 md:py-16 border-b border-[var(--line-soft)] max-w-3xl mx-auto transition-opacity duration-700',
          inView ? 'opacity-100' : 'opacity-0'
        )}
      >
        {photo.cap && (
          <h3 className="font-serif text-2xl sm:text-3xl md:text-[32px] text-[var(--ivory)] font-medium leading-tight mb-4 tracking-wide">
            {photo.cap}
          </h3>
        )}
        {displayText && (
          <p className="text-lg sm:text-xl md:text-2xl text-[var(--ivory)] font-light leading-relaxed whitespace-pre-line font-sans tracking-wide">
            {displayText}
          </p>
        )}
      </article>
    );
  }

  // Alternancia según boceto para items con foto:
  // Fila 0: Texto a la izquierda, Foto a la derecha (isPhotoOnLeft = false)
  // Fila 1: Foto a la izquierda, Texto a la derecha (isPhotoOnLeft = true)
  // Fila 2: Texto a la izquierda, Foto a la derecha (isPhotoOnLeft = false)
  // Fila 3: Foto a la izquierda, Texto a la derecha (isPhotoOnLeft = true)
  const isPhotoOnLeft = index % 2 === 1;
  const ratio = ASPECT_RATIOS[index % ASPECT_RATIOS.length];

  // Efecto Cortina exclusivo: la foto se devela como telón y el texto se desliza
  const figAnimClass = inView
    ? (isPhotoOnLeft ? 'fx-curtain-l' : 'fx-curtain-r')
    : 'opacity-0';

  const textAnimClass = inView
    ? (isPhotoOnLeft ? 'fx-slide-right' : 'fx-slide-left')
    : 'opacity-0';

  return (
    <article
      ref={rowRef}
      className="py-12 md:py-16 border-b border-[var(--line-soft)] grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center group"
    >
      {/* COLUMNA FOTOGRAFÍA: EL TÍTULO APARECE POR ARRIBA DE LA FOTO */}
      <div
        className={cx(
          'lg:col-span-7 flex flex-col',
          isPhotoOnLeft ? 'lg:order-1' : 'lg:order-2',
          'order-1'
        )}
      >
        {photo.cap && (
          <h3 className="font-serif text-xl sm:text-2xl md:text-[28px] text-[var(--ivory)] font-medium leading-tight mb-3.5 tracking-wide">
            {photo.cap}
          </h3>
        )}

        <div
          className={cx(
            'm3g-fig cursor-pointer rounded-lg overflow-hidden border border-[var(--line-soft)] shadow-xl relative',
            figAnimClass
          )}
          style={{ '--a': ratio }}
          onClick={onOpen}
          title="Ampliar fotografía en pantalla completa"
        >
          <img
            src={photo.src}
            alt={photo.cap}
            loading="lazy"
            draggable="false"
            className="w-full h-full object-cover"
          />
          <span className="stage-vig" aria-hidden="true" />
        </div>
      </div>

      {/* COLUMNA TEXTO: AL COSTADO DE LA FOTO */}
      <div
        className={cx(
          'lg:col-span-5 flex flex-col justify-center',
          isPhotoOnLeft ? 'lg:order-2' : 'lg:order-1',
          'order-2',
          textAnimClass
        )}
        style={{ animationDelay: inView ? '0.15s' : undefined }}
      >
        <div className="space-y-4">
          <p className="text-lg sm:text-xl md:text-2xl text-[var(--ivory)] font-light leading-relaxed whitespace-pre-line font-sans tracking-wide">
            {displayText}
          </p>
        </div>
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

  const photosWithImages = photos.filter((p) => Boolean(p.src));

  return (
    <section id="galeria" className="section spot-top overflow-hidden" style={{ paddingTop: '90px', paddingBottom: '90px' }}>
      <div className="wrap">
        {/* CABECERA EDITORIAL SEGÚN BOCETO: TÍTULO EN GRANDE + FOTO (OPCIONAL) A LA IZQUIERDA, INFORMACIÓN A LA DERECHA */}
        <div className="pb-12 pt-4 border-b border-[var(--line-soft)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
            {/* COLUMNA IZQUIERDA: TÍTULO EN GRANDE Y FOTO OPCIONAL DEBAJO */}
            <div className="lg:col-span-6 space-y-6">
              <div>
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
              </div>

              {/* FOTOGRAFÍA OPCIONAL DEBAJO DEL TÍTULO */}
              {intro.image && (
                <div
                  className="m3g-fig rounded-lg overflow-hidden border border-[var(--line-soft)] shadow-2xl relative aspect-[16/10] group cursor-pointer"
                  onClick={() => setLb('intro')}
                  title="Ampliar fotografía de cabecera"
                >
                  <img
                    src={intro.image}
                    alt="Galería Insignia · Alberdi 355"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                    draggable="false"
                  />
                  <span className="stage-vig" aria-hidden="true" />
                </div>
              )}
            </div>

            {/* COLUMNA DERECHA: INFORMACIÓN */}
            <div className="lg:col-span-6 flex flex-col justify-start lg:pt-3">
              <div className="p-6 sm:p-8 rounded-xl bg-[var(--ink-2)]/40 border border-[var(--line-soft)] space-y-4 shadow-lg backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center text-[11px] font-mono tracking-widest text-[var(--gold)] uppercase px-2.5 py-1 rounded bg-[var(--gold)]/10 border border-[var(--gold)]/20">
                    Información
                  </span>
                </div>

                {intro.title && (
                  <h2 className="text-xl sm:text-2xl font-serif text-[var(--ivory)] font-medium tracking-wide">
                    {intro.title}
                  </h2>
                )}

                {intro.text ? (
                  <p className="text-sm sm:text-base text-[var(--ivory-dim)] leading-relaxed whitespace-pre-line font-sans">
                    {intro.text}
                  </p>
                ) : (
                  <p className="text-sm sm:text-base text-[var(--ivory-dim)] leading-relaxed font-sans">
                    Un espacio consagrado al arte, el coleccionismo y la exhibición de obras maestras en la ciudad de Río Cuarto. Alberdi 355 abre sus puertas a muestras colectivas, subastas en vivo y encuentros culturales que dialogan entre la historia y la contemporaneidad.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FILAS DE FOTOGRAMAS EDITORIALES CON EFECTO CORTINA Y DISPOSICIÓN ZIGZAG */}
        <div id="rows">
          {photos.map((photo, index) => (
            <GalleryRowItem
              key={photo.id || index}
              photo={photo}
              index={index}
              onOpen={() => {
                if (photo.src) {
                  const idx = photosWithImages.indexOf(photo);
                  if (idx >= 0) setLb(idx);
                }
              }}
            />
          ))}
        </div>
      </div>

      {/* LIGHTBOX OFICIAL */}
      {lb !== null && (
        <Lightbox
          items={
            lb === 'intro'
              ? [{ src: intro.image, cap: intro.title || 'Galería Insignia · Espacio de Arte Alberdi 355' }]
              : photosWithImages
          }
          index={lb === 'intro' ? 0 : lb}
          onClose={() => setLb(null)}
          onGo={(idx) => {
            if (lb !== 'intro') setLb(idx);
          }}
        />
      )}
    </section>
  );
}
