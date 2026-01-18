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
            {/* <Image
              src="/logo-login.png" 
              alt="Onda Logo" 
              width={50}
              height={50}
            /> */}
            <p className="text-white tracking-[-0.1em] text-3xl font-bold">onda.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PWAInstallButton />
          <Button
            variant="ghost"
            className="flex items-center hover:bg-white/20 transition-colors text-white"
            onClick={() => router.push('/')}
          >
            <LogIn className="h-4 w-4 mr-2" />
            <span className="text-base font-medium">Entrar</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

