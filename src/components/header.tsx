'use client';
import { useState } from "react";
import { User, ChevronDown, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function Header({ userName, onLogout }: { userName: string, onLogout: () => void }) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-[#9562DC] to-[#FEF057] shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className=" mx-auto px-4 sm:px-6 lg:px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Image
            src="/onda-logo-header.png" 
            alt="Onda Logo" 
            width={150}
            height={100}
          />
        </div>
        <div className="relative">
          <Button
            variant="ghost"
            className="flex items-center"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <User className="h-5 w-5 text-gray-400 mr-2" />
            <span className="hidden sm:block text-sm font-medium text-gray-700">{userName}</span>
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
          {isMenuOpen && (
            <Card className="absolute right-0 mt-2 w-48 py-1 bg-white rounded-md shadow-lg z-10">
              <Button
                variant="ghost"
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => router.push('/dashboard')}
              >
                <LayoutDashboard className="h-4 w-4 mr-2 inline" />
                Dashboard
              </Button>
              <Button
                variant="ghost"
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  setIsMenuOpen(false);
                  onLogout();
                }}
              >
                <LogOut className="h-4 w-4 mr-2 inline" />
                Logout
              </Button>
            </Card>
          )}
        </div>
      </div>
    </header>
  )
} 