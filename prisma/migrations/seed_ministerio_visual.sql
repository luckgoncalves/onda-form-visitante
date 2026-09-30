-- Carga inicial de ícone e cor dos ministérios existentes.
-- Rodar depois de `npx prisma db push` criar as colunas `icone` e `cor` em Ministerio.
-- Só preenche quem ainda não tem ícone/cor (idempotente).
UPDATE `Ministerio` SET `icone` = 'monitor',   `cor` = 'azul'    WHERE TRIM(`nome`) = 'Tecnologia'   AND `icone` IS NULL;
UPDATE `Ministerio` SET `icone` = 'wrench',    `cor` = 'agua'    WHERE TRIM(`nome`) = 'Manutenção'   AND `icone` IS NULL;
UPDATE `Ministerio` SET `icone` = 'users',     `cor` = 'lavanda' WHERE TRIM(`nome`) = 'Base Pessoal' AND `icone` IS NULL;
UPDATE `Ministerio` SET `icone` = 'megaphone', `cor` = 'ceu'     WHERE TRIM(`nome`) = 'Comunicação'  AND `icone` IS NULL;
UPDATE `Ministerio` SET `icone` = 'music',     `cor` = 'verde'   WHERE TRIM(`nome`) = 'Louvor'       AND `icone` IS NULL;
