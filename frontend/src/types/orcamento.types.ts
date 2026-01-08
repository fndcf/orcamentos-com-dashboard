/**
 * Tipos discriminados para Orçamentos
 * Segue ISP - Interface Segregation Principle
 * Cada tipo tem apenas os campos necessários para seu contexto
 */

import { OrcamentoItemCompleto, OrcamentoStatus, OrcamentoTipo, TipoPessoa, ParcelamentoDados } from './index';

// ============================================
// TIPOS BASE COMPARTILHADOS
// ============================================

/** Campos obrigatórios para qualquer orçamento */
export interface OrcamentoBase {
  clienteId: string;
  observacoes?: string;
  consultor?: string;
  contato?: string;
  email?: string; // Email específico do orçamento (prioridade sobre clienteEmail)
  telefone?: string; // Telefone específico do orçamento (prioridade sobre clienteTelefone)
  enderecoServico?: string; // Endereço onde o serviço será executado
}

/** Campos completos do cliente no orçamento (para exibição) */
export interface OrcamentoClienteInfo {
  clienteNome: string;
  clienteCnpj: string;
  clienteTipoPessoa?: TipoPessoa;
  clienteEndereco?: string;
  clienteCidade?: string;
  clienteEstado?: string;
  clienteCep?: string;
  clienteTelefone?: string;
  clienteEmail?: string;
}

// ============================================
// TIPOS PARA CRIAÇÃO/EDIÇÃO (DTOs de entrada)
// ============================================

/** Dados para salvar orçamento COMPLETO */
export interface OrcamentoCompletoInput extends OrcamentoBase {
  tipo: 'completo';
  servicoId?: string;
  servicoDescricao?: string;
  itensCompleto: OrcamentoItemCompleto[];
  limitacoesSelecionadas?: string[];
  prazoExecucaoServicos?: number;
  prazoVistoriaBombeiros?: number | null;
  condicaoPagamento?: 'a_vista' | 'a_combinar' | 'parcelado';
  parcelamentoTexto?: string;
  parcelamentoDados?: ParcelamentoDados;
  mostrarValoresDetalhados?: boolean;
}

/** União discriminada para dados de salvamento */
export type OrcamentoSaveInput = OrcamentoCompletoInput;

// ============================================
// TIPOS PARA LEITURA (DTOs de saída)
// ============================================

/** Orçamento completo (leitura) */
export interface OrcamentoCompleto extends OrcamentoBase, OrcamentoClienteInfo {
  id: string;
  numero: number;
  versao: number;
  tipo: 'completo';
  status: OrcamentoStatus;
  dataEmissao: Date | string;
  dataValidade: Date | string;
  dataAceite?: Date | string;
  servicoId?: string;
  servicoDescricao?: string;
  itensCompleto: OrcamentoItemCompleto[];
  limitacoesSelecionadas?: string[];
  prazoExecucaoServicos?: number;
  prazoVistoriaBombeiros?: number | null;
  condicaoPagamento?: 'a_vista' | 'a_combinar' | 'parcelado';
  parcelamentoTexto?: string;
  parcelamentoDados?: ParcelamentoDados;
  mostrarValoresDetalhados?: boolean;
  valorTotal: number;
  valorTotalMaoDeObra?: number;
  valorTotalMaterial?: number;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

/** União discriminada para leitura */
export type OrcamentoUnion = OrcamentoCompleto;

// ============================================
// TYPE GUARDS
// ============================================

/** Verifica se é um orçamento completo */
export const isOrcamentoCompleto = (orc: OrcamentoUnion): orc is OrcamentoCompleto => {
  return orc.tipo === 'completo';
};

/** Verifica se é input de orçamento completo */
export const isOrcamentoCompletoInput = (input: OrcamentoSaveInput): input is OrcamentoCompletoInput => {
  return input.tipo === 'completo';
};

// ============================================
// TIPOS PARA FILTROS E LISTAGEM
// ============================================

/** Filtros para listagem de orçamentos */
export interface OrcamentoFilters {
  status?: OrcamentoStatus;
  tipo?: OrcamentoTipo;
  clienteId?: string;
  dataInicio?: Date | string;
  dataFim?: Date | string;
  search?: string;
}

/** Item resumido para listagem (evita carregar dados desnecessários) */
export interface OrcamentoListItem {
  id: string;
  numero: number;
  versao: number;
  tipo: OrcamentoTipo;
  clienteId: string;
  clienteNome: string;
  status: OrcamentoStatus;
  valorTotal: number;
  dataEmissao: Date | string;
  dataValidade: Date | string;
}
