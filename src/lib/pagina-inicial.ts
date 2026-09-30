type UsuarioInicial = {
  role: string;
  temMinisterio?: boolean;
  ministerioNavConfig?: { paginaInicial: string } | null;
};

/** Página para onde o usuário vai ao abrir o app ou depois do login. */
export function paginaInicialDoUsuario(user: UsuarioInicial, isAdmin: boolean): string {
  if (isAdmin) return '/list';
  if (user.ministerioNavConfig?.paginaInicial) return user.ministerioNavConfig.paginaInicial;
  if (user.role === 'base_pessoal') return '/register';
  // Conta aprovada que ainda não participa de nenhum ministério
  if (!user.temMinisterio) return '/inicio';
  return '/empresas';
}
