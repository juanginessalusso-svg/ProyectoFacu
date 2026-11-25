import { LOTS as DEFAULT_LOTS } from '../data/subastas';
import { IMAGES, HOME_DEFAULTS } from '../data/content';

export const STORAGE_KEYS = {
  LOTS: 'insignia_admin_lots_v4',
  EVENTS: 'insignia_admin_events_v4',
  GALLERY: 'insignia_admin_gallery_v3',
  PIN: 'insignia_admin_pin_v3',
  DEADLINE: 'insignia_admin_deadline_v3',
  GALLERY_INTRO: 'insignia_admin_gallery_intro_v1',
  HOME: 'insignia_admin_home_v1',
  TOKEN: 'insignia_admin_token',
};

export const DEFAULT_DEADLINE = '2026-12-02T00:00';

export const DEFAULT_GALLERY = [
  {
    id: 'gal-1',
    src: IMAGES.galeriaPublico,
    cap: 'Concurrencia en la subasta · Alberdi 355',
    cls: 'lg:col-span-8',
    h: 'h-[360px] md:h-[440px]',
  },
  {
    id: 'gal-2',
    src: IMAGES.galeriaDisertante,
    cap: 'Presentación en podio',
    cls: 'lg:col-span-4',
    h: 'h-[360px] md:h-[440px]',
  },
  {
    id: 'gal-3',
    src: IMAGES.galeriaMuroCalido,
    cap: 'Exhibición de obras bajo iluminación de sala',
    cls: 'lg:col-span-12',
    h: 'h-[280px] md:h-[420px]',
  },
  {
    id: 'gal-4',
    src: IMAGES.galeriaApreciacion,
    cap: 'Apreciación de piezas en sala',
    cls: 'lg:col-span-4',
    h: 'h-[300px] md:h-[380px]',
  },
  {
    id: 'gal-5',
    src: IMAGES.galeriaMarcoDorado,
    cap: 'Obra enmarcada de la colección',
    cls: 'lg:col-span-4',
    h: 'h-[300px] md:h-[380px]',
  },
  {
    id: 'gal-6',
    src: IMAGES.galeriaMontaje,
    cap: 'Montaje de piezas en sala y caballete',
    cls: 'lg:col-span-4',
    h: 'h-[300px] md:h-[380px]',
  },
  {
    id: 'gal-7',
    src: IMAGES.galeriaCaballete,
    cap: 'Obra sobre caballete en sala',
    cls: 'lg:col-span-6',
    h: 'h-[320px] md:h-[400px]',
  },
  {
    id: 'gal-8',
    src: IMAGES.galeriaObrasMuro,
    cap: 'Muro de obras de la colección',
    cls: 'lg:col-span-6',
    h: 'h-[320px] md:h-[400px]',
  },
];

export const DEFAULT_EVENTS = [
  {
    id: 'ev-inaugural-subastas',
    title: 'Evento Inaugural de Subastas Insignia',
    date: '8 de Mayo de 2026',
    time: '20:00 hs',
    location: 'Galería Alberdi 355 · Río Cuarto',
    category: 'Subasta Presencial',
    status: 'Realizado',
    isUpcoming: false,
    description:
      'Gran apertura y subasta inaugural en sala. Una velada emblemática que reunió a coleccionistas, artistas y referentes del arte en Río Cuarto, con un catálogo excepcional de obras de grandes maestros y contemporáneos bajo martillo en vivo.',
    image: '/img/eventos/mayo-2026/evento-mayo-01.jpg',
    images: [
      '/img/eventos/mayo-2026/evento-mayo-01.jpg',
      '/img/eventos/mayo-2026/evento-mayo-02.jpg',
      '/img/eventos/mayo-2026/evento-mayo-03.jpg',
      '/img/eventos/mayo-2026/evento-mayo-04.jpg',
      '/img/eventos/mayo-2026/evento-mayo-05.jpg',
      '/img/eventos/mayo-2026/evento-mayo-06.jpg',
      '/img/eventos/mayo-2026/evento-mayo-07.jpg',
      '/img/eventos/mayo-2026/evento-mayo-08.jpg',
    ],
  },
  {
    id: 'ev-inaugural-galeria',
    title: 'Evento Inaugural Galería Insignia',
    date: '6 de Noviembre de 2026',
    time: '20:30 hs',
    location: 'Galería Alberdi 355 · Río Cuarto',
    category: 'Inauguración de Galería',
    status: 'Realizado',
    isUpcoming: false,
    description:
      'Presentación oficial del espacio de exhibición y sala de arte de Galería Insignia. Una noche de celebración y muestra colectiva donde dialogaron piezas maestras de nuestra colección con producciones actuales, en una ambientación pensada para el disfrute y la contemplación estética.',
    image: '/img/eventos/noviembre-2026/evento-nov-01.jpg',
    images: [
      '/img/eventos/noviembre-2026/evento-nov-01.jpg',
      '/img/eventos/noviembre-2026/evento-nov-02.jpg',
      '/img/eventos/noviembre-2026/evento-nov-03.jpg',
      '/img/eventos/noviembre-2026/evento-nov-04.jpg',
      '/img/eventos/noviembre-2026/evento-nov-05.jpg',
      '/img/eventos/noviembre-2026/evento-nov-06.jpg',
      '/img/eventos/noviembre-2026/evento-nov-07.jpg',
      '/img/eventos/noviembre-2026/evento-nov-08.jpg',
    ],
  },
  {
    id: 'ev-proximo-diciembre',
    title: 'Gran Subasta de Cierre de Año & Brindis de Gala',
    date: '6 de Diciembre de 2026',
    time: '19:30 hs',
    location: 'Galería Alberdi 355 · Río Cuarto',
    category: 'Subasta Presencial',
    status: 'Próximo',
    isUpcoming: true,
    description:
      'Cierre de la temporada oficial 2026 con subasta presencial en sala. Puja en vivo de los lotes seleccionados de nuestra colección, recepción con copa de bienvenida y degustación de vinos de autor para coleccionistas e invitados especiales.',
    image: '/img/subasta-evento.jpg',
    images: ['/img/subasta-evento.jpg'],
  },
];

// Base de la API (en prod usa /api en el mismo dominio, en local apunta a localhost:4800/api)
export const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Helper para emitir cambios en vivo a todos los componentes React
export function notifyChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('insignia-data-change'));
  }
}

// Convertir archivo a DataURL Base64 para vistas previas instantáneas
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

// Formatear texto de fecha límite
export function formatDeadlineText(dateInput) {
  if (!dateInput) return '2 de Diciembre a las 00:00 hs';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '2 de Diciembre a las 00:00 hs';

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dia = d.getDate();
  const mes = meses[d.getMonth()];
  const horas = String(d.getHours()).padStart(2, '0');
  const minutos = String(d.getMinutes()).padStart(2, '0');

  return `${dia} de ${mes} a las ${horas}:${minutos} hs`;
}

// -------------------------------------------------------------
// SINCRONIZACIÓN AUTOMÁTICA CON EL BACKEND (DOCKER)
// -------------------------------------------------------------
let isSyncing = false;
export async function syncFromServer() {
  if (typeof window === 'undefined' || isSyncing) return;
  isSyncing = true;
  try {
    const res = await fetch(`${API_BASE}/data`, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();

    if (data.lots && Array.isArray(data.lots) && data.lots.length > 0) {
      const normalizedLots = data.lots.map(lot => {
        let img = lot.image || '';
        if (img.startsWith('/img/subastas/') && !img.includes('?v=')) {
          img = `${img}?v=2`;
        }
        return { ...lot, image: img };
      });
      localStorage.setItem(STORAGE_KEYS.LOTS, JSON.stringify(normalizedLots));
    }
    if (data.events && Array.isArray(data.events) && data.events.length > 0) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(data.events));
    }
    if (data.gallery && Array.isArray(data.gallery) && data.gallery.length > 0) {
      localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(data.gallery));
    }
    if (data.deadline) {
      localStorage.setItem(STORAGE_KEYS.DEADLINE, data.deadline);
    }
    if (data.galleryIntro && typeof data.galleryIntro === 'object') {
      localStorage.setItem(STORAGE_KEYS.GALLERY_INTRO, JSON.stringify(data.galleryIntro));
    }
    if (data.home && typeof data.home === 'object') {
      localStorage.setItem(STORAGE_KEYS.HOME, JSON.stringify(data.home));
    }

    // Sincronizar preofertas públicas registradas en la base de datos
    try {
      const bidsRes = await fetch(`${API_BASE}/bids/public`, { cache: 'no-cache' });
      if (bidsRes.ok) {
        const bidsData = await bidsRes.json();
        if (bidsData.preoffers && typeof bidsData.preoffers === 'object') {
          const currentLocal = JSON.parse(localStorage.getItem('insignia_preoffers_v1') || '{}');
          for (const [lotId, info] of Object.entries(bidsData.preoffers)) {
            const loc = currentLocal[lotId];
            if (!loc || info.highestBid > (loc.highestBid || 0)) {
              currentLocal[lotId] = {
                ...(loc || {}),
                highestBid: info.highestBid,
                date: info.date,
              };
            }
          }
          localStorage.setItem('insignia_preoffers_v1', JSON.stringify(currentLocal));
        }
      }
    } catch (_) {}

    notifyChange();
  } catch (err) {
    console.warn('[Sync] Backend no disponible aún, usando datos locales:', err.message);
  } finally {
    isSyncing = false;
  }
}

// Ejecutar sincronización al cargar el script en el navegador
if (typeof window !== 'undefined') {
  setTimeout(() => {
    syncFromServer();
  }, 100);
}

// Helper para obtener token de autorización
export function getAuthHeader() {
  const token = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.TOKEN) : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// --- FECHA LÍMITE ---
export function getDeadline() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DEADLINE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DEADLINE, DEFAULT_DEADLINE);
      return DEFAULT_DEADLINE;
    }
    return raw;
  } catch (err) {
    return DEFAULT_DEADLINE;
  }
}

export function saveDeadline(dateString) {
  try {
    localStorage.setItem(STORAGE_KEYS.DEADLINE, dateString);
    notifyChange();

    fetch(`${API_BASE}/deadline`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ deadline: dateString }),
    }).catch(err => console.warn('[Backend] Error guardando deadline:', err));

    return true;
  } catch (err) {
    console.error('Error al guardar fecha de cierre:', err);
    return false;
  }
}

// --- TEXTO INTRODUCTORIO DE LA GALERÍA ---
export function getGalleryIntro() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GALLERY_INTRO);
    const parsed = raw ? JSON.parse(raw) : null;
    return {
      title: (parsed && parsed.title) || '',
      text: (parsed && parsed.text) || '',
    };
  } catch (err) {
    return { title: '', text: '' };
  }
}

export async function saveGalleryIntro(intro) {
  const clean = { title: intro.title || '', text: intro.text || '' };
  localStorage.setItem(STORAGE_KEYS.GALLERY_INTRO, JSON.stringify(clean));
  notifyChange();
  const res = await fetch(`${API_BASE}/gallery-intro`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(clean),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return true;
}

// --- CONTENIDO DE LA PÁGINA DE INICIO ---
export function getHome() {
  let saved = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HOME);
    saved = raw ? JSON.parse(raw) : null;
  } catch (err) {
    saved = null;
  }
  const d = HOME_DEFAULTS;
  const s = saved || {};
  const pick = (v, fallback) => (typeof v === 'string' && v.trim() ? v : fallback);
  return {
    heroTitle: pick(s.heroTitle, d.heroTitle),
    heroSlides: Array.isArray(s.heroSlides) && s.heroSlides.length > 0 ? s.heroSlides : d.heroSlides,
    artistsTitle: pick(s.artistsTitle, d.artistsTitle),
    artistsIntro: pick(s.artistsIntro, d.artistsIntro),
    servicesTitle: pick(s.servicesTitle, d.servicesTitle),
    services: d.services.map((def, i) => {
      const o = Array.isArray(s.services) ? s.services[i] || {} : {};
      return {
        title: pick(o.title, def.title),
        text: pick(o.text, def.text),
        image: pick(o.image, def.image),
        alt: def.alt,
      };
    }),
  };
}

export async function saveHome(home) {
  localStorage.setItem(STORAGE_KEYS.HOME, JSON.stringify(home));
  notifyChange();
  const res = await fetch(`${API_BASE}/home`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(home),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return true;
}

// --- RESERVAS DE ASISTENCIA A EVENTOS ---
export async function apiSubmitReservation(payload) {
  try {
    const res = await fetch(`${API_BASE}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, error: data.error || 'No se pudo enviar la solicitud' };
    return { success: true };
  } catch (err) {
    return { success: false, isOffline: true, error: 'No pudimos conectar con el servidor' };
  }
}

export async function apiGetReservations() {
  try {
    const res = await fetch(`${API_BASE}/reservations`, { headers: { ...getAuthHeader() } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.reservations || [];
  } catch (err) {
    return null;
  }
}

export async function apiDeleteReservation(id) {
  try {
    const res = await fetch(`${API_BASE}/reservations/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

// --- SUBASTAS (LOTES) ---
export function getLots() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOTS);
    const source = raw ? JSON.parse(raw) : DEFAULT_LOTS;
    if (Array.isArray(source) && source.length > 0) {
      let needsSave = !raw;
      const normalized = source.map(lot => {
        let img = lot.image || '';
        if (img.startsWith('/img/subastas/') && !img.includes('?v=')) {
          img = `${img}?v=2`;
          needsSave = true;
        }
        let basePrice = lot.basePrice;
        if (basePrice && basePrice.includes('U$S')) {
          basePrice = basePrice.replace(/U\$S/g, '$USD');
          needsSave = true;
        }
        return { ...lot, image: img, basePrice };
      });
      if (needsSave) {
        localStorage.setItem(STORAGE_KEYS.LOTS, JSON.stringify(normalized));
      }
      return normalized;
    }
    return DEFAULT_LOTS;
  } catch (err) {
    return DEFAULT_LOTS;
  }
}

export function saveLots(lots) {
  try {
    localStorage.setItem(STORAGE_KEYS.LOTS, JSON.stringify(lots));
    notifyChange();

    fetch(`${API_BASE}/lots`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(lots),
    }).catch(err => console.warn('[Backend] Error guardando lotes:', err));

    return true;
  } catch (err) {
    console.error('Error al guardar subastas:', err);
    return false;
  }
}

// --- EVENTOS ---
export function getEvents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(DEFAULT_EVENTS));
      return DEFAULT_EVENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Asegurarse de que cada evento tenga campo images array
      return parsed.map(ev => ({
        ...ev,
        images: Array.isArray(ev.images) && ev.images.length > 0 ? ev.images : (ev.image ? [ev.image] : []),
      }));
    }
    // Si estaba guardado como un array vacío pero tenemos DEFAULT_EVENTS, repoblar
    if (DEFAULT_EVENTS.length > 0) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(DEFAULT_EVENTS));
      return DEFAULT_EVENTS;
    }
    return DEFAULT_EVENTS;
  } catch (err) {
    return DEFAULT_EVENTS;
  }
}

export function saveEvents(events) {
  try {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    notifyChange();

    fetch(`${API_BASE}/events`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(events),
    }).catch(err => console.warn('[Backend] Error guardando eventos:', err));

    return true;
  } catch (err) {
    console.error('Error al guardar eventos:', err);
    return false;
  }
}

// --- GALERÍA (FOTOGRAMAS) ---
export function getGalleryPhotos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GALLERY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(DEFAULT_GALLERY));
      return DEFAULT_GALLERY;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_GALLERY;
  } catch (err) {
    return DEFAULT_GALLERY;
  }
}

export function saveGalleryPhotos(photos) {
  try {
    localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(photos));
    notifyChange();

    fetch(`${API_BASE}/gallery`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(photos),
    }).catch(err => console.warn('[Backend] Error guardando galería:', err));

    return true;
  } catch (err) {
    console.error('Error al guardar galería:', err);
    return false;
  }
}

// Subida de imagen al servidor
export async function apiUploadImage(file) {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al subir la imagen al servidor');
    }
    return data.url;
  } catch (err) {
    console.warn('[Upload] No se pudo subir imagen al backend, usando compresión DataURL:', err.message);
    return await fileToDataUrl(file);
  }
}

// Subida de múltiples imágenes
export async function apiUploadMultipleImages(files, onProgress) {
  const uploadedUrls = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (onProgress) onProgress(i + 1, files.length);
    const url = await apiUploadImage(file);
    if (url) uploadedUrls.push(url);
  }
  return uploadedUrls;
}

// Enviar preoferta al backend (persistida en SQLite)
export async function apiSubmitBid({ lotId, name, phone, email, dni, amount }) {
  try {
    const res = await fetch(`${API_BASE}/bids`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lotId, name, phone, email, dni, amount }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Error al registrar la preoferta' };
    }
    return { success: true, updatedLot: data.updatedLot, bid: data.bid };
  } catch (err) {
    console.warn('[Bid] Backend fuera de línea para preoferta:', err.message);
    return { success: false, isOffline: true };
  }
}

// Obtener todas las ofertas históricas para el Administrador
export async function apiGetBids() {
  try {
    const res = await fetch(`${API_BASE}/bids`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.bids) ? data.bids : [];
  } catch (err) {
    console.warn('[Bids] No se pudieron obtener ofertas del backend:', err);
    return [];
  }
}

// Registrar acreditación de visitante para el catálogo de subastas
export async function apiRegisterAccreditation({ name, dni, email, phone, auctionDeadline }) {
  try {
    const res = await fetch(`${API_BASE}/accreditations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, dni, email, phone, auctionDeadline }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Error al registrar acreditación' };
    }
    return { success: true };
  } catch (err) {
    console.warn('[Accreditation] Backend fuera de línea para acreditación:', err.message);
    return { success: false, isOffline: true };
  }
}

// Obtener todas las acreditaciones para el Administrador
export async function apiGetAccreditations() {
  try {
    const res = await fetch(`${API_BASE}/accreditations`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.accreditations) ? data.accreditations : [];
  } catch (err) {
    console.warn('[Accreditations] Error consultando acreditaciones:', err);
    return [];
  }
}

// Eliminar una acreditación específica (Administrador)
export async function apiDeleteAccreditation(id) {
  try {
    const res = await fetch(`${API_BASE}/accreditations/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return res.ok;
  } catch (err) {
    console.warn('[Accreditations] Error al eliminar acreditación:', err);
    return false;
  }
}

// Reiniciar todas las acreditaciones para una nueva subasta (Administrador)
export async function apiResetAllAccreditations() {
  try {
    const res = await fetch(`${API_BASE}/accreditations/reset`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    return res.ok;
  } catch (err) {
    console.warn('[Accreditations] Error al reiniciar acreditaciones:', err);
    return false;
  }
}

// Verificar si una acreditación sigue existiendo en el servidor (Público)
export async function apiCheckAccreditation({ dni, email }) {
  try {
    const params = new URLSearchParams();
    if (dni) params.append('dni', dni);
    if (email) params.append('email', email);
    const res = await fetch(`${API_BASE}/accreditations/check?${params.toString()}`);
    if (!res.ok) return { valid: true };
    return await res.json();
  } catch {
    return { valid: true };
  }
}

// Login en el backend
export async function apiLogin(passwordOrPin) {
  const localPin = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.PIN) : null;
  const isDefaultPin = String(passwordOrPin).trim() === '2026' || String(passwordOrPin).trim() === 'Insignia2026!';
  const isStoredPin = localPin && String(passwordOrPin).trim() === localPin;

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: passwordOrPin, pin: passwordOrPin }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Credenciales incorrectas' };
    }

    if (data.token && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
      sessionStorage.setItem('insignia_admin_logged', 'true');
    }

    return { success: true, token: data.token };
  } catch (err) {
    if (isDefaultPin || isStoredPin) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('insignia_admin_logged', 'true');
      }
      return { success: true, isLocalFallback: true };
    }
    return { success: false, error: 'No se pudo conectar con el backend.' };
  }
}

// Logout
export function apiLogout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    sessionStorage.removeItem('insignia_admin_logged');
  }
}

// Cambio de contraseña
export async function apiChangePassword(currentPassword, newPassword) {
  try {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Error al cambiar contraseña' };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: 'No se pudo conectar con el servidor.' };
  }
}


// --- RESTAURAR VALORES POR DEFECTO ---
export function resetAllToDefaults() {
  try {
    localStorage.setItem(STORAGE_KEYS.LOTS, JSON.stringify(DEFAULT_LOTS));
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(DEFAULT_EVENTS));
    localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(DEFAULT_GALLERY));
    localStorage.setItem(STORAGE_KEYS.DEADLINE, DEFAULT_DEADLINE);
    notifyChange();

    saveLots(DEFAULT_LOTS);
    saveEvents(DEFAULT_EVENTS);
    saveGalleryPhotos(DEFAULT_GALLERY);
    saveDeadline(DEFAULT_DEADLINE);

    return true;
  } catch (err) {
    console.error('Error al restablecer datos:', err);
    return false;
  }
}

// --- EXPORTAR / IMPORTAR BACKUP ---
export function exportAllData() {
  return {
    lots: getLots(),
    events: getEvents(),
    gallery: getGalleryPhotos(),
    deadline: getDeadline(),
    exportedAt: new Date().toISOString(),
  };
}

export function importAllData(data) {
  try {
    if (data.lots && Array.isArray(data.lots)) saveLots(data.lots);
    if (data.events && Array.isArray(data.events)) saveEvents(data.events);
    if (data.gallery && Array.isArray(data.gallery)) saveGalleryPhotos(data.gallery);
    if (data.deadline && typeof data.deadline === 'string') saveDeadline(data.deadline);
    notifyChange();
    return true;
  } catch (err) {
    console.error('Error al importar datos:', err);
    return false;
  }
}
