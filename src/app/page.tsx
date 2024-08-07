'use client';

import ButtonForm from "@/components/button-form";
import StepOne from "@/components/step-one";
import StepTwo from "@/components/step-two";
import StepZero from "@/components/step-zero";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function Home() {
  const form = useForm({
    defaultValues:{
      interesse_em_conhecer: [],
    }
  });
  const [step, setStep ] = useState(0);

  const submitAction = form.handleSubmit(async (formData) => {
    console.log('formData',formData);
  });
  return (
    <main className="flex w-full h-[100%]  min-h-screen flex-col  items-center gap-4 p-4">
      <h1>Ficha - visitantes</h1>
      <Card className="p-4 w-full backdrop-blur-sm bg-white/30  border-none card-glass">
      <Form {...form}>
        <form onSubmit={submitAction}>
          {step === 0 && <StepZero {...form}/>}
          {step === 1 && <StepOne {...form} />}
          {step === 2 && <StepTwo {...form}/>}
      
          {step === 2 && (
            <ButtonForm type="submit" label="Salvar"/>
          )}
          {step < 2 && (
            <ButtonForm type="button" onClick={() => setStep(step + 1)} label="Próximo"/>
          )}
        </form>
        </Form>
      </Card>
    </main>
  );
}
