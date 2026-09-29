'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkAuth, checkIsAdmin } from "./actions";
import LoadingOnda from "@/components/loading-onda";
import Link from "next/link";
import { UsersRound, Building, LogIn, UserPlus, ArrowRight, ChevronRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PWAInstallButton } from "@/components/pwa-install-button";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const [isCheckingAuthentication, setIsCheckingAuthentication] = useState(true);
  const { canInstall, handleInstall } = usePWAInstall();

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
              const paginaInicial = user?.ministerioNavConfig?.paginaInicial;
              router.push(paginaInicial ?? '/empresas');
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
      title: 'Hub',
      description: 'Conheça as empresas e negócios dos membros da nossa comunidade.',
      shortDescription: 'Empresas e negócios da comunidade',
      icon: Building,
      href: '/empresas',
      color: 'bg-onda-skyBlue',
      external: false,
    },
    {
      title: 'Grupos Pequenos',
      description: 'Encontre um grupo pequeno perto de você e conecte-se com outras pessoas.',
      shortDescription: 'Encontre um grupo perto de você',
      icon: UsersRound,
      href: 'https://igrejaondacuritiba.inpeaceapp.com/groups',
      color: 'bg-onda-teal',
      external: true,
    },
  ];

  return (
    <main className="flex min-h-screen flex-col bg-[linear-gradient(to_bottom,#11187E,#0E1466,#10175D)] pb-[calc(150px+env(safe-area-inset-bottom))] md:bg-[linear-gradient(to_bottom,#11187e,#001540)] md:pb-0">
      {/* Header */}
      <header className="w-full px-4 sm:px-6 md:py-4">
        <div className="max-w-6xl mx-auto flex h-[68px] items-center justify-between md:h-auto">
          <Image
            src="/logos/logo-principal-branco.png"
            alt="igreja onda"
            width={192}
            height={40}
            className="h-6 w-auto md:h-8"
            priority
          />

          {/* Celular: só "Instalar app" (entrar/criar conta ficam na barra fixa) */}
          {canInstall && (
            <button
              type="button"
              onClick={handleInstall}
              className="flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-[#D6DAF0] transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 md:hidden"
            >
              <Download aria-hidden="true" className="h-[18px] w-[18px]" />
              Instalar app
            </button>
          )}

          <div className="hidden items-center gap-2 md:flex">
            <PWAInstallButton />
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/15 hover:text-white"
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
      <section className="px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex flex-col items-center gap-2 mb-6">
            <span className="text-base font-medium tracking-wide text-[#B0D3E7] md:text-xl md:text-white/70">
              Bem-vindo à
            </span>
            <Image
              src="/logos/logo-principal-branco.png"
              alt="igreja onda"
              width={480}
              height={100}
              className="h-auto w-[250px] md:h-20 md:w-auto"
              priority
            />
          </div>
          <p className="mx-auto max-w-2xl text-base leading-normal text-[#D6DAF0] md:text-xl md:leading-7 md:text-white/80">
            Conecte-se com nossa comunidade, encontre grupos pequenos e descubra empresas de membros.
          </p>
        </div>
      </section>

      {/* Public Pages Section */}
      <section className="px-4 sm:px-6 pb-12 sm:pb-20">
        <div className="max-w-4xl mx-auto">
          
          {/* Celular: cards compactos */}
          <div className="flex flex-col gap-3 md:hidden">
            {publicPages.map((page) => {
              const Icon = page.icon;
              return (
                <Link
                  key={page.href}
                  href={page.href}
                  className="flex min-h-[76px] items-center gap-4 rounded-2xl border border-white/[.14] bg-white/[.07] p-4 transition-colors active:bg-white/[.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  {...(page.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-onda-sky">
                    <Icon className="h-6 w-6 text-onda-darkNavy" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[17px] font-bold text-white">{page.title}</span>
                    <span className="block truncate text-sm text-[#D6DAF0]">{page.shortDescription}</span>
                  </span>
                  <ChevronRight aria-hidden="true" className="h-5 w-5 shrink-0 text-[#D6DAF0]" />
                </Link>
              );
            })}
          </div>

          <div className="hidden grid-cols-1 gap-6 md:grid md:grid-cols-2">
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

      {/* Login CTA Section (no celular a barra fixa cumpre essa função) */}
      <section className="hidden px-4 sm:px-6 pb-12 sm:pb-20 md:block">
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
      <footer className="mt-auto px-4 sm:px-6 py-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-white/50 text-sm">
            © {new Date().getFullYear()} Onda Dura. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* Celular: barra fixa de acesso */}
      <nav
        aria-label="Acesso à conta"
        className="fixed inset-x-0 bottom-0 z-40 rounded-t-[22px] bg-white px-5 pb-[calc(16px+env(safe-area-inset-bottom))] pt-[18px] shadow-[0_-12px_32px_rgba(6,10,50,.35)] md:hidden"
      >
        <p className="text-[17px] font-bold text-onda-blue">Já faz parte da Onda?</p>
        <p className="mt-0.5 text-sm text-[#4A5068]">Entre para ver seus grupos, ministérios e mais.</p>
        <div className="mt-3 grid grid-cols-2 gap-[10px]">
          <Link
            href="/login"
            className="flex h-[52px] items-center justify-center gap-2 rounded-xl bg-onda-blue text-base font-bold text-white transition-colors hover:bg-onda-blue/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue focus-visible:ring-offset-2"
          >
            <LogIn aria-hidden="true" className="h-5 w-5" />
            Entrar
          </Link>
          <Link
            href="/signup"
            className="flex h-[52px] items-center justify-center gap-2 rounded-xl border-[1.5px] border-onda-blue text-base font-semibold text-onda-blue transition-colors hover:bg-onda-blue/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue focus-visible:ring-offset-2"
          >
            <UserPlus aria-hidden="true" className="h-5 w-5" />
            Criar conta
          </Link>
        </div>
      </nav>
    </main>
  );
}
