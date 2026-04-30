import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT_STACK, ONDA } from "../tokens";
import { PhoneMockup } from "../components/PhoneMockup";

export const Scene04Message: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleY = spring({ fps, frame, config: { damping: 14 } });
  const titleOp = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });
  const phoneScale = spring({
    fps,
    frame: frame - 20,
    config: { damping: 14 },
  });
  const exitOp = interpolate(frame, [150, 180], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 180 }}>
      <div
        style={{
          opacity: titleOp * exitOp,
          transform: `translateY(${(1 - titleY) * 80}px)`,
          textAlign: "center",
          color: ONDA.white,
          fontFamily: FONT_STACK,
          fontWeight: 800,
          fontSize: 90,
          lineHeight: 1.05,
          padding: "0 80px",
        }}
      >
        Faça parte da<br />
        <span style={{ color: ONDA.teal }}>Onda</span>
      </div>

      <div
        style={{
          marginTop: 80,
          opacity: exitOp,
          transform: `scale(${phoneScale})`,
        }}
      >
        <PhoneMockup screenshot="screens/login.png" />
      </div>
    </AbsoluteFill>
  );
};
