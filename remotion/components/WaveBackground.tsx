import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ONDA } from "../tokens";

export const WaveBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const offset = (frame * 0.6) % 200;

  return (
    <AbsoluteFill style={{ opacity: 0.12 }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920">
        <defs>
          <pattern
            id="onda-wave"
            x={offset}
            y="0"
            width="200"
            height="200"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 100 Q 50 60, 100 100 T 200 100"
              stroke={ONDA.skyBlue}
              strokeWidth="2"
              fill="none"
            />
          </pattern>
        </defs>
        <rect width="1080" height="1920" fill="url(#onda-wave)" />
      </svg>
    </AbsoluteFill>
  );
};
