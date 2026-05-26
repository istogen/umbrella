import React, { useEffect, useRef } from 'react';

export const CursorGlow: React.FC = () => {
  const glowRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -200, y: -200 });
  const targetRef = useRef({ x: -200, y: -200 });

  useEffect(() => {
    let raf: number;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      posRef.current.x = lerp(posRef.current.x, targetRef.current.x, 0.12);
      posRef.current.y = lerp(posRef.current.y, targetRef.current.y, 0.12);

      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${posRef.current.x - 200}px, ${posRef.current.y - 200}px)`;
      }
      raf = requestAnimationFrame(animate);
    };

    const move = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', move);
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed left-0 top-0 z-[9999] h-[400px] w-[400px] rounded-full"
      style={{
        background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 40%, transparent 70%)',
        filter: 'blur(40px)',
        willChange: 'transform',
      }}
    />
  );
};
