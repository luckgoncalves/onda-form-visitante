import React from "react";

const NAVY = "#11187e";

export const MobileAppHeader: React.FC = () => (
  <div
    style={{
      height: 56,
      background: NAVY,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
      flexShrink: 0,
    }}
  >
    {/* "igreja onda" wordmark */}
    <div style={{ display: "flex", alignItems: "baseline" }}>
      <span
        style={{
          color: "white",
          fontSize: 21,
          fontWeight: 400,
          fontFamily: "'Inter', -apple-system, sans-serif",
          letterSpacing: "-0.02em",
        }}
      >
        igreja
      </span>
      <span
        style={{
          color: "white",
          fontSize: 21,
          fontWeight: 700,
          fontFamily: "'Inter', -apple-system, sans-serif",
          letterSpacing: "-0.02em",
        }}
      >
        onda
      </span>
    </div>

    {/* Device / scan icon */}
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="1" width="14" height="22" rx="3" stroke="white" strokeWidth="1.8" />
      <line x1="9" y1="5" x2="15" y2="5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="18" r="1.2" fill="white" />
    </svg>
  </div>
);
