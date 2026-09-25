import React from 'react';
import { ElementsCollection } from '../../shaders/elements/ElementsBackground';
import '../../shaders/threeui.css';

/**
 * FairForgeBackground
 * Ambient background layer utilizing the ThreeUI ElementsCollection Fire variant.
 * Tuned with hue rotation and subtle opacity to harmonize with FairForge's purple/blue/pink glassmorphism design.
 */
const FairForgeBackground = ({
  variant = 'fire',
  speed = 0.85,
  size = 1.15,
  particleAmount = 0.75,
  hue = -108, // Rotates fire's warm spectrum to deep purple/magenta/blue
  saturation = 1.15,
  brightness = 0.9,
  opacity = 0.42,
  className = '',
  style = {}
}) => {
  return (
    <div
      className={`fairforge-ambient-shader-container ${className}`}
      style={{
        position: 'absolute',
        top: '-15%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '1400px',
        height: '580px',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
        borderRadius: '24px',
        maskImage: 'radial-gradient(ellipse 75% 65% at 50% 35%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 50% 35%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)',
        ...style
      }}
    >
      <ElementsCollection
        variant={variant}
        speed={speed}
        size={size}
        particleAmount={particleAmount}
        hue={hue}
        saturation={saturation}
        brightness={brightness}
        opacity={opacity}
        style={{
          width: '100%',
          height: '100%',
          background: 'transparent'
        }}
      />
      {/* Subtle ambient overlay to blend seamlessly with FairForge's dark navy background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.08) 0%, rgba(7, 9, 19, 0.5) 75%, rgba(7, 9, 19, 0.9) 100%)',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
};

export default FairForgeBackground;
