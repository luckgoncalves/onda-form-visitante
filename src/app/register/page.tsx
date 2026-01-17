'use client';

import { useEffect, useState } from "react";
import ButtonForm from "@/components/button-form";
import StepOne from "@/components/step-one";
import StepTwo from "@/components/step-two";
import StepZero from "@/components/step-zero";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { checkAuth, logout, save, canAccessRegister } from "../actions";
import Done from "@/components/done";
import { zodResolver } from "@hookform/resolvers/zod";
import { step1Schema, step2Schema, step3Schema } from "./validate";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import ErrorBoundary from "@/components/error-boundary";

export default function Home() {
  const [step, setStep] = useState(0);
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState('');
  // Função para obter o schema correto baseado no step
  const getSchemaForStep = (currentStep: number) => {
    switch (currentStep) {
      case 0:
        return step1Schema;
      case 1:
        return step2Schema;
      case 2:
        return step3Schema;
      default:
        return step1Schema;
    }
  };

  const form = useForm({
    resolver: zodResolver(getSchemaForStep(step)),
    defaultValues: {
      culto: '',
      nome: '',
      genero: '',
      idade: '',
      estado: 'Paraná',
      cidade: 'Curitiba',
      bairro: '',
      estado_civil: '',
      telefone: '',
      responsavel_nome: '',
      responsavel_telefone: '',
      como_nos_conheceu: '',
      como_chegou_ate_nos: '',
      frequenta_igreja: '',
      qual_igreja: '',
      interesse_em_conhecer: [],
      observacao: '',
    },
    mode: 'onBlur'
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    async function checkAccess() {
      try {
        const { canAccess } = await canAccessRegister();
        
        if (!canAccess) {
          router.push('/');
          return;
        }

        const { isAuthenticated, user } = await checkAuth();
        
        if (!isAuthenticated || !user) {
          router.push('/');
          return;
        }

        setUserName(user.name);
        setUserId(user.id);
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/');
      }
    }
    checkAccess();
  }, [router, isMounted]);

  // Atualizar o resolver quando o step mudar
  useEffect(() => {
    form.clearErrors();
    const currentValues = form.getValues();
    form.reset(currentValues, { keepValues: true, keepDefaultValues: true });
  }, [step, form]);

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

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!isMounted || isLoading || !userName) {
    return (
      <main className="flex w-full h-[100%]  min-h-screen flex-col  items-center justify-center gap-4 p-2 sm:p-6 mt-[72px]">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      </main>
    )
  }

  return (
    <ErrorBoundary>
      <main className="flex w-full h-[100%]  min-h-screen flex-col  items-center gap-4 p-2 sm:p-6 mt-[72px]">
        <Header userId={userId} userName={userName} onLogout={handleLogout} />
        <div className="flex justify-between items-center w-full">
          <h1>Ficha - visitantes</h1>
        </div>
        <Card className="p-4 w-full backdrop-blur-sm bg-white/30  border card-glass">
          <Form {...form}>
            <form onSubmit={submitAction}>
              {step === 0 && <StepZero form={form} />}
              {step === 1 && <StepOne form={form} />}
              {step === 2 && <StepTwo form={form} />}
              {step === 3 && <Done />}
        
              <div className="flex flex-col-reverse gap-4">
                {step > 0 && step < 3 && (
                  <ButtonForm className="w-full bg-onda-darkGray/80" type="button" onClick={() => setStep(step - 1)} label="Voltar"/>
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
    </ErrorBoundary>
  );
}
