import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Search,
  ZoomIn,
  Gavel,
  X,
  Filter,
  Mail,
  Send,
} from 'lucide-react';
import { getLots, getDeadline, formatDeadlineText, apiSubmitBid } from '../lib/storage';
import Modal from '../components/Modal';
import Lightbox from '../components/Lightbox';
import PreofertaStepper from '../components/PreofertaStepper';

// Correo receptor provisional de Insignia para notificaciones de preofertas
// (Se actualizará con la dirección de correo definitiva)
const INSIGNIA_NOTIFICATION_EMAIL = 'insignia.obrasdearte@gmail.com';

function calculateDeadlineTimeLeft(deadlineStr) {
  const now = new Date();
  let target = deadlineStr ? new Date(deadlineStr) : null;
  if (!target || isNaN(target.getTime())) {
    target = new Date(now.getFullYear(), 11, 2, 0, 0, 0); // 2 de Diciembre a las 00:00 hs por defecto
  }
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isClosed: true };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds, isClosed: false };
}

export default function Subastas() {
  const [lots, setLots] = useState(() => getLots());
  const [deadline, setDeadline] = useState(() => getDeadline());
  const [timeLeft, setTimeLeft] = useState(() => calculateDeadlineTimeLeft(getDeadline()));
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [activePreofferLot, setActivePreofferLot] = useState(null);
  const [preofferSubmitted, setPreofferSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtist, setSelectedArtist] = useState('');

  // Registro de últimas preofertas por cada lote (persistidas en localStorage)
  const [preoffersByLot, setPreoffersByLot] = useState(() => {
    try {
      const saved = localStorage.getItem('insignia_preoffers_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Formulario de preoferta con datos completos de verificación
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dni: '',
    phone: '',
    bid: '',
  });

  useEffect(() => {
    document.title = 'Subastas & Catálogo Inaugural · Subastas Insignia';

    const handleDataChange = () => {
      setLots(getLots());
      const currentDl = getDeadline();
      setDeadline(currentDl);
      setTimeLeft(calculateDeadlineTimeLeft(currentDl));
      try {
        const saved = localStorage.getItem('insignia_preoffers_v1');
        if (saved) setPreoffersByLot(JSON.parse(saved));
      } catch {}
    };

    window.addEventListener('insignia-data-change', handleDataChange);

    const timer = setInterval(() => {
      setTimeLeft(calculateDeadlineTimeLeft(getDeadline()));
    }, 1000);

    return () => {
      window.removeEventListener('insignia-data-change', handleDataChange);
      clearInterval(timer);
    };
  }, []);

  // Slides para el Lightbox
  const lightboxSlides = useMemo(() => {
    return lots.map((lot) => ({
      src: lot.image,
      cap: `${lot.lote} · ${lot.title} — ${lot.artist} (${lot.technique}${
        lot.dimensions ? ` · ${lot.dimensions}` : ''
      }${lot.year ? ` · ${lot.year}` : ''}) · Base: ${lot.basePrice}`,
    }));
  }, [lots]);

  // Lista de artistas para el filtro
  const artists = useMemo(() => {
    return [...new Set(lots.map((l) => l.artist))].filter(Boolean).sort();
  }, [lots]);

  // Lotes filtrados por búsqueda y artista seleccionado
  const filteredLots = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return lots.filter((lot) => {
      const matchArtist = !selectedArtist || lot.artist === selectedArtist;
      const matchSearch =
        !q ||
        (lot.title && lot.title.toLowerCase().includes(q)) ||
        (lot.artist && lot.artist.toLowerCase().includes(q)) ||
        (lot.technique && lot.technique.toLowerCase().includes(q)) ||
        String(lot.id).includes(q) ||
        (lot.lote && lot.lote.toLowerCase().includes(q));
      return matchArtist && matchSearch;
    });
  }, [lots, searchQuery, selectedArtist]);

  // Abrir modal de preoferta (el campo de puja inicia vacío o superador)
  const handleOpenPreoffer = useCallback((lot) => {
    setActivePreofferLot(lot);
    setPreofferSubmitted(false);
    setSubmittedData(null);
    setFormData({
      name: '',
      email: '',
      dni: '',
      phone: '',
      bid: '',
    });
  }, []);

  const handleClosePreoffer = useCallback(() => {
    setActivePreofferLot(null);
    setPreofferSubmitted(false);
    setSubmittedData(null);
  }, []);

  // Enviar preoferta por Correo Electrónico a Insignia
  const handleSendPreoffer = (e) => {
    e.preventDefault();
    if (!activePreofferLot) return;

    const currentHighest = preoffersByLot[activePreofferLot.id]?.highestBid;
    const currentThreshold = currentHighest || activePreofferLot.priceValue;
    const bidNum = parseFloat(formData.bid);

    // Validación estricta: NO se permite ofertar el monto inicial ni un valor menor o igual
    if (!bidNum || bidNum <= currentThreshold) {
      alert(
        `El monto de la preoferta debe ser estrictamente mayor a $USD ${currentThreshold.toLocaleString()}.`
      );
      return;
    }

    const deposit30 = Math.round(bidNum * 0.3);

    const emailSubject = `Preoferta por Lote ${activePreofferLot.lote} — ${activePreofferLot.title} ($USD ${bidNum})`;
    const emailBody = `NOTIFICACIÓN DE PREOFERTA — INSIGNIA SUBASTAS
========================================
DATOS DEL LOTE Y OBRA:
• Lote: ${activePreofferLot.lote}
• Obra: ${activePreofferLot.title}
• Artista: ${activePreofferLot.artist}
• Técnica: ${activePreofferLot.technique}
${activePreofferLot.dimensions ? `• Medidas: ${activePreofferLot.dimensions}\n` : ''}${
      activePreofferLot.year ? `• Año: ${activePreofferLot.year}\n` : ''
    }• Precio Base: ${activePreofferLot.basePrice}
• Último pujante previo: ${currentHighest ? `$USD ${currentHighest}` : 'Sin pujas previas'}

DATOS DE LA NUEVA PREOFERTA:
• Nuevo monto ofertado: $USD ${bidNum}
• Seña requerida del 30%: $USD ${deposit30}

DATOS DEL POSTULANTE:
• Nombre completo: ${formData.name}
• Correo electrónico: ${formData.email}
• DNI / Documento: ${formData.dni}
• Teléfono de contacto: ${formData.phone}
========================================
Notificación generada desde el catálogo de Subastas Insignia.`;

    const summary = {
      lot: activePreofferLot,
      bid: bidNum,
      deposit: deposit30,
      name: formData.name,
      email: formData.email,
      dni: formData.dni,
      phone: formData.phone,
      emailSubject,
      emailBody,
    };

    // Actualizar registro completo de pujas y ofertantes para este lote
    const existingLotData = preoffersByLot[activePreofferLot.id] || {};
    const existingBidders = Array.isArray(existingLotData.bidders)
      ? existingLotData.bidders
      : existingLotData.bidderName
      ? [
          {
            name: existingLotData.bidderName,
            email: existingLotData.bidderEmail || '',
            dni: existingLotData.bidderDni || '',
            phone: existingLotData.bidderPhone || '',
            bid: existingLotData.highestBid,
            date: existingLotData.date || new Date().toISOString(),
          },
        ]
      : [];

    const newBidder = {
      name: formData.name,
      email: formData.email,
      dni: formData.dni,
      phone: formData.phone,
      bid: bidNum,
      deposit: deposit30,
      date: new Date().toISOString(),
    };

    const updated = {
      ...preoffersByLot,
      [activePreofferLot.id]: {
        highestBid: bidNum,
        bidderName: formData.name,
        bidderEmail: formData.email,
        bidderPhone: formData.phone,
        bidderDni: formData.dni,
        date: new Date().toISOString(),
        bidders: [newBidder, ...existingBidders],
      },
    };
    setPreoffersByLot(updated);
    try {
      localStorage.setItem('insignia_preoffers_v1', JSON.stringify(updated));
      window.dispatchEvent(new Event('insignia-data-change'));
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }

    setSubmittedData(summary);
    setPreofferSubmitted(true);

    // Enviar oferta al backend SQLite de forma transparente
    apiSubmitBid({
      lotId: activePreofferLot.id,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      dni: formData.dni,
      amount: bidNum,
    }).catch((err) => console.warn('[Preoferta] Error enviando al backend:', err));

    // Disparar cliente de correo predeterminado dirigido al mail de Insignia
    const mailtoUrl = `mailto:${INSIGNIA_NOTIFICATION_EMAIL}?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(emailBody)}`;

    try {
      const link = document.createElement('a');
      link.href = mailtoUrl;
      link.click();
    } catch (err) {
      console.warn('Mailto error:', err);
    }
  };

  return (
    <main className="min-h-screen">
      <section className="section spot-top" style={{ paddingTop: '110px', paddingBottom: '90px' }}>
        <div className="wrap">
          {/* CABECERA PRINCIPAL */}
          <div className="sec-head">
            <div>
              <p className="eyebrow">Catálogo & Preofertas</p>
              <h1 className="h2" style={{ fontSize: 'clamp(2.8rem, 6.2vw, 4.6rem)' }}>
                Subas<em>tas</em>
              </h1>
            </div>
          </div>

          {/* STEPPER ANIMADO DE PREOFERTAS */}
          <PreofertaStepper />

          {/* BANNER DE FECHA LÍMITE & CONTADOR REGRESIVO */}
          <div className="p-6 md:p-8 border-2 border-[var(--gold)]/40 bg-gradient-to-r from-[var(--ink-3)] via-[var(--ink-2)] to-[var(--ink-3)] rounded-lg my-10 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--gold)] text-white flex items-center justify-center shrink-0 shadow-md">
                <Clock size={22} />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-[var(--gold)] font-bold block mb-1">
                  Plazo Oficial de Preoferta
                </span>
                <h3 className="font-serif text-xl sm:text-2xl text-[var(--ivory)] font-medium leading-tight">
                  Cada ofertante tendrá tiempo de pujar hasta el{' '}
                  <span className="underline decoration-[var(--gold)] font-semibold text-[var(--gold-hi)]">
                    {formatDeadlineText(deadline)}
                  </span>
                </h3>
                <p className="text-xs sm:text-sm text-[var(--ivory-dim)] mt-1.5 max-w-2xl leading-relaxed">
                  Las preofertas registradas fijan la base de inicio del remate presencial. Asegurá tu postura antes del cierre del sistema.
                </p>
              </div>
            </div>

            {/* Contador regresivo en tiempo real */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 bg-[var(--ink-1)]/70 p-3 sm:p-4 rounded-lg border border-[var(--line-soft)] shadow-inner">
              <div className="text-center min-w-[48px]">
                <span className="font-mono text-xl sm:text-2xl font-bold text-[var(--ivory)] block">
                  {String(timeLeft.days).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[var(--ivory-dim)] font-medium">Días</span>
              </div>
              <span className="font-mono text-lg text-[var(--gold)] font-bold">:</span>
              <div className="text-center min-w-[48px]">
                <span className="font-mono text-xl sm:text-2xl font-bold text-[var(--ivory)] block">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[var(--ivory-dim)] font-medium">Horas</span>
              </div>
              <span className="font-mono text-lg text-[var(--gold)] font-bold">:</span>
              <div className="text-center min-w-[48px]">
                <span className="font-mono text-xl sm:text-2xl font-bold text-[var(--ivory)] block">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[var(--ivory-dim)] font-medium">Min</span>
              </div>
              <span className="font-mono text-lg text-[var(--gold)] font-bold">:</span>
              <div className="text-center min-w-[48px]">
                <span className="font-mono text-xl sm:text-2xl font-bold text-[var(--gold-hi)] block">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[var(--ivory-dim)] font-medium">Seg</span>
              </div>
            </div>
          </div>

          {/* CATÁLOGO DE LOTES DISPONIBLES · MODELO 3 EDITORIAL VERDE */}
          <div id="catalogo" className="mt-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 my-8">
              <div>
                <p className="eyebrow">Catálogo Oficial</p>
                <h2 className="h2" style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', marginTop: '4px' }}>
                  Lotes <em>disponibles</em>
                </h2>
              </div>

              {/* HERRAMIENTAS DE BÚSQUEDA Y FILTRADO */}
              <div className="m3-tools">
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64705a] pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar obra o artista…"
                    className="m3-input !pl-9"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ivory-dim)] hover:text-[var(--ivory)]"
                      title="Limpiar búsqueda"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <select
                  value={selectedArtist}
                  onChange={(e) => setSelectedArtist(e.target.value)}
                  className="m3-select"
                >
                  <option value="">Todos los artistas</option>
                  {artists.map((artist) => (
                    <option key={artist} value={artist}>
                      {artist}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* GRILLA DE LOTES MODELO 3 */}
            {filteredLots.length === 0 ? (
              <div className="p-12 text-center border border-[var(--line)] bg-[#4a4a42] my-8">
                <p className="text-[var(--ivory-dim)] text-sm mb-3">
                  No se encontraron obras o artistas para los filtros seleccionados.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedArtist('');
                  }}
                  className="text-xs uppercase tracking-wider text-[var(--ivory)] font-semibold underline underline-offset-4"
                >
                  Restablecer filtros
                </button>
              </div>
            ) : (
              <div className="m3-grid">
                {filteredLots.map((lot) => {
                  const globalIdx = lots.findIndex((l) => l.id === lot.id);
                  const lotNumberStr = String(lot.id).padStart(2, '0');
                  const highestBid = preoffersByLot[lot.id]?.highestBid;

                  return (
                    <article key={lot.id} className="m3-card group">
                      {/* CUADRO / MARCO EXHIBIDOR CON MARCA DE AGUA */}
                      <div className="m3-frame">
                        <span className="m3-no" aria-hidden="true">{lotNumberStr}</span>

                        <div
                          className="relative flex items-center justify-center w-full h-full cursor-pointer z-[2]"
                          onClick={() => setLightboxIndex(globalIdx)}
                          title="Ampliar obra en alta resolución"
                        >
                          <img
                            src={lot.image}
                            alt={`${lot.title} - ${lot.artist}`}
                            className="max-h-[290px] sm:max-h-[310px] max-w-[88%] w-auto object-contain transition-transform duration-500 group-hover:scale-105"
                            style={{ boxShadow: '0 12px 24px -10px rgba(0, 0, 0, 0.45)' }}
                            loading="lazy"
                          />
                        </div>

                        {/* Botón lupa sutil en esquina */}
                        <button
                          type="button"
                          onClick={() => setLightboxIndex(globalIdx)}
                          className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/90 hover:text-white text-[var(--ivory)] border border-white/20 transition-colors z-[3]"
                          title="Ampliar fotografía"
                          aria-label={`Ampliar imagen de ${lot.title}`}
                        >
                          <ZoomIn size={14} />
                        </button>
                      </div>

                      {/* INFORMACIÓN EDITORIAL DE LA OBRA */}
                      <div className="m3-info">
                        <div className="m3-top">
                          <span className="truncate pr-2 font-medium">{lot.artist}</span>
                          <span>{lot.year || ''}</span>
                        </div>

                        <h3 className="m3-title">
                          {lot.title}
                        </h3>

                        <dl className="m3-dl">
                          <dt>Técnica</dt>
                          <dd>{lot.technique}</dd>
                          {lot.dimensions && (
                            <>
                              <dt>Medidas</dt>
                              <dd>{lot.dimensions}</dd>
                            </>
                          )}
                          <dt>Lote</dt>
                          <dd>#{lotNumberStr}</dd>
                        </dl>

                        <div className="flex-1 min-h-[16px]"></div>

                        <div className="m3-price">
                          <span className="m3-lbl">Precio base</span>
                          <strong>{lot.basePrice}</strong>
                          <div className="m3-last">
                            Último pujante:{' '}
                            {highestBid ? (
                              <b className="text-[var(--ivory)] font-semibold not-italic">
                                $USD {highestBid.toLocaleString()}
                              </b>
                            ) : (
                              <i>sin pujas aún</i>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenPreoffer(lot)}
                          className="m3-btn"
                        >
                          <Gavel size={14} />
                          <span>Hacer preoferta</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* MODAL DE PREOFERTA */}
      {activePreofferLot && (() => {
        const currentHighest = preoffersByLot[activePreofferLot.id]?.highestBid;
        const currentThreshold = currentHighest || activePreofferLot.priceValue;
        const minAllowedBid = currentThreshold + 1;
        const enteredBid = parseFloat(formData.bid) || 0;
        const isBidValid = enteredBid > currentThreshold;

        return (
          <Modal
            label={`Preofertar por ${activePreofferLot.title}`}
            onClose={handleClosePreoffer}
            size="md"
          >
            <div className="p-6 md:p-8 bg-[var(--ink-2)] text-[var(--ivory)]">
              {/* ENCABEZADO DEL MODAL */}
              <div className="flex items-start gap-4 pb-5 border-b border-[var(--line-soft)]">
                <div className="w-20 h-20 shrink-0 border border-[var(--line-soft)] overflow-hidden bg-[var(--ink-4)]">
                  <img
                    src={activePreofferLot.image}
                    alt={activePreofferLot.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="inline-block px-2 py-0.5 text-[10px] font-mono font-semibold bg-[var(--ink-1)] text-[var(--gold-hi)] border border-[var(--line-soft)] uppercase tracking-wider mb-1">
                    {activePreofferLot.lote}
                  </span>
                  <h3 className="font-serif text-2xl text-[var(--ivory)] font-medium leading-tight truncate">
                    {activePreofferLot.title}
                  </h3>
                  <p className="text-xs text-[var(--ivory-dim)] font-mono uppercase tracking-wider mt-0.5">
                    {activePreofferLot.artist}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs font-mono">
                    <span className="text-[var(--ivory-dim)]">
                      Precio Base: <strong className="text-[var(--ivory)] font-sans">{activePreofferLot.basePrice}</strong>
                    </span>
                    <span className="text-[var(--gold)] font-medium">
                      Último pujante:{' '}
                      <strong className="text-[var(--gold-hi)]">
                        {currentHighest
                          ? `$USD ${currentHighest.toLocaleString()}`
                          : 'Sin pujas previas'}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {preofferSubmitted && submittedData ? (
                <div className="py-6 text-center">
                  <div className="w-14 h-14 mx-auto rounded-full bg-[var(--gold)] text-white flex items-center justify-center mb-4 shadow-lg">
                    <CheckCircle2 size={28} />
                  </div>
                  <h3 className="font-serif text-2xl text-[var(--ivory)] font-medium mb-2">
                    ¡Preoferta registrada con éxito!
                  </h3>
                  <p className="text-sm text-[var(--ivory-dim)] max-w-md mx-auto leading-relaxed mb-6">
                    Se ha generado la notificación formal para <strong className="text-[var(--ivory)]">Insignia Casa de Arte</strong> informando tu postura y datos de contacto.
                  </p>

                  <div className="p-4 bg-[var(--ink-1)]/60 border border-[var(--line-soft)] text-left text-xs space-y-2 mb-6 max-w-md mx-auto">
                    <div className="flex justify-between border-b border-[var(--line-soft)] pb-1.5">
                      <span className="text-[var(--ivory-dim)]">Lote:</span>
                      <strong className="text-[var(--ivory)]">{submittedData.lot.lote} — {submittedData.lot.title}</strong>
                    </div>
                    <div className="flex justify-between border-b border-[var(--line-soft)] pb-1.5">
                      <span className="text-[var(--ivory-dim)]">Monto ofertado:</span>
                      <strong className="text-[var(--gold-hi)] font-mono text-sm">$USD {submittedData.bid}</strong>
                    </div>
                    <div className="flex justify-between border-b border-[var(--line-soft)] pb-1.5">
                      <span className="text-[var(--ivory-dim)]">Seña del 30% (72h hábiles previas):</span>
                      <strong className="text-[var(--gold-hi)] font-mono text-sm">$USD {submittedData.deposit}</strong>
                    </div>
                    <div className="pt-1 text-[11px] text-[var(--ivory-dim)] leading-relaxed">
                      <strong className="text-[var(--ivory)]">Postulante:</strong> {submittedData.name} · {submittedData.email} · {submittedData.phone}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={`mailto:${INSIGNIA_NOTIFICATION_EMAIL}?subject=${encodeURIComponent(
                        submittedData.emailSubject
                      )}&body=${encodeURIComponent(submittedData.emailBody)}`}
                      className="btn-ghost !py-2.5 !px-5 text-xs gap-2 w-full sm:w-auto"
                    >
                      <Mail size={14} />
                      <span>Abrir en mi correo para reenviar</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleClosePreoffer}
                      className="btn-gold !py-2.5 !px-6 text-xs w-full sm:w-auto"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              ) : (
                /* FORMULARIO */
                <form onSubmit={handleSendPreoffer} className="mt-5 space-y-4">
                  {/* AVISO DE PLAZO LÍMITE */}
                  <div className="p-3 bg-[#4a4a42]/80 border border-[var(--gold)]/40 rounded flex items-center gap-2.5 text-xs text-[var(--ivory)]">
                    <Clock size={16} className="text-[var(--gold)] shrink-0" />
                    <span>
                      <strong>Plazo de recepción:</strong> Tenés tiempo de pujar hasta el{' '}
                      <strong className="text-[var(--gold-hi)] font-semibold">{formatDeadlineText(deadline)}</strong>.
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                      <label className="text-xs uppercase font-mono tracking-wider text-[var(--ivory)] font-medium">
                        Monto de tu preoferta ($USD) *
                      </label>
                      <span className="text-[11px] font-mono text-[var(--gold-hi)] font-semibold">
                        Mínimo requerido: $USD {minAllowedBid.toLocaleString()}
                      </span>
                    </div>

                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-mono text-[var(--ivory-dim)]">
                        $USD
                      </span>
                      <input
                        type="number"
                        required
                        min={minAllowedBid}
                        value={formData.bid}
                        onChange={(e) => setFormData({ ...formData, bid: e.target.value })}
                        className="w-full pl-16 pr-4 py-2.5 text-sm font-mono bg-[#3e3e37] border border-[var(--line)] focus:border-white text-[var(--ivory)] placeholder:text-[var(--ivory-dim)]/50 outline-none transition-colors"
                        placeholder={`Mayor a ${currentThreshold} (mínimo ${minAllowedBid})`}
                      />
                    </div>

                    {/* ALERTA DE VALIDACIÓN SI ES MENOR O IGUAL AL MONTO INICIAL O ÚLTIMA PUJA */}
                    {formData.bid && !isBidValid && (
                      <p className="mt-1.5 text-xs text-red-900 bg-red-100/90 p-2 border border-red-300 font-medium flex items-center gap-1.5">
                        <AlertCircle size={14} className="shrink-0 text-red-700" />
                        <span>
                          El monto debe ser estrictamente mayor a <strong>$USD {currentThreshold.toLocaleString()}</strong> (mínimo <strong>$USD {minAllowedBid.toLocaleString()}</strong>).
                        </span>
                      </p>
                    )}

                    {/* CÁLCULO DE SEÑA DEL 30% */}
                    <div className="mt-2 p-2.5 bg-[#4a4a42]/70 border border-[var(--line-soft)] flex items-center justify-between text-xs">
                      <span className="text-[var(--ivory-dim)]">
                        Seña requerida del 30%:
                      </span>
                      <strong className="font-mono text-sm text-[var(--gold-hi)]">
                        $USD {Math.round((enteredBid || minAllowedBid) * 0.3).toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-mono tracking-wider text-[var(--ivory)] font-medium mb-1.5">
                      Nombre y Apellido completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Tu nombre y apellido completo"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#3e3e37] border border-[var(--line)] focus:border-white text-[var(--ivory)] placeholder:text-[var(--ivory-dim)]/50 outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs uppercase font-mono tracking-wider text-[var(--ivory)] font-medium mb-1.5">
                        Correo electrónico *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="tu@correo.com"
                        className="w-full px-3.5 py-2.5 text-sm bg-[#3e3e37] border border-[var(--line)] focus:border-white text-[var(--ivory)] placeholder:text-[var(--ivory-dim)]/50 outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-mono tracking-wider text-[var(--ivory)] font-medium mb-1.5">
                        DNI / Documento *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.dni}
                        onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                        placeholder="Número de DNI"
                        className="w-full px-3.5 py-2.5 text-sm bg-[#3e3e37] border border-[var(--line)] focus:border-white text-[var(--ivory)] placeholder:text-[var(--ivory-dim)]/50 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-mono tracking-wider text-[var(--ivory)] font-medium mb-1.5">
                      Teléfono de contacto / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+54 ..."
                      className="w-full px-3.5 py-2.5 text-sm bg-[#3e3e37] border border-[var(--line)] focus:border-white text-[var(--ivory)] placeholder:text-[var(--ivory-dim)]/50 outline-none transition-colors"
                    />
                  </div>

                  <div className="p-3 bg-[#4a4a42]/50 border border-[var(--gold)]/20 text-[11px] text-[var(--ivory-dim)] leading-relaxed">
                    Al confirmar tu preoferta se notificará a <strong className="text-[var(--ivory)]">Insignia</strong> por correo electrónico con tus datos de contacto y el valor postulado para su registro oficial.
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleClosePreoffer}
                      className="px-4 py-2.5 text-xs font-sans uppercase tracking-wider text-[var(--ivory-dim)] hover:text-[var(--ivory)]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={!formData.bid || !isBidValid}
                      className="btn-gold !py-2.5 !px-5 text-xs gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Mail size={14} />
                      <span>Enviar preoferta</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </Modal>
        );
      })()}

      {/* VISOR LIGHTBOX PARA AMPLIAR CUALQUIER OBRA */}
      {lightboxIndex !== null && (
        <Lightbox
          items={lightboxSlides}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onGo={setLightboxIndex}
        />
      )}
    </main>
  );
}
