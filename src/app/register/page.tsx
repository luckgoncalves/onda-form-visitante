'use client';

import { useEffect, useState } from "react";
import ButtonForm from "@/components/button-form";
import StepOne from "@/components/step-one";
import StepTwo from "@/components/step-two";
import StepZero from "@/components/step-zero";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { checkAuth, save } from "../actions";
import Done from "@/components/done";
import { zodResolver } from "@hookform/resolvers/zod";
import { step1Schema, step2Schema, step3Schema } from "./validate";
import { useRouter } from "next/navigation";

export default function Home() {
  const [step, setStep] = useState(0);
  const [userName, setUserName] = useState("");
  const router = useRouter();
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(step === 0 ? step1Schema : step === 1 ? step2Schema : step3Schema),
    defaultValues: {
      interesse_em_conhecer: [],
      ...formData, // Inicialize o formulário com os dados salvos
    },
    mode: 'onBlur'
  });

  useEffect(() => {
    async function checkAdminAccess() {
      const { isAuthenticated, user } = await checkAuth();
      
      if (!isAuthenticated || !user) {
        router.push('/');
        return;
      }

      if (user) {
        setUserName(user.name);
      }
    }
    checkAdminAccess();
  }, [router]);

  useEffect(() => {
    const firstError = Object.keys(form.formState.errors)[0];
    if (firstError) {
      form.setFocus(firstError as any);
    }
  }, [form, form.formState.errors]);

  const submitAction = form.handleSubmit(async (stepData) => {
    const updatedFormData = { ...formData, ...stepData };
    setFormData(updatedFormData);
    
    if (step < 2) {
      setStep((prev) => prev + 1);
    } else {
      try {
        setIsSubmitting(true);
        await save(updatedFormData);
        setStep((prev) => prev + 1);
      } catch (error) {
        console.error('Error saving data:', error);
        // You might want to show an error message to the user here
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  return (
    <main className="flex w-full h-[100%]  min-h-screen flex-col  items-center gap-4 p-2 sm:p-6">
      <div className="flex justify-between items-center w-full">
        <h1>Ficha - visitantes</h1>
      </div>
      <Card className="p-4 w-full backdrop-blur-sm bg-white/30  border-none card-glass">
        <Form {...form}>
          <form onSubmit={submitAction}>
            {step === 0 && <StepZero form={form} />}
            {step === 1 && <StepOne form={form} />}
            {step === 2 && <StepTwo form={form} />}
            {step === 3 && <Done />}
      
            <div className="flex flex-col-reverse gap-4">
              {step > 0 && step < 3 && (
                <ButtonForm className="w-full" type="button" onClick={() => setStep(step - 1)} label="Voltar"/>
              )}
              {step < 3 && (
                <ButtonForm 
                  type="submit" 
                  label={step < 2 ? "Próximo" : "Salvar"}
                  disabled={isSubmitting}
                />
              )}
            </div>
          </form>
        </Form>
      </Card>
    </main>
  );
}
