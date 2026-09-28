-- Carga inicial do modelo do checklist de inspeção (idempotente)
-- Rodar depois de `npx prisma db push` criar as tabelas ChecklistTopico e ChecklistItem.

INSERT IGNORE INTO `ChecklistTopico` (`id`, `titulo`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_topico_1', 'Banheiros', 0, NOW(3), NOW(3));
INSERT IGNORE INTO `ChecklistItem` (`id`, `topicoId`, `texto`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_item_1_1', 'chk_topico_1', 'Acionar as descargas e verificar se há vazamentos.', 0, NOW(3), NOW(3));
INSERT IGNORE INTO `ChecklistItem` (`id`, `topicoId`, `texto`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_item_1_2', 'chk_topico_1', 'Acionar as torneiras e verificar possíveis vazamentos no sifão.', 1, NOW(3), NOW(3));
INSERT IGNORE INTO `ChecklistItem` (`id`, `topicoId`, `texto`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_item_1_3', 'chk_topico_1', 'Verificar se toda a iluminação está funcionando.', 2, NOW(3), NOW(3));
INSERT IGNORE INTO `ChecklistItem` (`id`, `topicoId`, `texto`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_item_1_4', 'chk_topico_1', 'Verificar se os porta-papéis estão íntegros e sem sinais de danos.', 3, NOW(3), NOW(3));

INSERT IGNORE INTO `ChecklistTopico` (`id`, `titulo`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_topico_2', 'Cozinha', 1, NOW(3), NOW(3));
INSERT IGNORE INTO `ChecklistItem` (`id`, `topicoId`, `texto`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_item_2_1', 'chk_topico_2', 'Verificar o funcionamento da torneira.', 0, NOW(3), NOW(3));
INSERT IGNORE INTO `ChecklistItem` (`id`, `topicoId`, `texto`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_item_2_2', 'chk_topico_2', 'Acionar a torneira e verificar se há vazamentos no sifão.', 1, NOW(3), NOW(3));
INSERT IGNORE INTO `ChecklistItem` (`id`, `topicoId`, `texto`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_item_2_3', 'chk_topico_2', 'Verificar o funcionamento das tomadas.', 2, NOW(3), NOW(3));
INSERT IGNORE INTO `ChecklistItem` (`id`, `topicoId`, `texto`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_item_2_4', 'chk_topico_2', 'Verificar se a geladeira está funcionando normalmente.', 3, NOW(3), NOW(3));

INSERT IGNORE INTO `ChecklistTopico` (`id`, `titulo`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_topico_3', 'Espaço de Culto', 2, NOW(3), NOW(3));
INSERT IGNORE INTO `ChecklistItem` (`id`, `topicoId`, `texto`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_item_3_1', 'chk_topico_3', 'Verificar se toda a iluminação está funcionando corretamente.', 0, NOW(3), NOW(3));

INSERT IGNORE INTO `ChecklistTopico` (`id`, `titulo`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_topico_4', 'Hall de Entrada', 3, NOW(3), NOW(3));
INSERT IGNORE INTO `ChecklistItem` (`id`, `topicoId`, `texto`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_item_4_1', 'chk_topico_4', 'Verificar o funcionamento da iluminação.', 0, NOW(3), NOW(3));
INSERT IGNORE INTO `ChecklistItem` (`id`, `topicoId`, `texto`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_item_4_2', 'chk_topico_4', 'Verificar o funcionamento do bebedouro.', 1, NOW(3), NOW(3));
INSERT IGNORE INTO `ChecklistItem` (`id`, `topicoId`, `texto`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_item_4_3', 'chk_topico_4', 'Verificar as condições e o funcionamento do suporte para copos.', 2, NOW(3), NOW(3));

INSERT IGNORE INTO `ChecklistTopico` (`id`, `titulo`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_topico_5', 'Café', 4, NOW(3), NOW(3));
INSERT IGNORE INTO `ChecklistItem` (`id`, `topicoId`, `texto`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_item_5_1', 'chk_topico_5', 'Confirmar com a equipe responsável pelo serviço se está tudo em pleno funcionamento.', 0, NOW(3), NOW(3));
INSERT IGNORE INTO `ChecklistItem` (`id`, `topicoId`, `texto`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_item_5_2', 'chk_topico_5', 'Verificar se há alguma necessidade de manutenção ou reparo.', 1, NOW(3), NOW(3));

INSERT IGNORE INTO `ChecklistTopico` (`id`, `titulo`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_topico_6', 'Store', 5, NOW(3), NOW(3));
INSERT IGNORE INTO `ChecklistItem` (`id`, `topicoId`, `texto`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_item_6_1', 'chk_topico_6', 'Confirmar com a equipe responsável pelo serviço se está tudo em pleno funcionamento.', 0, NOW(3), NOW(3));
INSERT IGNORE INTO `ChecklistItem` (`id`, `topicoId`, `texto`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_item_6_2', 'chk_topico_6', 'Verificar se há alguma necessidade de manutenção ou reparo.', 1, NOW(3), NOW(3));

INSERT IGNORE INTO `ChecklistTopico` (`id`, `titulo`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_topico_7', 'Salas do Ministério Infantil', 6, NOW(3), NOW(3));
INSERT IGNORE INTO `ChecklistItem` (`id`, `topicoId`, `texto`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_item_7_1', 'chk_topico_7', 'Verificar se a iluminação está funcionando.', 0, NOW(3), NOW(3));
INSERT IGNORE INTO `ChecklistItem` (`id`, `topicoId`, `texto`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_item_7_2', 'chk_topico_7', 'Verificar as condições e o funcionamento dos banheiros.', 1, NOW(3), NOW(3));

INSERT IGNORE INTO `ChecklistTopico` (`id`, `titulo`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_topico_8', 'Auditório Shift', 7, NOW(3), NOW(3));
INSERT IGNORE INTO `ChecklistItem` (`id`, `topicoId`, `texto`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_item_8_1', 'chk_topico_8', 'Confirmar com a equipe responsável pelo serviço se está tudo em pleno funcionamento.', 0, NOW(3), NOW(3));
INSERT IGNORE INTO `ChecklistItem` (`id`, `topicoId`, `texto`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_item_8_2', 'chk_topico_8', 'Verificar se há alguma necessidade de manutenção ou reparo.', 1, NOW(3), NOW(3));

INSERT IGNORE INTO `ChecklistTopico` (`id`, `titulo`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_topico_9', 'Hope (Bazar)', 8, NOW(3), NOW(3));
INSERT IGNORE INTO `ChecklistItem` (`id`, `topicoId`, `texto`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_item_9_1', 'chk_topico_9', 'Verificar se todos os equipamentos e instalações estão em pleno funcionamento.', 0, NOW(3), NOW(3));
INSERT IGNORE INTO `ChecklistItem` (`id`, `topicoId`, `texto`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_item_9_2', 'chk_topico_9', 'Verificar se há alguma necessidade de manutenção ou reparo.', 1, NOW(3), NOW(3));

INSERT IGNORE INTO `ChecklistTopico` (`id`, `titulo`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_topico_10', 'Iluminação Externa', 9, NOW(3), NOW(3));
INSERT IGNORE INTO `ChecklistItem` (`id`, `topicoId`, `texto`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_item_10_1', 'chk_topico_10', 'Verificar todas as luminárias externas.', 0, NOW(3), NOW(3));
INSERT IGNORE INTO `ChecklistItem` (`id`, `topicoId`, `texto`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_item_10_2', 'chk_topico_10', 'Identificar lâmpadas ou luminárias queimadas ou com defeito.', 1, NOW(3), NOW(3));
INSERT IGNORE INTO `ChecklistItem` (`id`, `topicoId`, `texto`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_item_10_3', 'chk_topico_10', 'Verificar se há algum ponto de iluminação que não esteja funcionando adequadamente.', 2, NOW(3), NOW(3));

INSERT IGNORE INTO `ChecklistTopico` (`id`, `titulo`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_topico_11', 'Estrutural / Segurança', 10, NOW(3), NOW(3));
INSERT IGNORE INTO `ChecklistItem` (`id`, `topicoId`, `texto`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_item_11_1', 'chk_topico_11', 'Verificar se existem indícios de tentativa de arrombamento.', 0, NOW(3), NOW(3));
INSERT IGNORE INTO `ChecklistItem` (`id`, `topicoId`, `texto`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_item_11_2', 'chk_topico_11', 'Verificar portas, fechaduras e acessos.', 1, NOW(3), NOW(3));
INSERT IGNORE INTO `ChecklistItem` (`id`, `topicoId`, `texto`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_item_11_3', 'chk_topico_11', 'Verificar se existem vidros quebrados ou danificados.', 2, NOW(3), NOW(3));
INSERT IGNORE INTO `ChecklistItem` (`id`, `topicoId`, `texto`, `ordem`, `createdAt`, `updatedAt`) VALUES ('chk_item_11_4', 'chk_topico_11', 'Registrar qualquer dano estrutural identificado.', 3, NOW(3), NOW(3));
