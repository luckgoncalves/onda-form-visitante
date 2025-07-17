# Plano de Ação: Cadastro de Grupos

Este documento detalha as etapas para criar a funcionalidade de cadastro de grupos no sistema.

## Backend

- [x] **Modelagem de Dados (Prisma)**
  - [x] Definir o model `Grupo` em `prisma/schema.prisma`.
    - [x] `id`: String, CUID
    - [x] `categoria`: String (Enum: HOMENS, UNVT, MULHERES, MISTO, NEW, CASAIS)
    - [x] `diaSemana`: String (Enum: SEGUNDA, TERCA, QUARTA, QUINTA, SEXTA, SABADO, DOMINGO)
    - [x] `horario`: String
    - [x] `bairroId`: String? (relação opcional com `bairros`)
    - [x] `createdAt`: DateTime, @default(now())
    - [x] `updatedAt`: DateTime, @updatedAt
  - [x] Estabelecer uma relação de muitos-para-muitos entre `Grupo` e `users` para os líderes.
    - [x] Adicionar o campo `lideres users[]` ao model `Grupo`.
    - [x] Adicionar o campo `gruposLiderados Grupo[]` ao model `users`.
  - [x] Atualizar o model `Grupo` para incluir a relação com o bairro existente.
    - [x] `bairro`: `bairros?` @relation(fields: [bairroId], references: [id])
  - [ ] Executar `npx prisma migrate dev --name add-grupos-tables` para aplicar as mudanças no banco de dados.
  - [x] Executar `npx prisma generate` para atualizar o Prisma Client.

- [x] **API Endpoints (Next.js API Routes)**
  - [x] Criar a estrutura de diretórios: `src/app/api/grupos`.
  - [x] Criar o endpoint `POST /api/grupos` para criar um novo grupo.
    - [x] Validar os dados de entrada.
    - [x] Criar o grupo e associar líderes em uma transação.
  - [x] Criar o endpoint `GET /api/grupos` para listar os grupos.
    - [x] Implementar paginação e filtros (se necessário).
    - [x] Incluir dados do bairro e líderes nas consultas.
  - [x] Criar o endpoint `GET /api/grupos/[id]` para buscar um grupo específico.
  - [x] Criar o endpoint `PUT /api/grupos/[id]` para atualizar um grupo.
  - [x] Criar o endpoint `DELETE /api/grupos/[id]` para remover um grupo.

## Frontend

- [x] **Página de Cadastro de Grupos**
  - [x] Criar a estrutura de diretórios: `src/app/dashboard/grupos/new`.
  - [x] Criar o arquivo `page.tsx` para a página de cadastro.
  - [x] Desenvolver o formulário de cadastro com os seguintes campos:
    - [x] `Categoria`: Select/Dropdown (Homens, UNVT, Mulheres, Misto, New, Casais).
    - [x] `Líderes`:
      - [x] Seção para selecionar múltiplos usuários existentes como líderes.
      - [x] Botão "Adicionar Líder".
    - [x] `Bairro`:
      - [x] Dropdown/Select para escolher um bairro existente da tabela `bairros`.
      - [x] Usar a função `getBairrosCuritiba()` existente para carregar os bairros.
    - [x] `Horário e Dia da Semana`:
      - [x] `Dia da Semana`: Select/Dropdown (Segunda, Terça, ...).
      - [x] `Horário`: Input de tempo (ou texto com máscara).
    - [x] Botão "Salvar Grupo".
  - [x] Implementar a lógica de estado do formulário (ex: `useState` ou `react-hook-form`).
  - [x] Implementar a submissão do formulário, chamando o endpoint `POST /api/grupos`.
  - [x] Adicionar feedback para o usuário (sucesso, erro, carregando).

- [x] **Listagem de Grupos**
  - [x] Criar a página `src/app/dashboard/grupos` para listar os grupos.
  - [x] Usar o endpoint `GET /api/grupos` para buscar os dados.
  - [x] Exibir os grupos em uma tabela ou lista.
  - [x] Mostrar informações do bairro associado (nome do bairro).
  - [x] Adicionar um link/botão para a página de edição de cada grupo.
  - [x] Adicionar um botão para remover um grupo.

- [x] **Integração e Estilo**
  - [x] Garantir que todos os novos componentes sigam o layout padrão de cores e componentes do projeto.
  - [x] Criar um link no menu de navegação do dashboard para "Grupos". 