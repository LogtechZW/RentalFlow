import React from 'react';
import { SPLASH_DESKTOP_BG, SPLASH_MOBILE_BG } from '@/services/mockData';

export const GlobalBackground: React.FC = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      style={{ backgroundColor: '#0A1128' }}
    >
      {/* Desktop Viewport Imagery: rentflowdesktop.png */}
      <div
        className="hidden md:block absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{
          backgroundImage: `url(${SPLASH_DESKTOP_BG})`,
          filter: 'brightness(0.9) contrast(1.15)',
        }}
      />

      {/* Mobile Viewport Imagery: rentflow2.png */}
      <div
        className="block md:hidden absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{
          backgroundImage: `url(${SPLASH_MOBILE_BG})`,
          filter: 'brightness(0.9) contrast(1.15)',
        }}
      />

      {/* Photographic Background Shielding:
          Continuous, unvarying muted overlay of rgba(10, 17, 40, 0.85) over all full-viewport imagery.
          Ensures no text, metrics, or input fields rest directly on unshielded photography lines. */}
      <div
        className="absolute inset-0 transition-opacity"
        style={{ backgroundColor: 'rgba(10, 17, 40, 0.85)' }}
      />
    </div>
  );
};
