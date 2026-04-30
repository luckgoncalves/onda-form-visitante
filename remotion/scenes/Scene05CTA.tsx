import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT_STACK, ONDA } from "../tokens";

export const Scene05CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ fps, frame, config: { damping: 10 } });
  const btnScale = spring({
    fps,
    frame: frame - 25,
    config: { damping: 8 },
  });
  const pulse = 1 + Math.sin(frame / 6) * 0.04;
  const ctaOp = interpolate(frame, [25, 50], [0, 1], {
    extrapolateRight: "clamp",
  });
  const subOp = interpolate(frame, [40, 65], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          transform: `scale(${logoScale})`,
          fontFamily: FONT_STACK,
          fontWeight: 800,
          fontSize: 220,
          color: ONDA.white,
          letterSpacing: "-0.1em",
          lineHeight: 1,
        }}
      >
        onda<span style={{ color: ONDA.teal }}>.</span>
      </div>
      <div
        style={{
          opacity: subOp,
          color: "rgba(255,255,255,0.8)",
          fontFamily: FONT_STACK,
          fontSize: 32,
          marginTop: 20,
          letterSpacing: 4,
          textTransform: "uppercase",
        }}
      >
        Faça parte
      </div>
      <div
        style={{
          opacity: ctaOp,
          marginTop: 60,
          transform: `scale(${btnScale * pulse})`,
          background: ONDA.teal,
          color: ONDA.darkBlue,
          fontFamily: FONT_STACK,
          fontWeight: 800,
          fontSize: 48,
          padding: "32px 80px",
          borderRadius: 100,
          boxShadow: `0 20px 60px rgba(36, 206, 173, 0.5)`,
        }}
      >
        Acesse agora
      </div>
    </AbsoluteFill>
  );
};
