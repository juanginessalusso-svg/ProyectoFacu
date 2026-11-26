import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  DollarSign,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  Gavel,
  RotateCcw,
  Download,
  Users,
  User,
  Phone,
  Mail,
  FileText,
  Clock,
  Calendar,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import {
  getLots,
  saveLots,
  fileToDataUrl,
  getDeadline,
  saveDeadline,
  formatDeadlineText,
  apiUploadImage,
  apiGetBids,
  apiResetLotBids,
  apiGetAccreditations,
  apiDeleteAccreditation,
  apiResetAllAccreditations,
} from '../../lib/storage';

export default function AdminSubastas({ onNotify }) {
  const [lots, setLots] = useState([]);
  const [deadline, setDeadline] = useState(() => getDeadline());
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
  const [tempDeadline, setTempDeadline] = useState(() => getDeadline());
  const [search, setSearch] = useState('');
  const [editingLot, setEditingLot] = useState(null); // null = cerrado, 'new' = nuevo, o objeto
  const [formData, setFormData] = useState({
    id: '',
    lote: '',
    title: '',
    artist: '',
    technique: '',
    dimensions: '',
    year: '',
    basePrice: '',
    priceValue: 0,
    image: '',
  });
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Modal para ver ofertantes de un lote específico
  const [viewingBiddersLot, setViewingBiddersLot] = useState(null);

  // Preofertas registradas
  const [preoffers, setPreoffers] = useState({});

  // Modal para ver registro de acreditaciones
  const [isAccreditationsModalOpen, setIsAccreditationsModalOpen] = useState(false);
  const [accreditationsList, setAccreditationsList] = useState([]);
  const [loadingAccreditations, setLoadingAccreditations] = useState(false);

  const handleOpenAccreditations = async () => {
    setIsAccreditationsModalOpen(true);
    setLoadingAccreditations(true);
    try {
      const list = await apiGetAccreditations();
      setAccreditationsList(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAccreditations(false);
    }
  };

  const handleDeleteAccreditation = async (id, name) => {
    if (!window.confirm(`¿Seguro que deseas eliminar la acreditación de "${name}"?`)) return;
    try {
      const ok = await apiDeleteAccreditation(id);
      if (ok) {
        setAccreditationsList((prev) => prev.filter((a) => a.id !== id));
        if (onNotify) onNotify(`Acreditación de ${name} eliminada`);
      } else {
        alert('No se pudo eliminar la acreditación.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetAllAccreditations = async () => {
    if (
      !window.confirm(
        '⚠️ ¿Deseas reiniciar todas las acreditaciones?\n\n' +
        'Al hacerlo, el registro de la subasta actual comenzará de nuevo y todos los visitantes deberán completar la acreditación obligatoria para consultar el catálogo y participar de las preofertas.'
      )
    ) {
      return;
    }
    try {
      const ok = await apiResetAllAccreditations();
      if (ok) {
        setAccreditationsList([]);
        if (onNotify) onNotify('Se reiniciaron todas las acreditaciones para la nueva subasta');
      } else {
        alert('No se pudo reiniciar las acreditaciones.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const exportAccreditationsCSV = () => {
    if (!accreditationsList.length) return;
    const headers = ['#', 'Nombre', 'DNI', 'Email', 'Telefono', 'Fecha', 'Obras_Pujadas'];
    const rows = accreditationsList.map((item, idx) => {
      const bidsStr = (item.bids || []).map((b) => `${b.lotNumber}: $${b.amount}`).join('; ');
      return [
        idx + 1,
        `"${(item.name || '').replace(/"/g, '""')}"`,
        `"${(item.dni || '').replace(/"/g, '""')}"`,
        `"${(item.email || '').replace(/"/g, '""')}"`,
        `"${(item.phone || '').replace(/"/g, '""')}"`,
        `"${(item.created_at || '').replace(/"/g, '""')}"`,
        `"${bidsStr.replace(/"/g, '""')}"`,
      ].join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `acreditaciones-insignia-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    loadData();
    const handleDataChange = () => loadData();
    window.addEventListener('insignia-data-change', handleDataChange);
    return () => window.removeEventListener('insignia-data-change', handleDataChange);
  }, []);

  const loadData = async () => {
    setLots(getLots());
    // Las pujas se arman solo desde el servidor (así un reinicio no "revive" copias locales viejas)
    let currentPreoffers = {};

    // Sincronizar pujas completas desde la base de datos backend
    try {
      const remoteBids = await apiGetBids();
      if (Array.isArray(remoteBids) && remoteBids.length > 0) {
        for (const b of remoteBids) {
          const lotId = b.lot_id;
          if (!currentPreoffers[lotId]) {
            currentPreoffers[lotId] = {
              highestBid: b.amount,
              bidderName: b.name,
              bidderPhone: b.phone,
              bidderEmail: b.email,
              bidderDni: b.dni,
              date: b.created_at,
              bidders: [],
            };
          }
          const exists = currentPreoffers[lotId].bidders?.some(
            (x) => x.date === b.created_at && x.bid === b.amount
          );
          if (!exists) {
            const bidderObj = {
              name: b.name,
              phone: b.phone,
              email: b.email,
              dni: b.dni,
              bid: b.amount,
              date: b.created_at,
            };
            currentPreoffers[lotId].bidders = [bidderObj, ...(currentPreoffers[lotId].bidders || [])];
            if (b.amount >= (currentPreoffers[lotId].highestBid || 0)) {
              currentPreoffers[lotId].highestBid = b.amount;
              currentPreoffers[lotId].bidderName = b.name;
              currentPreoffers[lotId].bidderPhone = b.phone;
              currentPreoffers[lotId].bidderEmail = b.email;
              currentPreoffers[lotId].bidderDni = b.dni;
              currentPreoffers[lotId].date = b.created_at;
            }
          }
        }
        localStorage.setItem('insignia_preoffers_v1', JSON.stringify(currentPreoffers));
      }
    } catch (_) {}

    setPreoffers(currentPreoffers);
  };

  // Obtener la lista completa de ofertantes para un lote
  const getLotBidders = (lotId) => {
    const data = preoffers[lotId];
    if (!data) return [];
    if (Array.isArray(data.bidders) && data.bidders.length > 0) {
      return data.bidders;
    }
    if (data.bidderName) {
      return [
        {
          name: data.bidderName,
          email: data.bidderEmail || '',
          dni: data.bidderDni || '',
          phone: data.bidderPhone || '',
          bid: data.highestBid,
          date: data.date || '',
        },
      ];
    }
    return [];
  };

  const filteredLots = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return lots;
    return lots.filter((l) =>
      (l.lote && l.lote.toLowerCase().includes(q)) ||
      (l.title && l.title.toLowerCase().includes(q)) ||
      (l.artist && l.artist.toLowerCase().includes(q)) ||
      (l.technique && l.technique.toLowerCase().includes(q))
    );
  }, [lots, search]);

  const handleOpenNew = () => {
    const nextNum = lots.length > 0 ? Math.max(...lots.map((l) => Number(l.id) || 0)) + 1 : 1;
    const formattedNum = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;
    setFormData({
      id: nextNum,
      lote: `Lote #${formattedNum}`,
      title: '',
      artist: '',
      technique: '',
      dimensions: '',
      year: new Date().getFullYear().toString(),
      basePrice: '$USD 500',
      priceValue: 500,
      image: '',
    });
    setImagePreview('');
    setEditingLot('new');
  };

  const handleOpenEdit = (lot) => {
    setFormData({
      id: lot.id,
      lote: lot.lote || `Lote #${lot.id}`,
      title: lot.title || '',
      artist: lot.artist || '',
      technique: lot.technique || '',
      dimensions: lot.dimensions || '',
      year: lot.year || '',
      basePrice: lot.basePrice || '$USD 0',
      priceValue: lot.priceValue || 0,
      image: lot.image || '',
    });
    setImagePreview(lot.image || '');
    setEditingLot(lot);
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (.jpg, .png, .webp).');
      return;
    }

    try {
      setIsUploading(true);
      const uploadedUrl = await apiUploadImage(file);
      setImagePreview(uploadedUrl);
      setFormData((prev) => ({ ...prev, image: uploadedUrl }));
    } catch (err) {
      alert('Error al procesar la imagen: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.artist.trim()) {
      alert('El título y el artista son obligatorios.');
      return;
    }

    // Parsear precio numérico
    let numPrice = parseFloat(formData.priceValue);
    if (!numPrice || isNaN(numPrice)) {
      const match = formData.basePrice.replace(/\./g, '').match(/\d+/);
      numPrice = match ? parseInt(match[0], 10) : 0;
    }

    const updatedLot = {
      ...formData,
      priceValue: numPrice,
      image: formData.image || imagePreview || '/img/subastas/lote-01.jpg',
    };

    let updatedLots = [];
    if (editingLot === 'new') {
      updatedLots = [updatedLot, ...lots];
      onNotify('Lote creado correctamente en el catálogo');
    } else {
      updatedLots = lots.map((l) => (l.id === editingLot.id ? updatedLot : l));
      onNotify('Lote actualizado correctamente');
    }

    saveLots(updatedLots);
    setLots(updatedLots);
    setEditingLot(null);
  };

  const handleDelete = (id) => {
    const updated = lots.filter((l) => l.id !== id);
    saveLots(updated);
    setLots(updated);
    setDeleteConfirmId(null);
    onNotify('Lote eliminado del catálogo');
  };

  const handleResetPreoffers = async (lotId) => {
    if (!window.confirm('¿Reiniciar las preofertas de este lote a su precio base?')) return;
    try {
      const ok = await apiResetLotBids(lotId);
      if (!ok) {
        onNotify('No se pudieron reiniciar las preofertas en el servidor. Volvé a iniciar sesión e intentá de nuevo.');
        return;
      }
      const current = { ...preoffers };
      delete current[lotId];
      localStorage.setItem('insignia_preoffers_v1', JSON.stringify(current));
      setPreoffers(current);
      if (viewingBiddersLot && viewingBiddersLot.id === lotId) {
        setViewingBiddersLot(null);
      }
      onNotify('Preofertas reiniciadas para este lote');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de cabecera de la sección */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 bg-[var(--ink-2)]/50 p-5 sm:p-6 rounded-xl border border-[var(--line-soft)] shadow-sm">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-xl md:text-2xl font-serif text-[var(--ivory)] font-normal flex items-center gap-2">
              <Gavel className="w-5 h-5 text-[var(--gold)]" />
              Catálogo de Subastas & Lotes
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--ink-3)] text-[var(--ivory-dim)] font-mono font-medium border border-[var(--line-soft)]">
              {lots.length} lotes
            </span>
          </div>

          <p className="text-xs md:text-sm text-[var(--ivory-dim)]">
            Administra las obras que se exhiben en el catálogo de subasta pública.
          </p>

          {/* Plazo de cierre destacado y de sólo lectura */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-2 bg-[var(--ink-1)]/85 border border-[var(--gold)]/35 rounded-lg shadow-xs select-text">
            <Clock size={16} className="text-[var(--gold)] shrink-0" />
            <span className="text-xs uppercase tracking-wider font-semibold text-[var(--gold)]">
              Cierre:
            </span>
            <span className="text-xs sm:text-sm font-medium text-[var(--gold-hi)]">
              {formatDeadlineText(deadline)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
          <button
            type="button"
            onClick={handleOpenAccreditations}
            className="btn-ghost text-xs py-2.5 px-3.5 rounded flex items-center justify-center gap-2 border-[var(--line)] hover:border-[var(--gold)]"
            title="Ver visitantes acreditados para subastas"
          >
            <Users size={15} className="text-[var(--gold)]" />
            <span>Acreditaciones</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTempDeadline(deadline);
              setIsDeadlineModalOpen(true);
            }}
            className="btn-ghost text-xs py-2.5 px-3.5 rounded flex items-center justify-center gap-2 border-[var(--line)] hover:border-[var(--gold)]"
            title="Cambiar fecha y hora de cierre"
          >
            <Calendar size={15} className="text-[var(--gold)]" />
            <span>Configurar Cierre</span>
          </button>

          <button
            type="button"
            onClick={handleOpenNew}
            className="btn-gold text-xs py-2.5 px-4 rounded flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            <span>Nuevo Lote</span>
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ivory-dim)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar lote por título, artista o número (ej: Lote #04, Lara Ponsone)..."
          className="w-full bg-[var(--ink-2)]/30 border border-[var(--line-soft)] text-sm rounded-lg pl-10 pr-4 py-2.5 text-[var(--ivory)] placeholder-[var(--ivory-dim)]/70 focus:outline-none focus:border-[var(--gold)] transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--ivory-dim)] hover:text-[var(--ivory)]"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Listado de Lotes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLots.map((lot) => {
          const lotPreoffer = preoffers[lot.id];
          const bidders = getLotBidders(lot.id);
          const hasBidders = bidders.length > 0;

          return (
            <div
              key={lot.id}
              className="bg-[var(--ink-2)]/30 border border-[var(--line-soft)] rounded-lg overflow-hidden flex flex-col justify-between hover:border-[var(--line)] transition-all"
            >
              <div>
                {/* Imagen y badges */}
                <div className="relative aspect-[4/3] bg-black/10 overflow-hidden">
                  <img
                    src={lot.image || '/img/subastas/lote-01.jpg'}
                    alt={lot.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/img/subastas/lote-01.jpg';
                    }}
                  />
                  <div className="absolute top-2.5 left-2.5 bg-[var(--ink)]/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-mono font-semibold tracking-wider text-[var(--ivory)] rounded border border-[var(--line-soft)]">
                    {lot.lote || `Lote #${lot.id}`}
                  </div>
                  {lot.year && (
                    <div className="absolute top-2.5 right-2.5 bg-[var(--ink)]/90 backdrop-blur-sm px-2 py-0.5 text-[10px] text-[var(--ivory-dim)] rounded">
                      {lot.year}
                    </div>
                  )}
                </div>

                {/* Detalles de la obra */}
                <div className="p-4 space-y-2.5">
                  <p className="text-[11px] uppercase tracking-wider text-[var(--gold)] font-medium">
                    {lot.artist}
                  </p>
                  <h3 className="font-serif text-lg text-[var(--ivory)] font-medium leading-tight">
                    {lot.title}
                  </h3>
                  <p className="text-xs text-[var(--ivory-dim)] line-clamp-2">
                    {lot.technique} {lot.dimensions ? `· ${lot.dimensions}` : ''}
                  </p>

                  <div className="pt-2 flex items-center justify-between border-t border-[var(--line-soft)]">
                    <div>
                      <span className="text-[10px] uppercase text-[var(--ivory-dim)] block">Precio Base</span>
                      <span className="text-xs font-semibold text-[var(--ivory)]">{lot.basePrice}</span>
                    </div>

                    {lotPreoffer?.highestBid ? (
                      <div className="text-right">
                        <span className="text-[10px] uppercase text-emerald-300 font-semibold block">Última Puja</span>
                        <span className="text-xs font-bold text-emerald-400">
                          $USD {lotPreoffer.highestBid.toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-[var(--ivory-dim)] italic">Sin preofertas</span>
                    )}
                  </div>

                  {/* BOTÓN: VER OFERTANTES DE ESTA OBRA */}
                  <div className="pt-1">
                    <button
                      onClick={() => setViewingBiddersLot(lot)}
                      className={`w-full py-2 px-3 text-xs font-semibold rounded flex items-center justify-center gap-2 transition-all ${
                        hasBidders
                          ? 'bg-emerald-950/40 text-emerald-200 hover:bg-emerald-900/50 hover:text-emerald-100 border border-emerald-500/40 shadow-sm'
                          : 'bg-[var(--ink-2)]/60 text-[var(--ivory-dim)] hover:text-[var(--ivory)] hover:bg-[var(--ink-2)] border border-[var(--line-soft)]'
                      }`}
                    >
                      <Users
                        size={14}
                        className={hasBidders ? 'text-emerald-300' : 'text-[var(--ivory-dim)]'}
                      />
                      <span>
                        {hasBidders
                          ? `Ver Ofertantes (${bidders.length})`
                          : 'Ver Ofertantes (0)'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="p-3 bg-[var(--ink-2)]/60 border-t border-[var(--line-soft)] flex items-center justify-between gap-2">
                {lotPreoffer?.highestBid ? (
                  <button
                    onClick={() => handleResetPreoffers(lot.id)}
                    title="Reiniciar pujas"
                    className="p-1.5 text-amber-400/80 hover:text-amber-300 transition-colors"
                  >
                    <RotateCcw size={15} />
                  </button>
                ) : (
                  <span />
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => handleOpenEdit(lot)}
                    className="btn-ghost text-xs py-1.5 px-3 rounded flex items-center gap-1.5"
                  >
                    <Pencil size={13} />
                    Editar
                  </button>

                  <button
                    onClick={() => setDeleteConfirmId(lot.id)}
                    className="p-2 text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/15 rounded transition-colors"
                    title="Eliminar lote"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredLots.length === 0 && (
        <div className="text-center py-12 border border-dashed border-[var(--line)] rounded-lg bg-[var(--ink-2)]/20">
          <p className="text-sm text-[var(--ivory-dim)]">No se encontraron lotes con el término buscado.</p>
        </div>
      )}

      {/* MODAL: HISTORIAL DE OFERTANTES DE LA OBRA SELECCIONADA */}
      {viewingBiddersLot && (() => {
        const bidders = getLotBidders(viewingBiddersLot.id);
        const highest = preoffers[viewingBiddersLot.id]?.highestBid;

        return (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[var(--ink)] border border-[var(--line)] rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
              {/* Header Modal */}
              <div className="p-5 border-b border-[var(--line-soft)] flex items-center justify-between bg-[var(--ink-2)]/60">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded bg-black/10 overflow-hidden shrink-0 border border-[var(--line-soft)]">
                    <img
                      src={viewingBiddersLot.image || '/img/subastas/lote-01.jpg'}
                      alt={viewingBiddersLot.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-[var(--gold)]/15 text-[var(--gold-hi)] rounded border border-[var(--gold)]/20">
                        {viewingBiddersLot.lote}
                      </span>
                      <h3 className="font-serif text-lg text-[var(--ivory)] font-medium leading-none">
                        {viewingBiddersLot.title}
                      </h3>
                    </div>
                    <p className="text-xs text-[var(--ivory-dim)] mt-0.5">
                      {viewingBiddersLot.artist} · Base: <strong>{viewingBiddersLot.basePrice}</strong>
                      {highest && (
                        <span className="ml-2 text-emerald-400 font-bold">
                          · Mayor puja: $USD {highest.toLocaleString()}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setViewingBiddersLot(null)}
                  className="text-[var(--ivory-dim)] hover:text-[var(--ivory)] p-1 rounded"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Lista de ofertantes */}
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-[var(--gold)] flex items-center gap-1.5">
                    <Users size={15} />
                    Registro de Preofertas ({bidders.length})
                  </h4>

                  {bidders.length > 0 && (
                    <button
                      onClick={() => handleResetPreoffers(viewingBiddersLot.id)}
                      className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
                    >
                      <RotateCcw size={12} />
                      Reiniciar pujas
                    </button>
                  )}
                </div>

                {bidders.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-[var(--line-soft)] rounded-lg bg-[var(--ink-2)]/20 space-y-2">
                    <Users className="w-8 h-8 mx-auto text-[var(--ivory-dim)]/50" />
                    <p className="text-sm font-serif text-[var(--ivory)]">Aún no hay ofertantes registrados</p>
                    <p className="text-xs text-[var(--ivory-dim)] max-w-sm mx-auto">
                      Cuando un usuario complete el formulario de preoferta para este lote en la web, sus datos completos aparecerán aquí.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bidders.map((b, idx) => {
                      const cleanPhone = b.phone ? b.phone.replace(/\D/g, '') : '';
                      const dateStr = b.date
                        ? new Date(b.date).toLocaleString('es-AR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Fecha no registrada';

                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-lg border transition-all ${
                            idx === 0
                              ? 'bg-emerald-950/30 border-emerald-500/40 shadow-sm'
                              : 'bg-[var(--ink-2)]/30 border-[var(--line-soft)]'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--line-soft)]">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-[var(--gold)]/20 text-[var(--gold-hi)] font-bold text-xs flex items-center justify-center">
                                #{idx + 1}
                              </div>
                              <div>
                                <span className="font-semibold text-sm text-[var(--ivory)] block">
                                  {b.name || 'Anónimo'}
                                </span>
                                <span className="text-[11px] text-[var(--ivory-dim)] flex items-center gap-1">
                                  <Clock size={11} />
                                  {dateStr}
                                </span>
                              </div>
                            </div>

                            <div className="sm:text-right">
                              <span className="text-[10px] uppercase tracking-wider text-[var(--ivory-dim)] block">
                                Monto Ofertado
                              </span>
                              <span className="text-base font-bold text-emerald-400">
                                $USD {b.bid ? Number(b.bid).toLocaleString() : '0'}
                              </span>
                            </div>
                          </div>

                          {/* Datos de contacto y verificación */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs">
                            {/* Teléfono y WhatsApp */}
                            <div>
                              <span className="text-[10px] uppercase text-[var(--ivory-dim)] block mb-0.5">
                                Teléfono / WhatsApp
                              </span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-mono text-[var(--ivory)] font-medium">
                                  {b.phone || 'No indicado'}
                                </span>
                                {cleanPhone && (
                                  <a
                                    href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                                      `Hola ${b.name}, te contactamos desde Subastas Insignia por tu preoferta para el lote "${viewingBiddersLot.lote} · ${viewingBiddersLot.title}".`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 text-emerald-300 hover:text-emerald-100 bg-emerald-500/20 hover:bg-emerald-500/30 rounded transition-colors"
                                    title="Escribir por WhatsApp"
                                  >
                                    <MessageCircle size={13} />
                                  </a>
                                )}
                              </div>
                            </div>

                            {/* Email */}
                            <div>
                              <span className="text-[10px] uppercase text-[var(--ivory-dim)] block mb-0.5">
                                Correo Electrónico
                              </span>
                              <div className="flex items-center gap-1">
                                <span className="text-[var(--ivory)] truncate font-medium">
                                  {b.email || 'No indicado'}
                                </span>
                                {b.email && (
                                  <a
                                    href={`mailto:${b.email}?subject=${encodeURIComponent(
                                      `Subastas Insignia - Preoferta por ${viewingBiddersLot.lote}`
                                    )}`}
                                    className="p-1 text-[var(--gold)] hover:text-black transition-colors"
                                    title="Enviar correo"
                                  >
                                    <Mail size={13} />
                                  </a>
                                )}
                              </div>
                            </div>

                            {/* DNI */}
                            <div>
                              <span className="text-[10px] uppercase text-[var(--ivory-dim)] block mb-0.5">
                                DNI / Documento
                              </span>
                              <span className="font-mono text-[var(--ivory)] font-medium">
                                {b.dni || 'No indicado'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer Modal */}
              <div className="p-4 bg-[var(--ink-2)]/60 border-t border-[var(--line-soft)] flex items-center justify-end">
                <button
                  onClick={() => setViewingBiddersLot(null)}
                  className="btn-gold text-xs py-2 px-5 rounded"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal de Alta / Edición de Lote */}
      {editingLot && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[var(--ink)] border border-[var(--line)] rounded-xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Header modal */}
            <div className="p-5 border-b border-[var(--line-soft)] flex items-center justify-between bg-[var(--ink-2)]/50">
              <h3 className="font-serif text-xl text-[var(--ivory)]">
                {editingLot === 'new' ? 'Agregar Nueva Obra / Lote' : `Editar ${formData.lote || 'Lote'}`}
              </h3>
              <button
                onClick={() => setEditingLot(null)}
                className="text-[var(--ivory-dim)] hover:text-[var(--ivory)] p-1 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ivory-dim)] mb-1">
                    Número de Lote
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lote}
                    onChange={(e) => setFormData({ ...formData, lote: e.target.value })}
                    placeholder="Ej: Lote #01"
                    className="w-full bg-[#3e3e37] border border-[var(--line-soft)] rounded p-2.5 text-[var(--ivory)] focus:border-[var(--gold)] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ivory-dim)] mb-1">
                    Año de Creación
                  </label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="Ej: 2024"
                    className="w-full bg-[#3e3e37] border border-[var(--line-soft)] rounded p-2.5 text-[var(--ivory)] focus:border-[var(--gold)] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ivory-dim)] mb-1">
                  Título de la Obra *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Incontinencia"
                  className="w-full bg-[#3e3e37] border border-[var(--line-soft)] rounded p-2.5 text-[var(--ivory)] focus:border-[var(--gold)] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ivory-dim)] mb-1">
                  Artista / Autor *
                </label>
                <input
                  type="text"
                  required
                  value={formData.artist}
                  onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                  placeholder="Ej: Lara Ponsone"
                  className="w-full bg-[#3e3e37] border border-[var(--line-soft)] rounded p-2.5 text-[var(--ivory)] focus:border-[var(--gold)] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ivory-dim)] mb-1">
                    Técnica y Soporte
                  </label>
                  <input
                    type="text"
                    value={formData.technique}
                    onChange={(e) => setFormData({ ...formData, technique: e.target.value })}
                    placeholder="Ej: Acrílico sobre lienzo"
                    className="w-full bg-[#3e3e37] border border-[var(--line-soft)] rounded p-2.5 text-[var(--ivory)] focus:border-[var(--gold)] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ivory-dim)] mb-1">
                    Medidas
                  </label>
                  <input
                    type="text"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    placeholder="Ej: 180 × 140 cm"
                    className="w-full bg-[#3e3e37] border border-[var(--line-soft)] rounded p-2.5 text-[var(--ivory)] focus:border-[var(--gold)] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ivory-dim)] mb-1">
                    Precio Base Formateado
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    placeholder="Ej: $USD 2.500"
                    className="w-full bg-[#3e3e37] border border-[var(--line-soft)] rounded p-2.5 text-[var(--ivory)] focus:border-[var(--gold)] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ivory-dim)] mb-1">
                    Valor Numérico en $USD (Para validar ofertas)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.priceValue}
                    onChange={(e) => setFormData({ ...formData, priceValue: Number(e.target.value) })}
                    placeholder="Ej: 2500"
                    className="w-full bg-[#3e3e37] border border-[var(--line-soft)] rounded p-2.5 text-[var(--ivory)] focus:border-[var(--gold)] outline-none"
                  />
                </div>
              </div>

              {/* Carga de Imagen */}
              <div className="pt-2 border-t border-[var(--line-soft)] space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ivory-dim)]">
                  Fotografía de la Obra
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Vista previa miniatura */}
                  <div className="w-28 h-28 shrink-0 rounded border border-[var(--line)] bg-black/10 overflow-hidden flex items-center justify-center">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Vista previa" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-[var(--ivory-dim)]/50" />
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    {/* Botón de subida de archivo */}
                    <label className="btn-ghost w-full cursor-pointer flex items-center justify-center gap-2 py-2 text-xs rounded">
                      <Upload size={14} />
                      <span>{isUploading ? 'Procesando imagen...' : 'Subir imagen desde la computadora'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>

                    <div className="text-[11px] text-[var(--ivory-dim)] text-center">ó especificar URL / ruta interna:</div>

                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => {
                        setFormData({ ...formData, image: e.target.value });
                        setImagePreview(e.target.value);
                      }}
                      placeholder="Ej: /img/subastas/lote-01.jpg o https://..."
                      className="w-full bg-[#3e3e37] border border-[var(--line-soft)] rounded p-2 text-xs text-[var(--ivory)] focus:border-[var(--gold)] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Botones de acción del formulario */}
              <div className="pt-4 border-t border-[var(--line-soft)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingLot(null)}
                  className="btn-ghost text-xs py-2 px-4 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-gold text-xs py-2 px-5 rounded"
                >
                  Guardar Lote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--ink)] border border-[var(--line)] rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-serif text-lg text-[var(--ivory)] font-medium">¿Eliminar este lote?</h3>
            <p className="text-xs text-[var(--ivory-dim)] leading-relaxed">
              Esta acción quitará la obra del catálogo público. Podrás volver a agregarla o restaurar el catálogo predeterminado cuando lo desees.
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
      {/* Modal para configurar fecha y hora de cierre */}
      {isDeadlineModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--ink-3)] border border-[var(--line)] rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--line-soft)] pb-3">
              <h3 className="font-serif text-xl text-[var(--ivory)] font-medium flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[var(--gold)]" />
                Fecha y Hora de Cierre
              </h3>
              <button
                type="button"
                onClick={() => setIsDeadlineModalOpen(false)}
                className="text-[var(--ivory-dim)] hover:text-[var(--ivory)] p-1 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[var(--ivory-dim)] leading-relaxed">
              Seleccioná la fecha y hora exacta en que finalizará la subasta. La cuenta regresiva del sitio público y los avisos informativos se actualizarán en tiempo real.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--gold)] block">
                Fecha y Hora de Finalización
              </label>
              <input
                type="datetime-local"
                value={tempDeadline}
                onChange={(e) => setTempDeadline(e.target.value)}
                className="w-full bg-[var(--ink-2)] border border-[var(--line)] rounded-lg p-3 text-sm text-[var(--ivory)] font-mono focus:outline-none focus:border-[var(--gold)]"
              />
            </div>

            <div className="p-3.5 bg-[var(--ink-2)]/70 border border-[var(--line-soft)] rounded-lg space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--gold)] font-bold block">
                Vista Previa en el Sitio
              </span>
              <p className="text-xs text-[var(--ivory)] font-medium">
                "{formatDeadlineText(tempDeadline)}"
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeadlineModalOpen(false)}
                className="btn-ghost text-xs py-2 px-4 rounded"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  saveDeadline(tempDeadline);
                  setDeadline(tempDeadline);
                  setIsDeadlineModalOpen(false);
                  if (onNotify) onNotify('Fecha de cierre de subasta actualizada');
                }}
                className="btn-gold text-xs py-2 px-5 rounded flex items-center gap-2"
              >
                <CheckCircle2 size={15} />
                Guardar Cierre
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal para ver registro de acreditaciones de postulantes */}
      {isAccreditationsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className="bg-[var(--ink-3)] border border-[var(--line)] rounded-xl max-w-6xl w-full p-6 space-y-5 shadow-2xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[var(--line-soft)] pb-3">
              <div>
                <h3 className="font-serif text-xl text-[var(--ivory)] font-medium flex items-center gap-2">
                  <Users className="w-5 h-5 text-[var(--gold)]" />
                  Visitantes Acreditados para Subastas
                </h3>
                <p className="text-xs text-[var(--ivory-dim)] mt-0.5">
                  Registro de usuarios acreditados y seguimiento de las obras en las que han postulado preofertas.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAccreditationsModalOpen(false)}
                className="text-[var(--ivory-dim)] hover:text-[var(--ivory)] p-1 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pr-1 space-y-3">
              {loadingAccreditations ? (
                <div className="py-12 text-center text-xs text-[var(--ivory-dim)]">
                  Cargando acreditaciones desde el servidor...
                </div>
              ) : accreditationsList.length === 0 ? (
                <div className="py-12 text-center border border-[var(--line-soft)] rounded-lg bg-[var(--ink-2)]/40 p-6">
                  <Users className="w-10 h-10 text-[var(--ivory-dim)]/40 mx-auto mb-2" />
                  <p className="text-sm text-[var(--ivory)] font-medium">Aún no hay acreditaciones registradas</p>
                  <p className="text-xs text-[var(--ivory-dim)] mt-1">
                    Los visitantes que ingresen sus datos aparecerán listados aquí en tiempo real.
                  </p>
                </div>
              ) : (
                <div className="border border-[var(--line-soft)] rounded-lg overflow-x-auto lg:overflow-x-visible">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[var(--ink-2)] border-b border-[var(--line-soft)] text-[var(--gold)] font-mono uppercase tracking-wider text-[11px]">
                        <th className="p-3">Nombre y Apellido</th>
                        <th className="p-3">DNI</th>
                        <th className="p-3">Contacto</th>
                        <th className="p-3">Obras / Preofertas</th>
                        <th className="p-3">Fecha</th>
                        <th className="p-3 text-center w-16">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--line-soft)]">
                      {accreditationsList.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-[var(--ink-2)]/50 transition-colors align-top">
                          <td className="p-3 font-medium text-[var(--ivory)]">
                            {item.name}
                          </td>
                          <td className="p-3 font-mono text-[var(--gold-hi)] font-semibold whitespace-nowrap">
                            {item.dni}
                          </td>
                          <td className="p-3 space-y-1">
                            <div className="flex items-center gap-1.5 text-[var(--ivory)]">
                              <Mail size={12} className="text-[var(--gold)] shrink-0" />
                              <a href={`mailto:${item.email}`} className="hover:underline truncate max-w-[170px]" title={item.email}>
                                {item.email}
                              </a>
                            </div>
                            <div className="flex items-center gap-1.5 text-[var(--ivory-dim)]">
                              <Phone size={12} className="text-[var(--gold)] shrink-0" />
                              <a
                                href={`https://wa.me/${String(item.phone || '').replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:text-[var(--gold-hi)]"
                              >
                                {item.phone}
                              </a>
                            </div>
                          </td>
                          <td className="p-3 min-w-[200px]">
                            {item.bids && item.bids.length > 0 ? (
                              <div className="space-y-1.5">
                                {item.bids.map((b, bIdx) => (
                                  <div
                                    key={bIdx}
                                    className="p-1.5 rounded bg-[var(--ink-1)]/90 border border-[var(--gold)]/35 text-[11px]"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-semibold text-[var(--gold-hi)] font-mono">
                                        {b.lotNumber}
                                      </span>
                                      <span className="font-mono font-bold text-white">
                                        $USD {Number(b.amount).toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-[var(--ivory-dim)] truncate mt-0.5" title={b.title}>
                                      {b.title} {b.artist ? `— ${b.artist}` : ''}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-[var(--ink-2)] text-[var(--ivory-dim)] border border-[var(--line-soft)]">
                                Solo acreditado (sin pujas aún)
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-mono text-[var(--ivory-dim)] text-[11px] whitespace-nowrap">
                            {item.created_at ? new Date(item.created_at).toLocaleString() : '—'}
                          </td>
                          <td className="p-3 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleDeleteAccreditation(item.id, item.name)}
                              className="p-2 rounded text-[var(--ivory-dim)] hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-500/30 transition-colors inline-flex items-center justify-center"
                              title={`Eliminar acreditación de ${item.name}`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[var(--line-soft)] pt-3.5">
              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--ivory-dim)] font-mono">
                  Total acreditados: <strong className="text-[var(--gold-hi)]">{accreditationsList.length}</strong>
                </span>

                {accreditationsList.length > 0 && (
                  <button
                    type="button"
                    onClick={exportAccreditationsCSV}
                    className="text-[11px] text-[var(--gold-hi)] hover:underline flex items-center gap-1 font-mono"
                    title="Descargar lista de contactos en archivo CSV (Excel)"
                  >
                    <Download size={13} />
                    <span>Descargar CSV</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleResetAllAccreditations}
                  disabled={accreditationsList.length === 0}
                  className="px-3 py-2 rounded text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-500/30 transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Reiniciar todas las acreditaciones para que todos los usuarios deban registrarse de nuevo"
                >
                  <RotateCcw size={13} />
                  <span>Reiniciar Acreditaciones</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAccreditationsModalOpen(false)}
                  className="btn-gold text-xs py-2 px-5 rounded"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
