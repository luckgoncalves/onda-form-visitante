'use client';
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PWAInstallButton } from "@/components/pwa-install-button";

export function HeaderPublic() {
  const router = useRouter();

  return (
    <header className="bg-onda-darkBlue shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto px-2 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <div
            className="cursor-pointer"
            onClick={() => router.push('/')}
          >
            <Image
              src="/logos/logo-principal-branco.png"
              alt="Igreja Onda"
              width={192}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PWAInstallButton />
          <Button
            variant="ghost"
            className="flex items-center text-white hover:bg-white/15 hover:text-white transition-colors"
            onClick={() => router.push('/login')}
          >
            <LogIn className="h-4 w-4 mr-2" />
            <span className="text-base font-medium">Entrar</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

