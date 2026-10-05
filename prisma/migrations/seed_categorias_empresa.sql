-- Categorias padronizadas de empresa + mapeamento dos ramos livres atuais (idempotente).
-- Rodar depois de `npx prisma db push` criar a tabela CategoriaEmpresa e a coluna Empresa.categoriaId.
-- O ramoAtuacao livre continua como subtítulo da empresa.

INSERT IGNORE INTO `CategoriaEmpresa` (`id`, `nome`, `createdAt`, `updatedAt`) VALUES ('cat_juridico', 'Jurídico', NOW(3), NOW(3));
INSERT IGNORE INTO `CategoriaEmpresa` (`id`, `nome`, `createdAt`, `updatedAt`) VALUES ('cat_consultoria', 'Consultoria e Finanças', NOW(3), NOW(3));
INSERT IGNORE INTO `CategoriaEmpresa` (`id`, `nome`, `createdAt`, `updatedAt`) VALUES ('cat_marketing', 'Marketing e Design', NOW(3), NOW(3));
INSERT IGNORE INTO `CategoriaEmpresa` (`id`, `nome`, `createdAt`, `updatedAt`) VALUES ('cat_audiovisual', 'Fotografia e Audiovisual', NOW(3), NOW(3));
INSERT IGNORE INTO `CategoriaEmpresa` (`id`, `nome`, `createdAt`, `updatedAt`) VALUES ('cat_beleza', 'Beleza, Saúde e Bem-estar', NOW(3), NOW(3));
INSERT IGNORE INTO `CategoriaEmpresa` (`id`, `nome`, `createdAt`, `updatedAt`) VALUES ('cat_tecnologia', 'Tecnologia', NOW(3), NOW(3));
INSERT IGNORE INTO `CategoriaEmpresa` (`id`, `nome`, `createdAt`, `updatedAt`) VALUES ('cat_automotivo', 'Automotivo', NOW(3), NOW(3));
INSERT IGNORE INTO `CategoriaEmpresa` (`id`, `nome`, `createdAt`, `updatedAt`) VALUES ('cat_artesanato', 'Artesanato e Decoração', NOW(3), NOW(3));
INSERT IGNORE INTO `CategoriaEmpresa` (`id`, `nome`, `createdAt`, `updatedAt`) VALUES ('cat_eventos', 'Eventos e Turismo', NOW(3), NOW(3));
INSERT IGNORE INTO `CategoriaEmpresa` (`id`, `nome`, `createdAt`, `updatedAt`) VALUES ('cat_casa', 'Casa e Construção', NOW(3), NOW(3));

UPDATE `Empresa` SET `categoriaId` = 'cat_juridico' WHERE `categoriaId` IS NULL AND TRIM(`ramoAtuacao`) IN ('Advocacia', 'Advocacia e Consultoria', 'Direito do Trabalho, Compliance, Previdenciário, Contratos, Direito do Consumidor.', 'Especialista em Direito Médico, Saúde e Estética');
UPDATE `Empresa` SET `categoriaId` = 'cat_consultoria' WHERE `categoriaId` IS NULL AND TRIM(`ramoAtuacao`) IN ('Consultoria', 'Consultoria Tributária', 'seguros');
UPDATE `Empresa` SET `categoriaId` = 'cat_marketing' WHERE `categoriaId` IS NULL AND TRIM(`ramoAtuacao`) IN ('Agência criativa', 'Design e Marketing', 'Design Gráfico', 'Marketing Digital');
UPDATE `Empresa` SET `categoriaId` = 'cat_audiovisual' WHERE `categoriaId` IS NULL AND TRIM(`ramoAtuacao`) IN ('Audiovisual', 'Foto e vídeo - corporativo e eventos', 'Fotografia e vídeos de Imoveis, arquitetura, ambientes', 'Storymaker e Videomaker');
UPDATE `Empresa` SET `categoriaId` = 'cat_beleza' WHERE `categoriaId` IS NULL AND TRIM(`ramoAtuacao`) IN ('Beleza e estética', 'Biomedicina Estética', 'Tatto e Piercing', 'Saúde, beleza e bem estar - fisioterapia e pilates');
UPDATE `Empresa` SET `categoriaId` = 'cat_tecnologia' WHERE `categoriaId` IS NULL AND TRIM(`ramoAtuacao`) IN ('Programação', 'Inteligência Artificial', 'Tecnologia da informação', 'Impressão 3d e Maquetes');
UPDATE `Empresa` SET `categoriaId` = 'cat_automotivo' WHERE `categoriaId` IS NULL AND TRIM(`ramoAtuacao`) IN ('Mecânica automotiva', 'Guincho e socorro 24h', 'Oficina de motos de alta cc', 'Oficina de motos de alta cilindrada');
UPDATE `Empresa` SET `categoriaId` = 'cat_artesanato' WHERE `categoriaId` IS NULL AND TRIM(`ramoAtuacao`) IN ('Artesã', 'Artesanato / Decoração', 'Arte comestível e costura criativa');
UPDATE `Empresa` SET `categoriaId` = 'cat_eventos' WHERE `categoriaId` IS NULL AND TRIM(`ramoAtuacao`) IN ('Eventos', 'Agência de Viagens');
UPDATE `Empresa` SET `categoriaId` = 'cat_casa' WHERE `categoriaId` IS NULL AND TRIM(`ramoAtuacao`) IN ('Engenharia civil', 'Revenda de colchões');
