import React, { useState, useEffect, useMemo } from 'react';
import { CalendarCheck, Trash2, Download, RefreshCw } from 'lucide-react';
import { apiGetReservations, apiDeleteReservation } from '../../lib/storage';

const fmtDate = (iso) => {
  try {
    return new Date(iso).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
  } catch (e) {
    return iso || '';
  }
};

export default function AdminReservas({ onNotify }) {
  const [items, setItems] = useState(null); // null = cargando
  const [failed, setFailed] = useState(false);
  const [eventFilter, setEventFilter] = useState('all');

  const load = async () => {
    setItems(null);
    const data = await apiGetReservations();
    if (data === null) {
      setFailed(true);
      setItems([]);
    } else {
      setFailed(false);
      setItems(data);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const events = useMemo(() => {
    const set = new Map();
    (items || []).forEach((r) => set.set(r.event_title, r.event_date));
    return Array.from(set.entries());
  }, [items]);

  const visible = (items || []).filter((r) => eventFilter === 'all' || r.event_title === eventFilter);
  const totalGuests = visible.reduce((acc, r) => acc + (r.guests || 1), 0);

  const handleDelete = async (r) => {
    if (!window.confirm(`¿Eliminar la solicitud de "${r.name}"?`)) return;
    const ok = await apiDeleteReservation(r.id);
    if (ok) {
      setItems((prev) => prev.filter((x) => x.id !== r.id));
      onNotify('Solicitud eliminada');
    } else {
      alert('No se pudo eliminar la solicitud.');
    }
  };

  const exportCsv = () => {
    if (!visible.length) return;
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const head = ['Fecha de solicitud', 'Evento', 'Fecha del evento', 'Nombre', 'Teléfono', 'Correo', 'Personas', 'Comentarios'];
    const rows = visible.map((r) =>
      [fmtDate(r.created_at), r.event_title, r.event_date, r.name, r.phone, r.email, r.guests, r.notes].map(esc).join(',')
    );
    const blob = new Blob(['﻿' + [head.map(esc).join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `reservas-insignia-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-white/10 text-white">
            <CalendarCheck size={20} />
          </div>
          <div>
            <h2 className="text-xl text-[var(--ivory)]">Reservas de asistencia</h2>
            <p className="text-xs text-[var(--ivory-dim)]">
              Solicitudes de quienes quieren asistir a los eventos.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={load} className="btn-ghost !min-h-[38px] !py-2 !px-3 !text-[11px]">
            <RefreshCw size={14} /> Actualizar
          </button>
          <button
            type="button"
            onClick={exportCsv}
            disabled={!visible.length}
            className="btn-ghost !min-h-[38px] !py-2 !px-3 !text-[11px]"
          >
            <Download size={14} /> Exportar CSV
          </button>
        </div>
      </div>

      {failed && (
        <div className="p-3 bg-red-950/80 border border-red-500/50 text-red-200 text-xs">
          No se pudieron cargar las reservas. Verificá tu sesión e intentá de nuevo.
        </div>
      )}

      {events.length > 1 && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[var(--ivory-dim)]">Evento:</span>
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="bg-[var(--ink-2)]/60 border border-[var(--line-soft)] rounded p-2 text-xs text-[var(--ivory)]"
          >
            <option value="all">Todos</option>
            {events.map(([title]) => (
              <option key={title} value={title}>
                {title}
              </option>
            ))}
          </select>
        </div>
      )}

      {items === null ? (
        <p className="text-sm text-[var(--ivory-dim)]">Cargando reservas…</p>
      ) : visible.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-[var(--line)] rounded-lg text-sm text-[var(--ivory-dim)]">
          Todavía no hay solicitudes de reserva.
        </div>
      ) : (
        <>
          <p className="text-xs text-[var(--ivory-dim)]">
            {visible.length} {visible.length === 1 ? 'solicitud' : 'solicitudes'} · {totalGuests}{' '}
            {totalGuests === 1 ? 'persona' : 'personas'} en total
          </p>
          <div className="border border-[var(--line-soft)] rounded-lg overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[var(--ink-2)] border-b border-[var(--line-soft)] text-[var(--gold)] uppercase tracking-wider text-[11px]">
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Evento</th>
                  <th className="p-3">Nombre</th>
                  <th className="p-3">Contacto</th>
                  <th className="p-3">Personas</th>
                  <th className="p-3">Comentarios</th>
                  <th className="p-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line-soft)]">
                {visible.map((r) => (
                  <tr key={r.id} className="align-top hover:bg-[var(--ink-2)]/50">
                    <td className="p-3 whitespace-nowrap text-[var(--ivory-dim)]">{fmtDate(r.created_at)}</td>
                    <td className="p-3 min-w-[160px]">
                      <div className="text-[var(--ivory)]">{r.event_title}</div>
                      <div className="text-[var(--ivory-dim)]">{r.event_date}</div>
                    </td>
                    <td className="p-3 text-[var(--ivory)]">{r.name}</td>
                    <td className="p-3 space-y-1">
                      <a className="block hover:underline text-[var(--gold-hi)]" href={`tel:${r.phone}`}>
                        {r.phone}
                      </a>
                      {r.email && (
                        <a className="block hover:underline text-[var(--ivory-dim)] break-all" href={`mailto:${r.email}`}>
                          {r.email}
                        </a>
                      )}
                    </td>
                    <td className="p-3 text-center">{r.guests}</td>
                    <td className="p-3 min-w-[160px] text-[var(--ivory-dim)]">{r.notes || '—'}</td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDelete(r)}
                        title="Eliminar solicitud"
                        className="p-2 rounded text-[var(--ivory-dim)] hover:text-red-400 hover:bg-red-950/40"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
