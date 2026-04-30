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

export const Scene02Tagline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleY = spring({ fps, frame, config: { damping: 14 } });
  const phoneRise = spring({
    fps,
    frame: frame - 25,
    config: { damping: 16 },
  });
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 180 }}>
      <div
        style={{
          opacity: titleOpacity,
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
        Conecte-se com
        <br />
        sua <span style={{ color: ONDA.teal }}>comunidade</span>
      </div>

      <div
        style={{
          marginTop: 80,
          transform: `translateY(${(1 - phoneRise) * 600}px)`,
        }}
      >
        <PhoneMockup screenshot="screens/home.png" />
      </div>
    </AbsoluteFill>
  );
};
