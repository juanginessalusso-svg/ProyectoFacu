import React, { useEffect, useState, useRef } from 'react';
import { Phone, Mail } from 'lucide-react';
import { IMAGES } from '../data/content';

function AnimatedBlock({ children, direction = 'left', delay = '0s', className = '' }) {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
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

  let animClass = 'opacity-0';
  if (inView) {
    if (direction === 'left') animClass = 'gallery-slide-left';
    else if (direction === 'right') animClass = 'gallery-slide-right';
    else if (direction === 'center') animClass = 'gallery-slide-center';
  }

  return (
    <div
      ref={ref}
      className={`${className} ${animClass}`}
      style={{ animationDelay: inView ? delay : undefined }}
    >
      {children}
    </div>
  );
}

export default function Nosotros() {
  useEffect(() => {
    document.title = 'Sobre Nosotros · Misión, Visión & Patrimonio | Subastas Insignia';
  }, []);

  return (
    <main className="min-h-screen">
      <section className="section spot-top overflow-hidden" style={{ paddingTop: '110px', paddingBottom: '90px' }}>
        <div className="wrap">
          {/* CABECERA */}
          <div className="sec-head">
            <div>
              <h1 className="h2" style={{ fontSize: 'clamp(2.8rem, 6.2vw, 4.6rem)' }}>
                Noso<em>tros</em>
              </h1>
            </div>
          </div>

          {/* BLOQUE 1: MISIÓN (Entra por la izquierda) + FOTOGRAFÍA 1 (Entra por la derecha) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 my-8 items-stretch">
            {/* MISIÓN */}
            <AnimatedBlock direction="left" delay="0s" className="lg:col-span-7 flex flex-col order-2 lg:order-1">
              <article className="h-full p-8 md:p-10 border border-[var(--line-soft)] bg-gradient-to-b from-[var(--ink-3)] to-[var(--ink-2)] transition-all duration-300 hover:border-[var(--line)] flex flex-col justify-between">
                <div>
                  <h2 className="font-serif text-3xl md:text-4xl text-[var(--ivory)] font-light mb-5 tracking-wide">
                    Nuestra <em>Misión</em>
                  </h2>
                  <p className="text-[var(--ivory-dim)] text-lg md:text-[1.15rem] leading-relaxed">
                    <strong className="text-[var(--ivory)] font-medium">Insignia</strong> surge con el
                    fin de generar un mercado definido, el del arte y las antigüedades, brindándole al
                    cliente vendedor un medio seguro y confiable para ofrecer sus productos. Para el
                    cliente comprador, brinda un espacio mediante el cual pueda adquirir obras de valor
                    con autenticidad y una forma de inversión que contribuye al fomento cultural.
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-[var(--line-soft)] flex items-center gap-3 font-serif text-base md:text-lg text-[var(--gold)] tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" />
                  Seguridad · Confianza · Autenticidad
                </div>
              </article>
            </AnimatedBlock>

            {/* FOTOGRAFÍA 1 (Misión) */}
            <AnimatedBlock direction="right" delay="0.1s" className="lg:col-span-5 flex flex-col order-1 lg:order-2">
              <div className="shot h-full min-h-[300px] lg:min-h-[380px]">
                <img
                  src={IMAGES.nosotrosMision}
                  alt="Subastas Insignia - Catálogo y presentación institucional"
                  loading="lazy"
                />
                <span className="stage-vig" aria-hidden="true" />
              </div>
            </AnimatedBlock>
          </div>

          {/* BLOQUE 2: FOTOGRAFÍA 2 (Entra por la izquierda) + VISIÓN (Entra por la derecha) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 my-8 items-stretch">
            {/* FOTOGRAFÍA 2 (Visión) */}
            <AnimatedBlock direction="left" delay="0s" className="lg:col-span-5 flex flex-col order-1 lg:order-1">
              <div className="shot h-full min-h-[300px] lg:min-h-[380px]">
                <img
                  src={IMAGES.nosotrosVision}
                  alt="Subastas Insignia - Dirección y análisis de obras"
                  loading="lazy"
                />
                <span className="stage-vig" aria-hidden="true" />
              </div>
            </AnimatedBlock>

            {/* VISIÓN */}
            <AnimatedBlock direction="right" delay="0.1s" className="lg:col-span-7 flex flex-col order-2 lg:order-2">
              <article className="h-full p-8 md:p-10 border border-[var(--line-soft)] bg-gradient-to-b from-[var(--ink-3)] to-[var(--ink-2)] transition-all duration-300 hover:border-[var(--line)] flex flex-col justify-between">
                <div>
                  <h2 className="font-serif text-3xl md:text-4xl text-[var(--ivory)] font-light mb-5 tracking-wide">
                    Nuestra <em>Visión</em>
                  </h2>
                  <p className="text-[var(--ivory-dim)] text-lg md:text-[1.15rem] leading-relaxed">
                    <strong className="text-[var(--ivory)] font-medium">Insignia</strong> tiene como
                    objetivo lograr ser una empresa bien posicionada a nivel nacional e internacional
                    en el ámbito de las subastas de arte y antigüedades, posicionando a la marca como
                    un referente del mercado de obras de arte y bienes antiguos, promoviendo la cultura
                    en la sociedad.
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-[var(--line-soft)] flex items-center gap-3 font-serif text-base md:text-lg text-[var(--gold)] tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" />
                  Referencia nacional · Difusión cultural
                </div>
              </article>
            </AnimatedBlock>
          </div>

          {/* COMUNICACIÓN Y ATENCIÓN DIRECTA */}
          <AnimatedBlock direction="center" delay="0.1s">
            <div className="mt-16 p-8 md:p-12 border border-[var(--line-soft)] bg-gradient-to-b from-[var(--ink-3)] to-[var(--ink-2)] text-center relative overflow-hidden">
              <h3 className="font-serif text-2xl md:text-3xl text-[var(--ivory)] font-light mb-3">
                Atención directa y <em>consultas</em>
              </h3>
              <p className="text-[var(--ivory-dim)] text-sm max-w-md mx-auto mb-8 font-light leading-relaxed">
                Para consultas sobre obras en exhibición, tasaciones o visitas a nuestra sala de arte.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                <a
                  href="https://wa.me/543584290929"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-6 py-3.5 border border-[var(--line-soft)] hover:border-[var(--gold)] bg-[var(--ink-1)] text-[var(--ivory)] hover:text-[var(--gold-hi)] transition-all group w-full sm:w-auto justify-center"
                >
                  <Phone size={17} className="text-[var(--gold)] group-hover:scale-110 transition-transform" />
                  <span className="font-serif text-base tracking-wide">+54 358 429 0929</span>
                  <span className="text-[var(--gold)] text-xs ml-1">↗</span>
                </a>

                <a
                  href="mailto:insignia.obrasdearte@gmail.com"
                  className="inline-flex items-center gap-3 px-6 py-3.5 border border-[var(--line-soft)] hover:border-[var(--gold)] bg-[var(--ink-1)] text-[var(--ivory)] hover:text-[var(--gold-hi)] transition-all group w-full sm:w-auto justify-center"
                >
                  <Mail size={17} className="text-[var(--gold)] group-hover:scale-110 transition-transform" />
                  <span className="font-serif text-base tracking-wide">insignia.obrasdearte@gmail.com</span>
                  <span className="text-[var(--gold)] text-xs ml-1">↗</span>
                </a>
              </div>
            </div>
          </AnimatedBlock>
        </div>
      </section>
    </main>
  );
}
