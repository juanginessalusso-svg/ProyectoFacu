import React, { useEffect } from 'react';
import Hero from '../components/Hero';
import Artists from '../components/Artists';
import Services from '../components/Services';

export default function Home() {
  useEffect(() => {
    document.title = 'Subastas Insignia · Galería de Arte & Subastas | Río Cuarto, Córdoba';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <main>
      <Hero />
      <Artists />
      <Services />
    </main>
  );
}
