import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  size: number;
  hue: number;
}

interface ProjectedParticle extends Particle {
  screenX: number;
  screenY: number;
  depth: number;
}

export const CanvasBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let width = 0;
    let height = 0;
    let frameId = 0;
    let rotation = 0;
    let pointerX = 0;
    let pointerY = 0;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = document.documentElement.clientWidth;
      height = window.innerHeight;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointerX = (event.clientX / width - 0.5) * 0.16;
      pointerY = (event.clientY / height - 0.5) * 0.12;
    };

    const particles: Particle[] = Array.from(
      { length: document.documentElement.clientWidth > 768 ? 78 : 42 },
      () => {
        const angle = Math.random() * Math.PI * 2;
        const vertical = Math.random() * 2 - 1;
        const radius = 0.45 + Math.random() * 0.55;
        const planarRadius = Math.sqrt(1 - vertical * vertical) * radius;
        return {
          x: Math.cos(angle) * planarRadius,
          y: vertical * radius,
          z: Math.sin(angle) * planarRadius,
          size: Math.random() * 1.4 + 0.7,
          hue: Math.random() > 0.48 ? 253 : 184,
        };
      }
    );

    const render = () => {
      frameId = 0;
      context.clearRect(0, 0, width, height);
      rotation += 0.0007;

      const sin = Math.sin(rotation);
      const cos = Math.cos(rotation);
      const projected: ProjectedParticle[] = particles.map((particle) => {
        const rotatedX = particle.x * cos - particle.z * sin;
        const rotatedZ = particle.x * sin + particle.z * cos;
        const perspective = 1.15 / (1.15 + rotatedZ * 0.22);
        return {
          ...particle,
          screenX: width * (0.53 + pointerX) + rotatedX * width * 0.58 * perspective,
          screenY: height * (0.43 + pointerY) + particle.y * height * 0.72 * perspective,
          depth: perspective,
        };
      });

      for (let first = 0; first < projected.length; first += 1) {
        for (let second = first + 1; second < projected.length; second += 1) {
          const a = projected[first];
          const b = projected[second];
          const dx = a.screenX - b.screenX;
          const dy = a.screenY - b.screenY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const connectionDistance = 132 * Math.min(a.depth, b.depth);

          if (distance < connectionDistance) {
            const opacity = (1 - distance / connectionDistance) * 0.22;
            context.strokeStyle = `rgba(157, 167, 255, ${opacity})`;
            context.lineWidth = 0.55;
            context.beginPath();
            context.moveTo(a.screenX, a.screenY);
            context.lineTo(b.screenX, b.screenY);
            context.stroke();
          }
        }
      }

      for (const particle of projected) {
        const opacity = 0.24 + (particle.depth - 0.75) * 0.32;
        context.fillStyle = `hsla(${particle.hue}, 95%, 78%, ${opacity})`;
        context.shadowColor = `hsla(${particle.hue}, 95%, 72%, ${opacity})`;
        context.shadowBlur = 10 * particle.depth;
        context.beginPath();
        context.arc(
          particle.screenX,
          particle.screenY,
          particle.size * particle.depth,
          0,
          Math.PI * 2
        );
        context.fill();
      }

      context.shadowBlur = 0;
      if (!motionPreference.matches) frameId = requestAnimationFrame(render);
    };

    const startAnimation = () => {
      if (motionPreference.matches || frameId) return;
      frameId = requestAnimationFrame(render);
    };

    const updateMotion = () => {
      if (motionPreference.matches) {
        if (frameId) cancelAnimationFrame(frameId);
        frameId = 0;
      } else {
        startAnimation();
      }
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    motionPreference.addEventListener('change', updateMotion);
    if (motionPreference.matches) render();
    else startAnimation();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      motionPreference.removeEventListener('change', updateMotion);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
      aria-hidden="true"
    />
  );
};
