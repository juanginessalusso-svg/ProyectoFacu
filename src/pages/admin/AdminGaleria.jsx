import React, { useState, useEffect } from 'react';
import {
  Images,
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Upload,
  X,
  FileText
} from 'lucide-react';
import {
  getGalleryPhotos,
  saveGalleryPhotos,
  fileToDataUrl,
  apiUploadImage,
  getGalleryIntro,
  saveGalleryIntro
} from '../../lib/storage';

export default function AdminGaleria({ onNotify }) {
  const [photos, setPhotos] = useState([]);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [photoForm, setPhotoForm] = useState({ id: '', src: '', cap: '', text: '', cls: 'lg:col-span-6', h: 'h-[320px] md:h-[400px]' });
  const [photoPreview, setPhotoPreview] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingIntroPhoto, setIsUploadingIntroPhoto] = useState(false);
  const [introForm, setIntroForm] = useState(() => getGalleryIntro());
  const [introDirty, setIntroDirty] = useState(false);
  const [isSavingIntro, setIsSavingIntro] = useState(false);

  useEffect(() => {
    loadData();
    const handleDataChange = () => loadData();
    window.addEventListener('insignia-data-change', handleDataChange);
    return () => window.removeEventListener('insignia-data-change', handleDataChange);
  }, []);

  const loadData = () => {
    setPhotos(getGalleryPhotos());
  };

  // Si llegan datos del servidor y el usuario no está editando, refrescar el formulario
  useEffect(() => {
    const handle = () => {
      if (!introDirty) setIntroForm(getGalleryIntro());
    };
    window.addEventListener('insignia-data-change', handle);
    return () => window.removeEventListener('insignia-data-change', handle);
  }, [introDirty]);

  const handleSaveIntro = async (e) => {
    e.preventDefault();
    try {
      setIsSavingIntro(true);
      await saveGalleryIntro(introForm);
      setIntroDirty(false);
      onNotify('Cabecera e información de la galería guardadas');
    } catch (err) {
      alert('No se pudo guardar la información en el servidor: ' + err.message);
    } finally {
      setIsSavingIntro(false);
    }
  };

  const handleIntroPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingIntroPhoto(true);
      const uploadedUrl = await apiUploadImage(file);
      setIntroForm((prev) => ({ ...prev, image: uploadedUrl }));
      setIntroDirty(true);
      onNotify('Foto de cabecera subida correctamente');
    } catch (err) {
      alert('Error al procesar la foto de cabecera: ' + err.message);
    } finally {
      setIsUploadingIntroPhoto(false);
    }
  };

  const handleRemoveIntroPhoto = () => {
    setIntroForm((prev) => ({ ...prev, image: '' }));
    setIntroDirty(true);
  };

  const handleOpenEditPhoto = (photo, index) => {
    const p = {
      ...photo,
      id: photo.id || `gal-${index + 1}`,
      cap: photo.cap || '',
      text: photo.text || photo.desc || photo.description || '',
      cls: photo.cls || 'lg:col-span-6',
      h: photo.h || 'h-[320px] md:h-[400px]',
    };
    setPhotoForm(p);
    setPhotoPreview(p.src || '');
    setEditingPhoto(index);
  };

  const handleOpenNewPhoto = () => {
    setPhotoForm({
      id: `gal-${Date.now()}`,
      src: '',
      cap: '',
      text: '',
      cls: 'lg:col-span-6',
      h: 'h-[320px] md:h-[400px]',
    });
    setPhotoPreview('');
    setEditingPhoto('new');
  };

  const handlePhotoFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingPhoto(true);
      const uploadedUrl = await apiUploadImage(file);
      setPhotoPreview(uploadedUrl);
      setPhotoForm((prev) => ({ ...prev, src: uploadedUrl }));
    } catch (err) {
      alert('Error al procesar la foto: ' + err.message);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhotoSrc = () => {
    setPhotoForm((prev) => ({ ...prev, src: '' }));
    setPhotoPreview('');
  };

  const handleSavePhoto = (e) => {
    e.preventDefault();
    const finalSrc = photoForm.src || photoPreview || '';
    if (!photoForm.cap?.trim() && !photoForm.text?.trim() && !finalSrc) {
      alert('Por favor ingresa al menos un título o un texto para la publicación.');
      return;
    }

    const item = {
      ...photoForm,
      src: finalSrc,
      text: photoForm.text || '',
      cap: photoForm.cap || '',
    };

    let updated = [];
    if (editingPhoto === 'new') {
      updated = [...photos, item];
      onNotify('Elemento agregado a la galería');
    } else {
      updated = photos.map((p, idx) => (idx === editingPhoto ? item : p));
      onNotify('Elemento actualizado en la galería');
    }

    saveGalleryPhotos(updated);
    setPhotos(updated);
    setEditingPhoto(null);
  };

  const handleDeletePhoto = (index) => {
    if (!window.confirm('¿Eliminar esta fotografía de la galería?')) return;
    const updated = photos.filter((_, idx) => idx !== index);
    saveGalleryPhotos(updated);
    setPhotos(updated);
    onNotify('Fotografía eliminada');
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--ink-2)]/40 p-5 rounded-lg border border-[var(--line-soft)]">
        <div>
          <h2 className="text-xl md:text-2xl font-serif text-[var(--ivory)] font-normal flex items-center gap-2">
            <Images className="w-5 h-5 text-[var(--gold)]" />
            Galería: Fotos de Sala en Alberdi 355
          </h2>
          <p className="text-xs md:text-sm text-[var(--ivory-dim)] mt-1">
            Actualiza, reemplaza o agrega nuevas imágenes de las salas de exhibición ({photos.length} fotos).
          </p>
        </div>

        <button
          onClick={handleOpenNewPhoto}
          className="btn-gold text-xs py-2.5 px-4 rounded flex items-center justify-center gap-2 shrink-0"
        >
          <Plus size={16} />
          Agregar Fotografía
        </button>
      </div>

      {/* Texto introductorio y foto de portada que aparecen al inicio de la página Galería */}
      <form
        onSubmit={handleSaveIntro}
        className="bg-[var(--ink-2)]/40 p-5 rounded-lg border border-[var(--line-soft)] space-y-4 text-sm"
      >
        <div>
          <h3 className="text-base font-serif text-[var(--ivory)]">Información y Portada al inicio de la Galería</h3>
          <p className="text-xs text-[var(--ivory-dim)] mt-1">
            Se muestra al comienzo de la página 'Galería'. Puedes configurar el subtítulo, el texto informativo y de manera opcional una fotografía debajo del título principal.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ivory-dim)] mb-1">
            Subtítulo (opcional)
          </label>
          <input
            type="text"
            value={introForm.title || ''}
            maxLength={200}
            onChange={(e) => {
              setIntroForm({ ...introForm, title: e.target.value });
              setIntroDirty(true);
            }}
            placeholder="Ej: Muestra colectiva de noviembre"
            className="w-full bg-[var(--ink-2)]/60 border border-[var(--line-soft)] rounded p-2 text-xs text-[var(--ivory)] focus:border-[var(--gold)] outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ivory-dim)] mb-1">
            Texto informativo
          </label>
          <textarea
            rows={4}
            value={introForm.text || ''}
            maxLength={5000}
            onChange={(e) => {
              setIntroForm({ ...introForm, text: e.target.value });
              setIntroDirty(true);
            }}
            placeholder="Horarios, muestra actual, información para visitantes…"
            className="w-full bg-[var(--ink-2)]/60 border border-[var(--line-soft)] rounded p-2 text-xs text-[var(--ivory)] focus:border-[var(--gold)] outline-none resize-y"
          />
        </div>

        {/* Sección: Foto opcional debajo del título principal */}
        <div className="pt-3 border-t border-[var(--line-soft)] space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ivory-dim)]">
              Foto debajo del título grande (opcional)
            </label>
            {introForm.image && (
              <button
                type="button"
                onClick={handleRemoveIntroPhoto}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                title="Quitar foto de cabecera"
              >
                <Trash2 size={13} />
                Quitar foto
              </button>
            )}
          </div>
          <p className="text-xs text-[var(--ivory-dim)]/70">
            Aparece en la columna izquierda debajo de "Galería Insignia". Si no se asigna foto, el título ocupará su espacio limpio.
          </p>

          {introForm.image ? (
            <div className="relative aspect-[16/9] sm:aspect-[21/9] max-h-48 rounded-lg overflow-hidden border border-[var(--line-soft)] bg-black/20 group">
              <img
                src={introForm.image}
                alt="Vista previa cabecera"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveIntroPhoto}
                className="absolute top-2 right-2 bg-black/80 hover:bg-rose-900/80 text-rose-300 p-1.5 rounded-full backdrop-blur-sm transition-colors"
                title="Eliminar foto de portada"
              >
                <X size={15} />
              </button>
            </div>
          ) : (
            <div className="p-4 border border-dashed border-[var(--line-soft)] rounded-lg text-center text-xs text-[var(--ivory-dim)]/60 bg-[var(--ink-2)]/20">
              Sin foto asignada (se mostrará únicamente el título)
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <label className="btn-ghost flex-1 cursor-pointer flex items-center justify-center gap-2 py-2 text-xs rounded border border-[var(--line-soft)]">
              <Upload size={14} />
              <span>{isUploadingIntroPhoto ? 'Subiendo imagen...' : 'Subir foto para la cabecera'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleIntroPhotoUpload}
                className="hidden"
                disabled={isUploadingIntroPhoto}
              />
            </label>
            <input
              type="text"
              value={introForm.image || ''}
              onChange={(e) => {
                setIntroForm({ ...introForm, image: e.target.value });
                setIntroDirty(true);
              }}
              placeholder="O ingresa URL de la imagen..."
              className="flex-1 bg-[var(--ink-2)]/60 border border-[var(--line-soft)] rounded p-2 text-xs text-[var(--ivory)] focus:border-[var(--gold)] outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSavingIntro}
            className="btn-gold text-xs py-2 px-4 rounded disabled:opacity-60"
          >
            {isSavingIntro ? 'Guardando…' : 'Guardar portada e información'}
          </button>
        </div>
      </form>

      {/* Cuadrícula de fotos para administración */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {photos.map((photo, idx) => (
          <div
            key={photo.id || idx}
            className="bg-[var(--ink-2)]/30 border border-[var(--line-soft)] rounded-lg overflow-hidden flex flex-col justify-between hover:border-[var(--line)] transition-all group"
          >
            <div>
              {photo.src ? (
                <div className="relative aspect-[4/3] bg-black/10 overflow-hidden">
                  <img
                    src={photo.src}
                    alt={photo.cap}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-[var(--ink)]/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-mono text-[var(--ivory)] rounded">
                    Foto #{idx + 1}
                  </div>
                </div>
              ) : (
                <div className="relative aspect-[4/3] bg-[var(--ink-2)]/50 flex flex-col items-center justify-center text-[var(--ivory-dim)]/50 border-b border-[var(--line-soft)] p-4 text-center">
                  <FileText className="w-8 h-8 mb-2 text-[var(--gold)]/60" />
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--gold)]/80">Solo Título / Texto</span>
                  <div className="absolute top-2 left-2 bg-[var(--ink)]/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-mono text-[var(--ivory)] rounded">
                    #{idx + 1}
                  </div>
                </div>
              )}

              <div className="p-3.5 space-y-1.5">
                <p className="text-xs font-serif text-[var(--ivory)] font-medium line-clamp-1">
                  {photo.cap || 'Sin título'}
                </p>
                <p className="text-[11px] text-[var(--ivory-dim)] line-clamp-2 leading-relaxed">
                  {photo.text || 'Sin texto descriptivo'}
                </p>
              </div>
            </div>

            <div className="p-2.5 bg-[var(--ink-2)]/60 border-t border-[var(--line-soft)] flex items-center justify-between">
              <button
                onClick={() => handleOpenEditPhoto(photo, idx)}
                className="text-xs text-[var(--gold-hi)] hover:text-black font-medium flex items-center gap-1 p-1"
              >
                <Pencil size={13} />
                Editar / Modificar
              </button>

              <button
                onClick={() => handleDeletePhoto(idx)}
                className="p-1 text-rose-400/80 hover:text-rose-300 transition-colors"
                title="Eliminar publicación"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Edición / Alta de Foto */}
      {editingPhoto !== null && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--ink)] border border-[var(--line)] rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line-soft)]">
              <h3 className="font-serif text-lg text-[var(--ivory)] font-medium">
                {editingPhoto === 'new' ? 'Agregar Elemento a la Galería' : 'Actualizar Elemento'}
              </h3>
              <button
                onClick={() => setEditingPhoto(null)}
                className="text-[var(--ivory-dim)] hover:text-[var(--ivory)]"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePhoto} className="space-y-4 text-sm">
              {/* Preview */}
              <div className="aspect-[16/9] w-full bg-black/10 rounded overflow-hidden flex items-center justify-center border border-[var(--line)] relative group">
                {photoPreview ? (
                  <>
                    <img src={photoPreview} alt="Vista previa" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={handleRemovePhotoSrc}
                      className="absolute top-2 right-2 bg-black/80 hover:bg-rose-900/80 text-rose-300 px-2 py-1 rounded text-xs flex items-center gap-1 backdrop-blur-sm transition-colors"
                      title="Quitar imagen"
                    >
                      <Trash2 size={12} />
                      Quitar imagen
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-center p-3 text-[var(--ivory-dim)]/60">
                    <ImageIcon className="w-8 h-8 text-[var(--ivory-dim)]/40" />
                    <span className="text-xs">Sin imagen (opcional: puedes dejar solo título y texto)</span>
                  </div>
                )}
              </div>

              {/* Botón archivo */}
              <label className="btn-ghost w-full cursor-pointer flex items-center justify-center gap-2 py-2 text-xs rounded">
                <Upload size={14} />
                <span>{isUploadingPhoto ? 'Procesando imagen...' : (photoPreview ? 'Cambiar imagen' : 'Seleccionar foto de tu dispositivo (opcional)')}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoFileUpload}
                  className="hidden"
                  disabled={isUploadingPhoto}
                />
              </label>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ivory-dim)]">
                    O ingresar ruta/URL de imagen (opcional)
                  </label>
                  {photoPreview && (
                    <button
                      type="button"
                      onClick={handleRemovePhotoSrc}
                      className="text-[11px] text-rose-400 hover:text-rose-300"
                    >
                      Eliminar imagen
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={photoForm.src}
                  onChange={(e) => {
                    setPhotoForm({ ...photoForm, src: e.target.value });
                    setPhotoPreview(e.target.value);
                  }}
                  placeholder="Ej: /img/publico-evento.jpg (deja vacío para solo título y texto)"
                  className="w-full bg-[var(--ink-2)]/60 border border-[var(--line-soft)] rounded p-2 text-xs text-[var(--ivory)] focus:border-[var(--gold)] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ivory-dim)] mb-1">
                  Título (aparece arriba)
                </label>
                <input
                  type="text"
                  value={photoForm.cap}
                  onChange={(e) => setPhotoForm({ ...photoForm, cap: e.target.value })}
                  placeholder="Ej: Concurrencia en la subasta · Alberdi 355"
                  className="w-full bg-[var(--ink-2)]/60 border border-[var(--line-soft)] rounded p-2 text-xs text-[var(--ivory)] focus:border-[var(--gold)] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ivory-dim)] mb-1">
                  Texto descriptivo / Información
                </label>
                <textarea
                  rows={4}
                  value={photoForm.text || ''}
                  onChange={(e) => setPhotoForm({ ...photoForm, text: e.target.value })}
                  placeholder="Escribe la historia, contexto o detalles que se mostrarán..."
                  className="w-full bg-[var(--ink-2)]/60 border border-[var(--line-soft)] rounded p-2 text-xs text-[var(--ivory)] focus:border-[var(--gold)] outline-none resize-y"
                />
              </div>

              <div className="pt-3 border-t border-[var(--line-soft)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPhoto(null)}
                  className="btn-ghost text-xs py-2 px-3 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-gold text-xs py-2 px-4 rounded"
                >
                  Guardar Fotografía
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
