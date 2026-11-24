import React from 'react';
import { BrandLogoVertical } from './BrandLogo';

export default function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="mb-4">
          <BrandLogoVertical showMonogram={true} />
        </div>
        <p className="foot-line">Autenticidad que trasciende el tiempo</p>
        <p className="foot-small">
          Insignia Casa de Arte · Alberdi 355, Río Cuarto, Córdoba.
        </p>
      </div>
    </footer>
  );
}
