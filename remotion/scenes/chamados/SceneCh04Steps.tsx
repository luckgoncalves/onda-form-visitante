import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT_STACK, ONDA } from "../../tokens";
import { PhoneMockup } from "../../components/PhoneMockup";
import { ChamadoAbrirScreen } from "../../components/mobile/screens/ChamadoAbrirScreen";
import { ChamadoConfirmScreen } from "../../components/mobile/screens/ChamadoConfirmScreen";
import { ChamadoResolvidoScreen } from "../../components/mobile/screens/ChamadoResolvidoScreen";

const STEPS = [
  { num: "01", label: "Abra", sub: "Descreva seu problema" },
  { num: "02", label: "Enviado", sub: "Chamado registrado" },
  { num: "03", label: "Resolvido", sub: "Confirmado pelo app" },
];

export const SceneCh04Steps: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerY = spring({ fps, frame, config: { damping: 14 } });
  const headerOp = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  // 270 frames total (9s) — ~3s per step, 30-frame crossfades
  const op1 = interpolate(frame, [0, 20, 85, 115], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const op2 = interpolate(frame, [85, 115, 170, 200], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const op3 = interpolate(frame, [170, 200], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const activeStep = frame < 100 ? 0 : frame < 185 ? 1 : 2;

  return (
    <AbsoluteFill>
      {/* Header + dots */}
      <div
        style={{
          position: "absolute",
          top: 70,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: headerOp,
          transform: `translateY(${(1 - headerY) * 40}px)`,
          fontFamily: FONT_STACK,
        }}
      >
        <div
          style={{
            fontSize: 30,
            color: ONDA.teal,
            textTransform: "uppercase" as const,
            letterSpacing: 4,
            fontWeight: 700,
          }}
        >
          Como funciona
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
          {STEPS.map((s, i) => (
            <div
              key={s.num}
              style={{
                width: i === activeStep ? 36 : 10,
                height: 10,
                borderRadius: 5,
                background: i === activeStep ? ONDA.teal : "rgba(255,255,255,0.25)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Phone mockup — absolute, scaled up */}
      <div
        style={{
          position: "absolute",
          top: 200,
          left: "50%",
          transform: "translateX(-50%) scale(1.5)",
          transformOrigin: "top center",
        }}
      >
        <div style={{ position: "relative", width: 540, height: 1100 }}>
          <div style={{ position: "absolute", inset: 0, opacity: op1 }}>
            <PhoneMockup><ChamadoAbrirScreen frameOffset={0} /></PhoneMockup>
          </div>
          <div style={{ position: "absolute", inset: 0, opacity: op2 }}>
            <PhoneMockup><ChamadoConfirmScreen frameOffset={85} /></PhoneMockup>
          </div>
          <div style={{ position: "absolute", inset: 0, opacity: op3 }}>
            <PhoneMockup><ChamadoResolvidoScreen frameOffset={170} /></PhoneMockup>
          </div>
        </div>
      </div>

      {/* Step label — absolute bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONT_STACK,
          height: 110,
        }}
      >
        {STEPS.map((s, i) => (
          <div
            key={s.num}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              opacity: activeStep === i ? 1 : 0,
            }}
          >
            <div style={{ fontSize: 52, fontWeight: 800, color: ONDA.white }}>
              {s.label}
            </div>
            <div style={{ fontSize: 30, color: "rgba(255,255,255,0.6)", marginTop: 6 }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
