import { forwardRef } from 'react';

/**
 * LiquidGlassCard - A glassmorphism card component with customizable effects
 * 
 * Props:
 * - glowIntensity: 'none' | 'sm' | 'md' | 'lg' (default: 'sm')
 * - shadowIntensity: 'none' | 'sm' | 'md' | 'lg' (default: 'sm')
 * - blurIntensity: 'sm' | 'md' | 'lg' (default: 'md')
 * - borderRadius: string (default: '16px')
 * - className: additional CSS classes
 * - children: React children
 */
const LiquidGlassCard = forwardRef(({
  children,
  className = '',
  glowIntensity = 'sm',
  shadowIntensity = 'sm',
  blurIntensity = 'md',
  borderRadius = '16px',
  ...props
}, ref) => {
  
  const glowStyles = {
    none: '',
    sm: 'liquid-glass-glow-sm',
    md: 'liquid-glass-glow-md',
    lg: 'liquid-glass-glow-lg',
  };

  const shadowStyles = {
    none: '',
    sm: 'liquid-glass-shadow-sm',
    md: 'liquid-glass-shadow-md',
    lg: 'liquid-glass-shadow-lg',
  };

  const blurStyles = {
    sm: 'liquid-glass-blur-sm',
    md: 'liquid-glass-blur-md',
    lg: 'liquid-glass-blur-lg',
  };

  const classes = [
    'liquid-glass-card',
    glowStyles[glowIntensity],
    shadowStyles[shadowIntensity],
    blurStyles[blurIntensity],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div 
      ref={ref}
      className={classes}
      style={{ borderRadius }}
      {...props}
    >
      {children}
    </div>
  );
});

LiquidGlassCard.displayName = 'LiquidGlassCard';

export default LiquidGlassCard;
