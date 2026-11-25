import React, { useState, useEffect } from 'react';
import { Home, Upload, X, Plus } from 'lucide-react';
import { getHome, saveHome, apiUploadImage } from '../../lib/storage';

const inputCls =
  'w-full bg-[var(--ink-2)]/60 border border-[var(--line-soft)] rounded p-2 text-xs text-[var(--ivory)] focus:border-[var(--gold)] outline-none';
const labelCls = 'block text-[11px] uppercase tracking-wider text-[var(--gold)] mb-1';
const cardCls = 'bg-[var(--ink-2)]/40 p-5 rounded-lg border border-[var(--line-soft)] space-y-4 text-sm';

export default function AdminInicio({ onNotify }) {
  const [form, setForm] = useState(() => getHome());
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState('');

  // Si llegan datos del servidor y no se está editando, refrescar el formulario
  useEffect(() => {
    const onChange = () => {
      if (!dirty) setForm(getHome());
    };
    window.addEventListener('insignia-data-change', onChange);
    return () => window.removeEventListener('insignia-data-change', onChange);
  }, [dirty]);

  const update = (patch) => {
    setForm((f) => ({ ...f, ...patch }));
    setDirty(true);
  };

  const updateService = (i, patch) => {
    update({ services: form.services.map((s, k) => (k === i ? { ...s, ...patch } : s)) });
  };

  const uploadTo = async (key, file, apply) => {
    if (!file) return;
    try {
      setUploading(key);
      const url = await apiUploadImage(file);
      apply(url);
    } catch (err) {
      alert('No se pudo subir la imagen: ' + (err.message || err));
    } finally {
      setUploading('');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await saveHome(form);
      setDirty(false);
      onNotify('Inicio guardado');
    } catch (err) {
      alert('No se pudo guardar en el servidor: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-white/10 text-white">
          <Home size={20} />
        </div>
        <div>
          <h2 className="text-xl text-[var(--ivory)]">Inicio</h2>
          <p className="text-xs text-[var(--ivory-dim)]">
            Editá los textos e imágenes de la página principal. Los cambios se ven al guardar.
          </p>
        </div>
      </div>

      {/* Portada */}
      <section className={cardCls}>
        <h3 className="text-base text-[var(--ivory)]">Portada</h3>
        <div>
          <label className={labelCls}>Título principal</label>
          <input
            className={inputCls}
            value={form.heroTitle}
            onChange={(e) => update({ heroTitle: e.target.value })}
            maxLength={300}
          />
        </div>
        <div>
          <label className={labelCls}>Imágenes de fondo (se alternan solas)</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {form.heroSlides.map((src, i) => (
              <div key={`${src}-${i}`} className="relative group">
                <img src={src} alt="" className="w-full h-24 object-cover rounded border border-[var(--line-soft)]" />
                {form.heroSlides.length > 1 && (
                  <button
                    type="button"
                    aria-label="Quitar imagen"
                    onClick={() => update({ heroSlides: form.heroSlides.filter((_, k) => k !== i) })}
                    className="absolute top-1 right-1 p-1 rounded bg-black/70 text-white hover:bg-red-700"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
            <label className="h-24 rounded border border-dashed border-[var(--line)] flex flex-col items-center justify-center gap-1 text-[11px] text-[var(--ivory-dim)] cursor-pointer hover:border-[var(--gold)]">
              {uploading === 'hero' ? (
                'Subiendo…'
              ) : (
                <>
                  <Plus size={16} /> Agregar imagen
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  uploadTo('hero', e.target.files[0], (url) => update({ heroSlides: [...form.heroSlides, url] }))
                }
              />
            </label>
          </div>
        </div>
      </section>

      {/* Artistas */}
      <section className={cardCls}>
        <h3 className="text-base text-[var(--ivory)]">Sección de artistas</h3>
        <div>
          <label className={labelCls}>Título</label>
          <input
            className={inputCls}
            value={form.artistsTitle}
            onChange={(e) => update({ artistsTitle: e.target.value })}
            maxLength={200}
          />
        </div>
        <div>
          <label className={labelCls}>Texto introductorio</label>
          <textarea
            rows={3}
            className={`${inputCls} resize-y`}
            value={form.artistsIntro}
            onChange={(e) => update({ artistsIntro: e.target.value })}
            maxLength={2000}
          />
        </div>
      </section>

      {/* Áreas */}
      <section className={cardCls}>
        <h3 className="text-base text-[var(--ivory)]">Áreas Insignia</h3>
        <div>
          <label className={labelCls}>Título de la sección</label>
          <input
            className={inputCls}
            value={form.servicesTitle}
            onChange={(e) => update({ servicesTitle: e.target.value })}
            maxLength={200}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {form.services.map((s, i) => (
            <div key={i} className="space-y-2 p-3 rounded border border-[var(--line-soft)]">
              <div className="relative">
                {s.image && <img src={s.image} alt="" className="w-full h-28 object-cover rounded" />}
                <label className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-[var(--ivory-dim)] cursor-pointer hover:text-white">
                  <Upload size={13} /> {uploading === `svc${i}` ? 'Subiendo…' : 'Cambiar imagen'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => uploadTo(`svc${i}`, e.target.files[0], (url) => updateService(i, { image: url }))}
                  />
                </label>
              </div>
              <div>
                <label className={labelCls}>Título</label>
                <input
                  className={inputCls}
                  value={s.title}
                  onChange={(e) => updateService(i, { title: e.target.value })}
                  maxLength={120}
                />
              </div>
              <div>
                <label className={labelCls}>Descripción</label>
                <textarea
                  rows={4}
                  className={`${inputCls} resize-y`}
                  value={s.text}
                  onChange={(e) => updateService(i, { text: e.target.value })}
                  maxLength={600}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end sticky bottom-4">
        <button type="submit" disabled={saving || !dirty} className="btn-gold text-xs py-2.5 px-6 rounded disabled:opacity-50">
          {saving ? 'Guardando…' : dirty ? 'Guardar cambios' : 'Sin cambios'}
        </button>
      </div>
    </form>
  );
}
