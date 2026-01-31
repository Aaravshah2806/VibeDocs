import { useEffect, useRef, useState } from 'react';
import './SpaceBackground.css';

const SpaceBackground = ({ 
  starCount = 150, 
  shootingStarInterval = 3000,
  nebulaeCount = 4 
}) => {
  const canvasRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  // Detect mobile and reduced motion preference
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    const checkReducedMotion = () => {
      setPrefersReducedMotion(
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      );
    };
    
    checkMobile();
    checkReducedMotion();
    
    window.addEventListener('resize', checkMobile);
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', checkReducedMotion);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      motionQuery.removeEventListener('change', checkReducedMotion);
    };
  }, []);
  
  useEffect(() => {
    // Don't run animations if user prefers reduced motion
    if (prefersReducedMotion) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationId;
    let stars = [];
    let shootingStars = [];
    
    // Adjust counts based on device
    const actualStarCount = isMobile ? Math.floor(starCount * 0.5) : starCount;
    const actualShootingInterval = isMobile ? shootingStarInterval * 1.5 : shootingStarInterval;
    
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      initStars();
    };
    
    const initStars = () => {
      stars = [];
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      for (let i = 0; i < actualStarCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * (isMobile ? 1.5 : 2) + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinklePhase: Math.random() * Math.PI * 2,
          color: getStarColor()
        });
      }
    };
    
    const getStarColor = () => {
      const colors = [
        'rgba(255, 255, 255,',      // White
        'rgba(200, 220, 255,',      // Blue-white
        'rgba(255, 200, 180,',      // Warm
        'rgba(180, 200, 255,',      // Cool blue
        'rgba(220, 180, 255,'       // Purple tint
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    };
    
    const createShootingStar = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const startX = Math.random() * width;
      const startY = Math.random() * height * 0.5;
      shootingStars.push({
        x: startX,
        y: startY,
        length: Math.random() * (isMobile ? 60 : 100) + (isMobile ? 30 : 50),
        speed: Math.random() * 15 + 10,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
        opacity: 1,
        trail: []
      });
    };
    
    const animate = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      ctx.clearRect(0, 0, width, height);
      
      // Draw stars with twinkling
      stars.forEach(star => {
        star.twinklePhase += star.twinkleSpeed;
        const twinkle = (Math.sin(star.twinklePhase) + 1) / 2;
        const currentOpacity = star.opacity * (0.5 + twinkle * 0.5);
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `${star.color} ${currentOpacity})`;
        ctx.fill();
        
        // Add glow for larger stars (skip on mobile for performance)
        if (!isMobile && star.size > 1.5) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, star.size * 3
          );
          gradient.addColorStop(0, `${star.color} ${currentOpacity * 0.3})`);
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      });
      
      // Draw shooting stars
      shootingStars = shootingStars.filter(star => star.opacity > 0);
      shootingStars.forEach(star => {
        star.x += Math.cos(star.angle) * star.speed;
        star.y += Math.sin(star.angle) * star.speed;
        star.opacity -= 0.015;
        
        // Draw trail
        const gradient = ctx.createLinearGradient(
          star.x, star.y,
          star.x - Math.cos(star.angle) * star.length,
          star.y - Math.sin(star.angle) * star.length
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
        gradient.addColorStop(0.3, `rgba(168, 85, 247, ${star.opacity * 0.5})`);
        gradient.addColorStop(1, 'rgba(6, 182, 212, 0)');
        
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(
          star.x - Math.cos(star.angle) * star.length,
          star.y - Math.sin(star.angle) * star.length
        );
        ctx.strokeStyle = gradient;
        ctx.lineWidth = isMobile ? 1.5 : 2;
        ctx.stroke();
        
        // Draw head glow
        ctx.beginPath();
        ctx.arc(star.x, star.y, isMobile ? 2 : 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animate();
    
    // Create shooting stars periodically
    const shootingInterval = setInterval(createShootingStar, actualShootingInterval);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
      clearInterval(shootingInterval);
    };
  }, [starCount, shootingStarInterval, isMobile, prefersReducedMotion]);
  
  // Don't render canvas if user prefers reduced motion
  if (prefersReducedMotion) {
    return (
      <div className="space-background">
        <div className="space-nebulae">
          {Array.from({ length: nebulaeCount }).map((_, i) => (
            <div key={i} className={`space-nebula space-nebula-${i + 1}`} />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-background">
      <canvas ref={canvasRef} className="space-canvas" />
      <div className="space-nebulae">
        {Array.from({ length: nebulaeCount }).map((_, i) => (
          <div key={i} className={`space-nebula space-nebula-${i + 1}`} />
        ))}
      </div>
    </div>
  );
};

export default SpaceBackground;

