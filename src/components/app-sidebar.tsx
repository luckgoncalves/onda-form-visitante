'use client';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
  } from "@/components/ui/sidebar"
import { BadgeCheck, ChevronUp, LayoutDashboard, LogOut, User2, UserCog, UserRound, Users, UsersRound } from "lucide-react";
import Image from "next/image";
import { checkAuth, logout } from "@/app/actions";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Separator } from "@radix-ui/react-dropdown-menu";
import { useEffect, useState } from "react";
  
  export function AppSidebar() {
    const router = useRouter();
    const [dataUser, setDataUser] = useState({name: '', email: ''});

    useEffect(() => {
      async function checkAuthentication() {
        const { isAuthenticated, user } = await checkAuth();
        if (isAuthenticated && user) {
          console.log(user);
          setDataUser(user);
        }
      }
      checkAuthentication();
    }, []);

    const items = [
      {
        label: "Dashboard",
        icon: <LayoutDashboard className="h-4 w-4 mr-2.5" />,
        href: "/dashboard",
      },
      {
        label: "Visitantes",
        icon: <Users className="h-4 w-4 mr-2.5" />,
        href: "/list",
      },
      {
        label: "Gp's",
        icon: <UsersRound className="h-4 w-4 mr-2.5" />,
        href: "/dashboard/grupos",
      },
      {
        label: "Membros",
        icon: <UserCog className="h-4 w-4 mr-2.5" />,
        href: "/users",
      },
      
    ];

    const handleLogout = async () => {
      try {
        await logout();
        router.push('/');
      } catch (error) {
        console.error('Error during logout:', error);
      }
    };

    return (
      <Sidebar className="border-r border-white/20">
        <SidebarHeader className="bg-gradient-to-r from-[#9562DC] to-[#9562DC]/50 top-0 left-0 right-0 z-50">
          <Image
            src="/logo-login.png"
            alt="Logo"
            width={60}
            height={40}
            className="mx-auto"
            priority
          />
        </SidebarHeader>
        <SidebarContent  className="bg-gradient-to-r from-[#9562DC] to-[#9562DC]/50 top-0 left-0 right-0 z-50">
          {/* <SidebarGroup> */}
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem  className="px-3" key={item.href}>
                  <SidebarMenuButton className="w-full justify-start  text-base text-black hover:bg-gradient-to-r from-purple-50 to-yellow-50 hover:text-[#9562DC] rounded-lg transition-all duration-200" asChild>
                    <a href={item.href}>
                      {item.icon}
                      <span className="text-md font-medium">{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          {/* </SidebarGroup> */}
        </SidebarContent>
        <SidebarFooter className="bg-gradient-to-r from-[#9562DC] to-[#9562DC]/50 top-0 left-0 right-0 z-50" >
        <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="w-full justify-start px-3 py-2 text-base text-black hover:bg-gradient-to-r from-purple-50 to-yellow-50 hover:text-[#9562DC] rounded-lg transition-all duration-200">
                    <User2 /> {dataUser.name}
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width] mb-3 flex flex-col gap-2 bg-gradient-to-r from-[#ac8dd9]/10 to-[#9562DC]/20  shadow-lg z-50 rounded-lg p-2" 
                >
                  <DropdownMenuItem className="flex items-center cursor-pointer">
                    <User2 className="h-4 w-4 mr-2.5 text-black" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-black">{dataUser.name}</span>
                      <span className="text-xs text-black">{dataUser.email}</span>
                    </div>
                  </DropdownMenuItem>
                  <Separator className="w-full bg-gray-600 h-[1px]" />
                  <DropdownMenuItem className="flex  items-center cursor-pointer "  onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2.5 text-black" />
                    <span className="text-md text-black">Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
          {/* <SidebarMenuButton 
            className="w-full justify-start px-3 py-2 text-base text-black hover:bg-gradient-to-r from-purple-50 to-yellow-50 hover:text-[#9562DC] rounded-lg transition-all duration-200"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2.5" />
            Sair
          </SidebarMenuButton> */}
        </SidebarFooter>
      </Sidebar>
    )
  }