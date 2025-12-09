import api from './api';
import { PalavraChave } from '../types';

export const palavraChaveService = {
  async listar(): Promise<PalavraChave[]> {
    const response = await api.get('/palavras-chave');
    return response.data;
  },

  async listarAtivas(): Promise<PalavraChave[]> {
    const response = await api.get('/palavras-chave/ativas');
    return response.data;
  },

  async buscarPorId(id: string): Promise<PalavraChave> {
    const response = await api.get(`/palavras-chave/${id}`);
    return response.data;
  },

  async criar(data: { palavra: string; prazoDias: number; ativo?: boolean }): Promise<PalavraChave> {
    const response = await api.post('/palavras-chave', data);
    return response.data;
  },

  async atualizar(
    id: string,
    data: { palavra?: string; prazoDias?: number; ativo?: boolean }
  ): Promise<PalavraChave> {
    const response = await api.put(`/palavras-chave/${id}`, data);
    return response.data;
  },

  async toggleAtivo(id: string): Promise<PalavraChave> {
    const response = await api.patch(`/palavras-chave/${id}/toggle`);
    return response.data;
  },

  async excluir(id: string): Promise<void> {
    await api.delete(`/palavras-chave/${id}`);
  },
};
