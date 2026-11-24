import React from 'react';
import { Link } from 'react-router-dom';
import { SERVICES } from '../data/content';

export default function Services() {
  return (
    <section className="m2-servicios">
      <div className="wrap">
        <div className="m2-servicios__inner">
          <div>
            <div className="m2-head">
              <h2>
                Áreas <em>Insignia</em>
              </h2>
            </div>
          </div>

          <div className="m2-grid">
            {SERVICES.map(({ title, text, image, alt }, index) => {
              const numStr = String(index + 1).padStart(2, '0');
              return (
                <Link
                  to="/nosotros"
                  key={title}
                  className="m2-panel group"
                  title={`Más información sobre ${title}`}
                >
                  {image && (
                    <img
                      src={image}
                      alt={alt || title}
                      loading="lazy"
                    />
                  )}
                  <div className="m2-panel__num">{numStr}</div>
                  <div className="m2-panel__body">
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
