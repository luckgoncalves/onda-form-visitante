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
import { save } from "../actions";
import Done from "@/components/done";
import { zodResolver } from "@hookform/resolvers/zod";
import { step1Schema, step2Schema, step3Schema } from "./validate";

export default function Home() {
  const [step, setStep ] = useState(0);
  const form = useForm({
    resolver: zodResolver(step === 0 ? step1Schema : step === 1 ? step2Schema : step3Schema),
    defaultValues:{
      interesse_em_conhecer: [],
    }
  });
  console.log('errors', form.formState.errors);

  const submitAction = form.handleSubmit(async (formData) => {
    console.log('formData',formData);
    if (step < 3) {
      setStep((prev) => prev + 1);
    } else {
      await save(formData);
      setStep((prev) =>  prev + 1);
    }
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
          {step === 3 && <Done />}
      
          <div className="flex flex-col-reverse gap-4">
            {step > 0 && step < 3 && (
              <ButtonForm className="w-full" type="button" onClick={() => setStep(step - 1)} label="Voltar"/>
            )}
            {/* {step === 2 && (
            )} */}
            <ButtonForm type="submit" label={step < 2 ? "Próximo" : "Salvar"}/>
            
            {/* {step < 2 && (
              <ButtonForm className="w-full" type="button" onClick={() => setStep(step + 1)} label="Próximo"/>
            )} */}
          </div>
        </form>
        </Form>
      </Card>
    </main>
  );
}
