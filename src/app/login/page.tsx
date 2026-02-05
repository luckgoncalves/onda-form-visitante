'use client';
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormField, FormLabel } from "@/components/ui/form";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { login, checkAuth, checkIsAdmin } from "../actions";
import ButtonForm from "@/components/button-form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import LoadingOnda from "@/components/loading-onda";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const form = useForm();
  const router = useRouter();
  const [isCheckingAuthentication, setIsCheckingAuthentication] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error('Timeout'));
          }, 10000);
        });
        const authPromise = Promise.all([checkAuth(), checkIsAdmin()]);

        const [{isAuthenticated, user}, {isAdmin}] = await Promise.race([authPromise, timeoutPromise]) as [Awaited<ReturnType<typeof checkAuth>>, Awaited<ReturnType<typeof checkIsAdmin>>];

        if (isAuthenticated) {
          if (user?.requirePasswordChange) {
            router.push('/change-password');
          } else {
            if (isAdmin) {
              router.push('/list');
            } else if (user?.role === 'base_pessoal') {
              router.push('/register');
            } else if (user?.role === 'user') {
              router.push('/empresas');
            }
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setIsCheckingAuthentication(false);
      }
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
    return <LoadingOnda />;
  }

  return (
    <main className="flex w-full h-[100%] justify-center min-h-screen flex-col items-center gap-4 p-4 bg-onda-darkBlue">
      {/* Back button */}
      <div className="w-full max-w-md">
        <Link href="/">
          <Button variant="ghost" className="text-white hover:bg-white/10 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
      </div>

      <h1 className="text-white tracking-[-0.1em] text-5xl md:text-7xl font-bold">onda.</h1>
      
      <Card className="p-4 w-full max-w-md bg-white border-none">
        <CardContent className="p-6 sm:p-10">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Entrar</h2>
            <p className="text-sm text-gray-600 mt-1">
              Acesse sua conta para continuar
            </p>
          </div>

          <Form {...form}>
            <form className="flex flex-col mx-auto gap-4" onSubmit={submitAction}>
              <FormLabel>E-mail:</FormLabel>
              <FormField 
                control={form.control} 
                name="email" 
                render={({ field }) => <Input type="email" {...field} />} 
              />

              <FormLabel>Senha:</FormLabel>
              <FormField 
                control={form.control} 
                name="password"
                render={({ field }) => (
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      {...field} 
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                )} 
              />
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <ButtonForm 
                className="w-full mx-auto" 
                type="submit" 
                label={isLoading ? 'Carregando...' : 'Entrar'} 
                disabled={isLoading} 
              />
              
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
        </CardContent>
      </Card>
    </main>
  );
}
