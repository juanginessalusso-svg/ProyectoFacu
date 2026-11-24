import React, { useEffect } from 'react';
import Gallery from '../components/Gallery';

export default function Galeria() {
  useEffect(() => {
    document.title = 'Galería Insignia · Espacio de Arte Alberdi 355 | Subastas Insignia';
  }, []);

  return (
    <main>
      <Gallery />
    </main>
  );
}
