import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT_STACK, ONDA } from "../../tokens";

export const SceneCh01Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ fps, frame, config: { damping: 12, stiffness: 100 } });
  const dotPop = spring({ fps, frame: frame - 25, config: { damping: 8 } });
  const badgeY = spring({ fps, frame: frame - 42, config: { damping: 14 } });
  const badgeOp = interpolate(frame, [42, 68], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", flexDirection: "column" }}
    >
      <div
        style={{
          transform: `scale(${logoScale})`,
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
          opacity: badgeOp,
          transform: `translateY(${(1 - badgeY) * 50}px)`,
          marginTop: 48,
          background: ONDA.teal,
          color: ONDA.darkBlue,
          fontFamily: FONT_STACK,
          fontWeight: 800,
          fontSize: 34,
          padding: "18px 56px",
          borderRadius: 100,
          letterSpacing: 2,
          textTransform: "uppercase" as const,
        }}
      >
        Nova Feature
      </div>
    </AbsoluteFill>
  );
};
