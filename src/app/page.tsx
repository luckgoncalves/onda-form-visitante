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
      const { isAuthenticated, user } = await checkAuth();
      if (isAuthenticated) {
        if (user?.requirePasswordChange) {
          router.push('/change-password');
        } else {
          router.push('/list');
        }
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
        if (result.user?.requirePasswordChange) {
          router.push('/change-password');
        } else {
          router.push('/list');
        }
      } else {
        setError(result.message || 'Ocorreu um erro');
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
            width={150} 
            height={60} 
            className="mx-auto"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQrJyEwPENBLzMzLy0zPVBCR0JHMz1DcWl5VGR2h4iIl5eXqqqq+vr6////2wBDAR"
            priority
          />
        </CardHeader>
        <CardContent>
          {showLogin && (
            <Form {...form}>
              <form className="flex flex-col mx-auto md:w-1/2 gap-4" onSubmit={submitAction}>

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
          <div className="flex flex-col items-center justify-center gap-4 w-full">
            <ButtonForm 
              type="button" 
              className={!showLogin ? "w-full sm:w-1/2" : "text-[#503387] hover:bg-transparent hover:underline bg-transparent border-none cursor-pointer p-0"} 
              onClick={() => router.push('/register')} 
              label="Cadastrar novo Visitante" />
            {!showLogin && (
              <button 
                className="text-[#503387] hover:underline bg-transparent border-none cursor-pointer p-0" 
                type="button" 
                onClick={() => setShowLogin(true)}
              >
                Entrar
              </button>
            )}
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}
