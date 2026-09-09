import React, { useEffect, useRef } from 'react';

export const LandBackground: React.FC = () => {
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bgRef.current;
    if (!el) return;

    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let tX = 0;
    let tY = 0;
    let cX = 0;
    let cY = 0;
    let animId: number | null = null;
    let active = false;

    const render = () => {
      cX += (tX - cX) * 0.04;
      cY += (tY - cY) * 0.04;

      if (el) {
        const moveX = -(cX * 14).toFixed(2);
        const moveY = -(cY * 8).toFixed(2);
        el.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) scale(1.05)`;
      }

      if (Math.abs(tX - cX) > 0.001 || Math.abs(tY - cY) > 0.001) {
        animId = requestAnimationFrame(render);
      } else {
        active = false;
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      tX = Math.max(-1, Math.min(1, (e.clientX / window.innerWidth - 0.5) * 2));
      tY = Math.max(-1, Math.min(1, (e.clientY / window.innerHeight - 0.5) * 2));
      if (!active) {
        active = true;
        animId = requestAnimationFrame(render);
      }
    };

    const handleMouseLeave = () => {
      tX = 0;
      tY = 0;
      if (!active) {
        active = true;
        animId = requestAnimationFrame(render);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      className="fixed inset-[-40px] pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 3D Land Cadastral Image with subtle parallax */}
      <div
        ref={bgRef}
        className="absolute inset-0 bg-cover bg-no-repeat will-change-transform transition-transform duration-100 ease-out"
        style={{
          backgroundImage: "url('/assets/land-cadastral-bg.jpg')",
          backgroundPosition: 'center 30%',
          transform: 'scale(1.05)',
          filter: 'saturate(1.10) contrast(1.08) brightness(0.88)',
        }}
      />

      {/* Multistop Gradient Overlays to synchronize with NLIP dark gold aesthetic */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(90deg, 
              rgba(18, 16, 13, 0.94) 0%, 
              rgba(18, 16, 13, 0.82) 28%, 
              rgba(20, 18, 14, 0.40) 50%, 
              rgba(22, 19, 15, 0.20) 72%, 
              rgba(18, 16, 12, 0.65) 100%
            ),
            linear-gradient(180deg,
              rgba(18, 16, 13, 0.65) 0%,
              transparent 14%,
              transparent 70%,
              rgba(18, 16, 13, 0.92) 100%
            ),
            radial-gradient(ellipse 120% 90% at 65% 45%, 
              transparent 45%, 
              rgba(18, 16, 13, 0.68) 100%
            )
          `,
        }}
      />

      {/* Ambient warm golden glow highlights */}
      <div
        className="absolute top-[-100px] right-[10%] w-[550px] h-[550px] rounded-full opacity-25 blur-[120px]"
        style={{
          background: 'radial-gradient(circle, #e7ae59 0%, #b87628 45%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-[-80px] left-[5%] w-[500px] h-[500px] rounded-full opacity-15 blur-[140px]"
        style={{
          background: 'radial-gradient(circle, #e7ae59 0%, #784813 50%, transparent 70%)',
        }}
      />
    </div>
  );
};
