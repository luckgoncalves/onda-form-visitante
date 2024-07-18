'use client';

import ButtonForm from "@/components/button-form";
import StepOne from "@/components/step-one";
import StepTwo from "@/components/step-two";
import StepZero from "@/components/step-zero";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";

export default function Home() {
  const [step, setStep ] = useState(0);
  return (
    <main className="flex w-full h-[100%]  min-h-screen flex-col  items-center gap-4 p-4">
      <h1>Ficha - visitantes</h1>
      <Card className="p-4 w-full backdrop-blur-sm bg-white/30  border-none card-glass">
        <form>
          {step === 0 && <StepZero />}
          {step === 1 && <StepOne/>}
          {step === 2 && <StepTwo/>}
      
          {step === 2 && (
            <ButtonForm type="submit" label="Salvar"/>
          )}
          {step < 2 && (
            <ButtonForm type="button" onClick={() => setStep(step + 1)} label="Próximo"/>
          )}
        </form>
      </Card>
    </main>
  );
}
