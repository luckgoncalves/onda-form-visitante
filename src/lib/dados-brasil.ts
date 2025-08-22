import dadosBrasil from '../../dados-brasil-processados.json';

export interface Estado {
  id: number;
  sigla: string;
  nome: string;
}

export interface Cidade {
  nome: string;
}

/**
 * Busca todos os estados brasileiros ordenados por nome
 */
export function getEstados(): Estado[] {
  return dadosBrasil.estados;
}

/**
 * Busca um estado específico pelo nome
 */
export function getEstadoPorNome(nome: string): Estado | undefined {
  return dadosBrasil.estados.find(estado => 
    estado.nome.toLowerCase() === nome.toLowerCase()
  );
}

/**
 * Busca todas as cidades de um estado específico pela sigla do estado
 */
export function getCidadesPorEstado(estadoSigla: string): Cidade[] {
  const cidades = (dadosBrasil.cidadesPorEstado as Record<string, Cidade[]>)[estadoSigla.toUpperCase()];
  return cidades || [];
}

/**
 * Busca todas as cidades de um estado específico pelo nome do estado
 */
export function getCidadesPorNomeEstado(nomeEstado: string): Cidade[] {
  const estado = getEstadoPorNome(nomeEstado);
  if (!estado) {
    return [];
  }
  return getCidadesPorEstado(estado.sigla);
}

/**
 * Busca uma cidade específica em um estado
 */
export function getCidadePorNome(nomeCidade: string, estadoSigla: string): Cidade | undefined {
  const cidades = getCidadesPorEstado(estadoSigla);
  return cidades.find(cidade => 
    cidade.nome.toLowerCase() === nomeCidade.toLowerCase()
  );
}
