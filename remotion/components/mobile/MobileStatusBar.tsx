import React from "react";

const NAVY = "#11187e";

interface MobileStatusBarProps {
  time?: string;
  bg?: string;
}

export const MobileStatusBar: React.FC<MobileStatusBarProps> = ({
  time = "09:40",
  bg = NAVY,
}) => (
  <div
    style={{
      height: 44,
      background: bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 22px",
      flexShrink: 0,
    }}
  >
    {/* Time + muted bell */}
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          color: "white",
          fontSize: 15,
          fontWeight: 600,
          fontFamily: "-apple-system, 'SF Pro Display', sans-serif",
          letterSpacing: "0.02em",
        }}
      >
        {time}
      </span>
      {/* Muted bell icon */}
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <path
          d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M13.73 21a2 2 0 01-3.46 0" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <line x1="3" y1="3" x2="21" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>

    {/* Signal + WiFi + Battery */}
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      {/* Signal bars */}
      <svg width="18" height="13" viewBox="0 0 18 13" fill="white">
        <rect x="0" y="8" width="3" height="5" rx="1" />
        <rect x="5" y="5.5" width="3" height="7.5" rx="1" />
        <rect x="10" y="3" width="3" height="10" rx="1" />
        <rect x="15" y="0" width="3" height="13" rx="1" opacity="0.35" />
      </svg>

      {/* WiFi */}
      <svg width="16" height="12" viewBox="0 0 24 18" fill="none">
        <path
          d="M12 14a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"
          fill="white"
        />
        <path
          d="M5.6 9.4C7 7.9 9.4 7 12 7s5 .9 6.4 2.4"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M1.4 5.2C4 2.5 7.8 1 12 1s8 1.5 10.6 4.2"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.65"
        />
      </svg>

      {/* Battery */}
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        <div
          style={{
            width: 24,
            height: 12,
            borderRadius: 3,
            border: "1.5px solid rgba(255,255,255,0.75)",
            padding: "1.5px 2px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "82%",
              height: "100%",
              background: "white",
              borderRadius: 1.5,
            }}
          />
        </div>
        <div
          style={{
            width: 2.5,
            height: 5,
            background: "rgba(255,255,255,0.65)",
            borderRadius: 1,
          }}
        />
      </div>
    </div>
  </div>
);
