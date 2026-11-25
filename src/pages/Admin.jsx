import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Gavel,
  Calendar,
  Images,
  Home,
  CalendarCheck,
  Database,
  Lock,
  Unlock,
  KeyRound,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ShieldCheck,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import AdminSubastas from './admin/AdminSubastas';
import AdminEventos from './admin/AdminEventos';
import AdminGaleria from './admin/AdminGaleria';
import AdminInicio from './admin/AdminInicio';
import AdminReservas from './admin/AdminReservas';
import BrandLogo, { InsigniaWordmark } from '../components/BrandLogo';
import {
  resetAllToDefaults,
  exportAllData,
  importAllData,
  STORAGE_KEYS,
  apiLogin,
  apiLogout,
  apiChangePassword
} from '../lib/storage';

export default function Admin() {
  // Estado de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('insignia_admin_logged') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Estados para cambio de contraseña
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passChangeStatus, setPassChangeStatus] = useState(null);
  const [passLoading, setPassLoading] = useState(false);

  // Pestaña activa: 'inicio' | 'subastas' | 'eventos' | 'reservas' | 'galeria' | 'backup'
  const [activeTab, setActiveTab] = useState('inicio');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mensaje flotante de notificación (toast)
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    document.title = 'Panel de Administración · Subastas Insignia';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const metaRobots = document.querySelector('meta[name="robots"]');
    const prevRobots = metaRobots?.getAttribute('content') || 'index, follow';
    if (metaRobots) {
      metaRobots.setAttribute('content', 'noindex, nofollow');
    }
    return () => {
      if (metaRobots) metaRobots.setAttribute('content', prevRobots);
    };
  }, [activeTab]);

  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!pinInput.trim()) return;
    setLoginLoading(true);
    setLoginErrorMessage('');
    try {
      const res = await apiLogin(pinInput.trim());
      if (res.success) {
        setIsAuthenticated(true);
        setLoginError(false);
        setPinInput('');
        if (res.isLocalFallback) {
          notify('Ingreso correcto (modo local / backend desconectado)');
        }
      } else {
        setLoginError(true);
        setLoginErrorMessage(res.error || 'Contraseña o PIN incorrecto');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    apiLogout();
    setIsAuthenticated(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPass || !newPass) return;
    setPassLoading(true);
    setPassChangeStatus(null);
    try {
      const res = await apiChangePassword(currentPass, newPass);
      if (res.success) {
        setPassChangeStatus({ type: 'success', text: '¡Contraseña actualizada exitosamente!' });
        setCurrentPass('');
        setNewPass('');
      } else {
        setPassChangeStatus({ type: 'error', text: res.error || 'Error al cambiar contraseña' });
      }
    } finally {
      setPassLoading(false);
    }
  };

  // Exportar copia de seguridad en JSON
  const handleExportBackup = () => {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `insignia_respaldo_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify('Copia de seguridad descargada con éxito');
  };

  // Importar copia de seguridad
  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (window.confirm('¿Deseas restaurar estos datos? Se reemplazarán los registros actuales.')) {
          importAllData(json);
          notify('Datos importados y restaurados correctamente');
        }
      } catch (err) {
        alert('El archivo no es un JSON de respaldo válido.');
      }
    };
    reader.readAsText(file);
  };

  // Restaurar todo al estado inicial
  const handleResetDefaults = () => {
    const confirmed = window.confirm(
      '¿Estás seguro de restaurar todos los datos a los valores iniciales oficiales? Se recuperarán los 23 lotes del PDF y las fotos de inauguración.'
    );
    if (confirmed) {
      resetAllToDefaults();
      notify('Catálogo y contenido restaurados a valores originales');
    }
  };

  // PANTALLA DE ACCESO / LOGIN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--ink)] flex flex-col justify-center items-center px-4 py-12">
        <div className="max-w-md w-full bg-[var(--ink-2)]/60 border border-[var(--line)] rounded-2xl p-8 shadow-2xl backdrop-blur-md">
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex p-3 rounded-full bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/30">
              <Lock size={28} />
            </div>
            <h1 className="font-serif text-2xl md:text-3xl text-[var(--ivory)] font-light">
              Panel de Administración
            </h1>
            <div className="pt-2 pb-1 flex justify-center">
              <BrandLogo className="inline-flex items-baseline justify-center gap-2.5" />
            </div>
            <p className="text-xs text-[var(--ivory-dim)]">
              Ingresa el código PIN de acceso para gestionar obras, eventos y galería.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--ivory-dim)] mb-1.5">
                Contraseña de Administrador
              </label>
              <div className="relative">
                <input
                  type="password"
                  autoFocus
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setLoginError(false);
                    setLoginErrorMessage('');
                  }}
                  placeholder="Introduce la contraseña"
                  className="w-full bg-[#3e3e37] border border-[var(--line)] rounded-lg px-4 py-3 text-center text-lg tracking-widest text-[var(--ivory)] placeholder-[var(--ivory-dim)]/50 focus:border-[var(--gold)] outline-none"
                />
                <KeyRound className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ivory-dim)]" />
              </div>
              {loginError && (
                <p className="text-xs text-rose-400 mt-2 font-medium flex items-center justify-center gap-1 text-center">
                  <AlertTriangle size={13} className="shrink-0" />
                  <span>{loginErrorMessage || 'Contraseña incorrecta'}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="btn-gold w-full text-xs font-semibold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Unlock size={15} />
              {loginLoading ? 'Verificando...' : 'Acceder al Panel'}
            </button>
          </form>

          <div className="mt-8 pt-5 border-t border-[var(--line-soft)] text-center">
            <Link
              to="/"
              className="text-xs text-[var(--ivory-dim)] hover:text-[var(--gold)] transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft size={13} />
              Volver al sitio web público
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // PANEL ADMINISTRATIVO PRINCIPAL
  return (
    <div className="min-h-screen bg-[var(--ink)] text-[var(--ivory)] flex flex-col md:flex-row relative">
      {/* Toast de notificación */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0c0d0a] text-white border border-[#5A5A50] px-5 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-fade-in text-xs font-medium">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Barra superior en Mobile */}
      <header className="md:hidden sticky top-0 z-30 bg-[#0c0d0a] text-white border-b border-white/10 px-4 py-3 flex items-center justify-between shadow-lg">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center gap-1.5 text-xs font-medium"
        >
          {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          <span>{mobileMenuOpen ? 'Cerrar' : 'Menú'}</span>
        </button>

        <div className="flex items-center gap-2.5">
          <Link to="/" className="flex items-baseline gap-1.5 text-white hover:opacity-85 transition-opacity" title="Ir al sitio público">
            <InsigniaWordmark className="h-[20px] w-auto text-white" />
            <span className="italic text-[#e2d7c0] font-serif text-sm">Admin</span>
          </Link>
          <span className="text-[9px] bg-[#5A5A50]/40 text-[#e2d7c0] font-mono px-2 py-0.5 rounded border border-[#5A5A50] uppercase">
            Panel
          </span>
        </div>
      </header>

      {/* Drawer Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Dashboard Vertical (Izquierda) - Color Negro */}
      <aside
        className={`bg-[#0c0d0a] text-white border-r border-white/10 flex flex-col justify-between shrink-0 shadow-2xl transition-transform duration-300 z-50 md:z-20
          ${
            mobileMenuOpen
              ? 'fixed inset-y-0 left-0 w-72 max-w-[85vw] translate-x-0'
              : 'fixed inset-y-0 left-0 w-72 max-w-[85vw] -translate-x-full md:translate-x-0 md:static md:sticky md:top-0 md:h-screen md:w-72 lg:w-80'
          }`}
      >
        {/* Cabecera del Sidebar */}
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-baseline gap-2 text-white hover:opacity-85 transition-opacity" title="Ir al sitio público">
            <InsigniaWordmark className="h-[24px] w-auto text-white" />
            <span className="italic text-[#e2d7c0] font-serif text-base">Admin</span>
          </Link>
          <p className="text-[11px] text-zinc-400 mt-1">
            Galería de Arte · Panel de Control
          </p>
        </div>

        {/* Pestañas de Navegación Verticales */}
        <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 px-3 mb-2">
            Módulos del Sistema
          </div>

          <button
            onClick={() => {
              setActiveTab('inicio');
              setMobileMenuOpen(false);
            }}
            className={`w-full p-3 rounded-xl text-left transition-all flex items-center gap-3.5 ${
              activeTab === 'inicio'
                ? 'bg-[#5A5A50] text-white font-semibold shadow-lg shadow-black/40 ring-1 ring-white/20'
                : 'text-zinc-300 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <div
              className={`p-2 rounded-lg shrink-0 ${
                activeTab === 'inicio' ? 'bg-white/20 text-white' : 'bg-white/5 text-zinc-400'
              }`}
            >
              <Home size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs uppercase tracking-wider font-semibold">Inicio</div>
              <div
                className={`text-[11px] tracking-normal ${
                  activeTab === 'inicio' ? 'text-zinc-200' : 'text-zinc-500'
                }`}
              >
                Portada, artistas y áreas
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab('subastas');
              setMobileMenuOpen(false);
            }}
            className={`w-full p-3 rounded-xl text-left transition-all flex items-center gap-3.5 ${
              activeTab === 'subastas'
                ? 'bg-[#5A5A50] text-white font-semibold shadow-lg shadow-black/40 ring-1 ring-white/20'
                : 'text-zinc-300 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <div
              className={`p-2 rounded-lg shrink-0 ${
                activeTab === 'subastas'
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-zinc-400'
              }`}
            >
              <Gavel size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs uppercase tracking-wider font-semibold">Subastas & Obras</div>
              <div
                className={`text-[11px] tracking-normal ${
                  activeTab === 'subastas' ? 'text-zinc-200' : 'text-zinc-500'
                }`}
              >
                Catálogo y preofertas
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab('eventos');
              setMobileMenuOpen(false);
            }}
            className={`w-full p-3 rounded-xl text-left transition-all flex items-center gap-3.5 ${
              activeTab === 'eventos'
                ? 'bg-[#5A5A50] text-white font-semibold shadow-lg shadow-black/40 ring-1 ring-white/20'
                : 'text-zinc-300 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <div
              className={`p-2 rounded-lg shrink-0 ${
                activeTab === 'eventos'
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-zinc-400'
              }`}
            >
              <Calendar size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs uppercase tracking-wider font-semibold">Eventos & Muestras</div>
              <div
                className={`text-[11px] tracking-normal ${
                  activeTab === 'eventos' ? 'text-zinc-200' : 'text-zinc-500'
                }`}
              >
                Exposiciones y fechas
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab('reservas');
              setMobileMenuOpen(false);
            }}
            className={`w-full p-3 rounded-xl text-left transition-all flex items-center gap-3.5 ${
              activeTab === 'reservas'
                ? 'bg-[#5A5A50] text-white font-semibold shadow-lg shadow-black/40 ring-1 ring-white/20'
                : 'text-zinc-300 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <div
              className={`p-2 rounded-lg shrink-0 ${
                activeTab === 'reservas' ? 'bg-white/20 text-white' : 'bg-white/5 text-zinc-400'
              }`}
            >
              <CalendarCheck size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs uppercase tracking-wider font-semibold">Reservas</div>
              <div
                className={`text-[11px] tracking-normal ${
                  activeTab === 'reservas' ? 'text-zinc-200' : 'text-zinc-500'
                }`}
              >
                Solicitudes para eventos
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab('galeria');
              setMobileMenuOpen(false);
            }}
            className={`w-full p-3 rounded-xl text-left transition-all flex items-center gap-3.5 ${
              activeTab === 'galeria'
                ? 'bg-[#5A5A50] text-white font-semibold shadow-lg shadow-black/40 ring-1 ring-white/20'
                : 'text-zinc-300 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <div
              className={`p-2 rounded-lg shrink-0 ${
                activeTab === 'galeria'
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-zinc-400'
              }`}
            >
              <Images size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs uppercase tracking-wider font-semibold">Galería (Fotos)</div>
              <div
                className={`text-[11px] tracking-normal ${
                  activeTab === 'galeria' ? 'text-zinc-200' : 'text-zinc-500'
                }`}
              >
                Fotografías del espacio
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab('backup');
              setMobileMenuOpen(false);
            }}
            className={`w-full p-3 rounded-xl text-left transition-all flex items-center gap-3.5 ${
              activeTab === 'backup'
                ? 'bg-[#5A5A50] text-white font-semibold shadow-lg shadow-black/40 ring-1 ring-white/20'
                : 'text-zinc-300 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <div
              className={`p-2 rounded-lg shrink-0 ${
                activeTab === 'backup'
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-zinc-400'
              }`}
            >
              <Database size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs uppercase tracking-wider font-semibold">Respaldo & Opciones</div>
              <div
                className={`text-[11px] tracking-normal ${
                  activeTab === 'backup' ? 'text-zinc-200' : 'text-zinc-500'
                }`}
              >
                Exportar, importar y reset
              </div>
            </div>
          </button>
        </div>

        {/* Acciones Inferiores */}
        <div className="p-5 border-t border-white/10 bg-black/40">
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/40 flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut size={14} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal (Derecha) */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'inicio' && <AdminInicio onNotify={notify} />}
          {activeTab === 'subastas' && <AdminSubastas onNotify={notify} />}
          {activeTab === 'eventos' && <AdminEventos onNotify={notify} />}
          {activeTab === 'reservas' && <AdminReservas onNotify={notify} />}
          {activeTab === 'galeria' && <AdminGaleria onNotify={notify} />}

          {activeTab === 'backup' && (
            <div className="max-w-3xl space-y-6">
              <div className="bg-[var(--ink-2)]/40 p-6 rounded-xl border border-[var(--line-soft)] space-y-2">
                <h2 className="text-xl font-serif text-[var(--ivory)] flex items-center gap-2">
                  <Database className="w-5 h-5 text-[var(--gold)]" />
                  Copias de Seguridad y Restauración
                </h2>
                <p className="text-xs md:text-sm text-[var(--ivory-dim)] leading-relaxed">
                  Descarga un respaldo en archivo de todos los lotes, eventos, imágenes y actividades modificadas, o recupera el catálogo inicial si es necesario.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Exportar */}
                <div className="bg-[var(--ink-2)]/30 border border-[var(--line-soft)] p-5 rounded-lg space-y-3">
                  <h3 className="font-serif text-base text-[var(--ivory)] font-medium flex items-center gap-2">
                    <Download size={17} className="text-[var(--gold)]" />
                    Descargar Respaldo JSON
                  </h3>
                  <p className="text-xs text-[var(--ivory-dim)] leading-relaxed">
                    Genera un archivo con toda la información cargada actualmente para guardarla en tu computadora.
                  </p>
                  <button
                    onClick={handleExportBackup}
                    className="btn-gold text-xs py-2 px-4 rounded w-full flex items-center justify-center gap-2"
                  >
                    <Download size={14} />
                    Descargar Respaldo
                  </button>
                </div>

                {/* Importar */}
                <div className="bg-[var(--ink-2)]/30 border border-[var(--line-soft)] p-5 rounded-lg space-y-3">
                  <h3 className="font-serif text-base text-[var(--ivory)] font-medium flex items-center gap-2">
                    <Upload size={17} className="text-[var(--gold)]" />
                    Restaurar desde Archivo JSON
                  </h3>
                  <p className="text-xs text-[var(--ivory-dim)] leading-relaxed">
                    Carga un archivo de respaldo previo para restaurar el contenido del sitio.
                  </p>
                  <label className="btn-ghost text-xs py-2 px-4 rounded w-full flex items-center justify-center gap-2 cursor-pointer">
                    <Upload size={14} />
                    <span>Seleccionar archivo .json</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportBackup}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Cambiar Contraseña del Administrador */}
              <div className="bg-[var(--ink-2)]/40 border border-[var(--gold)]/20 p-6 rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-[var(--gold)]">
                  <ShieldCheck size={20} />
                  <h3 className="font-serif text-base font-semibold text-[var(--ivory)]">Seguridad y Contraseña del Administrador</h3>
                </div>
                <p className="text-xs text-[var(--ivory-dim)] leading-relaxed">
                  Modifica la contraseña de acceso al panel. Los cambios se guardan de forma encriptada en la base de datos de producción.
                </p>

                <form onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[var(--ivory-dim)] mb-1">
                      Contraseña Actual
                    </label>
                    <input
                      type="password"
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                      placeholder="Contraseña actual"
                      className="w-full bg-[#3e3e37] border border-[var(--line)] rounded-lg px-3 py-2 text-sm text-[var(--ivory)] placeholder-[var(--ivory-dim)]/40 focus:border-[var(--gold)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[var(--ivory-dim)] mb-1">
                      Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full bg-[#3e3e37] border border-[var(--line)] rounded-lg px-3 py-2 text-sm text-[var(--ivory)] placeholder-[var(--ivory-dim)]/40 focus:border-[var(--gold)] outline-none"
                    />
                  </div>
                  <div className="md:col-span-2 flex flex-col md:flex-row items-center justify-between gap-3 pt-1">
                    {passChangeStatus && (
                      <p className={`text-xs font-medium flex items-center gap-1.5 ${passChangeStatus.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {passChangeStatus.type === 'success' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                        {passChangeStatus.text}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={passLoading || !currentPass || !newPass}
                      className="btn-gold text-xs py-2 px-5 rounded-lg flex items-center gap-2 self-end disabled:opacity-40"
                    >
                      <Lock size={14} />
                      {passLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Restaurar valores originales */}
              <div className="bg-rose-950/10 border border-rose-900/30 p-6 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-rose-400">
                  <AlertTriangle size={18} />
                  <h3 className="font-serif text-base font-semibold">Restaurar al Catálogo Oficial Inicial</h3>
                </div>
                <p className="text-xs text-[var(--ivory-dim)] leading-relaxed">
                  Si deseas reiniciar el sitio a su estado original, esto volverá a cargar los 23 lotes auténticos del catálogo oficial inaugurado en Río Cuarto, los eventos iniciales y la galería estándar.
                </p>
                <button
                  onClick={handleResetDefaults}
                  className="bg-rose-900 hover:bg-rose-800 text-white text-xs font-semibold py-2.5 px-4 rounded flex items-center gap-2 transition-colors"
                >
                  <RotateCcw size={14} />
                  Restablecer a valores de fábrica
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
