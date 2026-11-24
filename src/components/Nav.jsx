import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cx, reduced } from '../lib/format';
import BrandLogo from './BrandLogo';

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setSolid(window.scrollY > 40);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Inicio', path: '/' },
    { label: 'Preoferta', path: '/preoferta' },
    { label: 'Eventos', path: '/eventos' },
    { label: 'Galería', path: '/galeria' },
    { label: 'Nosotros', path: '/nosotros' },
  ];

  const isActive = (item) => {
    return location.pathname === item.path;
  };

  const handleNavClick = (e, item) => {
    e.preventDefault();
    setOpen(false);

    if (location.pathname === item.path) {
      window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' });
    } else {
      navigate(item.path);
    }
  };

  return (
    <nav className={cx('site-nav', (solid || open) && 'solid')} aria-label="Principal">
      <div className="wrap nav-row">
        <Link
          to="/"
          className="brand group"
          aria-label="Subastas Insignia, inicio"
          onClick={() => {
            setOpen(false);
            window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' });
          }}
        >
          <BrandLogo />
        </Link>

        <ul className="nav-links">
          {navItems.map((item) => (
            <li key={item.label}>
              <a
                href={item.path}
                className={cx(isActive(item) && 'active')}
                onClick={(e) => handleNavClick(e, item)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="nav-burger"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label="Menú"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <ul className="nav-drop wrap">
          {navItems.map((item) => (
            <li key={item.label}>
              <a
                href={item.path}
                className={cx(isActive(item) && 'active')}
                onClick={(e) => handleNavClick(e, item)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
