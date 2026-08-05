import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT_STACK, ONDA } from "../../tokens";

const CARDS = [
  {
    num: "01",
    title: "Abra",
    sub: "Descreva seu problema",
    color: "#24cead",
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
        <path
          d="M6 2h8l4 4v14a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"
          stroke="white"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M14 2v4h4" stroke="white" strokeWidth="2" strokeLinejoin="round" />
        <line x1="8" y1="12" x2="16" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="16" x2="13" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Acompanhe",
    sub: "Status em tempo real",
    color: "#32add8",
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
        <path
          d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M13.73 21a2 2 0 01-3.46 0" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Resolva",
    sub: "Confirme quando pronto",
    color: "#4dd9c0",
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
        <path
          d="M8 12l3 3 5-6"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
] as const;

const Card: React.FC<{
  card: (typeof CARDS)[number];
  frame: number;
  delay: number;
  fps: number;
}> = ({ card, frame, delay, fps }) => {
  const localFrame = frame - delay;
  const ySpring = spring({ fps, frame: localFrame, config: { damping: 14 } });
  const opacity = interpolate(localFrame, [0, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (localFrame < 0) return null;

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${(1 - ySpring) * 80}px)`,
        display: "flex",
        alignItems: "center",
        gap: 36,
        background: "rgba(255,255,255,0.06)",
        border: "1.5px solid rgba(255,255,255,0.11)",
        borderRadius: 28,
        padding: "32px 44px",
        width: 860,
      }}
    >
      {/* Icon badge */}
      <div
        style={{
          flexShrink: 0,
          width: 84,
          height: 84,
          borderRadius: "50%",
          background: card.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 8px 24px ${card.color}55`,
        }}
      >
        {card.icon}
      </div>

      {/* Text */}
      <div>
        <div
          style={{
            fontFamily: FONT_STACK,
            fontWeight: 800,
            fontSize: 54,
            color: ONDA.white,
            lineHeight: 1,
          }}
        >
          {card.title}
        </div>
        <div
          style={{
            fontFamily: FONT_STACK,
            fontSize: 30,
            color: "rgba(255,255,255,0.6)",
            marginTop: 8,
          }}
        >
          {card.sub}
        </div>
      </div>
    </div>
  );
};

export const SceneCh03Feature: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerY = spring({ fps, frame, config: { damping: 14 } });
  const headerOp = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          opacity: headerOp,
          transform: `translateY(${(1 - headerY) * 50}px)`,
          textAlign: "center",
          fontFamily: FONT_STACK,
          marginBottom: 52,
        }}
      >
        <div
          style={{
            fontSize: 30,
            color: ONDA.teal,
            letterSpacing: 4,
            textTransform: "uppercase" as const,
            fontWeight: 700,
          }}
        >
          Nova Feature
        </div>
        <div
          style={{
            fontSize: 130,
            fontWeight: 800,
            color: ONDA.white,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            marginTop: 6,
          }}
        >
          Chamados
        </div>
      </div>

      {/* Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {CARDS.map((card, i) => (
          <Card key={card.num} card={card} frame={frame} delay={i * 22} fps={fps} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
