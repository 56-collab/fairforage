import React from 'react';
import { LandscapeScene } from '../../shaders/landscape/LandscapeScene';
import '../../shaders/threeui.css';

/**
 * FairForgeBackground
 * Primary atmospheric environmental background for FairForge, powered by ThreeUI LandscapeScene (Night variant).
 * Seamlessly blended into the dark midnight ground with subtle vignettes for optimal UI contrast.
 */
const FairForgeBackground = ({
  variant = 'night',
  className = '',
  style = {}
}) => {
  return (
    <div
      className={`fairforge-landscape-environment ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        height: '740px',
        maxHeight: '90vh',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0) 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0) 100%)',
        ...style
      }}
      aria-hidden="true"
    >
      <LandscapeScene
        variant={variant}
        sourceUrl="/landscape.html"
        className="fairforge-night-landscape"
      />
      {/* Subtle Moonlit & Midnight Atmospheric Vignette Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 90% 70% at 50% 25%, rgba(6, 8, 16, 0.15) 0%, rgba(6, 8, 16, 0.65) 65%, rgba(6, 8, 16, 0.98) 100%)',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '140px',
          background: 'linear-gradient(to bottom, transparent 0%, #060810 100%)',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
};

export default FairForgeBackground;
