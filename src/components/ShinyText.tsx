import { motion } from 'framer-motion';

interface ShinyTextProps {
  text: string;
  baseColor: string;
  shineColor: string;
  accentColor?: string;
  speed?: number;
  className?: string;
}

// Animated shimmer-sweep text: a gradient band (base -> shine -> base, or
// base -> shine -> accent -> base if accentColor is set) slides across the
// text on a loop by animating backgroundPosition on an oversized
// background-size gradient, clipped to the text itself.
export function ShinyText({ text, baseColor, shineColor, accentColor, speed = 3, className }: ShinyTextProps) {
  const gradient = accentColor
    ? `linear-gradient(100deg, ${baseColor} 30%, ${shineColor} 50%, ${accentColor} 60%, ${baseColor} 80%)`
    : `linear-gradient(100deg, ${baseColor} 12%, ${shineColor} 42%, ${shineColor} 58%, ${baseColor} 88%)`;

  return (
    <motion.span
      className={className}
      style={{
        backgroundImage: gradient,
        backgroundSize: '200% 100%',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        WebkitTextFillColor: 'transparent',
      }}
      animate={{ backgroundPosition: ['200% 0%', '-200% 0%'] }}
      transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
    >
      {text.split('\n').map((line, i, arr) => (
        <span key={i}>
          {line}
          {i < arr.length - 1 && <br />}
        </span>
      ))}
    </motion.span>
  );
}
