import React from 'react';

interface UmbrellaLogoProps {
  size?: number;
  animated?: boolean;
}

// Authentic Umbrella Corporation logo — 8 alternating triangles
export const UmbrellaLogo: React.FC<UmbrellaLogoProps> = ({ size = 32, animated = false }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={animated ? 'umbrella-spin' : ''}
    >
      <defs>
        <radialGradient id="umbrella-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#dc2626" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Subtle glow */}
      <circle cx="100" cy="100" r="100" fill="url(#umbrella-glow)" />

      {/* 8 alternating triangles — perfect geometry */}
      <g>
        {/* Top */}
        <path d="M 100 100 L 100 0 L 170.71 29.29 Z" fill="#dc2626" />
        <path d="M 100 100 L 170.71 29.29 L 200 100 Z" fill="#ffffff" />
        {/* Right */}
        <path d="M 100 100 L 200 100 L 170.71 170.71 Z" fill="#dc2626" />
        <path d="M 100 100 L 170.71 170.71 L 100 200 Z" fill="#ffffff" />
        {/* Bottom */}
        <path d="M 100 100 L 100 200 L 29.29 170.71 Z" fill="#dc2626" />
        <path d="M 100 100 L 29.29 170.71 L 0 100 Z" fill="#ffffff" />
        {/* Left */}
        <path d="M 100 100 L 0 100 L 29.29 29.29 Z" fill="#dc2626" />
        <path d="M 100 100 L 29.29 29.29 L 100 0 Z" fill="#ffffff" />
      </g>

      {/* Center divisions (thin lines for cleanness) */}
      <g stroke="#0a0a0f" strokeWidth="1.5">
        <line x1="100" y1="0" x2="100" y2="200" />
        <line x1="0" y1="100" x2="200" y2="100" />
        <line x1="29.29" y1="29.29" x2="170.71" y2="170.71" />
        <line x1="170.71" y1="29.29" x2="29.29" y2="170.71" />
      </g>

      {/* Center dot */}
      <circle cx="100" cy="100" r="6" fill="#0a0a0f" />
      <circle cx="100" cy="100" r="3" fill="#dc2626" />
    </svg>
  );
};
