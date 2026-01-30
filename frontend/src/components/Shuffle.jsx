import React, { useRef, useEffect, useState, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import './Shuffle.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const Shuffle = ({
  text,
  className = '',
  style = {},
  shuffleDirection = 'up',
  duration = 0.5,
  ease = 'power4.out',
  threshold = 0.1,
  rootMargin = '0px',
  tag = 'p',
  textAlign = 'center',
  onShuffleComplete,
  shuffleTimes = 2,
  stagger = 0.04,
  scrambleCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  triggerOnce = false,
  respectReducedMotion = true,
  triggerOnHover = true
}) => {
  const containerRef = useRef(null);
  const charsRef = useRef([]);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [ready, setReady] = useState(false);
  const [displayChars, setDisplayChars] = useState([]);
  const tlRef = useRef(null);
  const playingRef = useRef(false);

  // Wait for fonts to load
  useEffect(() => {
    if ('fonts' in document) {
      if (document.fonts.status === 'loaded') setFontsLoaded(true);
      else document.fonts.ready.then(() => setFontsLoaded(true));
    } else setFontsLoaded(true);
  }, []);

  // Initialize display characters
  useEffect(() => {
    if (text) {
      setDisplayChars(text.split('').map((char, i) => ({
        id: i,
        original: char,
        current: char,
        isSpace: char === ' '
      })));
    }
  }, [text]);

  const scrollTriggerStart = useMemo(() => {
    const startPct = (1 - threshold) * 100;
    return `top ${startPct}%`;
  }, [threshold]);

  const getRandomChar = () => {
    return scrambleCharset.charAt(Math.floor(Math.random() * scrambleCharset.length));
  };

  const playAnimation = () => {
    if (playingRef.current || !charsRef.current.length) return;
    playingRef.current = true;

    const chars = charsRef.current.filter(Boolean);
    
    // Kill any existing timeline
    if (tlRef.current) {
      tlRef.current.kill();
    }

    // Reset all chars to starting position
    gsap.set(chars, {
      y: shuffleDirection === 'up' ? 50 : shuffleDirection === 'down' ? -50 : 0,
      x: shuffleDirection === 'left' ? 50 : shuffleDirection === 'right' ? -50 : 0,
      opacity: 0,
      scale: 0.8
    });

    const tl = gsap.timeline({
      onComplete: () => {
        playingRef.current = false;
        onShuffleComplete?.();
      }
    });

    // Animate each character with stagger
    chars.forEach((char, i) => {
      const delay = i * stagger;
      const originalText = char.textContent;
      
      // Scramble effect during animation
      let scrambleCount = 0;
      const scrambleInterval = setInterval(() => {
        if (scrambleCount < shuffleTimes * 3) {
          char.textContent = char.dataset.space === 'true' ? ' ' : getRandomChar();
          scrambleCount++;
        } else {
          char.textContent = char.dataset.original;
          clearInterval(scrambleInterval);
        }
      }, 50);

      // Clear interval when animation completes for this char
      setTimeout(() => {
        clearInterval(scrambleInterval);
        char.textContent = char.dataset.original;
      }, (delay + duration) * 1000);

      tl.to(char, {
        y: 0,
        x: 0,
        opacity: 1,
        scale: 1,
        duration,
        ease
      }, delay);
    });

    tlRef.current = tl;
  };

  useGSAP(() => {
    if (!containerRef.current || !fontsLoaded || !displayChars.length) return;

    if (respectReducedMotion && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setReady(true);
      onShuffleComplete?.();
      return;
    }

    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      start: scrollTriggerStart,
      once: triggerOnce,
      onEnter: () => {
        setReady(true);
        playAnimation();
      }
    });

    // Hover handler
    const handleHover = () => {
      if (triggerOnHover && !playingRef.current) {
        playAnimation();
      }
    };

    if (triggerOnHover) {
      containerRef.current.addEventListener('mouseenter', handleHover);
    }

    return () => {
      st.kill();
      if (containerRef.current && triggerOnHover) {
        containerRef.current.removeEventListener('mouseenter', handleHover);
      }
      if (tlRef.current) {
        tlRef.current.kill();
      }
    };
  }, {
    dependencies: [fontsLoaded, displayChars, scrollTriggerStart, triggerOnce, triggerOnHover],
    scope: containerRef
  });

  const commonStyle = useMemo(() => ({ textAlign, ...style }), [textAlign, style]);
  const classes = useMemo(() => `shuffle-parent ${ready ? 'is-ready' : ''} ${className}`, [ready, className]);

  const Tag = tag || 'p';
  
  return React.createElement(
    Tag,
    { 
      ref: containerRef, 
      className: classes, 
      style: commonStyle,
      'data-text': text
    },
    displayChars.map((char, i) => (
      <span
        key={char.id}
        ref={el => charsRef.current[i] = el}
        className="shuffle-char"
        data-original={char.original}
        data-space={char.isSpace.toString()}
        style={{ 
          display: 'inline-block',
          whiteSpace: char.isSpace ? 'pre' : 'normal'
        }}
      >
        {char.current}
      </span>
    ))
  );
};

export default Shuffle;
