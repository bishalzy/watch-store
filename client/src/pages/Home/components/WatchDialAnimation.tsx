export function WatchDialAnimation() {
  return (
    <svg viewBox="0 0 320 320" className="w-[260px] h-[260px] xl:w-[340px] xl:h-[340px]">
      <circle cx="160" cy="160" r="150" fill="none" stroke="#F2EDE4" strokeOpacity="0.15" strokeWidth="1.5" />
      <circle cx="160" cy="160" r="118" fill="none" stroke="#F2EDE4" strokeOpacity="0.1" strokeWidth="1" />
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const outer = 150, inner = i % 3 === 0 ? 132 : 140;
        return (
          <line
            key={i}
            x1={160 + outer * Math.sin(angle)}
            y1={160 - outer * Math.cos(angle)}
            x2={160 + inner * Math.sin(angle)}
            y2={160 - inner * Math.cos(angle)}
            stroke="#F2EDE4"
            strokeOpacity={i % 3 === 0 ? 0.55 : 0.25}
            strokeWidth={i % 3 === 0 ? 2 : 1}
          />
        );
      })}
      {/* hour + minute hands, static */}
      <line x1="160" y1="160" x2="160" y2="90" stroke="#F2EDE4" strokeWidth="3" strokeLinecap="round" />
      <line x1="160" y1="160" x2="205" y2="160" stroke="#F2EDE4" strokeWidth="2.5" strokeLinecap="round" />
      {/* second hand, the one deliberate motion moment */}
      <line x1="160" y1="160" x2="160" y2="60" stroke="#1BDDF3" strokeWidth="1.5" strokeLinecap="round" className="origin-[160px_160px] animate-[spin_60s_linear_infinite]" />
      <circle cx="160" cy="160" r="4" fill="#1BDDF3" />
    </svg>
  );
}
