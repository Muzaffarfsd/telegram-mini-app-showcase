import { useEffect, useRef } from 'react';

interface ParticleBackgroundProps {
  particleCount?: number;
  speed?: number;
  className?: string;
}

export function ParticleBackground({ 
  particleCount = 80,
  speed = 0.0005, 
  className = '' 
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    if (prefersReducedMotion.matches) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches && animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = undefined;
      }
    };
    
    prefersReducedMotion.addEventListener('change', handleReducedMotionChange);

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();

    class Particle {
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      color: string;
      size: number;

      constructor() {
        this.x = (Math.random() - 0.5) * canvas.width;
        this.y = (Math.random() - 0.5) * canvas.height;
        this.z = Math.random() * 1000;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.vz = Math.random() * 0.5 + 0.1;
        
        const hue = 150 + Math.random() * 30;
        this.color = `hsl(${hue}, 70%, ${50 + Math.random() * 20}%)`;
        this.size = Math.random() * 2 + 0.5;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.z -= this.vz;

        if (this.z < 1) {
          this.z = 1000;
          this.x = (Math.random() - 0.5) * canvas.width;
          this.y = (Math.random() - 0.5) * canvas.height;
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        const scale = 1000 / (1000 + this.z);
        const x2d = this.x * scale + canvas.width / 2;
        const y2d = this.y * scale + canvas.height / 2;
        const size = this.size * scale;

        if (x2d < 0 || x2d > canvas.width || y2d < 0 || y2d > canvas.height) {
          return;
        }

        const opacity = 1 - this.z / 1000;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = opacity * 0.8;
        
        ctx.beginPath();
        ctx.arc(x2d, y2d, size, 0, Math.PI * 2);
        ctx.fill();
        
        if (this.z < 300) {
          ctx.globalAlpha = opacity * 0.3;
          ctx.beginPath();
          ctx.arc(x2d, y2d, size * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX - window.innerWidth / 2) * 0.05;
      targetMouseY = (e.clientY - window.innerHeight / 2) * 0.05;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const targetFrameTime = 1000 / 30;

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastFrameTimeRef.current;
      
      if (deltaTime < targetFrameTime) {
        animationIdRef.current = requestAnimationFrame(animate);
        return;
      }
      
      lastFrameTimeRef.current = currentTime - (deltaTime % targetFrameTime);

      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(mouseX, mouseY);

      particles.forEach(particle => {
        particle.update();
        particle.draw(ctx);
      });

      ctx.restore();

      ctx.globalAlpha = 0.1;
      const maxConnections = 2;
      const connectionDistance = 80;
      const connectionDistanceSq = connectionDistance * connectionDistance;

      for (let i = 0; i < particles.length; i++) {
        let connectionCount = 0;
        const p1 = particles[i];
        
        for (let j = i + 1; j < particles.length && connectionCount < maxConnections; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dz = p1.z - p2.z;
          
          const distanceSq = dx * dx + dy * dy + dz * dz;

          if (distanceSq < connectionDistanceSq) {
            const scale1 = 1000 / (1000 + p1.z);
            const scale2 = 1000 / (1000 + p2.z);
            const x1 = p1.x * scale1 + canvas.width / 2 + mouseX;
            const y1 = p1.y * scale1 + canvas.height / 2 + mouseY;
            const x2 = p2.x * scale2 + canvas.width / 2 + mouseX;
            const y2 = p2.y * scale2 + canvas.height / 2 + mouseY;

            ctx.strokeStyle = '#10B981';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            
            connectionCount++;
          }
        }
      }

      animationIdRef.current = requestAnimationFrame(animate);
    };

    animationIdRef.current = requestAnimationFrame(animate);

    window.addEventListener('resize', setCanvasSize);

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      window.removeEventListener('mousemove', handleMouseMove);
      prefersReducedMotion.removeEventListener('change', handleReducedMotionChange);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = undefined;
      }
    };
  }, [particleCount, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 -z-10 ${className}`}
      style={{ background: '#000000' }}
    />
  );
}
