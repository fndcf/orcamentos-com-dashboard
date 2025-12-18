/**
 * Tipos discriminados para Orçamentos
 * Segue ISP - Interface Segregation Principle
 * Cada tipo tem apenas os campos necessários para seu contexto
 */

import { OrcamentoItem, OrcamentoItemCompleto, OrcamentoStatus, OrcamentoTipo, TipoPessoa } from './index';

// ============================================
// TIPOS BASE COMPARTILHADOS
// ============================================

/** Campos obrigatórios para qualquer orçamento */
export interface OrcamentoBase {
  clienteId: string;
  observacoes?: string;
  consultor?: string;
  contato?: string;
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

/** Dados para salvar orçamento SIMPLES */
export interface OrcamentoSimplesInput extends OrcamentoBase {
  tipo: 'simples';
  itens: OrcamentoItem[];
}

/** Dados para salvar orçamento COMPLETO */
export interface OrcamentoCompletoInput extends OrcamentoBase {
  tipo: 'completo';
  servicoId: string;
  servicoDescricao: string;
  itensCompleto: OrcamentoItemCompleto[];
  limitacoesSelecionadas?: string[];
  prazoExecucaoServicos?: number;
  prazoVistoriaBombeiros?: number;
  condicaoPagamento?: 'a_vista' | 'a_combinar' | 'parcelado';
  parcelamentoTexto?: string;
}

/** União discriminada para dados de salvamento */
export type OrcamentoSaveInput = OrcamentoSimplesInput | OrcamentoCompletoInput;

// ============================================
// TIPOS PARA LEITURA (DTOs de saída)
// ============================================

/** Orçamento simples completo (leitura) */
export interface OrcamentoSimples extends OrcamentoBase, OrcamentoClienteInfo {
  id: string;
  numero: number;
  versao: number;
  tipo: 'simples';
  status: OrcamentoStatus;
  dataEmissao: Date | string;
  dataValidade: Date | string;
  dataAceite?: Date | string;
  itens: OrcamentoItem[];
  valorTotal: number;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

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
  servicoId: string;
  servicoDescricao: string;
  itensCompleto: OrcamentoItemCompleto[];
  limitacoesSelecionadas?: string[];
  prazoExecucaoServicos?: number;
  prazoVistoriaBombeiros?: number;
  condicaoPagamento?: 'a_vista' | 'a_combinar' | 'parcelado';
  parcelamentoTexto?: string;
  valorTotal: number;
  valorTotalMaoDeObra?: number;
  valorTotalMaterial?: number;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

/** União discriminada para leitura */
export type OrcamentoUnion = OrcamentoSimples | OrcamentoCompleto;

// ============================================
// TYPE GUARDS
// ============================================

/** Verifica se é um orçamento simples */
export const isOrcamentoSimples = (orc: OrcamentoUnion): orc is OrcamentoSimples => {
  return orc.tipo === 'simples';
};

/** Verifica se é um orçamento completo */
export const isOrcamentoCompleto = (orc: OrcamentoUnion): orc is OrcamentoCompleto => {
  return orc.tipo === 'completo';
};

/** Verifica se é input de orçamento simples */
export const isOrcamentoSimplesInput = (input: OrcamentoSaveInput): input is OrcamentoSimplesInput => {
  return input.tipo === 'simples';
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
