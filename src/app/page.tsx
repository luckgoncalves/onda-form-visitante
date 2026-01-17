'use client';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Form, FormField, FormLabel } from "@/components/ui/form";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { login, checkAuth, checkIsAdmin } from "./actions";
import ButtonForm from "@/components/button-form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from 'next/image';
import LoadingOnda from "@/components/loading-onda";
import Link from "next/link";

export default function Home() {
  const form = useForm();
  const router = useRouter();
  const [isCheckingAuthentication, setIsCheckingAuthentication] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      const { isAuthenticated, user } = await checkAuth();
      const { isAdmin } = await checkIsAdmin();
      
      
      if (isAuthenticated) {
        if (user?.requirePasswordChange) {
          router.push('/change-password');
        } else {
          if (isAdmin) {
            router.push('/list');
          } else if (user?.role === 'base_pessoal') {
            router.push('/register');
          } else if (user?.role === 'user') {
            router.push('/grupos');
          }
        }
      }
      setIsCheckingAuthentication(false);
    };

    checkAuthentication();
  }, [router]);

  const submitAction = form.handleSubmit(async (formData) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await login(formData.email, formData.password);
      const { isAdmin } = await checkIsAdmin();

      if (result.success) {
        if (result.user?.requirePasswordChange) {
          router.push('/change-password');
        } else {
          if (isAdmin) {
            router.push('/list');
          } else if (result.user?.role === 'base_pessoal') {
            router.push('/register');
          } else if (result.user?.role === 'user') {
            router.push('/grupos');
          }
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

  if (isCheckingAuthentication) {
    return (
      <LoadingOnda />
    );
  }

  return (
    <main className="flex w-full h-[100%] justify-center  min-h-screen flex-col  items-center gap-4 p-4 bg-onda-darkBlue">
      <h1 className="text-white tracking-[-0.1em] text-5xl md:text-7xl font-bold">onda.</h1>
      <Card className="p-4 w-full md:w-1/2 lg:w-1/3 bg-white border-none">
      {isCheckingAuthentication ? (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      ) : (
        <>
        {/* <CardHeader className="text-center">
          <Image 
            src="/onda.png" 
            alt="Onda Logo" 
            width={150} 
            height={150} 
            className="mx-auto w-[150px] h-[150px] rounded-full object-cover"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQrJyEwPENBLzMzLy0zPVBCR0JHMz1DcWl5VGR2h4iIl5eXqqqq+vr6////2wBDAR"
            priority
          />
        </CardHeader> */}
        <CardContent className="p-10">
          {/* {showLogin && ( */}
            <Form {...form}>
              <form className="flex flex-col mx-auto gap-4" onSubmit={submitAction}>

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
                
                <div className="text-center mt-4">
                  <p className="text-sm text-muted-foreground">
                    Não tem uma conta?{' '}
                    <Link href="/signup" className="text-primary hover:underline font-medium">
                      Criar conta
                    </Link>
                  </p>
                </div>
              </form>
            </Form>
          {/* )} */}
        </CardContent>
        {/* <CardFooter className="w-full">
          <div className="flex flex-col items-center justify-center gap-4 w-full">
            {!showLogin && (
              <ButtonForm 
              type="button" 
              className={!showLogin ? "w-full sm:w-1/2" : "text-[#00205b] hover:bg-transparent hover:underline bg-transparent border-none cursor-pointer p-0"} 
              onClick={() => setShowLogin(true)} 
              label="Entrar" />
            )}
          </div>
        </CardFooter> */}
        </>
      )}
      </Card>
    </main>
  );
}
