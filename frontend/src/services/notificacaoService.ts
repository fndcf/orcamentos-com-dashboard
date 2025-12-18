import api from './api';
import { Notificacao, PaginatedResponse } from '../types';

export interface NotificacaoResumo {
  total: number;
  naoLidas: number;
  vencidas: number;
  proximasVencer: number;
  ativas: number;
}

export const notificacaoService = {
  async obterResumo(): Promise<NotificacaoResumo> {
    const response = await api.get('/notificacoes/resumo');
    return response.data;
  },

  async buscarPorId(id: string): Promise<Notificacao> {
    const response = await api.get(`/notificacoes/${id}`);
    return response.data;
  },

  async marcarComoLida(id: string): Promise<Notificacao> {
    const response = await api.patch(`/notificacoes/${id}/lida`);
    return response.data;
  },

  async marcarTodasComoLidas(): Promise<{ atualizadas: number }> {
    const response = await api.patch('/notificacoes/marcar-todas-lidas');
    return response.data;
  },

  async excluir(id: string): Promise<void> {
    await api.delete(`/notificacoes/${id}`);
  },

  async gerarParaOrcamento(orcamentoId: string): Promise<Notificacao[]> {
    const response = await api.post(`/notificacoes/gerar/${orcamentoId}`);
    return response.data;
  },

  async processarTodos(): Promise<{ processados: number; notificacoesCriadas: number }> {
    const response = await api.post('/notificacoes/processar-todos');
    return response.data;
  },

  // ========== MÉTODOS PAGINADOS ==========

  async listarPaginado(pageSize: number = 10, cursor?: string): Promise<PaginatedResponse<Notificacao>> {
    const params = new URLSearchParams();
    params.append('pageSize', pageSize.toString());
    if (cursor) params.append('cursor', cursor);
    const response = await api.get(`/notificacoes/paginado?${params.toString()}`);
    return response.data;
  },

  async listarNaoLidasPaginado(pageSize: number = 10, cursor?: string): Promise<PaginatedResponse<Notificacao>> {
    const params = new URLSearchParams();
    params.append('pageSize', pageSize.toString());
    if (cursor) params.append('cursor', cursor);
    const response = await api.get(`/notificacoes/nao-lidas/paginado?${params.toString()}`);
    return response.data;
  },

  async listarVencidasPaginado(pageSize: number = 10, cursor?: string): Promise<PaginatedResponse<Notificacao>> {
    const params = new URLSearchParams();
    params.append('pageSize', pageSize.toString());
    if (cursor) params.append('cursor', cursor);
    const response = await api.get(`/notificacoes/vencidas/paginado?${params.toString()}`);
    return response.data;
  },

  async listarAtivasPaginado(dias: number = 60, pageSize: number = 10, cursor?: string): Promise<PaginatedResponse<Notificacao>> {
    const params = new URLSearchParams();
    params.append('dias', dias.toString());
    params.append('pageSize', pageSize.toString());
    if (cursor) params.append('cursor', cursor);
    const response = await api.get(`/notificacoes/ativas/paginado?${params.toString()}`);
    return response.data;
  },

  async listarProximasPaginado(dias: number = 30, pageSize: number = 10, cursor?: string): Promise<PaginatedResponse<Notificacao>> {
    const params = new URLSearchParams();
    params.append('dias', dias.toString());
    params.append('pageSize', pageSize.toString());
    if (cursor) params.append('cursor', cursor);
    const response = await api.get(`/notificacoes/proximas/paginado?${params.toString()}`);
    return response.data;
  },
};
