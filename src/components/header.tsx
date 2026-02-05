'use client';
import { useState, useEffect } from "react";
import { User, ChevronDown, LayoutDashboard, LogOut, Users, UserCog, UsersRound, Building, FileText, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { checkIsAdmin } from "@/app/actions";
import { Separator } from "./ui/separator";
import { PWAInstallButton } from "@/components/pwa-install-button";

type HeaderProps = {
  userName: string;
  userId: string;
  campusNome?: string | null;
  onLogout: () => void;
};

export function Header({ userName, userId, campusNome, onLogout }: HeaderProps) {

  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const { isAdmin } = await checkIsAdmin();
      setIsAdmin(isAdmin);
    }
    checkAdmin();
  }, []);

  return (
    <header className="bg-onda-darkBlue shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className=" mx-auto px-2 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="cursor-pointer" 
            onClick={() => router.push('/list')}
          >
            {/* <Image
              src="/onda-transparente.png" 
              alt="Onda Logo" 
              width={50}
              height={50}
            /> */}
            <p className="text-white tracking-[-0.1em] text-3xl font-bold">onda.</p>
          </div>
          {campusNome && (
            <span className="hidden sm:inline-block text-white/70 text-sm font-medium px-2 py-1 rounded bg-white/10">
              {campusNome}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <PWAInstallButton />
          <div className="relative">
            <Button
              variant="ghost"
              className="flex items-center hover:bg-white/20 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <User className="h-4 w-4 mr-2 text-white" />
              <span className="hidden sm:block text-base font-medium text-white">{userName}</span>
              <ChevronDown className="h-4 w-4 ml-1 text-white" />
            </Button>
          {isMenuOpen && (
            <Card className="absolute right-0 mt-2 w-56 py-2 bg-white rounded-xl shadow-lg z-10 border-none">
              <div className="px-2 space-y-1">
                {isAdmin && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-3 py-2 text-base text-gray-700 hover:bg-gray-100 hover:text-onda-darkBlue rounded-lg transition-all duration-200"
                    onClick={() => router.push('/dashboard')}
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2.5" />
                    Dashboard
                  </Button>
                )}
                {isAdmin && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-3 py-2 text-base text-gray-700 hover:bg-gray-100 hover:text-onda-darkBlue rounded-lg transition-all duration-200"
                  onClick={() => router.push('/list')}
                >
                  <Users className="h-4 w-4 mr-2.5" />
                  Visitantes
                  </Button>
                )}
                {/* {isAdmin && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-3 py-2 text-base text-gray-700 hover:bg-gray-100 hover:text-onda-darkBlue rounded-lg transition-all duration-200"
                    onClick={() => router.push('/dashboard/grupos')}
                  >
                    <UsersRound className="h-4 w-4 mr-2.5" />
                    Gp`s
                  </Button>
                )} */}
                {isAdmin && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-3 py-2 text-base text-gray-700 hover:bg-gray-100 hover:text-onda-darkBlue rounded-lg transition-all duration-200"
                    onClick={() => router.push('/dashboard/forms')}
                  >
                    <FileText className="h-4 w-4 mr-2.5" />
                    Formulários
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  className="w-full justify-start px-3 py-2 text-base text-gray-700 hover:bg-gray-100 hover:text-onda-darkBlue rounded-lg transition-all duration-200"
                  onClick={() => window.open('https://ondaduracuritiba.inpeaceapp.com/groups', '_blank')}
                >
                  <UsersRound className="h-4 w-4 mr-2.5" />
                  Grupos
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start px-3 py-2 text-base text-gray-700 hover:bg-gray-100 hover:text-onda-darkBlue rounded-lg transition-all duration-200"
                  onClick={() => router.push('/empresas')}
                >
                  <Building className="h-4 w-4 mr-2.5" />
                  Empresas
                </Button>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-3 py-2 text-base text-gray-700 hover:bg-gray-100 hover:text-onda-darkBlue rounded-lg transition-all duration-200"
                    onClick={() => router.push('/users')}
                  >
                    <UserCog className="h-4 w-4 mr-2.5" />
                    Membros
                  </Button>
                )}
                
                <Separator className="bg-gray-200" />

                <Button
                  variant="ghost"
                  className="w-full justify-start px-3 py-2 text-base text-gray-700 hover:bg-gray-100 hover:text-onda-darkBlue rounded-lg transition-all duration-200"
                  onClick={() => {
                    setIsMenuOpen(false);
                    router.push(`/users/${userId}`);
                  }}
                >
                  <User className="h-4 w-4 mr-2.5" />
                  {userName}
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start px-3 py-2 text-base text-gray-700 hover:bg-gray-100 hover:text-onda-darkBlue rounded-lg transition-all duration-200"
                  onClick={() => {
                    setIsMenuOpen(false);
                    window.open('https://vox.devstack.com.br/board/de2454a0-1502-43d8-a4f7-4b2ff8992f07', '_blank');
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-2.5" />
                  Feedback
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start px-3 py-2 text-base text-gray-700 hover:bg-gray-100 hover:text-onda-darkBlue rounded-lg transition-all duration-200"
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
      </div>
    </header>
  )
} 