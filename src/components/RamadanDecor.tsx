const goldColor = "#D4A84B";

interface Props {
  variant?: "a" | "b" | "c";
}

const RamadanDecor = ({ variant = "a" }: Props) => {
  const configs = {
    a: [
      { top: "5%", left: "3%", size: 140, opacity: 0.04, type: "crescent" as const },
      { bottom: "8%", right: "5%", size: 100, opacity: 0.035, type: "star" as const },
      { top: "60%", left: "85%", size: 160, opacity: 0.03, type: "lantern" as const },
    ],
    b: [
      { top: "10%", right: "4%", size: 120, opacity: 0.04, type: "lantern" as const },
      { bottom: "10%", left: "6%", size: 90, opacity: 0.035, type: "star" as const },
      { top: "40%", right: "80%", size: 130, opacity: 0.03, type: "crescent" as const },
    ],
    c: [
      { top: "8%", right: "6%", size: 110, opacity: 0.04, type: "star" as const },
      { bottom: "5%", left: "4%", size: 150, opacity: 0.035, type: "lantern" as const },
      { top: "50%", left: "90%", size: 100, opacity: 0.03, type: "crescent" as const },
    ],
  };

  const items = configs[variant];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {items.map((item, i) => {
        const style: React.CSSProperties = {
          position: "absolute",
          opacity: item.opacity,
          ...(item.top && { top: item.top }),
          ...(item.bottom && { bottom: item.bottom }),
          ...(item.left && { left: item.left }),
          ...(item.right && { right: item.right }),
        };

        return (
          <div key={i} style={style}>
            {item.type === "crescent" && (
              <svg width={item.size} height={item.size} viewBox="0 0 16 16" fill="none">
                <path
                  d="M10 1C5.6 1 2 4.6 2 9s3.6 8 8 8c1.8 0 3.4-.6 4.8-1.5C13.2 14 12 11.6 12 9s1.2-5 2.8-6.5C13.4 1.6 11.8 1 10 1z"
                  fill={goldColor}
                />
              </svg>
            )}
            {item.type === "star" && (
              <svg width={item.size} height={item.size} viewBox="0 0 14 14" fill="none">
                <path
                  d="M7 0l1.8 4.6L14 5.2l-3.7 3.2 1.1 5.1L7 10.8 2.6 13.5l1.1-5.1L0 5.2l5.2-.6z"
                  fill={goldColor}
                />
              </svg>
            )}
            {item.type === "lantern" && (
              <svg width={item.size * 0.75} height={item.size} viewBox="0 0 18 24" fill="none">
                <line x1="9" y1="0" x2="9" y2="4" stroke={goldColor} strokeWidth="1.5" />
                <path d="M6 4 Q6 2 9 2 Q12 2 12 4" stroke={goldColor} strokeWidth="1" fill="none" />
                <rect x="5" y="4" width="8" height="12" rx="3" fill={goldColor} />
                <rect x="7" y="6" width="4" height="8" rx="1.5" fill="white" opacity="0.2" />
                <path d="M5 16 Q9 20 13 16" stroke={goldColor} strokeWidth="1" fill={goldColor} />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default RamadanDecor;
