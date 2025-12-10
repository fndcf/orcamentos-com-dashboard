import api from './api';
import { Orcamento, OrcamentoItem, OrcamentoItemCompleto, OrcamentoStatus, OrcamentoTipo, ParcelamentoDados } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface CriarOrcamentoDTO {
  tipo: OrcamentoTipo;
  clienteId: string;
  // Campos para orçamento simples
  itens?: OrcamentoItem[];
  // Campos para orçamento completo
  servicoId?: string;
  servicoDescricao?: string;
  itensCompleto?: OrcamentoItemCompleto[];
  limitacoesSelecionadas?: string[];
  prazoExecucaoServicos?: number;
  prazoVistoriaBombeiros?: number;
  condicaoPagamento?: 'a_combinar' | 'parcelado';
  parcelamentoTexto?: string;
  parcelamentoDados?: ParcelamentoDados;
  // Campos comuns
  observacoes?: string;
  diasValidade?: number;
  consultor?: string;
  contato?: string;
}

interface AtualizarOrcamentoDTO {
  // Campos para orçamento simples
  itens?: OrcamentoItem[];
  // Campos para orçamento completo
  servicoId?: string;
  servicoDescricao?: string;
  itensCompleto?: OrcamentoItemCompleto[];
  limitacoesSelecionadas?: string[];
  prazoExecucaoServicos?: number;
  prazoVistoriaBombeiros?: number;
  condicaoPagamento?: 'a_combinar' | 'parcelado';
  parcelamentoTexto?: string;
  parcelamentoDados?: ParcelamentoDados;
  // Campos comuns
  observacoes?: string;
  dataValidade?: Date;
}

interface EstatisticasOrcamento {
  total: number;
  abertos: number;
  aceitos: number;
  recusados: number;
  expirados: number;
  valorTotalAceitos: number;
}

export const orcamentoService = {
  async listar(): Promise<Orcamento[]> {
    const response = await api.get<ApiResponse<Orcamento[]>>('/orcamentos');
    return response.data.data;
  },

  async buscarPorId(id: string): Promise<Orcamento> {
    const response = await api.get<ApiResponse<Orcamento>>(`/orcamentos/${id}`);
    return response.data.data;
  },

  async buscarPorCliente(clienteId: string): Promise<Orcamento[]> {
    const response = await api.get<ApiResponse<Orcamento[]>>(`/orcamentos/cliente/${clienteId}`);
    return response.data.data;
  },

  async buscarPorStatus(status: OrcamentoStatus): Promise<Orcamento[]> {
    const response = await api.get<ApiResponse<Orcamento[]>>(`/orcamentos/status/${status}`);
    return response.data.data;
  },

  async criar(data: CriarOrcamentoDTO): Promise<Orcamento> {
    const response = await api.post<ApiResponse<Orcamento>>('/orcamentos', data);
    return response.data.data;
  },

  async atualizar(id: string, data: AtualizarOrcamentoDTO): Promise<Orcamento> {
    const response = await api.put<ApiResponse<Orcamento>>(`/orcamentos/${id}`, data);
    return response.data.data;
  },

  async atualizarStatus(id: string, status: OrcamentoStatus): Promise<Orcamento> {
    const response = await api.patch<ApiResponse<Orcamento>>(`/orcamentos/${id}/status`, { status });
    return response.data.data;
  },

  async excluir(id: string): Promise<void> {
    await api.delete(`/orcamentos/${id}`);
  },

  async duplicar(id: string): Promise<Orcamento> {
    const response = await api.post<ApiResponse<Orcamento>>(`/orcamentos/${id}/duplicar`);
    return response.data.data;
  },

  async getEstatisticas(): Promise<EstatisticasOrcamento> {
    const response = await api.get<ApiResponse<EstatisticasOrcamento>>('/orcamentos/estatisticas');
    return response.data.data;
  },

  async verificarExpirados(): Promise<number> {
    const response = await api.post<ApiResponse<{ expirados: number }>>('/orcamentos/verificar-expirados');
    return response.data.data.expirados;
  },
};
