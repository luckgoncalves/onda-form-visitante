-- Migration: Criar tabela de Roles e migrar dados existentes
-- Data: 2026-02-04
-- Descrição: Cria a tabela Role, insere as roles existentes e atualiza a tabela users

-- Passo 1: Criar a tabela Role
CREATE TABLE IF NOT EXISTS `Role` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    
    UNIQUE INDEX `Role_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Passo 2: Inserir as roles existentes com IDs específicos para facilitar a migração
INSERT INTO `Role` (`id`, `name`, `description`, `createdAt`, `updatedAt`) VALUES
    ('role_admin', 'admin', 'Administrador do sistema com acesso total', NOW(), NOW()),
    ('role_user', 'user', 'Usuário padrão do sistema', NOW(), NOW()),
    ('role_base_pessoal', 'base_pessoal', 'Acesso à base de dados pessoal', NOW(), NOW())
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Passo 3: Adicionar a coluna roleId na tabela users (se não existir)
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'roleId'
);

SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE `users` ADD COLUMN `roleId` VARCHAR(191) NULL',
    'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Passo 4: Migrar os dados - atualizar roleId baseado no campo role existente
UPDATE `users` SET `roleId` = 'role_admin' WHERE `role` = 'admin' AND `roleId` IS NULL;
UPDATE `users` SET `roleId` = 'role_user' WHERE `role` = 'user' AND `roleId` IS NULL;
UPDATE `users` SET `roleId` = 'role_base_pessoal' WHERE `role` = 'base_pessoal' AND `roleId` IS NULL;

-- Passo 5: Para usuários que não têm role definida, definir como 'user' (padrão)
UPDATE `users` SET `roleId` = 'role_user' WHERE `roleId` IS NULL;

-- Passo 6: Adicionar a chave estrangeira (se não existir)
SET @fk_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'users' 
    AND CONSTRAINT_NAME = 'users_roleId_fkey'
);

SET @sql_fk = IF(@fk_exists = 0, 
    'ALTER TABLE `users` ADD CONSTRAINT `users_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE SET NULL ON UPDATE CASCADE',
    'SELECT 1'
);

PREPARE stmt_fk FROM @sql_fk;
EXECUTE stmt_fk;
DEALLOCATE PREPARE stmt_fk;

-- Passo 7: Criar índice para melhor performance (se não existir)
SET @idx_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'users' 
    AND INDEX_NAME = 'users_roleId_idx'
);

SET @sql_idx = IF(@idx_exists = 0, 
    'CREATE INDEX `users_roleId_idx` ON `users`(`roleId`)',
    'SELECT 1'
);

PREPARE stmt_idx FROM @sql_idx;
EXECUTE stmt_idx;
DEALLOCATE PREPARE stmt_idx;
