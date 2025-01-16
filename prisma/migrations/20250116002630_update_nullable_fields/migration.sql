-- Alterar as colunas para nullable
ALTER TABLE "visitantes" ALTER COLUMN "como_chegou_ate_nos" DROP NOT NULL;
ALTER TABLE "visitantes" ALTER COLUMN "frequenta_igreja" DROP NOT NULL;
ALTER TABLE "visitantes" ALTER COLUMN "qual_igreja" DROP NOT NULL;
ALTER TABLE "visitantes" ALTER COLUMN "observacao" DROP NOT NULL;

-- Adicionar a coluna mensagem_enviada se ela não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'visitantes' 
                  AND column_name = 'mensagem_enviada') THEN
        ALTER TABLE "visitantes" ADD COLUMN "mensagem_enviada" BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;
