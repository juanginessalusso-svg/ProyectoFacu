import React, { useState, useEffect } from 'react';
import { getHome } from '../lib/storage';

export default function Services() {
  const [home, setHome] = useState(() => getHome());

  useEffect(() => {
    const onChange = () => setHome(getHome());
    window.addEventListener('insignia-data-change', onChange);
    return () => window.removeEventListener('insignia-data-change', onChange);
  }, []);

  return (
    <section className="m2-servicios">
      <div className="wrap">
        <div className="m2-servicios__inner">
          <div>
            <div className="m2-head">
              <h2>{home.servicesTitle}</h2>
            </div>
          </div>

          <div className="m2-grid">
            {home.services.map(({ title, text, image, alt }) => (
              <article key={title} className="m2-panel group">
                {image && <img src={image} alt={alt || title} loading="lazy" decoding="async" />}
                <div className="m2-panel__body">
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
