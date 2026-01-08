import api from './api';
import { Orcamento, OrcamentoItemCompleto, OrcamentoStatus, OrcamentoTipo, ParcelamentoDados, DescontoAVistaDados, DashboardStats, PaginatedResponse } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface CriarOrcamentoDTO {
  tipo: OrcamentoTipo;
  clienteId: string;
  // Campos para orçamento completo
  servicoId?: string;
  servicoDescricao?: string;
  itensCompleto?: OrcamentoItemCompleto[];
  limitacoesSelecionadas?: string[];
  prazoExecucaoServicos?: number;
  prazoVistoriaBombeiros?: number | null;
  condicaoPagamento?: 'a_vista' | 'a_combinar' | 'parcelado';
  parcelamentoTexto?: string;
  parcelamentoDados?: ParcelamentoDados;
  descontoAVista?: DescontoAVistaDados | null;
  mostrarValoresDetalhados?: boolean;
  // Campos comuns
  observacoes?: string;
  diasValidade?: number;
  consultor?: string;
  contato?: string;
  email?: string;
  telefone?: string;
  enderecoServico?: string;
}

interface AtualizarOrcamentoDTO {
  // Campos para orçamento completo
  servicoId?: string;
  servicoDescricao?: string;
  itensCompleto?: OrcamentoItemCompleto[];
  limitacoesSelecionadas?: string[];
  prazoExecucaoServicos?: number;
  prazoVistoriaBombeiros?: number | null;
  condicaoPagamento?: 'a_vista' | 'a_combinar' | 'parcelado';
  parcelamentoTexto?: string;
  parcelamentoDados?: ParcelamentoDados;
  descontoAVista?: DescontoAVistaDados | null;
  mostrarValoresDetalhados?: boolean;
  // Campos comuns
  observacoes?: string;
  dataValidade?: Date;
  consultor?: string;
  contato?: string;
  email?: string;
  telefone?: string;
  enderecoServico?: string;
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

  async listarPaginado(
    page: number = 1,
    limit: number = 10,
    filters?: {
      status?: OrcamentoStatus;
      clienteId?: string;
      busca?: string;
    }
  ): Promise<PaginatedResponse<Orcamento>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Orcamento>>>('/orcamentos/paginated', {
      params: {
        page,
        limit,
        ...filters,
      },
    });
    return response.data.data;
  },

  async buscarPorCliente(clienteId: string): Promise<Orcamento[]> {
    const response = await api.get<ApiResponse<Orcamento[]>>(`/orcamentos/cliente/${clienteId}`);
    return response.data.data;
  },

  async getHistoricoCliente(clienteId: string, limit: number = 5): Promise<{
    orcamentos: Orcamento[];
    resumo: {
      total: number;
      aceitos: number;
      valorTotalAceitos: number;
    };
  }> {
    const response = await api.get<ApiResponse<{
      orcamentos: Orcamento[];
      resumo: {
        total: number;
        aceitos: number;
        valorTotalAceitos: number;
      };
    }>>(`/orcamentos/cliente/${clienteId}/historico`, {
      params: { limit },
    });
    return response.data.data;
  },

  async buscarPorStatus(status: OrcamentoStatus): Promise<Orcamento[]> {
    const response = await api.get<ApiResponse<Orcamento[]>>(`/orcamentos/status/${status}`);
    return response.data.data;
  },

  async buscarPorPeriodo(dataInicio: string, dataFim: string): Promise<Orcamento[]> {
    const response = await api.get<ApiResponse<Orcamento[]>>('/orcamentos/periodo', {
      params: { dataInicio, dataFim }
    });
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

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<ApiResponse<DashboardStats>>('/orcamentos/dashboard-stats');
    return response.data.data;
  },
};
