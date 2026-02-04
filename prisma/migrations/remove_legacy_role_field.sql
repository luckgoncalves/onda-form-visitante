-- Migration: Remover campo role legado da tabela users
-- Data: 2026-02-04
-- Descrição: Remove o campo 'role' (string) após confirmar que a migração para roleId foi bem-sucedida
-- ATENÇÃO: Execute este script APENAS após verificar que todos os usuários têm roleId preenchido corretamente!

-- Verificação de segurança: Conta quantos usuários não têm roleId
-- Se retornar mais que 0, NÃO execute o DROP COLUMN!
SELECT COUNT(*) as usuarios_sem_roleId FROM `users` WHERE `roleId` IS NULL;

-- Verificação: Mostra a distribuição de roles para confirmação
SELECT r.name as role_name, COUNT(u.id) as total_usuarios
FROM `users` u
LEFT JOIN `Role` r ON u.roleId = r.id
GROUP BY r.name;

-- Descomente a linha abaixo apenas quando estiver seguro de que a migração está completa
-- ALTER TABLE `users` DROP COLUMN `role`;
