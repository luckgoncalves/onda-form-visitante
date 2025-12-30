'use client';
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function HeaderPublic() {
  const router = useRouter();

  return (
    <header className="bg-gradient-to-r from-[#9562DC] to-[#FEF057] shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto px-2 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <div 
            className="cursor-pointer" 
            onClick={() => router.push('/')}
          >
            <Image
              src="/logo-login.png" 
              alt="Onda Logo" 
              width={50}
              height={50}
            />
          </div>
        </div>
        <div>
          <Button
            variant="ghost"
            className="flex items-center hover:bg-white/20 transition-colors text-gray-700"
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

