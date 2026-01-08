import api from './api';
import { Cliente, BrasilAPICNPJ, PaginatedResponse } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const clienteService = {
  async listar(): Promise<Cliente[]> {
    const response = await api.get<ApiResponse<Cliente[]>>('/clientes');
    return response.data.data;
  },

  async listarPaginado(
    page: number = 1,
    limit: number = 10,
    filters?: {
      busca?: string;
    }
  ): Promise<PaginatedResponse<Cliente>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Cliente>>>('/clientes/paginated', {
      params: {
        page,
        limit,
        ...filters,
      },
    });
    return response.data.data;
  },

  async buscarPorId(id: string): Promise<Cliente> {
    const response = await api.get<ApiResponse<Cliente>>(`/clientes/${id}`);
    return response.data.data;
  },

  async buscarPorDocumento(documento: string): Promise<Cliente | null> {
    const response = await api.get<ApiResponse<Cliente | null>>(`/clientes/documento/${documento}`);
    return response.data.data;
  },

  async pesquisar(termo: string): Promise<Cliente[]> {
    const response = await api.get<ApiResponse<Cliente[]>>('/clientes/pesquisar', {
      params: { termo },
    });
    return response.data.data;
  },

  async criar(data: Omit<Cliente, 'id' | 'createdAt'>): Promise<Cliente> {
    const response = await api.post<ApiResponse<Cliente>>('/clientes', data);
    return response.data.data;
  },

  async atualizar(id: string, data: Partial<Cliente>): Promise<Cliente> {
    const response = await api.put<ApiResponse<Cliente>>(`/clientes/${id}`, data);
    return response.data.data;
  },

  async excluir(id: string): Promise<void> {
    await api.delete(`/clientes/${id}`);
  },

  // Busca dados do CNPJ na BrasilAPI
  async buscarCnpjBrasilAPI(cnpj: string): Promise<BrasilAPICNPJ | null> {
    try {
      const cnpjLimpo = cnpj.replace(/\D/g, '');
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch {
      return null;
    }
  },
};
