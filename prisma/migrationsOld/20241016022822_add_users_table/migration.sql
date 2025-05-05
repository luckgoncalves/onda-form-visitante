-- CreateTable
CREATE TABLE "visitantes" (
    "id" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "como_chegou_ate_nos" TEXT NOT NULL,
    "como_nos_conheceu" TEXT NOT NULL,
    "culto" TEXT NOT NULL,
    "estado_civil" TEXT NOT NULL,
    "frequenta_igreja" TEXT NOT NULL,
    "genero" TEXT NOT NULL,
    "idade" INTEGER NOT NULL,
    "interesse_em_conhecer" TEXT[],
    "nome" TEXT NOT NULL,
    "observacao" TEXT,
    "qual_igreja" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "mensagem_enviada" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "visitantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
