import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT_STACK, ONDA } from "../../tokens";

const Ring: React.FC<{ frame: number; offset: number; size: number }> = ({
  frame,
  offset,
  size,
}) => {
  const cycle = 90; // frames per pulse
  const phase = ((frame + offset) % cycle) / cycle;
  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: "50%",
        border: `3px solid ${ONDA.teal}`,
        opacity: (1 - phase) * 0.45,
        transform: `translate(-50%, -50%) scale(${0.3 + phase * 0.7})`,
        left: "50%",
        top: "50%",
      }}
    />
  );
};

export const SceneCh02Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const textY = spring({ fps, frame: frame - 30, config: { damping: 14 } });
  const textOp = interpolate(frame, [30, 60], [0, 1], { extrapolateRight: "clamp" });
  const subOp = interpolate(frame, [60, 90], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      {/* Pulsing ripple rings */}
      <AbsoluteFill>
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <Ring frame={frame} offset={0} size={400} />
          <Ring frame={frame} offset={30} size={680} />
          <Ring frame={frame} offset={60} size={960} />
        </div>
      </AbsoluteFill>

      {/* Text content */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            opacity: textOp,
            transform: `translateY(${(1 - textY) * 80}px)`,
            textAlign: "center",
            fontFamily: FONT_STACK,
            color: ONDA.white,
            padding: "0 80px",
          }}
        >
          <div
            style={{ fontSize: 96, fontWeight: 800, lineHeight: 1.1 }}
          >
            Conecte sua
            <br />
            necessidade
            <br />
            <span style={{ color: ONDA.teal }}>com quem</span>
            <br />
            pode ajudar
          </div>
          <div
            style={{
              opacity: subOp,
              fontSize: 38,
              marginTop: 36,
              fontWeight: 500,
              color: "rgba(255,255,255,0.65)",
            }}
          >
            Temos uma solução.
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
