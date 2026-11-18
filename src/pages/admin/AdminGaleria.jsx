import React, { useState, useEffect } from 'react';
import {
  Images,
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Upload,
  X
} from 'lucide-react';
import {
  getGalleryPhotos,
  saveGalleryPhotos,
  fileToDataUrl,
  apiUploadImage
} from '../../lib/storage';

export default function AdminGaleria({ onNotify }) {
  const [photos, setPhotos] = useState([]);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [photoForm, setPhotoForm] = useState({ id: '', src: '', cap: '', cls: 'lg:col-span-6', h: 'h-[320px] md:h-[400px]' });
  const [photoPreview, setPhotoPreview] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  useEffect(() => {
    loadData();
    const handleDataChange = () => loadData();
    window.addEventListener('insignia-data-change', handleDataChange);
    return () => window.removeEventListener('insignia-data-change', handleDataChange);
  }, []);

  const loadData = () => {
    setPhotos(getGalleryPhotos());
  };

  const handleOpenEditPhoto = (photo, index) => {
    const p = {
      ...photo,
      id: photo.id || `gal-${index + 1}`,
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

  const handleSavePhoto = (e) => {
    e.preventDefault();
    if (!photoForm.src && !photoPreview) {
      alert('Por favor selecciona una imagen.');
      return;
    }

    const item = {
      ...photoForm,
      src: photoForm.src || photoPreview,
    };

    let updated = [];
    if (editingPhoto === 'new') {
      updated = [...photos, item];
      onNotify('Fotografía agregada a la galería');
    } else {
      updated = photos.map((p, idx) => (idx === editingPhoto ? item : p));
      onNotify('Fotografía actualizada en la galería');
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

      {/* Cuadrícula de fotos para administración */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {photos.map((photo, idx) => (
          <div
            key={photo.id || idx}
            className="bg-[var(--ink-2)]/30 border border-[var(--line-soft)] rounded-lg overflow-hidden flex flex-col justify-between hover:border-[var(--line)] transition-all group"
          >
            <div>
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

              <div className="p-3.5">
                <p className="text-xs font-serif text-[var(--ivory)] line-clamp-2">
                  {photo.cap || 'Sin epígrafe'}
                </p>
              </div>
            </div>

            <div className="p-2.5 bg-[var(--ink-2)]/60 border-t border-[var(--line-soft)] flex items-center justify-between">
              <button
                onClick={() => handleOpenEditPhoto(photo, idx)}
                className="text-xs text-[var(--gold-hi)] hover:text-black font-medium flex items-center gap-1 p-1"
              >
                <Pencil size={13} />
                Editar / Reemplazar
              </button>

              <button
                onClick={() => handleDeletePhoto(idx)}
                className="p-1 text-rose-400/80 hover:text-rose-300 transition-colors"
                title="Eliminar foto"
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
          <div className="bg-[var(--ink)] border border-[var(--line)] rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line-soft)]">
              <h3 className="font-serif text-lg text-[var(--ivory)] font-medium">
                {editingPhoto === 'new' ? 'Agregar Fotografía a la Galería' : 'Actualizar Fotografía'}
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
              <div className="aspect-[16/9] w-full bg-black/10 rounded overflow-hidden flex items-center justify-center border border-[var(--line)]">
                {photoPreview ? (
                  <img src={photoPreview} alt="Vista previa" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-10 h-10 text-[var(--ivory-dim)]/50" />
                )}
              </div>

              {/* Botón archivo */}
              <label className="btn-ghost w-full cursor-pointer flex items-center justify-center gap-2 py-2 text-xs rounded">
                <Upload size={14} />
                <span>{isUploadingPhoto ? 'Procesando imagen...' : 'Seleccionar foto de tu dispositivo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoFileUpload}
                  className="hidden"
                  disabled={isUploadingPhoto}
                />
              </label>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ivory-dim)] mb-1">
                  O ingresar ruta/URL de imagen
                </label>
                <input
                  type="text"
                  value={photoForm.src}
                  onChange={(e) => {
                    setPhotoForm({ ...photoForm, src: e.target.value });
                    setPhotoPreview(e.target.value);
                  }}
                  placeholder="Ej: /img/publico-evento.jpg"
                  className="w-full bg-[var(--ink-2)]/60 border border-[var(--line-soft)] rounded p-2 text-xs text-[var(--ivory)] focus:border-[var(--gold)] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ivory-dim)] mb-1">
                  Epígrafe / Texto al pie
                </label>
                <input
                  type="text"
                  required
                  value={photoForm.cap}
                  onChange={(e) => setPhotoForm({ ...photoForm, cap: e.target.value })}
                  placeholder="Ej: Concurrencia en la subasta · Alberdi 355"
                  className="w-full bg-[var(--ink-2)]/60 border border-[var(--line-soft)] rounded p-2 text-xs text-[var(--ivory)] focus:border-[var(--gold)] outline-none"
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
