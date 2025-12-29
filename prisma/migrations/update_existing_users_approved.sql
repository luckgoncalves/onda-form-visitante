-- Migration: Atualizar usuários existentes para approved = true
-- Este script garante que todos os usuários existentes sejam aprovados automaticamente

-- Primeiro, adicionar a coluna se não existir (com default true)
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `approved` BOOLEAN NOT NULL DEFAULT true;

-- Atualizar todos os usuários existentes para approved = true
UPDATE `users` SET `approved` = true WHERE `approved` IS NULL OR `approved` = false;

