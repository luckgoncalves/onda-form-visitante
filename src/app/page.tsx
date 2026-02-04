'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkAuth, checkIsAdmin } from "./actions";
import LoadingOnda from "@/components/loading-onda";
import Link from "next/link";
import { UsersRound, Building, LogIn, UserPlus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PWAInstallButton } from "@/components/pwa-install-button";

export default function Home() {
  const router = useRouter();
  const [isCheckingAuthentication, setIsCheckingAuthentication] = useState(true);

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
              router.push('/grupos');
            }
          }
          return;
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setIsCheckingAuthentication(false);
      }
    };

    checkAuthentication();
  }, [router]);

  if (isCheckingAuthentication) {
    return <LoadingOnda />;
  }

  const publicPages = [
    {
      title: 'Grupos Pequenos',
      description: 'Encontre um grupo pequeno perto de você e conecte-se com outras pessoas.',
      icon: UsersRound,
      href: 'https://ondaduracuritiba.inpeaceapp.com/groups',
      color: 'bg-onda-teal',
      external: true,
    },
    {
      title: 'Empresas',
      description: 'Conheça as empresas e negócios dos membros da nossa comunidade.',
      icon: Building,
      href: '/empresas',
      color: 'bg-onda-skyBlue',
      external: false,
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-onda-darkBlue to-[#001540]">
      {/* Header */}
      <header className="w-full px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-white tracking-[-0.1em] text-3xl font-bold">onda.</h1>
          <div className="flex items-center gap-2">
            <PWAInstallButton />
            <Link href="/login">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/10"
              >
                <LogIn className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Entrar</span>
              </Button>
            </Link>
            <Link href="/signup">
              <Button 
                className="bg-white text-onda-darkBlue hover:bg-white/90"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Criar conta</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-white text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            Bem-vindo à <span className="text-white tracking-[-0.1em]">onda.</span>
          </h2>
          <p className="text-white/80 text-lg sm:text-xl max-w-2xl mx-auto mb-8">
            Conecte-se com nossa comunidade, encontre grupos pequenos e descubra empresas de membros.
          </p>
        </div>
      </section>

      {/* Public Pages Section */}
      <section className="px-4 sm:px-6 pb-12 sm:pb-20">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-white/90 text-center text-lg font-medium mb-8">
            Explore sem precisar de login
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {publicPages.map((page) => {
              const Icon = page.icon;
              return (
                <Link 
                  key={page.href} 
                  href={page.href} 
                  className="group"
                  {...(page.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  <Card className="h-full bg-white/10 backdrop-blur border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-xl ${page.color} flex items-center justify-center mb-4`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-white flex items-center justify-between">
                        {page.title}
                        <ArrowRight className="h-5 w-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </CardTitle>
                      <CardDescription className="text-white/70">
                        {page.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Login CTA Section */}
      <section className="px-4 sm:px-6 pb-12 sm:pb-20">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white border-none shadow-2xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-onda-darkBlue text-xl">
                Já tem uma conta?
              </CardTitle>
              <CardDescription>
                Faça login para acessar todas as funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/login" className="flex-1 sm:flex-none">
                <Button className="w-full bg-onda-darkBlue hover:bg-onda-darkBlue/90">
                  <LogIn className="h-4 w-4 mr-2" />
                  Entrar
                </Button>
              </Link>
              <Link href="/signup" className="flex-1 sm:flex-none">
                <Button variant="outline" className="w-full border-onda-darkBlue text-onda-darkBlue hover:bg-onda-darkBlue/5">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Criar conta
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 py-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-white/50 text-sm">
            © {new Date().getFullYear()} Onda Dura. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </main>
  );
}
