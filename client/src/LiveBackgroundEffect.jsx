import React, { useEffect, useRef } from 'react';

/**
 * High-performance procedural atmospheric canvas effect
 * Modes: 'thunder' | 'wisteria' | 'embers' | 'lanterns' | 'elements'
 */
export default function LiveBackgroundEffect({ mode = 'thunder' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particles system
    const particleCount = mode === 'thunder' ? 35 : mode === 'wisteria' ? 45 : 40;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (mode === 'thunder' ? 2 : 0.8),
        vy: mode === 'embers' ? -(Math.random() * 1.5 + 0.5) : Math.random() * 1.2 + 0.4,
        size: Math.random() * 3 + 1.5,
        alpha: Math.random() * 0.7 + 0.2,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: Math.random() * 0.02 + 0.01,
        color: getParticleColor(mode)
      });
    }

    function getParticleColor(currentMode) {
      if (currentMode === 'thunder') {
        const colors = ['#ffb703', '#ffd166', '#4cc9f0', '#ffffff'];
        return colors[Math.floor(Math.random() * colors.length)];
      } else if (currentMode === 'wisteria') {
        const colors = ['#c77dff', '#e0aaff', '#9d4edd', '#ffffff', '#7b2cbf'];
        return colors[Math.floor(Math.random() * colors.length)];
      } else if (currentMode === 'embers') {
        const colors = ['#ff4d6d', '#ff758f', '#e63946', '#fb8500', '#ffd166'];
        return colors[Math.floor(Math.random() * colors.length)];
      } else if (currentMode === 'lanterns') {
        const colors = ['#ffb703', '#fb8500', '#ffd166', '#fca311'];
        return colors[Math.floor(Math.random() * colors.length)];
      } else {
        const colors = ['#00b4d8', '#ff4d6d', '#ffb703', '#2ec4b6', '#c77dff'];
        return colors[Math.floor(Math.random() * colors.length)];
      }
    }

    // Lightning generator for 'thunder' mode
    let lightningTimer = 0;
    let lightningFlash = 0;
    let lightningBolts = [];

    function generateLightning() {
      const startX = Math.random() * width * 0.7 + width * 0.15;
      const startY = 0;
      const bolt = [{ x: startX, y: startY }];
      let currX = startX;
      let currY = startY;

      while (currY < height * 0.75) {
        currY += Math.random() * 25 + 15;
        currX += (Math.random() - 0.5) * 45;
        bolt.push({ x: currX, y: currY });

        // Branching chance
        if (Math.random() < 0.25 && bolt.length < 15) {
          const branch = [{ x: currX, y: currY }];
          let bX = currX;
          let bY = currY;
          for (let b = 0; b < 5; b++) {
            bY += Math.random() * 20 + 10;
            bX += (Math.random() - 0.3) * 35;
            branch.push({ x: bX, y: bY });
          }
          lightningBolts.push({ points: branch, alpha: 0.8, isBranch: true });
        }
      }

      lightningBolts.push({ points: bolt, alpha: 1.0, isBranch: false });
      lightningFlash = 0.35; // Flash ambient brightness
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Handle lightning if in thunder mode
      if (mode === 'thunder') {
        lightningTimer++;
        if (lightningTimer > 180 && Math.random() < 0.04) {
          generateLightning();
          lightningTimer = 0;
        }

        if (lightningFlash > 0) {
          ctx.fillStyle = `rgba(255, 220, 100, ${lightningFlash * 0.18})`;
          ctx.fillRect(0, 0, width, height);
          lightningFlash -= 0.02;
        }

        // Draw lightning bolts
        for (let b = lightningBolts.length - 1; b >= 0; b--) {
          const bolt = lightningBolts[b];
          if (bolt.points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(bolt.points[0].x, bolt.points[0].y);
            for (let p = 1; p < bolt.points.length; p++) {
              ctx.lineTo(bolt.points[p].x, bolt.points[p].y);
            }
            ctx.strokeStyle = `rgba(255, 235, 150, ${bolt.alpha})`;
            ctx.lineWidth = bolt.isBranch ? 1.5 : 3;
            ctx.shadowColor = '#ffb703';
            ctx.shadowBlur = 15;
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
          bolt.alpha -= 0.06;
          if (bolt.alpha <= 0) {
            lightningBolts.splice(b, 1);
          }
        }
      }

      // Draw and update particles
      particles.forEach(p => {
        p.sway += p.swaySpeed;
        p.x += Math.sin(p.sway) * 0.6 + p.vx;
        p.y += p.vy;

        // Wrap around boundaries
        if (p.y > height + 10) {
          p.y = -10;
          p.x = Math.random() * width;
        } else if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x > width + 10) p.x = -10;
        else if (p.x < -10) p.x = width + 10;

        ctx.save();
        ctx.beginPath();

        if (mode === 'wisteria') {
          // Petal oval shape
          ctx.ellipse(p.x, p.y, p.size * 1.5, p.size * 0.8, p.sway, 0, Math.PI * 2);
        } else {
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mode]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 1,
        transition: 'opacity 0.6s ease'
      }}
    />
  );
}
