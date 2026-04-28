import { useEffect, useRef } from 'react';

export default function StarfieldBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const stars: { x: number; y: number; r: number; a: number; speed: number }[] = [];
    const STAR_COUNT = 120;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        a: Math.random() * 0.5 + 0.1,
        speed: Math.random() * 0.0005 + 0.0002,
      });
    }

    // Easter egg: ghostly lobster silhouette drifting slowly
    const lobster = {
      x: canvas.width * 0.85,
      y: canvas.height * 0.75,
      angle: 0,
    };

    let t = 0;
    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t++;
      for (const s of stars) {
        const flicker = Math.sin(t * s.speed * 60) * 0.15 + s.a;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 200, 255, ${Math.max(0.05, flicker)})`;
        ctx.fill();
      }

      // Drifting lobster ghost
      lobster.x += Math.sin(t * 0.003) * 0.15;
      lobster.y += Math.cos(t * 0.002) * 0.1;
      lobster.angle = Math.sin(t * 0.001) * 0.05;
      ctx.save();
      ctx.translate(lobster.x, lobster.y);
      ctx.rotate(lobster.angle);
      ctx.globalAlpha = 0.025 + Math.sin(t * 0.005) * 0.008;
      ctx.font = '48px serif';
      ctx.fillText('🦞', -24, 16);
      ctx.restore();

      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
