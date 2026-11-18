import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Clock, MapPin, ArrowRight, Images, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';
import { getEvents } from '../lib/storage';
import Lightbox from '../components/Lightbox';

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
    window.scrollTo({ top: 0, behavior: 'smooth' });

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
          <div className="sec-head">
            <div>
              <p className="eyebrow">Memoria & Encuentros</p>
              <h1 className="h2" style={{ fontSize: 'clamp(2.8rem, 6.2vw, 4.6rem)' }}>
                Even<em>tos</em>
              </h1>
            </div>
          </div>

          {/* Listado Editorial de Eventos Realizados */}
          <div className="space-y-16 mt-8">
            {filteredPastEvents.map((ev, eventIdx) => {
              const evImages = Array.isArray(ev.images) && ev.images.length > 0
                ? ev.images
                : (ev.image ? [ev.image] : []);
              const coverImage = ev.image || evImages[0] || '/img/sala-exhibicion.jpg';
              const galleryThumbnails = evImages.slice(1, 7);

              return (
                <AnimatedCard
                  key={ev.id || eventIdx}
                  delay={(eventIdx % 3) * 140}
                  className="border border-[var(--line-soft)] bg-gradient-to-b from-[var(--ink-3)] to-[var(--ink-2)] p-6 md:p-10 shadow-sm transition-all duration-300 hover:border-[var(--gold)]/60 hover:shadow-2xl"
                >
                  {/* Encabezado del Evento */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[var(--line-soft)]">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="px-3 py-1 text-[11px] font-semibold tracking-wider uppercase bg-[var(--ink-2)] text-[var(--ivory-dim)] border border-[var(--line-soft)]">
                        {ev.status || 'Realizado'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-[var(--ivory-dim)] font-medium">
                      <span className="flex items-center gap-1.5 text-[var(--gold-hi)] font-semibold">
                        <Calendar size={15} className="text-[var(--gold)]" />
                        {ev.date}
                      </span>
                      {ev.time && (
                        <span className="flex items-center gap-1.5 font-mono text-[var(--ivory-dim)]">
                          <Clock size={14} className="text-[var(--gold)]" />
                          {ev.time}
                        </span>
                      )}
                      {ev.location && (
                        <span className="flex items-center gap-1.5 hidden sm:inline-flex">
                          <MapPin size={15} className="text-[var(--gold)]" />
                          {ev.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Cuerpo: Descripción y Galería Fotográfica */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mt-8 items-start">
                    {/* Columna Izquierda: Información Narrativa */}
                    <div className="lg:col-span-5 space-y-5">
                      <h2 className="font-serif text-3xl md:text-4xl text-[var(--ivory)] font-normal leading-tight">
                        {ev.title}
                      </h2>

                      <p className="text-sm md:text-base text-[var(--ivory-dim)] leading-relaxed whitespace-pre-line font-normal">
                        {ev.description}
                      </p>
                    </div>

                    {/* Columna Derecha: Galería Fotográfica del Evento */}
                    <div className="lg:col-span-7 space-y-3">
                      {/* Fotografía Principal */}
                      <div
                        className="relative aspect-[16/10] overflow-hidden rounded bg-black/10 cursor-pointer group border border-[var(--line-soft)] hover:border-[var(--gold)] transition-all shadow-md"
                        onClick={() => handleOpenLightbox(ev, 0)}
                        title="Clic para ampliar en alta resolución"
                      >
                        <img
                          src={coverImage}
                          alt={ev.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          onError={(e) => {
                            e.target.src = '/img/sala-exhibicion.jpg';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                        <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between text-xs text-white/90">
                          <span className="font-mono text-[11px] bg-black/60 backdrop-blur-md px-2.5 py-1 rounded">
                            Foto 1 de {evImages.length}
                          </span>
                          <span className="flex items-center gap-1.5 text-[11px] font-medium bg-[var(--gold)]/90 backdrop-blur-md px-2.5 py-1 rounded text-white group-hover:bg-[var(--gold)] transition-colors">
                            <Images size={13} />
                            Ampliar galería
                          </span>
                        </div>
                      </div>

                      {/* Mosaico de Miniaturas del Evento */}
                      {galleryThumbnails.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {galleryThumbnails.map((thumbUrl, thumbIdx) => {
                            const globalIdx = thumbIdx + 1;
                            const isLastAndMore = thumbIdx === 5 && evImages.length > 7;

                            return (
                              <div
                                key={thumbIdx}
                                className="relative aspect-square rounded overflow-hidden cursor-pointer group border border-[var(--line-soft)] hover:border-[var(--gold)] transition-all bg-black/10"
                                onClick={() => handleOpenLightbox(ev, globalIdx)}
                                title={`Ver fotografía ${globalIdx + 1}`}
                              >
                                <img
                                  src={thumbUrl}
                                  alt=""
                                  loading="lazy"
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                                />
                                {isLastAndMore && (
                                  <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center text-white font-mono text-xs font-bold">
                                    +{evImages.length - 6}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </AnimatedCard>
              );
            })}
          </div>

          {/* ========================================================= */}
          {/* SECCIÓN 2: PRÓXIMOS EVENTOS (CALENDARIO & HORARIO)       */}
          {/* ========================================================= */}
          <div className="mt-28 pt-20 border-t-2 border-[var(--line)]">
            <div className="sec-head">
              <div>
                <p className="eyebrow">Agenda & Aperturas</p>
                <h2 className="h2" style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4rem)' }}>
                  Próximos <em>Eventos</em>
                </h2>
              </div>
              <p className="sec-note">
                Fechas confirmadas, veladas culturales y subastas presenciales en sala. Reserva tu asistencia para participar de las próximas jornadas.
              </p>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="p-8 md:p-14 border border-[var(--line-soft)] bg-gradient-to-b from-[var(--ink-3)] to-[var(--ink-2)] text-center my-10 rounded-lg">
                <Calendar className="w-10 h-10 text-[var(--gold)] mx-auto mb-3 opacity-80" />
                <h3 className="font-serif text-2xl text-[var(--ivory)] font-light mb-3">
                  Próximas Fechas en Planificación
                </h3>
                <p className="text-[var(--ivory-dim)] max-w-xl mx-auto text-sm md:text-base leading-relaxed">
                  Pronto compartiremos las fechas oficiales de nuestras próximas subastas presenciales y exposiciones en Galería Alberdi 355.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                {upcomingEvents.map((uev, uIdx) => (
                  <AnimatedCard
                    key={uev.id || uIdx}
                    delay={(uIdx % 2) * 150}
                    className="border border-[var(--line-soft)] bg-gradient-to-b from-[var(--ink-3)] to-[var(--ink-2)] p-7 md:p-8 rounded-lg flex flex-col justify-between hover:border-[var(--gold)] transition-all duration-300 shadow-md group relative overflow-hidden hover:shadow-2xl"
                  >
                    {/* Badge de Próximo / Estado */}
                    <div className="flex items-center justify-between gap-3 pb-5 border-b border-[var(--line-soft)]">
                      <span className="px-3 py-1 text-[11px] font-semibold tracking-wider uppercase bg-emerald-950/70 text-emerald-200 border border-emerald-600/30 rounded-sm">
                        Próximo Evento
                      </span>
                    </div>

                    {/* Contenido Principal: Fecha, Hora y Título */}
                    <div className="py-6 space-y-4">
                      {/* Bloque Fecha y Hora destacado */}
                      <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm">
                        <div className="flex items-center gap-2 text-[var(--gold-hi)] font-semibold bg-[var(--ink-2)]/60 px-3 py-1.5 rounded border border-[var(--line-soft)]">
                          <Calendar size={16} className="text-[var(--gold)]" />
                          <span>{uev.date}</span>
                        </div>

                        {uev.time && (
                          <div className="flex items-center gap-2 text-[var(--gold-hi)] font-semibold bg-[var(--ink-2)]/60 px-3 py-1.5 rounded border border-[var(--line-soft)] font-mono">
                            <Clock size={16} className="text-[var(--gold)]" />
                            <span>{uev.time}</span>
                          </div>
                        )}
                      </div>

                      {/* Título del Evento */}
                      <h3 className="font-serif text-2xl md:text-3xl text-[var(--ivory)] font-medium leading-snug group-hover:text-[var(--gold-hi)] transition-colors">
                        {uev.title}
                      </h3>

                      {/* Descripción */}
                      {uev.description && (
                        <p className="text-xs md:text-sm text-[var(--ivory-dim)] leading-relaxed pt-1">
                          {uev.description}
                        </p>
                      )}
                    </div>

                    {/* Pie: Botón de Reserva por WhatsApp */}
                    <div className="pt-5 border-t border-[var(--line-soft)] flex items-center justify-end">
                      <a
                        href={`https://wa.me/5493584852932?text=${encodeURIComponent(
                          `Hola Subastas Insignia, deseo consultar y reservar mi lugar para el evento: "${uev.title}" (${uev.date}${uev.time ? ` a las ${uev.time}` : ''}).`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-gold text-xs py-2.5 px-5 rounded w-full sm:w-auto flex items-center justify-center gap-2 shadow"
                      >
                        <span>Reservar Asistencia</span>
                        <ArrowRight size={14} />
                      </a>
                    </div>
                  </AnimatedCard>
                ))}
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
