import api from './api';
import { Limitacao } from '../types';

export const limitacaoService = {
  async listar(): Promise<Limitacao[]> {
    const response = await api.get('/limitacoes');
    return response.data;
  },

  async listarAtivas(): Promise<Limitacao[]> {
    const response = await api.get('/limitacoes/ativas');
    return response.data;
  },

  async buscarPorId(id: string): Promise<Limitacao> {
    const response = await api.get(`/limitacoes/${id}`);
    return response.data;
  },

  async criar(data: { texto: string; ativo?: boolean }): Promise<Limitacao> {
    const response = await api.post('/limitacoes', data);
    return response.data;
  },

  async atualizar(
    id: string,
    data: { texto?: string; ativo?: boolean; ordem?: number }
  ): Promise<Limitacao> {
    const response = await api.put(`/limitacoes/${id}`, data);
    return response.data;
  },

  async toggleAtivo(id: string): Promise<Limitacao> {
    const response = await api.patch(`/limitacoes/${id}/toggle`);
    return response.data;
  },

  async excluir(id: string): Promise<void> {
    await api.delete(`/limitacoes/${id}`);
  },
};
