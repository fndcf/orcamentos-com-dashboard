import api from './api';
import { Notificacao } from '../types';

export interface NotificacaoResumo {
  total: number;
  naoLidas: number;
  vencidas: number;
  proximasVencer: number;
  ativas: number;
}

export const notificacaoService = {
  async listar(): Promise<Notificacao[]> {
    const response = await api.get('/notificacoes');
    return response.data;
  },

  async listarNaoLidas(): Promise<Notificacao[]> {
    const response = await api.get('/notificacoes/nao-lidas');
    return response.data;
  },

  async listarProximas(dias: number = 30): Promise<Notificacao[]> {
    const response = await api.get(`/notificacoes/proximas?dias=${dias}`);
    return response.data;
  },

  async listarVencidas(): Promise<Notificacao[]> {
    const response = await api.get('/notificacoes/vencidas');
    return response.data;
  },

  async listarAtivas(dias: number = 60): Promise<Notificacao[]> {
    const response = await api.get(`/notificacoes/ativas?dias=${dias}`);
    return response.data;
  },

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
};
