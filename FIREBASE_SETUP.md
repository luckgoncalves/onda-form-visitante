# Configuração do Firebase Storage

Este guia explica como obter as credenciais necessárias para configurar o Firebase Storage no projeto.

## Pré-requisitos

1. Ter uma conta Google
2. Acessar o [Firebase Console](https://console.firebase.google.com)

## Passo a Passo

### 1. Criar ou Selecionar um Projeto Firebase

1. Acesse https://console.firebase.google.com
2. Clique em "Adicionar projeto" ou selecione um projeto existente
3. Se criar um novo projeto:
   - Digite o nome do projeto
   - Aceite os termos e clique em "Continuar"
   - Configure o Google Analytics (opcional)
   - Clique em "Criar projeto"

### 2. Habilitar o Firebase Storage

1. No menu lateral, clique em **"Storage"**
2. Clique em **"Começar"**
3. Escolha o modo de segurança:
   - **Modo de teste**: Permite leitura/escrita por 30 dias (para desenvolvimento)
   - **Modo de produção**: Requer regras de segurança (recomendado para produção)
4. Selecione a localização do bucket (ex: `us-central`)
5. Clique em **"Concluído"**

### 3. Obter as Credenciais (Private Key e Client Email)

1. No Firebase Console, clique no ícone de **engrenagem (⚙️)** ao lado de "Visão geral do projeto"
2. Selecione **"Configurações do projeto"**
3. Vá para a aba **"Contas de serviço"**
4. Clique em **"Gerar nova chave privada"**
5. Uma caixa de diálogo aparecerá avisando sobre a segurança - clique em **"Gerar chave"**
6. Um arquivo JSON será baixado (ex: `meu-projeto-firebase-adminsdk-xxxxx-xxxxxxxxxx.json`)

### 4. Extrair as Informações do JSON

Abra o arquivo JSON baixado. Ele terá esta estrutura:

```json
{
  "type": "service_account",
  "project_id": "meu-projeto-123",
  "private_key_id": "xxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@meu-projeto-123.iam.gserviceaccount.com",
  "client_id": "xxxxx",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

### 5. Obter o Storage Bucket

1. No Firebase Console, vá em **"Storage"**
2. Clique em **"Configurações"** (ícone de engrenagem)
3. Na seção **"Bucket"**, você verá o nome do bucket
   - Formato: `meu-projeto-123.appspot.com` ou `meu-projeto-123.firebasestorage.app`
   - Copie este nome completo

### 6. Configurar as Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env`:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=meu-projeto-123
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@meu-projeto-123.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=meu-projeto-123.appspot.com
```

**IMPORTANTE:**
- O `FIREBASE_PRIVATE_KEY` deve estar entre aspas duplas (`"`)
- Mantenha as quebras de linha (`\n`) exatamente como aparecem no JSON
- Não commite o arquivo `.env` no Git (já deve estar no `.gitignore`)

### 7. Exemplo Completo

Se o seu arquivo JSON tiver:

```json
{
  "project_id": "onda-ficha-visita",
  "private_key": "-----BEGIN PRIVATE KEY-----\nABC123...\nDEF456...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-abc123@onda-ficha-visita.iam.gserviceaccount.com"
}
```

E o bucket for: `onda-ficha-visita.appspot.com`

Então seu `.env` deve ter:

```env
FIREBASE_PROJECT_ID=onda-ficha-visita
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nABC123...\nDEF456...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc123@onda-ficha-visita.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=onda-ficha-visita.appspot.com
```

## Configuração no Vercel (Produção)

Se estiver usando Vercel, adicione essas variáveis nas configurações do projeto:

1. Acesse o projeto no Vercel
2. Vá em **Settings** > **Environment Variables**
3. Adicione cada variável:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_PRIVATE_KEY` (cole o valor completo com `\n`)
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_STORAGE_BUCKET`
4. Marque para todos os ambientes (Production, Preview, Development)
5. Faça o redeploy da aplicação

## Verificação

Após configurar, você pode testar se está funcionando:

1. Inicie o servidor de desenvolvimento: `npm run dev`
2. Tente fazer upload de uma imagem em qualquer formulário
3. Verifique o console do servidor para erros
4. Verifique o Firebase Storage Console para ver se a imagem foi salva

## Troubleshooting

### Erro: "Missing Firebase configuration"
- Verifique se todas as variáveis estão no `.env`
- Reinicie o servidor após adicionar as variáveis

### Erro: "Invalid private key"
- Certifique-se de que o `FIREBASE_PRIVATE_KEY` está entre aspas duplas
- Mantenha as quebras de linha (`\n`) no valor

### Erro: "Permission denied"
- Verifique se o Storage está habilitado no Firebase Console
- Verifique as regras de segurança do Storage

### Imagens não aparecem
- Verifique se o bucket está configurado como público ou se as regras permitem leitura
- Verifique se o `next.config.mjs` tem a configuração de `remotePatterns` para `storage.googleapis.com`

## Segurança

⚠️ **NUNCA:**
- Commite o arquivo JSON de credenciais no Git
- Compartilhe as credenciais publicamente
- Use as mesmas credenciais em múltiplos projetos

✅ **SEMPRE:**
- Mantenha o `.env` no `.gitignore`
- Use variáveis de ambiente diferentes para desenvolvimento e produção
- Revogue e gere novas chaves se suspeitar de comprometimento
