'use client';
import { useState } from "react";
import { User, ChevronDown, LayoutDashboard, LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function Header({ userName, onLogout }: { userName: string, onLogout: () => void }) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-[#9562DC] to-[#FEF057] shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className=" mx-auto px-2 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <div 
            className="cursor-pointer" 
            onClick={() => router.push('/list')}
          >
            <Image
              src="/onda-logo-header.png" 
              alt="Onda Logo" 
              width={150}
              height={100}
            />
          </div>
        </div>
        <div className="relative">
          <Button
            variant="ghost"
            className="flex items-center hover:bg-white/20 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <User className="h-4 w-4 mr-2" />
            <span className="hidden sm:block text-sm font-medium text-gray-700">{userName}</span>
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
          {isMenuOpen && (
            <Card className="absolute right-0 mt-2 w-56 py-2 bg-white rounded-xl shadow-lg z-10 border-none">
              <div className="px-2 space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start px-3 py-2 text-sm text-gray-700 hover:bg-gradient-to-r from-purple-50 to-yellow-50 hover:text-[#9562DC] rounded-lg transition-all duration-200"
                  onClick={() => router.push('/dashboard')}
                >
                  <LayoutDashboard className="h-4 w-4 mr-2.5" />
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start px-3 py-2 text-sm text-gray-700 hover:bg-gradient-to-r from-purple-50 to-yellow-50 hover:text-[#9562DC] rounded-lg transition-all duration-200"
                  onClick={() => router.push('/list')}
                >
                  <Users className="h-4 w-4 mr-2.5" />
                  Visitantes
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start px-3 py-2 text-sm text-gray-700 hover:bg-gradient-to-r from-purple-50 to-yellow-50 hover:text-[#9562DC] rounded-lg transition-all duration-200"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onLogout();
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2.5" />
                  Sair
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </header>
  )
} 