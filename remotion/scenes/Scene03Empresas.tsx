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

export const Scene03Empresas: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerY = spring({ fps, frame, config: { damping: 14 } });
  const headerOp = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const scrollY = interpolate(frame, [60, 230], [0, 80], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fingerOpacity = interpolate(
    frame,
    [55, 70, 220, 240],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const fingerY = interpolate(frame, [60, 230], [-150, -350], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 120 }}>
      <div
        style={{
          opacity: headerOp,
          transform: `translateY(${(1 - headerY) * 60}px)`,
          textAlign: "center",
          color: ONDA.white,
          fontFamily: FONT_STACK,
        }}
      >
        <div
          style={{
            fontSize: 32,
            color: ONDA.teal,
            letterSpacing: 4,
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          Em destaque
        </div>
        <div style={{ fontSize: 96, fontWeight: 800, marginTop: 8, lineHeight: 1 }}>
          Empresas
        </div>
      </div>

      <div style={{ marginTop: 60, position: "relative" }}>
        <PhoneMockup screenshot="screens/empresas.png" scrollY={scrollY} />

        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: "50%",
            transform: `translate(-50%, ${fingerY}px)`,
            opacity: fingerOpacity,
            width: 80,
            height: 80,
            borderRadius: 40,
            background: "rgba(255,255,255,0.85)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            border: "4px solid rgba(36, 206, 173, 0.6)",
            pointerEvents: "none",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
