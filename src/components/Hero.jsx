import React, { useState, useEffect } from 'react';
import { getHome } from '../lib/storage';
import { cx, reduced } from '../lib/format';

export default function Hero() {
  const [home, setHome] = useState(() => getHome());
  const slides = home.heroSlides;
  const [i, setI] = useState(0);

  useEffect(() => {
    const onChange = () => setHome(getHome());
    window.addEventListener('insignia-data-change', onChange);
    return () => window.removeEventListener('insignia-data-change', onChange);
  }, []);

  useEffect(() => {
    if (reduced() || slides.length < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % slides.length), 7500);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <header id="inicio" className="hero">
      <div className="hero-slides" aria-hidden="true">
        {slides.map((src, k) => (
          <div key={`${src}-${k}`} className={cx('hero-slide', k === i % slides.length && 'on')}>
            <img src={src} alt="" className={k % 2 ? 'kb-b' : 'kb-a'} />
          </div>
        ))}
      </div>
      <div className="beam beam-l" aria-hidden="true" />
      <div className="beam beam-r" aria-hidden="true" />
      <div className="hero-shade" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      <div className="wrap hero-inner">
        <h1 className="hero-title rise">{home.heroTitle}</h1>
      </div>
    </header>
  );
}
