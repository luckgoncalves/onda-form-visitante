-- Migration: Criar tabela Campus e adicionar campusId nas tabelas relacionadas
-- Data: 2026-02-04
-- Descrição: Implementa sistema multi-tenant baseado em Campus

-- Passo 1: Criar a tabela Campus
CREATE TABLE IF NOT EXISTS `Campus` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `cidade` VARCHAR(191) NOT NULL,
    `estado` VARCHAR(2) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    
    UNIQUE INDEX `Campus_cidade_estado_key`(`cidade`, `estado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Passo 2: Inserir o campus inicial "Onda Dura Curitiba"
INSERT INTO `Campus` (`id`, `nome`, `cidade`, `estado`, `ativo`, `createdAt`, `updatedAt`) 
VALUES ('campus_curitiba', 'Onda Dura Curitiba', 'Curitiba', 'PR', true, NOW(), NOW())
ON DUPLICATE KEY UPDATE `nome` = VALUES(`nome`);

-- Passo 3: Adicionar coluna campusId na tabela users (se não existir)
SET @col_exists_users = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'campusId'
);

SET @sql_users = IF(@col_exists_users = 0, 
    'ALTER TABLE `users` ADD COLUMN `campusId` VARCHAR(191) NULL',
    'SELECT 1'
);

PREPARE stmt_users FROM @sql_users;
EXECUTE stmt_users;
DEALLOCATE PREPARE stmt_users;

-- Passo 4: Adicionar coluna campusId na tabela visitantes (se não existir)
SET @col_exists_visitantes = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'visitantes' 
    AND COLUMN_NAME = 'campusId'
);

SET @sql_visitantes = IF(@col_exists_visitantes = 0, 
    'ALTER TABLE `visitantes` ADD COLUMN `campusId` VARCHAR(191) NULL',
    'SELECT 1'
);

PREPARE stmt_visitantes FROM @sql_visitantes;
EXECUTE stmt_visitantes;
DEALLOCATE PREPARE stmt_visitantes;

-- Passo 5: Adicionar coluna campusId na tabela grupo (se não existir)
SET @col_exists_grupo = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'grupo' 
    AND COLUMN_NAME = 'campusId'
);

SET @sql_grupo = IF(@col_exists_grupo = 0, 
    'ALTER TABLE `grupo` ADD COLUMN `campusId` VARCHAR(191) NULL',
    'SELECT 1'
);

PREPARE stmt_grupo FROM @sql_grupo;
EXECUTE stmt_grupo;
DEALLOCATE PREPARE stmt_grupo;

-- Passo 6: Adicionar coluna campusId na tabela Form (se não existir)
SET @col_exists_form = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'Form' 
    AND COLUMN_NAME = 'campusId'
);

SET @sql_form = IF(@col_exists_form = 0, 
    'ALTER TABLE `Form` ADD COLUMN `campusId` VARCHAR(191) NULL',
    'SELECT 1'
);

PREPARE stmt_form FROM @sql_form;
EXECUTE stmt_form;
DEALLOCATE PREPARE stmt_form;

-- Passo 7: Migrar dados existentes para o campus Curitiba
UPDATE `users` SET `campusId` = 'campus_curitiba' WHERE `campusId` IS NULL;
UPDATE `visitantes` SET `campusId` = 'campus_curitiba' WHERE `campusId` IS NULL;
UPDATE `grupo` SET `campusId` = 'campus_curitiba' WHERE `campusId` IS NULL;
UPDATE `Form` SET `campusId` = 'campus_curitiba' WHERE `campusId` IS NULL;

-- Passo 8: Adicionar chaves estrangeiras

-- FK para users
SET @fk_exists_users = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'users' 
    AND CONSTRAINT_NAME = 'users_campusId_fkey'
);

SET @sql_fk_users = IF(@fk_exists_users = 0, 
    'ALTER TABLE `users` ADD CONSTRAINT `users_campusId_fkey` FOREIGN KEY (`campusId`) REFERENCES `Campus`(`id`) ON DELETE SET NULL ON UPDATE CASCADE',
    'SELECT 1'
);

PREPARE stmt_fk_users FROM @sql_fk_users;
EXECUTE stmt_fk_users;
DEALLOCATE PREPARE stmt_fk_users;

-- FK para visitantes
SET @fk_exists_visitantes = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'visitantes' 
    AND CONSTRAINT_NAME = 'visitantes_campusId_fkey'
);

SET @sql_fk_visitantes = IF(@fk_exists_visitantes = 0, 
    'ALTER TABLE `visitantes` ADD CONSTRAINT `visitantes_campusId_fkey` FOREIGN KEY (`campusId`) REFERENCES `Campus`(`id`) ON DELETE SET NULL ON UPDATE CASCADE',
    'SELECT 1'
);

PREPARE stmt_fk_visitantes FROM @sql_fk_visitantes;
EXECUTE stmt_fk_visitantes;
DEALLOCATE PREPARE stmt_fk_visitantes;

-- FK para grupo
SET @fk_exists_grupo = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'grupo' 
    AND CONSTRAINT_NAME = 'grupo_campusId_fkey'
);

SET @sql_fk_grupo = IF(@fk_exists_grupo = 0, 
    'ALTER TABLE `grupo` ADD CONSTRAINT `grupo_campusId_fkey` FOREIGN KEY (`campusId`) REFERENCES `Campus`(`id`) ON DELETE SET NULL ON UPDATE CASCADE',
    'SELECT 1'
);

PREPARE stmt_fk_grupo FROM @sql_fk_grupo;
EXECUTE stmt_fk_grupo;
DEALLOCATE PREPARE stmt_fk_grupo;

-- FK para Form
SET @fk_exists_form = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'Form' 
    AND CONSTRAINT_NAME = 'Form_campusId_fkey'
);

SET @sql_fk_form = IF(@fk_exists_form = 0, 
    'ALTER TABLE `Form` ADD CONSTRAINT `Form_campusId_fkey` FOREIGN KEY (`campusId`) REFERENCES `Campus`(`id`) ON DELETE SET NULL ON UPDATE CASCADE',
    'SELECT 1'
);

PREPARE stmt_fk_form FROM @sql_fk_form;
EXECUTE stmt_fk_form;
DEALLOCATE PREPARE stmt_fk_form;

-- Passo 9: Criar índices para melhor performance

-- Index para users.campusId
SET @idx_exists_users = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'users' 
    AND INDEX_NAME = 'users_campusId_idx'
);

SET @sql_idx_users = IF(@idx_exists_users = 0, 
    'CREATE INDEX `users_campusId_idx` ON `users`(`campusId`)',
    'SELECT 1'
);

PREPARE stmt_idx_users FROM @sql_idx_users;
EXECUTE stmt_idx_users;
DEALLOCATE PREPARE stmt_idx_users;

-- Index para visitantes.campusId
SET @idx_exists_visitantes = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'visitantes' 
    AND INDEX_NAME = 'visitantes_campusId_idx'
);

SET @sql_idx_visitantes = IF(@idx_exists_visitantes = 0, 
    'CREATE INDEX `visitantes_campusId_idx` ON `visitantes`(`campusId`)',
    'SELECT 1'
);

PREPARE stmt_idx_visitantes FROM @sql_idx_visitantes;
EXECUTE stmt_idx_visitantes;
DEALLOCATE PREPARE stmt_idx_visitantes;

-- Index para grupo.campusId
SET @idx_exists_grupo = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'grupo' 
    AND INDEX_NAME = 'grupo_campusId_idx'
);

SET @sql_idx_grupo = IF(@idx_exists_grupo = 0, 
    'CREATE INDEX `grupo_campusId_idx` ON `grupo`(`campusId`)',
    'SELECT 1'
);

PREPARE stmt_idx_grupo FROM @sql_idx_grupo;
EXECUTE stmt_idx_grupo;
DEALLOCATE PREPARE stmt_idx_grupo;

-- Index para Form.campusId
SET @idx_exists_form = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'Form' 
    AND INDEX_NAME = 'Form_campusId_idx'
);

SET @sql_idx_form = IF(@idx_exists_form = 0, 
    'CREATE INDEX `Form_campusId_idx` ON `Form`(`campusId`)',
    'SELECT 1'
);

PREPARE stmt_idx_form FROM @sql_idx_form;
EXECUTE stmt_idx_form;
DEALLOCATE PREPARE stmt_idx_form;
