import api from './api';
import { Servico } from '../types';

export const servicoService = {
  async listar(): Promise<Servico[]> {
    const response = await api.get('/servicos');
    return response.data;
  },

  async listarAtivos(): Promise<Servico[]> {
    const response = await api.get('/servicos/ativos');
    return response.data;
  },

  async buscarPorId(id: string): Promise<Servico> {
    const response = await api.get(`/servicos/${id}`);
    return response.data;
  },

  async criar(data: { descricao: string; ativo?: boolean }): Promise<Servico> {
    const response = await api.post('/servicos', data);
    return response.data;
  },

  async atualizar(
    id: string,
    data: { descricao?: string; ativo?: boolean; ordem?: number }
  ): Promise<Servico> {
    const response = await api.put(`/servicos/${id}`, data);
    return response.data;
  },

  async toggleAtivo(id: string): Promise<Servico> {
    const response = await api.patch(`/servicos/${id}/toggle`);
    return response.data;
  },

  async excluir(id: string): Promise<void> {
    await api.delete(`/servicos/${id}`);
  },
};
