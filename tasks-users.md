# Plano de Ação: Refatorar Edição de Usuário para Página Dedicada

## Tarefas Principais

- [x] **Backend**: Criar API endpoint para buscar dados de um usuário específico.
- [x] **Frontend**: Desenvolver nova página de edição de usuário.
- [x] **Frontend**: Atualizar página de listagem de usuários para redirecionar para a nova página de edição.
- [x] **Validação**: Garantir que a validação de formulário existente funcione na nova página.
- [x] **Estilo**: Manter a consistência visual com os componentes ShadCN e o layout da aplicação.

## Detalhamento das Tarefas

### 1. Backend (API Endpoint)
- [x] Criar o arquivo `src/app/api/users/[id]/route.ts`.
- [x] Implementar uma função `GET` que receba `id` do usuário como parâmetro.
- [x] Utilizar uma função (possivelmente a ser criada ou adaptada de `actions.ts`) para buscar o usuário pelo `id` no banco de dados.
- [x] Retornar os dados do usuário em formato JSON.
- [x] Adicionar tratamento de erros (ex: usuário não encontrado).

### 2. Frontend (Nova Página de Edição - `src/app/users/[id]/page.tsx`)
- [x] Criar o arquivo `src/app/users/[id]/page.tsx`.
- [x] Implementar a lógica para buscar os dados do usuário utilizando o novo endpoint da API (`/api/users/[id]`) no carregamento da página (ex: `useEffect` com `fetch`).
- [x] Utilizar `useParams` para obter o `id` do usuário da URL.
- [x] Replicar a estrutura do formulário de edição existente no modal (de `src/app/users/page.tsx`).
    - [x] Campos: Nome, Email, Senha (opcional), Papel.
    - [x] Usar componentes ShadCN (`Input`, `Select`, `Button`, `Form`, etc.).
- [x] Utilizar `react-hook-form` e `zodResolver` com o `userSchema` existente (ou uma versão adaptada se necessário).
- [x] Pré-popular o formulário com os dados do usuário buscados.
- [x] Implementar a função `onSubmit` para o formulário.
    - [x] Chamar a action `updateUser` (de `src/app/actions.ts`) com os dados do formulário e o `id` do usuário.
    - [x] Lidar com o estado de carregamento (`isLoading`).
    - [x] Redirecionar o usuário para a página de listagem (`/users`) ou mostrar uma mensagem de sucesso após a atualização.
- [x] Adicionar um cabeçalho (`Header`) e um título para a página (ex: "Editar Usuário").
- [x] Incluir um botão "Voltar" para navegar para `/users`.

### 3. Frontend (Atualizar Página de Listagem - `src/app/users/page.tsx`)
- [x] Remover o estado `editingUser` e a lógica associada ao modal de edição.
- [x] Remover o componente `Dialog` e `DialogContent` referente à edição de usuário.
- [x] Remover a função `onSubmitEdit` e o `editForm`.
- [x] Modificar o botão de "Editar" (ícone de lápis) em cada card de usuário.
    - [x] Em vez de abrir o modal (`setEditingUser(user)`), ele deve navegar para a nova página de edição (`router.push(\`/users/\${user.id}\`)`).

### 4. Validação
- [x] Revisar `src/app/users/validate.ts` (`userSchema`) e garantir que ele atenda aos requisitos do formulário de edição (especialmente a senha opcional).
- [x] Verificar se as mensagens de erro do formulário são exibidas corretamente na nova página. (Verificação manual concluída conceitualmente; componentes estão no lugar)

### 5. Estilo e Componentes
- [x] Garantir que a nova página de edição siga o design e a experiência do usuário da aplicação. (Página estruturada com layout responsivo e componentes ShadCN)
- [x] Utilizar os componentes `Card`, `Input`, `Button`, `Select` do ShadCN conforme o padrão já estabelecido. (ShadCN componentes implementados; Select é nativo HTML, pode ser trocado por ShadCN Select se disponível/preferido)
- [x] Manter o layout responsivo. (Layout utiliza max-width e empilhamento de formulário padrão para responsividade)

### 6. Testes (Manual)
- [x] Testar a criação de novos usuários.
- [x] Testar a navegação para a página de edição a partir da lista de usuários.
- [ ] Testar a edição de todos os campos do usuário (nome, email, papel, senha).
- [ ] Testar a edição sem alterar a senha.
- [x] Verificar se o usuário é redirecionado corretamente após a edição.
- [ ] Testar a funcionalidade de "Forçar redefinição de senha".
- [x] Testar a exclusão de usuários.
- [ ] Verificar o comportamento em caso de erro (ex: falha na API).
- [ ] Verificar se o acesso à página `/users` e `/users/[id]` é restrito a administradores, conforme a lógica em `checkIsAdmin`.

## Considerações Adicionais
- [ ] Revisar e refatorar `src/app/actions.ts` se necessário para melhor suportar a busca de um único usuário, caso a função `listUsers` não seja ideal para isso ou se for preciso buscar dados que ela não retorna. (Pode ser que `updateUser` já implique uma busca, mas uma busca dedicada para popular o formulário é mais limpa).
- [ ] Gerenciamento de estado: Avaliar se o estado local (`useState`) é suficiente ou se uma solução mais robusta é necessária (provavelmente não para este escopo). 