import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Nav from './components/Nav';
import Footer from './components/Footer';
import Home from './pages/Home';
import Galeria from './pages/Galeria';
import Subastas from './pages/Subastas';
import Eventos from './pages/Eventos';
import Nosotros from './pages/Nosotros';
import Admin from './pages/Admin';

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && <Nav />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/subastas" element={<Subastas />} />
        <Route path="/eventos" element={<Eventos />} />
        <Route path="/galeria" element={<Galeria />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!isAdmin && <Footer />}
    </>
  );
}
