import React, { useState, useEffect } from 'react';
import { HERO_SLIDES } from '../data/content';
import { cx, reduced } from '../lib/format';

export default function Hero() {
  const slides = HERO_SLIDES;
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduced()) return;
    const t = setInterval(() => setI((x) => (x + 1) % slides.length), 7500);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <header id="inicio" className="hero">
      <div className="hero-slides" aria-hidden="true">
        {slides.map((s, k) => (
          <div key={k} className={cx('hero-slide', k === i && 'on')}>
            <img src={s.src} alt="" className={k % 2 ? 'kb-b' : 'kb-a'} />
          </div>
        ))}
      </div>
      <div className="beam beam-l" aria-hidden="true" />
      <div className="beam beam-r" aria-hidden="true" />
      <div className="hero-shade" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      <div className="wrap hero-inner">
        <h1 className="hero-title rise">
          Autenticidad que <em>trasciende</em> el tiempo
        </h1>
      </div>
    </header>
  );
}
