import { useEffect, useRef } from 'react';

interface ParticleBackgroundProps {
  particleCount?: number;
  speed?: number;
  className?: string;
}

export function ParticleBackground({ 
  particleCount = 100, // Reduced from 500 for mobile performance
  speed = 0.0005, 
  className = '' 
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return; // Don't animate if user prefers reduced motion
    }

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();

    // Particle class
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
        
        // Emerald gradient colors
        const hue = 150 + Math.random() * 30; // 150-180 (emerald to cyan)
        this.color = `hsl(${hue}, 70%, ${50 + Math.random() * 20}%)`;
        this.size = Math.random() * 2 + 0.5;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.z -= this.vz;

        // Wrap around
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
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(x2d, y2d, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow effect for nearby particles
        if (this.z < 300) {
          ctx.globalAlpha = opacity * 0.3;
          ctx.beginPath();
          ctx.arc(x2d, y2d, size * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Create particles
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animation loop
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX - window.innerWidth / 2) * 0.05;
      targetMouseY = (e.clientY - window.innerHeight / 2) * 0.05;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      // Smooth mouse follow
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Clear canvas with fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Translate based on mouse
      ctx.save();
      ctx.translate(mouseX, mouseY);

      // Update and draw particles
      particles.forEach(particle => {
        particle.update();
        particle.draw(ctx);
      });

      ctx.restore();

      // Connection lines between nearby particles (optimized)
      // Limit to max 3 connections per particle to reduce O(n²) complexity
      ctx.globalAlpha = 0.1;
      const maxConnections = 3;
      const connectionDistance = 100; // Reduced from 150
      const connectionDistanceSq = connectionDistance * connectionDistance;

      particles.forEach((p1, i) => {
        let connectionCount = 0;
        
        // Check only nearby particles, early break after max connections
        for (let j = i + 1; j < particles.length && connectionCount < maxConnections; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dz = p1.z - p2.z;
          
          // Use squared distance to avoid expensive sqrt
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
      });

      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Resize handler
    window.addEventListener('resize', setCanvasSize);

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
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
