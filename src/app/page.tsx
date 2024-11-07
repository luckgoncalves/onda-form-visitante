'use client';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Form, FormField, FormLabel } from "@/components/ui/form";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { login, checkAuth } from "./actions";
import ButtonForm from "@/components/button-form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from 'next/image';

export default function Home() {
  const form = useForm();
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      const { isAuthenticated } = await checkAuth();
      if (isAuthenticated) {
        router.push('/list');
      }
    };

    checkAuthentication();
  }, [router]);

  const submitAction = form.handleSubmit(async (formData) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        router.push('/list');
      } else {
        setError(result.message || 'An error occurred');
      }
    } catch (error) {
      setError('Ocorreu um erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  });
console.log({isLoading})
  return (
    <main className="flex w-full h-[100%]  min-h-screen flex-col  items-center gap-4 p-4">
      <Card className="p-4 w-full backdrop-blur-sm bg-white/30 mt-10 border-none card-glass">
        <CardHeader className="text-center">
          <Image 
            src="/onda-logo.png" 
            alt="Onda Logo" 
            width={200} 
            height={80} 
            className="mx-auto"
          />
        </CardHeader>
        <CardContent>
          {showLogin && (
            <Form {...form}>
              <form className="flex flex-col mx-auto w-1/2 gap-4" onSubmit={submitAction}>

                <FormLabel>Email:</FormLabel>
                <FormField 
                  control={form.control} 
                  name="email" 
                  render={({ field }) => <Input type="email" {...field} />} />

                <FormLabel>Senha:</FormLabel>
                <FormField 
                  control={form.control} 
                  name="password"
                  render={({ field }) => <Input type="password" {...field} />} />
                
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <ButtonForm className="w-full mx-auto" type="submit" label={isLoading ? 'Carregando...' : 'Entrar'} disabled={isLoading} />
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="w-full">
          <div className="flex flex-wrap items-center justify-center gap-4 w-full">
            <ButtonForm 
            type="button" 
            className={`w-1/2 text-balance bg-transparent border-2 border-[#503387] text-[#503387] hover:bg-[#503387]/90 hover:text-white`} 
            onClick={() => router.push('/register')} 
            label="Cadastrar novo Visitante" />
            {!showLogin && <ButtonForm className="w-1/2" type="button" onClick={() => setShowLogin(true)} label="Entrar" />}
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}
