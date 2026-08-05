import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT_STACK, ONDA } from "../../tokens";

export const SceneCh05CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ fps, frame, config: { damping: 10 } });
  const subOp = interpolate(frame, [20, 50], [0, 1], { extrapolateRight: "clamp" });
  const btnScale = spring({ fps, frame: frame - 30, config: { damping: 8 } });
  const pulse = 1 + Math.sin(frame / 6) * 0.04;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      {/* Logo */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          fontFamily: FONT_STACK,
          fontWeight: 800,
          fontSize: 180,
          color: ONDA.white,
          letterSpacing: "-0.1em",
          lineHeight: 1,
          display: "flex",
          alignItems: "baseline",
        }}
      >
        onda
        <span
          style={{
            display: "inline-block",
            width: "0.22em",
            height: "0.22em",
            marginLeft: "0.06em",
            borderRadius: "50%",
            background: ONDA.teal,
          }}
        />
      </div>

      {/* Subtitle */}
      <div
        style={{
          opacity: subOp,
          color: "rgba(255,255,255,0.75)",
          fontFamily: FONT_STACK,
          fontSize: 34,
          marginTop: 24,
          letterSpacing: 3,
          textTransform: "uppercase" as const,
        }}
      >
        Disponível no app agora
      </div>

      {/* CTA Button */}
      <div
        style={{
          marginTop: 72,
          transform: `scale(${btnScale * pulse})`,
          background: ONDA.teal,
          color: ONDA.darkBlue,
          fontFamily: FONT_STACK,
          fontWeight: 800,
          fontSize: 48,
          padding: "36px 88px",
          borderRadius: 100,
          boxShadow: `0 20px 60px rgba(36, 206, 173, 0.5)`,
        }}
      >
        Abra um chamado
      </div>
    </AbsoluteFill>
  );
};
