import React from 'react';
import { Link } from 'react-router-dom';
import { Hash } from 'lucide-react';
import { SERVICES } from '../data/content';

export default function Services() {
  return (
    <section className="section" style={{ paddingTop: '70px', paddingBottom: '100px' }}>
      <div className="wrap">
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[var(--ivory)] font-normal mb-8 sm:mb-10 tracking-tight">
          Nuestros servicios
        </h2>
        <div className="services">
          {SERVICES.map(({ icon: Icon, title, text }) => {
            const RenderIcon = title === 'Curaduría' ? Hash : Icon;
            return (
              <Link
                to="/nosotros"
                key={title}
                className="service group"
                title={`Más información sobre ${title}`}
              >
                <div>
                  <div className="service-icon">
                    <RenderIcon size={26} strokeWidth={1.4} />
                  </div>
                  <h4>{title}</h4>
                  <p>{text}</p>
                </div>
                <div className="service-link">
                  <span>Saber más</span>
                  <span className="arrow">→</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
