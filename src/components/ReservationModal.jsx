import React, { useState, useEffect } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { apiSubmitReservation } from '../lib/storage';

const WHATSAPP = '5493584852932';

export default function ReservationModal({ event, onClose }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', guests: '1', notes: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | done
  const [error, setError] = useState('');

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('sending');
    const res = await apiSubmitReservation({
      eventId: event.id || '',
      eventTitle: event.title,
      eventDate: `${event.date}${event.time ? ` · ${event.time}` : ''}`,
      ...form,
    });
    if (res.success) {
      setStatus('done');
    } else {
      setStatus('idle');
      setError(res.error || 'No se pudo enviar la solicitud. Intentá de nuevo.');
    }
  };

  const waText = `Hola Subastas Insignia, acabo de solicitar mi reserva para el evento: "${event.title}" (${event.date}${event.time ? ` a las ${event.time}` : ''}). Mi nombre es ${form.name}.`;

  const field =
    'w-full px-3.5 py-2.5 text-sm bg-[#3e3e37] border border-[var(--line)] focus:border-white text-[var(--ivory)] outline-none transition-colors';
  const label = 'block text-xs uppercase tracking-wider text-[var(--ivory)] mb-1.5';

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
      role="presentation"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reserva-title"
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-[var(--ink-3)] border border-[var(--line)] p-6 sm:p-8 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 text-[var(--ivory-dim)] hover:text-white"
        >
          <X size={20} />
        </button>

        {status === 'done' ? (
          <div className="text-center py-6">
            <CheckCircle2 className="mx-auto mb-4 text-[var(--gold)]" size={44} strokeWidth={1.4} />
            <h3 id="reserva-title" className="text-2xl text-[var(--ivory)] mb-3">
              Solicitud enviada
            </h3>
            <p className="text-sm text-[var(--ivory-dim)] leading-relaxed mb-6">
              Recibimos tu solicitud de reserva. Nos pondremos en contacto para confirmar tu lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                className="btn-gold"
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(waText)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Avisar por WhatsApp
              </a>
              <button type="button" className="btn-ghost" onClick={onClose}>
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="pr-8">
              <p className="eyebrow">Reservar asistencia</p>
              <h3 id="reserva-title" className="text-xl sm:text-2xl text-[var(--ivory)] leading-snug">
                {event.title}
              </h3>
              <p className="text-sm text-[var(--ivory-dim)] mt-1">
                {event.date}
                {event.time ? ` · ${event.time}` : ''}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-950/80 border border-red-500/50 text-red-200 text-xs">{error}</div>
            )}

            <div>
              <label className={label}>Nombre y apellido *</label>
              <input className={field} required value={form.name} onChange={set('name')} maxLength={100} autoFocus />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={label}>Teléfono *</label>
                <input className={field} type="tel" required value={form.phone} onChange={set('phone')} maxLength={50} />
              </div>
              <div>
                <label className={label}>Cantidad de personas</label>
                <input className={field} type="number" min="1" max="20" value={form.guests} onChange={set('guests')} />
              </div>
            </div>
            <div>
              <label className={label}>Correo electrónico</label>
              <input className={field} type="email" value={form.email} onChange={set('email')} maxLength={120} />
            </div>
            <div>
              <label className={label}>Comentarios (opcional)</label>
              <textarea className={`${field} resize-y`} rows={3} value={form.notes} onChange={set('notes')} maxLength={500} />
            </div>

            <button type="submit" className="btn-gold btn-block" disabled={status === 'sending'}>
              {status === 'sending' ? 'Enviando…' : 'Enviar solicitud'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
