import React, { useState, useEffect } from 'react';
import {
  Palette,
  MousePointerClick,
  UserCheck,
  TrendingUp,
  Clock,
  FileCheck,
  Phone,
  Check,
} from 'lucide-react';
import { getDeadline, formatDeadlineText } from '../lib/storage';

const BASE_STEPPER_STEPS = [
  {
    label: 'Elegir obra',
    title: 'Seleccioná la obra',
    description:
      'Explorá el catálogo de lotes disponibles abajo y elegí la obra de arte o escultura que más te guste.',
    icon: Palette,
  },
  {
    label: 'Preoferta',
    title: 'Hacé tu preoferta',
    description:
      'En la ficha del lote, tocá el botón "Hacer preoferta" para abrir la ventana de postulación.',
    icon: MousePointerClick,
  },
  {
    label: 'Tus datos',
    title: 'Completá tus datos',
    description:
      'Para garantizar la seriedad y transparencia de la subasta, te vamos a pedir tus datos de contacto.',
    icon: UserCheck,
    tags: ['Nombre completo', 'DNI', 'Teléfono', 'E-mail'],
  },
  {
    label: 'Monto',
    title: 'Ofertá un monto mayor a la base',
    description:
      'Ingresá un monto igual o superior al precio base o a la última preoferta, y quedás como titular.',
    icon: TrendingUp,
  },
  {
    label: 'Seña',
    title: 'Abonás el 30% de seña',
    description:
      'Si sos el adjudicado provisorio al cierre, abonás el 30% del total de tu preoferta como seña.',
    icon: Clock,
    highlight: 'Plazo: 72 horas hábiles previas al día del remate oficial.',
    notes: [
      'La seña no se devuelve una vez enviada, aunque el cliente tenga un problema o no pueda concretar la compra.',
      'El envío corre por cuenta del comprador.',
    ],
  },
  {
    label: 'Comprobante',
    title: 'Enviá el comprobante',
    description:
      'Una vez transferida la seña, mandá el comprobante por WhatsApp a la línea oficial con estos datos:',
    icon: FileCheck,
    tags: ['Nombre de la obra', 'Autor', 'Lote'],
  },
];

const WHATSAPP_URL =
  'https://wa.me/543584290929?text=Hola%20Insignia%20Subastas,%20env%C3%ADo%20el%20comprobante%20de%20mi%20preoferta:';

export default function PreofertaStepper() {
  const [currentStep, setCurrentStep] = useState(0);
  const [deadlineText, setDeadlineText] = useState(() => formatDeadlineText(getDeadline()));

  useEffect(() => {
    const handleDataChange = () => {
      setDeadlineText(formatDeadlineText(getDeadline()));
    };
    window.addEventListener('insignia-data-change', handleDataChange);
    return () => window.removeEventListener('insignia-data-change', handleDataChange);
  }, []);

  const steps = BASE_STEPPER_STEPS.map((s, idx) => {
    if (idx === 1) {
      return {
        ...s,
        highlight: `Plazo límite: hasta el ${deadlineText}.`,
      };
    }
    return s;
  });

  const stepData = steps[currentStep] || steps[0];
  const StepIcon = stepData.icon;
  const progressPct = Math.round((currentStep / 5) * 100);

  return (
    <section className="mt-8 mb-16 preoferta-stepper" aria-label="Cómo funciona el sistema de preoferta">
      {/* Título de la sección */}
      <div className="max-w-3xl">
        <h2 className="font-serif text-3xl sm:text-4xl md:text-[52px] font-medium leading-[1.1] text-[var(--ivory)]">
          ¿Cómo funciona el sistema de <em>preoferta</em>?
        </h2>
        <p className="mt-4 md:mt-4.5 text-lg md:text-[20px] leading-relaxed md:leading-[1.6] text-[var(--ivory-dim)]">
          Seguí estos pasos para postular tu oferta antes del remate en sala, con total transparencia y el respaldo de{' '}
          <strong className="font-semibold text-[var(--ivory)]">Insignia Casa de Arte</strong>.
        </p>
      </div>

      {/* Barra de progreso */}
      <div className="relative mt-10 md:mt-12">
        {/* Línea de fondo */}
        <div
          className="absolute left-[8.333%] right-[8.333%] top-[21px] h-[3px] bg-white/15 rounded-[2px]"
          aria-hidden="true"
        >
          <div
            className="h-full bg-[#e2d7c0] rounded-[2px] transition-[width] duration-600 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Nodos interactivos */}
        <div className="relative grid grid-cols-6 z-10">
          {steps.map((s, idx) => {
            const isDone = idx < currentStep;
            const isAct = idx === currentStep;

            return (
              <button
                key={s.label}
                type="button"
                onClick={() => setCurrentStep(idx)}
                aria-current={isAct ? 'step' : 'false'}
                aria-label={`Paso: ${s.label}`}
                className="flex flex-col items-center gap-3 p-0 m-0 border-0 bg-transparent cursor-pointer font-inherit text-inherit group focus-visible:outline-2 focus-visible:outline-[#e2d7c0] focus-visible:outline-offset-2"
              >
                <span
                  className={`flex items-center justify-center w-11 h-11 rounded-full border-2 border-white/20 text-[17px] font-semibold transition-all duration-350 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
                    isAct
                      ? 'bg-[#0b0b0b] text-[#efece0] scale-115 border-white/40 ring-2 ring-white/20'
                      : isDone
                      ? 'bg-[#2a2a24] text-[#efece0] scale-100'
                      : 'bg-[#4a4a42] text-white/60 scale-100'
                  }`}
                  style={{
                    animation: isAct ? 'dcPulse 1.8s ease-out infinite' : 'none',
                  }}
                >
                  {isDone ? '✓' : <s.icon className="w-[18px] h-[18px]" strokeWidth={1.6} />}
                </span>
                <span
                  className={`dc-lbl text-sm tracking-[0.06em] transition-colors duration-300 ${
                    isAct ? 'font-bold text-white' : 'font-medium text-[var(--ivory-dim)]'
                  }`}
                >
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tarjeta grande del paso activo con altura mínima fija */}
      <div className="mt-9 min-h-[380px] bg-[#4a4a42] border border-[var(--line)] p-6 sm:p-10 md:p-12 lg:p-[48px_56px] flex items-center overflow-hidden shadow-2xl">
        <div
          key={currentStep}
          className="w-full flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-14 lg:gap-16"
        >
          {/* Ícono */}
          <div className="shrink-0 flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-4.5 w-full md:w-[120px]">
            <span
              className="w-14 h-14 md:w-[72px] md:h-[72px] rounded-full border-[1.5px] border-white/20 flex items-center justify-center text-[var(--ivory)] shrink-0 bg-white/5"
              style={{ animation: 'dcPop .6s .12s cubic-bezier(.2,.8,.2,1) both' }}
            >
              <StepIcon className="w-7 h-7 md:w-[34px] md:h-[34px]" strokeWidth={1.6} />
            </span>
          </div>

          {/* Textos y Etiquetas */}
          <div
            className="flex-1 min-w-0"
            style={{ animation: 'dcUp .55s .08s cubic-bezier(.2,.8,.2,1) both' }}
          >
            <h3 className="font-serif font-medium text-3xl sm:text-4xl md:text-[52px] leading-[1.08] text-[var(--ivory)] m-0">
              {stepData.title}
            </h3>

            <p className="mt-4 md:mt-5 max-w-[640px] text-lg sm:text-xl md:text-[22px] leading-relaxed md:leading-[1.55] text-[var(--ivory-dim)]">
              {stepData.description}
            </p>

            {/* Plazos destacados */}
            {stepData.highlight && (
              <div
                className="mt-6 md:mt-7 inline-flex items-center gap-3 border-[1.5px] border-white/20 bg-white/10 px-4 py-3 md:px-5.5 md:py-3.5 text-base sm:text-lg font-semibold text-[var(--ivory)]"
                style={{ animation: 'dcSlide .5s .3s cubic-bezier(.2,.8,.2,1) both' }}
              >
                <Clock className="w-5 h-5 md:w-[22px] md:h-[22px] text-[var(--gold)] shrink-0" strokeWidth={1.8} />
                <span>{stepData.highlight}</span>
              </div>
            )}

            {/* Aclaraciones importantes */}
            {stepData.notes && (
              <ul className="mt-6 md:mt-7 space-y-3 max-w-[640px] list-none p-0">
                {stepData.notes.map((note) => (
                  <li
                    key={note}
                    className="border-l-2 border-[var(--gold)] pl-4 text-base sm:text-lg leading-relaxed text-[var(--ivory)]"
                  >
                    {note}
                  </li>
                ))}
              </ul>
            )}

            {/* Etiquetas */}
            {stepData.tags && (
              <div className="mt-6 md:mt-7 flex flex-wrap gap-2.5 sm:gap-3">
                {stepData.tags.map((tag, idx) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2.5 border-[1.5px] border-white/20 bg-white/10 px-3.5 py-2.5 md:px-5 md:py-3 text-base sm:text-lg font-semibold text-[var(--ivory)]"
                    style={{
                      animation: `dcSlide .45s ${0.25 + idx * 0.1}s cubic-bezier(.2,.8,.2,1) both`,
                    }}
                  >
                    <Check className="w-4 h-4 md:w-5 md:h-5 text-[var(--gold)] shrink-0" strokeWidth={2.2} />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controles de navegación y estado */}
      <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-5">
        <p className="font-mono text-sm tracking-[0.14em] text-[var(--ivory-dim)] m-0 text-center sm:text-left">
          {stepData.label}
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            aria-label="Paso anterior"
            className={`flex items-center justify-center gap-2.5 h-14 px-7 border-[1.5px] border-white/20 bg-transparent text-[var(--ivory)] font-inherit text-sm font-semibold tracking-[0.16em] uppercase cursor-pointer transition-opacity duration-300 ${
              currentStep === 0 ? 'opacity-35 cursor-not-allowed' : 'opacity-100 hover:bg-white/10'
            }`}
          >
            ← Anterior
          </button>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
              className="flex items-center justify-center gap-2.5 h-14 px-8 border-[1.5px] border-white/20 bg-[#252520] hover:bg-[#151512] text-[#efece0] font-inherit text-sm font-semibold tracking-[0.16em] uppercase cursor-pointer transition-colors"
            >
              Siguiente paso →
            </button>
          ) : (
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 h-14 px-6 sm:px-8 bg-[#252520] hover:bg-[#151512] text-[#efece0] text-sm font-semibold tracking-[0.16em] uppercase transition-colors"
              style={{ animation: 'dcPulse 2s ease-out infinite' }}
            >
              <Phone size={18} strokeWidth={1.8} />
              <span>WhatsApp: +54 358 429 0929 →</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
