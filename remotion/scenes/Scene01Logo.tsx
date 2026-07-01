import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT_STACK, ONDA } from "../tokens";

export const Scene01Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    fps,
    frame,
    config: { damping: 12, stiffness: 100 },
  });
  const dotPop = spring({
    fps,
    frame: frame - 25,
    config: { damping: 8 },
  });
  const tagOpacity = interpolate(frame, [40, 70], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          transform: `scale(${scale})`,
          fontFamily: FONT_STACK,
          fontWeight: 800,
          fontSize: 220,
          color: ONDA.white,
          letterSpacing: "-0.1em",
          display: "flex",
          alignItems: "baseline",
          lineHeight: 1,
        }}
      >
        onda
        <span
          style={{
            transform: `scale(${dotPop})`,
            display: "inline-block",
            width: "0.22em",
            height: "0.22em",
            marginLeft: "0.06em",
            borderRadius: "50%",
            background: ONDA.white,
          }}
        />
      </div>
      <div
        style={{
          opacity: tagOpacity,
          color: "rgba(255,255,255,0.8)",
          fontFamily: FONT_STACK,
          fontSize: 36,
          marginTop: 24,
          letterSpacing: 4,
          textTransform: "uppercase",
        }}
      >
        Comunidade · Conexão
      </div>
    </AbsoluteFill>
  );
};
