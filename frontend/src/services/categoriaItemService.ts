import api from './api';
import { CategoriaItem } from '../types';

export const categoriaItemService = {
  async listar(): Promise<CategoriaItem[]> {
    const response = await api.get('/categorias-item');
    return response.data;
  },

  async listarAtivas(): Promise<CategoriaItem[]> {
    const response = await api.get('/categorias-item/ativas');
    return response.data;
  },

  async buscarPorId(id: string): Promise<CategoriaItem> {
    const response = await api.get(`/categorias-item/${id}`);
    return response.data;
  },

  async criar(data: { nome: string; ativo?: boolean }): Promise<CategoriaItem> {
    const response = await api.post('/categorias-item', data);
    return response.data;
  },

  async atualizar(
    id: string,
    data: { nome?: string; ativo?: boolean; ordem?: number }
  ): Promise<CategoriaItem> {
    const response = await api.put(`/categorias-item/${id}`, data);
    return response.data;
  },

  async toggleAtivo(id: string): Promise<CategoriaItem> {
    const response = await api.patch(`/categorias-item/${id}/toggle`);
    return response.data;
  },

  async excluir(id: string): Promise<void> {
    await api.delete(`/categorias-item/${id}`);
  },
};
