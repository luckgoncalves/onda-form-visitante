import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Html5Audio,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
} from "remotion";
import { FPS, ONDA } from "./tokens";
import { loadOndaFonts } from "./fonts";
import { WaveBackground } from "./components/WaveBackground";
import { SceneCh01Intro } from "./scenes/chamados/SceneCh01Intro";
import { SceneCh02Hook } from "./scenes/chamados/SceneCh02Hook";
import { SceneCh03Feature } from "./scenes/chamados/SceneCh03Feature";
import { SceneCh04Steps } from "./scenes/chamados/SceneCh04Steps";
import { SceneCh05CTA } from "./scenes/chamados/SceneCh05CTA";

const TARGET_VOLUME = 0.35;
const FADE_FRAMES = FPS;
export const CHAMADOS_DURATION = 900; // 30s @ 30fps

export const ChamadosFeature: React.FC = () => {
  const [handle] = useState(() => delayRender("Loading Onda fonts"));

  useEffect(() => {
    loadOndaFonts().finally(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${ONDA.darkBlue} 0%, #001540 100%)`,
      }}
    >
      <Html5Audio
        src={staticFile("audio/trilha.mp3")}
        volume={(f) =>
          interpolate(
            f,
            [0, FADE_FRAMES, CHAMADOS_DURATION - FADE_FRAMES, CHAMADOS_DURATION],
            [0, TARGET_VOLUME, TARGET_VOLUME, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          )
        }
      />

      <WaveBackground />

      {/* 0-90 (3s): Logo + "Nova Feature" badge */}
      <Sequence from={0} durationInFrames={90} name="01 · Intro">
        <SceneCh01Intro />
      </Sequence>

      {/* 90-270 (6s): "Precisa de suporte?" + ripple */}
      <Sequence from={90} durationInFrames={180} name="02 · Hook">
        <SceneCh02Hook />
      </Sequence>

      {/* 270-450 (6s): Cards glassmorphism */}
      <Sequence from={270} durationInFrames={180} name="03 · Feature">
        <SceneCh03Feature />
      </Sequence>

      {/* 450-720 (9s): Como funciona */}
      <Sequence from={450} durationInFrames={270} name="04 · Como funciona">
        <SceneCh04Steps />
      </Sequence>

      {/* 720-900 (6s): CTA final */}
      <Sequence from={720} durationInFrames={180} name="05 · CTA">
        <SceneCh05CTA />
      </Sequence>
    </AbsoluteFill>
  );
};
