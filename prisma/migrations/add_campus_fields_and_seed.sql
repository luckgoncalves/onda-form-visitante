-- Migration: Ajustar estado para VARCHAR(191) e popular Campus (padrão: id, nome, cidade, estado, ativo, createdAt, updatedAt)
-- Data: 2026-02-05

-- Passo 1: Alterar coluna estado para suportar nomes longos (ex: United States, Inglaterra)
ALTER TABLE `Campus` MODIFY COLUMN `estado` VARCHAR(191) NOT NULL;

-- Passo 2: Inserir/atualizar campus (id no padrão campus_{cidade}_{estado}, nome "Onda Dura {cidade}")
INSERT INTO `Campus` (`ativo`, `cidade`, `createdAt`, `estado`, `id`, `nome`, `updatedAt`) VALUES
(1, 'Curitiba', NOW(3), 'PR', 'campus_curitiba', 'Onda Dura Curitiba', NOW(3)),
(1, 'Angra dos Reis', NOW(3), 'RJ', 'campus_angra_dos_reis_rj', 'Onda Dura Angra dos Reis', NOW(3)),
(1, 'Av. Paulista', NOW(3), 'SP', 'campus_av_paulista_sp', 'Onda Dura Av. Paulista', NOW(3)),
(1, 'Barra da Tijuca', NOW(3), 'RJ', 'campus_barra_da_tijuca_rj', 'Onda Dura Barra da Tijuca', NOW(3)),
(1, 'Bauru', NOW(3), 'SP', 'campus_bauru_sp', 'Onda Dura Bauru', NOW(3)),
(1, 'Belo Horizonte', NOW(3), 'MG', 'campus_belo_horizonte_mg', 'Onda Dura Belo Horizonte', NOW(3)),
(1, 'Blumenau', NOW(3), 'SC', 'campus_blumenau_sc', 'Onda Dura Blumenau', NOW(3)),
(1, 'Cabo Frio', NOW(3), 'RJ', 'campus_cabo_frio_rj', 'Onda Dura Cabo Frio', NOW(3)),
(1, 'Campinas', NOW(3), 'SP', 'campus_campinas_sp', 'Onda Dura Campinas', NOW(3)),
(1, 'Caxias do Sul', NOW(3), 'RS', 'campus_caxias_do_sul_rs', 'Onda Dura Caxias do Sul', NOW(3)),
(1, 'Charlotte', NOW(3), 'United States', 'campus_charlotte_united_states', 'Onda Dura Charlotte', NOW(3)),
(1, 'Chicago', NOW(3), 'United States', 'campus_chicago_united_states', 'Onda Dura Chicago', NOW(3)),
(1, 'Florianópolis', NOW(3), 'SC', 'campus_florianopolis_sc', 'Onda Dura Florianópolis', NOW(3)),
(1, 'Guarulhos', NOW(3), 'SP', 'campus_guarulhos_sp', 'Onda Dura Guarulhos', NOW(3)),
(1, 'Irajá', NOW(3), 'RJ', 'campus_iraja_rj', 'Onda Dura Irajá', NOW(3)),
(1, 'Itajaí', NOW(3), 'SC', 'campus_itajai_sc', 'Onda Dura Itajaí', NOW(3)),
(1, 'Japão - Hamamatsu', NOW(3), 'JP', 'campus_japao_hamamatsu_jp', 'Onda Dura Japão - Hamamatsu', NOW(3)),
(1, 'Jaraguá do Sul', NOW(3), 'SC', 'campus_jaragua_do_sul_sc', 'Onda Dura Jaraguá do Sul', NOW(3)),
(1, 'Joinville', NOW(3), 'SC', 'campus_joinville_sc', 'Onda Dura Joinville', NOW(3)),
(1, 'Londres', NOW(3), 'Inglaterra', 'campus_londres_inglaterra', 'Onda Dura Londres', NOW(3)),
(1, 'Macapá', NOW(3), 'AP', 'campus_macapa_ap', 'Onda Dura Macapá', NOW(3)),
(1, 'Machado', NOW(3), 'MG', 'campus_machado_mg', 'Onda Dura Machado', NOW(3)),
(1, 'Mooca', NOW(3), 'SP', 'campus_mooca_sp', 'Onda Dura Mooca', NOW(3)),
(1, 'Nova Iguaçu', NOW(3), 'RJ', 'campus_nova_iguacu_rj', 'Onda Dura Nova Iguaçu', NOW(3)),
(1, 'Porto', NOW(3), 'Portugal', 'campus_porto_portugal', 'Onda Dura Porto', NOW(3)),
(1, 'Porto Alegre', NOW(3), 'RS', 'campus_porto_alegre_rs', 'Onda Dura Porto Alegre', NOW(3)),
(1, 'Recife', NOW(3), 'PE', 'campus_recife_pe', 'Onda Dura Recife', NOW(3)),
(1, 'Sines', NOW(3), 'Portugal', 'campus_sines_portugal', 'Onda Dura Sines', NOW(3)),
(1, 'Spain - Mallorca', NOW(3), 'ES', 'campus_spain_mallorca_es', 'Onda Dura Spain - Mallorca', NOW(3))
ON DUPLICATE KEY UPDATE `nome` = VALUES(`nome`), `updatedAt` = NOW(3);
