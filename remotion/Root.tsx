import React from "react";
import { Composition } from "remotion";
import { OndaOnboarding } from "./OndaOnboarding";
import { ChamadosFeature, CHAMADOS_DURATION } from "./ChamadosFeature";
import { FPS, HEIGHT, TOTAL_DURATION, WIDTH } from "./tokens";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="OndaOnboarding"
        component={OndaOnboarding}
        durationInFrames={TOTAL_DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="OndaOnboardingSquare"
        component={OndaOnboarding}
        durationInFrames={TOTAL_DURATION}
        fps={FPS}
        width={1080}
        height={1080}
      />
      <Composition
        id="ChamadosFeature"
        component={ChamadosFeature}
        durationInFrames={CHAMADOS_DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </>
  );
};
