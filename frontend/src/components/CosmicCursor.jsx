import { useEffect, useState, useRef } from 'react';
import './CosmicCursor.css';

const CosmicCursor = () => {
  const cursorRef = useRef(null);
  const followerRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Hide default cursor
    document.body.style.cursor = 'none';

    // Track mouse movement
    const onMouseMove = (e) => {
      setIsVisible(true);
      const { clientX, clientY } = e;
      
      // Move the main cursor immediately
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
      }
      
      // Move the follower with a slight delay/trailing effect
      if (followerRef.current) {
        // We use requestAnimationFrame for smooth trailing in the animation loop below
        // allowing the follower to lerp towards target
      }
    };

    // Track hover state for interactive elements
    const onMouseOver = (e) => {
      if (e.target.closest('a, button, input, .clickable')) {
        setIsHovering(true);
      }
    };

    const onMouseOut = (e) => {
      if (e.target.closest('a, button, input, .clickable')) {
        setIsHovering(false);
      }
    };
    
    // Handle leaving the window
    const onMouseLeave = () => {
      setIsVisible(false);
    };

    const onMouseEnter = () => {
      setIsVisible(true);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseout', onMouseOut);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      document.body.style.cursor = 'auto'; // Restore default
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, []);

  // Animation loop for smooth trailing
  useEffect(() => {
    let animationFrame;
    let followerX = 0;
    let followerY = 0;
    let mouseX = 0;
    let mouseY = 0;
    
    // Update mouse position reference for the animation loop
    const updateMousePos = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    
    document.addEventListener('mousemove', updateMousePos);
    
    const animateFollower = () => {
      // Lerp (Linear Interpolation) for smooth trailing
      // 0.1 is the speed/weight of the trail
      followerX += (mouseX - followerX) * 0.15;
      followerY += (mouseY - followerY) * 0.15;
      
      if (followerRef.current) {
        followerRef.current.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`;
      }
      
      animationFrame = requestAnimationFrame(animateFollower);
    };
    
    animateFollower();
    
    return () => {
      document.removeEventListener('mousemove', updateMousePos);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  if (typeof window === 'undefined') return null;

  return (
    <>
      <div 
        ref={cursorRef} 
        className={`cosmic-cursor-dot ${isHovering ? 'hover' : ''} ${!isVisible ? 'hidden' : ''}`}
      />
      <div 
        ref={followerRef} 
        className={`cosmic-cursor-follower ${isHovering ? 'hover' : ''} ${!isVisible ? 'hidden' : ''}`}
      />
    </>
  );
};

export default CosmicCursor;
