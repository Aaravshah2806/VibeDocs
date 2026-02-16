import { useRef, useEffect } from 'react';
import gsap from 'gsap';

const MagneticButton = ({ 
  children, 
  className = "", 
  strength = 30, // How strong the pull is
  active = true 
}) => {
  const ref = useRef(null);
  
  // Skip effect on mobile
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  useEffect(() => {
    if (isMobile || !active || !ref.current) return;

    const element = ref.current;
    
    const onMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { left, top, width, height } = element.getBoundingClientRect();
      
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      
      const x = (clientX - centerX) / width;
      const y = (clientY - centerY) / height;
      
      // Animate the button position
      gsap.to(element, {
        x: x * strength,
        y: y * strength,
        duration: 0.5,
        ease: "power3.out"
      });
      
      // Optional: Animate text/content inside slightly differently for parallax?
      // For now, move the whole button
    };
    
    const onMouseLeave = () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.8,
        ease: "elastic.out(1, 0.3)"
      });
    };
    
    element.addEventListener('mousemove', onMouseMove);
    element.addEventListener('mouseleave', onMouseLeave);
    
    return () => {
      element.removeEventListener('mousemove', onMouseMove);
      element.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [active, strength, isMobile]);

  return (
    <div ref={ref} className={`magnetic-wrap ${className}`} style={{ display: 'inline-block' }}>
      {children}
    </div>
  );
};

export default MagneticButton;
