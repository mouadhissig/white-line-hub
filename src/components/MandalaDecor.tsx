const goldColor = "#D4A84B";

interface Props {
  /** "light" for white/muted backgrounds, "dark" for black/foreground backgrounds */
  theme?: "light" | "dark";
  /** Placement variant to avoid repetition across sections */
  variant?: "a" | "b" | "c" | "d";
}

/** Quarter-mandala arc path for corner placement */
const MandalaQuarter = ({ size, color, opacity }: { size: number; color: string; opacity: number }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" opacity={opacity}>
    {/* Outer arc */}
    <path d="M0 200 A200 200 0 0 1 200 0" stroke={color} strokeWidth="1.5" fill="none" />
    <path d="M0 200 A170 170 0 0 1 170 0" stroke={color} strokeWidth="1" fill="none" />
    <path d="M0 200 A140 140 0 0 1 140 0" stroke={color} strokeWidth="0.8" fill="none" />
    {/* Petal shapes along the arc */}
    <path d="M30 170 Q60 140 50 110 Q70 130 100 120 Q80 150 90 180 Q60 160 30 170Z" fill={color} opacity="0.3" />
    <path d="M110 90 Q130 60 120 30 Q140 50 170 40 Q150 70 160 100 Q130 80 110 90Z" fill={color} opacity="0.25" />
    {/* Small dots along arcs */}
    <circle cx="50" cy="175" r="3" fill={color} opacity="0.4" />
    <circle cx="100" cy="140" r="2.5" fill={color} opacity="0.35" />
    <circle cx="140" cy="100" r="2.5" fill={color} opacity="0.35" />
    <circle cx="175" cy="50" r="3" fill={color} opacity="0.4" />
    {/* Inner decorative lines */}
    <path d="M0 200 A110 110 0 0 1 110 0" stroke={color} strokeWidth="0.5" fill="none" strokeDasharray="4 6" />
    <path d="M0 200 A80 80 0 0 1 80 0" stroke={color} strokeWidth="0.5" fill="none" />
    {/* Small star accents */}
    <path d="M70 155 l2 5 5 0 -4 3 2 5 -5-3 -5 3 2-5 -4-3 5 0z" fill={color} opacity="0.3" />
    <path d="M155 70 l2 5 5 0 -4 3 2 5 -5-3 -5 3 2-5 -4-3 5 0z" fill={color} opacity="0.3" />
  </svg>
);

const configs = {
  a: [
    { corner: "top-left" as const, size: 180, opacity: 0.06 },
    { corner: "bottom-right" as const, size: 140, opacity: 0.04 },
  ],
  b: [
    { corner: "top-right" as const, size: 160, opacity: 0.05 },
    { corner: "bottom-left" as const, size: 120, opacity: 0.04 },
  ],
  c: [
    { corner: "bottom-left" as const, size: 170, opacity: 0.05 },
    { corner: "top-right" as const, size: 130, opacity: 0.04 },
  ],
  d: [
    { corner: "top-left" as const, size: 150, opacity: 0.05 },
    { corner: "bottom-right" as const, size: 160, opacity: 0.045 },
  ],
};

const cornerStyles: Record<string, React.CSSProperties> = {
  "top-left": { position: "absolute", top: 0, left: 0, transform: "rotate(0deg)" },
  "top-right": { position: "absolute", top: 0, right: 0, transform: "rotate(90deg)" },
  "bottom-right": { position: "absolute", bottom: 0, right: 0, transform: "rotate(180deg)" },
  "bottom-left": { position: "absolute", bottom: 0, left: 0, transform: "rotate(270deg)" },
};

const MandalaDecor = ({ theme = "light", variant = "a" }: Props) => {
  const color = theme === "dark" ? "rgba(212,168,75,0.7)" : goldColor;
  const items = configs[variant];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {items.map((item, i) => (
        <div key={i} style={cornerStyles[item.corner]}>
          <MandalaQuarter
            size={item.size}
            color={color}
            opacity={theme === "dark" ? item.opacity * 0.7 : item.opacity}
          />
        </div>
      ))}
    </div>
  );
};

export default MandalaDecor;
