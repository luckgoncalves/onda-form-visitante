import React, { useEffect, useState } from "react";
import { AbsoluteFill, Sequence, continueRender, delayRender } from "remotion";
import { ONDA } from "./tokens";
import { loadOndaFonts } from "./fonts";
import { WaveBackground } from "./components/WaveBackground";
import { Scene01Logo } from "./scenes/Scene01Logo";
import { Scene02Tagline } from "./scenes/Scene02Tagline";
import { Scene03Empresas } from "./scenes/Scene03Empresas";
import { Scene04Message } from "./scenes/Scene04Message";
import { Scene05CTA } from "./scenes/Scene05CTA";

export const OndaOnboarding: React.FC = () => {
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
      <WaveBackground />

      <Sequence from={0} durationInFrames={90} name="01 · Logo">
        <Scene01Logo />
      </Sequence>

      <Sequence from={90} durationInFrames={180} name="02 · Tagline">
        <Scene02Tagline />
      </Sequence>

      <Sequence from={270} durationInFrames={270} name="03 · Empresas">
        <Scene03Empresas />
      </Sequence>

      <Sequence from={540} durationInFrames={180} name="04 · Mensagem">
        <Scene04Message />
      </Sequence>

      <Sequence from={720} durationInFrames={120} name="05 · CTA">
        <Scene05CTA />
      </Sequence>
    </AbsoluteFill>
  );
};
