// Ambient star-like data field, fixed behind the whole page. Same visual
// language as the ChangeTheTide hero (DATA_DOTS + dataDrift keyframes).
const DATA_DOTS = [
  { x: 6, y: 14, size: 2.5, delay: 0.2, duration: 7, dx: 90, dy: -50 },
  { x: 13, y: 32, size: 2, delay: 1.4, duration: 8.5, dx: -70, dy: 60 },
  { x: 9, y: 55, size: 2, delay: 2.6, duration: 6.5, dx: 110, dy: 30 },
  { x: 17, y: 74, size: 2.5, delay: 0.6, duration: 9, dx: -60, dy: -80 },
  { x: 4, y: 88, size: 2, delay: 1.9, duration: 7.5, dx: 80, dy: -40 },
  { x: 24, y: 18, size: 2, delay: 3.1, duration: 6, dx: -100, dy: 40 },
  { x: 28, y: 46, size: 2.5, delay: 0.3, duration: 8, dx: 60, dy: 90 },
  { x: 21, y: 62, size: 2, delay: 2.2, duration: 7.2, dx: -80, dy: -60 },
  { x: 33, y: 85, size: 2, delay: 1.1, duration: 6.8, dx: 100, dy: -30 },
  { x: 39, y: 10, size: 2, delay: 2.8, duration: 9.2, dx: -50, dy: 100 },
  { x: 45, y: 28, size: 2, delay: 0.8, duration: 6.3, dx: 70, dy: -70 },
  { x: 41, y: 92, size: 2.5, delay: 3.4, duration: 8.1, dx: -110, dy: -20 },
  { x: 52, y: 15, size: 2, delay: 1.6, duration: 7.7, dx: 40, dy: 110 },
  { x: 58, y: 40, size: 2, delay: 2.4, duration: 6.6, dx: -90, dy: 50 },
  { x: 55, y: 68, size: 2.5, delay: 0.5, duration: 8.9, dx: 100, dy: 40 },
  { x: 63, y: 85, size: 2, delay: 1.8, duration: 7.1, dx: -60, dy: -100 },
  { x: 68, y: 22, size: 2.5, delay: 3.0, duration: 6.4, dx: 80, dy: 60 },
  { x: 72, y: 50, size: 2, delay: 0.9, duration: 8.4, dx: -100, dy: -40 },
  { x: 76, y: 12, size: 2, delay: 2.1, duration: 7.4, dx: 50, dy: 90 },
  { x: 79, y: 64, size: 2.5, delay: 1.3, duration: 6.9, dx: -70, dy: 70 },
  { x: 83, y: 34, size: 2, delay: 2.7, duration: 8.6, dx: 90, dy: -50 },
  { x: 87, y: 78, size: 2, delay: 0.4, duration: 7.3, dx: -80, dy: -60 },
  { x: 91, y: 20, size: 2.5, delay: 1.7, duration: 6.2, dx: 60, dy: 100 },
  { x: 94, y: 48, size: 2, delay: 2.9, duration: 8.8, dx: -110, dy: 20 },
  { x: 96, y: 90, size: 2, delay: 0.7, duration: 7.6, dx: 70, dy: -80 },
  { x: 89, y: 58, size: 2, delay: 3.3, duration: 6.7, dx: -50, dy: 90 },
  { x: 62, y: 6, size: 2, delay: 1.0, duration: 9.1, dx: 100, dy: 30 },
  { x: 35, y: 65, size: 2, delay: 2.5, duration: 7.9, dx: -90, dy: -50 },
  { x: 47, y: 80, size: 2, delay: 0.2, duration: 6.1, dx: 80, dy: 60 },
  { x: 14, y: 44, size: 2, delay: 1.5, duration: 8.3, dx: -70, dy: -90 },
];

export function AmbientDataDots() {
  return (
    <>
      <style>{`
        @keyframes dataDrift {
          0% { opacity: 0.1; transform: translate(0, 0); }
          25% { opacity: 0.42; transform: translate(calc(var(--dx, 10px) * 0.6), calc(var(--dy, -10px) * -0.4)); }
          50% { opacity: 0.15; transform: translate(var(--dx, 10px), var(--dy, -10px)); }
          75% { opacity: 0.4; transform: translate(calc(var(--dx, 10px) * 0.3), calc(var(--dy, -10px) * 0.8)); }
          100% { opacity: 0.1; transform: translate(0, 0); }
        }
        .data-dot { animation-name: dataDrift; animation-timing-function: linear; animation-iteration-count: infinite; }
        @media (prefers-reduced-motion: reduce) {
          .data-dot { animation: none; opacity: 0.25; }
        }
      `}</style>
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }} aria-hidden="true">
        {DATA_DOTS.map((d, i) => (
          <span
            key={i}
            className="data-dot absolute rounded-full"
            style={{
              left: `${d.x}%`, top: `${d.y}%`,
              width: d.size, height: d.size,
              background: 'hsl(var(--primary))',
              boxShadow: '0 0 5px 1px hsl(var(--primary) / 0.5)',
              animationDelay: `${d.delay}s`,
              animationDuration: `${d.duration}s`,
              ['--dx' as string]: `${d.dx}px`,
              ['--dy' as string]: `${d.dy}px`,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </>
  );
}
