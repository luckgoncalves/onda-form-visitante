-- Migration: Make idade, estado_civil and interesse_em_conhecer optional on visitantes
-- The registration form no longer requires these fields (only culto, nome, telefone and genero are mandatory).

ALTER TABLE `visitantes` MODIFY COLUMN `idade` INT NULL;
ALTER TABLE `visitantes` MODIFY COLUMN `estado_civil` VARCHAR(191) NULL;
ALTER TABLE `visitantes` MODIFY COLUMN `interesse_em_conhecer` JSON NULL;
