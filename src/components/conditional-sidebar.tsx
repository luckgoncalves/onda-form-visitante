'use client';

interface ConditionalSidebarProps {
  children: React.ReactNode;
}

export function ConditionalSidebar({ children }: ConditionalSidebarProps) {
  // Agora este componente é muito simples - apenas renderiza as páginas públicas
  // As páginas autenticadas usam o layout específico em (auth)/layout.tsx
  return (
    <main className="w-full h-full">
      {children}
    </main>
  );
} 