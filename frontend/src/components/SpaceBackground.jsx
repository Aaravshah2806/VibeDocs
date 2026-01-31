import { useEffect, useRef } from 'react';
import './SpaceBackground.css';

const SpaceBackground = ({ 
  starCount = 150, 
  shootingStarInterval = 3000,
  nebulaeCount = 3 
}) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationId;
    let stars = [];
    let shootingStars = [];
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };
    
    const initStars = () => {
      stars = [];
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
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
      const startX = Math.random() * canvas.width;
      const startY = Math.random() * canvas.height * 0.5;
      shootingStars.push({
        x: startX,
        y: startY,
        length: Math.random() * 100 + 50,
        speed: Math.random() * 15 + 10,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
        opacity: 1,
        trail: []
      });
    };
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw stars with twinkling
      stars.forEach(star => {
        star.twinklePhase += star.twinkleSpeed;
        const twinkle = (Math.sin(star.twinklePhase) + 1) / 2;
        const currentOpacity = star.opacity * (0.5 + twinkle * 0.5);
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `${star.color} ${currentOpacity})`;
        ctx.fill();
        
        // Add glow for larger stars
        if (star.size > 1.5) {
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
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw head glow
        ctx.beginPath();
        ctx.arc(star.x, star.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animate();
    
    // Create shooting stars periodically
    const shootingInterval = setInterval(createShootingStar, shootingStarInterval);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
      clearInterval(shootingInterval);
    };
  }, [starCount, shootingStarInterval]);
  
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
