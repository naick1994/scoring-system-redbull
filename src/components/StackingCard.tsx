import { useRef, ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface StackingCardProps {
  index: number;
  totalCards: number;
  children: ReactNode;
}

// Sticky-stacking card: pins to the top of the viewport as it scrolls
// through, then shrinks slightly as the next card scrolls over it, so a
// sequence of these reads as a deck of cards piling up during scroll.
export function StackingCard({ index, totalCards, children }: StackingCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'start start'],
  });

  const targetScale = 1 - (totalCards - 1 - index) * 0.04;
  const scale = useTransform(scrollYProgress, [0, 1], [1, targetScale]);

  return (
    <div
      ref={cardRef}
      className="sticky h-[80vh] flex items-center justify-center px-4"
      style={{ top: `${90 + index * 24}px`, zIndex: index + 1 }}
    >
      <motion.div
        style={{ scale }}
        className="w-full h-full max-w-5xl rounded-[32px] sm:rounded-[40px] border border-white/15 bg-card
                   p-6 sm:p-10 overflow-y-auto shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]"
      >
        {children}
      </motion.div>
    </div>
  );
}
