import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Upload,
  X,
  MapPin,
  Clock,
  Sparkles,
  Star,
  Check,
  Loader2,
  CalendarDays,
  Camera
} from 'lucide-react';
import { getEvents, saveEvents, apiUploadImage } from '../../lib/storage';

export default function AdminEventos({ onNotify }) {
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null); // null, 'new-upcoming', 'new-past', o objeto
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    date: '',
    time: '19:30 hs',
    location: 'Galería Alberdi 355 · Río Cuarto',
    category: 'Subasta Presencial',
    status: 'Próximo', // 'Próximo' | 'Realizado'
    isUpcoming: true,
    description: '',
    image: '',
    images: [],
  });

  const [newUrlInput, setNewUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    loadData();
    const handleDataChange = () => loadData();
    window.addEventListener('insignia-data-change', handleDataChange);
    return () => window.removeEventListener('insignia-data-change', handleDataChange);
  }, []);

  const loadData = () => {
    setEvents(getEvents());
  };

  // Separar en Próximos y Realizados
  const upcomingEvents = useMemo(() => {
    return events.filter((e) => e.isUpcoming || e.status === 'Próximo');
  }, [events]);

  const pastEvents = useMemo(() => {
    return events.filter((e) => !e.isUpcoming && e.status !== 'Próximo');
  }, [events]);

  // Abrir nuevo Próximo Evento
  const handleOpenNewUpcoming = () => {
    setFormData({
      id: `ev-${Date.now()}`,
      title: '',
      date: '',
      time: '19:30 hs',
      location: 'Galería Alberdi 355 · Río Cuarto',
      category: 'Subasta Presencial',
      status: 'Próximo',
      isUpcoming: true,
      description: '',
      image: '/img/subasta-evento.jpg',
      images: ['/img/subasta-evento.jpg'],
    });
    setNewUrlInput('');
    setEditingEvent('new-upcoming');
  };

  // Abrir nuevo Evento Realizado (con fotos)
  const handleOpenNewPast = () => {
    setFormData({
      id: `ev-${Date.now()}`,
      title: '',
      date: '',
      time: '',
      location: 'Galería Alberdi 355 · Río Cuarto',
      category: 'Exposición',
      status: 'Realizado',
      isUpcoming: false,
      description: '',
      image: '',
      images: [],
    });
    setNewUrlInput('');
    setEditingEvent('new-past');
  };

  const handleOpenEdit = (ev) => {
    const imagesList = Array.isArray(ev.images) && ev.images.length > 0
      ? [...ev.images]
      : (ev.image ? [ev.image] : []);

    const isUpcoming = ev.isUpcoming !== undefined
      ? ev.isUpcoming
      : (ev.status === 'Próximo');

    setFormData({
      id: ev.id,
      title: ev.title || '',
      date: ev.date || '',
      time: ev.time || '',
      location: ev.location || 'Galería Alberdi 355 · Río Cuarto',
      category: ev.category || 'Subasta Presencial',
      status: ev.status || (isUpcoming ? 'Próximo' : 'Realizado'),
      isUpcoming: isUpcoming,
      description: ev.description || '',
      image: ev.image || imagesList[0] || '',
      images: imagesList,
    });
    setNewUrlInput('');
    setEditingEvent(ev);
  };

  // Subir múltiples imágenes
  const handleMultipleFilesChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    const newUploaded = [];

    try {
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(`Subiendo imagen ${i + 1} de ${files.length}...`);
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        const url = await apiUploadImage(file);
        if (url) newUploaded.push(url);
      }

      setFormData((prev) => {
        const combined = [...prev.images, ...newUploaded];
        return {
          ...prev,
          images: combined,
          image: prev.image || combined[0] || '',
        };
      });

      if (onNotify) onNotify(`${newUploaded.length} imagen(es) agregada(s)`);
    } catch (err) {
      alert('Error al subir imágenes: ' + err.message);
    } finally {
      setIsUploading(false);
      setUploadProgress('');
      e.target.value = '';
    }
  };

  // Agregar imagen por URL manual
  const handleAddUrl = (e) => {
    e.preventDefault();
    const trimmed = newUrlInput.trim();
    if (!trimmed) return;

    setFormData((prev) => {
      const combined = [...prev.images, trimmed];
      return {
        ...prev,
        images: combined,
        image: prev.image || combined[0] || '',
      };
    });
    setNewUrlInput('');
  };

  // Definir como portada
  const handleSetCover = (url) => {
    setFormData((prev) => {
      const otherImages = prev.images.filter((img) => img !== url);
      return {
        ...prev,
        image: url,
        images: [url, ...otherImages],
      };
    });
  };

  // Eliminar una imagen de la lista
  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => {
      const filtered = prev.images.filter((_, i) => i !== indexToRemove);
      const newCover = prev.image === prev.images[indexToRemove]
        ? (filtered[0] || '')
        : prev.image;

      return {
        ...prev,
        images: filtered,
        image: newCover,
      };
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.date.trim()) {
      alert('El título y la fecha del evento son obligatorios.');
      return;
    }

    const isUpcoming = formData.isUpcoming || formData.status === 'Próximo';
    const coverImg = formData.image || formData.images[0] || (isUpcoming ? '/img/subasta-evento.jpg' : '/img/sala-exhibicion.jpg');
    const finalImages = formData.images.length > 0 ? formData.images : [coverImg];

    const updatedEvent = {
      ...formData,
      status: isUpcoming ? 'Próximo' : 'Realizado',
      isUpcoming: isUpcoming,
      image: coverImg,
      images: finalImages,
    };

    let updatedEvents = [];
    if (editingEvent === 'new-upcoming' || editingEvent === 'new-past') {
      updatedEvents = [updatedEvent, ...events];
      if (onNotify) onNotify(isUpcoming ? 'Próximo evento agregado a la agenda' : 'Evento agregado al registro histórico');
    } else {
      updatedEvents = events.map((ev) => (ev.id === editingEvent.id ? updatedEvent : ev));
      if (onNotify) onNotify('Evento actualizado con éxito');
    }

    saveEvents(updatedEvents);
    setEvents(updatedEvents);
    setEditingEvent(null);
  };

  const handleDelete = (id) => {
    const updated = events.filter((ev) => ev.id !== id);
    saveEvents(updated);
    setEvents(updated);
    setDeleteConfirmId(null);
    if (onNotify) onNotify('Evento eliminado');
  };

  return (
    <div className="space-y-10">
      {/* ========================================================= */}
      {/* BLOQUE 1: PRÓXIMOS EVENTOS (AGENDA FUTURA)                */}
      {/* ========================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--ink-2)]/50 p-5 rounded-lg border border-[var(--line-soft)] shadow-sm">
          <div>
            <h2 className="text-xl md:text-2xl font-serif text-[var(--ivory)] font-normal flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[var(--gold)]" />
              1. Próximos Eventos (Agenda Futura)
            </h2>
            <p className="text-xs md:text-sm text-[var(--ivory-dim)] mt-1">
              Eventos con fecha y hora programada que se mostrarán en la sección "Próximos Eventos" ({upcomingEvents.length} activo{upcomingEvents.length === 1 ? '' : 's'}).
            </p>
          </div>

          <button
            onClick={handleOpenNewUpcoming}
            className="btn-gold text-xs py-2.5 px-4 rounded flex items-center justify-center gap-2 shrink-0 shadow"
          >
            <Plus size={16} />
            + Nuevo Próximo Evento
          </button>
        </div>

        {/* Tarjetas de Próximos Eventos */}
        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {upcomingEvents.map((uev) => (
              <div
                key={uev.id}
                className="bg-[var(--ink-2)]/30 border border-[var(--line-soft)] rounded-lg p-5 flex flex-col justify-between hover:border-[var(--gold)] transition-all shadow-sm group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="bg-[#1f2d12] text-[#f8fbef] text-[10px] font-mono tracking-wider uppercase px-2.5 py-0.5 rounded font-semibold">
                      {uev.category || 'Subasta Presencial'}
                    </span>
                    <span className="text-[10px] font-semibold uppercase bg-emerald-950/70 text-emerald-200 border border-emerald-600/30 px-2 py-0.5 rounded">
                      Próximo
                    </span>
                  </div>

                  {/* Fecha y Hora */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--gold-hi)] font-semibold pt-1">
                    <span className="flex items-center gap-1.5 bg-[var(--ink-2)]/60 px-2.5 py-1 rounded border border-[var(--line-soft)]">
                      <Calendar size={14} className="text-[var(--gold)]" />
                      {uev.date}
                    </span>
                    {uev.time && (
                      <span className="flex items-center gap-1.5 font-mono bg-[var(--ink-2)]/60 px-2.5 py-1 rounded border border-[var(--line-soft)]">
                        <Clock size={14} className="text-[var(--gold)]" />
                        {uev.time}
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-xl text-[var(--ivory)] font-medium leading-snug">
                    {uev.title}
                  </h3>

                  {uev.location && (
                    <p className="flex items-center gap-1.5 text-xs text-[var(--ivory-dim)]">
                      <MapPin size={13} className="text-[var(--gold)] shrink-0" />
                      <span>{uev.location}</span>
                    </p>
                  )}

                  {uev.description && (
                    <p className="text-xs text-[var(--ivory-dim)] line-clamp-2 leading-relaxed">
                      {uev.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-[var(--line-soft)] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[var(--ivory-dim)]">
                    ID: {uev.id}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(uev)}
                      className="btn-ghost text-xs py-1.5 px-3 rounded flex items-center gap-1.5"
                    >
                      <Pencil size={13} />
                      Editar
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(uev.id)}
                      className="p-1.5 text-rose-800 hover:text-rose-950 hover:bg-rose-500/10 rounded transition-colors"
                      title="Eliminar próximo evento"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed border-[var(--line)] rounded-lg bg-[var(--ink-2)]/20 p-4">
            <p className="text-xs md:text-sm text-[var(--ivory-dim)]">
              No hay eventos próximos en agenda actualmente.
            </p>
            <button
              onClick={handleOpenNewUpcoming}
              className="btn-gold text-xs py-2 px-4 rounded mt-3 inline-flex items-center gap-1.5"
            >
              <Plus size={14} />
              Agregar el primer próximo evento
            </button>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* BLOQUE 2: REGISTRO HISTÓRICO DE EVENTOS REALIZADOS       */}
      {/* ========================================================= */}
      <div className="space-y-4 pt-6 border-t-2 border-[var(--line)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--ink-2)]/50 p-5 rounded-lg border border-[var(--line-soft)] shadow-sm">
          <div>
            <h2 className="text-xl md:text-2xl font-serif text-[var(--ivory)] font-normal flex items-center gap-2">
              <Camera className="w-5 h-5 text-[var(--gold)]" />
              2. Registro de Eventos Realizados (Memoria Fotográfica)
            </h2>
            <p className="text-xs md:text-sm text-[var(--ivory-dim)] mt-1">
              Eventos que ya se llevaron a cabo con galería de fotos, fecha y crónica en sala ({pastEvents.length} evento{pastEvents.length === 1 ? '' : 's'}).
            </p>
          </div>

          <button
            onClick={handleOpenNewPast}
            className="btn-gold text-xs py-2.5 px-4 rounded flex items-center justify-center gap-2 shrink-0 shadow"
          >
            <Plus size={16} />
            + Nuevo Evento Realizado
          </button>
        </div>

        {/* Listado de Eventos Realizados */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pastEvents.map((ev) => {
            const evImages = Array.isArray(ev.images) && ev.images.length > 0 ? ev.images : (ev.image ? [ev.image] : []);
            return (
              <div
                key={ev.id}
                className="bg-[var(--ink-2)]/30 border border-[var(--line-soft)] rounded-lg overflow-hidden flex flex-col justify-between hover:border-[var(--line)] transition-all shadow-sm"
              >
                <div>
                  {/* Portada del evento */}
                  <div className="relative aspect-[16/9] bg-black/10 overflow-hidden">
                    <img
                      src={ev.image || evImages[0] || '/img/sala-exhibicion.jpg'}
                      alt={ev.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/img/sala-exhibicion.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                    {/* Etiquetas */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="bg-[#1f2d12] text-[#f8fbef] text-[10px] font-mono tracking-wider uppercase px-2.5 py-0.5 rounded font-semibold border border-[#1f2d12]">
                        {ev.category || 'Muestra'}
                      </span>
                      <span className="bg-zinc-800/80 text-zinc-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-zinc-700/30 uppercase">
                        Realizado
                      </span>
                    </div>

                    {/* Contador de fotos */}
                    <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded text-[11px] text-white/90 flex items-center gap-1.5 font-mono">
                      <ImageIcon size={13} />
                      <span>{evImages.length} foto{evImages.length === 1 ? '' : 's'}</span>
                    </div>
                  </div>

                  {/* Tira de miniaturas de fotos */}
                  {evImages.length > 1 && (
                    <div className="flex items-center gap-1.5 p-2 bg-[var(--ink-2)]/60 overflow-x-auto border-b border-[var(--line-soft)]">
                      {evImages.slice(0, 6).map((img, i) => (
                        <div key={i} className="relative w-12 h-10 shrink-0 rounded overflow-hidden border border-[var(--line-soft)] bg-black/10">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          {i === 5 && evImages.length > 6 && (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-[10px] text-white font-bold">
                              +{evImages.length - 6}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Contenido */}
                  <div className="p-5 space-y-3">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--ivory-dim)]">
                      <span className="flex items-center gap-1 font-medium text-[var(--gold-hi)]">
                        <Clock size={14} className="text-[var(--gold)]" />
                        {ev.date}
                      </span>
                      {ev.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={14} className="text-[var(--gold)]" />
                          {ev.location}
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif text-xl text-[var(--ivory)] font-medium leading-snug">
                      {ev.title}
                    </h3>

                    <p className="text-xs md:text-sm text-[var(--ivory-dim)] line-clamp-3 leading-relaxed">
                      {ev.description || 'Sin descripción ingresada.'}
                    </p>
                  </div>
                </div>

                {/* Acciones */}
                <div className="p-3 bg-[var(--ink-2)]/60 border-t border-[var(--line-soft)] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[var(--ivory-dim)]">
                    ID: {ev.id}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(ev)}
                      className="btn-ghost text-xs py-1.5 px-3 rounded flex items-center gap-1.5"
                    >
                      <Pencil size={13} />
                      Editar / Fotos
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(ev.id)}
                      className="p-2 text-rose-800 hover:text-rose-950 hover:bg-rose-500/10 rounded transition-colors"
                      title="Eliminar evento"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL DE ALTA / EDICIÓN (PRÓXIMOS O HISTÓRICOS)          */}
      {/* ========================================================= */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[var(--ink)] border border-[var(--line)] rounded-xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Header modal */}
            <div className="p-5 border-b border-[var(--line-soft)] flex items-center justify-between bg-[var(--ink-2)]/50">
              <div>
                <h3 className="font-serif text-xl text-[var(--ivory)] font-medium">
                  {editingEvent === 'new-upcoming'
                    ? 'Crear Próximo Evento (Agenda)'
                    : editingEvent === 'new-past'
                    ? 'Registrar Evento Realizado (Memoria)'
                    : formData.isUpcoming
                    ? 'Editar Próximo Evento'
                    : 'Editar Evento y Fotografías'}
                </h3>
                <p className="text-xs text-[var(--ivory-dim)] mt-0.5">
                  {formData.isUpcoming
                    ? 'Configura la fecha, hora, título y sede del próximo evento para la agenda pública.'
                    : 'Actualiza la crónica y el registro de fotografías del evento realizado.'}
                </p>
              </div>
              <button
                onClick={() => setEditingEvent(null)}
                className="text-[var(--ivory-dim)] hover:text-[var(--ivory)] p-1 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto flex-1 text-sm">
              {/* Selector de Sección */}
              <div className="p-3 bg-[var(--ink-2)]/60 rounded border border-[var(--line-soft)] flex items-center gap-4">
                <span className="text-xs font-semibold text-[var(--ivory)]">Sección destino:</span>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="radio"
                    name="isUpcomingRadio"
                    checked={formData.isUpcoming}
                    onChange={() => setFormData({ ...formData, isUpcoming: true, status: 'Próximo' })}
                  />
                  <span>Próximos Eventos (Agenda con Hora)</span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="radio"
                    name="isUpcomingRadio"
                    checked={!formData.isUpcoming}
                    onChange={() => setFormData({ ...formData, isUpcoming: false, status: 'Realizado' })}
                  />
                  <span>Eventos Realizados (Memoria con Fotos)</span>
                </label>
              </div>

              {/* Título */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ivory-dim)] mb-1">
                  Título del Evento *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Gran Subasta de Cierre de Año & Brindis de Gala"
                  className="w-full bg-[var(--ink-2)]/60 border border-[var(--line-soft)] rounded p-2.5 text-[var(--ivory)] focus:border-[var(--gold)] outline-none"
                />
              </div>

              {/* Fecha y Hora */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ivory-dim)] mb-1">
                    Fecha del Evento *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="Ej: 6 de Diciembre de 2026"
                    className="w-full bg-[var(--ink-2)]/60 border border-[var(--line-soft)] rounded p-2.5 text-[var(--ivory)] focus:border-[var(--gold)] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ivory-dim)] mb-1">
                    Hora del Evento {formData.isUpcoming ? '*' : '(Opcional)'}
                  </label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="Ej: 19:30 hs"
                    className="w-full bg-[var(--ink-2)]/60 border border-[var(--line-soft)] rounded p-2.5 text-[var(--ivory)] focus:border-[var(--gold)] outline-none font-mono"
                  />
                </div>
              </div>

              {/* Sede y Categoría */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ivory-dim)] mb-1">
                    Ubicación / Sede
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ej: Galería Alberdi 355 · Río Cuarto"
                    className="w-full bg-[var(--ink-2)]/60 border border-[var(--line-soft)] rounded p-2.5 text-[var(--ivory)] focus:border-[var(--gold)] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ivory-dim)] mb-1">
                    Categoría
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[var(--ink-2)]/60 border border-[var(--line-soft)] rounded p-2.5 text-[var(--ivory)] focus:border-[var(--gold)] outline-none"
                  >
                    <option value="Subasta Presencial">Subasta Presencial</option>
                    <option value="Inauguración de Galería">Inauguración de Galería</option>
                    <option value="Exposición">Exposición</option>
                    <option value="Velada Artística">Velada Artística</option>
                    <option value="Degustación & Vino de Honor">Degustación & Vino de Honor</option>
                    <option value="Muestra Colectiva">Muestra Colectiva</option>
                    <option value="Conversatorio">Conversatorio</option>
                  </select>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ivory-dim)] mb-1">
                  Descripción del Evento
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalles del encuentro, recepción, catálogo, condiciones de asistencia..."
                  className="w-full bg-[var(--ink-2)]/60 border border-[var(--line-soft)] rounded p-2.5 text-[var(--ivory)] focus:border-[var(--gold)] outline-none resize-none"
                />
              </div>

              {/* GESTIÓN DE IMÁGENES (FOTOGRAFÍAS / FLYER) */}
              <div className="pt-4 border-t border-[var(--line-soft)] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ivory)]">
                      Fotografías o Flyer ({formData.images.length} imagen{formData.images.length === 1 ? '' : 'es'})
                    </label>
                    <p className="text-[11px] text-[var(--ivory-dim)]">
                      Puedes subir fotos desde tu computadora o pegar un enlace.
                    </p>
                  </div>

                  <label className="btn-gold cursor-pointer inline-flex items-center gap-2 py-2 px-3.5 text-xs rounded shrink-0">
                    {isUploading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Subiendo...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={14} />
                        <span>Subir Fotos</span>
                      </>
                    )}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleMultipleFilesChange}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>

                {isUploading && uploadProgress && (
                  <div className="p-3 bg-[var(--ink-2)]/70 border border-[var(--gold)]/30 rounded text-xs text-[var(--gold-hi)] font-medium flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-[var(--gold)]" />
                    <span>{uploadProgress}</span>
                  </div>
                )}

                {/* Grilla de miniaturas */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-56 overflow-y-auto p-2 bg-[var(--ink-2)]/30 border border-[var(--line-soft)] rounded-lg">
                    {formData.images.map((imgUrl, index) => {
                      const isCover = (formData.image === imgUrl) || (!formData.image && index === 0);
                      return (
                        <div
                          key={index}
                          className={`group relative aspect-square rounded-md overflow-hidden border transition-all ${
                            isCover ? 'border-[var(--gold)] ring-2 ring-[var(--gold)]/40' : 'border-[var(--line-soft)]'
                          }`}
                        >
                          <img
                            src={imgUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = '/img/sala-exhibicion.jpg';
                            }}
                          />

                          {isCover && (
                            <div className="absolute top-1.5 left-1.5 bg-[var(--gold)] text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded flex items-center gap-1 shadow">
                              <Star size={10} fill="currentColor" />
                              Portada
                            </div>
                          )}

                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                            {!isCover && (
                              <button
                                type="button"
                                onClick={() => handleSetCover(imgUrl)}
                                className="bg-[var(--gold)] text-white text-[10px] font-semibold py-1 px-2 rounded hover:bg-[var(--gold-hi)] transition-colors shadow flex items-center gap-1"
                              >
                                <Star size={11} />
                                Portada
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="bg-rose-900/90 text-white text-[10px] font-semibold py-1 px-2 rounded hover:bg-rose-800 transition-colors shadow flex items-center gap-1"
                            >
                              <Trash2 size={11} />
                              Quitar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Agregar URL directa */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newUrlInput}
                    onChange={(e) => setNewUrlInput(e.target.value)}
                    placeholder="O agrega una URL o ruta (/img/...)"
                    className="flex-1 bg-[var(--ink-2)]/60 border border-[var(--line-soft)] rounded p-2 text-xs text-[var(--ivory)] focus:border-[var(--gold)] outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddUrl}
                    disabled={!newUrlInput.trim()}
                    className="btn-ghost text-xs py-2 px-3 rounded shrink-0 disabled:opacity-40"
                  >
                    + Agregar URL
                  </button>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="pt-4 border-t border-[var(--line-soft)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="btn-ghost text-xs py-2 px-4 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="btn-gold text-xs py-2 px-5 rounded disabled:opacity-50"
                >
                  Guardar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmar eliminación */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--ink)] border border-[var(--line)] rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-serif text-lg text-[var(--ivory)] font-medium">¿Eliminar este evento?</h3>
            <p className="text-xs text-[var(--ivory-dim)] leading-relaxed">
              El evento dejará de mostrarse en la sección correspondiente.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="btn-ghost text-xs py-2 px-3 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="bg-rose-900 hover:bg-rose-800 text-white text-xs font-semibold py-2 px-4 rounded transition-colors"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
