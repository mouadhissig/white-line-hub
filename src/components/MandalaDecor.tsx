const goldColor = "#D4A84B";

interface Props {
  theme?: "light" | "dark";
  variant?: "a" | "b" | "c" | "d";
}

const MandalaQuarter = ({ size, color, opacity }: { size: number; color: string; opacity: number }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" opacity={opacity}>
    {/* Concentric arcs */}
    <path d="M0 200 A200 200 0 0 1 200 0" stroke={color} strokeWidth="2" fill="none" />
    <path d="M0 200 A170 170 0 0 1 170 0" stroke={color} strokeWidth="1.5" fill="none" />
    <path d="M0 200 A140 140 0 0 1 140 0" stroke={color} strokeWidth="1.2" fill="none" />
    <path d="M0 200 A110 110 0 0 1 110 0" stroke={color} strokeWidth="1" fill="none" strokeDasharray="6 4" />
    <path d="M0 200 A80 80 0 0 1 80 0" stroke={color} strokeWidth="0.8" fill="none" />
    <path d="M0 200 A50 50 0 0 1 50 0" stroke={color} strokeWidth="0.6" fill="none" strokeDasharray="3 5" />

    {/* Petal / leaf shapes */}
    <path d="M25 175 Q55 145 45 105 Q65 130 95 115 Q75 150 85 185 Q55 165 25 175Z" fill={color} opacity="0.5" />
    <path d="M105 95 Q130 65 115 25 Q140 50 175 35 Q155 70 165 105 Q135 85 105 95Z" fill={color} opacity="0.45" />
    <path d="M60 140 Q80 120 70 95 Q85 110 105 100 Q95 125 100 145 Q80 135 60 140Z" fill={color} opacity="0.35" />

    {/* Dots along the arcs */}
    <circle cx="35" cy="185" r="4" fill={color} opacity="0.6" />
    <circle cx="70" cy="165" r="3" fill={color} opacity="0.5" />
    <circle cx="100" cy="140" r="3.5" fill={color} opacity="0.5" />
    <circle cx="130" cy="110" r="3" fill={color} opacity="0.5" />
    <circle cx="155" cy="75" r="3.5" fill={color} opacity="0.5" />
    <circle cx="180" cy="40" r="4" fill={color} opacity="0.6" />

    {/* Star accents */}
    <path d="M55 160 l3 6 6 0 -5 4 2 6 -6-4 -6 4 2-6 -5-4 6 0z" fill={color} opacity="0.5" />
    <path d="M160 55 l3 6 6 0 -5 4 2 6 -6-4 -6 4 2-6 -5-4 6 0z" fill={color} opacity="0.5" />
    <path d="M110 120 l2 4 4 0 -3 3 1 4 -4-3 -4 3 1-4 -3-3 4 0z" fill={color} opacity="0.4" />

    {/* Tiny crescent accent */}
    <path d="M140 60 A12 12 0 1 0 150 75 A8 8 0 1 1 140 60Z" fill={color} opacity="0.4" />
  </svg>
);

const configs = {
  a: [
    { corner: "top-left" as const, size: 280, opacity: 0.25 },
    { corner: "bottom-right" as const, size: 220, opacity: 0.18 },
  ],
  b: [
    { corner: "top-right" as const, size: 260, opacity: 0.22 },
    { corner: "bottom-left" as const, size: 200, opacity: 0.18 },
  ],
  c: [
    { corner: "bottom-left" as const, size: 270, opacity: 0.22 },
    { corner: "top-right" as const, size: 210, opacity: 0.18 },
  ],
  d: [
    { corner: "top-left" as const, size: 240, opacity: 0.22 },
    { corner: "bottom-right" as const, size: 250, opacity: 0.20 },
  ],
};

const cornerStyles: Record<string, React.CSSProperties> = {
  "top-left": { position: "absolute", top: 0, left: 0, transform: "rotate(0deg)" },
  "top-right": { position: "absolute", top: 0, right: 0, transform: "rotate(90deg)" },
  "bottom-right": { position: "absolute", bottom: 0, right: 0, transform: "rotate(180deg)" },
  "bottom-left": { position: "absolute", bottom: 0, left: 0, transform: "rotate(270deg)" },
};

const MandalaDecor = ({ theme = "light", variant = "a" }: Props) => {
  const color = theme === "dark" ? "rgba(212,168,75,0.8)" : goldColor;
  const items = configs[variant];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {items.map((item, i) => (
        <div key={i} style={cornerStyles[item.corner]}>
          <MandalaQuarter
            size={item.size}
            color={color}
            opacity={theme === "dark" ? item.opacity * 0.6 : item.opacity}
          />
        </div>
      ))}
    </div>
  );
};

export default MandalaDecor;
