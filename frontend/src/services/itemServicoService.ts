import api from './api';
import { ItemServico } from '../types';

export const itemServicoService = {
  async listar(): Promise<ItemServico[]> {
    const response = await api.get('/itens-servico');
    return response.data;
  },

  async listarPorCategoria(categoriaId: string): Promise<ItemServico[]> {
    const response = await api.get(`/itens-servico/categoria/${categoriaId}`);
    return response.data;
  },

  async listarAtivosPorCategoria(categoriaId: string): Promise<ItemServico[]> {
    const response = await api.get(`/itens-servico/categoria/${categoriaId}/ativos`);
    return response.data;
  },

  async buscarPorId(id: string): Promise<ItemServico> {
    const response = await api.get(`/itens-servico/${id}`);
    return response.data;
  },

  async criar(data: { categoriaId: string; descricao: string; unidade: string; ativo?: boolean }): Promise<ItemServico> {
    const response = await api.post('/itens-servico', data);
    return response.data;
  },

  async atualizar(
    id: string,
    data: { descricao?: string; unidade?: string; ativo?: boolean; ordem?: number }
  ): Promise<ItemServico> {
    const response = await api.put(`/itens-servico/${id}`, data);
    return response.data;
  },

  async toggleAtivo(id: string): Promise<ItemServico> {
    const response = await api.patch(`/itens-servico/${id}/toggle`);
    return response.data;
  },

  async excluir(id: string): Promise<void> {
    await api.delete(`/itens-servico/${id}`);
  },
};
