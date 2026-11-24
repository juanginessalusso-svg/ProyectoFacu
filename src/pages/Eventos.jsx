import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Clock, MapPin, ArrowRight, Images, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';
import { getEvents } from '../lib/storage';
import { reduced } from '../lib/format';
import Lightbox from '../components/Lightbox';

function EventPhotoCarousel({ event, onOpenLightbox }) {
  const images = useMemo(() => {
    if (Array.isArray(event.images) && event.images.length > 0) return event.images;
    if (event.image) return [event.image];
    return ['/img/sala-exhibicion.jpg'];
  }, [event.images, event.image]);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Deslizamiento automático continuo cada 3.8 segundos
  useEffect(() => {
    if (images.length <= 1 || reduced()) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [images.length]);

  const goToPrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div
      className="group relative overflow-hidden aspect-[4/3] md:aspect-[21/9] min-h-[250px] cursor-pointer bg-[#2c2b26] select-none"
      onClick={() => onOpenLightbox(event, currentIndex)}
      title="Clic para ampliar en alta resolución"
    >
      {/* Pista deslizable horizontal (Slide Effect) */}
      <div
        className="flex w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((src, idx) => (
          <div key={src + idx} className="min-w-full w-full h-full shrink-0 relative overflow-hidden">
            <img
              src={src}
              alt={`${event.title} - Fotografía ${idx + 1}`}
              loading={idx === 0 ? 'eager' : 'lazy'}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              onError={(e) => {
                e.target.src = '/img/sala-exhibicion.jpg';
              }}
            />
          </div>
        ))}
      </div>

      {/* Flechas laterales sutiles que aparecen solo al pasar el cursor */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-11 md:h-11 rounded-full bg-black/45 hover:bg-black/85 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/20 hover:scale-105 cursor-pointer"
            onClick={goToPrev}
            aria-label="Fotografía anterior"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <button
            type="button"
            className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-11 md:h-11 rounded-full bg-black/45 hover:bg-black/85 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/20 hover:scale-105 cursor-pointer"
            onClick={goToNext}
            aria-label="Siguiente fotografía"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </>
      )}
    </div>
  );
}

function AnimatedCard({ children, className = '', delay = 0 }) {
  const [inView, setInView] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const el = cardRef.current;
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
        threshold: 0.08,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <article
      ref={cardRef}
      style={{
        transitionDuration: '800ms',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: `${delay}ms`,
      }}
      className={`transform transition-all ${
        inView
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-12 scale-[0.98]'
      } ${className}`}
    >
      {children}
    </article>
  );
}

export default function Eventos() {
  const [events, setEvents] = useState(() => getEvents());
  const [filter, setFilter] = useState('all'); // 'all' | 'subastas' | 'muestras'
  const [lightboxData, setLightboxData] = useState(null); // { items: [], index: 0 }

  useEffect(() => {
    document.title = 'Eventos & Exposiciones · Memoria Fotográfica & Próximas Fechas | Subastas Insignia';

    const handleDataChange = () => {
      setEvents(getEvents());
    };
    window.addEventListener('insignia-data-change', handleDataChange);
    return () => window.removeEventListener('insignia-data-change', handleDataChange);
  }, []);

  // Eventos Realizados (Memoria / Bitácora con fotografías)
  const pastEvents = useMemo(() => {
    return events.filter((e) => !e.isUpcoming && e.status !== 'Próximo');
  }, [events]);

  // Próximos Eventos (Agenda Futura)
  const upcomingEvents = useMemo(() => {
    return events.filter((e) => e.isUpcoming || e.status === 'Próximo');
  }, [events]);

  // Eventos pasados filtrados por categoría
  const filteredPastEvents = useMemo(() => {
    if (filter === 'subastas') {
      return pastEvents.filter((e) => (e.category || '').toLowerCase().includes('subasta'));
    }
    if (filter === 'muestras') {
      return pastEvents.filter((e) => !(e.category || '').toLowerCase().includes('subasta'));
    }
    return pastEvents;
  }, [pastEvents, filter]);

  // Abrir Lightbox para un evento específico en un índice determinado
  const handleOpenLightbox = (event, photoIndex = 0) => {
    const imagesList = Array.isArray(event.images) && event.images.length > 0
      ? event.images
      : (event.image ? [event.image] : []);

    const slides = imagesList.map((src, i) => ({
      src,
      cap: `${event.title} · ${event.date} · Fotografía ${i + 1} de ${imagesList.length}`,
    }));

    setLightboxData({
      items: slides,
      index: photoIndex,
    });
  };

  return (
    <main className="min-h-screen">
      <section className="section spot-top" style={{ paddingTop: '110px', paddingBottom: '90px' }}>
        <div className="wrap">
          {/* ========================================================= */}
          {/* SECCIÓN 1: MEMORIA DE EVENTOS REALIZADOS (CON FOTOGRAFÍAS) */}
          {/* ========================================================= */}
          <div className="mb-12">
            <div className="flex items-center gap-4 text-[13px] tracking-[0.34em] uppercase text-[#e0dccf] font-medium before:content-[''] before:w-10 before:h-[1px] before:bg-[#e0dccf]">
              Memoria &amp; Encuentros
            </div>
            <h1 className="mt-6 font-display font-medium text-[clamp(60px,9vw,120px)] leading-[0.95] tracking-tight text-[#f4f1ea]">
              Even<em className="font-normal italic">tos</em>
            </h1>
          </div>

          {/* Listado Editorial de Eventos Realizados */}
          <div className="grid gap-12 mt-12">
            {filteredPastEvents.map((ev, eventIdx) => {
              return (
                <AnimatedCard
                  key={ev.id || eventIdx}
                  delay={(eventIdx % 3) * 140}
                  className="bg-[#46453d] border border-white/15 overflow-hidden transition-all duration-300 hover:border-white/30 shadow-xl"
                >
                  {/* Meta Superior */}
                  <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 md:px-12 md:py-6 border-b border-white/15">
                    <span className="inline-block bg-[#6b6a5f] text-white border border-white/20 text-[13px] font-semibold tracking-[0.14em] uppercase px-4 py-2.5">
                      {ev.status || 'Realizado'}
                    </span>

                    <div className="flex flex-wrap items-center gap-3 md:gap-7 text-base">
                      <div className="flex items-center gap-2.5 text-lg font-semibold text-[#f4f1ea]">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e0dccf" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true" className="shrink-0">
                          <rect x="3" y="5" width="18" height="16" rx="1"></rect>
                          <path d="M3 10h18M8 3v4M16 3v4"></path>
                        </svg>
                        <span>{ev.date}</span>
                      </div>

                      {ev.location && (
                        <div className="flex items-center gap-2.5 text-base text-[#ece8dc]">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e0dccf" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true" className="shrink-0">
                            <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"></path>
                            <circle cx="12" cy="9.5" r="2.5"></circle>
                          </svg>
                          <span>{ev.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Texto: Título a la izquierda, Descripción a la derecha */}
                  <div className="flex flex-wrap gap-6 md:gap-16 px-6 py-8 md:px-12 md:py-12">
                    <h2 className="flex-1 min-w-[280px] md:min-w-[380px] m-0 font-display font-medium text-[clamp(32px,4.5vw,58px)] leading-[1.04] tracking-tight text-[#f4f1ea]">
                      {ev.title}
                    </h2>
                    {ev.description && (
                      <p className="flex-1 min-w-[280px] md:min-w-[420px] m-0 pt-2 text-base md:text-[18px] leading-[1.75] text-[#ece8dc] whitespace-pre-line font-normal">
                        {ev.description}
                      </p>
                    )}
                  </div>

                  {/* Galería Fotográfica: Carrusel Automático + Miniaturas sincronizadas */}
                  <div className="px-6 pb-6 md:px-12 md:pb-12">
                    <EventPhotoCarousel
                      event={ev}
                      onOpenLightbox={handleOpenLightbox}
                    />
                  </div>
                </AnimatedCard>
              );
            })}
          </div>

          {/* ========================================================= */}
          {/* SECCIÓN 2: PRÓXIMOS EVENTOS (CALENDARIO & HORARIO)       */}
          {/* ========================================================= */}
          <div className="mt-28 pt-20 border-t-2 border-[var(--line)]">
            {/* Header / Intro */}
            <div className="flex flex-wrap items-end justify-between gap-8 md:gap-16">
              <div className="flex-1 min-w-[280px]">
                <div className="flex items-center gap-4 text-[13px] tracking-[0.34em] uppercase text-[#e0dccf] font-medium before:content-[''] before:w-10 before:h-[1px] before:bg-[#e0dccf]">
                  Agenda &amp; Aperturas
                </div>
                <h2 className="mt-6 font-display font-medium text-[clamp(48px,7vw,96px)] leading-[0.95] tracking-tight text-[#f4f1ea]">
                  Próximos <em className="font-normal italic">Eventos</em>
                </h2>
              </div>
              <p className="flex-initial max-w-[400px] text-[16px] md:text-[17px] leading-[1.7] text-[#e4e0d4] m-0">
                Fechas confirmadas, veladas culturales y subastas presenciales en sala. Reserva tu asistencia para participar de las próximas jornadas.
              </p>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="p-8 md:p-14 border border-[var(--line-soft)] bg-gradient-to-b from-[var(--ink-3)] to-[var(--ink-2)] text-center my-10 rounded-lg">
                <Calendar className="w-10 h-10 text-[var(--gold)] mx-auto mb-3 opacity-80" />
                <h3 className="font-display text-2xl text-[var(--ivory)] font-light mb-3">
                  Próximas Fechas en Planificación
                </h3>
                <p className="text-[var(--ivory-dim)] max-w-xl mx-auto text-sm md:text-base leading-relaxed">
                  Pronto compartiremos las fechas oficiales de nuestras próximas subastas presenciales y exposiciones en Galería Alberdi 355.
                </p>
              </div>
            ) : (
              <div className="space-y-12 mt-14">
                {upcomingEvents.map((uev, uIdx) => {
                  const dayMatch = uev.date ? uev.date.match(/\d+/) : null;
                  const ghostNumber = dayMatch ? dayMatch[0].padStart(2, '0') : String(uIdx + 1).padStart(2, '0');

                  return (
                    <AnimatedCard
                      key={uev.id || uIdx}
                      delay={(uIdx % 2) * 150}
                      className="bg-[#46453d] border border-white/15 overflow-hidden transition-all duration-300 hover:border-white/30 shadow-xl"
                    >
                      {/* Top Bar: Badge y Fecha/Hora */}
                      <div className="flex flex-wrap items-center justify-between gap-5 px-6 py-6 md:px-12 md:py-7 border-b border-white/15">
                        <span className="inline-block bg-[#18463a] border border-[#226b57] text-white text-[13px] font-semibold tracking-[0.16em] uppercase px-4 py-2.5">
                          Próximo evento
                        </span>

                        <div className="flex flex-wrap items-center gap-4 sm:gap-7">
                          <div className="flex items-center gap-3 text-lg md:text-xl font-medium text-[#f4f1ea]">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e0dccf" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true" className="shrink-0">
                              <rect x="3" y="5" width="18" height="16" rx="1"></rect>
                              <path d="M3 10h18M8 3v4M16 3v4"></path>
                            </svg>
                            <span>{uev.date}</span>
                          </div>

                          {uev.time && (
                            <>
                              <span className="hidden sm:block w-[1px] h-6 bg-white/30" aria-hidden="true"></span>
                              <div className="flex items-center gap-3 text-lg md:text-xl font-medium text-[#f4f1ea]">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e0dccf" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true" className="shrink-0">
                                  <circle cx="12" cy="12" r="9"></circle>
                                  <path d="M12 7v5l3 2"></path>
                                </svg>
                                <span>{uev.time}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Título Principal con Número Fantasma en fondo */}
                      <div className="relative overflow-hidden px-6 py-12 md:px-12 md:py-16">
                        <div
                          aria-hidden="true"
                          className="pointer-events-none select-none absolute right-6 -top-7 font-display font-medium text-[clamp(160px,22vw,320px)] leading-none text-white/[0.07]"
                        >
                          {ghostNumber}
                        </div>

                        <h3 className="relative z-10 m-0 max-w-[860px] font-display font-medium text-[clamp(36px,5.5vw,78px)] leading-[1.02] tracking-tight text-[#f4f1ea]">
                          {uev.title.includes('&') ? (
                            (() => {
                              const [p1, ...p2] = uev.title.split('&');
                              return (
                                <>
                                  {p1.trim()} {'&'} <em className="font-normal italic">{p2.join('&').trim()}</em>
                                </>
                              );
                            })()
                          ) : (
                            uev.title
                          )}
                        </h3>
                      </div>

                      {/* Footer: Descripción y Botón Reservar Asistencia */}
                      <div className="flex flex-wrap items-end justify-between gap-8 md:gap-16 px-6 py-8 md:px-12 md:py-10 border-t border-white/15 bg-[#4f4e45]">
                        {uev.description && (
                          <p className="flex-1 min-w-[280px] max-w-[680px] m-0 text-base md:text-[18px] leading-[1.75] text-[#ece8dc]">
                            {uev.description}
                          </p>
                        )}

                        <a
                          href={`https://wa.me/5493584852932?text=${encodeURIComponent(
                            `Hola Subastas Insignia, deseo consultar y reservar mi lugar para el evento: "${uev.title}" (${uev.date}${uev.time ? ` a las ${uev.time}` : ''}).`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-4 min-h-[56px] px-8 md:px-9 bg-[#1c1b17] border border-white/15 text-white text-[13px] font-semibold tracking-[0.24em] uppercase transition-all duration-200 hover:bg-black hover:border-white/30 focus-visible:outline-2 focus-visible:outline-white shrink-0 group shadow-md"
                        >
                          <span>Reservar asistencia</span>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="transition-transform group-hover:translate-x-1 shrink-0">
                            <path d="M4 12h16M14 6l6 6-6 6"></path>
                          </svg>
                        </a>
                      </div>
                    </AnimatedCard>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Lightbox para ampliar fotografías del evento */}
      {lightboxData && (
        <Lightbox
          items={lightboxData.items}
          index={lightboxData.index}
          onClose={() => setLightboxData(null)}
          onGo={(newIdx) => setLightboxData((prev) => ({ ...prev, index: newIdx }))}
        />
      )}
    </main>
  );
}
